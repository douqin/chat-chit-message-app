export default class Message {
    content: string
    createat: Date
    idgroup: number
    idmessage: number
    iduser: number
    replyidmessage: number
    status: number
    type: number
    userdelete: number
    constructor(content: string,
        createat: Date,
        idgroup: number,
        idmessage: number,
        iduser: number,
        replyidmessage: number,
        status: number,
        type: number,
        userdelete: number) {
        this.content = content
        this.createat = createat
        this.idgroup = idgroup
        this.idmessage = idmessage
        this.iduser = iduser
        this.replyidmessage = replyidmessage
        this.status = status
        this.type = type
        this.userdelete = userdelete
    }
    static fromRawData(object: any): Message {
        const { content,
            createat,
            idgroup,
            idmessage,
            iduser,
            replyidmessage,
            status,
            type,
            userdelete } = object;
        console.info(content,
            createat,
            idgroup,
            idmessage,
            iduser,
            replyidmessage,
            status,
            type,
            userdelete);
        return new Message(
            content,
            createat,
            idgroup,
            idmessage,
            iduser,
            replyidmessage,
            status,
            type,
            userdelete
        );
    }
}