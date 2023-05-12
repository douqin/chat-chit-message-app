import { NextFunction } from "express";
import Message from "./dtos/message.dto";
import MessageBehavior from "./interface/message.interaface";
import MessageRepository from "./message.repository";

export default class MessageService  {
    private messageRepository: MessageRepository
    constructor() {
        this.messageRepository = new MessageRepository()
    }
}