import { User } from "@/models/user.model";
import { ListFriendDTO } from "../dto/listfriends.dto";
import { InviteFriendDTO } from "../dto/invite.dto";
import { RelationshipUser } from "../enums/relationship.enum";
import { ListFriendCommonDTO } from "../dto/list.friend.common.dto";

export interface RelationServiceBehavior {
    updateRealationship(iduser: number, iduserBlock: number, relationship: RelationshipUser): Promise<boolean>;
    createRelationShip(iduser: number, iduserBlock: number, relationship: RelationshipUser): Promise<boolean>;
    getRelationship(iduser: number, iduserWGet: number): Promise<RelationshipUser>;
    deleteInvite(iduser: number, idInvite: number): Promise<boolean>;
    deleteMySentInvite(iduser: number, idInvite: number): Promise<boolean>;
    acceptInviteFriend(iduser: number, idInvite: number): Promise<boolean>;
    unFriend(iduser: number, iduserUnFriend: number): Promise<boolean>;
    getAllInvite(iduser: number, cursor: number, limit: number): Promise<InviteFriendDTO>
    inviteToBecomeFriend(iduser: number, idReceiver: number): Promise<any>;
    getAllFriend(iduser: number, cursor: number, limit: number): Promise<ListFriendDTO>;
    getFriendOnline(iduser: number): Promise<User[]>
    getSomeFriendCommon(iduser: number, iduserWGet: number, cursor: number, limit: number): Promise<ListFriendCommonDTO>;
}