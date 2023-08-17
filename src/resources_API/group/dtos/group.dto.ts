export default class GroupChat {
    idgroup: number
    name: string
    avatar: string
    status: number
    createAt: Date
    type: number
    constructor(idgroup: number, name: string, avatar: string, status: number, createAt: Date, type: number) {
        this.idgroup = idgroup
        this.name = name
        this.avatar = avatar
        this.status = status
        this.createAt = createAt
        this.type = type
    }
    static fromRawData(object: any): GroupChat {
        const { idgroup, name, avatar, status, createat, type } = object;
        return new GroupChat(
            idgroup, name, avatar, status, createat, type
        );
    }
}