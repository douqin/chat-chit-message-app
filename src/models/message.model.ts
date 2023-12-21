import { User } from "@/models/user.model"
import Reaction from "../resources/messaging/dtos/react.dto"

export default class Message {
    idmember : string
    content: string 
    createat: Date
    idgroup: number
    idmessage: number
    iduser: number
    replyidmessage: number
    status: number
    type: number
    public reacts : Array<Reaction>
    public manipulates : Array<User> = []
    public tags : Array<User> = []
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
        this.createat = createat
        this.idgroup = idgroup
        this.idmessage = idmessage
        this.iduser = iduser
        this.replyidmessage = replyidmessage
        this.status = status
        this.type = type
        this.idmember = idmember
        this.reacts = [];
    }
}