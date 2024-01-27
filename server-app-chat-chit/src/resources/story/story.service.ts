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
import { OptionUploadStoryDTO } from "./dtos/upload.story";
import Story from "@/models/story.model";
import RelationService from "../relationship/relation.service";
import { RelationshipUser } from "../relationship/enums/relationship.enum";
import { Visibility } from "./enums/visibility";
import { ListStoryRes } from "./dtos/res.list.story";
@injectable()
export default class StoryService implements iStoryServiceBehavior {


    constructor(@inject(StoryRepository) private storyRepository: iStoryRepositoryBehavior) {
    }

    async getMyListStory(me: number, cursor: number, limit: number): Promise<ListStoryRes> {
        return ListStoryRes.rawToDTO(await TransformStory.rawsToModels(await this.storyRepository.exploreStoryFriends(me), async (id: string) => {
            return await CloudDrive.gI().getUrlFile(id);
        }))
    }

    async getVisibleStory(storyId: number): Promise<Visibility> {
        return this.storyRepository.getVisibleStory(storyId);
    }
    async isOwnerStory(userId: number, storyId: number): Promise<boolean> {
        return this.storyRepository.isOwnerStory(userId, storyId)
    }
    async getStoryById(userIdOwnerStory: number, me: number, storyId: number): Promise<Story> {
        let visibility = await this.getVisibleStory(storyId)
        switch (visibility) {
            case Visibility.PUBLIC:
                return TransformStory.rawToModel(this.storyRepository.getStoryById(storyId), async (id: string) => {
                    return await CloudDrive.gI().getUrlFile(id);
                })
            case Visibility.FRIEND:
                let relation = container.resolve(RelationService)
                if (!(await relation.getRelationship(userIdOwnerStory, me) === RelationshipUser.FRIEND) || userIdOwnerStory === me) {
                    return TransformStory.rawToModel(this.storyRepository.getStoryById(storyId), async (id: string) => {
                        return await CloudDrive.gI().getUrlFile(id);
                    })
                } else {
                    throw new MyException("This story is private").withExceptionCode(HttpStatus.FORBIDDEN)
                }
            case Visibility.PRIVATE:
                throw new MyException("This story is private").withExceptionCode(HttpStatus.FORBIDDEN)
        }
    }
    async loveStory(storyId: number, userId: number, isLove: boolean): Promise<any> {
        throw new Error('not imp ')
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
    async getStoryFromFriends(userId: number, cursor: number, limit: number): Promise<ListStoryRes> {
        return ListStoryRes.rawToDTO(await TransformStory.rawsToModels(await this.storyRepository.exploreStoryFriends(userId), async (id: string) => {
            return await CloudDrive.gI().getUrlFile(id);
        }))
    }
    async deleteStory(userId: number, storyId: number): Promise<boolean> {
        if (await this.isOwnerStory(userId, storyId)) {
            return await this.storyRepository.deleteStory(storyId)
        } else {
            throw new MyException("You are not owner this story").withExceptionCode(HttpStatus.FORBIDDEN)
        }
    }
    async seeStory(storyId: number, userId: number): Promise<any> {
        return await this.seeStory(storyId, userId)
    }
}