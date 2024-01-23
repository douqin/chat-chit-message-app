import { iDrive } from "../../services/cloud/drive.interface";
import { CloudDrive } from "../../services/cloud/drive.service";
import { ReactMessage } from "./enum/message.react.enum";
import { iMessageRepositoryBehavior } from "./interface/message.repository.interface";
import { MessageType } from "./enum/message.type.enum";
import { MessageStatus } from "./enum/message.status.enum";
import isValidNumberVariable from "@/utils/extension/vailid_variable";
import { inject, injectable } from "tsyringe";
import { OkPacket } from "mysql2";
import Message from "@/models/message.model";
import MyException from "@/utils/exceptions/my.exception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import { Database, iDatabase } from "@/lib/database";

@injectable()
export default class MessageRepository implements iMessageRepositoryBehavior {

    constructor(@inject(CloudDrive) private drive: iDrive, @inject(Database) private database: iDatabase) {
    }
    async getAllFileFromGroup(groupId: number, cursor: number, limit: number): Promise<any[]> {
        if (cursor === -1) {
            const query = `SELECT * FROM (member INNER JOIN message ON member.id = message.idmember AND member.idgroup = ? ) WHERE message.type = ? OR message.type = ? ORDER BY message.createat DESC limit ?`
            const [dataQuery, inforColumn] = await this.database.excuteQuery(
                query, [groupId, MessageType.IMAGE, MessageType.VIDEO, limit]
            )
            console.log("🚀 ~ file: message.repository.ts:129 ~ MessageRepository ~ getAllMessageFromGroup ~ dataQuery:", dataQuery)
            return dataQuery as any[];
        }
        else {
            const query = `SELECT * FROM (member INNER JOIN message ON member.id = message.idmember) WHERE member.idgroup = ?  AND message.idmessage < ? AND (message.type = ? OR message.type = ?) ORDER BY message.createat DESC limit ?`
            const [dataQuery, inforColumn] = await this.database.excuteQuery(
                query, [groupId, cursor, MessageType.IMAGE, MessageType.VIDEO, limit]
            )
            return dataQuery as any[];
        }
    }
    async getListPinMessage(groupId: number): Promise<any[]> {
        const query = `SELECT * FROM (member INNER JOIN message ON member.id = message.idmember AND member.idgroup = ? AND message.ispin = 1) ORDER BY message.createat DESC`
        const [dataQuery, inforColumn] = await this.database.excuteQuery(
            query, [groupId]
        )
        return dataQuery as any[];
    }
    async sendGifMessage(groupId: number, iduser: number, gifId: string, replyMessageId: number | null): Promise<number> {
        const queryGetIDMem = "SELECT  member.id FROM member WHERE member.idgroup = ? AND member.iduser = ? "
        const [[{ 'id': idmember }], data] = await this.database.excuteQuery(queryGetIDMem, [groupId, iduser]) as any;
        const sql = `INSERT INTO message (idmember,content, createat, type, status) VALUES ( ?, ?, now(), ?, ?)`;
        const values = [idmember, gifId, MessageType.GIF, MessageStatus.DEFAULT]
        const [rows] = await this.database.excuteQuery(sql, values) as any
        const [dataQuery, inforColumn] = await this.database.excuteQuery(
            "SELECT message.* FROM (member INNER JOIN message ON member.id = message.idmember AND member.idgroup = ? AND message.idmessage = ? AND member.id = ?)", [groupId, rows.insertId, idmember]
        ) as any[]
        return dataQuery[0].idmessage;
    }
    async forwardMessage(userId: number, groupIdAddressee: number, message: Message): Promise<number> {
        if (message.type === MessageType.IMAGE || message.type === MessageType.VIDEO) {
            let inforFile = await this.drive.copyFile(message.content)
            const queryGetIDMem = "SELECT  member.id FROM member WHERE member.idgroup = ? AND member.iduser = ? "
            const [[{ 'id': idmember }], column1] = await this.database.excuteQuery(queryGetIDMem, [groupIdAddressee, userId]) as any;
            const querySaveId = `INSERT INTO message (idmember,content, createat, type, status) VALUES ( ?, ?, now(), ?, ?)`
            if (inforFile) {
                let [data] = await this.database.excuteQuery(querySaveId, [idmember, inforFile, message.type, MessageStatus.DEFAULT]) as any
                const [dataQuery, inforColumn] = await this.database.excuteQuery(
                    "SELECT message.idmessage as messageId FROM (member INNER JOIN message ON member.id = message.idmember AND member.idgroup = ? AND message.idmessage = ? AND member.id = ?)", [groupIdAddressee, data.insertId, idmember]
                ) as any[]
                return dataQuery[0].messageId;
            }
        }
        else if (message.type === MessageType.TEXT) {
            return await this.sendTextMessage(groupIdAddressee, userId, message.content, message.manipulates, null)
        }
        else if (message.type === MessageType.GIF) {
            return await this.sendGifMessage(groupIdAddressee, userId, message.content, null)
        }
        throw new MyException("Wrong argument").withExceptionCode(HttpStatus.BAD_REQUEST)
    }
    async getOneMessage(idmessage: number) {
        const query = `SELECT * FROM message WHERE message.idmessage = ?`
        let [data, inforColumn] = await this.database.excuteQuery(query, [idmessage]) as any
        return data[0]
    }
    async getAllManipulateUser(idmessage: number): Promise<number[]> {
        const query = `SELECT user.iduser as userId FROM manipulate_user JOIN user ON manipulate_user.iduser = user.iduser WHERE manipulate_user.idmessage = ?`
        let [row, inforColumn] = await this.database.excuteQuery(query, [idmessage]) as any
        return row.map((value: any, index: number, array: any[]) => {
            return value.userId
        });
    }

    async getNumMessageUnread(idgroup: number): Promise<number> {
        return Promise.resolve(0)
        // FIXME: getNumMessageUnread complete func
    }
    async sendNotitfyMessage(idgroup: number, iduser: number, content: string, manipulates: number[]): Promise<any> {
        const queryGetIDMem = "SELECT member.id FROM member WHERE member.idgroup = ? AND member.iduser = ? "
        const [[{ 'id': idmember }], data] = await this.database.excuteQuery(queryGetIDMem, [idgroup, iduser]) as any;
        let date = new Date();
        const sql = `INSERT INTO message (idmember,content, createat, type, status) VALUES ( ?, ?, ?, ?, ?)`;
        const values = [idmember, content, date, MessageType.NOTIFY, MessageStatus.DEFAULT]
        const [rows] = await this.database.excuteQuery(sql, values) as any
        const [dataQuery, inforColumn] = await this.database.excuteQuery(
            "SELECT message.* FROM (member INNER JOIN message ON member.id = message.idmember AND member.idgroup = ? AND message.idmessage = ? AND member.id = ?)", [idgroup, rows.insertId, idmember]
        ) as any
        const queryInsertMan = `
            INSERT INTO manipulate_user (idmessage, iduser) VALUE(
                ?, ?
            )
        `
        for (let iduserMani of manipulates) {
            await this.database.excuteQuery(queryInsertMan, [dataQuery[0].idmessage, iduserMani])
        }
        return dataQuery[0];
    }
    async sendTextMessage(idgroup: number, iduser: number, content: string, manipulates: Array<number>, replyMessageId: number | null): Promise<number> {
        console.log("🚀 ~ MessageRepository ~ sendTextMessage ~ replyMessageId:", replyMessageId)
        const queryGetIDMem = "SELECT member.id FROM member WHERE member.idgroup = ? AND member.iduser = ? "
        const [[{ 'id': idmember }], data] = await this.database.excuteQuery(queryGetIDMem, [idgroup, iduser]) as any;
        let date = new Date();
        const sql = `INSERT INTO message (idmember,content, createat, type, status, replyidmessage) VALUES ( ?, ?, ?, ?, ?, ?)`;
        const values = [idmember, content, date, MessageType.TEXT, MessageStatus.DEFAULT, replyMessageId]
        const [rows] = await this.database.excuteQuery(sql, values) as OkPacket[]
        const queryInsertMan = `
            INSERT INTO manipulate_user (idmessage, iduser) VALUE(
                ?, ?
            )
        `
        for (let iduserMani of manipulates) {
            await this.database.excuteQuery(queryInsertMan, [rows.insertId, iduserMani])
        }
        return rows.insertId;
    }
    async sendFileMessage(idgroup: number, iduser: number, content: Express.Multer.File[], typeFile: MessageType = MessageType.IMAGE) {
        let array = [];
        for (let i = 0; i < content.length; i++) {
            try {
                let inforFile = await this.drive.uploadFile(content[i].filename, content[i].buffer)
                const queryGetIDMem = "SELECT  member.id FROM member WHERE member.idgroup = ? AND member.iduser = ? "
                const [[{ 'id': idmember }], column1] = await this.database.excuteQuery(queryGetIDMem, [idgroup, iduser]) as any;
                const querySaveId = `INSERT INTO message (idmember,content, createat, type, status) VALUES ( ?, ?, now(), ?, ?)`
                if (inforFile) {
                    let [data] = await this.database.excuteQuery(querySaveId, [idmember, inforFile?.id, (content[i].mimetype.includes("image")) ? MessageType.IMAGE : MessageType.VIDEO, MessageStatus.DEFAULT]) as any
                    const [dataQuery, inforColumn] = await this.database.excuteQuery(
                        "SELECT message.* FROM (member INNER JOIN message ON member.id = message.idmember AND member.idgroup = ? AND message.idmessage = ? AND member.id = ?)", [idgroup, data.insertId, idmember]
                    ) as any[]
                    array.push(dataQuery[0]);
                }
            }
            catch (e) {
                console.log(e)
            }
        }
        return array;
    }
    async isMessageOfUser(idmessage: Number, iduser: Number): Promise<boolean> {
        const quert = 'SELECT COUNT(*) From member JOIN message ON member.id = message.idmember AND message.idmessage = ? AND member.iduser = ?        '
        const [{ 'COUNT(*)': isExist }] = await this.database.excuteQuery(quert, [idmessage, iduser]) as any
        return Boolean(isExist)
    }

    async isMessageContainInGroup(idmessage: Number, idgroup: Number): Promise<boolean> {
        const query = 'SELECT COUNT(*) From member JOIN message ON member.id = message.idmember AND message.idmessage = ? AND member.idgroup = ?'
        let [[{ 'COUNT(*)': isExist }], []] = await this.database.excuteQuery(query, [idmessage, idgroup]) as any
        return Boolean(isExist);
    }
    async changePinMessage(idmessage: number, iduser: number, isPin: number): Promise<boolean> {
        const query = ` SELECT message.idmember FROM message WHERE message.idmessage = ? LIMIT 1`
        let [[{ 'idmember': idmember }], data] = await this.database.excuteQuery(query, [idmessage]) as any
        const query2 = `SELECT member.iduser FROM member WHERE member.id = ?`
        let [[{ 'iduser': _iduser }], _data] = await this.database.excuteQuery(query2, [idmember]) as any
        if (iduser === Number(_iduser)) {
            const queryChange = `UPDATE message
            SET message.ispin = ?
            WHERE message.idmessage = ?`
        }
        else {
            return false
        }
        return true
    }

    async getAllMessageFromGroup(idgroup: number, cursor: number, limit: number): Promise<any[]> {
        if (cursor === -1) {
            const query = `SELECT * FROM (member INNER JOIN message ON member.id = message.idmember AND member.idgroup = ? ) ORDER BY message.createat DESC limit ?`
            const [dataQuery, inforColumn] = await this.database.excuteQuery(
                query, [idgroup, limit]
            )
            console.log("🚀 ~ file: message.repository.ts:129 ~ MessageRepository ~ getAllMessageFromGroup ~ dataQuery:", dataQuery)
            return dataQuery as any[];
        }
        else {
            const query = `SELECT * FROM (member INNER JOIN message ON member.id = message.idmember) WHERE member.idgroup = ?  AND message.idmessage < ? ORDER BY message.createat DESC limit ?`
            const [dataQuery, inforColumn] = await this.database.excuteQuery(
                query, [idgroup, cursor, limit]
            )
            return dataQuery as any[];
        }
    }
    async sendGiftMessage(idgroup: number, iduser: number, content: string) {
        // get idmember
        const queryGetIDMem = "SELECT  member.id FROM member WHERE member.idgroup = ? AND member.iduser = ? "
        const [[{ 'id': idmember }], data] = await this.database.excuteQuery(queryGetIDMem, [idgroup, iduser]) as any;
        const sql = `INSERT INTO message (idmember,content, createat, type, status) VALUES ( ?, ?, now(), ?, ?)`;
        const values = [idmember, content, MessageType.GIF, MessageStatus.DEFAULT]
        const [rows] = await this.database.excuteQuery(sql, values)
        return true;
    }
    async reactMessage(idmessage: number, react: ReactMessage, iduser: number, idgroup: number): Promise<any> {
        const queryGetIDMem = "SELECT  member.id FROM member WHERE member.idgroup = ? AND member.iduser = ? "
        const [[{ 'id': idmember }], column1] = await this.database.excuteQuery(queryGetIDMem, [idgroup, iduser]) as any;
        let query = "INSERT INTO reaction(idmessage, type, idmember) VALUE(?,?,?)"
        let [dataInsert] = await this.database.excuteQuery(query, [idmessage, react, idmember]) as any
        let qGetEntity = `SELECT user.iduser, reaction.idreaction, reaction.idmessage, reaction.type FROM reaction JOIN member ON member.id = reaction.idmember JOIN user ON user.iduser = member.iduser WHERE idreaction = ?`
        let [data, inforColumn2] = await this.database.excuteQuery(qGetEntity, [dataInsert.insertId]) as any
        return data[0];
    }
    async changeStatusMessage(idmessage: number, status: MessageStatus): Promise<boolean> {
        const query = 'UPDATE message SET status = ? WHERE message.idmessage = ?'
        await this.database.excuteQuery(query, [status, idmessage])
        return true
    }
    async getUrlFile(id: string): Promise<string | null | undefined> {
        return await this.drive.getUrlFile(id);
    }
    async getAllReactFromMessage(idmessage: number): Promise<any[]> {
        let query = "SELECT * FROM reaction WHERE reaction.idmessage = ?"
        let [data, inforColumn] = await this.database.excuteQuery(query, [idmessage]) as any
        return data
    }
}