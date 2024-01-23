import { PositionInGrop } from './enum/group.position.enum';
import { CloudDrive } from '../../services/cloud/drive.service';

import { GroupRepositoryBehavior } from "./interface/group.repository.interface";
import MyException from "@/utils/exceptions/my.exception";
import { iDrive } from '../../services/cloud/drive.interface';
import { ResultSetHeader } from 'mysql2';
import { HttpStatus } from '@/utils/extension/httpstatus.exception';
import { MemberStatus } from './enum/member.status.enum';
import { GroupStatus } from './enum/group.status.dto.enum';
import { GroupType } from './enum/group.type.enum';
import { Constant } from './constant/group.constant';
import { inject, injectable } from 'tsyringe';
import Group from '@/models/group.model';
import { GroupAccess } from './enum/group.access';
import { Database, iDatabase } from '@/lib/database';

@injectable()
export default class GroupRepository implements GroupRepositoryBehavior {

    constructor(@inject(CloudDrive) private drive: iDrive, @inject(Database) private db: iDatabase) {
    }
    async getAccessGroup(idgroup: number): Promise<GroupAccess> {
        const sql = 'SELECT groupchat.access FROM groupchat WHERE groupchat.idgroup = ?'
        const [data] = await this.db.excuteQuery(sql, [idgroup]) as any;
        return data[0].access as GroupAccess
    }
    async getBaseInformationGroupFromLink(link: string): Promise<Group | null> {
        let sql = `SELECT * FROM groupchat WHERE groupchat.link = ?`
        let [data] = await this.db.excuteQuery(sql, [link]) as any;
        if (data.length == 0) return null
        else if(data[0].type == GroupType.INVIDIAL) return null
        else if(data[0].access == GroupAccess.PRIVATE) return null
        return data[0]
    }
    async deleteGroup(idgroup: number): Promise<boolean> {
        const query = 'DELETE FROM groupchat WHERE groupchat.idgroup = ?'
        await this.db.excuteQuery(query, [idgroup])
        return true
    }
    async getTypeGroup(idgroup: number): Promise<GroupStatus> {
        let sql = `SELECT groupchat.type FROM groupchat WHERE groupchat.idgroup = ?`
        const [data] = await this.db.excuteQuery(sql, [idgroup]) as any;
        return data[0].type as GroupStatus  
    }
    async changeNickname(iduser: number, userIdChange: number, idgroup: number, nickname: string): Promise<boolean> {
        let sql = `UPDATE member SET member.nickname = ? WHERE member.iduser = ? AND member.idgroup = ?`
        await this.db.excuteQuery(sql, [nickname, userIdChange, idgroup])
        return true
    }
    async isExistInvidualGroup(iduser: number, idUserAddressee: number): Promise<boolean> {
        let get = `SELECT * FROM groupchat as g JOIN member as m1 ON g.idgroup = m1.idgroup 
        JOIN member as m2 ON g.idgroup = m2.idgroup
        WHERE m1.id <> m2.id AND m1.iduser = ? AND m2.iduser = ? AND g.type = ?`
        let [data] = await this.db.excuteQuery(get, [iduser, idUserAddressee, GroupType.INVIDIAL]) as any
        return Boolean(data.length == 1);
    }
    async getInvidualGroup(iduser: number, idUserAddressee: number): Promise<number> {
        let get = `SELECT * FROM groupchat as g JOIN member as m1 ON g.idgroup = m1.idgroup 
        JOIN member as m2 ON g.idgroup = m2.idgroup
        WHERE m1.id <> m2.id AND m1.iduser = ? AND m2.iduser = ? AND g.type = ?`
        let [data] = await this.db.excuteQuery(get, [iduser, idUserAddressee, GroupType.INVIDIAL]) as any
        return data[0].idgroup as number;
    }
    async createInvidualGroup(iduser: number, users: number, status: GroupStatus): Promise<number> {
        let idgroup = -1;
        try {
            let query = `INSERT INTO groupchat( groupchat.name, groupchat.type, groupchat.status, groupchat.createat) VALUES ( ?, ?, ?, now());`
            let data: [ResultSetHeader, any] = await this.db.excuteQuery(
                query, ["INVIDIAL", GroupType.INVIDIAL, status]
            ) as any
            idgroup = data[0].insertId
            await this.joinGroup(iduser, idgroup, PositionInGrop.MEMBER)
            await this.joinGroup(users, idgroup, PositionInGrop.MEMBER)
        }
        catch (e) {
            throw new MyException("Có lỗi xảy ra, không thể tạo nhóm").withExceptionCode(HttpStatus.INTERNAL_SERVER_ERROR)
        }
        return idgroup;
    }

    async getInformationMember(idmember: number, idgroup: number): Promise<any> {
        const query = 'SELECT * from (user JOIN member ON user.iduser = member.iduser) WHERE user.iduser = ? AND member.idgroup = ? AND member.status = ?'
        const [data, inforC] = await this.db.excuteQuery(query, [idmember, idgroup, MemberStatus.DEFAULT]) as any
        return data[0]
    }
    async getTotalMember(idgroup: number): Promise<number> {
        let query = `SELECT COUNT(*) FROM groupchat JOIN member ON member.idgroup = groupchat.idgroup WHERE groupchat.idgroup = ?` //FIXME: check member staus suck as ban,...
        let [data] = await this.db.excuteQuery(query, [idgroup]);
        const [{ 'COUNT(*)': count }] = data as any;
        return count
    }
    async blockMember(iduserAdd: number, idgroup: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    async changeStatusMember(iduserAdd: number, idgroup: number, status: MemberStatus): Promise<boolean> {
        const query = `UPDATE member
        SET status = ?
        WHERE member.idgroup = ? AND member.iduser = ?;`
        await this.db.excuteQuery(query, [status, idgroup, iduserAdd])
        return true
    }
    async removeMember(idgroup: number, iduserRemove: number): Promise<boolean> {
        const query = 'DELETE FROM member WHERE member.iduser = ? AND member.idgroup = ?'
        await this.db.excuteQuery(query, [iduserRemove, idgroup])
        return true
    }
    async removeManager(idgroup: number, iduserAdd: any): Promise<boolean> {
        const query = `UPDATE member
        SET position = ?
        WHERE member.idgroup = ? AND member.iduser = ?;`
        let dd = await this.db.excuteQuery(query, [PositionInGrop.MEMBER, idgroup, iduserAdd])
        return true
    }
    async addManager(idgroup: number, iduserAdd: number): Promise<boolean> {
        const query = `UPDATE member
        SET position = ?
        WHERE member.idgroup = ? AND member.iduser = ?;`
        await this.db.excuteQuery(query, [PositionInGrop.ADMIN, idgroup, iduserAdd])
        return true
    }
    async renameGroup(idgroup: number, name: string): Promise<boolean> {
        const query = `UPDATE groupchat
        SET name = ?
        WHERE groupchat.idgroup = ?;`
        await this.db.excuteQuery(query, [name, idgroup])
        return true
    }
    async checkMemberPermisstion(permisstion: string, iduser: Number, idgroup: Number) {
        try {
            let query = 'SELECT ' + permisstion + ' FROM groupchat_member_permission WHERE groupchat_member_permission.idgroup = ? LIMIT 1'
            const [_permisstion] = await this.db.excuteQuery(query, [idgroup]) as any
            let a = Boolean(Number(_permisstion[0].autoapproval))
            return a
        }
        catch (e: any) {
            console.log("🚀 ~ GroupRepository ~ checkMemberPermisstion ~ e:", e)
            throw new MyException("Unable to join this group").withExceptionCode(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    async addUserToApprovalQueue(iduser: number, idgroup: number): Promise<void> {
        try {
            let query = "INSERT INTO member(member.idgroup, member.iduser, member.position, member.status) VALUES (?, ?, ?, ?) "
            let [data] = await this.db.excuteQuery(query, [idgroup, iduser, PositionInGrop.CON_CAC, MemberStatus.PENDING])
        }
        catch (e: any) {
            console.log("🚀 ~ GroupRepository ~ addUserToApprovalQueue ~ e:", e)
            throw new MyException("Unable to join this group").withExceptionCode(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    async joinGroup(iduser: number, idgroup: number, positionUser: number = PositionInGrop.MEMBER): Promise<boolean> {
        try {
            let query = "INSERT INTO member(member.idgroup, member.iduser, member.position) VALUES (?, ?, ?) "
            let [data] = await this.db.excuteQuery(query, [idgroup, iduser, positionUser])
            return true
        }
        catch (e: any) {
            throw new MyException("Unable to join this group")
        }
    }
    async isContainInGroup(iduser: number, idgroup: number, status_check?: MemberStatus): Promise<boolean> {
        let sql = `SELECT COUNT(*) FROM member WHERE member.iduser = ? AND member.idgroup = ? ${((status_check) ? 'AND member.status = ?' : '')}`
        let [data] = await this.db.excuteQuery(sql, [iduser, idgroup, status_check]);
        const [{ 'COUNT(*)': count }] = data as any;
        let  a = Boolean(Number(count) === 1)
        return a
    }
    async changeAvatarGroup(iduser: number, idgroup: number, file: Express.Multer.File) {
        let position = await this.getPosition(idgroup, iduser)
        if (position == PositionInGrop.CREATOR || PositionInGrop.ADMIN) {
            const query = 'SELECT groupchat.avatar FROM groupchat WHERE groupchat.idgroup = ? '
            const [[{ 'avatar': avatar }], column] = await this.db.excuteQuery(query, [idgroup]) as any;
            if (avatar) {
                await this.drive.delete(avatar)
            }
            return this.drive.uploadFile(file.filename, file.buffer);
        } else throw new MyException("You don't have permisson for action").withExceptionCode(HttpStatus.FORBIDDEN)
    }
    async getAllMember(idgroup: number): Promise<object[]> {
        let query = "SELECT * from (user JOIN member ON user.iduser = member.iduser) WHERE member.idgroup = ? AND member.status = ?"
        let [rows] = await this.db.excuteQuery(query, [idgroup, MemberStatus.DEFAULT])
        console.log(rows)
        return rows as object[];
    }
    async getAllUserPending(idgroup: number): Promise<object[]> {
        let query = "SELECT * from (user JOIN member ON user.iduser = member.iduser) WHERE member.idgroup = ? AND member.status = ?"
        let [rows] = await this.db.excuteQuery(query, [idgroup, MemberStatus.PENDING])
        console.log(rows)
        return rows as object[];
    }
    async leaveGroup(iduser: any, idgroup: number): Promise<boolean> {
        let position = await this.getPosition(idgroup, iduser)
        if (position != PositionInGrop.CREATOR)
            await this.db.excuteQuery(
                `DELETE FROM member WHERE member.iduser = ${iduser} AND member.idgroup = ${idgroup}`
            );
        else throw new MyException("Admin tạo ra group không thể rời group")
        return true
    }
    async getOneGroup(idgroup: number): Promise<object | null> {
        let query = `SELECT * FROM groupchat WHERE groupchat.idgroup = ?;`
        let [dataRaw, col]: any = await this.db.excuteQuery(
            query, [
            idgroup
        ]
        )
        return dataRaw[0]
    }
    async getAllGroup(iduser: number): Promise<object[]> {
        let query = `SELECT groupchat.* FROM 
        user INNER JOIN member ON user.iduser = member.iduser 
        JOIN groupchat ON member.idgroup = groupchat.idgroup
        WHERE user.iduser = ?;`
        let [dataRaw, inforColimn]: any = await this.db.excuteQuery(
            query, [iduser]
        )
        if (dataRaw) {
            return dataRaw;
        }
        return []; this
    }
    async getSomeGroup(iduser: number, cursor: number, limit: number): Promise<object[]> {
        if (cursor !== Constant.GET_GROUP_FROM_CURSOR_MAX) {
            let query = `
            SELECT
        *
    FROM
        (
        SELECT
            groupchat.*,
            (
            SELECT
                MAX(message.idmessage)
            FROM
                message
            JOIN member AS MEM
            ON
                MEM.id = message.idmember
            WHERE
                MEM.idgroup = groupchat.idgroup
        ) AS _cursor
    FROM
        user
    INNER JOIN member ON user.iduser = member.iduser
    JOIN groupchat ON member.idgroup = groupchat.idgroup
    WHERE
        user.iduser = ?
    ) AS sub
    WHERE
        _cursor < ?
    ORDER BY
        _cursor
    DESC
    LIMIT ?    
           `
            let [dataRaw, inforColimn]: any = await this.db.excuteQuery(
                query, [iduser, cursor, limit]
            )
            if (dataRaw) {
                return dataRaw;
            }
        } else {
            let query = `SELECT
            *
        FROM
            (
            SELECT
                groupchat.*,
                (
                SELECT
                    MAX(message.idmessage)
                FROM
                    message
                JOIN member AS MEM
                ON
                    MEM.id = message.idmember
                WHERE
                    MEM.idgroup = groupchat.idgroup
            ) AS _cursor
        FROM
            user
        INNER JOIN member ON user.iduser = member.iduser
        JOIN groupchat ON member.idgroup = groupchat.idgroup
        WHERE
            user.iduser = ?
        ) AS sub
        WHERE
            _cursor <(
                (
                SELECT
                    MAX(message.idmessage)
                FROM
                    message
            ) + 1
            )
        ORDER BY
            _cursor
        DESC
        LIMIT ?`
            let [dataRaw, inforColimn]: any = await this.db.excuteQuery(
                query, [iduser, limit]
            )
            if (dataRaw) {
                return dataRaw;
            }
        }
        return []
    }
    async createGroup(name: string, iduser: number, users: Array<number>, typeGroup: number = GroupType.COMMUNITY): Promise<any> {
        let idgroup = -1;
        let group = null;
        try {
            let query = `INSERT INTO groupchat( groupchat.name, groupchat.type, groupchat.status, groupchat.createat) VALUES ( ?, ?, ?, now());`
            let data: [ResultSetHeader, any] = await this.db.excuteQuery(
                query, [name, typeGroup, GroupStatus.DEFAULT]
            ) as any
            idgroup = data[0].insertId
            await this.joinGroup(iduser, idgroup, PositionInGrop.CREATOR)
            for (let iduserMember of users) {
                await this.joinGroup(iduserMember, idgroup, PositionInGrop.MEMBER)
            }
            group = await this.getOneGroup(idgroup);
        }
        catch (e) {
            console.log("🚀 ~ file: group.repository.ts:163 ~ GroupRepository ~ createGroup ~ e:", e)
            throw new MyException("Có lỗi xảy ra, không thể tạo nhóm").withExceptionCode(HttpStatus.INTERNAL_SERVER_ERROR)
        }
        return group;
    }
    async getLastViewMember(idgroup: number): Promise<object[] | undefined> {
        let rawDataSQL: any = await this.db.excuteQuery(
            `SELECT user.iduser, user.name, user.avatar, member.lastview FROM (( groupchat JOIN member ON groupchat.idgroup = member.idgroup AND groupchat.idgroup = ${idgroup}) JOIN user ON user.iduser = member.iduser)
            `
        )
        if (rawDataSQL) {
            return rawDataSQL[0]
        }
        return undefined;
    }
    async getPosition(idgroup: Number, iduser: Number) {
        let [[{ 'position': position }], column] = await this.db.excuteQuery(`SELECT member.position From member where member.idgroup = ? AND member.iduser = ?`, [idgroup, iduser]) as any;
        return position;
    }
}