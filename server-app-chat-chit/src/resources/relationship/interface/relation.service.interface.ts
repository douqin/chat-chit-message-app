import { User } from "@/models/user.model";
import { ListFriendDTO } from "../dto/listfriends.dto";
import { InviteFriendDTO } from "../dto/invite.dto";
import { RelationshipUser } from "../enums/relationship.enum";
import { ListFriendCommonDTO } from "../dto/list.friend.common.dto";

export interface RelationServiceBehavior {
    unBlockUser(userId: number, unBlockingUserId: number): Promise<boolean>;
    updateRelationship(userId: number, userIdBlock: number, relationship: RelationshipUser): Promise<boolean>;
    getRelationship(userId: number, userIdWGet: number): Promise<RelationshipUser>;
    deleteInvite(userId: number, idInvite: number): Promise<boolean>;
    deleteMySentInvite(userId: number, idInvite: number): Promise<boolean>;
    acceptInviteFriend(userId: number, idInvite: number): Promise<boolean>;
    unFriend(userId: number, userIdUnFriend: number): Promise<boolean>;
    getAllInvite(userId: number, cursor: number, limit: number): Promise<InviteFriendDTO>
    inviteToBecomeFriend(userId: number, idReceiver: number): Promise<any>;
    getAllFriend(userId: number, cursor: number, limit: number): Promise<ListFriendDTO>;
    getFriendOnline(userId: number): Promise<User[]>
    getFriendsCommonBetWeenUser(userId: number, userIdWGet: number, cursor: number, limit: number): Promise<ListFriendCommonDTO>;
    getCountFriend(userId: number, userIdWGet: number): Promise<number>;
}