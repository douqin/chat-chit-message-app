import { User } from "resources_API/auth/dtos/user.dto"
import { RelationServiceBehavior } from "./interface/relation.service.interface"
import RelationRepostory from "./relation.repository"
import { InviteFriend } from "./dto/invite.dto"
import { RelationRepositoryBehavior } from "./interface/relation.repository.interface"
import { RelationshipUser } from "./enums/relationship.enum"

export default class RelationService implements RelationServiceBehavior {
    async inviteFriend(iduserSend: number, idReceiver: number) {
        if (await this.friendRepostory.getRelationship(iduserSend,idReceiver) === RelationshipUser.NO_RELATIONSHIP) {
            await this.friendRepostory.inviteFriend(iduserSend, idReceiver)
        }
    }
    friendRepostory: RelationRepositoryBehavior
    constructor() {
        this.friendRepostory = new RelationRepostory()
    }
    async deleteInvite(iduser: number, idInvite: number): Promise<boolean> {
        return await this.friendRepostory.deleteInvite(iduser, idInvite)
    }
    async deleteMySentInvite(iduser: number, idInvite: number): Promise<boolean> {
        return await this.friendRepostory.deleteMySentInvite(iduser, idInvite)
    }
    async getAllInvite(iduser: number): Promise<InviteFriend[]> {
        let arrRaw = (await this.friendRepostory.getAllInvite(iduser))
        let arrUser: Array<InviteFriend> = []
        for (let userRaw of arrRaw) {
            arrUser.push(InviteFriend.fromRawData(userRaw))
        }
        return arrUser
    }
    async acceptInviteFriend(iduser: number, idInvite: number): Promise<boolean> {
        return await this.friendRepostory.acceptInviteFriend(iduser, idInvite)
    }
    async unFriend(iduser: number, iduserUnFriend: number): Promise<boolean> {
        return await this.friendRepostory.unFriend(iduser, iduserUnFriend)
    }
    async getAllFriend(iduser: number): Promise<User[]> {
        let arrRaw = (await this.friendRepostory.getAllFriend(iduser))
        let arrUser: Array<User> = []
        for (let userRaw of arrRaw) {
            arrUser.push(User.fromRawData(userRaw))
        }
        return arrUser
    }
    async getRelationship(iduser: number, iduserWGet: number){
        this.friendRepostory.getRelationship(iduser, iduserWGet)
    }
}