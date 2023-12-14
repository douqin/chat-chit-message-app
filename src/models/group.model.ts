export default class Group {
    idgroup: number
    name: string
    avatar: string
    status: number
    createAt: Date
    type: number
    role : string
    link : string
    constructor(idgroup: number, name: string, avatar: string, status: number, createAt: Date, type: number,  link : string,  role : string) {
        this.idgroup = idgroup
        this.name = name
        this.avatar = avatar
        this.status = status
        this.createAt = createAt
        this.type = type
        this.link = link
        this.role = role
    }
    static fromRawData(object: any): Group {
        const { idgroup, name, avatar, status, createat, type , link, role} = object;
        return new Group(
            idgroup, name, avatar, status, createat, type, link, role
        );
    }
}