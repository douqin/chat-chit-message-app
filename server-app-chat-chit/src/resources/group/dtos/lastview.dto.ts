export default class LastViewGroup {
    userId: number
    name: string
    avatar: any
    lastview: number
    constructor(userId: number,
        name: string,
        avatar: any,
        lastview: number) {
        this.userId = userId
        this.name = name
        this.avatar = avatar
        this.lastview = lastview
    }
    static fromRawData(object: any): LastViewGroup {
        const { userId,
            name,
            avatar,
            lastview } = object;
        return new LastViewGroup(
            userId, name, avatar, lastview
        );
    }
}