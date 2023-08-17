import { InviteFriend } from "../dto/invite.dto";

export interface RelationRepositoryBehavior {
    deleteMySentInvite(iduser: number, idInvite: number): boolean | PromiseLike<boolean>;
    deleteInvite(iduser: number, idInvite: number): boolean | PromiseLike<boolean>;
    getRelationship(iduser: number, iduserWGet: number): Promise<number>;
    acceptInviteFriend(iduser: number, idInvite: number): Promise<boolean >;
    unFriend(iduser: number, iduserUnFriend: number): Promise<boolean>;
    getAllInvite(iduser: number): Promise<InviteFriend[]>;
    inviteFriend(iduser: number, idReceiver: number): Promise<any>;
    getAllFriend(iduser: number): Promise<any>;
}