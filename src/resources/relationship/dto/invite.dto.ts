import { User } from "@/resources/auth/dtos/user.dto";


export class InviteFriend {
    constructor(public id: number, public user: User) { }
    static fromRawData(rawData: any) {
        return new InviteFriend(rawData.id, User.fromRawData(rawData))
    }
}