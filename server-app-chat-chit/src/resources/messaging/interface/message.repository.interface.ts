import Message from "@/models/message.model";
import { ReactMessage } from "../enum/message.react.enum";
import { MessageStatus } from "../enum/message.status.enum";

export interface iMessageRepositoryBehavior extends iMessageInformation, iMessageAction {
    getAllFileFromGroup(groupId: number, cursor: number, limit: number): Promise<any[]>;
    getListPinMessage(groupId: number): Promise<any[]>;
    getOneMessage(messageId: number): any;
    getAllManipulateUser(messageId: number): Promise<any[]>;
    getAllMessageFromGroup(idgroup: number, cursor: number, limit: number): Promise<any[]>;
    getAllReactFromMessage(messageId: number): Promise<any[]>
}
export interface iMessageInformation {
    isMessageContainInGroup(messageId: Number, idgroup: Number): Promise<boolean>
    isMessageOfUser(messageId: Number, iduser: Number): Promise<boolean>
}
export interface iMessageAction {
    sendGifMessage(groupId: number, iduser: number, gifId: string, replyMessageId: number | null): Promise<number>
    forwardMessage(userId: number, groupId: number, message: Message): Promise<number>
    sendNotitfyMessage(idgroup: number, iduser: number, content: string, manipulates: Array<number>): Promise<any>
    changeStatusMessage(messageId: number, status: MessageStatus): Promise<boolean>
    sendGiftMessage(idgroup: number, iduser: number, content: string): Promise<boolean>
    sendFileMessage(idgroup: number, iduser: number, content: any): string[] | PromiseLike<any[]>;
    sendTextMessage(idgroup: number, iduser: number, content: string, tag: Array<Number>, replyMessageId: number | null): Promise<number>
    changePinMessage(messageId: number, iduser: number, isPin: number): boolean | PromiseLike<boolean>;
    reactMessage(messageId: number, react: ReactMessage, iduser: number, idgroup: number): boolean | PromiseLike<any>;
    getNumMessageUnread(idgroup: number, iduser: number): Promise<number>
}