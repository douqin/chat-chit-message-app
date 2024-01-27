import { dataResponseDTO } from "../dtos/list.message.dto";
import Message from "../../../models/message.model";
import Reaction from "../dtos/react.dto";
import { ReactMessage } from "../enum/message.react.enum";
import { MessageStatus } from "../enum/message.status.enum";

export default interface iMessageServiceBehavior extends iMessageAction, iMessageInformation {

}

export interface iMessageAction {
    getAllFileFromGroup(groupId: number, cursor: number, limit: number) : Promise<dataResponseDTO>
    getListPinMessage(userId: number, groupId: number): Promise<Message[]>
    sendGifMessage(groupId: number, userId: number, gifId: string, replyMessageId: number): Promise<Message>
    forwardMessage(userId: number, groupId: number, messageId: number, groupIdAddressee : number): Promise<Message>
    changeStatusMessage(messageId: number, status: MessageStatus): Promise<boolean>
    sendFileMessage(groupId: number, userId: number, content: {
        [fieldname: string]: Express.Multer.File[];
    } | Express.Multer.File[] | undefined): Promise<Message[]>
    sendTextMessage(groupId: number, userId: number, content: string, tag: Array<Number>, replyMessageId: number | null): Promise<Message>
    sendNotitfyMessage(groupId: number, userId: number, content: string, manipulates: Array<number>): Promise<Message>
    reactMessage(messageId: number, react: ReactMessage, userId: number, groupId: Number): Promise<Reaction>
    removeCall(userId: number, groupId: number, messageId: number): Promise<number>
    changePinMessage(groupId: number, messageId: number, userId: number, isPin: boolean): Promise<boolean>
    getLastMessage(groupId: number): Promise<Message>
    getNumMessageUnread(groupId: number, userId: number): Promise<number>
}
export interface iMessageInformation {
    isMessageContainInGroup(messageId: Number, groupId: Number): Promise<boolean>
    isMessageOfUser(messageId: Number, userId: Number): Promise<boolean>
    getAllMessageFromGroup(groupId: number, userId: number, cursor: number, limit: number): Promise<dataResponseDTO>
    getAllReactFromMessage(messageId: number): Promise<any[]>
    getAllManipulateUser(messageId: number): Promise<number[]>
    getOneMessage(messageId: number): Promise<Message>
}