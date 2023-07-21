import { ReactMessage } from "../dtos/message.react";

export default interface MessageBehavior {
    changePinMessage(idmessage: number, iduser: number, isPin : number): Promise<boolean>
    getAllMessageFromGroup(idgroup: number, iduser: number): Promise<any>
    sendFileMessage(idgroup: number, iduser: number, content: {
        [fieldname: string]: Express.Multer.File[];
    } | Express.Multer.File[] | undefined): Promise<Array<string>>
    sendTextMessage(idgroup: number, iduser: number, content: string): Promise<boolean>
    changeStatusMessage(idmessage: number, iduser: number): Promise<boolean>
    reactMessage(idmessage: number, react: ReactMessage, iduser: number): Promise<any>
}