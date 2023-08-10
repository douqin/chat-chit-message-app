import { PositionInGrop } from './enum/group.position.enum';
import { ServiceDrive } from './../../component/cloud/drive.service';
import { MySql } from "@/config/sql/mysql";
import { GroupRepositoryBehavior } from "./interface/group.repository.interface";
import MyException from "@/utils/exceptions/my.exception";
import { iDrive } from '../../component/cloud/drive.interface';
import { ResultSetHeader } from 'mysql2';
import { HttpStatus } from '@/utils/extension/httpstatus.exception';
import { MemberStatus } from './enum/member.status.enum';
import { GroupStatus } from './enum/group.status.dto.enum';
import { GroupType } from './enum/group.type.enum';

export default class GroupRepository implements GroupRepositoryBehavior {
    public drive: iDrive
    constructor() {
        this.drive = ServiceDrive.gI();
    }
    blockMember(iduserAdd: number, idgroup: number): boolean | PromiseLike<boolean> {
        throw new Error('Method not implemented.');
    }
    async changeStatusMember(iduserAdd: number, idgroup: number, status: MemberStatus): Promise<boolean> {
        const query = `UPDATE member
        SET status = ?
        WHERE member.idgroup = ? AND member.iduser = ?;`
        await MySql.excuteQuery(query, [status, idgroup, iduserAdd])
        return true
    }
    async removeMember(idgroup: number, iduserRemove: number): Promise<boolean> {
        const query = 'DELETE FROM member WHERE member.iduser == ? AND member.idgroup = ?'
        await MySql.excuteQuery(query, [iduserRemove, idgroup])
        return true
    }
    async removeManager(idgroup: number, iduserAdd: any): Promise<boolean> {
        const query = `UPDATE member
        SET position = ?
        WHERE member.idgroup = ? AND member.iduser = ?;`
        await MySql.excuteQuery(query, [PositionInGrop.MEMBER, idgroup, iduserAdd])
        return true
    }
    async addManager(idgroup: number, iduserAdd: number): Promise<boolean> {
        const query = `UPDATE member
        SET position = ?
        WHERE member.idgroup = ? AND member.iduser = ?;`
        await MySql.excuteQuery(query, [PositionInGrop.ADMIN, idgroup, iduserAdd])
        return true
    }
    async renameGroup(idgroup: number, name: string): Promise<boolean> {
        const query = `UPDATE groupchat
        SET name = ?
        WHERE groupchat.idgroup = ?;`
        await MySql.excuteQuery(query, [name, idgroup])
        return true
    }
    async checkMemberPermisstion(permisstion: string, iduser: Number, idgroup: Number) {
        try {
            let query = 'SELECT ' + permisstion + ' FROM groupchat_member_permission WHERE groupchat_member_permission.idgroup = ? LIMIT 1'
            const [_permisstion] = await MySql.excuteQuery(query, [idgroup]) as any
            console.log("🚀 ~ file: group.repository.ts:22 ~ GroupRepository ~ checkMemberPermisstion ~ _permisstion:", _permisstion)
            let a = Boolean(Number(_permisstion[0].autoapproval))
            console.log("🚀 ~ file: group.repository.ts:23 ~ GroupRepository ~ checkMemberPermisstion ~ a:", a)
            return a
        }
        catch (e: any) {
            console.log("🚀 ~ file: group.repository.ts:28 ~ GroupRepository ~ checkMemberPermisstion ~ e:", e)
            throw new MyException("Không thể tham gia group này").withExceptionCode(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    async addUserToApprovalQueue(iduser: number, idgroup: number): Promise<void> {
        try {
            let query = "INSERT INTO member(member.idgroup, member.iduser, member.position, member.status) VALUES (?, ?, ?, ?) "
            let [data] = await MySql.excuteQuery(query, [idgroup, iduser, PositionInGrop.MEMBER, MemberStatus.PENDING])
        }
        catch (e: any) {
            throw new MyException("Không thể tham gia group này").withExceptionCode(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    async joinGroup(iduser: number, idgroup: number, positionUser: number = PositionInGrop.MEMBER): Promise<boolean> {
        try {
            let query = "INSERT INTO member(member.idgroup, member.iduser, member.position) VALUES (?, ?, ?) "
            let [data] = await MySql.excuteQuery(query, [idgroup, iduser, positionUser])
            return true
        }
        catch (e: any) {
            throw new MyException("Không thể tham gia group này")
        }
    }
    async isContainInGroup(iduser: number, idgroup: number, status_check?: MemberStatus): Promise<boolean> {
        let [data] = await MySql.excuteQuery(`SELECT COUNT(*) FROM member WHERE member.iduser = ? AND member.idgroup = ? ${((status_check) ? 'AND member.status = ?' : '')}`, [iduser, idgroup, status_check]);
        const [{ 'COUNT(*)': count }] = data as any;
        return Boolean(Number(count) === 1)
    }
    async changeAvatarGroup(iduser: number, idgroup: number, file: Express.Multer.File) { //FIXME
        let position = await this.getPosition(idgroup, iduser)
        if (position == PositionInGrop.CREATOR) {
            const query = 'SELECT groupchat.avatar FROM groupchat WHERE groupchat.idgroup = ? '
            const [[{ 'avatar': avatar }], column] = MySql.excuteQuery(query, [idgroup]) as any;
            if (avatar) {
                await this.drive.delete(avatar)
            }
            return this.drive.uploadFile(file.filename, file.buffer);
        } else throw new MyException("Bạn không có quyền này").withExceptionCode(HttpStatus.FORBIDDEN)
    }
    async getAllMember(idgroup: number): Promise<object[]> {
        let query = "SELECT user.* from (user JOIN member ON user.iduser = member.iduser) WHERE member.idgroup = ? AND member.status = ?"
        let [rows] = await MySql.excuteQuery(query, [idgroup, MemberStatus.DEFAULT])
        console.log(rows)
        return rows as object[];
    }
    async leaveGroup(iduser: any, idgroup: number): Promise<boolean> {
        let position = await this.getPosition(idgroup, iduser)
        if (position != PositionInGrop.CREATOR)
            await MySql.excuteQuery(
                `DELETE FROM member WHERE member.iduser = ${iduser} AND member.idgroup = ${idgroup}`
            );
        else throw new MyException("Admin tạo ra group không thể rời group")
        return true
    }
    async getOneGroup(idgroup: number): Promise<object | null> {
        let query = `SELECT * FROM groupchat WHERE groupchat.idgroup = ?;`
        let [dataRaw, col]: any = await MySql.excuteQuery(
            query, [
            idgroup
        ]
        )
        return dataRaw[0]
    }
    async getAllGroup(iduser: number): Promise<object[]> {
        let query = `SELECT * FROM ((user INNER JOIN member ON user.iduser = member.iduser) JOIN groupchat ON member.idgroup = groupchat.idgroup) WHERE user.iduser = ?;`
        let [dataRaw, inforColimn]: any = await MySql.excuteQuery(
            query, [iduser]
        )
        if (dataRaw) {
            return dataRaw;
        }
        return [];
    }
    async createGroup(name: string, iduser: number, typeGroup: number = GroupType.COMMUNITY): Promise<boolean> {
        let idgroup = -1;
        try {
            let query = `INSERT INTO groupchat( groupchat.name, groupchat.type, groupchat.status, groupchat.createat) VALUES (?,?,?,now());`
            let data: [ResultSetHeader, any] = await MySql.excuteQuery(
                query, [name, typeGroup, GroupStatus.DEFAULT]
            ) as any
            console.log("🚀 ~ file: group.repository.ts:117 ~ GroupRepository ~ createGroup ~ data:", data)
            idgroup = data[0].insertId
            console.log("🚀 ~ file: group.repository.ts:119 ~ GroupRepository ~ createGroup ~ data:", data)
            await this.joinGroup(iduser, idgroup, PositionInGrop.CREATOR)
        }
        catch (e) {
            throw new MyException("Có lỗi xảy ra, không thể tạo nhóm").withExceptionCode(HttpStatus.INTERNAL_SERVER_ERROR)
        }
        return true;
    }
    async getLastViewMember(idgroup: number): Promise<object[] | undefined> {
        let rawDataSQL: any = await MySql.excuteQuery(
            `SELECT user.iduser, user.name, user.avatar, member.lastview FROM (( groupchat JOIN member ON groupchat.idgroup = member.idgroup AND groupchat.idgroup = ${idgroup}) JOIN user ON user.iduser = member.iduser)
            `
        )
        if (rawDataSQL) {
            return rawDataSQL[0]
        }
        return undefined;
    }
    async getPosition(idgroup: Number, iduser: Number) {
        let [[{ 'position': position }], column] = await MySql.excuteQuery(`SELECT member.position From member where member.idgroup = ? AND member.iduser = ?`, [idgroup, iduser]) as any;
        return position;
    }
}