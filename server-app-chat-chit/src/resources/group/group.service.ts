import MyException from "@/utils/exceptions/my.exception"
import { HttpStatus } from "@/utils/extension/httpstatus.exception"
import Group from "./../../models/group.model"
import iMessageServiceBehavior, { iMessageAction, iMessageInformation } from "../messaging/interface/message.service.interface"
import MessageService from "../messaging/message.service"
import { RelationServiceBehavior } from "../relationship/interface/relation.service.interface"
import RelationService from "../relationship/relation.service"
import LastViewGroup from "./dtos/lastview.dto"
import { MemberDTO } from "./dtos/member.dto"
import { GroupChatDTO, ListGroupDTO } from "./dtos/response.lisgroup.dto"
import { MemberPermisstion } from "./enum/group.member.permisstion.enum"
import { PositionInGrop } from "./enum/group.position.enum"
import { MemberStatus } from "./enum/member.status.enum"
import GroupRepository from "./group.repository"
import { GroupRepositoryBehavior } from "./interface/group.repository.interface"
import iGroupServiceBehavior from "./interface/group.service.interface"
import { RelationshipUser } from "../relationship/enums/relationship.enum"
import { container, inject, injectable } from "tsyringe"
import { GroupStatus } from "./enum/group.status.dto.enum"
import { CreateIndividualGroup } from "./type.definitions/create.invidual.group"
import Message from "@/models/message.model"
import { ChangeAvatarGroup } from "./type.definitions/change.avatar.group"
import { GroupAccess } from "./enum/group.access"
import { RequestJoinFromLink } from "./type.definitions/request.join.from.link"

@injectable()
export default class GroupService implements iGroupServiceBehavior {

    constructor(@inject(GroupRepository) private groupRepsitory: GroupRepositoryBehavior) {
    }
    async getListUserPending(iduser: number, idgroup: number): Promise<MemberDTO[]> {
        if (await this.isUserExistInGroup(iduser, idgroup)) {
            let position = await this.getPosition(idgroup, iduser);
            if (position == PositionInGrop.CREATOR || position == PositionInGrop.ADMIN) {
                let data = await this.groupRepsitory.getAllUserPending(idgroup)
                if (data) {
                    return data.map<MemberDTO>((value, index, array) => {
                        return MemberDTO.fromRawData(value)
                    });
                }
            } throw new MyException("You don't have permisson for action").withExceptionCode(HttpStatus.FORBIDDEN)
        } throw new MyException("You don't in group").withExceptionCode(HttpStatus.FORBIDDEN)
    }
    async getAccessGroup(idgroup: number): Promise<GroupAccess> {
        return await this.groupRepsitory.getAccessGroup(idgroup)
    }
    async getBaseInformationGroupFromLink(link: string): Promise<Group | null> {
        return await this.groupRepsitory.getBaseInformationGroupFromLink(link)
    }
    async deleteGroup(iduser: number, idgroup: number): Promise<boolean> {
        if (await this.groupRepsitory.getPosition(idgroup, iduser) == PositionInGrop.CREATOR) {
            return await this.groupRepsitory.deleteGroup(idgroup)
        }
        return true;
    }

    async changeNickname(iduser: number, userIdChange: number, idgroup: number, nickname: string): Promise<Message> {
        if ((await this.groupRepsitory.isContainInGroup(iduser, idgroup, MemberStatus.DEFAULT) && await this.groupRepsitory.getPosition(idgroup, iduser) == PositionInGrop.ADMIN || PositionInGrop.CREATOR) || iduser === userIdChange) {
            await this.groupRepsitory.changeNickname(iduser, userIdChange, idgroup, nickname)
            let messageBehavior: iMessageServiceBehavior = container.resolve(MessageService)
            let mess = await messageBehavior.sendNotitfyMessage(idgroup, iduser, " change nickname {{@}} to " + nickname, [userIdChange])
            return await messageBehavior.getOneMessage(mess.messageId)
        }
        else {
            throw new MyException("You don't have permisstion for action").withExceptionCode(HttpStatus.FORBIDDEN)
        }
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
    async getTypeGroup(idgroup: number): Promise<GroupStatus> {
        return await this.groupRepsitory.getTypeGroup(idgroup)
    }
    async createInvidualGroup(iduser: number, users: number): Promise<CreateIndividualGroup> {
        let inforUser: RelationServiceBehavior = container.resolve(RelationService)
        if (RelationshipUser.FRIEND && !await this.isExistInvidualGroup(iduser, users)) {
            if (await inforUser.getRelationship(iduser, users) === RelationshipUser.FRIEND) {
                let data1 = await this.groupRepsitory.createInvidualGroup(iduser, users, GroupStatus.DEFAULT)
                return {
                    groupId: data1,
                    isExisted: false
                }
            }
            let data2 = await this.groupRepsitory.createInvidualGroup(iduser, users, GroupStatus.STRANGE_PEOPLE)
            return {
                groupId: data2,
                isExisted: false
            }
        }
        let data2 = await this.getInvidualGroup(iduser, users);
        return {
            groupId: data2,
            isExisted: true

        }
    }
    async getPosition(idgroup: Number, iduser: Number): Promise<PositionInGrop> {
        return await this.groupRepsitory.getPosition(idgroup, iduser)
    }
    async getInformationMember(iduser: number, userId: number, idgroup: number): Promise<any> {
        if (await this.isUserExistInGroup(iduser, idgroup)) {
            if (await this.isUserExistInGroup(userId, idgroup))
                return MemberDTO.fromRawData(await this.groupRepsitory.getInformationMember(userId, idgroup))
            else throw new MyException("User don't contain in group").withExceptionCode(HttpStatus.BAD_REQUEST)
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
        if (await this.groupRepsitory.isContainInGroup(iduserAdd, idgroup, MemberStatus.DEFAULT) && (((await this.groupRepsitory.getPosition(idgroup, iduser) == PositionInGrop.CREATOR || PositionInGrop.ADMIN)))) {
            return await this.groupRepsitory.changeStatusMember(iduserAdd, idgroup, MemberStatus.BLOCKED)
        }
        else {
            throw new MyException("You don't have permisson for action").withExceptionCode(HttpStatus.FORBIDDEN)
        }
    }
    async approvalMember(iduser: number, iduserAdd: number, idgroup: number): Promise<Message> {
        if (await this.groupRepsitory.isContainInGroup(iduserAdd, idgroup, MemberStatus.PENDING) && (await this.groupRepsitory.getPosition(idgroup, iduser) == PositionInGrop.CREATOR || PositionInGrop.ADMIN)) {
            await this.groupRepsitory.changeStatusMember(iduserAdd, idgroup, MemberStatus.DEFAULT)
            let messageBehavior: iMessageAction = container.resolve(MessageService)
            let mess = await messageBehavior.sendNotitfyMessage(idgroup, iduser, " approved member {{@}}", [iduserAdd])
            let iMessageInformation: iMessageInformation = container.resolve(MessageService)
            return await iMessageInformation.getOneMessage(mess.messageId)
        }
        else {
            throw new MyException("You don't have permisson for action").withExceptionCode(HttpStatus.FORBIDDEN)
        }
    }
    async removeMember(iduser: number, iduserRemove: number, idgroup: number): Promise<Message> {
        if (await this.isUserExistInGroup(iduserRemove, idgroup) && (await this.groupRepsitory.getPosition(idgroup, iduser) == PositionInGrop.CREATOR || PositionInGrop.ADMIN)) {
            await this.groupRepsitory.removeMember(idgroup, iduserRemove)
            let messageBehavior: iMessageAction = container.resolve(MessageService)
            let mess = await messageBehavior.sendNotitfyMessage(idgroup, iduser, " removed member {{@}}", [iduserRemove])
            let iMessageInformation: iMessageInformation = container.resolve(MessageService)
            return await iMessageInformation.getOneMessage(mess.messageId)
        }
        else {
            throw new MyException("You don't have permisson for action").withExceptionCode(HttpStatus.FORBIDDEN)
        }
    }
    async removeManager(iduser: number, manager: number, idgroup: number): Promise<Message> {
        if (await this.isUserExistInGroup(manager, idgroup) && await this.groupRepsitory.getPosition(idgroup, iduser) == PositionInGrop.CREATOR) {
            await this.groupRepsitory.removeManager(idgroup, manager)
            let messageBehavior: iMessageAction = container.resolve(MessageService)
            let mess = await messageBehavior.sendNotitfyMessage(idgroup, iduser, " removed manager {{@}}", [manager])
            let iMessageInformation: iMessageInformation = container.resolve(MessageService)
            return await iMessageInformation.getOneMessage(mess.messageId)
        }
        else {
            throw new MyException("You don't have permisson for action").withExceptionCode(HttpStatus.FORBIDDEN)
        }
    }
    async addManager(iduser: number, invitee: number, idgroup: number): Promise<Message> {
        if (await this.groupRepsitory.isContainInGroup(invitee, idgroup, MemberStatus.DEFAULT) && await this.groupRepsitory.getPosition(idgroup, iduser) == PositionInGrop.CREATOR) {
            await this.groupRepsitory.addManager(idgroup, invitee)
            let messageBehavior: iMessageAction = container.resolve(MessageService)
            let mess = await messageBehavior.sendNotitfyMessage(idgroup, iduser, " added manager {{@}}", [invitee])
            let iMessageInformation: iMessageInformation = container.resolve(MessageService)
            return await iMessageInformation.getOneMessage(mess.messageId)
        }
        else {
            throw new MyException("You don't have permisson for action").withExceptionCode(HttpStatus.FORBIDDEN)
        }
    }
    async renameGroup(iduser: number, idgroup: number, name: string): Promise<Message> {
        if (await this.groupRepsitory.isContainInGroup(iduser, idgroup, MemberStatus.DEFAULT) && await this.groupRepsitory.checkMemberPermisstion(MemberPermisstion.RENAME_GROUP, iduser, idgroup) || (await this.groupRepsitory.getPosition(idgroup, iduser) == PositionInGrop.ADMIN || PositionInGrop.CREATOR)) {
            await this.groupRepsitory.renameGroup(idgroup, name)
            let messageBehavior: iMessageAction = container.resolve(MessageService)
            let mess = await messageBehavior.sendNotitfyMessage(idgroup, iduser, " renamed group to " + name, [])
            let iMessageInformation: iMessageInformation = container.resolve(MessageService)
            return await iMessageInformation.getOneMessage(mess.messageId)
        }
        else {
            throw new MyException("You don't have permisson for action").withExceptionCode(HttpStatus.FORBIDDEN)
        }
    }
    async requestJoinFromLink(iduser: number, idgroup: string): Promise<RequestJoinFromLink> {
        let data = await this.groupRepsitory.getBaseInformationGroupFromLink(idgroup)
        if (data) {
            if (!await this.groupRepsitory.isContainInGroup(iduser, data.groupId)) {
                if (await this.groupRepsitory.checkMemberPermisstion(MemberPermisstion.AUTO_APPROVAL, iduser, data.groupId)) {
                    await this.groupRepsitory.joinGroup(iduser, data.groupId)
                    let messageBehavior: iMessageAction = container.resolve(MessageService)
                    let mess = await messageBehavior.sendNotitfyMessage(data.groupId, iduser, " joined group", [])
                    let messInfor: iMessageInformation = container.resolve(MessageService)
                    return {
                        isJoin: true,
                        message: await messInfor.getOneMessage(mess.messageId)
                    }
                } else {
                    await this.groupRepsitory.addUserToApprovalQueue(iduser, data.groupId)
                    return {
                        isJoin: false,
                        message: null
                    }
                }
            }
            throw new MyException("You already in group").withExceptionCode(HttpStatus.BAD_REQUEST)
        }
        throw new MyException("Group don't exist").withExceptionCode(HttpStatus.BAD_REQUEST)
        //TODO : check user was blocked by admin
    }
    async isUserExistInGroup(iduser: number, idgroup: number, status: MemberStatus = MemberStatus.DEFAULT): Promise<boolean> {
        return await this.groupRepsitory.isContainInGroup(iduser, idgroup, MemberStatus.DEFAULT)
    }
    async changeAvatarGroup(iduser: number, idgroup: number, file: Express.Multer.File): Promise<ChangeAvatarGroup> {
        if (await this.groupRepsitory.isContainInGroup(iduser, idgroup, MemberStatus.DEFAULT) && await this.groupRepsitory.checkMemberPermisstion(MemberPermisstion.RENAME_GROUP, iduser, idgroup) || (await this.groupRepsitory.getPosition(idgroup, iduser) == PositionInGrop.ADMIN || PositionInGrop.CREATOR)) {
            let data = await this.groupRepsitory.changeAvatarGroup(iduser, idgroup, file)
            if (data) {
                let messageBehavior: iMessageAction = container.resolve(MessageService)
                let mess = await messageBehavior.sendNotitfyMessage(idgroup, iduser, "change avatar group", [])
                let messageBehavior2: iMessageInformation = container.resolve(MessageService)
                return {
                    url: data.url,
                    message: await messageBehavior2.getOneMessage(mess.messageId)
                }
            }
            else throw new Error("Can't change avatar")
        }
        else {
            throw new MyException("You don't have permisson for action").withExceptionCode(HttpStatus.FORBIDDEN)
        }
    }
    // FIXME: change response
    async getAllMember(iduser: number, idgroup: number): Promise<MemberDTO[]> {
        if (await this.isUserExistInGroup(iduser, idgroup)) {
            let data = await this.groupRepsitory.getAllMember(idgroup)
            if (data) {
                return data.map<MemberDTO>((value, index, array) => {
                    return MemberDTO.fromRawData(value)
                });
            }
        }
        throw new MyException("You don't in group").withExceptionCode(HttpStatus.FORBIDDEN)
    }
    async getOneGroup(iduser: number, idgroup: number): Promise<GroupChatDTO> {
        if (await this.isUserExistInGroup(iduser, idgroup)) {
            let data = await this.groupRepsitory.getOneGroup(idgroup);
            if (data) {
                let a = Group.fromRawData(data)
                return GroupChatDTO.fromBase(a, await container.resolve(MessageService).getLastMessage(idgroup), await this.getTotalMember(idgroup), await container.resolve(MessageService).getNumMessageUnread(idgroup, 1))
            }
        }
        throw new MyException("You don't in group").withExceptionCode(HttpStatus.FORBIDDEN)
    }
    async inviteMember(iduser: any, idgroup: number, userIDs: number[]): Promise<any> {
        let message: Array<Message> = [];
        if (await this.isUserExistInGroup(iduser, idgroup)) {
            let position = await this.getPosition(idgroup, iduser);
            if (position === PositionInGrop.ADMIN || position === PositionInGrop.CREATOR) {
                let inforUser: RelationServiceBehavior = container.resolve(RelationService)
                for (let _iduser of userIDs) {
                    if (await inforUser.getRelationship(iduser, _iduser) !== RelationshipUser.FRIEND) {
                        throw new MyException("List user added isn't your friend").withExceptionCode(HttpStatus.BAD_REQUEST)
                    }

                }
                let messageBehavior: iMessageAction = container.resolve(MessageService)
                let messageBehavior2 = container.resolve(MessageService)
                for (let _iduser of userIDs) {
                    await this.groupRepsitory.joinGroup(_iduser, idgroup)
                    let mess = await messageBehavior.sendNotitfyMessage(idgroup, iduser, " invited member {{@}}", userIDs)
                    message.push(await messageBehavior2.getOneMessage(mess.messageId))
                }
                // return await messageBehavior.getOneMessage(mess.idmessage)
            } else if (position === PositionInGrop.MEMBER) {
                if (await this.getAccessGroup(idgroup) === GroupAccess.PRIVATE) {
                    throw new MyException("You don't have permisson for action").withExceptionCode(HttpStatus.FORBIDDEN)
                } else {
                    let inforUser: RelationServiceBehavior = container.resolve(RelationService)
                    for (let _iduser of userIDs) {
                        if (await inforUser.getRelationship(iduser, _iduser) !== RelationshipUser.FRIEND) {
                            throw new MyException("List user added isn't your friend").withExceptionCode(HttpStatus.BAD_REQUEST)
                        }
                    }
                    let messageBehavior: iMessageAction = container.resolve(MessageService)
                    let mess = await messageBehavior.sendNotitfyMessage(idgroup, iduser, " invited member {{" + userIDs.length + "}}", userIDs)
                    for (let _iduser of userIDs) {
                        await this.groupRepsitory.addUserToApprovalQueue(_iduser, idgroup)
                    }
                }
            }
            throw new MyException("You don't have permisson for action").withExceptionCode(HttpStatus.FORBIDDEN)
        }
        return message;
    }
    async leaveGroup(iduser: any, idgroup: number): Promise<Message> {
        if (await this.groupRepsitory.isContainInGroup(iduser, idgroup, MemberStatus.DEFAULT)) {
            let position = await this.groupRepsitory.getPosition(idgroup, iduser);
            if (position != PositionInGrop.ADMIN && position != PositionInGrop.CREATOR) {
                await this.groupRepsitory.leaveGroup(iduser, idgroup)
                let messageBehavior: iMessageAction = container.resolve(MessageService)
                return messageBehavior.sendNotitfyMessage(idgroup, iduser, " was left group ", [])
            }
            else throw new MyException("You can't leave group, you is admin !!! ").withExceptionCode(HttpStatus.BAD_REQUEST)
        }
        else throw new MyException("You don't contain in group").withExceptionCode(HttpStatus.FORBIDDEN)
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
        await messageBehavior.sendNotitfyMessage(group.groupId, iduser, "created group", [])
        if (users.length > 0) {
            let strMessage = "added member "
            for (let i = 0; i < users.length; i++) {
                strMessage += "{{@}}"
            }
            await messageBehavior.sendNotitfyMessage(group.groupId, iduser, strMessage, users)
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