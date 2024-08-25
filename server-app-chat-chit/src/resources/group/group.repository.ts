import { PositionInGrop } from './enum/group.position.enum';
import { CloudDrive } from '../../services/cloud/drive.service';

import { GroupRepositoryBehavior } from "./interface/group.repository.interface";
import { iDrive } from '../../services/cloud/drive.interface';
import { ResultSetHeader } from 'mysql2';
import { MemberStatus } from './enum/member.status.enum';
import { GroupStatus } from './enum/group.status.dto.enum';
import { GroupType } from './enum/group.type.enum';
import { Constant } from './constant/group.constant';
import { inject, injectable } from 'tsyringe';
import Group from '@/models/group.model';
import { GroupAccess } from './enum/group.access';
import { Database, iDatabase } from '@/lib/database';
import { RawDatabaseData } from '@/models/raw.data';
import { MyException, HttpStatus } from '@/lib/common';

@injectable()
export default class GroupRepository implements GroupRepositoryBehavior {

    constructor(@inject(CloudDrive) private drive: iDrive, @inject(Database) private db: iDatabase) {
    }
    async getAllRoom(userId: number): Promise<string[]> {
        const sql = `SELECT groupchat.room FROM 
        user INNER JOIN member ON user.userId = member.userId 
        JOIN groupchat ON member.groupId = groupchat.groupId
        WHERE user.userId = ?;`
        let [dataRaw, inforColimn]: any = await this.db.executeQuery(
            sql, [userId]
        )
        if (dataRaw) {
            return dataRaw;
        }
        return []; 
    }
    async getAccessGroup(groupId: number): Promise<GroupAccess> {
        const sql = 'SELECT groupchat.access FROM groupchat WHERE groupchat.groupId = ?'
        const [data] = await this.db.executeQuery(sql, [groupId]) as any;
        return data[0].access as GroupAccess
    }
    async getBaseInformationGroupFromLink(link: string): Promise<Group | null> {
        let sql = `SELECT * FROM groupchat WHERE groupchat.link = ?`
        let [data] = await this.db.executeQuery(sql, [link]) as any;
        if (data.length == 0) return null
        else if(data[0].type == GroupType.INVIDIAL) return null
        else if(data[0].access == GroupAccess.PRIVATE) return null
        return data[0]
    }
    async deleteGroup(groupId: number): Promise<boolean> {
        const query = 'DELETE FROM groupchat WHERE groupchat.groupId = ?'
        await this.db.executeQuery(query, [groupId])
        return true
    }
    async getTypeGroup(groupId: number): Promise<GroupStatus> {
        let sql = `SELECT groupchat.type FROM groupchat WHERE groupchat.groupId = ?`
        const [data] = await this.db.executeQuery(sql, [groupId]) as any;
        return data[0].type as GroupStatus  
    }
    async changeNickname(userId: number, userIdChange: number, groupId: number, nickname: string): Promise<boolean> {
        let sql = `UPDATE member SET member.nickname = ? WHERE member.userId = ? AND member.groupId = ?`
        await this.db.executeQuery(sql, [nickname, userIdChange, groupId])
        return true
    }
    async isExistInvidualGroup(userId: number, userIdAddressee: number): Promise<boolean> {
        let get = `SELECT * FROM groupchat as g JOIN member as m1 ON g.groupId = m1.groupId 
        JOIN member as m2 ON g.groupId = m2.groupId
        WHERE m1.id <> m2.id AND m1.userId = ? AND m2.userId = ? AND g.type = ?`
        let [data] = await this.db.executeQuery(get, [userId, userIdAddressee, GroupType.INVIDIAL]) as any
        return Boolean(data.length == 1);
    }
    async getInvidualGroup(userId: number, userIdAddressee: number): Promise<number> {
        let get = `SELECT * FROM groupchat as g JOIN member as m1 ON g.groupId = m1.groupId 
        JOIN member as m2 ON g.groupId = m2.groupId
        WHERE m1.id <> m2.id AND m1.userId = ? AND m2.userId = ? AND g.type = ?`
        let [data] = await this.db.executeQuery(get, [userId, userIdAddressee, GroupType.INVIDIAL]) as any
        return data[0].groupId as number;
    }
    async createInvidualGroup(userId: number, users: number, status: GroupStatus): Promise<number> {
        let groupId = -1;
        try {
            let query = `INSERT INTO groupchat( groupchat.name, groupchat.type, groupchat.status, groupchat.createAt) VALUES ( ?, ?, ?, now());`
            let data: [ResultSetHeader, any] = await this.db.executeQuery(
                query, ["INVIDIAL", GroupType.INVIDIAL, status]
            ) as any
            groupId = data[0].insertId
            await this.joinGroup(userId, groupId, PositionInGrop.MEMBER)
            await this.joinGroup(users, groupId, PositionInGrop.MEMBER)
        }
        catch (e) {
            throw new MyException("Có lỗi xảy ra, không thể tạo nhóm").withExceptionCode(HttpStatus.INTERNAL_SERVER_ERROR)
        }
        return groupId;
    }

    async getInformationMember(userId: number, groupId: number): Promise<any> {
        const query = 'SELECT * from (user JOIN member ON user.userId = member.userId) WHERE user.userId = ? AND member.groupId = ? AND member.status = ?'
        const [data, inforC] = await this.db.executeQuery(query, [userId, groupId, MemberStatus.DEFAULT]) as any
        return data[0]
    }
    async getTotalMember(groupId: number): Promise<number> {
        let query = `SELECT COUNT(*) FROM groupchat JOIN member ON member.groupId = groupchat.groupId WHERE groupchat.groupId = ?` //FIXME: check member staus suck as ban,...
        let [data] = await this.db.executeQuery(query, [groupId]);
        const [{ 'COUNT(*)': count }] = data as any;
        return count
    }
    async blockMember(userIdAdd: number, groupId: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    async changeStatusMember(userIdAdd: number, groupId: number, status: MemberStatus): Promise<boolean> {
        const query = `UPDATE member
        SET status = ?
        WHERE member.groupId = ? AND member.userId = ?;`
        await this.db.executeQuery(query, [status, groupId, userIdAdd])
        return true
    }
    async removeMember(groupId: number, userIdRemove: number): Promise<boolean> {
        const query = 'DELETE FROM member WHERE member.userId = ? AND member.groupId = ?'
        await this.db.executeQuery(query, [userIdRemove, groupId])
        return true
    }
    async removeManager(groupId: number, userIdAdd: any): Promise<boolean> {
        const query = `UPDATE member
        SET position = ?
        WHERE member.groupId = ? AND member.userId = ?;`
        let dd = await this.db.executeQuery(query, [PositionInGrop.MEMBER, groupId, userIdAdd])
        return true
    }
    async addManager(groupId: number, userIdAdd: number): Promise<boolean> {
        const query = `UPDATE member
        SET position = ?
        WHERE member.groupId = ? AND member.userId = ?;`
        await this.db.executeQuery(query, [PositionInGrop.ADMIN, groupId, userIdAdd])
        return true
    }
    async renameGroup(groupId: number, name: string): Promise<boolean> {
        const query = `UPDATE groupchat
        SET name = ?
        WHERE groupchat.groupId = ?;`
        await this.db.executeQuery(query, [name, groupId])
        return true
    }
    async checkMemberPermisstion(permisstion: string, userId: Number, groupId: Number) {
        try {
            let query = 'SELECT ' + permisstion + ' FROM groupchat_member_permission WHERE groupchat_member_permission.groupId = ? LIMIT 1'
            const [_permisstion] = await this.db.executeQuery(query, [groupId]) as any
            let a = Boolean(Number(_permisstion[0].autoapproval))
            return a
        }
        catch (e: any) {
            console.log("🚀 ~ GroupRepository ~ checkMemberPermisstion ~ e:", e)
            throw new MyException("Unable to join this group").withExceptionCode(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    async addUserToApprovalQueue(userId: number, groupId: number): Promise<void> {
        try {
            let query = "INSERT INTO member(member.groupId, member.userId, member.position, member.status) VALUES (?, ?, ?, ?) "
            let [data] = await this.db.executeQuery(query, [groupId, userId, PositionInGrop.CON_CAC, MemberStatus.PENDING])
        }
        catch (e: any) {
            console.log("🚀 ~ GroupRepository ~ addUserToApprovalQueue ~ e:", e)
            throw new MyException("Unable to join this group").withExceptionCode(HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    async joinGroup(userId: number, groupId: number, positionUser: number = PositionInGrop.MEMBER): Promise<boolean> {
        try {
            let query = "INSERT INTO member(member.groupId, member.userId, member.position) VALUES (?, ?, ?) "
            let [data] = await this.db.executeQuery(query, [groupId, userId, positionUser])
            return true
        }
        catch (e: any) {
            throw new MyException("Unable to join this group")
        }
    }
    async isContainInGroup(userId: number, groupId: number, status_check?: MemberStatus): Promise<boolean> {
        let sql = `SELECT COUNT(*) FROM member WHERE member.userId = ? AND member.groupId = ? ${((status_check) ? 'AND member.status = ?' : '')}`
        let [data] = await this.db.executeQuery(sql, [userId, groupId, status_check]);
        const [{ 'COUNT(*)': count }] = data as any;
        let  a = Boolean(Number(count) === 1)
        return a
    }
    async changeAvatarGroup(userId: number, groupId: number, file: Express.Multer.File) {
        let position = await this.getPosition(groupId, userId)
        if (position == PositionInGrop.CREATOR || PositionInGrop.ADMIN) {
            const query = 'SELECT groupchat.avatar FROM groupchat WHERE groupchat.groupId = ? '
            const [[{ 'avatar': avatar }], column] = await this.db.executeQuery(query, [groupId]) as any;
            if (avatar) {
                await this.drive.delete(avatar)
            }
            return this.drive.uploadFile(file.filename, file.buffer);
        } else throw new MyException("You don't have permisson for action").withExceptionCode(HttpStatus.FORBIDDEN)
    }
    async getAllMember(groupId: number): Promise<object[]> {
        let query = "SELECT * from (user JOIN member ON user.userId = member.userId) WHERE member.groupId = ? AND member.status = ?"
        let [rows] = await this.db.executeQuery(query, [groupId, MemberStatus.DEFAULT])
        console.log(rows)
        return rows as object[];
    }
    async getAllUserPending(groupId: number): Promise<object[]> {
        let query = "SELECT * from (user JOIN member ON user.userId = member.userId) WHERE member.groupId = ? AND member.status = ?"
        let [rows] = await this.db.executeQuery(query, [groupId, MemberStatus.PENDING])
        console.log(rows)
        return rows as object[];
    }
    async leaveGroup(userId: any, groupId: number): Promise<boolean> {
        let position = await this.getPosition(groupId, userId)
        if (position != PositionInGrop.CREATOR)
            await this.db.executeQuery(
                `DELETE FROM member WHERE member.userId = ${userId} AND member.groupId = ${groupId}`
            );
        else throw new MyException("Admin tạo ra group không thể rời group")
        return true
    }
    async getOneGroup(groupId: number): Promise<object | null> {
        let query = `SELECT * FROM groupchat WHERE groupchat.groupId = ?;`
        let [dataRaw, col]: any = await this.db.executeQuery(
            query, [
            groupId
        ]
        )
        return dataRaw[0]
    }
    async getAllGroup(userId: number): Promise<any[]> {
        let query = `SELECT groupchat.* FROM 
        user INNER JOIN member ON user.userId = member.userId 
        JOIN groupchat ON member.groupId = groupchat.groupId
        WHERE user.userId = ?;`
        let [dataRaw, inforColimn]: any = await this.db.executeQuery(
            query, [userId]
        )
        if (dataRaw) {
            return dataRaw;
        }
        return []; this
    }
    async getSomeGroup(userId: number, cursor: number, limit: number): Promise<RawDatabaseData[]> {
        if (cursor !== Constant.GET_GROUP_FROM_CURSOR_MAX) {
            let query = `
            SELECT
        *
    FROM
        (
        SELECT
            groupchat.*,
            (
            SELECT
                MAX(message.messageId)
            FROM
                message
            JOIN member AS MEM
            ON
                MEM.id = message.memberId
            WHERE
                MEM.groupId = groupchat.groupId
        ) AS _cursor
    FROM
        user
    INNER JOIN member ON user.userId = member.userId
    JOIN groupchat ON member.groupId = groupchat.groupId
    WHERE
        user.userId = ?
    ) AS sub
    WHERE
        _cursor < ?
    ORDER BY
        _cursor
    DESC
    LIMIT ?    
           `
            let [dataRaw, inforColimn]: any = await this.db.executeQuery(
                query, [userId, cursor, limit]
            )
            if (dataRaw) {
                return dataRaw;
            }
        } else {
            let query = `SELECT
            *
        FROM
            (
            SELECT
                groupchat.*,
                (
                SELECT
                    MAX(message.messageId)
                FROM
                    message
                JOIN member AS MEM
                ON
                    MEM.id = message.memberId
                WHERE
                    MEM.groupId = groupchat.groupId
            ) AS _cursor
        FROM
            user
        INNER JOIN member ON user.userId = member.userId
        JOIN groupchat ON member.groupId = groupchat.groupId
        WHERE
            user.userId = ?
        ) AS sub
        WHERE
            _cursor <(
                (
                SELECT
                    MAX(message.messageId)
                FROM
                    message
            ) + 1
            )
        ORDER BY
            _cursor
        DESC
        LIMIT ?`
            let [dataRaw, inforColimn]: any = await this.db.executeQuery(
                query, [userId, limit]
            )
            if (dataRaw) {
                return dataRaw;
            }
        }
        return []
    }
    async createGroup(name: string, userId: number, users: Array<number>, typeGroup: number = GroupType.COMMUNITY): Promise<any> {
        let groupId = -1;
        let group = null;
        try {
            let query = `INSERT INTO groupchat( groupchat.name, groupchat.type, groupchat.status, groupchat.createAt) VALUES ( ?, ?, ?, now());`
            let data: [ResultSetHeader, any] = await this.db.executeQuery(
                query, [name, typeGroup, GroupStatus.DEFAULT]
            ) as any
            groupId = data[0].insertId
            await this.joinGroup(userId, groupId, PositionInGrop.CREATOR)
            for (let userId of users) {
                await this.joinGroup(userId, groupId, PositionInGrop.MEMBER)
            }
            group = await this.getOneGroup(groupId);
        }
        catch (e) {
            console.log("🚀 ~ file: group.repository.ts:163 ~ GroupRepository ~ createGroup ~ e:", e)
            throw new MyException("Có lỗi xảy ra, không thể tạo nhóm").withExceptionCode(HttpStatus.INTERNAL_SERVER_ERROR)
        }
        return group;
    }
    async getLastViewMember(groupId: number): Promise<object[] | undefined> {
        let rawDataSQL: any = await this.db.executeQuery(
            `SELECT user.userId, user.name, user.avatar, member.lastview FROM (( groupchat JOIN member ON groupchat.groupId = member.groupId AND groupchat.groupId = ${groupId}) JOIN user ON user.userId = member.userId)
            `
        )
        if (rawDataSQL) {
            return rawDataSQL[0]
        }
        return undefined;
    }
    async getPosition(groupId: Number, userId: Number) {
        let [[{ 'position': position }], column] = await this.db.executeQuery(`SELECT member.position From member where member.groupId = ? AND member.userId = ?`, [groupId, userId]) as any;
        return position;
    }
}