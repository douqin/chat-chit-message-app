
import { RelationServiceBehavior } from "./interface/relation.service.interface"
import RelationRepostory from "./relation.repository"
import { InviteFriend, InviteFriendDTO } from "./dto/invite.dto"
import { RelationRepositoryBehavior } from "./interface/relation.repository.interface"
import { RelationshipUser } from "./enums/relationship.enum"
import { User } from "../../models/user.model"
import { ListFriendDTO } from "./dto/listfriends.dto"
import { DatabaseCache } from "@/config/database/redis"
import { ConstantRedis } from "@/config/database/constant"
import { ListFriendCommonDTO } from "./dto/list.friend.common.dto"

export default class RelationService implements RelationServiceBehavior {
    async inviteToBecomeFriend(iduserSend: number, idReceiver: number) {
        if (await this.friendRepostory.getRelationship(iduserSend, idReceiver) === RelationshipUser.NO_RELATIONSHIP) {
            await this.friendRepostory.inviteToBecomeFriend(iduserSend, idReceiver)
        }
    }
    friendRepostory: RelationRepositoryBehavior
    constructor() {
        this.friendRepostory = new RelationRepostory()
    }
    async getSomeFriendCommon(iduser: number, iduserWGet: number, cursor: number, limit: number): Promise<ListFriendCommonDTO> {
        let friends =  (await this.friendRepostory.getSomeFriendCommon(iduser, iduserWGet, cursor, limit)).map((value, index) => {
            return User.fromRawData(value)
        });
        return ListFriendCommonDTO.rawToDTO(friends);
    }

    async getFriendOnline(iduser: number): Promise<User[]> {
        // lay tam 10 nguoi online
        let friendsOnline: User[] = [];
        let users = (await DatabaseCache.getInstance().smembers(ConstantRedis.KEY_USER_ONLINE)).map((value, index) => {
            return Number(value)
        })
        let cursor = 0;
        if(users.length == 0) return friendsOnline;
        while (friendsOnline.length > 10) {
            let friends = await this.friendRepostory.getSomeFriend(iduser, cursor, 20)
            if (friends.length == 0) break
            if (friends[friends.length - 1].iduser < users[0]) continue
            for (let i of friends) {
                if (users.includes(i)) {
                    friendsOnline.push(User.fromRawData(i))
                }
            }
            cursor += 40;
        }
        return friendsOnline;
    } // FIXME: TEST POSTMAN
    async deleteInvite(iduser: number, idInvite: number): Promise<boolean> {
        return await this.friendRepostory.deleteInvite(iduser, idInvite)
    }
    async deleteMySentInvite(iduser: number, idInvite: number): Promise<boolean> {
        return await this.friendRepostory.deleteMySentInvite(iduser, idInvite)
    }
    async getAllInvite(iduser: number, cursor: number, limit: number): Promise<InviteFriendDTO> {
        let arrRaw = (await this.friendRepostory.getAllInvite(iduser, cursor, limit))
        return InviteFriendDTO.rawToDTO(arrRaw);
    }
    async acceptInviteFriend(iduser: number, idInvite: number): Promise<boolean> {
        return await this.friendRepostory.acceptInviteFriend(iduser, idInvite)
    }
    async unFriend(iduser: number, iduserUnFriend: number): Promise<boolean> {
        return await this.friendRepostory.unFriend(iduser, iduserUnFriend)
    }
    async getAllFriend(iduser: number, cursor: number, limit: number): Promise<ListFriendDTO> {
        let arrRaw = (await this.friendRepostory.getSomeFriend(iduser, cursor, limit))
        return ListFriendDTO.rawToDTO(arrRaw);
    }
    async getRelationship(iduser: number, iduserWGet: number) {
        return this.friendRepostory.getRelationship(iduser, iduserWGet)
    }

}