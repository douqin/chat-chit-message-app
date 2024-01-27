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
    async getVisibleStory(storyId: number): Promise<Visibility> {
        const query = `SELECT visibility FROM story WHERE storyId = ?`
        const [raw, infoC] = await this.db.executeQuery(query, [storyId]) as any
        if(raw.length == 0) throw new MyException("Story not found").withExceptionCode(404)
        return raw[0].visibility
    }
    async getMyListStory(me: number): Promise<RawDataMysql[]> {
        const query = `SELECT * FROM story WHERE story.userIdOwner = ?`
        const [raw, infoC] = await this.db.executeQuery(query, [me]) as any
        return raw
    }
    async isOwnerStory(userId : number, storyId : number): Promise<boolean> {
        const query = `SELECT story.userIdOwner FROM story WHERE storyId = ? limit 1`
        const [raw, infoC] = await this.db.executeQuery(query, [storyId]) as any
        if(raw.length == 1){
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
        WHERE relation = ?`
        // let queryGetAllFriend = "SELECT * FROM relationship WHERE (requesterid = ? || addresseeid = ?) AND relation = ?"
        // let [data] = await MySql.excuteQuery(queryGetAllFriend, [userId, userId, Relationshipuser.FRIEND]) as any
        // let arr = [];
        // for (let element of data) {
        //     let queryGetStory = "SELECT * FROM story JOIN user ON user.userId = story.userIdOwner AND story.userIdOwner = ?"
        //     let [story] = await MySql.excuteQuery(queryGetStory, [(element.requesterid == userId ? element.addresseeid : element.requesterid)]) as any
        //     console.log("🚀 ~ file: story.repository.ts:36 ~ StoryRepository ~ getAllStoryFromFriends ~ story:", story)
        //     let queryCheckIsViewed = "SELECT COUNT(*) FROM storyview WHERE viewer = ? AND storyId = ?"
        //     const [{ 'COUNT(*)': count }] = await MySql.excuteQuery(queryCheckIsViewed, [userId, story[0].storyId]) as any
        //     story[0].viewed = Boolean(Number(count) === 1);
        //     arr.push(story[0])
        // }
        let [arr] = await this.db.executeQuery(query, [userId, userId, userId, RelationshipUser.FRIEND]) as any
        console.log("🚀 ~ file: story.repository.ts:73 ~ StoryRepository ~ getAllStoryFromFriends ~ arr:", arr)
        return arr
    }
    async deleteStory(storyId: number): Promise<boolean> {
        let query = "DELETE FROM story WHERE story.storyId = ?"
        await this.db.executeQuery(query, [storyId])
        return true;
    }
    async seeStory(storyId: number, userId: number): Promise<any> {
        let query = "INSERT INTO storyview (user_id, story_id) VALUES (?, ?);        "
        await this.db.executeQuery(query, [storyId, userId])
        return true;
    }
}