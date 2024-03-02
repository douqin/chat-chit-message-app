import Story from "@/models/story.model"
import { OptionUploadStoryDTO } from "../dtos/upload.story"
import { Visibility } from "../enums/visibility"
import { ListStoryRes } from "../dtos/res.list.story"

export default interface iStoryServiceBehavior {
    getStoryFromUser(me: number, userId: number, cursor: number, limit: number): Promise<ListStoryRes>

    loveStory(storyId: number, userId: number, isLove: boolean): Promise<any>

    uploadStory(userId: number, file: Express.Multer.File, option: OptionUploadStoryDTO): Promise<number>

    getStoryFromFriends(userId: number, cursor: number, limit: number): Promise<ListStoryRes>

    deleteStory(userId: number, storyId: number): Promise<boolean>

    seeStory(storyId: number, userId: number): Promise<any>

    getStoryById(userIdOwnerStory: number, me: number, storyId: number): Promise<Story>

    isOwnerStory(userId: number, storyId: number): Promise<boolean>

    getMyListStory(me: number, cursor: number, limit: number): Promise<ListStoryRes>

    getVisibleStory(storyId : number): Promise<Visibility>
}