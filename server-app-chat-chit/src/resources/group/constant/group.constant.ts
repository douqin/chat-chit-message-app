export class Constant {
    static GET_GROUP_FROM_CURSOR_MAX = -1;
    static GROUP_NAME_ROOM_SOCkET = ''
}
export enum EventGroupIO{
    CHANGE_AVATAR = "update-avatar-group",
    LEAVE_GROUP = "user_leave_group",
    CREATE_INDIVIDUAL_GROUP = "create-individual-group",
    CHANGE_NICKNAME = "change-nickname",
    DELETE_GROUP = "delete-group",
    REQUEST_JOIN_FROM_LINK = "request-join-from-link",
    APPROVAL_MEMBER = "approval-member",
    ADD_MANAGER = "add-manager",
    REMOVE_MANAGER = "remove-manager",
    MEMBER_WAS_REMOVE = "member_was_remove",
    RENAME_GROUP = "rename-group",
}