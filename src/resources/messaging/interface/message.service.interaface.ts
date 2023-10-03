import Message from "../dtos/message.dto";
import Reaction from "../dtos/react.dto";
import { ReactMessage } from "../enum/message.react.enum";

export default interface MessageServiceBehavior {
    updateLastView(iduser: number, idmessgae: number): Promise<boolean>;
    removeMessage(iduser: number, idgroup: number, idmessgae: number): Promise<boolean>
    changePinMessage(idmessage: number, iduser: number, isPin : number): Promise<boolean>
    getAllMessageFromGroup(idgroup: number, iduser: number): Promise<any>
    sendFileMessage(idgroup: number, iduser: number, content: {
        [fieldname: string]: Express.Multer.File[];
    } | Express.Multer.File[] | undefined): Promise<Message[]>
    sendTextMessage(idgroup: number, iduser: number, content: string): Promise<Message>
    reactMessage(idmessage: number, react: ReactMessage, iduser: number, idgroup : Number): Promise<Reaction>
}