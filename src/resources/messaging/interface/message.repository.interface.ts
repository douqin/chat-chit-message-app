import { ReactMessage } from "../enum/message.react.enum";
import { MessageStatus } from "../enum/message.status.enum";

export interface MessageRepositoryBehavior extends MessageInformation, MessageAction {
    getAllTagFromMessage(idmessage: number): Promise<any[]>
    getAllMessageFromGroup(idgroup: number, iduser: number, cursor: number, limit: number):  Promise<any[]>;
    getAllReactFromMessage(idmessage: number): Promise<any[]>
}
export interface MessageInformation {
    isMessageContainInGroup(idmessage: Number, idgroup: Number): Promise<boolean>
    isMessageOfUser(idmessage: Number, iduser: Number): Promise<boolean>
}
export interface MessageAction {
    sendNotitfyMessage(idgroup: number, iduser: number, content: string, manipulates : Array<number>): Promise<any>
    changeStatusMessage(idmessage: number, status : MessageStatus): Promise<boolean>
    sendGiftMessage(idgroup: number, iduser: number, content: string): Promise<boolean>
    sendFileMessage(idgroup: number, iduser: number, content: any): string[] | PromiseLike<any[]>;
    sendTextMessage(idgroup: number, iduser: number, content: string, tag : Array<Number>): boolean | PromiseLike<object>;
    updateLastView(iduser: number, idmessgae: number): boolean | PromiseLike<boolean>;
    changePinMessage(idmessage: number, iduser: number, isPin: number): boolean | PromiseLike<boolean>;
    reactMessage(idmessage: number, react: ReactMessage, iduser: number, idgroup : number): boolean | PromiseLike<any>;
}