import { PositionInGrop } from './dtos/group.position';
import { ServiceDrive } from './../../component/cloud/drive.service';
import { MySql } from "@/config/sql/mysql";
import GroupRepositoryBehavior from "./interface/group.repository.interface";
import { GroupType } from "./dtos/group.type.dto";
import { GroupStatus } from "./dtos/group.status.dto";
import MyException from "@/utils/exceptions/my.exception";
import { iDrive } from '../../component/cloud/drive.interface';
import { ResultSetHeader } from 'mysql2';
import { HttpStatus } from '@/utils/extension/httpstatus.exception';

export default class GroupRepository implements GroupRepositoryBehavior {
    public drive: iDrive
    constructor() {
        this.drive = ServiceDrive.gI();
    }
    async joinGroup(iduser: number, idgroup: number, positionUser: number = PositionInGrop.MEMBER): Promise<void> {
        try {
            let query = "INSERT INTO member(member.idgroup, member.iduser, member.position) VALUES (?, ?, ?) "
            let [data] = await MySql.excuteQuery(query, [idgroup, iduser, positionUser])
        }
        catch (e: any) {
            throw new MyException("Không thể tham gia group này")
        }
    }
    async isContainInGroup(iduser: number, idgroup: number): Promise<boolean> {
        let [data] = await MySql.excuteQuery("SELECT COUNT(*) FROM member WHERE member.iduser = ? AND member.idgroup = ?", [iduser, idgroup]);
        const [{ 'COUNT(*)': count }] = data as any;
        if (count == 1) {
            return true;
        }
        return false;
    }
    async changeAvatarGroup(iduser: number, idgroup: number, file: Express.Multer.File) {
        let position = await this.getPosition(idgroup, iduser)
        if (position == PositionInGrop.CREATOR) {
            const query = 'SELECT groupchat.avatar FROM groupchat WHERE groupchat.idgroup = ? '
            const [[{ 'avatar': avatar }], column] = MySql.excuteQuery(query, [idgroup]) as any;
            if (avatar) {
                await this.drive.delete(avatar)
            }
            return this.drive.uploadFile(file.filename, file.buffer);
        } else throw new MyException("Bạn không có quyền này").withCode(HttpStatus.FORBIDDEN)
    }
    async getAllMember(idgroup: number): Promise<object[]> {
        let query = "SELECT user.* from (user JOIN member ON user.iduser = member.iduser) WHERE member.idgroup = ?"
        let [rows] = await MySql.excuteQuery(query, [idgroup])
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
            idgroup = data[0].insertId
            await this.joinGroup(iduser, idgroup, PositionInGrop.CREATOR)
        }
        catch (e) {
            throw new MyException("Có lỗi xảy ra, không thể tạo nhóm").withCode(HttpStatus.INTERNAL_SERVER_ERROR)
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