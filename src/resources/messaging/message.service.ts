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
import Message from "./dtos/message.dto";
import TransformMessage from "@/utils/transform/message.transform";
import { ServiceDrive } from "./../../component/cloud/drive.service";
import Reaction from "./dtos/react.dto";
import TransformReaction from "@/utils/transform/reaction.transform";
import { iGroupActions } from "../group/interface/group.service.interface";
import GroupService from "../group/group.service";
import { ListMessageResponseDTO } from "./dtos/list.message.dto";

export default class MessageService implements MessageServiceBehavior {
    private messageRepository: MessageRepositoryBehavior
    constructor() {
        this.messageRepository = new MessageRepository()
    }
    async sendNotitfyMessage(idgroup: number, iduser: number, content: string, manipulates : Array<number>): Promise<Message> {
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
    async reactMessage(idmessage: number, react: ReactMessage, iduser: number, idgroup : number): Promise<Reaction> {
        let memberInfor: MemberInfo = new GroupRepository()
        if (await this.messageRepository.isMessageContainInGroup(idmessage, idgroup)) {
            if(await memberInfor.isContainInGroup(iduser,idgroup)){
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
        return TransformMessage.fromRawsData(await this.messageRepository.sendFileMessage(idgroup, iduser, content), async (id : string) => {
            return await ServiceDrive.gI().getUrlFile(id);
        })
    }
    async sendTextMessage(idgroup: number, iduser: number, content: string){
        let raw = await this.messageRepository.sendTextMessage(idgroup, iduser, content)
        return TransformMessage.fromRawData(raw)
    }
    async getAllMessageFromGroup(idgroup: number, iduser: number, cursor: number, limit: number): Promise<ListMessageResponseDTO> {
        let groupAuthor : iGroupActions = new GroupService();
        if(await groupAuthor.isContainInGroup(iduser, idgroup)){
            let data = await this.messageRepository.getAllMessageFromGroup(idgroup, iduser, cursor, limit)
            let messages = await TransformMessage.fromRawsData(data, async (id : string) => {
                return await ServiceDrive.gI().getUrlFile(id)
            })
            // join data getAllReactFromMessage
            for(let message of messages){
                message.reacts = (await this.messageRepository.getAllReactFromMessage(message.idmessage)).map((value: any, index: number, array: any[]) =>{
                    return TransformReaction.rawToModel(value)
                })
            }
            return ListMessageResponseDTO.rawToData(messages)
        }
        else {
            throw new MyException("Bạn không có quyền truy cập")
        }
    }
}