import StoryRepository from "./story.repository";
import iStoryServiceBehavior from "./interfaces/story.service.interface";
import MyException from "@/utils/exceptions/my.exception";
import { TransformStory } from "@/utils/transform/story.transform";
import { CloudDrive } from "../../services/cloud/drive.service";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import iStoryRepositoryBehavior from "./interfaces/story.repository.interface";
import { ReactStory } from "./enums/story.react.enum";
import { container, inject, injectable } from "tsyringe";
import { ValidateErrorBuilder } from "@/utils/validate";
import { OptionUploadStoryDTO } from "./dtos/upload.stoty";
import Story from "@/models/story.model";
import RelationService from "../relationship/relation.service";
import { RelationshipUser } from "../relationship/enums/relationship.enum";
@injectable()
export default class StoryService implements iStoryServiceBehavior {

    constructor(@inject(StoryRepository) private storyRepository: iStoryRepositoryBehavior) {
    }
    async getStoryById(userIdOwnerStory: number, me: number, storyId: number): Promise<Story> {
        //FIXME: check relationship between user and owner story and check story is public to see
        return TransformStory.rawToModel(this.storyRepository.getStoryById(storyId), async (id: string) => {
            return await CloudDrive.gI().getUrlFile(id);
        })
    }
    async reacStory(storyId: number, userId: number, react: ReactStory): Promise<any> {
        await this.storyRepository.reacStory(storyId, userId, react)
    }
    async uploadStory(userId: number, file: Express.Multer.File, option: OptionUploadStoryDTO): Promise<number> {
        if (!file.mimetype.includes('image') && !file.mimetype.includes('video')) {
            throw new MyException(
                new ValidateErrorBuilder()
                    .setProperty("file")
                    .setConstraints({ "file": "File is image or video" })
                    .WrapArrayToJson()
            ).withExceptionCode(HttpStatus.BAD_REQUEST)
        }
        return await this.storyRepository.uploadStory(file, userId, option)
    }
    async getAllStoryFromFriends(userId: number): Promise<any> {
        return TransformStory.rawsToModels(await this.storyRepository.getAllStoryFromFriends(userId), async (id: string) => {
            return await CloudDrive.gI().getUrlFile(id);
        })
    }
    async deleteStory(storyId: number): Promise<any> {
        return await this.storyRepository.deleteStory(storyId)
    }
    async seeStory(storyId: number, userId: number): Promise<any> {
        return await this.seeStory(storyId, userId)
    }
}