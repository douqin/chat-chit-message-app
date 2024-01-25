import { ReactMessage } from "@/resources/messaging/enum/message.react.enum"
import { ReactStory } from "../enums/story.react.enum"
import { RawDataMysql } from "@/models/raw.data"
import { OptionUploadStoryDTO } from "../dtos/upload.stoty"

export default interface iStoryRepositoryBehavior {

    reacStory(storyId: number, userId: number, react: ReactStory): Promise<true>

    getStoryById(storyId: number): Promise<RawDataMysql>

    uploadStory(file: Express.Multer.File, userId: number, option: OptionUploadStoryDTO): Promise<number>

    getAllStoryFromFriends(userId: number): Promise<RawDataMysql[]>

    deleteStory(storyId: number): Promise<boolean>

    seeStory(storyId: number, userId: number): Promise<boolean>

}