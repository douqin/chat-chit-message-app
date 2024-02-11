import Message from "@/models/message.model";
import Group from "../../../models/group.model";
import { num } from "envalid";
import { PagingRes } from "@/utils/paging/paging.data";
import { RawDataMysql } from "@/models/raw.data";

export class dataDTO extends PagingRes<GroupChatDTO, number | null>{
    constructor(
         data: Array<GroupChatDTO>,
         nextCursor: number | null,
         totalSize : number = 0
    ) { 
        super(data, nextCursor, totalSize)
    }
    static async rawToDTO(raw: RawDataMysql[], getlastMessage : (groupId : number) => Promise<Message> , totalMember : (groupId : number) => Promise<number>, numMessageUnread : (groupId : number) => Promise<number> ) {
        let dto = new dataDTO([], null)
        for (let userRaw of raw) {
            let gr = Group.fromRawData(userRaw);
            dto.data.push(GroupChatDTO.fromBase(gr, await getlastMessage(gr.groupId), await totalMember(gr.groupId), await numMessageUnread(gr.groupId) ))
            dto.nextCursor = userRaw._cursor
        }
        return dto
    }
}
export class GroupChatDTO extends Group {
    constructor(
        groupId: number, name: string, avatar: string, status: number, createAt: Date, type: number, link: string, access: number,
        public lastMessage: Message,
        public totalMember: number,
        public numMessageUnread: number
    ) {
        super(groupId, name, avatar, status, createAt, type, link, access);
    }
    static fromBase(gr: Group, lastMessage: Message, totalMember: number, numMessageUnread: number): GroupChatDTO {
        return new GroupChatDTO(gr.groupId, gr.name, gr.avatar, gr.status, gr.createAt, gr.type, gr.link, gr.access, lastMessage, totalMember, numMessageUnread)
    }
}