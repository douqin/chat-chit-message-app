import { OptionUploadStoryDTO } from "../dtos/upload.stoty"
import { ReactStory } from "../enums/story.react.enum"

export default interface iStoryServiceBehavior {

    reacStory(storyId: number, userId: number, react: ReactStory): Promise<any>

    uploadStory(userId: number, file: Express.Multer.File, option: OptionUploadStoryDTO): Promise<number>

    getAllStoryFromFriends(userId: number): Promise<any>

    deleteStory(storyId: number): Promise<any>

    seeStory(storyId: number, userId: number): Promise<any>

    getStoryById(userIdOwnerStory: number, me: number, storyId: number): Promise<any>

}