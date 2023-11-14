import { User } from "@/resources/auth/dtos/user.dto";


export class InviteFriend {
    constructor(public id: number, public createat: Date, public user: User) { }
    static fromRawData(rawData: any) {
        console.log("🚀 ~ file: invite.dto.ts:7 ~ InviteFriend ~ fromRawData ~ rawData:", rawData)
        return new InviteFriend(rawData.id, rawData.createat, User.fromRawData(rawData))
    }
}
export class InviteFriendDTO {
    constructor(public invites: InviteFriend[], public nextCursor: number | null) { }
    static rawToDTO(raw: any) : InviteFriendDTO {
        let dto = new InviteFriendDTO([], null)
        for (let userRaw of raw) {
            let invite = InviteFriend.fromRawData(userRaw)
            dto.invites.push(invite)
            dto.nextCursor = invite.id;
        }
        return dto
    }
}