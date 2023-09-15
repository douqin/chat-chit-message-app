import Message from "@/resources/messaging/dtos/message.dto";
import { MessageType } from "@/resources/messaging/enum/message.type.enum";
import MyException from "../exceptions/my.exception";
import { HttpStatus } from "../extension/httpstatus.exception";

export default class TransformMessage {
    static async fromRawsData(raws: any[], callback: (id: string) => Promise<string | null | undefined>): Promise<Message[]> {
        let arrMessage: Array<Message> = [];
        for (let raw of raws) {
            const { content,
                createat,
                idgroup,
                idmessage,
                iduser,
                replyidmessage,
                status,
                type,
                idmember } = raw
            let value = new Message(
                content,
                createat,
                idgroup,
                idmessage,
                iduser,
                replyidmessage,
                status,
                type,
                idmember
            );
            if (value.type == MessageType.IMAGE || value.type == MessageType.VIDEO) {
                let url = await callback(value.content)
                if (url) {
                    value.content = url
                } else throw new MyException("Lỗi xử lí url ảnh").withExceptionCode(HttpStatus.INTERNAL_SERVER_ERROR)
            }
            arrMessage.push(value)
        }
        return arrMessage
    }
    static async fromRawData(object: any, callback: (id: string) => Promise<string | null | undefined>): Promise<Message> {
        const { content,
            createat,
            idgroup,
            idmessage,
            iduser,
            replyidmessage,
            status,
            type,
            idmember } = object;
        let value = new Message(
            content,
            createat,
            idgroup,
            idmessage,
            iduser,
            replyidmessage,
            status,
            type,
            idmember
        );
        if (value.type == MessageType.IMAGE || value.type == MessageType.VIDEO) {
            let url = await callback(value.content)
            if (url) {
                value.content = url
            } else throw new MyException("Lỗi xử lí url ảnh").withExceptionCode(HttpStatus.INTERNAL_SERVER_ERROR)
        }
        return value
    }
}