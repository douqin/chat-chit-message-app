import { User } from "@/resources/auth/dtos/user.dto";
import GroupChat from "../dtos/group.dto";
import LastViewGroup from "../dtos/lastview.dto";
import DataFileDrive from "component/cloud/dtos/file.drive.dtos";
import MemberDTO from "../dtos/member.dto";

export default interface GroupServiceBehavior extends MemberActions, GroupActions {}
export interface MemberActions {
    blockMember(iduser: number, iduserAdd: number, idgroup: number): Promise<boolean>;
    approvalMember(iduser: number, iduserAdd: number, idgroup: number): Promise<boolean>;
    removeMember(iduser: number, iduserAdd: number, idgroup: number): Promise<boolean>;
    removeManager(iduser: number, iduserRemove: number, idgroup: number): Promise<boolean>;
    addManager(iduser: number, iduserAdd: number, idgroup: number): Promise<boolean>;
    joinfromLink(iduser: number, idgroup: number): any;
    inviteMember(iduser: any, idgroup: number, userIDs: Array<number>): Promise<boolean>;
    leaveGroup(iduser: number, idgroup: number): Promise<boolean>;
    getLastViewMember(idgroup: number): Promise<LastViewGroup[]>;
  }
  
  export interface GroupActions {
    getAllGroup(iduser: number): Promise<Array<GroupChat>>;
    createGroup(name: string, iduser: number, users: Array<number>): Promise<boolean>;
    getOneGroup(idgroup: number): Promise<GroupChat | null>;
    getAllMember(idgroup: number): Promise<MemberDTO[]>;
    changeAvatarGroup(iduser: number, idgroup: number, file: Express.Multer.File): Promise<DataFileDrive | null>;
    isContainInGroup(iduser: number, idgroup: number): Promise<boolean>;
    renameGroup(iduser: number, idgroup: number, name: string): Promise<boolean>;
  }