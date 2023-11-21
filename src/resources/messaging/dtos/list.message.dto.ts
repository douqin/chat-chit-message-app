import Message from "./message.dto";

export class ListMessageResponseDTO {
    constructor(
        public listMessage : Array<Message>,
        public nextCursor : number | null
    ){

    }
    static rawToData(raws : Message[]) : ListMessageResponseDTO {
        console.log("🚀 ~ file: list.message.dto.ts:11 ~ ListMessageResponseDTO ~ rawToData ~ rawToData:", raws)
        let dto = new ListMessageResponseDTO([], null)
        for(let dtoMessage of raws){
            dto.listMessage.push(dtoMessage)
            dto.cursor = dtoMessage.idmessage
        }
        return dto;
    }
}