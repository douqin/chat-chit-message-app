import Message from "./message.dto";

export class ListMessageResponseDTO {
    constructor(
        public listMessage : Array<Message>,
        public nextCursor : number | null
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