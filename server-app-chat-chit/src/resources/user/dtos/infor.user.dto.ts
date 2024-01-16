import { User } from "@/models/user.model";
import { ListFriendCommonDTO } from "@/resources/relationship/dto/list.friend.common.dto";
import { RelationshipUser } from "@/resources/relationship/enums/relationship.enum";

export class InforUserDto extends User{
    constructor(
        public status: RelationshipUser,
        public numberCommonFriend: ListFriendCommonDTO,
        user : User
    ){
        super(user.iduser, user.lastname, user.firstname, user.phone, user.birthday, user.gender, user.bio, user.username, user.avatar, user.background, user.email);
    }
}