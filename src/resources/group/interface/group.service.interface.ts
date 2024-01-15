import Group from "../../../models/group.model";
import LastViewGroup from "../dtos/lastview.dto";
import DataFileDrive from "component/cloud/dtos/file.drive.dtos";
import { GroupChatDTO, ListGroupDTO } from "../dtos/response.lisgroup.dto";
import { MemberDTO } from "../dtos/member.dto";
import { User } from "@/models/user.model";
import { PositionInGrop } from "../enum/group.position.enum";
import { CreateIndividualGroup } from "../type.definitions/create.invidual.group";
import Message from "@/models/message.model";
import { ChangeAvatarGroup } from "../type.definitions/change.avatar.group";
import { GroupStatus } from "../enum/group.status.dto.enum";
import { MemberStatus } from "../enum/member.status.enum";
import { GroupAccess } from "../enum/group.access";
import { RequestJoinFromLink } from "../type.definitions/request.join.from.link";


export default interface iGroupServiceBehavior extends iMemberActions, iGroupActions, iInformationMember, iGroupInformation, iAdminAction {
}
export interface iMemberActions {
  changeNickname(iduser: number, userIdChange: number, idgroup: number, nickname: string): Promise<Message>;
  blockMember(iduser: number, iduserAdd: number, idgroup: number): Promise<boolean>;
  approvalMember(iduser: number, iduserAdd: number, idgroup: number): Promise<Message>;
  removeMember(iduser: number, iduserAdd: number, idgroup: number): Promise<Message>;
  removeManager(iduser: number, iduserRemove: number, idgroup: number): Promise<Message>;
  addManager(iduser: number, iduserAdd: number, idgroup: number): Promise<Message>;
  requestJoinFromLink(iduser: number, link: string): Promise<RequestJoinFromLink>;
  inviteMember(iduser: any, idgroup: number, userIDs: Array<number>): Promise<boolean>;
  leaveGroup(iduser: number, idgroup: number): Promise<Message>;
  getLastViewMember(idgroup: number): Promise<LastViewGroup[]>;
  isExistInvidualGroup(iduser: number, idUserAddressee: number): Promise<boolean>
  getInvidualGroup(iduser: number, idUserAddressee: number): Promise<number>
}

export interface iGroupActions {
  createInvidualGroup(iduser: number, users: number): Promise<CreateIndividualGroup>;
  getInformationMember(iduser: number, idmember: number, idgroup: number): Promise<User>;
  getTotalMember(idgroup: number): Promise<number>
  getAllGroup(iduser: number): Promise<Array<Group>>;
  getSomeGroup(iduser: number, cursor: number, limit: number): Promise<ListGroupDTO>;
  createCommunityGroup(name: string, iduser: number, users: Array<number>): Promise<Group>;
  getOneGroup(iduser: number, idgroup: number): Promise<GroupChatDTO>;
  getAllMember(iduser : number, idgroup: number): Promise<MemberDTO[]>;
  changeAvatarGroup(iduser: number, idgroup: number, file: Express.Multer.File): Promise<ChangeAvatarGroup>;
  renameGroup(iduser: number, idgroup: number, name: string): Promise<Message>;
  deleteGroup(iduser: number, idgroup: number): Promise<boolean>;
}
export interface iInformationMember {
  isUserExistInGroup(iduser: number, idgroup: number, status?: MemberStatus): Promise<boolean>;
  getPosition(idgroup: Number, iduser: Number): Promise<PositionInGrop>;
}
export interface iGroupInformation {
  getAccessGroup(idgroup: number): Promise<GroupAccess>;
  getBaseInformationGroupFromLink(link: string): Promise<Group | null>;
  getTypeGroup(idgroup: number): Promise<GroupStatus>
}
export interface iAdminAction {
  getListUserPending(iduser : number, idgroup: number): Promise<MemberDTO[]> 
}