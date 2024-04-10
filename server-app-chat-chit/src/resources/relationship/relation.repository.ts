import { Database, QuerySuccessResult, iDatabase } from '@/lib/database';
import { RelationshipUser } from './enums/relationship.enum';
import { RelationRepositoryBehavior } from "./interface/relation.repository.interface";
import { inject, injectable } from 'tsyringe';
import { RawDataMysql } from '@/models/raw.data';

@injectable()
export default class RelationRepostory implements RelationRepositoryBehavior {

    constructor(@inject(Database) private db: iDatabase) { }

    async getCountFriendBetWeenUser(userId: number, userIdWGet: number): Promise<number> {
        const query = `SELECT
        COUNT(*) AS common_friends_count
    FROM
        (
        SELECT DISTINCT
            id
        FROM
            relationship
        WHERE
            (
                requesterid = ? AND addresseeid IN(
                SELECT DISTINCT
                    addresseeid
                FROM
                    relationship
                WHERE
                    requesterid = ? AND relation = 1
            )
            ) OR(
                addresseeid = ? AND requesterid IN(
                SELECT DISTINCT
                    requesterid
                FROM
                    relationship
                WHERE
                    addresseeid = ? AND relation = 1
            )
            ) AND relation = 1
    ) AS common_friends;`
        let [count, inforC] = await this.db.executeQuery(query, [userId, userIdWGet, userId, userIdWGet]) as QuerySuccessResult
        return Number(count[0].common_friends_count)
    }

    async getFriendsCommonBetWeenUser(userId: number, userIdWGet: number, cursor: number, limit: number): Promise<RawDataMysql[]> {
        let query = `SELECT
        user.*
    FROM
        (
        SELECT DISTINCT
            addresseeid
        FROM
            relationship
        WHERE
            requesterid = ? AND relation = 1 AND addresseeid IN(
            SELECT DISTINCT
                addresseeid
            FROM
                relationship
            WHERE
                requesterid = ? AND relation = 1
        )
    UNION ALL
    SELECT DISTINCT
        requesterid
    FROM
        relationship
    WHERE
        addresseeid = ? AND relation = 1 AND requesterid IN(
        SELECT DISTINCT
            requesterid
        FROM
            relationship
        WHERE
            addresseeid = ? AND relation = 1
    )
    ) AS c
    JOIN user ON user.userId = c.addresseeid WHERE user.userId > ? ORDER BY user.userId LIMIT ? `
        let [data, _] = await this.db.executeQuery(query, [userId, userIdWGet, userId, userIdWGet, cursor, limit]) as QuerySuccessResult
        return data;
    }
    async deleteMySentInvite(userId: number, idInvite: number): Promise<boolean> {
        const query = 'DELETE FROM relationship WHERE relationship.id = ? AND relationship.requesterid = ? AND relationship.relation = ?'
        await this.db.executeQuery(query, [idInvite, userId, RelationshipUser.WAIT_RESPONSE_REQUEST_FRIEND])
        return true
    }
    async deleteInvite(userId: number, idInvite: number): Promise<boolean> {
        const query = 'DELETE FROM relationship WHERE relationship.id = ? AND relationship.addresseeid = ? AND relationship.relation = ?'
        await this.db.executeQuery(query, [idInvite, userId, RelationshipUser.WAIT_RESPONSE_REQUEST_FRIEND])
        return true
    }
    async getRelationship(userId: number, userIdWGet: number): Promise<number> {
        const query = `SELECT relationship.relation FROM relationship WHERE relationship.requesterid = ? AND relationship.addresseeid = ? 
                        UNION
                        SELECT relationship.relation FROM relationship WHERE relationship.requesterid = ? AND relationship.addresseeid = ?`
        let [relation, column] = await this.db.executeQuery(query, [userId, userIdWGet, userIdWGet, userId]) as QuerySuccessResult
        if (relation.length === 0) return RelationshipUser.NO_RELATIONSHIP;
        return Number(relation[0].relation)
    }
    async unFriend(userId: number, userIdUnFriend: number): Promise<boolean> {
        const query = 'DELETE FROM relationship WHERE relationship.requesterid = ? AND relationship.addresseeid = ?'
        await this.db.executeQuery(query, [userId, userIdUnFriend])
        return true
    }
    async getAllInvite(userId: number, cursor: number, limit: number): Promise<any> {
        const query = 'SELECT user.*, relationship.id, relationship.createAt FROM relationship JOIN user ON relationship.requesterid= user.userId WHERE relationship.relation = ? AND relationship.addresseeid = ? AND relationship.id > ? ORDER BY relationship.id LIMIT ?;'
        let [data, inforC] = await this.db.executeQuery(query, [RelationshipUser.WAIT_RESPONSE_REQUEST_FRIEND, userId, cursor, limit]) as any
        return data as any[]
    }
    async getSomeFriend(userId: number, cursor: number, limit: number): Promise<any[]> {
        let query = 'SELECT * FROM relationship JOIN user ON relationship.addresseeid = user.userId OR relationship.requesterid = user.userId WHERE relationship.relation = ? AND user.userId != ? AND user.userId > ? ORDER BY relationship.id LIMIT ?'
        let [data, inforC] = await this.db.executeQuery(query, [RelationshipUser.FRIEND, userId, cursor, limit]) as any
        return data as any[]
    }
    async acceptInviteFriend(userId: number, idInvite: number): Promise<boolean> {
        const query = 'UPDATE relationship SET relation = ? WHERE relationship.id= ?'
        await this.db.executeQuery(query, [1, idInvite])
        return true
    }
    async inviteToBecomeFriend(userIdSend: number, idReceiver: number) {
        const insertRequest = 'INSERT INTO relationship(relationship.requesterid, relationship.addresseeid, relationship.relation) VALUES (?,?,?)'
        await this.db.executeQuery(insertRequest, [userIdSend, idReceiver, RelationshipUser.WAIT_RESPONSE_REQUEST_FRIEND])
    }
}