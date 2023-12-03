import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import { PositionInGrop } from "../group/enum/group.position.enum";
import GroupRepository from "../group/group.repository";
import { MemberInfo } from "../group/interface/group.repository.interface";
import { ReactMessage } from "./enum/message.react.enum";
import iMessageServiceBehavior from "./interface/message.service.interaface";
import MessageRepository from "./message.repository";
import MyException from "@/utils/exceptions/my.exception";
import { iMessageRepositoryBehavior } from "./interface/message.repository.interface";
import { MessageStatus } from "./enum/message.status.enum";
import Message from "./dtos/message.dto";
import TransformMessage from "@/utils/transform/message.transform";
import { ServiceDrive } from "./../../component/cloud/drive.service";
import Reaction from "./dtos/react.dto";
import TransformReaction from "@/utils/transform/reaction.transform";
import { iGroupActions, iInformationMember } from "../group/interface/group.service.interface";
import GroupService from "../group/group.service";
import { ListMessageResponseDTO } from "./dtos/list.message.dto";
import { User } from "../../models/user.model";

export default class MessageService implements iMessageServiceBehavior {
    private messageRepository: iMessageRepositoryBehavior
    constructor() {
        this.messageRepository = new MessageRepository()
    }
    async getAllTagFromMessage(idmessage: number): Promise<any[]> {
        return (await this.messageRepository.getAllTagFromMessage(idmessage)).map((value: any, index: number, array: any[]) => {
            return User.fromRawData(value)
        })
    }
    async getAllReactFromMessage(idmessage: number): Promise<any[]> {
        return (await this.messageRepository.getAllReactFromMessage(idmessage)).map((value: any, index: number, array: any[]) => {
            return TransformReaction.rawToModel(value)
        })
    }
    async getNumMessageUnread(idgroup: number, iduser : number): Promise<number> {
        return await this.messageRepository.getNumMessageUnread(idgroup, iduser);
    }
    async getLastMessage(idgroup: number): Promise<Message> {
        let data = await this.messageRepository.getAllMessageFromGroup(idgroup, NaN, 1)
        return await TransformMessage.fromRawData(data[0], async (id: string) => {
            return await ServiceDrive.gI().getUrlFile(id)
        })
    }
    async sendNotitfyMessage(idgroup: number, iduser: number, content: string, manipulates: Array<number>): Promise<Message> {
        return this.messageRepository.sendNotitfyMessage(idgroup, iduser, content, manipulates)
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
    async reactMessage(idmessage: number, react: ReactMessage, iduser: number, idgroup: number): Promise<Reaction> {
        let memberInfor: MemberInfo = new GroupRepository()
        if (await this.messageRepository.isMessageContainInGroup(idmessage, idgroup)) {
            if (await memberInfor.isContainInGroup(iduser, idgroup)) {
                return TransformReaction.rawToModel(
                    await this.messageRepository.reactMessage(idmessage, react, iduser, idgroup)
                )
            }
        }
        throw new MyException("User không có quyền này").withExceptionCode(HttpStatus.FORBIDDEN)
    }
    async sendFileMessage(idgroup: number, iduser: number, content: any) {
        for (let i = 0; i < content.length; i++) {
            if (!content[i].mimetype.includes('image') && !content[i].mimetype.includes('video')) {
                throw new MyException("File không hợp lệ")
            }
        }
        return TransformMessage.fromRawsData(await this.messageRepository.sendFileMessage(idgroup, iduser, content), async (id: string) => {
            return await ServiceDrive.gI().getUrlFile(id);
        })
    }
    async sendTextMessage(idgroup: number, iduser: number, content: string, tags: Array<number>) {
        let group: iInformationMember = new GroupService()
        for (let tag of tags) {
            if (!await group.isContainInGroup(tag, idgroup)) {
                throw new MyException("Wrong argument").withExceptionCode(HttpStatus.BAD_REQUEST)
            }
        }
        let raw = await this.messageRepository.sendTextMessage(idgroup, iduser, content, tags)
        return TransformMessage.fromRawData(raw)
    }
    async getAllMessageFromGroup(idgroup: number, iduser: number, cursor: number, limit: number): Promise<ListMessageResponseDTO> {
        let groupAuthor: iInformationMember = new GroupService();
        if (await groupAuthor.isContainInGroup(iduser, idgroup)) {
            let data = await this.messageRepository.getAllMessageFromGroup(idgroup, cursor, limit)
            let messages = await TransformMessage.fromRawsData(data, async (id: string) => {
                return await ServiceDrive.gI().getUrlFile(id)
            })
            for (let message of messages) {
                message.reacts = await this.getAllReactFromMessage(message.idmessage)
                message.tags =  await this.getAllTagFromMessage(message.idmessage)
            }
            return ListMessageResponseDTO.rawToData(messages)
        }
        else {
            throw new MyException("Bạn không có quyền truy cập")
        }
    }
}