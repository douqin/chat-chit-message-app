import { PagingRes } from "@/utils/paging/paging.data";
import Message from "../../../models/message.model";

export class dataResponseDTO  extends PagingRes<Message, number | null>{
    constructor(
        data: Array<Message>,
        nextCursor: number | null,
        totalSize: number = 0
    ) {
        super(data, nextCursor, totalSize)
    }
    static rawToData(raws: Message[]): dataResponseDTO {
        let dto = new dataResponseDTO([], null)
        for (let dtoMessage of raws) {
            dto.data.push(dtoMessage)
            dto.nextCursor = dtoMessage.messageId
        }
        return dto;
    }
}