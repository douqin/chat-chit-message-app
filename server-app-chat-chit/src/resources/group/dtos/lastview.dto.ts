export default class LastViewGroup {
    iduser: number
    name: string
    avatar: any
    lastview: number
    constructor(iduser: number,
        name: string,
        avatar: any,
        lastview: number) {
        this.iduser = iduser
        this.name = name
        this.avatar = avatar
        this.lastview = lastview
    }
    static fromRawData(object: any): LastViewGroup {
        const { iduser,
            name,
            avatar,
            lastview } = object;
        return new LastViewGroup(
            iduser, name, avatar, lastview
        );
    }
}