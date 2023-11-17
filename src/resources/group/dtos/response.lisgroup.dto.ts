import GroupChat from "./group.dto";

export class ListGroupDTO{
    constructor(
        public listGroup : Array<GroupChat>,
        public nextCursor : Date | null
    ){}
    static rawToDTO(raw : any){
        let dto = new ListGroupDTO([], null)
        for (let userRaw of raw) {
            let gr = GroupChat.fromRawData(userRaw);
            dto.listGroup.push(gr)
            dto.nextCursor = userRaw._cursor
        }
        return dto
    }
}