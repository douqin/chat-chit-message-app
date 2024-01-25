import { User } from "@/models/user.model"
import Reaction from "../resources/messaging/dtos/react.dto"
import { MemberInfo } from "@/resources/group/interface/group.repository.interface"

export default class Message {
    memberId : string
    content: string 
    createAt: Date
    groupId: number
    messageId: number
    userId: number
    replyMessageId: number
    status: number
    type: number
    public reacts : Array<Reaction>
    public manipulates : Array<number> = []
    constructor(content: string,
        createat: Date,
        groupId: number,
        messageId: number,
        userId: number,
        replyMessageId: number,
        status: number,
        type: number,
        memberId : string) {
        this.content = content
        this.createAt = createat
        this.groupId = groupId
        this.messageId = messageId
        this.userId = userId
        this.replyMessageId = replyMessageId
        this.status = status
        this.type = type
        this.memberId = memberId
        this.reacts = [];
    }
}