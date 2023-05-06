import { MySql } from "@/config/sql/mysql"
import { AdminRepositoryBehavior } from "./interface/admin.repository.interface"

export default class AdminRepository implements AdminRepositoryBehavior {

    constructor() {

    }
    async renameGroup(name: string, idgroup: number): Promise<boolean> {
        await MySql.excuteStringQuery(
            `UPDATE groupchat
            SET groupchat.name = ${name}
            WHERE groupchat.idgroup =${idgroup}`
        )
        return true;
    }
    async deleteMember(idgroup: number): Promise<any> { // FIXME:
        let data = await MySql.excuteStringQuery(
            `SELECT member.iduser as iduser FROM member WHERE member.idgroup = ${idgroup} AND member.isadmin = 1`
        ) as any
    }

    async getListIdAdmin(idgroup: number): Promise<Array<number>> {
        let data = await MySql.excuteStringQuery(
            `SELECT member.iduser as iduser FROM member WHERE member.idgroup = ${idgroup} AND member.isadmin = 1`
        ) as any
        console.log("getListIdAdmin: " + data)
        if (data[0]) {
            return data[0]
        }
        return []
    }

}