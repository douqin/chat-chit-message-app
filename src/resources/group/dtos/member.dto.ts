import { Member } from "@/models/member.model";
import { User } from "@/models/user.model";

export class MemberDTO extends Member {

    constructor(id: number,
        lastview: Date | null,
        position: number,
        status: number,
        timejoin: Date, public inforMember: User) {
        super(
            id, lastview, position, status, timejoin
        );
    }
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
