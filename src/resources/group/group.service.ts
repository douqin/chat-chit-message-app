import MyException from "@/utils/exceptions/my.exception"
import { HttpStatus } from "@/utils/extension/httpstatus.exception"
import DataFileDrive from "component/cloud/dtos/file.drive.dtos"
import Group from "./../../models/group.model"
import { iMessageAction } from "../messaging/interface/message.service.interaface"
import MessageService from "../messaging/message.service"
import { RelationServiceBehavior } from "../relationship/interface/relation.service.interface"
import RelationService from "../relationship/relation.service"
import LastViewGroup from "./dtos/lastview.dto"
import { MemberDTO } from "./dtos/member.dto"
import { ListGroupDTO } from "./dtos/response.lisgroup.dto"
import { MemberPermisstion } from "./enum/group.member.permisstion.enum"
import { PositionInGrop } from "./enum/group.position.enum"
import { MemberStatus } from "./enum/member.status.enum"
import GroupRepository from "./group.repository"
import { GroupRepositoryBehavior } from "./interface/group.repository.interface"
import iGroupServiceBehavior from "./interface/group.service.interface"
import { RelationshipUser } from "../relationship/enums/relationship.enum"
import { container, inject, injectable } from "tsyringe"
import { GroupStatus } from "./enum/group.status.dto.enum"

@injectable()
export default class GroupService implements iGroupServiceBehavior {

    constructor(@inject(GroupRepository) private groupRepsitory: GroupRepositoryBehavior) {
    }
    async isExistInvidualGroup(iduser: number, idUserAddressee: number): Promise<boolean> {
        return await this.groupRepsitory.isExistInvidualGroup(iduser, idUserAddressee)
    }
    async getInvidualGroup(iduser: number, idUserAddressee: number): Promise<number> {
        let inforUser: RelationServiceBehavior = container.resolve(RelationService)
        if (RelationshipUser.FRIEND && !await this.isExistInvidualGroup(iduser, idUserAddressee)) {
            if (await inforUser.getRelationship(iduser, idUserAddressee) === RelationshipUser.FRIEND)
                return this.groupRepsitory.createInvidualGroup(iduser, idUserAddressee, GroupStatus.DEFAULT)
            return this.groupRepsitory.createInvidualGroup(iduser, idUserAddressee, GroupStatus.STRANGE_PEOPLE)
        }
        return await this.groupRepsitory.getInvidualGroup(iduser, idUserAddressee);
    }
    async createInvidualGroup(iduser: number, users: number): Promise<number> {
        let inforUser: RelationServiceBehavior = container.resolve(RelationService)
        if (RelationshipUser.FRIEND && !await this.isExistInvidualGroup(iduser, users)) {
            if (await inforUser.getRelationship(iduser, users) === RelationshipUser.FRIEND)
                return this.groupRepsitory.createInvidualGroup(iduser, users, GroupStatus.DEFAULT)
            return this.groupRepsitory.createInvidualGroup(iduser, users, GroupStatus.STRANGE_PEOPLE)
        }
        return await this.getInvidualGroup(iduser, users);
    }
    async getPosition(idgroup: Number, iduser: Number): Promise<PositionInGrop> {
        return await this.groupRepsitory.getPosition(idgroup, iduser)
    }
    async getInformationMember(iduser: number, idmember: number, idgroup: number): Promise<any> {
        if (await this.isContainInGroup(iduser, idgroup)) {
            return MemberDTO.fromRawData(await this.groupRepsitory.getInformationMember(idmember, idgroup))
        } throw new MyException("You don't contain in group").withExceptionCode(HttpStatus.FORBIDDEN)
    }
    async getTotalMember(idgroup: number): Promise<number> {
        return await this.groupRepsitory.getTotalMember(idgroup)
    }
    async getSomeGroup(iduser: number, cursor: number, limit: number): Promise<ListGroupDTO> {
        let dataRaw = await this.groupRepsitory.getSomeGroup(iduser, cursor, limit)
        if (dataRaw) {
            let message: iMessageAction = container.resolve(MessageService)
            return ListGroupDTO.rawToDTO(dataRaw, async (idgroup: number) => {
                return await message.getLastMessage(idgroup)
            }, async (idgroup: number) => {
                return await this.getTotalMember(idgroup)
            }, async (idgroup: number) => {
                return await message.getNumMessageUnread(idgroup, iduser)
            })
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
        return await this.groupRepsitory.isContainInGroup(iduser, idgroup, MemberStatus.DEFAULT)
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
    async getOneGroup(idgroup: number): Promise<Group | null> {
        let data = await this.groupRepsitory.getOneGroup(idgroup);
        if (data) {
            return Group.fromRawData(data)
        }
        return null;
    }
    async inviteMember(iduser: any, idgroup: number, userIDs: number[]): Promise<any> {

    }
    async leaveGroup(iduser: any, idgroup: number): Promise<boolean> {
        return await this.groupRepsitory.leaveGroup(iduser, idgroup)
    }
    async getAllGroup(iduser: number): Promise<Array<Group>> {
        let dataRaw = await this.groupRepsitory.getAllGroup(iduser)
        if (dataRaw) {
            return dataRaw.map<Group>((value, index, array) => {
                return Group.fromRawData(value)
            });
        }
        return []
    }
    async createCommunityGroup(name: string, iduser: number, users: Array<number>): Promise<Group> {
        let inforUser: RelationServiceBehavior = container.resolve(RelationService)
        for (let _iduser of users) {
            if (await inforUser.getRelationship(iduser, _iduser) !== RelationshipUser.FRIEND) {
                throw new MyException("List user added isn't your friend").withExceptionCode(HttpStatus.BAD_REQUEST)
            }
        }
        let group = Group.fromRawData(await this.groupRepsitory.createGroup(name, iduser, users))
        let messageBehavior: iMessageAction = container.resolve(MessageService)
        await messageBehavior.sendNotitfyMessage(group.idgroup, iduser, "created group", [])
        if (users.length > 0) {
            let strMessage = "added member"
            for (let i = 0; i < users.length; i++) {
                strMessage += " @"
            }
            await messageBehavior.sendNotitfyMessage(group.idgroup, iduser, strMessage, users)
        } else throw new MyException("Total users > 2").withExceptionCode(HttpStatus.BAD_GATEWAY)
        return group;
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