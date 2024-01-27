import Story from "@/models/story.model";
import { PagingRes } from "@/utils/paging/paging.data";

export class ListStoryRes extends PagingRes<Story, number | null>{
    constructor(data: Story[], nextCursor: number | null , totalSize: number = 0) {
        super(data, nextCursor, totalSize)
    }
    static rawToDTO(raws: Story[]) : ListStoryRes {
        let dto = new ListStoryRes([], null)
        for (let raw of raws) {
            dto.data.push(raw)
            dto.nextCursor = raw.storyId
        }
        return dto
    }
}