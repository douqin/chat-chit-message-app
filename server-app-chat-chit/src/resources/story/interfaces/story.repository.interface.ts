import { ReactMessage } from "@/resources/messaging/enum/message.react.enum"
import { ReactStory } from "../enums/story.react.enum"
import { RawDataMysql } from "@/models/raw.data"
import { OptionUploadStoryDTO } from "../dtos/upload.story"
import { Visibility } from "../enums/visibility"

export default interface iStoryRepositoryBehavior {
    loveStory(storyId: number, userId: number, isLove: boolean): Promise<boolean>
    
    getVisibleStory(storyId: number): Promise<Visibility>
    
    getMyListStory(me: number): Promise<RawDataMysql[]>

    reactStory(storyId: number, userId: number, react: ReactStory): Promise<true>

    getStoryById(storyId: number): Promise<RawDataMysql>

    uploadStory(file: Express.Multer.File, userId: number, option: OptionUploadStoryDTO): Promise<number>

    exploreStoryFriends(userId: number): Promise<RawDataMysql[]>

    deleteStory(storyId: number): Promise<boolean>

    seeStory(storyId: number, userId: number): Promise<boolean>

    isOwnerStory(userId : number, storyId : number): Promise<boolean>

}