import { RelationshipUser } from './enums/relationship.enum';
import { MySql } from "@/config/sql/mysql";
import { RelationRepositoryBehavior } from "./interface/relation.repository.interface";

export default class RelationRepostory implements RelationRepositoryBehavior {
    async deleteMySentInvite(iduser: number, idInvite: number): Promise<boolean> {
        const query = 'DELETE FROM relationship WHERE relationship.id = ? AND relationship.iduser1 = ? AND relationship.relation = ?'
        await MySql.excuteQuery(query, [idInvite, iduser, RelationshipUser.WAIT_RESPONSE_REQUEST_FRIEND])
        return true
    }
    async deleteInvite(iduser: number, idInvite: number): Promise<boolean> {
        const query = 'DELETE FROM relationship WHERE relationship.id = ? AND relationship.iduser2 = ? AND relationship.relation = ?'
        await MySql.excuteQuery(query, [idInvite, iduser, RelationshipUser.WAIT_RESPONSE_REQUEST_FRIEND])
        return true
    }
    async getRelationship(iduser: number, iduserWGet: number): Promise<number> {
        const query = 'SELECT relationship.relation FROM relationship WHERE relationship.iduser1 = ? AND relationship.iduser2 = ?'
        let [[{ 'relation': relation }], column] = await MySql.excuteQuery(query, [iduser, iduserWGet]) as any
        return Number(relation) > 0 ? Number(relation) : RelationshipUser.NO_RELATIONSHIP
    }
    async unFriend(iduser: number, iduserUnFriend: number): Promise<boolean> {
        const query = 'DELETE FROM relationshop WHERE relationshop.iduser1 = ? AND relationship.iduser2 = ?'
        await MySql.excuteQuery(query, [iduser, iduserUnFriend])
        return true
    }
    async getAllInvite(iduser: number): Promise<any> {
        const query = 'SELECT user.*, relationship.id FROM relationship JOIN user ON relationship.iduser2 = user.iduser AND relationship.relation = ? AND relationship.iduser1 = ?'
        let [data, inforC] = await MySql.excuteQuery(query, [RelationshipUser.WAIT_RESPONSE_REQUEST_FRIEND, iduser]) as any
        return data as any[]
    }
    async getAllFriend(iduser: number): Promise<any[]> {
        let query = 'SELECT user.* FROM relationship JOIN user ON relationship.iduser2 = user.iduser AND  relationship.relation = ? AND relationship.iduser1 = ?'
        let [data, inforC] = await MySql.excuteQuery(query, [RelationshipUser.FRIEND, iduser]) as any
        return data as any[]
    }
    async acceptInviteFriend(iduser: number, idInvite: number): Promise<boolean> {
        const query = 'UPDATE relationship SET relation = ? WHERE relationship.id= ?'
        await MySql.excuteQuery(query, [iduser, idInvite])
        return true
    }
    async inviteFriend(iduserSend: number, idReceiver: number) {
        const insertRequest = 'INSERT INTO relationship(relationship.iduser1, relationship.iduser2, relationship.relation) VALUES (?,?,?)'
        await MySql.excuteQuery(insertRequest, [iduserSend, idReceiver, RelationshipUser.WAIT_RESPONSE_REQUEST_FRIEND])
    }
}