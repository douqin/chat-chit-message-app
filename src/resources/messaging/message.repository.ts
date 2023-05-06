import { MySql } from "@/config/sql/mysql";
import HttpException from "@/utils/exceptions/http.exeception";
import { HttpStatus } from "@/utils/exceptions/httpstatus.exception";
import { MessageStatus, MessageType } from "./dtos/message.type";

export default class MessageRepository {
    async sendTextMessage(idgroup: number, iduser: number, content: string) {
        const sql = `INSERT INTO message (idgroup, iduser, content, createat, type, status, ispin) VALUES (?, ?, ?, now(), ?, ?, 0)`;
        const values = [idgroup, iduser, content, MessageType.TEXT, MessageStatus.DEFAULT]
        const [rows] = await MySql.excuteQuery(sql, values)
        return true;
    }
    async getAllMessageFromGroup(idgroup: number, iduser: number): Promise<object[] | undefined> {
        let dataQuery: any = await MySql.excuteStringQuery(
            `
            SELECT COUNT(member.id) as count FROM member WHERE member.idgroup = ${idgroup} AND member.iduser = ${iduser}
            `
        )
        if (dataQuery[0][0].count == 1) {
            let dataRaw: any = await MySql.excuteStringQuery(
                `
                SELECT * FROM message WHERE message.idgroup = ${idgroup}
                `
            )
            if (dataRaw) {
                return dataRaw[0]
            }
            return undefined;
        }
        else {
            throw new HttpException(HttpStatus.NOT_ACCEPTABLE, "Bạn không có quyền truy cập")
        }
    }
}