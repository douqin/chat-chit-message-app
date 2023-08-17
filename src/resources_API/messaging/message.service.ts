import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import { PositionInGrop } from "../group/enum/group.position.enum";
import GroupRepository from "../group/group.repository";
import { MemberInfo } from "../group/interface/group.repository.interface";
import { ReactMessage } from "./enum/message.react.enum";
import MessageServiceBehavior from "./interface/message.service.interaface";
import MessageRepository from "./message.repository";
import MyException from "@/utils/exceptions/my.exception";
import { MessageRepositoryBehavior } from "./interface/message.repository.interface";
import { MessageStatus } from "./enum/message.status.enum";

export default class MessageService implements MessageServiceBehavior {
    private messageRepository: MessageRepositoryBehavior
    constructor() {
        this.messageRepository = new MessageRepository()
    }
    async updateLastView(iduser: number, idmessgae: number): Promise<boolean> {
        return await this.messageRepository.updateLastView(iduser, idmessgae)
    }
    async removeMessage(iduser: number, idgroup: number, idmessgae: number): Promise<boolean> {
        let memberInfor: MemberInfo = new GroupRepository()
        if (await this.messageRepository.isMessageContainInGroup(idmessgae, idgroup)) {
            if (await this.messageRepository.isMessageOfUser(idmessgae, iduser)) {
                return await this.messageRepository.changeStatusMessage(idmessgae, MessageStatus.DEL_BY_OWNER)
            }
            else if (await memberInfor.getPosition(idgroup, iduser) == PositionInGrop.CREATOR || PositionInGrop.ADMIN)
                return await this.messageRepository.changeStatusMessage(idmessgae, MessageStatus.DEL_BY_ADMIN)

        }
        throw new MyException("Bạn không có quyền này").withExceptionCode(HttpStatus.FORBIDDEN)
    }
    async changePinMessage(idmessage: number, iduser: number, isPin: number): Promise<boolean> {
        if (0 === isPin || isPin === 1) {
            return await this.messageRepository.changePinMessage(idmessage, iduser, isPin)
        }
        else throw new MyException("Tham số không hợp lệ")
    }
    async reactMessage(idmessage: number, react: ReactMessage, iduser: number): Promise<boolean> {
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
    async getAllMessageFromGroup(idgroup: number, iduser: number): Promise<object[] | undefined> {
        return await this.messageRepository.getAllMessageFromGroup(idgroup, iduser)
    }
}