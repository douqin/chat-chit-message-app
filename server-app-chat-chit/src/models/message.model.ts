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
        idgroup: number,
        idmessage: number,
        iduser: number,
        replyidmessage: number,
        status: number,
        type: number,
        idmember : string) {
        this.content = content
        this.createAt = createat
        this.groupId = idgroup
        this.messageId = idmessage
        this.userId = iduser
        this.replyMessageId = replyidmessage
        this.status = status
        this.type = type
        this.memberId = idmember
        this.reacts = [];
    }
}