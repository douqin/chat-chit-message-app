export default class GroupChat {
    idgroup: number
    name: string
    avatar: string
    status: number
    createBy: number
    createAt: Date
    type: number
    constructor(idgroup: number, name: string, avatar: string, status: number, createBy: number, createAt: Date, type: number) {
        this.idgroup = idgroup
        this.name = name
        this.avatar = avatar
        this.status = status
        this.createAt = createAt
        this.createBy = createBy
        this.type = type
    }
    static fromRawData(object: any): GroupChat {
        const { idgroup, name, avatar, status, createby, createat, type } = object;
        return new GroupChat(
            idgroup, name, avatar, status, createby, createat, type
        );
    }
}