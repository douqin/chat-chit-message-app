import Message from "@/models/message.model";
import { ReactMessage } from "../enum/message.react.enum";
import { MessageStatus } from "../enum/message.status.enum";

export interface iMessageRepositoryBehavior extends iMessageInformation, iMessageAction {
    getAllFileFromGroup(groupId: number, cursor: number, limit: number): Promise<any[]>;
    getListPinMessage(groupId: number): Promise<any[]>;
    getOneMessage(messageId: number): any;
    getAllManipulateUser(messageId: number): Promise<any[]>;
    getMessagesFromGroup(groupId: number, cursor: number, limit: number): Promise<any[]>;
    getAllReactFromMessage(messageId: number): Promise<any[]>
}
export interface iMessageInformation {
    isMessageContainInGroup(messageId: Number, groupId: Number): Promise<boolean>
    isMessageOfUser(messageId: Number, userId: Number): Promise<boolean>
}
export interface iMessageAction {
    sendGifMessage(groupId: number, userId: number, gifId: string, replyMessageId: number | null): Promise<number>
    forwardMessage(userId: number, groupId: number, message: Message): Promise<number>
    sendNotitfyMessage(groupId: number, userId: number, content: string, manipulates: Array<number>): Promise<any>
    changeStatusMessage(messageId: number, status: MessageStatus): Promise<boolean>
    sendGiftMessage(groupId: number, userId: number, content: string): Promise<boolean>
    sendFileMessage(groupId: number, userId: number, content: any): string[] | PromiseLike<any[]>;
    sendTextMessage(groupId: number, userId: number, content: string, tag: Array<Number>, replyMessageId: number | null): Promise<number>
    changePinMessage(messageId: number, userId: number, isPin: number): boolean | PromiseLike<boolean>;
    reactMessage(messageId: number, react: ReactMessage, userId: number, groupId: number): boolean | PromiseLike<any>;
    getNumMessageUnread(groupId: number, userId: number): Promise<number>
}