import { User } from "@/resources/auth/dtos/user.dto"
import Reaction from "./react.dto"

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
    public manipulates : Array<User> = [];
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