export default class Group {
    groupId: number
    name: string
    avatar: string
    status: number
    createAt: Date
    type: number
    access : number
    link : string
    constructor(groupId: number, name: string, avatar: string, status: number, createAt: Date, type: number,  link : string,  access : number) {
        this.groupId = groupId
        this.name = name
        this.avatar = avatar
        this.status = status
        this.createAt = createAt
        this.type = type
        this.link = link
        this.access = access
    }
    static fromRawData(object: any): Group {
        const { groupId, name, avatar, status, createat, type , link,  access} = object;
        return new Group(
            groupId, name, avatar, status, createat, type, link, access
        );
    }
}