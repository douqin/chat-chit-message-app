import { Database } from "@/config/sql/database";
import MyException from "@/utils/exceptions/my.exception";
import { iDrive } from "../../component/cloud/drive.interface";
import { ServiceDrive } from "../../component/cloud/drive.service";
import { ReactMessage } from "./enum/message.react.enum";
import { MessageRepositoryBehavior } from "./interface/message.repository.interface";
import { MessageType } from "./enum/message.type.enum";
import { MessageStatus } from "./enum/message.status.enum";
import validVariable from "@/utils/extension/vailid_variable";
import { RowDataPacket } from "mysql2";

export default class MessageRepository implements MessageRepositoryBehavior {

    public drive: iDrive
    constructor() {
        this.drive = ServiceDrive.gI();
    }
    async getAllTagFromMessage(idmessage: number): Promise<any[]> {
        const query = `SELECT user.* FROM message JOIN tagged_member ON message.idmessage = tagged_member.idmessage 
        JOIN member ON member.id = message.idmember
        JOIN user ON member.iduser = user.iduser
        WHERE message.idmessage = ?`
        let [row, inforColumn] = await Database.excuteQuery(query, [idmessage]) as any
        return row
    }
    async sendNotitfyMessage(idgroup: number, iduser: number, content: string, manipulates: number[]): Promise<any> {
        const queryGetIDMem = "SELECT member.id FROM member WHERE member.idgroup = ? AND member.iduser = ? "
        const [[{ 'id': idmember }], data] = await Database.excuteQuery(queryGetIDMem, [idgroup, iduser]) as any;
        let date = new Date();
        const sql = `INSERT INTO message (idmember,content, createat, type, status) VALUES ( ?, ?, ?, ?, ?)`;
        const values = [idmember, content, date, MessageType.NOTIFY, MessageStatus.DEFAULT]
        const [rows] = await Database.excuteQuery(sql, values) as any
        const [dataQuery, inforColumn] = await Database.excuteQuery(
            "SELECT message.* FROM (member INNER JOIN message ON member.id = message.idmember AND member.idgroup = ? AND message.idmessage = ? AND member.id = ?)", [idgroup, rows.insertId, idmember]
        ) as any
        const queryInsertMan = `
            INSERT INTO manipulate_user (idmessage, iduser) VALUE(
                ?, ?
            )
        `
        for (let iduserMani of manipulates) {
            await Database.excuteQuery(queryInsertMan, [dataQuery[0].idmessage, iduserMani])
        }
        return dataQuery[0];
    }
    async sendFileMessage(idgroup: number, iduser: number, content: Express.Multer.File[], typeFile: MessageType = MessageType.IMAGE) {
        let array = [];
        for (let i = 0; i < content.length; i++) {
            try {
                let inforFile = await this.drive.uploadFile(content[i].filename, content[i].buffer)
                const queryGetIDMem = "SELECT  member.id FROM member WHERE member.idgroup = ? AND member.iduser = ? "
                const [[{ 'id': idmember }], column1] = await Database.excuteQuery(queryGetIDMem, [idgroup, iduser]) as any;
                const querySaveId = `INSERT INTO message (idmember,content, createat, type, status) VALUES ( ?, ?, now(), ?, ?)`
                if (inforFile) {
                    let [data] = await Database.excuteQuery(querySaveId, [idmember, inforFile?.id, (content[i].mimetype.includes("image")) ? MessageType.IMAGE : MessageType.VIDEO, MessageStatus.DEFAULT]) as any
                    const [dataQuery, inforColumn] = await Database.excuteQuery(
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
        const [{ 'COUNT(*)': isExist }] = await Database.excuteQuery(quert, [idmessage, iduser]) as any
        return Boolean(isExist)
    }
    async updateLastView(iduser: number, idmessgae: number): Promise<boolean> {
        const query = 'UPDATE member SET member.lastview = ? WHERE member.iduser = ?'
        await Database.excuteQuery(query, [idmessgae, iduser])
        return true
    }
    async isMessageContainInGroup(idmessage: Number, idgroup: Number): Promise<boolean> {
        const query = 'SELECT COUNT(*) From member JOIN message ON member.id = message.idmember AND message.idmessage = ? AND member.idgroup = ?'
        let [[{ 'COUNT(*)': isExist }], []] = await Database.excuteQuery(query, [idmessage, idgroup]) as any
        return Boolean(isExist);
    }
    async changePinMessage(idmessage: number, iduser: number, isPin: number): Promise<boolean> {
        const query = ` SELECT message.idmember FROM message WHERE message.idmessage = ? LIMIT 1`
        let [[{ 'idmember': idmember }], data] = await Database.excuteQuery(query, [idmessage]) as any
        const query2 = `SELECT member.iduser FROM member WHERE member.id = ?`
        let [[{ 'iduser': _iduser }], _data] = await Database.excuteQuery(query2, [idmember]) as any
        if (iduser === Number(_iduser)) {
            const queryChange = `UPDATE message
            SET message.ispin = ?
            WHERE message.idmessage = ?`
            console.log(await Database.excuteQuery(queryChange, [isPin, idmessage]))
        }
        else {
            return false
        }
        return true
    }
    async sendTextMessage(idgroup: number, iduser: number, content: string, tags : Array<number>) {
        // get idmember
        const queryGetIDMem = "SELECT member.id FROM member WHERE member.idgroup = ? AND member.iduser = ? "
        const [[{ 'id': idmember }], data] = await Database.excuteQuery(queryGetIDMem, [idgroup, iduser]) as any;
        let date = new Date();
        const sql = `INSERT INTO message (idmember,content, createat, type, status) VALUES ( ?, ?, ?, ?, ?)`;
        const values = [idmember, content, date, MessageType.TEXT, MessageStatus.DEFAULT]
        const [rows] = await Database.excuteQuery(sql, values) as any

        const queryInsertTags = "INSERT INTO tagged_member VALUES(?,?)"
        for (let index = 0; index < tags.length; index++) {
            const [[{ 'id': idmember2 }], data] = await Database.excuteQuery(queryGetIDMem, [idgroup, tags[index]]) as any;
            await Database.excuteQuery(queryInsertTags,[rows.insertId, idmember2])
        }
        const [dataQuery, inforColumn] = await Database.excuteQuery(
            "SELECT message.* FROM (member INNER JOIN message ON member.id = message.idmember AND member.idgroup = ? AND message.idmessage = ? AND member.id = ?)",
            [idgroup, rows.insertId, idmember]
        ) as any
        return dataQuery[0];
    }
    async getAllMessageFromGroup(idgroup: number, iduser: number, cursor: number, limit: number): Promise<any[]> {
        if (validVariable(limit) && Number.isNaN(cursor)) {
            console.log('a')
            const query = `SELECT * FROM (member INNER JOIN message ON member.id = message.idmember AND member.idgroup = ? ) ORDER BY message.createat DESC limit ?`
            const [dataQuery, inforColumn] = await Database.excuteQuery(
                query, [idgroup, limit]
            )
            return dataQuery as any[];
        }
        else if (validVariable(limit) && validVariable(cursor)) {
            console.log('1a')
            const query = `SELECT * FROM (member INNER JOIN message ON member.id = message.idmember) WHERE member.idgroup = ?  AND message.idmessage < ? ORDER BY message.createat DESC limit ?`
            const [dataQuery, inforColumn] = await Database.excuteQuery(
                query, [idgroup, cursor, limit]
            )
            return dataQuery as any[];
        }
        const query = `
            SELECT * FROM (member INNER JOIN message ON member.id = message.idmember AND member.idgroup = ?)
             ORDER BY message.createat DESC`
        const [dataQuery, inforColumn] = await Database.excuteQuery(
            query, [idgroup]
        )
        return dataQuery as any[];
    }
    async sendGiftMessage(idgroup: number, iduser: number, content: string) {
        // get idmember
        const queryGetIDMem = "SELECT  member.id FROM member WHERE member.idgroup = ? AND member.iduser = ? "
        const [[{ 'id': idmember }], data] = await Database.excuteQuery(queryGetIDMem, [idgroup, iduser]) as any;
        const sql = `INSERT INTO message (idmember,content, createat, type, status) VALUES ( ?, ?, now(), ?, ?)`;
        const values = [idmember, content, MessageType.GIF, MessageStatus.DEFAULT]
        const [rows] = await Database.excuteQuery(sql, values)
        return true;
    }
    async reactMessage(idmessage: number, react: ReactMessage, iduser: number, idgroup: number): Promise<any> {
        const queryGetIDMem = "SELECT  member.id FROM member WHERE member.idgroup = ? AND member.iduser = ? "
        const [[{ 'id': idmember }], column1] = await Database.excuteQuery(queryGetIDMem, [idgroup, iduser]) as any;
        let query = "INSERT INTO reaction(idmessage, type, idmember) VALUE(?,?,?)"
        let [dataInsert] = await Database.excuteQuery(query, [idmessage, react, idmember]) as any
        let qGetEntity = "SELECT * FROM reaction WHERE idreaction = ?"
        let [data, inforColumn2] = await Database.excuteQuery(qGetEntity, [dataInsert.insertId]) as any
        return data[0];
    }
    async changeStatusMessage(idmessage: number, status: MessageStatus): Promise<boolean> {
        const query = 'UPDATE message SET status = ? WHERE message.idmessage = ?'
        await Database.excuteQuery(query, [status, idmessage])
        return true
    }
    async getUrlFile(id: string): Promise<string | null | undefined> {
        return await this.drive.getUrlFile(id);
    }
    async getAllReactFromMessage(idmessage: number): Promise<any[]> {
        let query = "SELECT * FROM reaction WHERE reaction.idmessage = ?"
        let [data, inforColumn] = await Database.excuteQuery(query, [idmessage]) as any
        return data
    }
}