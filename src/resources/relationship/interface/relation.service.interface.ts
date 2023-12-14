import { User } from "@/models/user.model";
import { ListFriendDTO } from "../dto/friends.dto";
import { InviteFriendDTO } from "../dto/invite.dto";

export interface RelationServiceBehavior {
    getRelationship(iduser: number, iduserWGet: number) : Promise<number>;
    deleteInvite(iduser: number, idInvite: number): Promise<boolean>;
    deleteMySentInvite(iduser: number, idInvite: number): Promise<boolean>;
    acceptInviteFriend(iduser: number, idInvite: number): Promise<boolean>;
    unFriend(iduser: number, iduserUnFriend: number): Promise<boolean>;
    getAllInvite(iduser: number, cursor : number, limit : number): Promise<InviteFriendDTO>
    inviteToBecomeFriend(iduser: number, idReceiver: number): Promise<any>;
    getAllFriend(iduser: number, cursor : number, limit : number): Promise<ListFriendDTO>;
    getFriendOnline(iduser : number) : Promise<User[]>
}