import { ListMessageResponseDTO } from "../dtos/list.message.dto";
import Message from "../../../models/message.model";
import Reaction from "../dtos/react.dto";
import { ReactMessage } from "../enum/message.react.enum";

export default interface iMessageServiceBehavior extends iMessageAction, iMessageInformation{

}

export interface iMessageAction {
    updateLastView(iduser: number, idmessgae: number): Promise<boolean>;
    sendFileMessage(idgroup: number, iduser: number, content: {
        [fieldname: string]: Express.Multer.File[];
    } | Express.Multer.File[] | undefined): Promise<Message[]>
    sendTextMessage(idgroup: number, iduser: number, content: string, tags : Array<number>): Promise<Message>
    sendNotitfyMessage(idgroup: number, iduser: number, content: string, manipulates : Array<number>): Promise<Message>
    reactMessage(idmessage: number, react: ReactMessage, iduser: number, idgroup: Number): Promise<Reaction>
    removeMessage(iduser: number, idgroup: number, idmessgae: number): Promise<boolean>
    changePinMessage(idmessage: number, iduser: number, isPin: number): Promise<boolean>
    getLastMessage(idgroup : number) : Promise<Message>
    getNumMessageUnread(idgroup : number, iduser : number) : Promise<number>
}
export interface iMessageInformation{
    getAllMessageFromGroup(idgroup: number, iduser: number, cursor: number, limit: number): Promise<ListMessageResponseDTO>
    getAllTagFromMessage(idmessage: number): Promise<any[]>
    getAllReactFromMessage(idmessage: number): Promise<any[]>
    getAllManipulateUser(idmessage: number): Promise<any[]>
    getOneMessage(idmessage: number): Promise<Message>
}