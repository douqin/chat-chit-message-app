import Message from "@/models/message.model";
import Group from "../../../models/group.model";
import { num } from "envalid";

export class ListGroupDTO {
    constructor(
        public listGroup: Array<GroupChatDTO>,
        public nextCursor: Date | null,
        public totalSize : number = 0
    ) { }
    static async rawToDTO(raw: any[], getlastMessage : (idgroup : number) => Promise<Message> , totalMember : (idgroup : number) => Promise<number>, numMessageUnread : (idgroup : number) => Promise<number> ) {
        let dto = new ListGroupDTO([], null)
        for (let userRaw of raw) {
            let gr = Group.fromRawData(userRaw);
            dto.listGroup.push(GroupChatDTO.fromBase(gr, await getlastMessage(gr.groupId), await totalMember(gr.groupId), await numMessageUnread(gr.groupId) ))
            dto.nextCursor = userRaw._cursor
        }
        return dto
    }
}
export class GroupChatDTO extends Group {
    constructor(
        idgroup: number, name: string, avatar: string, status: number, createAt: Date, type: number, link: string, access: number,
        public lastMessage: Message,
        public totalMember: number,
        public numMessageUnread: number
    ) {
        super(idgroup, name, avatar, status, createAt, type, link, access);
    }
    static fromBase(gr: Group, lastMessage: Message, totalMember: number, numMessageUnread: number): GroupChatDTO {
        return new GroupChatDTO(gr.groupId, gr.name, gr.avatar, gr.status, gr.createAt, gr.type, gr.link, gr.access, lastMessage, totalMember, numMessageUnread)
    }
}