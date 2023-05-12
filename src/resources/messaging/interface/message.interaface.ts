import { NextFunction } from "express"

export default interface MessageBehavior {
    deleteMessagePinned(): Promise<any>
    pinMessage(): Promise<any>
    getAllMessageFromGroup(): Promise<any>
    sendFileMessage(): Promise<any>
    sendTextMessage():  Promise<boolean>
    revokeMessage(): Promise<any>
    reactMessage(): Promise<any>
}