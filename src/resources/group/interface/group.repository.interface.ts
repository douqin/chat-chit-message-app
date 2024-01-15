import { PositionInGrop } from '../enum/group.position.enum';
import { MemberPermisstion } from "../enum/group.member.permisstion.enum"
import { MemberStatus } from "../enum/member.status.enum"
import DataFileDrive from 'component/cloud/dtos/file.drive.dtos';
import { GroupStatus } from '../enum/group.status.dto.enum';
import Group from '@/models/group.model';
import { GroupAccess } from '../enum/group.access';

export interface GroupRepositoryBehavior extends GroupManagement, GroupInfo, GroupActionMember, MemberInfo {
}
export interface GroupManagement {

    deleteGroup(idgroup: number): Promise<boolean>
    createInvidualGroup(iduser: number, users: number, status : GroupStatus): Promise<number>;
    changeStatusMember(iduserAdd: number, idgroup: number, status: MemberStatus): Promise<boolean>;
    removeMember(idgroup: number, iduserRemove: number): boolean | PromiseLike<boolean>;
    removeManager(idgroup: number, iduserAdd: any): boolean | PromiseLike<boolean>;
    addManager(idgroup: number, iduserAdd: number): Promise<boolean>;
    createGroup(name: string, iduser: number, users: Array<number>): Promise<any>;
    renameGroup(idgroup: number, name: string): Promise<boolean>;
}

export interface GroupActionMember {

    changeNickname(iduser: number, userIdChange: number, idgroup: number, nickname: string): Promise<boolean>
    getInformationMember(iduserCanFind: number, idgroup: number): Promise<any>
    getTotalMember(idgroup: number): Promise<number>
    checkMemberPermisstion(permisstion: MemberPermisstion, iduser: Number, idgroup: Number): unknown;
    addUserToApprovalQueue(iduser: number, idgroup: number): any;
    joinGroup(iduser: number, idgroup: number): Promise<boolean>;
    leaveGroup(iduser: any, idgroup: number): boolean | Promise<boolean>;
}

export interface GroupInfo {
    getAllUserPending(idgroup: number): Promise<object[]>
    getAccessGroup(idgroup: number): Promise<GroupAccess>;
    getBaseInformationGroupFromLink(link: string): Promise<Group | null>;
    getTypeGroup(idgroup: number): Promise<GroupStatus>
    isExistInvidualGroup(iduser: number, idUserAddressee: number): Promise<boolean>
    getInvidualGroup(iduser: number, idUserAddressee: number): Promise<number>
    getSomeGroup(iduser: number, cursor : number, limit : number): Promise<Array<any>>;
    getAllGroup(iduser: number): Promise<object[] | undefined>;
    getLastViewMember(idgroup: number): Promise<object[] | undefined>;
    getOneGroup(idgroup: number): Promise<object | null>;
    getAllMember(idgroup: number): Promise<object[] | null>;
    changeAvatarGroup(iduser: number, idgroup: number, file: Express.Multer.File): Promise<DataFileDrive | null>;
}
export interface MemberInfo {
    isContainInGroup(iduser: number, idgroup: number, status_check?: MemberStatus): Promise<boolean>;
    getPosition(idgroup: Number, iduser: Number): Promise<PositionInGrop>;
}
