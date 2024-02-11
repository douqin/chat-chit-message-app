import Group from "../../../models/group.model";
import LastViewGroup from "../dtos/lastview.dto";
import { GroupChatDTO, dataDTO } from "../dtos/response.lisgroup.dto";
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
  changeNickname(userId: number, userIdChange: number, groupId: number, nickname: string): Promise<Message>;
  blockMember(userId: number, userIdAdd: number, groupId: number): Promise<boolean>;
  approvalMember(userId: number, userIdAdd: number, groupId: number): Promise<Message>;
  removeMember(userId: number, userIdAdd: number, groupId: number): Promise<Message>;
  removeManager(userId: number, userIdRemove: number, groupId: number): Promise<Message>;
  addManager(userId: number, userIdAdd: number, groupId: number): Promise<Message>;
  requestJoinFromLink(userId: number, link: string): Promise<RequestJoinFromLink>;
  inviteMember(userId: any, groupId: number, userIDs: Array<number>): Promise<Message[]>;
  leaveGroup(userId: number, groupId: number): Promise<Message>;
  getLastViewMember(groupId: number): Promise<LastViewGroup[]>;
  isExistInvidualGroup(userId: number, userIdAddressee: number): Promise<boolean>
  getInvidualGroup(userId: number, userIdAddressee: number): Promise<number>
}

export interface iGroupActions {
  createInvidualGroup(userId: number, users: number): Promise<CreateIndividualGroup>;
  getInformationMember(userId: number, memberId: number, groupId: number): Promise<User>;
  getTotalMember(groupId: number): Promise<number>
  getAllGroup(userId: number): Promise<Array<Group>>;
  getSomeGroup(userId: number, cursor: number, limit: number): Promise<dataDTO>;
  createCommunityGroup(name: string, userId: number, users: Array<number>): Promise<Group>;
  getOneGroup(userId: number, groupId: number): Promise<GroupChatDTO>;
  getAllMember(userId : number, groupId: number): Promise<MemberDTO[]>;
  changeAvatarGroup(userId: number, groupId: number, file: Express.Multer.File): Promise<ChangeAvatarGroup>;
  renameGroup(userId: number, groupId: number, name: string): Promise<Message>;
  deleteGroup(userId: number, groupId: number): Promise<boolean>;
}
export interface iInformationMember {
  isUserExistInGroup(userId: number, groupId: number, status?: MemberStatus): Promise<boolean>;
  getPosition(groupId: Number, userId: Number): Promise<PositionInGrop>;
}
export interface iGroupInformation {
  getAccessGroup(groupId: number): Promise<GroupAccess>;
  getBaseInformationGroupFromLink(link: string): Promise<Group | null>;
  getTypeGroup(groupId: number): Promise<GroupStatus>
}
export interface iAdminAction {
  getListUserPending(userId : number, groupId: number): Promise<MemberDTO[]> 
}