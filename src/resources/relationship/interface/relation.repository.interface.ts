export interface RelationRepositoryBehavior {
    deleteMySentInvite(iduser: number, idInvite: number): boolean | PromiseLike<boolean>;
    deleteInvite(iduser: number, idInvite: number): boolean | PromiseLike<boolean>;
    getRelationship(iduser: number, iduserWGet: number): Promise<number>;
    acceptInviteFriend(iduser: number, idInvite: number): Promise<boolean>;
    unFriend(iduser: number, iduserUnFriend: number): Promise<boolean>;
    getAllInvite(iduser: number, cursor: number, limit: number): Promise<any[]>;
    inviteToBecomeFriend(iduser: number, idReceiver: number): Promise<any>;
    getSomeFriend(iduser: number, cursor: number, limit: number): Promise<any>;
    getSomeFriendCommon(iduser: number, iduserWGet: number, cursor: number, limit: number): Promise<any[]>;
}