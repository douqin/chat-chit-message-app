import Message from "../../../models/message.model";

export class ListMessageResponseDTO {
    constructor(
        public listMessage : Array<Message>,
        public nextCursor : number | null,
        public totalSize : number = 0
    ){

    }
    static rawToData(raws : Message[]) : ListMessageResponseDTO {
        let dto = new ListMessageResponseDTO([], null)
        for(let dtoMessage of raws){
            dto.listMessage.push(dtoMessage)
            dto.nextCursor = dtoMessage.idmessage
        }
        return dto;
    }
}