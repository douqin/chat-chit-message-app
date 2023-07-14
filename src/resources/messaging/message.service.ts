import { NextFunction } from "express";
import Message from "./dtos/message.dto";
import MessageBehavior from "./interface/message.interaface";
import MessageRepository from "./message.repository";

export default class MessageService implements MessageBehavior  {
    private messageRepository: MessageRepository
    constructor() {
        this.messageRepository = new MessageRepository()
    }
    deleteMessagePinned(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    pinMessage(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getAllMessageFromGroup(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    sendFileMessage(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    sendTextMessage(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    revokeMessage(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    reactMessage(): Promise<any> {
        throw new Error("Method not implemented.");
    }
}