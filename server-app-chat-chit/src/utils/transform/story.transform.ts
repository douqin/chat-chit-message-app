import Story from "@/resources/story/dtos/story.model";
import MyException from "../exceptions/my.exception";
import { HttpStatus } from "../extension/httpstatus.exception";

export default class TransformStory {
    static async rawToModel(data: any, callback: (id: string) => Promise<string | null | undefined>): Promise<Story> {
        const {
            idstory, iduserowner, createat, content, viewed
        } = data;
        let value = new Story(idstory, iduserowner, createat, content)
        value.viewed = viewed;
        let url = await callback!(value.content)
        if (url) {
            value.content = url
        } else throw new MyException("Lỗi xử lí url ảnh").withExceptionCode(HttpStatus.INTERNAL_SERVER_ERROR)
        return value
    }
    static async rawsToModels(data: any[], callback: (id: string) => Promise<string | null | undefined>): Promise<Story[]> {
        let value = [];
        for(let raw  of data){
            value.push(await TransformStory.rawToModel(raw, callback))
        }
        return value
    }
}