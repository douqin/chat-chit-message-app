import Message from "@/models/message.model";

export interface RequestJoinFromLink {
    isJoin : boolean;
    message : Message | null;
}