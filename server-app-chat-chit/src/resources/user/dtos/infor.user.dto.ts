import { User } from "@/models/user.model";
import { ListFriendCommonDTO } from "@/resources/relationship/dto/list.friend.common.dto";
import { RelationshipUser } from "@/resources/relationship/enums/relationship.enum";

export class InfoUserDto extends User {
    constructor(
        public status: RelationshipUser,
        public numberCommonFriend: number,
        user : User
    ){
        super(user.userId, user.lastName, user.firstName, user.phone, user.birthday, user.gender, user.bio, user.username, user.avatar, user.background, user.email);
    }
}