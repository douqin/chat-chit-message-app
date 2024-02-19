import Story from "@/models/story.model";
import MyException from "../exceptions/my.exception";
import { HttpStatus } from "../extension/httpstatus.exception";
import { RawDataMysql } from "@/models/raw.data";

export class TransformStory {
    static async rawToModel(data: RawDataMysql, callback: (id: string) => Promise<string | null | undefined>): Promise<Story> {
        const {
            storyId, userIdOwner, createAt, content, viewed
        } = data;
        let value = new Story(storyId, userIdOwner, createAt, content)
        value.viewed = viewed;
        let url = await callback!(value.content)
        if (url) {
            value.content = url
        } else throw new MyException("Error when handling file").withExceptionCode(HttpStatus.INTERNAL_SERVER_ERROR)
        return value
    }
    static async rawsToModels(data: RawDataMysql[], callback: (id: string) => Promise<string | null | undefined>): Promise<Story[]> {
        let value = [];
        for(let raw  of data){
            value.push(await TransformStory.rawToModel(raw, callback))
        }
        return value
    }
}