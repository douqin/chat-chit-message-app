import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import { PositionInGrop } from "../group/enum/group.position.enum";
import GroupRepository from "../group/group.repository";
import { MemberInfo } from "../group/interface/group.repository.interface";
import { ReactMessage } from "./enum/message.react.enum";
import iMessageServiceBehavior from "./interface/message.service.interface";
import MessageRepository from "./message.repository";
import MyException from "@/utils/exceptions/my.exception";
import { iMessageRepositoryBehavior } from "./interface/message.repository.interface";
import { MessageStatus } from "./enum/message.status.enum";
import Message from "../../models/message.model";
import { CloudDrive } from "../../services/cloud/drive.service";
import Reaction from "./dtos/react.dto";
import { iGroupActions, iInformationMember } from "../group/interface/group.service.interface";
import GroupService from "../group/group.service";
import { dataResponseDTO } from "./dtos/list.message.dto";
import { User } from "../../models/user.model";
import { container, inject, injectable } from "tsyringe";
import { TransformMessage, TransformReaction } from "@/utils/transform";

@injectable()
export default class MessageService implements iMessageServiceBehavior {
    async getAllFileFromGroup(groupId: number, cursor: number, limit: number): Promise<dataResponseDTO> {
        let data = await this.messageRepository.getAllFileFromGroup(groupId, cursor, limit)
        let messages = await TransformMessage.fromRawsData(data, async (id: string) => {
            return await CloudDrive.gI().getUrlFile(id)
        })
        return dataResponseDTO.rawToData(messages)
    }
    async getListPinMessage(userId: number, groupId: number): Promise<Message[]> {
        let memberInfor: iInformationMember = container.resolve(GroupService)
        if (await memberInfor.isUserExistInGroup(userId, groupId)) {
            let data = await this.messageRepository.getListPinMessage(groupId)
            let messages = await TransformMessage.fromRawsData(data, async (id: string) => {
                return await CloudDrive.gI().getUrlFile(id)
            })
            return messages
        }
        else throw new MyException("You don't in group").withExceptionCode(HttpStatus.NOT_FOUND)
    }
    async sendGifMessage(groupId: number, userId: number, content: string, replyMessageId: number | null): Promise<Message> {
        let group: iInformationMember = container.resolve(GroupService)
        let _raw = await this.messageRepository.sendGifMessage(groupId, userId, content, replyMessageId)
        let raw = await this.getOneMessage(_raw)
        return raw
    }
    constructor(@inject(MessageRepository) private messageRepository: iMessageRepositoryBehavior) {
    }
    async forwardMessage(userId: number, groupId: number, messageId: number, groupIdAddressee: number): Promise<Message> {
        let groupAuthor: iInformationMember = container.resolve(GroupService)
        if (await groupAuthor.isUserExistInGroup(userId, groupIdAddressee) && await groupAuthor.isUserExistInGroup(userId, groupId) && await this.isMessageContainInGroup(messageId, groupId)) {
            let message = await this.getOneMessage(messageId)
            if (message) {
                if (message.status == MessageStatus.DEL_BY_OWNER || message.status == MessageStatus.DEL_BY_ADMIN) {
                    throw new MyException("Message not found").withExceptionCode(HttpStatus.NOT_FOUND)
                }
                else if (message.manipulates.length > 0) {
                    throw new MyException("Message not found").withExceptionCode(HttpStatus.NOT_FOUND)
                }
                let newMessageId = await this.messageRepository.forwardMessage(userId, groupIdAddressee, message)
                return await this.getOneMessage(newMessageId)
            }
            else throw new MyException("Message not found").withExceptionCode(HttpStatus.NOT_FOUND)
        }
        else throw new MyException("You don't have permisson for action").withExceptionCode(HttpStatus.FORBIDDEN)
    }
    async isMessageContainInGroup(messageId: Number, groupId: Number): Promise<boolean> {
        return await this.messageRepository.isMessageContainInGroup(messageId, groupId)
    }
    async changeStatusMessage(messageId: number, status: MessageStatus): Promise<boolean> {
        return await this.messageRepository.changeStatusMessage(messageId, status);
    }
    async isMessageOfUser(messageId: Number, userId: Number): Promise<boolean> {
        return await this.messageRepository.isMessageOfUser(messageId, userId)
    }
    async getOneMessage(messageId: number): Promise<Message> {
        let message = await TransformMessage.fromRawData(await this.messageRepository.getOneMessage(messageId), async (id: string) => {
            return await CloudDrive.gI().getUrlFile(id)
        })
        message.reacts = await this.getAllReactFromMessage(message.messageId)
        message.manipulates = await this.getAllManipulateUser(message.messageId)
        return message;
    }
    async getAllManipulateUser(messageId: number): Promise<number[]> {
        return await this.messageRepository.getAllManipulateUser(messageId);
    }
    async getAllReactFromMessage(messageId: number): Promise<any[]> {
        return (await this.messageRepository.getAllReactFromMessage(messageId)).map((value: any, index: number, array: any[]) => {
            return TransformReaction.rawToModel(value)
        })
    }
    async getNumMessageUnread(groupId: number, userId: number): Promise<number> {
        return await this.messageRepository.getNumMessageUnread(groupId, userId);
    }
    async getLastMessage(groupId: number): Promise<Message> {
        let data = await this.messageRepository.getMessagesFromGroup(groupId, -1, 1)
        return await TransformMessage.fromRawData(data[0], async (id: string) => {
            return await CloudDrive.gI().getUrlFile(id)
        })
    }
    async sendNotitfyMessage(groupId: number, userId: number, content: string, manipulates: Array<number>): Promise<Message> {
        let regex2 = /\{\{@\}\}/g;
        let matches = content.match(regex2);
        let count = matches ? matches.length : 0; // Số lần xuất hiện của chuỗi `{{@}}`
        if (count != manipulates.length) throw new MyException("Wrong argument").withExceptionCode(HttpStatus.BAD_REQUEST)
        return this.messageRepository.sendNotitfyMessage(groupId, userId, content, manipulates)
    }
    async removeCall(userId: number, groupId: number, idmessgae: number): Promise<number> {
        let memberInfor: iInformationMember = container.resolve(GroupService)
        if (await this.messageRepository.isMessageContainInGroup(idmessgae, groupId)) {
            if (await this.isMessageOfUser(idmessgae, userId)) {
                await this.changeStatusMessage(idmessgae, MessageStatus.DEL_BY_OWNER)
                return MessageStatus.DEL_BY_OWNER;
            }
            else if (await memberInfor.getPosition(groupId, userId) == PositionInGrop.CREATOR || PositionInGrop.ADMIN) {
                await this.changeStatusMessage(idmessgae, MessageStatus.DEL_BY_ADMIN)
                return MessageStatus.DEL_BY_ADMIN;
            }
        }
        throw new MyException("You don't have permisson for action").withExceptionCode(HttpStatus.FORBIDDEN)
    }
    async changePinMessage(groupId: number, messageId: number, userId: number, isPin: boolean): Promise<boolean> {
        let memberInfor: iInformationMember = container.resolve(GroupService)
        if (isPin) {
            const messages = await this.getListPinMessage(userId, groupId)
            if (messages.length >= 5) {
                throw new MyException("You can't pin more than 5 messages").withExceptionCode(HttpStatus.BAD_REQUEST)
            }
        }
        if (await memberInfor.getPosition(groupId, userId) == PositionInGrop.CREATOR || PositionInGrop.ADMIN) {
            return await this.messageRepository.changePinMessage(messageId, userId, isPin ? 1 : 0)
        }
        else throw new MyException("You don't have permisson for action").withExceptionCode(HttpStatus.FORBIDDEN)
    }
    async reactMessage(messageId: number, react: ReactMessage, userId: number, groupId: number): Promise<Reaction> {
        let memberInfor: iInformationMember = container.resolve(GroupService)
        if (await this.messageRepository.isMessageContainInGroup(messageId, groupId)) {
            if (await memberInfor.isUserExistInGroup(userId, groupId)) {
                return TransformReaction.rawToModel(
                    await this.messageRepository.reactMessage(messageId, react, userId, groupId)
                )
            }
        }
        throw new MyException("You don't have permisson for action").withExceptionCode(HttpStatus.FORBIDDEN)
    }
    async sendFileMessage(groupId: number, userId: number, content: any) {
        for (let i = 0; i < content.length; i++) {
            if (!content[i].mimetype.includes('image') && !content[i].mimetype.includes('video')) {
                throw new MyException("File không hợp lệ")
            }
        }
        return TransformMessage.fromRawsData(await this.messageRepository.sendFileMessage(groupId, userId, content), async (id: string) => {
            return await CloudDrive.gI().getUrlFile(id);
        })
    }
    async sendTextMessage(groupId: number, userId: number, content: string, manipulates: Array<number>, replyMessageId: number | null) {
        let group: iInformationMember = container.resolve(GroupService)
        for (let tag of manipulates) {
            if (!await group.isUserExistInGroup(tag, groupId)) {
                throw new MyException("Wrong argument").withExceptionCode(HttpStatus.BAD_REQUEST)
            }
        }
        let regex2 = /\{\{@\}\}/g;
        let matches = content.match(regex2);
        let count = matches ? matches.length : 0; // Số lần xuất hiện của chuỗi `{{@}}`
        if (count < manipulates.length) throw new MyException("Wrong argument").withExceptionCode(HttpStatus.BAD_REQUEST)
        let _raw = await this.messageRepository.sendTextMessage(groupId, userId, content, manipulates, replyMessageId)
        let raw = await this.getOneMessage(_raw)
        return raw
    }
    //FIXME: edit logic bigO
    async getAllMessageFromGroup(groupId: number, userId: number, cursor: number, limit: number): Promise<dataResponseDTO> {
        let groupAuthor: iInformationMember = container.resolve(GroupService)
        if (await groupAuthor.isUserExistInGroup(userId, groupId)) {
            let data = await this.messageRepository.getMessagesFromGroup(groupId, cursor, limit)
            let messages = await TransformMessage.fromRawsData(data, async (id: string) => {
                return await CloudDrive.gI().getUrlFile(id)
            })
            for (let message of messages) {
                message.reacts = await this.getAllReactFromMessage(message.messageId)
                message.manipulates = await this.getAllManipulateUser(message.messageId)
            }
            return dataResponseDTO.rawToData(messages)
        }
        else {
            throw new MyException("Bạn không có quyền truy cập")
        }
    }
}