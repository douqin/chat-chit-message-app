import { PositionInGrop } from './dtos/group.position';
import { ServiceDrive } from './../../component/cloud/drive.service';
import { MySql } from "@/config/sql/mysql";
import GroupRepositoryBehavior from "./interface/group.repository.interface";
import { GroupType } from "./dtos/group.type.dto";
import { GroupStatus } from "./dtos/group.status.dto";
import MyException from "@/utils/exceptions/my.exception";
import { iDrive } from '../../component/cloud/drive.interface';
import { ResultSetHeader } from 'mysql2';

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
        return this.drive.uploadFile("", "", file.buffer);
    }
    async getAllMember(idgroup: number): Promise<object[]> {
        let query = "SELECT user.* from (user JOIN member ON user.iduser = member.iduser) WHERE member.idgroup = ?"
        let [rows] = await MySql.excuteQuery(query, [idgroup])
        console.log(rows)
        return rows as object[];
    }
    async leaveGroup(iduser: any, idgroup: number): Promise<boolean> { // FIXME : ADD TRIGGER CHECK ADMIN 
        let isAdmin = iduser == (await MySql.excuteQuery(`SELECT groupchat.createby From groupchat where groupchat.idgroup = ${idgroup}`) as any)[0][0].createby
        if (!isAdmin)
            await MySql.excuteQuery(
                `DELETE FROM member WHERE member.iduser = ${iduser} AND member.idgroup = ${idgroup}`
            );
        else throw new MyException("Admin tạo ra group không thể rời group")
        return true
    }
    async renameGroup(name: string, iduser: number): Promise<boolean> {
        return true;
    }
    async getOneGroup(iduser: number): Promise<object | null> {
        let query = `SELECT groupchat.idgroup, groupchat.name, groupchat.avatar, groupchat.status, groupchat.createby, groupchat.createat FROM ((user INNER JOIN member ON user.iduser = member.iduser) JOIN groupchat ON member.idgroup = groupchat.idgroup) WHERE user.iduser = ${iduser};`
        let dataRaw: any = await MySql.excuteQuery(
            query
        )
        if (dataRaw) {
            return dataRaw[0]
        }
        return null;
    }
    async getAllGroup(iduser: number): Promise<object[] | undefined> {
        let query = `SELECT groupchat.idgroup, groupchat.name, groupchat.avatar, groupchat.status, groupchat.createby, groupchat.createat FROM ((user INNER JOIN member ON user.iduser = member.iduser) JOIN groupchat ON member.idgroup = groupchat.idgroup) WHERE user.iduser = ${iduser};`
        let dataRaw: any = await MySql.excuteQuery(
            query
        )
        if (dataRaw) {
            return dataRaw[0]
        }
        return undefined;
    }
    async createGroup(name: string, iduser: number, typeGroup: number = GroupType.COMMUNITY): Promise<boolean> {
        let id = await this.drive.createFolder(`group_${name}`);
        let idgroup = -1;
        try {
            let query = `INSERT INTO groupchat( groupchat.name, groupchat.type, groupchat.status, groupchat.createat, groupchat.id_folder) VALUES (?,?,?,now(),?);`
            let data: [ResultSetHeader, any] = await MySql.excuteQuery(
                query, [name, typeGroup, GroupStatus.DEFAULT, id]
            ) as any
            // query = ' SELECT LAST_INSERT_ID();'
            idgroup = data[0].insertId
        }
        catch (e) {
            await this.drive.delete(id)
            throw new MyException("Có lỗi xảy ra, không thể tạo nhóm")
        }
        try {
            if (idgroup != -1) {
                await this.joinGroup(iduser, idgroup, PositionInGrop.CREATOR)
            } else
                throw new Error();
        }
        catch (e) {
            // let query = 'DELETE FROM groupchat WHERE groupchat.idgroup = ?'
            // MySql.excuteQuery(query, [id]);
            //TODO: del group
            throw new MyException("Có lỗi xảy ra, không thể tạo nhóm.")
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
}