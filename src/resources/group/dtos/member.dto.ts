import { Member } from "@/models/member.model";
import { User } from "@/models/user.model";

export class MemberDTO extends Member {

    constructor(memberId: number,
        lastview: Date | null,
        position: number,
        status: number,
        timejoin: Date, public inforMember: User) {
        super(
            memberId, lastview, position, status, timejoin
        );
    }
    // FIXME:  add get background
    static fromRawData(data: any): MemberDTO {
        return new MemberDTO(
            data.id,
            data.lastview ? new Date(data.lastview) : null,
            data.position,
            data.status,
            new Date(data.timejoin),
            User.fromRawData(data)
        )
    }
}
