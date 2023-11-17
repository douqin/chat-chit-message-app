import { MemberPermisstion } from './enum/group.member.permisstion.enum';
import GroupChat from "./dtos/group.dto";
import GroupRepository from "./group.repository";
import LastViewGroup from "./dtos/lastview.dto";
import { GroupRepositoryBehavior } from "./interface/group.repository.interface";
import DataFileDrive from "component/cloud/dtos/file.drive.dtos";
import MyException from "@/utils/exceptions/my.exception";
import { MemberStatus } from './enum/member.status.enum';
import { PositionInGrop } from './enum/group.position.enum';
import { HttpStatus } from '@/utils/extension/httpstatus.exception';
import iGroupServiceBehavior from './interface/group.service.interface';
import MemberDTO from './dtos/member.dto';
import { ListGroupDTO } from './dtos/response.lisgroup.dto';
import MessageService from '../messaging/message.service';
import { MessageAction as MessageActionService } from '../messaging/interface/message.service.interaface';

export default class GroupService implements iGroupServiceBehavior {
    private groupRepsitory: GroupRepositoryBehavior
    constructor() {
        this.groupRepsitory = new GroupRepository()
    }
    async getSomeGroup(iduser: number, cursor: Date, limit: number): Promise<ListGroupDTO> {
        let dataRaw = await this.groupRepsitory.getSomeGroup(iduser, cursor, limit)
        if (dataRaw) {
            return ListGroupDTO.rawToDTO(dataRaw)
        }
        return new ListGroupDTO([], null)
    }
    async blockMember(iduser: number, iduserAdd: number, idgroup: number): Promise<boolean> {
        if (await this.groupRepsitory.isContainInGroup(iduserAdd, idgroup, MemberStatus.DEFAULT) && await this.groupRepsitory.getPosition(idgroup, iduser) == PositionInGrop.CREATOR || PositionInGrop.ADMIN) {
            return await this.groupRepsitory.changeStatusMember(iduserAdd, idgroup, MemberStatus.BLOCKED)
        }
        else {
            throw new MyException("Bạn không có quyền này").withExceptionCode(HttpStatus.FORBIDDEN)
        }
    }
    async approvalMember(iduser: number, iduserAdd: number, idgroup: number): Promise<boolean> {
        if (await this.groupRepsitory.isContainInGroup(iduserAdd, idgroup, MemberStatus.PENDING) && await this.groupRepsitory.getPosition(idgroup, iduser) == PositionInGrop.CREATOR || PositionInGrop.ADMIN) {
            return await this.groupRepsitory.changeStatusMember(iduserAdd, idgroup, MemberStatus.DEFAULT)
        }
        else {
            throw new MyException("Bạn không có quyền này").withExceptionCode(HttpStatus.FORBIDDEN)
        }
    }
    async removeMember(iduser: number, iduserRemove: number, idgroup: number): Promise<boolean> {
        if (await this.groupRepsitory.isContainInGroup(iduserRemove, idgroup, MemberStatus.DEFAULT) && await this.groupRepsitory.getPosition(idgroup, iduser) == PositionInGrop.CREATOR || PositionInGrop.ADMIN) {
            return await this.groupRepsitory.removeMember(idgroup, iduserRemove)
        }
        else {
            throw new MyException("Bạn không có quyền này").withExceptionCode(HttpStatus.FORBIDDEN)
        }
    }
    async removeManager(iduser: number, manager: number, idgroup: number): Promise<boolean> {
        if (await this.groupRepsitory.isContainInGroup(manager, idgroup, MemberStatus.DEFAULT) && await this.groupRepsitory.getPosition(idgroup, iduser) == PositionInGrop.CREATOR) {
            return await this.groupRepsitory.removeManager(idgroup, manager)
        }
        else {
            throw new MyException("Bạn không có quyền này").withExceptionCode(HttpStatus.FORBIDDEN)
        }
    }
    async addManager(iduser: number, invitee: number, idgroup: number): Promise<boolean> {
        if (await this.groupRepsitory.isContainInGroup(invitee, idgroup, MemberStatus.DEFAULT) && await this.groupRepsitory.getPosition(idgroup, iduser) == PositionInGrop.CREATOR) {
            return await this.groupRepsitory.addManager(idgroup, invitee)
        }
        else {
            throw new MyException("Bạn không có quyền này").withExceptionCode(HttpStatus.FORBIDDEN)
        }
    }
    async renameGroup(iduser: number, idgroup: number, name: string): Promise<boolean> {
        if (await this.groupRepsitory.isContainInGroup(iduser, idgroup, MemberStatus.DEFAULT) && await this.groupRepsitory.checkMemberPermisstion(MemberPermisstion.RENAME_GROUP, iduser, idgroup) || (await this.groupRepsitory.getPosition(idgroup, iduser) == PositionInGrop.ADMIN || PositionInGrop.CREATOR)) {
            return await this.groupRepsitory.renameGroup(idgroup, name)
        }
        else {
            throw new MyException("Bạn không có quyền này").withExceptionCode(HttpStatus.FORBIDDEN)
        }
    }
    async joinfromLink(iduser: number, idgroup: number) {
        if (!await this.groupRepsitory.isContainInGroup(iduser, idgroup)) {
            if (await this.groupRepsitory.checkMemberPermisstion(MemberPermisstion.AUTO_APPROVAL, iduser, idgroup)) {
                await this.groupRepsitory.joinGroup(iduser, idgroup)
            } else {
                await this.groupRepsitory.addUserToApprovalQueue(iduser, idgroup)
            }
            return true
        }
        throw new MyException("Bạn đã tham gia vào group hoặc đang chờ duyệt từ quản trị ")
        //TODO : check user was blocked by admin
    }
    async isContainInGroup(iduser: number, idgroup: number): Promise<boolean> {
        return await this.groupRepsitory.isContainInGroup(iduser, idgroup)
    }
    async changeAvatarGroup(iduser: number, idgroup: number, file: Express.Multer.File): Promise<DataFileDrive | null> {
        if (await this.groupRepsitory.isContainInGroup(iduser, idgroup, MemberStatus.DEFAULT) && await this.groupRepsitory.checkMemberPermisstion(MemberPermisstion.RENAME_GROUP, iduser, idgroup) || (await this.groupRepsitory.getPosition(idgroup, iduser) == PositionInGrop.ADMIN || PositionInGrop.CREATOR)) {
            return this.groupRepsitory.changeAvatarGroup(iduser, idgroup, file)
        }
        else {
            throw new MyException("Bạn không có quyền này").withExceptionCode(HttpStatus.FORBIDDEN)
        }
    }
    async getAllMember(idgroup: number): Promise<MemberDTO[]> {
        let data = await this.groupRepsitory.getAllMember(idgroup);
        if (data) {
            return data.map<MemberDTO>((value, index, array) => {
                return MemberDTO.fromRawData(value)
            });
        }
        return [];
    }
    async getOneGroup(idgroup: number): Promise<GroupChat | null> {
        let data = await this.groupRepsitory.getOneGroup(idgroup);
        if (data) {
            return GroupChat.fromRawData(data)
        }
        return null;
    }
    async inviteMember(iduser: any, idgroup: number, userIDs: number[]): Promise<any> {

    }
    async leaveGroup(iduser: any, idgroup: number): Promise<boolean> {
        return await this.groupRepsitory.leaveGroup(iduser, idgroup)
    }

    async getAllGroup(iduser: number): Promise<Array<GroupChat>> {
        let dataRaw = await this.groupRepsitory.getAllGroup(iduser)
        if (dataRaw) {
            return dataRaw.map<GroupChat>((value, index, array) => {
                return GroupChat.fromRawData(value)
            });
        }
        return []
    }

    async createGroup(name: string, iduser: number, users: Array<number>): Promise<GroupChat> {
        // TODO: check list user contain in list friend 
        let group = GroupChat.fromRawData(await this.groupRepsitory.createGroup(name, iduser, users))
        let messageBehavior: MessageActionService = new MessageService()
        await messageBehavior.sendNotitfyMessage(group.idgroup, iduser, "created group", [])
        if (users.length > 0) {
            let strMessage = "added member"
            for (let i = 0; i < users.length; i++) {
                strMessage += " @"
            }
            await messageBehavior.sendNotitfyMessage(group.idgroup, iduser, strMessage, users)
        }
        return group;
    }
    async isContainMember(iduser: number, idgroup: number) {

    }
    async getLastViewMember(idgroup: number) {
        let rawDataSQL = await this.groupRepsitory.getLastViewMember(idgroup)
        if (rawDataSQL) {
            return rawDataSQL.map<LastViewGroup>((value, index, array) => {
                return LastViewGroup.fromRawData(value)
            });
        }
        console.log(rawDataSQL)
        return []
    }
}