import { User } from "../../models/user.model";
import { RelationshipUser } from "../relationship/enums/relationship.enum";
import { RelationServiceBehavior } from "../relationship/interface/relation.service.interface";
import RelationService from "../relationship/relation.service";
import { InforUserDto } from "./dtos/infor.user.dto";
import { UserRepositoryBehavior } from "./interface/user.repository.interface";
import { UserServiceBehavior } from "./interface/user.service.interface";
import UserRepository from "./user.repository";

export default class UserService implements UserServiceBehavior {
    private userRepository: UserRepositoryBehavior
    constructor() {
        this.userRepository = new UserRepository()
    }
    async inforUser(iduser: number, username: string): Promise<InforUserDto> {
        let user = User.fromRawData(
            await this.userRepository.inforUser(username)
        )
        let relationship: RelationServiceBehavior = new RelationService();
        let relation: RelationshipUser = await relationship.getRelationship(iduser, user.iduser);
        let friendsCommon = await relationship.getSomeFriendCommon(iduser, user.iduser, 0, 10);
        return new InforUserDto(relation, friendsCommon, user);
    }

    async searchUser(phone: string): Promise<User> {
        return User.fromRawData(
            await this.userRepository.searchUser(phone)
        )
    }
} 