import { ListMessageResponseDTO } from "../dtos/list.message.dto";
import Message from "../../../models/message.model";
import Reaction from "../dtos/react.dto";
import { ReactMessage } from "../enum/message.react.enum";
import { MessageStatus } from "../enum/message.status.enum";

export default interface iMessageServiceBehavior extends iMessageAction, iMessageInformation {

}

export interface iMessageAction {
    getAllFileFromGroup(groupId: number, cursor: number, limit: number) : Promise<ListMessageResponseDTO>
    getListPinMessage(userId: number, groupId: number): Promise<Message[]>
    sendGifMessage(groupId: number, iduser: number, gifId: string, replyMessageId: number): Promise<Message>
    forwardMessage(userId: number, groupId: number, messageId: number, groupIdAddressee : number): Promise<Message>
    changeStatusMessage(idmessage: number, status: MessageStatus): Promise<boolean>
    sendFileMessage(idgroup: number, iduser: number, content: {
        [fieldname: string]: Express.Multer.File[];
    } | Express.Multer.File[] | undefined): Promise<Message[]>
    sendTextMessage(idgroup: number, iduser: number, content: string, tag: Array<Number>, replyMessageId: number | null): Promise<Message>
    sendNotitfyMessage(idgroup: number, iduser: number, content: string, manipulates: Array<number>): Promise<Message>
    reactMessage(idmessage: number, react: ReactMessage, iduser: number, idgroup: Number): Promise<Reaction>
    removeCall(iduser: number, idgroup: number, messageId: number): Promise<number>
    changePinMessage(groupId: number, idmessage: number, iduser: number, isPin: boolean): Promise<boolean>
    getLastMessage(idgroup: number): Promise<Message>
    getNumMessageUnread(idgroup: number, iduser: number): Promise<number>
}
export interface iMessageInformation {
    isMessageContainInGroup(idmessage: Number, idgroup: Number): Promise<boolean>
    isMessageOfUser(idmessage: Number, iduser: Number): Promise<boolean>
    getAllMessageFromGroup(idgroup: number, iduser: number, cursor: number, limit: number): Promise<ListMessageResponseDTO>
    getAllReactFromMessage(idmessage: number): Promise<any[]>
    getAllManipulateUser(idmessage: number): Promise<number[]>
    getOneMessage(idmessage: number): Promise<Message>
}