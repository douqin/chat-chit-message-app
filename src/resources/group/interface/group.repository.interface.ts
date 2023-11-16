import { PositionInGrop } from '../enum/group.position.enum';
import { MemberPermisstion } from "../enum/group.member.permisstion.enum"
import { MemberStatus } from "../enum/member.status.enum"
import DataFileDrive from 'component/cloud/dtos/file.drive.dtos';

export interface GroupRepositoryBehavior extends GroupManagement, GroupInfo, GroupActionMember, MemberInfo {
    // changeStatusMember(iduserAdd: number, idgroup: number, status: MemberStatus): Promise<boolean>;
    // removeMember(idgroup: number, iduserRemove: number): boolean | PromiseLike<boolean>;
    // removeManager(idgroup: number, iduserAdd: any): boolean | PromiseLike<boolean>;
    // addManager(idgroup: number, iduserAdd: number): Promise<boolean>;
    // renameGroup(idgroup: number, name: string): Promise<boolean>;
    // checkMemberPermisstion(permisstion: MemberPermisstion, iduser: Number, idgroup: Number): unknown
    // addQueueApproval(iduser: number, idgroup: number): any
    // leaveGroup(iduser: any, idgroup: number): boolean | Promise<boolean>
    // getAllGroup(iduser: number): Promise<object[] | undefined>
    // createGroup(name: string, iduser: number): Promise<boolean>
    // //  isContainInGroup(iduser: number, idgroup: number) : Promise<void>
    // getLastViewMember(idgroup: number): Promise<object[] | undefined>
    // getOneGroup(idgroup: number): Promise<object | null>
    // getAllMember(idgroup: number): Promise<object[] | null>
    // changeAvatarGroup(iduser: number, idgroup: number, file: Express.Multer.File): Promise<DataFileDrive | null>
    // isContainInGroup(iduser: number, idgroup: number, status_check?: MemberStatus): Promise<boolean>
    // joinGroup(iduser: number, idgroup: number): Promise<boolean>
    // getPosition(idgroup: Number, iduser: Number): Promise<PositionInGrop>
}
export interface GroupManagement {
    changeStatusMember(iduserAdd: number, idgroup: number, status: MemberStatus): Promise<boolean>;
    removeMember(idgroup: number, iduserRemove: number): boolean | PromiseLike<boolean>;
    removeManager(idgroup: number, iduserAdd: any): boolean | PromiseLike<boolean>;
    addManager(idgroup: number, iduserAdd: number): Promise<boolean>;
    createGroup(name: string, iduser: number, users: Array<Number>): Promise<any>;
    renameGroup(idgroup: number, name: string): Promise<boolean>;
}

export interface GroupActionMember {
    checkMemberPermisstion(permisstion: MemberPermisstion, iduser: Number, idgroup: Number): unknown;
    addUserToApprovalQueue(iduser: number, idgroup: number): any;
    joinGroup(iduser: number, idgroup: number): Promise<boolean>;
    leaveGroup(iduser: any, idgroup: number): boolean | Promise<boolean>;
}

export interface GroupInfo {
    getSomeGroup(iduser: number, cursor : Date, limit : number): Promise<Array<any>>;
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
