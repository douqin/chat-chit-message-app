import { RelationshipUser } from './enums/relationship.enum';
import { MySql } from "@/config/sql/mysql";
import { RelationRepositoryBehavior } from "./interface/relation.repository.interface";
import validVariable from '@/utils/extension/vailid_variable';

export default class RelationRepostory implements RelationRepositoryBehavior {
    async deleteMySentInvite(iduser: number, idInvite: number): Promise<boolean> {
        const query = 'DELETE FROM relationship WHERE relationship.id = ? AND relationship.requesterid = ? AND relationship.relation = ?'
        await MySql.excuteQuery(query, [idInvite, iduser, RelationshipUser.WAIT_RESPONSE_REQUEST_FRIEND])
        return true
    }
    async deleteInvite(iduser: number, idInvite: number): Promise<boolean> {
        const query = 'DELETE FROM relationship WHERE relationship.id = ? AND relationship.addresseeid = ? AND relationship.relation = ?'
        await MySql.excuteQuery(query, [idInvite, iduser, RelationshipUser.WAIT_RESPONSE_REQUEST_FRIEND])
        return true
    }
    async getRelationship(iduser: number, iduserWGet: number): Promise<number> {
        const query = 'SELECT relationship.relation FROM relationship WHERE relationship.requesterid = ? AND relationship.addresseeid = ?'
        let [[{ 'relation': relation }], column] = await MySql.excuteQuery(query, [iduser, iduserWGet]) as any
        return Number(relation) > 0 ? Number(relation) : RelationshipUser.NO_RELATIONSHIP
    }
    async unFriend(iduser: number, iduserUnFriend: number): Promise<boolean> {
        const query = 'DELETE FROM relationshop WHERE relationshop.requesterid = ? AND relationship.addresseeid = ?'
        await MySql.excuteQuery(query, [iduser, iduserUnFriend])
        return true
    }
    async getAllInvite(iduser: number, cursor : number, limit : number): Promise<any> {
        const query = 'SELECT user.*, relationship.id, relationship.createat FROM relationship JOIN user ON relationship.requesterid= user.iduser WHERE relationship.relation = ? AND relationship.addresseeid = ? AND relationship.id > ? ORDER BY relationship.id LIMIT ?;'
        let [data, inforC] = await MySql.excuteQuery(query, [RelationshipUser.WAIT_RESPONSE_REQUEST_FRIEND, iduser, cursor, limit]) as any
        return data as any[]
    }
    async getAllFriend(iduser: number, cursor: number, limit: number): Promise<any[]> {
        let query = 'SELECT * FROM relationship JOIN user ON relationship.addresseeid = user.iduser OR relationship.requesterid = user.iduser WHERE relationship.relation = ? AND user.iduser != ? AND user.iduser > ? ORDER BY user.iduser LIMIT ?'
        let [data, inforC] = await MySql.excuteQuery(query, [RelationshipUser.FRIEND, iduser, cursor, limit]) as any
        return data as any[]
    }
    async acceptInviteFriend(iduser: number, idInvite: number): Promise<boolean> {
        const query = 'UPDATE relationship SET relation = ? WHERE relationship.id= ?'
        await MySql.excuteQuery(query, [iduser, idInvite])
        return true
    }
    async inviteToBecomeFriend(iduserSend: number, idReceiver: number) {
        const insertRequest = 'INSERT INTO relationship(relationship.requesterid, relationship.z, relationship.relation) VALUES (?,?,?)'
        await MySql.excuteQuery(insertRequest, [iduserSend, idReceiver, RelationshipUser.WAIT_RESPONSE_REQUEST_FRIEND])
    }
}