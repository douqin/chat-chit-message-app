import { ReactMessage } from "../enum/message.react.enum";
import { MessageStatus } from "../enum/message.status.enum";

export interface MessageRepositoryBehavior extends MessageInformation, MessageAction {
    updateLastView(iduser: number, idmessgae: number): boolean | PromiseLike<boolean>;
    changePinMessage(idmessage: number, iduser: number, isPin: number): boolean | PromiseLike<boolean>;
    reactMessage(idmessage: number, react: ReactMessage, iduser: number, idgroup : number): boolean | PromiseLike<any>;
    sendFileMessage(idgroup: number, iduser: number, content: any): string[] | PromiseLike<any[]>;
    sendTextMessage(idgroup: number, iduser: number, content: string): boolean | PromiseLike<object>;
    getAllMessageFromGroup(idgroup: number, iduser: number):  Promise<any[]>;
    getAllReactFromMessage(idmessage: number): Promise<any[]>
}
export interface MessageInformation {
    isMessageContainInGroup(idmessage: Number, idgroup: Number): Promise<boolean>
    isMessageOfUser(idmessage: Number, iduser: Number): Promise<boolean>
}
export interface MessageAction {
    changeStatusMessage(idmessage: number, status : MessageStatus): Promise<boolean>
    sendGiftMessage(idgroup: number, iduser: number, content: string): Promise<boolean>
}