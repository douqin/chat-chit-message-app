import { ReactMessage } from "./dtos/message.react";
import MessageBehavior from "./interface/message.interaface";
import MessageRepository from "./message.repository";
import MyException from "@/utils/exceptions/my.exception";

export default class MessageService implements MessageBehavior {
    private messageRepository: MessageRepository
    constructor() {
        this.messageRepository = new MessageRepository()
    }
    async changePinMessage(idmessage: number, iduser: number, isPin: number): Promise<boolean> {
        if (0 === isPin || isPin === 1) {
            return await this.messageRepository.changePinMessage(idmessage, iduser, isPin)
        }
        else throw new MyException("Tham số không hợp lệ")
    }
    async changeStatusMessage(idmessage: number, iduser: number): Promise<boolean> {
        console.log("🚀 ~ file: message.service.ts:15 ~ MessageService ~ changeStatusMessage ~ idmessage:", idmessage)
        return await this.messageRepository.changeStatusMessage(
            idmessage, iduser
        )
    }
    async reactMessage(idmessage: number, react: ReactMessage, iduser: number): Promise<any> {
        return await this.messageRepository.reactMessage(idmessage, react, iduser)
    }
    async sendFileMessage(idgroup: number, iduser: number, content: any): Promise<Array<string>> {
        for (let i = 0; i < content.length; i++) {
            if (!content[i].mimetype.includes('image') && !content[i].mimetype.includes('video')) {
                throw new MyException("File không hợp lệ")
            }
        }
        return await this.messageRepository.sendFileMessage(idgroup, iduser, content)
    }
    async sendTextMessage(idgroup: number, iduser: number, content: string): Promise<boolean> {
        return await this.messageRepository.sendTextMessage(idgroup, iduser, content);
    }
    async getAllMessageFromGroup(idgroup: number, iduser: number): Promise<any> {
        return await this.messageRepository.getAllMessageFromGroup(idgroup, iduser)
    }
}