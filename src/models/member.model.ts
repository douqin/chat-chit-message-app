export class Member {
    static fromRawData(data: any): Member {
        return new Member(
            data.id,
            data.lastview ? new Date(data.lastview) : null,
            data.position,
            data.status,
            new Date(data.timejoin))
    }
    memberId: number
    lastview: Date | null
    position: number
    status: number
    timejoin: Date

    constructor(
        id: number,
        lastview: Date | null,
        position: number,
        status: number,
        timejoin: Date
    ) {
        this.memberId = id
        this.lastview = lastview
        this.position = position
        this.status = status
        this.timejoin = timejoin
    }
}
