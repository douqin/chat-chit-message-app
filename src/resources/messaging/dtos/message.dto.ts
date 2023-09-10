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
    }
    static fromRawsData(raws: any[]): Message[] {
        let arrMessage: Array<Message> = [];
        for (let raw of raws) {
            const { content,
                createat,
                idgroup,
                idmessage,
                iduser,
                replyidmessage,
                status,
                type,
                idmember} = raw;
            arrMessage.push(new Message(
                content,
                createat,
                idgroup,
                idmessage,
                iduser,
                replyidmessage,
                status,
                type,
                idmember
            ))
        }
        return arrMessage
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
            idmember } = object;
        return new Message(
            content,
            createat,
            idgroup,
            idmessage,
            iduser,
            replyidmessage,
            status,
            type,
            idmember
        );
    }
}