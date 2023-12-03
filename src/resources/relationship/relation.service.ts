
import { RelationServiceBehavior } from "./interface/relation.service.interface"
import RelationRepostory from "./relation.repository"
import { InviteFriend, InviteFriendDTO } from "./dto/invite.dto"
import { RelationRepositoryBehavior } from "./interface/relation.repository.interface"
import { RelationshipUser } from "./enums/relationship.enum"
import { User } from "../../models/user.model"
import { ListFriendDTO } from "./dto/friends.dto"

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
    async isFriend(iduser: number, iduserCanCheck: number): Promise<boolean> {
        // TODO: complete func
        throw new Error("Method not implemented.")
    }
    async deleteInvite(iduser: number, idInvite: number): Promise<boolean> {
        return await this.friendRepostory.deleteInvite(iduser, idInvite)
    }
    async deleteMySentInvite(iduser: number, idInvite: number): Promise<boolean> {
        return await this.friendRepostory.deleteMySentInvite(iduser, idInvite)
    }
    async getAllInvite(iduser: number, cursor : number, limit : number): Promise<InviteFriendDTO> {
        let arrRaw = (await this.friendRepostory.getAllInvite(iduser, cursor, limit))
        return InviteFriendDTO.rawToDTO(arrRaw);
    }
    async acceptInviteFriend(iduser: number, idInvite: number): Promise<boolean> {
        return await this.friendRepostory.acceptInviteFriend(iduser, idInvite)
    }
    async unFriend(iduser: number, iduserUnFriend: number): Promise<boolean> {
        return await this.friendRepostory.unFriend(iduser, iduserUnFriend)
    }
    async getAllFriend(iduser: number, cursor : number, limit : number): Promise<ListFriendDTO> {
        let arrRaw = (await this.friendRepostory.getAllFriend(iduser, cursor, limit))
        return ListFriendDTO.rawToDTO(arrRaw);
    }
    async getRelationship(iduser: number, iduserWGet: number) {
        this.friendRepostory.getRelationship(iduser, iduserWGet)
    }
    
}