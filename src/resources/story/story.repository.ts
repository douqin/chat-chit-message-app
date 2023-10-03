import { ServiceDrive } from "../../component/cloud/drive.service";
import { iDrive } from "../../component/cloud/drive.interface";
import iStoryRepositoryBehavior from "./interfaces/story.repository.interface";
import { MySql } from "@/config/sql/mysql";
import { ResultSetHeader } from "mysql2";
import { Readable } from "stream";
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
        //get friend
        let queryGetAllFriend = "SELECT * FROM relationship WHERE (iduser1 = ? || iduser2 = ?) AND relation = ?"
        let [data] = await MySql.excuteQuery(queryGetAllFriend, [iduser, iduser,  RelationshipUser.FRIEND]) as any
        let arr = [];
        for (let element of data) {
            let queryGetStory = "SELECT * FROM story JOIN user ON user.iduser = story.iduserowner AND story.iduserowner = ?"
            let [story] = await MySql.excuteQuery(queryGetStory, [element]) as any
            arr.push(story[0])
        }
        return arr
    }

    deleteStory(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    seeStory(): Promise<any> {
        throw new Error("Method not implemented.");
    }

}