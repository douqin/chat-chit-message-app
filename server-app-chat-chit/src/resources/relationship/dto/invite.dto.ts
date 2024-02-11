import { User } from "@/models/user.model";


export class InviteFriend {
    constructor(public id: number, public createAt: Date, public user: User) { }
    static fromRawData(rawData: any) {
        return new InviteFriend(rawData.id, rawData.createAt, User.fromRawData(rawData))
    }
}
export class InviteFriendDTO {
    constructor(public invites: InviteFriend[], public nextCursor: number | null,
        public totalSize: number = 0) { }
    static rawToDTO(raw: any): InviteFriendDTO {
        let dto = new InviteFriendDTO([], null)
        for (let userRaw of raw) {
            let invite = InviteFriend.fromRawData(userRaw)
            dto.invites.push(invite)
            dto.nextCursor = invite.id;
        }
        return dto
    }
}