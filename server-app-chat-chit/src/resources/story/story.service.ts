import StoryRepository from "./story.repository";
import iStoryServiceBehavior from "./interfaces/story.service.interface";
import MyException from "@/utils/exceptions/my.exception";
import TransformStory from "@/utils/transform/story.transform";
import { CloudDrive } from "../../component/cloud/drive.service";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import { ReactMessage } from "../messaging/enum/message.react.enum";
import iStoryRepositoryBehavior from "./interfaces/story.repository.interface";
import { ReactStory } from "./enums/story.react.enum";
import { inject, injectable } from "tsyringe";
@injectable()
export default class StoryService implements iStoryServiceBehavior {
    
    constructor(@inject(StoryRepository) private storyRepository: iStoryRepositoryBehavior) {
    }
    async reacStory(idstory: number, iduser: number, react: ReactStory): Promise<any> {
        await this.storyRepository.reacStory(idstory, iduser, react)
    }
    async uploadStory(file: any, iduser: number): Promise<any> {
        if (!file.mimetype.includes('image') && !file.mimetype.includes('video')) {
            throw new MyException("File không hợp lệ").withExceptionCode(HttpStatus.BAD_REQUEST)
        }
        return TransformStory.rawToModel(await this.storyRepository.uploadStory(file, iduser), async (id: string) => {
            return await CloudDrive.gI().getUrlFile(id);
        })
    }

    async getAllStoryFromFriends(iduser: number): Promise<any> {
        return TransformStory.rawsToModels(await this.storyRepository.getAllStoryFromFriends(iduser), async (id: string) => {
            return await CloudDrive.gI().getUrlFile(id);
        })
    }
    async deleteStory(idstory: number): Promise<any> {
        return await this.storyRepository.deleteStory(idstory)
    }
    async seeStory(idstory: number, iduser: number): Promise<any> {
        return await this.seeStory(idstory, iduser)
    }
}