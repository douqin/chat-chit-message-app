import { Database, QuerySuccessResult } from '@/config/database/database';
import { RelationshipUser } from './enums/relationship.enum';
import { RelationRepositoryBehavior } from "./interface/relation.repository.interface";

export default class RelationRepostory implements RelationRepositoryBehavior {
    async getSomeFriendCommon(iduser: number, iduserWGet: number, cursor: number, limit: number): Promise<any[]> {
        //TODO: add query
        // let query = ""
        // let params: any[] = []
        // await Database.excuteQuery(query, params);
        return Promise.resolve([]);
    }
    async deleteMySentInvite(iduser: number, idInvite: number): Promise<boolean> {
        const query = 'DELETE FROM relationship WHERE relationship.id = ? AND relationship.requesterid = ? AND relationship.relation = ?'
        await Database.excuteQuery(query, [idInvite, iduser, RelationshipUser.WAIT_RESPONSE_REQUEST_FRIEND])
        return true
    }
    async deleteInvite(iduser: number, idInvite: number): Promise<boolean> {
        const query = 'DELETE FROM relationship WHERE relationship.id = ? AND relationship.addresseeid = ? AND relationship.relation = ?'
        await Database.excuteQuery(query, [idInvite, iduser, RelationshipUser.WAIT_RESPONSE_REQUEST_FRIEND])
        return true
    }
    async getRelationship(iduser: number, iduserWGet: number): Promise<number> {
        const query = `SELECT relationship.relation FROM relationship WHERE relationship.requesterid = ? AND relationship.addresseeid = ? 
                        UNION
                        SELECT relationship.relation FROM relationship WHERE relationship.requesterid = ? AND relationship.addresseeid = ?`
        let [relation, column] = await Database.excuteQuery(query, [iduser, iduserWGet, iduserWGet, iduser]) as QuerySuccessResult
        if (relation.length === 0) return RelationshipUser.NO_RELATIONSHIP;
        return Number(relation[0].relation)
    }
    async unFriend(iduser: number, iduserUnFriend: number): Promise<boolean> {
        const query = 'DELETE FROM relationshop WHERE relationshop.requesterid = ? AND relationship.addresseeid = ?'
        await Database.excuteQuery(query, [iduser, iduserUnFriend])
        return true
    }
    async getAllInvite(iduser: number, cursor: number, limit: number): Promise<any> {
        const query = 'SELECT user.*, relationship.id, relationship.createat FROM relationship JOIN user ON relationship.requesterid= user.iduser WHERE relationship.relation = ? AND relationship.addresseeid = ? AND relationship.id > ? ORDER BY relationship.id LIMIT ?;'
        let [data, inforC] = await Database.excuteQuery(query, [RelationshipUser.WAIT_RESPONSE_REQUEST_FRIEND, iduser, cursor, limit]) as any
        return data as any[]
    }
    async getSomeFriend(iduser: number, cursor: number, limit: number): Promise<any[]> {
        let query = 'SELECT * FROM relationship JOIN user ON relationship.addresseeid = user.iduser OR relationship.requesterid = user.iduser WHERE relationship.relation = ? AND user.iduser != ? AND user.iduser > ? ORDER BY relationship.id LIMIT ?'
        let [data, inforC] = await Database.excuteQuery(query, [RelationshipUser.FRIEND, iduser, cursor, limit]) as any
        return data as any[]
    }
    async acceptInviteFriend(iduser: number, idInvite: number): Promise<boolean> {
        const query = 'UPDATE relationship SET relation = ? WHERE relationship.id= ?'
        await Database.excuteQuery(query, [iduser, idInvite])
        return true
    }
    async inviteToBecomeFriend(iduserSend: number, idReceiver: number) {
        const insertRequest = 'INSERT INTO relationship(relationship.requesterid, relationship.z, relationship.relation) VALUES (?,?,?)'
        await Database.excuteQuery(insertRequest, [iduserSend, idReceiver, RelationshipUser.WAIT_RESPONSE_REQUEST_FRIEND])
    }
}