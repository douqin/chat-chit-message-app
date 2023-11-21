import { ListMessageResponseDTO } from "../dtos/list.message.dto";
import Message from "../dtos/message.dto";
import Reaction from "../dtos/react.dto";
import { ReactMessage } from "../enum/message.react.enum";

export default interface MessageServiceBehavior extends MessageAction{
    updateLastView(iduser: number, idmessgae: number): Promise<boolean>;
    getAllMessageFromGroup(idgroup: number, iduser: number, cursor: number, limit: number): Promise<ListMessageResponseDTO>
}
export interface MessageAction {
    sendFileMessage(idgroup: number, iduser: number, content: {
        [fieldname: string]: Express.Multer.File[];
    } | Express.Multer.File[] | undefined): Promise<Message[]>
    sendTextMessage(idgroup: number, iduser: number, content: string): Promise<Message>
    sendNotitfyMessage(idgroup: number, iduser: number, content: string, manipulates : Array<number>): Promise<Message>
    reactMessage(idmessage: number, react: ReactMessage, iduser: number, idgroup: Number): Promise<Reaction>
    removeMessage(iduser: number, idgroup: number, idmessgae: number): Promise<boolean>
    changePinMessage(idmessage: number, iduser: number, isPin: number): Promise<boolean>
}