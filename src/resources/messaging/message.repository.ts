import { MySql } from "@/config/sql/mysql";
import MyException from "@/utils/exceptions/my.exception";
import { iDrive } from "../../component/cloud/drive.interface";
import { ServiceDrive } from "../../component/cloud/drive.service";
import { ReactMessage } from "./enum/message.react.enum";
import { MessageRepositoryBehavior } from "./interface/message.repository.interface";
import { MessageType } from "./enum/message.type.enum";
import { MessageStatus } from "./enum/message.status.enum";

export default class MessageRepository implements MessageRepositoryBehavior {

    public drive: iDrive
    constructor() {
        this.drive = ServiceDrive.gI();
    }
    async isMessageOfUser(idmessage: Number, iduser: Number): Promise<boolean> {
        const quert = 'SELECT COUNT(*) From member JOIN message ON member.id = message.idmember AND message.idmessage = ? AND member.iduser = ?        '
        const [{ 'COUNT(*)': isExist }] = await MySql.excuteQuery(quert,[idmessage,iduser]) as any
        return Boolean(isExist)
    }
    async updateLastView(iduser: number, idmessgae: number): Promise<boolean> {
        return true
    }
    async isMessageContainInGroup(idmessage: Number, idgroup: Number): Promise<boolean> {
        const query = 'SELECT COUNT(*) From member JOIN message ON member.id = message.idmember AND message.idmessage = ? AND member.idgroup = ?'
        let [{ 'COUNT(*)': isExist }] = await MySql.excuteQuery(query, [idmessage, idgroup]) as any
        return Boolean(isExist);
    }
    async changePinMessage(idmessage: number, iduser: number, isPin: number): Promise<boolean> {
        const query = ` SELECT message.idmember FROM message WHERE message.idmessage = ? LIMIT 1`
        let [[{ 'idmember': idmember }], data] = await MySql.excuteQuery(query, [idmessage]) as any
        const query2 = `SELECT member.iduser FROM member WHERE member.id = ?`
        let [[{ 'iduser': _iduser }], _data] = await MySql.excuteQuery(query2, [idmember]) as any
        if (iduser === Number(_iduser)) {
            const queryChange = `UPDATE message
            SET message.ispin = ?
            WHERE message.idmessage = ?`
            console.log(await MySql.excuteQuery(queryChange, [isPin, idmessage]))
        }
        else {
            return false
        }
        return true
    }
    async sendTextMessage(idgroup: number, iduser: number, content: string) {
        // get idmember
        const queryGetIDMem = "SELECT  member.id FROM member WHERE member.idgroup = ? AND member.iduser = ? "
        const [[{ 'id': idmember }], data] = await MySql.excuteQuery(queryGetIDMem, [idgroup, iduser]) as any;
        const sql = `INSERT INTO message (idmember,content, createat, type, status) VALUES ( ?, ?, now(), ?, ?)`;
        const values = [idmember, content, MessageType.TEXT, MessageStatus.DEFAULT]
        const [rows] = await MySql.excuteQuery(sql, values)
        return true;
    }
    async getAllMessageFromGroup(idgroup: number, iduser: number): Promise<object[] | undefined> {
        const queryGetIDMem = "SELECT  member.id FROM member WHERE member.idgroup = ? AND member.iduser = ? "
        const [[{ 'id': idmember }], data] = await MySql.excuteQuery(queryGetIDMem, [idgroup, iduser]) as any;
        if (idmember) {
            const query = `
            SELECT message.idmessage, message.content, message.createat,message.type, message.replyidmessage, message.ispin, member.iduser FROM (member INNER JOIN message ON member.id = message.idmember AND member.idgroup = ?)
            `
            const [dataQuery, inforColumn] = await MySql.excuteQuery(
                query, [idgroup]
            )
            return dataQuery as object[];
        } else {
            throw new MyException("Bạn không có quyền truy cập")
        }
    }
    async sendFileMessage(idgroup: number, iduser: number, content: Express.Multer.File[], typeFile: MessageType = MessageType.IMAGE): Promise<Array<string>> {
        const query = 'SELECT groupchat.id_folder FROM groupchat WHERE groupchat.idgroup = ? LIMIT 1'
        let [[{ 'id_folder': id_folder }], column] = await MySql.excuteQuery(query, [idgroup]) as any
        let arrUrlFile: Array<string> = []
        for (let i = 0; i < content.length; i++) {
            try {
                let inforFile = await this.drive.uploadFile(content[i].filename, content[i].buffer)
                const queryGetIDMem = "SELECT  member.id FROM member WHERE member.idgroup = ? AND member.iduser = ? "
                const [[{ 'id': idmember }], column1] = await MySql.excuteQuery(queryGetIDMem, [idgroup, iduser]) as any;
                const querySaveId = `INSERT INTO message (idmember,content, createat, type, status) VALUES ( ?, ?, now(), ?, ?)`
                if (inforFile) {
                    let [data, column2] = await MySql.excuteQuery(querySaveId, [idmember, inforFile?.id, (content[i].mimetype.includes("image")) ? MessageType.IMAGE : MessageType.VIDEO, MessageStatus.DEFAULT]) as any
                    arrUrlFile.push(inforFile.url)
                }
            }
            catch (e) {
                console.log(e)
            }
        }
        return arrUrlFile;
    }
    async sendGiftMessage(idgroup: number, iduser: number, content: string) {
        // get idmember
        const queryGetIDMem = "SELECT  member.id FROM member WHERE member.idgroup = ? AND member.iduser = ? "
        const [[{ 'id': idmember }], data] = await MySql.excuteQuery(queryGetIDMem, [idgroup, iduser]) as any;
        const sql = `INSERT INTO message (idmember,content, createat, type, status) VALUES ( ?, ?, now(), ?, ?)`;
        const values = [idmember, content, MessageType.GIF, MessageStatus.DEFAULT]
        const [rows] = await MySql.excuteQuery(sql, values)
        return true;
    }
    async reactMessage(idmessage: number, react: ReactMessage, iduser: number): Promise<any> {
        return true;
    }
    async changeStatusMessage(idmessage: number, status: MessageStatus): Promise<boolean> {
        const query = 'UPDATE message SET status = ? WHERE messgae.idmessgae = ?'
        await MySql.excuteQuery(query, [status, idmessage])
        return true
    }
}