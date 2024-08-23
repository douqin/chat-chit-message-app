
import { RelationServiceBehavior } from "./interface/relation.service.interface"
import RelationRepository from "./relation.repository"
import { InviteFriendDTO } from "./dto/invite.dto"
import { RelationRepositoryBehavior } from "./interface/relation.repository.interface"
import { RelationshipUser } from "./enums/relationship.enum"
import { User } from "../../models/user.model"
import { ListFriendDTO } from "./dto/listfriends.dto"
import { ListFriendCommonDTO } from "./dto/list.friend.common.dto"
import { inject, injectable } from "tsyringe"
import { BadRequestException } from "@/lib/common"
@injectable()
export default class RelationService implements RelationServiceBehavior {
    async blockUser(userId: number, userIdBlock: number): Promise<boolean> {
        return this.updateRelationship(userId, userIdBlock, RelationshipUser.BLOCKED)
    }
    async inviteToBecomeFriend(userIdSend: number, idReceiver: number) {
        if (await this.relationRepository.getRelationship(userIdSend, idReceiver) === RelationshipUser.NO_RELATIONSHIP) {
            await this.relationRepository.inviteToBecomeFriend(userIdSend, idReceiver)
        }
    }

    constructor(@inject(RelationRepository) private relationRepository: RelationRepositoryBehavior) {
    }

    async unBlockUser(userId: number, unBlockingUserId: number): Promise<boolean> {
        return await this.updateRelationship(userId, unBlockingUserId, RelationshipUser.NO_RELATIONSHIP);
    }
    async getCountFriend(userId: number, userIdWGet: number): Promise<number> {
        return await this.relationRepository.getCountFriendBetWeenUser(userId, userIdWGet)
    }
    async updateRelationship(userId: number, userIdBlock: number, relationship: RelationshipUser): Promise<boolean> {
        return await this.relationRepository.updateRelationship(userId, userIdBlock, relationship)
    }
    async getFriendsCommonBetWeenUser(userId: number, userIdWGet: number, cursor: number, limit: number): Promise<ListFriendCommonDTO> {
        let friends = (await this.relationRepository.getFriendsCommonBetWeenUser(userId, userIdWGet, cursor, limit)).map((value, index) => {
            return User.fromRawData(value)
        });
        return ListFriendCommonDTO.rawToDTO(friends);
    }

    async getFriendOnline(userId: number): Promise<User[]> {
        // lay tam 10 nguoi online
        // let friendsOnline: User[] = [];
        // let users = (await DatabaseCache.getInstance().smembers(ConstantRedis.KEY_USER_ONLINE)).map((value, index) => {
        //     return Number(value)
        // })
        // let cursor = 0;
        // if (users.length == 0) return friendsOnline;
        // while (friendsOnline.length > 10) {
        //     let friends = await this.friendRepostory.getSomeFriend(userId, cursor, 20)
        //     if (friends.length == 0) break
        //     if (friends[friends.length - 1].userId < users[0]) continue
        //     for (let i of friends) {
        //         if (users.includes(i)) {
        //             friendsOnline.push(User.fromRawData(i))
        //         }
        //     }
        //     cursor += 40;
        // }
        // return friendsOnline;
        throw new Error("Method not implemented.")
    } // FIXME: TEST POSTMAN
    async deleteInvite(userId: number, idInvite: number): Promise<boolean> {
        return await this.relationRepository.deleteInvite(userId, idInvite)
    }
    async deleteMySentInvite(userId: number, idInvite: number): Promise<boolean> {
        return await this.relationRepository.deleteMySentInvite(userId, idInvite)
    }
    async getAllInvite(userId: number, cursor: number, limit: number): Promise<InviteFriendDTO> {
        let arrRaw = (await this.relationRepository.getAllInvite(userId, cursor, limit))
        return InviteFriendDTO.rawToDTO(arrRaw);
    }
    async acceptInviteFriend(userId: number, idInvite: number): Promise<boolean> {
        return await this.relationRepository.acceptInviteFriend(userId, idInvite)
    }
    async unFriend(userId: number, userIdUnFriend: number): Promise<boolean> {
        if (await this.relationRepository.getRelationship(userId, userIdUnFriend) === RelationshipUser.FRIEND) {
            console.log("")
            return await this.relationRepository.unFriend(userId, userIdUnFriend)
        }
        throw new BadRequestException("You are not friend")
    }
    async getAllFriend(userId: number, cursor: number, limit: number): Promise<ListFriendDTO> {
        let arrRaw = (await this.relationRepository.getSomeFriend(userId, cursor, limit))
        return ListFriendDTO.rawToDTO(arrRaw);
    }
    async getRelationship(userId: number, userIdWGet: number) {
        return this.relationRepository.getRelationship(userId, userIdWGet)
    }

}