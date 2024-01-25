import { CloudDrive } from "../../services/cloud/drive.service";
import { iDrive } from "../../services/cloud/drive.interface";
import iStoryRepositoryBehavior from "./interfaces/story.repository.interface";
import MyException from "@/utils/exceptions/my.exception";
import { RelationshipUser } from "../relationship/enums/relationship.enum";
import { ReactStory } from "./enums/story.react.enum";
import { inject, injectable } from "tsyringe";
import { Database, iDatabase } from "@/lib/database";
import { RawDataMysql } from "@/models/raw.data";
import { OptionUploadStoryDTO } from "./dtos/upload.stoty";



@injectable()
export default class StoryRepository implements iStoryRepositoryBehavior {


    constructor(@inject(CloudDrive) private drive: iDrive, @inject(Database) private db: iDatabase) {
    }
    async getStoryById(storyId: number): Promise<RawDataMysql> {
        const query = `SELECT * FROM story WHERE storyId = ?`
        const [raw, infoC] = await this.db.executeQuery(query, [storyId]) as any
        return raw[0]
    }
    async reacStory(storyId: number, userId: number, react: ReactStory): Promise<any> {
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

    async getAllStoryFromFriends(userId: number): Promise<RawDataMysql[]> {
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

    async deleteStory(storyId: number): Promise<any> {
        let query = "DELETE FROM story WHERE story.userIdOwner = ?"
        await this.db.executeQuery(query, [storyId])
        return true;
    }

    async seeStory(storyId: number, userId: number): Promise<any> {
        let query = "INSERT INTO storyview (user_id, story_id) VALUES (?, ?);        "
        await this.db.executeQuery(query, [storyId, userId])
        return true;
    }

}