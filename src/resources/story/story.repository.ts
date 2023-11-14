import { ServiceDrive } from "../../component/cloud/drive.service";
import { iDrive } from "../../component/cloud/drive.interface";
import iStoryRepositoryBehavior from "./interfaces/story.repository.interface";
import { MySql } from "@/config/sql/mysql";
import MyException from "@/utils/exceptions/my.exception";
import { RelationshipUser } from "../relationship/enums/relationship.enum";


export default class StoryRepository implements iStoryRepositoryBehavior {

    public drive: iDrive
    constructor() {
        this.drive = ServiceDrive.gI();
    }

    async uploadStory(file: Express.Multer.File, iduser: number): Promise<any> {
        let inforFile = await this.drive.uploadFile(file.filename, file.buffer)
        if (inforFile) {
            const querySaveId = `INSERT INTO story (iduserowner, content) VALUES ( ?, ?)`
            let [data] = await MySql.excuteQuery(querySaveId, [iduser, inforFile.id]) as any
            let queryGetInformationStory = "SELECT * FROM story WHERE story.idstory = ?"
            let [getInforStory] = await MySql.excuteQuery(queryGetInformationStory, [data.insertId]) as any
            return getInforStory[0]
        }
        return new MyException("Lỗi upload file ").withExceptionCode(500)
    }

    async getAllStoryFromFriends(iduser: number): Promise<any> {
        let query = `SELECT
        user.*,
        story.*,
        (
        SELECT
            COUNT(CTEE.viewer)
        FROM
            (
            SELECT
                a.idstory ,
                iduserowner,
                viewer
            FROM
                story AS a
            JOIN storyview AS aa
            ON
                a.idstory = aa.idstory
        ) AS CTEE
    WHERE
        CTEE.viewer = ? AND CTEE.idstory = story.idstory
    ) as viewed
    FROM
        relationship
    JOIN user ON(
            relationship.requesterid = user.iduser AND relationship.addresseeid = ?
        ) OR(
            relationship.addresseeid = user.iduser AND relationship.requesterid = ?
        )
    JOIN story ON story.iduserowner = user.iduser
    LEFT JOIN storyview ON story.idstory = storyview.idstory
    WHERE relation = ?`
        // let queryGetAllFriend = "SELECT * FROM relationship WHERE (requesterid = ? || addresseeid = ?) AND relation = ?"
        // let [data] = await MySql.excuteQuery(queryGetAllFriend, [iduser, iduser, Relationshipuser.FRIEND]) as any
        // let arr = [];
        // for (let element of data) {
        //     let queryGetStory = "SELECT * FROM story JOIN user ON user.iduser = story.iduserowner AND story.iduserowner = ?"
        //     let [story] = await MySql.excuteQuery(queryGetStory, [(element.requesterid == iduser ? element.addresseeid : element.requesterid)]) as any
        //     console.log("🚀 ~ file: story.repository.ts:36 ~ StoryRepository ~ getAllStoryFromFriends ~ story:", story)
        //     let queryCheckIsViewed = "SELECT COUNT(*) FROM storyview WHERE viewer = ? AND idstory = ?"
        //     const [{ 'COUNT(*)': count }] = await MySql.excuteQuery(queryCheckIsViewed, [iduser, story[0].idstory]) as any
        //     story[0].viewed = Boolean(Number(count) === 1);
        //     arr.push(story[0])
        // }
        let [arr] = await MySql.excuteQuery(query, [iduser, iduser, iduser, RelationshipUser.FRIEND]) as any
        console.log("🚀 ~ file: story.repository.ts:73 ~ StoryRepository ~ getAllStoryFromFriends ~ arr:", arr)
        return arr
    }

    async deleteStory(idstory: number): Promise<any> {
        let query = "DELETE FROM story WHERE story.iduserowner = ?"
        await MySql.excuteQuery(query, [idstory])
        return true;
    }

    async seeStory(idstory: number, iduser: number): Promise<any> {
        let query = "INSERT INTO storyview (user_id, story_id) VALUES (?, ?);        "
        await MySql.excuteQuery(query, [idstory, iduser])
        return true;
    }

    async getViewedStory(iduser: number): Promise<any> {
        let query = "SELECT * FROM storyview WHERE viewer = ?"
        let [data] = await MySql.excuteQuery(query, [iduser])
        return data;
    }
}