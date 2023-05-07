import { MySql } from "@/config/sql/mysql";
import GroupRepositoryBehavior from "./interface/group.repository.interface";
import { GroupType } from "./dtos/group.type.dto";
import { GroupStatus } from "./dtos/group.status.dto";
import MyException from "@/utils/exceptions/my.exception";

export default class GroupRepository implements GroupRepositoryBehavior {

    constructor() { }
    async getAllMember(idgroup: number): Promise<object[]> {
        let query = "SELECT user.* from (user JOIN member ON user.iduser = member.iduser) WHERE member.idgroup = ?"
        let [rows] = await MySql.excuteQuery(query,[idgroup])
        return rows as object[]; // FIXME:
    }
    async leaveGroup(iduser: any, idgroup: number): Promise<boolean> { // FIXME : ADD TRIGGER CHECK ADMIN 
        let isAdmin = iduser == (await MySql.excuteStringQuery(`SELECT groupchat.createby From groupchat where groupchat.idgroup = ${idgroup}`) as any)[0][0].createby
        if (!isAdmin)
            await MySql.excuteStringQuery(
                `DELETE FROM member WHERE member.iduser = ${iduser} AND member.idgroup = ${idgroup}`
            );
        else throw new MyException(1, "Admin tạo ra group không thể rời group")
        return true
    }
    async renameGroup(name: string, iduser: number): Promise<boolean> {
        return true;
    }
    async getOneGroup(iduser: number): Promise<object | null> {
        let query = `SELECT groupchat.idgroup, groupchat.name, groupchat.avatar, groupchat.status, groupchat.createby, groupchat.createat FROM ((user INNER JOIN member ON user.iduser = member.iduser) JOIN groupchat ON member.idgroup = groupchat.idgroup) WHERE user.iduser = ${iduser};`
        let dataRaw: any = await MySql.excuteStringQuery(
            query
        )
        if (dataRaw) {
            return dataRaw[0]
        }
        return null;
    }
    async getAllGroup(iduser: number): Promise<object[] | undefined> {
        let query = `SELECT groupchat.idgroup, groupchat.name, groupchat.avatar, groupchat.status, groupchat.createby, groupchat.createat FROM ((user INNER JOIN member ON user.iduser = member.iduser) JOIN groupchat ON member.idgroup = groupchat.idgroup) WHERE user.iduser = ${iduser};`
        let dataRaw: any = await MySql.excuteStringQuery(
            query
        )
        if (dataRaw) {
            return dataRaw[0]
        }
        return undefined;
    }
    async createGroup(name: string, iduser: number): Promise<boolean> {
        await MySql.excuteStringQuery(
            `INSERT INTO groupchat( groupchat.name, groupchat.createby, groupchat.type, groupchat.status, groupchat.createat) VALUES ('${name}', ${iduser}, ${GroupType.COMMUNITY}, ${GroupStatus.DEFAULT},now());`
        )
        return true;
    }
    // private async isContainInGroup(iduser: number, idgroup: number) {
    //     await MySql.excuteQuery(
    //         `SELECT * FROM member WHERE member.iduser = ${iduser} AND member.idgroup = ${idgroup}`
    //     )
    // }
    async getLastViewMember(idgroup: number): Promise<object[] | undefined> {
        let rawDataSQL: any = await MySql.excuteStringQuery(
            `SELECT user.iduser, user.name, user.avatar, member.lastview FROM (( groupchat JOIN member ON groupchat.idgroup = member.idgroup AND groupchat.idgroup = ${idgroup}) JOIN user ON user.iduser = member.iduser)
            `
        )
        if (rawDataSQL) {
            return rawDataSQL[0]
        }
        return undefined;
    }
}
