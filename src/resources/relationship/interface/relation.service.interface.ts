
import { User } from "@/resources/auth/dtos/user.dto";
import { InviteFriend } from "../dto/invite.dto";

export interface RelationServiceBehavior {
    deleteInvite(iduser: number, idInvite: number): Promise<boolean>;
    deleteMySentInvite(iduser: number, idInvite: number): Promise<boolean>;
    acceptInviteFriend(iduser: number, idInvite: number): Promise<boolean>;
    unFriend(iduser: number, iduserUnFriend: number): Promise<boolean>;
    getAllInvite(iduser: number): Promise<InviteFriend[]>
    inviteFriend(iduser: number, idReceiver: number): Promise<any>;
    getAllFriend(iduser: number): Promise<User[]>;
}