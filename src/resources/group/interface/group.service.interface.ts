import GroupChat from "../../../models/group.model";
import LastViewGroup from "../dtos/lastview.dto";
import DataFileDrive from "component/cloud/dtos/file.drive.dtos";
import { ListGroupDTO } from "../dtos/response.lisgroup.dto";
import { MemberDTO } from "../dtos/member.dto";
import { User } from "@/models/user.model";


export default interface iGroupServiceBehavior extends iMemberActions, iGroupActions, iInformationMember {
}
export interface iMemberActions {
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
  
  export interface iGroupActions {
    getInformationMember(iduser: number, idmember: number, idgroup: number): Promise<User>;
    getTotalMember(idgroup : number) : Promise<number>
    getAllGroup(iduser: number): Promise<Array<GroupChat>>;
    getSomeGroup(iduser: number, cursor : number, limit : number): Promise<ListGroupDTO>;
    createGroup(name: string, iduser: number, users: Array<number>): Promise<GroupChat>;
    getOneGroup(idgroup: number): Promise<GroupChat | null>;
    getAllMember(idgroup: number): Promise<MemberDTO[]>;
    changeAvatarGroup(iduser: number, idgroup: number, file: Express.Multer.File): Promise<DataFileDrive | null>;
    renameGroup(iduser: number, idgroup: number, name: string): Promise<boolean>;
  }
  export interface iInformationMember{
    isContainInGroup(iduser: number, idgroup: number): Promise<boolean>;
  }
  