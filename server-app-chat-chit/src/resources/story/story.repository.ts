import { CloudDrive } from "../../services/cloud/drive.service";
import { iDrive } from "../../services/cloud/drive.interface";
import iStoryRepositoryBehavior from "./interfaces/story.repository.interface";
import MyException from "@/utils/exceptions/my.exception";
import { RelationshipUser } from "../relationship/enums/relationship.enum";
import { ReactStory } from "./enums/story.react.enum";
import { inject, injectable } from "tsyringe";
import { Database, iDatabase } from "@/lib/database";
import { RawDataMysql } from "@/models/raw.data";
import { OptionUploadStoryDTO } from "./dtos/upload.story";
import { Visibility } from "./enums/visibility";



@injectable()
export default class StoryRepository implements iStoryRepositoryBehavior {

    constructor(@inject(CloudDrive) private drive: iDrive, @inject(Database) private db: iDatabase) {
    }
    async getStoryFromUser(userId: number, limit: number, cursor: number, relationship: RelationshipUser): Promise<RawDataMysql[]> {
        console.log("🚀 ~ StoryRepository ~ getStoryFromUser ~ relationship:", relationship)
        console.log("🚀 ~ StoryRepository ~ getStoryFromUser ~ userId:", userId)
        if (cursor == -1) {
            switch (relationship) {
                case RelationshipUser.FRIEND:
                    let sql = `SELECT * FROM story WHERE story.userIdOwner = ? AND (visibility = ? OR visibility = ?) ORDER BY story.createAt DESC  LIMIT ?`
                    const [data, c] = await this.db.executeQuery(sql, [userId, Visibility.PUBLIC, Visibility.FRIEND, limit]) as any
                    console.log("🚀 ~ StoryRepository ~ getStoryFromUser ~ data:", data)
                    return data
                case RelationshipUser.NO_RELATIONSHIP:
                    let sql1 = `SELECT * FROM story WHERE story.userIdOwner = ? AND  visibility = ? ORDER BY story.createAt DESC  LIMIT ?`
                    const [data2, c2] = await this.db.executeQuery(sql1, [userId,Visibility.PUBLIC, limit]) as any
                    console.log("🚀 ~ StoryRepository ~ getStoryFromUser ~ data2:", data2)
                    return data2
                default: {
                    throw new MyException("You are not friend with this user").withExceptionCode(400);
                }
            }
        } else {
            switch (relationship) {
                case RelationshipUser.FRIEND:
                    let sql = `SELECT * FROM story WHERE story.userIdOwner = ? AND story.storyId < ? AND (visibility = ? OR visibility = ?) ORDER BY story.createAt DESC  LIMIT ?`
                    const [data, c] = await this.db.executeQuery(sql, [userId, cursor, Visibility.PUBLIC, Visibility.FRIEND, limit]) as any
                    return data
                case RelationshipUser.NO_RELATIONSHIP:
                    let sql1 = `SELECT * FROM story WHERE story.userIdOwner = ? AND story.storyId < ? AND  visibility = ? ORDER BY story.createAt DESC  LIMIT ?`
                    const [data2, c2] = await this.db.executeQuery(sql1, [userId, cursor, Visibility.PUBLIC, limit]) as any
                    return data2
                default: {
                    throw new MyException("You are not friend with this user").withExceptionCode(400);
                }
            }
        }
    }
    async loveStory(storyId: number, userId: number, isLove: boolean): Promise<boolean> {
        if (isLove) {
            const sql = `SELECT * FROM react_story WHERE storyId = ? AND userIdReact = ?`
            const [raw, infoC] = await this.db.executeQuery(sql, [storyId, userId]) as any
            if (raw.length > 0) throw new MyException("You have already reacted this story").withExceptionCode(400)
            let query = `INSERT INTO react_story(storyId, userIdReact) VALUES (?, ?)`
            await this.db.executeQuery(query, [storyId, userId])
        } else {
            const queryCheck = `DELETE FROM react_story WHERE storyId = ? AND userIdReact = ?`
            const [raw, infoC] = await this.db.executeQuery(queryCheck, [storyId, userId]) as any
        }
        return true
    }
    async getVisibleStory(storyId: number): Promise<Visibility> {
        const query = `SELECT visibility FROM story WHERE storyId = ?`
        const [raw, infoC] = await this.db.executeQuery(query, [storyId]) as any
        if (raw.length == 0) throw new MyException("Story not found").withExceptionCode(404)
        return raw[0].visibility
    }
    async getMyListStory(me: number, limit: number, cursor: number): Promise<RawDataMysql[]> {
        console.log("🚀 ~ StoryRepository ~ getMyListStory ~ me:", me)
        const query = `SELECT * FROM story WHERE story.userIdOwner = ? AND story.storyId > ? ORDER BY story.createAt DESC  LIMIT 10`
        const [raw, infoC] = await this.db.executeQuery(query, [me, cursor, limit]) as any
        return raw
    }
    async isOwnerStory(userId: number, storyId: number): Promise<boolean> {
        const query = `SELECT story.userIdOwner FROM story WHERE storyId = ? limit 1`
        const [raw, infoC] = await this.db.executeQuery(query, [storyId]) as any
        if (raw.length == 1) {
            return Number(raw[0].userIdOwner) === userId
        }
        return false
    }
    async getStoryById(storyId: number): Promise<RawDataMysql> {
        const query = `SELECT * FROM story WHERE storyId = ? limit 1`
        const [raw, infoC] = await this.db.executeQuery(query, [storyId]) as any
        return raw[0]
    }
    async reactStory(storyId: number, userId: number, react: ReactStory): Promise<any> {
        const query = `INSERT INTO react_story(storyId, userIdReact, type) VALUE(
            ?, ?, ?
        )`
        const [raw, inforC] = await this.db.executeQuery(query, [storyId, userId, react])
        return true
    }
    async uploadStory(file: Express.Multer.File, userId: number, option: OptionUploadStoryDTO): Promise<number> {
        let infoFile = await this.drive.uploadFile(file.filename, file.stream)
        if (infoFile) {
            const querySaveId = `INSERT INTO story (userIdOwner, content, visibility) VALUES ( ?, ?, ?)`
            let [data] = await this.db.executeQuery(querySaveId, [userId, infoFile.id, option.visibility]) as any
            return data.insertId
        }
        throw new MyException("Error when server handling file").withExceptionCode(500)
    }
    async exploreStoryFriends(userId: number): Promise<RawDataMysql[]> {
        let query = `SELECT
        user.*,
        story.*,
        (
        SELECT
            COUNT(CTEE.viewer)
        FROM
            (
            SELECT
                a.storyId ,
                userIdOwner,
                viewer
            FROM
                story AS a
            JOIN storyview AS aa
            ON
                a.storyId = aa.storyId
        ) AS CTEE
        WHERE
            CTEE.viewer = ? AND CTEE.storyId = story.storyId
        ) as viewed
        FROM
            relationship
        JOIN user ON(
            relationship.requesterid = user.userId AND relationship.addresseeid = ?
        ) OR(
            relationship.addresseeid = user.userId AND relationship.requesterid = ?
        )
        JOIN story ON story.userIdOwner = user.userId
        LEFT JOIN storyview ON story.storyId = storyview.storyId
        WHERE relation = ? AND DATE_SUB(NOW(), INTERVAL 1 DAY) < story.createAt;`
        let [arr] = await this.db.executeQuery(query, [userId, userId, userId, RelationshipUser.FRIEND]) as any
        return arr
    }
    async deleteStory(storyId: number): Promise<boolean> {
        let query = "DELETE FROM story WHERE story.storyId = ?"
        await this.db.executeQuery(query, [storyId])
        return true;
    }
    async seeStory(storyId: number, userId: number): Promise<any> {
        let query = "INSERT INTO storyview (viewer, storyId) VALUES (?, ?);        "
        await this.db.executeQuery(query, [storyId, userId])
        return true;
    }
}