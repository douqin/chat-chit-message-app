import { PositionInGrop } from '../enum/group.position.enum';
import { MemberPermisstion } from "../enum/group.member.permisstion.enum"
import { MemberStatus } from "../enum/member.status.enum"
import { GroupStatus } from '../enum/group.status.dto.enum';
import Group from '@/models/group.model';
import { GroupAccess } from '../enum/group.access';
import DataFileDrive from 'src/services/cloud/dtos/file.drive.dtos';

export interface GroupRepositoryBehavior extends GroupManagement, GroupInfo, GroupActionMember, MemberInfo {
}
export interface GroupManagement {

    deleteGroup(groupId: number): Promise<boolean>
    createInvidualGroup(userId: number, users: number, status : GroupStatus): Promise<number>;
    changeStatusMember(userIdAdd: number, groupId: number, status: MemberStatus): Promise<boolean>;
    removeMember(groupId: number, userIdRemove: number): boolean | PromiseLike<boolean>;
    removeManager(groupId: number, userIdAdd: any): boolean | PromiseLike<boolean>;
    addManager(groupId: number, userIdAdd: number): Promise<boolean>;
    createGroup(name: string, userId: number, users: Array<number>): Promise<any>;
    renameGroup(groupId: number, name: string): Promise<boolean>;
}

export interface GroupActionMember {

    changeNickname(userId: number, userIdChange: number, groupId: number, nickname: string): Promise<boolean>
    getInformationMember(userIdCanFind: number, groupId: number): Promise<any>
    getTotalMember(groupId: number): Promise<number>
    checkMemberPermisstion(permisstion: MemberPermisstion, userId: Number, groupId: Number): unknown;
    addUserToApprovalQueue(userId: number, groupId: number): any;
    joinGroup(userId: number, groupId: number): Promise<boolean>;
    leaveGroup(userId: any, groupId: number): boolean | Promise<boolean>;
}

export interface GroupInfo {
    getAllUserPending(groupId: number): Promise<object[]>
    getAccessGroup(groupId: number): Promise<GroupAccess>;
    getBaseInformationGroupFromLink(link: string): Promise<Group | null>;
    getTypeGroup(groupId: number): Promise<GroupStatus>
    isExistInvidualGroup(userId: number, userIdAddressee: number): Promise<boolean>
    getInvidualGroup(userId: number, userIdAddressee: number): Promise<number>
    getSomeGroup(userId: number, cursor : number, limit : number): Promise<Array<any>>;
    getAllGroup(userId: number): Promise<object[] | undefined>;
    getLastViewMember(groupId: number): Promise<object[] | undefined>;
    getOneGroup(groupId: number): Promise<object | null>;
    getAllMember(groupId: number): Promise<object[] | null>;
    changeAvatarGroup(userId: number, groupId: number, file: Express.Multer.File): Promise<DataFileDrive | null>;
}
export interface MemberInfo {
    isContainInGroup(userId: number, groupId: number, status_check?: MemberStatus): Promise<boolean>;
    getPosition(groupId: Number, userId: Number): Promise<PositionInGrop>;
}
