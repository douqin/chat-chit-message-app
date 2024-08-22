import { NotFoundException } from "@/lib/common";
import { User } from "../../models/user.model";
import { RelationshipUser } from "../relationship/enums/relationship.enum";
import { RelationServiceBehavior } from "../relationship/interface/relation.service.interface";
import RelationService from "../relationship/relation.service";
import { InforUserDto as InfoUserDto } from "./dtos/infor.user.dto";
import { iUserRepositoryBehavior } from "./interface/user.repository.interface";
import { UserServiceBehavior } from "./interface/user.service.interface";
import UserRepository from "./user.repository";
import { container, inject, injectable } from "tsyringe";

@injectable()
export default class UserService implements UserServiceBehavior {
    
    constructor(@inject(UserRepository) private userRepository: iUserRepositoryBehavior) {
    }
    async infoUser(userId: number, username: string): Promise<InfoUserDto> {
        let dataUser = await this.userRepository.inforUser(username)
        if (dataUser) {
            let user = User.fromRawData(
                dataUser
            )
            let relationship: RelationServiceBehavior = container.resolve(RelationService);
            let relation: RelationshipUser = await relationship.getRelationship(userId, user.userId);
            let friendsCommon = await relationship.getCountFriend(userId, user.userId);
            return new InfoUserDto(relation, friendsCommon, user);
        } else {
            throw new NotFoundException("User not found")
        }
    }

    async searchUser(phone: string): Promise<User> {
        return User.fromRawData(
            await this.userRepository.searchUser(phone)
        )
    }
} 