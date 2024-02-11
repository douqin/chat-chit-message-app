export interface RelationRepositoryBehavior {
    deleteMySentInvite(userId: number, idInvite: number): boolean | PromiseLike<boolean>;
    deleteInvite(userId: number, idInvite: number): boolean | PromiseLike<boolean>;
    getRelationship(userId: number, userIdWGet: number): Promise<number>;
    acceptInviteFriend(userId: number, idInvite: number): Promise<boolean>;
    unFriend(userId: number, userIdUnFriend: number): Promise<boolean>;
    getAllInvite(userId: number, cursor: number, limit: number): Promise<any[]>;
    inviteToBecomeFriend(userId: number, idReceiver: number): Promise<any>;
    getSomeFriend(userId: number, cursor: number, limit: number): Promise<any>;
    getSomeFriendCommon(userId: number, userIdWGet: number, cursor: number, limit: number): Promise<any[]>;
}