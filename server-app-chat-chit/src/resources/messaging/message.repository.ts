import { iDrive } from "../../services/cloud/drive.interface";
import { CloudDrive } from "../../services/cloud/drive.service";
import { ReactMessage } from "./enum/message.react.enum";
import { iMessageRepositoryBehavior } from "./interface/message.repository.interface";
import { MessageType } from "./enum/message.type.enum";
import { MessageStatus } from "./enum/message.status.enum";
import { isValidNumberVariable } from "@/utils/validate";
import { inject, injectable } from "tsyringe";
import { OkPacket } from "mysql2";
import Message from "@/models/message.model";
import MyException from "@/utils/exceptions/my.exception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import { Database, iDatabase } from "@/lib/database";
import { RawDataMysql } from "@/models/raw.data";

@injectable()
export default class MessageRepository implements iMessageRepositoryBehavior {

    constructor(@inject(CloudDrive) private drive: iDrive, @inject(Database) private database: iDatabase) {
    }
    async getAllFileFromGroup(groupId: number, cursor: number, limit: number): Promise<any[]> {
        if (cursor === -1) {
            const query = `SELECT * FROM (member INNER JOIN message ON member.id = message.memberId AND member.groupId = ? ) WHERE message.type = ? OR message.type = ? ORDER BY message.createAt DESC limit ?`
            const [dataQuery, inforColumn] = await this.database.executeQuery(
                query, [groupId, MessageType.IMAGE, MessageType.VIDEO, limit]
            )
            console.log("🚀 ~ file: message.repository.ts:129 ~ MessageRepository ~ getAllFileFromGroup ~ dataQuery:", dataQuery)
            return dataQuery as any[];
        }
        else {
            const query = `SELECT * FROM (member INNER JOIN message ON member.id = message.memberId) WHERE member.groupId = ?  AND message.messageId < ? AND (message.type = ? OR message.type = ?) ORDER BY message.createAt DESC limit ?`
            const [dataQuery, inforColumn] = await this.database.executeQuery(
                query, [groupId, cursor, MessageType.IMAGE, MessageType.VIDEO, limit]
            )
            return dataQuery as any[];
        }
    }
    async getListPinMessage(groupId: number): Promise<any[]> {
        const query = `SELECT * FROM (member INNER JOIN message ON member.id = message.memberId AND member.groupId = ? AND message.ispin = 1) ORDER BY message.createAt DESC`
        const [dataQuery, inforColumn] = await this.database.executeQuery(
            query, [groupId]
        )
        return dataQuery as any[];
    }
    async sendGifMessage(groupId: number, userId: number, gifId: string, replyMessageId: number | null): Promise<number> {
        const queryGetIDMem = "SELECT  member.id FROM member WHERE member.groupId = ? AND member.userId = ? "
        const [[{ 'id': memberId }], data] = await this.database.executeQuery(queryGetIDMem, [groupId, userId]) as any;
        const sql = `INSERT INTO message (memberId,content, createAt, type, status) VALUES ( ?, ?, now(), ?, ?)`;
        const values = [memberId, gifId, MessageType.GIF, MessageStatus.DEFAULT]
        const [rows] = await this.database.executeQuery(sql, values) as any
        const [dataQuery, inforColumn] = await this.database.executeQuery(
            "SELECT message.* FROM (member INNER JOIN message ON member.id = message.memberId AND member.groupId = ? AND message.messageId = ? AND member.id = ?)", [groupId, rows.insertId, memberId]
        ) as any[]
        return dataQuery[0].messageId;
    }
    async forwardMessage(userId: number, groupIdAddressee: number, message: Message): Promise<number> {
        if (message.type === MessageType.IMAGE || message.type === MessageType.VIDEO) {
            let inforFile = await this.drive.copyFile(message.content)
            const queryGetIDMem = "SELECT  member.id FROM member WHERE member.groupId = ? AND member.userId = ? "
            const [[{ 'id': memberId }], column1] = await this.database.executeQuery(queryGetIDMem, [groupIdAddressee, userId]) as any;
            const querySaveId = `INSERT INTO message (memberId,content, createAt, type, status) VALUES ( ?, ?, now(), ?, ?)`
            if (inforFile) {
                let [data] = await this.database.executeQuery(querySaveId, [memberId, inforFile, message.type, MessageStatus.DEFAULT]) as any
                const [dataQuery, inforColumn] = await this.database.executeQuery(
                    "SELECT message.messageId as messageId FROM (member INNER JOIN message ON member.id = message.memberId AND member.groupId = ? AND message.messageId = ? AND member.id = ?)", [groupIdAddressee, data.insertId, memberId]
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
    async getOneMessage(messageId: number) {
        const query = `SELECT * FROM message WHERE message.messageId = ?`
        let [data, inforColumn] = await this.database.executeQuery(query, [messageId]) as any
        return data[0]
    }
    async getAllManipulateUser(messageId: number): Promise<number[]> {
        const query = `SELECT user.userId as userId FROM manipulate_user JOIN user ON manipulate_user.userId = user.userId WHERE manipulate_user.messageId = ?`
        let [row, inforColumn] = await this.database.executeQuery(query, [messageId]) as any
        return row.map((value: any, index: number, array: any[]) => {
            return value.userId
        });
    }

    async getNumMessageUnread(groupId: number): Promise<number> {
        return Promise.resolve(0)
        // FIXME: getNumMessageUnread complete func
    }
    async sendNotitfyMessage(groupId: number, userId: number, content: string, manipulates: number[]): Promise<any> {
        const queryGetIDMem = "SELECT member.id FROM member WHERE member.groupId = ? AND member.userId = ? "
        const [[{ 'id': memberId }], data] = await this.database.executeQuery(queryGetIDMem, [groupId, userId]) as any;
        let date = new Date();
        const sql = `INSERT INTO message (memberId,content, createAt, type, status) VALUES ( ?, ?, ?, ?, ?)`;
        const values = [memberId, content, date, MessageType.NOTIFY, MessageStatus.DEFAULT]
        const [rows] = await this.database.executeQuery(sql, values) as any
        const [dataQuery, inforColumn] = await this.database.executeQuery(
            "SELECT message.* FROM (member INNER JOIN message ON member.id = message.memberId AND member.groupId = ? AND message.messageId = ? AND member.id = ?)", [groupId, rows.insertId, memberId]
        ) as any
        const queryInsertMan = `
            INSERT INTO manipulate_user (messageId, userId) VALUE(
                ?, ?
            )
        `
        for (let userIdMani of manipulates) {
            await this.database.executeQuery(queryInsertMan, [dataQuery[0].messageId, userIdMani])
        }
        return dataQuery[0];
    }
    async sendTextMessage(groupId: number, userId: number, content: string, manipulates: Array<number>, replyMessageId: number | null): Promise<number> {
        console.log("🚀 ~ MessageRepository ~ sendTextMessage ~ replyMessageId:", replyMessageId)
        const queryGetIDMem = "SELECT member.id FROM member WHERE member.groupId = ? AND member.userId = ? "
        const [[{ 'id': memberId }], data] = await this.database.executeQuery(queryGetIDMem, [groupId, userId]) as any;
        let date = new Date();
        const sql = `INSERT INTO message (memberId,content, createAt, type, status, replyMessageId) VALUES ( ?, ?, ?, ?, ?, ?)`;
        const values = [memberId, content, date, MessageType.TEXT, MessageStatus.DEFAULT, replyMessageId]
        const [rows] = await this.database.executeQuery(sql, values) as OkPacket[]
        const queryInsertMan = `
            INSERT INTO manipulate_user (messageId, userId) VALUE(
                ?, ?
            )
        `
        for (let userIdMani of manipulates) {
            await this.database.executeQuery(queryInsertMan, [rows.insertId, userIdMani])
        }
        return rows.insertId;
    }
    async sendFileMessage(groupId: number, userId: number, content: Express.Multer.File, typeFile: MessageType): Promise<RawDataMysql> {
        let array  : RawDataMysql;
        let inforFile = await this.drive.uploadFile(content.filename, content.stream)
        if (!inforFile) {
            throw new MyException("Can't upload file").withExceptionCode(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        try {
            array = await this.database.transaction<RawDataMysql>(async (connection) => {
                const queryGetIDMem = "SELECT member.id FROM member WHERE member.groupId = ? AND member.userId = ? "
                const [[{ 'id': memberId }], column1] = await connection.executeQuery(queryGetIDMem, [groupId, userId]) as any;
                const querySaveId = `INSERT INTO message (memberId,content, createAt, type, status) VALUES ( ?, ?, now(), ?, ?)`
                let [data] = await connection.executeQuery(querySaveId, [memberId, inforFile!.id, typeFile, MessageStatus.DEFAULT]) as any
                const [dataQuery, inforColumn] = await connection.executeQuery(
                    "SELECT message.* FROM (member INNER JOIN message ON member.id = message.memberId AND member.groupId = ? AND message.messageId = ? AND member.id = ?)", [groupId, data.insertId, memberId]
                ) as RawDataMysql[]
                return dataQuery[0];
            })
        }
        catch (e) {
            await this.drive.delete(inforFile.id)
            throw new MyException("Can't upload file").withExceptionCode(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return array;
    }
    async isMessageOfUser(messageId: Number, userId: Number): Promise<boolean> {
        const quert = 'SELECT COUNT(*) From member JOIN message ON member.id = message.memberId AND message.messageId = ? AND member.userId = ?        '
        const [{ 'COUNT(*)': isExist }] = await this.database.executeQuery(quert, [messageId, userId]) as any
        return Boolean(isExist)
    }

    async isMessageContainInGroup(messageId: Number, groupId: Number): Promise<boolean> {
        const query = 'SELECT COUNT(*) From member JOIN message ON member.id = message.memberId AND message.messageId = ? AND member.groupId = ?'
        let [[{ 'COUNT(*)': isExist }], []] = await this.database.executeQuery(query, [messageId, groupId]) as any
        return Boolean(isExist);
    }
    async changePinMessage(messageId: number, userId: number, isPin: number): Promise<boolean> {
        const query = ` SELECT message.memberId FROM message WHERE message.messageId = ? LIMIT 1`
        let [[{ 'memberId': memberId }], data] = await this.database.executeQuery(query, [messageId]) as any
        const query2 = `SELECT member.userId FROM member WHERE member.id = ?`
        let [[{ 'userId': _userId }], _data] = await this.database.executeQuery(query2, [memberId]) as any
        if (userId === Number(_userId)) {
            const queryChange = `UPDATE message
            SET message.ispin = ?
            WHERE message.messageId = ?`
        }
        else {
            return false
        }
        return true
    }

    async getMessagesFromGroup(groupId: number, cursor: number, limit: number): Promise<any[]> {
        console.log("🚀 ~ MessageRepository ~ getAllMessageFromGroup ~ cursor:", cursor)
        if (cursor === -1) {
            const query = `SELECT * FROM (member INNER JOIN message ON member.id = message.memberId AND member.groupId = ? ) ORDER BY message.createAt DESC limit ?`
            const [dataQuery, inforColumn] = await this.database.executeQuery(
                query, [groupId, limit]
            )
            console.log("🚀 ~ file: message.repository.ts:129 ~ MessageRepository ~ getAllMessageFromGroup ~ dataQuery:", dataQuery)
            return dataQuery as any[];
        }
        else {
            const query = `SELECT * FROM (member INNER JOIN message ON member.id = message.memberId) WHERE member.groupId = ?  AND message.messageId < ? ORDER BY message.createAt DESC limit ?`
            const [dataQuery, inforColumn] = await this.database.executeQuery(
                query, [groupId, cursor, limit]
            )
            return dataQuery as any[];
        }
    }
    async sendGiftMessage(groupId: number, userId: number, content: string) {
        // get memberId
        const queryGetIDMem = "SELECT  member.id FROM member WHERE member.groupId = ? AND member.userId = ? "
        const [[{ 'id': memberId }], data] = await this.database.executeQuery(queryGetIDMem, [groupId, userId]) as any;
        const sql = `INSERT INTO message (memberId,content, createAt, type, status) VALUES ( ?, ?, now(), ?, ?)`;
        const values = [memberId, content, MessageType.GIF, MessageStatus.DEFAULT]
        const [rows] = await this.database.executeQuery(sql, values)
        return true;
    }
    async reactMessage(messageId: number, react: ReactMessage, userId: number, groupId: number): Promise<any> {
        const queryGetIDMem = "SELECT  member.id FROM member WHERE member.groupId = ? AND member.userId = ? "
        const [[{ 'id': memberId }], column1] = await this.database.executeQuery(queryGetIDMem, [groupId, userId]) as any;
        let query = "INSERT INTO reaction(messageId, type, memberId) VALUE(?,?,?)"
        let [dataInsert] = await this.database.executeQuery(query, [messageId, react, memberId]) as any
        let qGetEntity = `SELECT user.userId, reaction.idreaction, reaction.messageId, reaction.type FROM reaction JOIN member ON member.id = reaction.memberId JOIN user ON user.userId = member.userId WHERE idreaction = ?`
        let [data, inforColumn2] = await this.database.executeQuery(qGetEntity, [dataInsert.insertId]) as any
        return data[0];
    }
    async changeStatusMessage(messageId: number, status: MessageStatus): Promise<boolean> {
        const query = 'UPDATE message SET status = ? WHERE message.messageId = ?'
        await this.database.executeQuery(query, [status, messageId])
        return true
    }
    async getUrlFile(id: string): Promise<string | null | undefined> {
        return await this.drive.getUrlFile(id);
    }
    async getAllReactFromMessage(messageId: number): Promise<any[]> {
        let query = "SELECT * FROM reaction WHERE reaction.messageId = ?"
        let [data, inforColumn] = await this.database.executeQuery(query, [messageId]) as any
        return data
    }
}