import Group from "./../../models/group.model"
import iMessageServiceBehavior, { iMessageAction, iMessageInformation } from "../messaging/interface/message.service.interface"
import MessageService from "../messaging/message.service"
import { RelationServiceBehavior } from "../relationship/interface/relation.service.interface"
import RelationService from "../relationship/relation.service"
import LastViewGroup from "./dtos/lastview.dto"
import { MemberDTO } from "./dtos/member.dto"
import { GroupChatDTO, dataDTO } from "./dtos/response.lisgroup.dto"
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
import { MyException, HttpStatus } from "@/lib/common"

@injectable()
export default class GroupService implements iGroupServiceBehavior {

    constructor(@inject(GroupRepository) private groupRepsitory: GroupRepositoryBehavior) {
    }
    async getAllRoom(userId: number): Promise<string[]> {
        return await this.groupRepsitory.getAllRoom(userId);
    }
    async getListUserPending(userId: number, groupId: number): Promise<MemberDTO[]> {
        if (await this.isUserExistInGroup(userId, groupId)) {
            let position = await this.getPosition(groupId, userId);
            if (position == PositionInGrop.CREATOR || position == PositionInGrop.ADMIN) {
                let data = await this.groupRepsitory.getAllUserPending(groupId)
                if (data) {
                    return data.map<MemberDTO>((value, index, array) => {
                        return MemberDTO.fromRawData(value)
                    });
                }
            } throw new MyException("You don't have permisson for action").withExceptionCode(HttpStatus.FORBIDDEN)
        } throw new MyException("You don't in group").withExceptionCode(HttpStatus.FORBIDDEN)
    }
    async getAccessGroup(groupId: number): Promise<GroupAccess> {
        return await this.groupRepsitory.getAccessGroup(groupId)
    }
    async getBaseInformationGroupFromLink(link: string): Promise<Group | null> {
        return await this.groupRepsitory.getBaseInformationGroupFromLink(link)
    }
    async deleteGroup(userId: number, groupId: number): Promise<boolean> {
        if (await this.groupRepsitory.getPosition(groupId, userId) == PositionInGrop.CREATOR) {
            return await this.groupRepsitory.deleteGroup(groupId)
        }
        return true;
    }

    async changeNickname(userId: number, userIdChange: number, groupId: number, nickname: string): Promise<Message> {
        if ((await this.groupRepsitory.isContainInGroup(userId, groupId, MemberStatus.DEFAULT) && await this.groupRepsitory.getPosition(groupId, userId) == PositionInGrop.ADMIN || PositionInGrop.CREATOR) || userId === userIdChange) {
            await this.groupRepsitory.changeNickname(userId, userIdChange, groupId, nickname)
            let messageBehavior: iMessageServiceBehavior = container.resolve(MessageService)
            let mess = await messageBehavior.sendNotifyMessage(groupId, userId, " change nickname {{@}} to " + nickname, [userIdChange])
            return await messageBehavior.getOneMessage(mess.messageId)
        }
        else {
            throw new MyException("You don't have permisstion for action").withExceptionCode(HttpStatus.FORBIDDEN)
        }
    }
    async isExistInvidualGroup(userId: number, userIdAddressee: number): Promise<boolean> {
        return await this.groupRepsitory.isExistInvidualGroup(userId, userIdAddressee)
    }
    async getInvidualGroup(userId: number, userIdAddressee: number): Promise<number> {
        let inforUser: RelationServiceBehavior = container.resolve(RelationService)
        if (RelationshipUser.FRIEND && !await this.isExistInvidualGroup(userId, userIdAddressee)) {
            if (await inforUser.getRelationship(userId, userIdAddressee) === RelationshipUser.FRIEND)
                return this.groupRepsitory.createInvidualGroup(userId, userIdAddressee, GroupStatus.DEFAULT)
            return this.groupRepsitory.createInvidualGroup(userId, userIdAddressee, GroupStatus.STRANGE_PEOPLE)
        }
        return await this.groupRepsitory.getInvidualGroup(userId, userIdAddressee);
    }
    async getTypeGroup(groupId: number): Promise<GroupStatus> {
        return await this.groupRepsitory.getTypeGroup(groupId)
    }
    async createInvidualGroup(userId: number, users: number): Promise<CreateIndividualGroup> {
        let inforUser: RelationServiceBehavior = container.resolve(RelationService)
        if (RelationshipUser.FRIEND && !await this.isExistInvidualGroup(userId, users)) {
            if (await inforUser.getRelationship(userId, users) === RelationshipUser.FRIEND) {
                let data1 = await this.groupRepsitory.createInvidualGroup(userId, users, GroupStatus.DEFAULT)
                return {
                    groupId: data1,
                    isExisted: false
                }
            }
            let data2 = await this.groupRepsitory.createInvidualGroup(userId, users, GroupStatus.STRANGE_PEOPLE)
            return {
                groupId: data2,
                isExisted: false
            }
        }
        let data2 = await this.getInvidualGroup(userId, users);
        return {
            groupId: data2,
            isExisted: true

        }
    }
    async getPosition(groupId: Number, userId: Number): Promise<PositionInGrop> {
        return await this.groupRepsitory.getPosition(groupId, userId)
    }
    async getInformationMember(userIdWantGet: number, userId: number, groupId: number): Promise<any> {
        if (await this.isUserExistInGroup(userId, groupId)) {
            if (await this.isUserExistInGroup(userId, groupId))
                return MemberDTO.fromRawData(await this.groupRepsitory.getInformationMember(userIdWantGet, groupId))
            else throw new MyException("User don't contain in group").withExceptionCode(HttpStatus.BAD_REQUEST)
        } throw new MyException("You don't contain in group").withExceptionCode(HttpStatus.FORBIDDEN)
    }
    async getTotalMember(groupId: number): Promise<number> {
        return await this.groupRepsitory.getTotalMember(groupId)
    }
    async getSomeGroup(userId: number, cursor: number, limit: number): Promise<dataDTO> {
        let dataRaw = await this.groupRepsitory.getSomeGroup(userId, cursor, limit)
        if (dataRaw) {
            let message: iMessageAction = container.resolve(MessageService)
            return dataDTO.rawToDTO(dataRaw, async (groupId: number) => {
                return await message.getLastMessage(groupId)
            }, async (groupId: number) => {
                return await this.getTotalMember(groupId)
            }, async (groupId: number) => {
                return await message.getNumMessageUnread(groupId, userId)
            })
        }
        return new dataDTO([], null)
    }
    async blockMember(userId: number, userIdAdd: number, groupId: number): Promise<boolean> {
        if (await this.groupRepsitory.isContainInGroup(userIdAdd, groupId, MemberStatus.DEFAULT) && (((await this.groupRepsitory.getPosition(groupId, userId) == PositionInGrop.CREATOR || PositionInGrop.ADMIN)))) {
            return await this.groupRepsitory.changeStatusMember(userIdAdd, groupId, MemberStatus.BLOCKED)
        }
        else {
            throw new MyException("You don't have permisson for action").withExceptionCode(HttpStatus.FORBIDDEN)
        }
    }
    async approvalMember(userId: number, userIdAdd: number, groupId: number): Promise<Message> {
        if (await this.groupRepsitory.isContainInGroup(userIdAdd, groupId, MemberStatus.PENDING) && (await this.groupRepsitory.getPosition(groupId, userId) == PositionInGrop.CREATOR || PositionInGrop.ADMIN)) {
            await this.groupRepsitory.changeStatusMember(userIdAdd, groupId, MemberStatus.DEFAULT)
            let messageBehavior: iMessageAction = container.resolve(MessageService)
            let mess = await messageBehavior.sendNotifyMessage(groupId, userId, " approved member {{@}}", [userIdAdd])
            let iMessageInformation: iMessageInformation = container.resolve(MessageService)
            return await iMessageInformation.getOneMessage(mess.messageId)
        }
        else {
            throw new MyException("You don't have permisson for action").withExceptionCode(HttpStatus.FORBIDDEN)
        }
    }
    async removeMember(userId: number, userIdRemove: number, groupId: number): Promise<Message> {
        if (await this.isUserExistInGroup(userIdRemove, groupId) && (await this.groupRepsitory.getPosition(groupId, userId) == PositionInGrop.CREATOR || PositionInGrop.ADMIN)) {
            await this.groupRepsitory.removeMember(groupId, userIdRemove)
            let messageBehavior: iMessageAction = container.resolve(MessageService)
            let mess = await messageBehavior.sendNotifyMessage(groupId, userId, " removed member {{@}}", [userIdRemove])
            let iMessageInformation: iMessageInformation = container.resolve(MessageService)
            return await iMessageInformation.getOneMessage(mess.messageId)
        }
        else {
            throw new MyException("You don't have permisson for action").withExceptionCode(HttpStatus.FORBIDDEN)
        }
    }
    async removeManager(userId: number, manager: number, groupId: number): Promise<Message> {
        if (await this.isUserExistInGroup(manager, groupId) && await this.groupRepsitory.getPosition(groupId, userId) == PositionInGrop.CREATOR) {
            await this.groupRepsitory.removeManager(groupId, manager)
            let messageBehavior: iMessageAction = container.resolve(MessageService)
            let mess = await messageBehavior.sendNotifyMessage(groupId, userId, " removed manager {{@}}", [manager])
            let iMessageInformation: iMessageInformation = container.resolve(MessageService)
            return await iMessageInformation.getOneMessage(mess.messageId)
        }
        else {
            throw new MyException("You don't have permisson for action").withExceptionCode(HttpStatus.FORBIDDEN)
        }
    }
    async addManager(userId: number, invitee: number, groupId: number): Promise<Message> {
        if (await this.groupRepsitory.isContainInGroup(invitee, groupId, MemberStatus.DEFAULT) && await this.groupRepsitory.getPosition(groupId, userId) == PositionInGrop.CREATOR) {
            await this.groupRepsitory.addManager(groupId, invitee)
            let messageBehavior: iMessageAction = container.resolve(MessageService)
            let mess = await messageBehavior.sendNotifyMessage(groupId, userId, " added manager {{@}}", [invitee])
            let iMessageInformation: iMessageInformation = container.resolve(MessageService)
            return await iMessageInformation.getOneMessage(mess.messageId)
        }
        else {
            throw new MyException("You don't have permisson for action").withExceptionCode(HttpStatus.FORBIDDEN)
        }
    }
    async renameGroup(userId: number, groupId: number, name: string): Promise<Message> {
        if (await this.groupRepsitory.isContainInGroup(userId, groupId, MemberStatus.DEFAULT) && await this.groupRepsitory.checkMemberPermisstion(MemberPermisstion.RENAME_GROUP, userId, groupId) || (await this.groupRepsitory.getPosition(groupId, userId) == PositionInGrop.ADMIN || PositionInGrop.CREATOR)) {
            await this.groupRepsitory.renameGroup(groupId, name)
            let messageBehavior: iMessageAction = container.resolve(MessageService)
            let mess = await messageBehavior.sendNotifyMessage(groupId, userId, " renamed group to " + name, [])
            let iMessageInformation: iMessageInformation = container.resolve(MessageService)
            return await iMessageInformation.getOneMessage(mess.messageId)
        }
        else {
            throw new MyException("You don't have permisson for action").withExceptionCode(HttpStatus.FORBIDDEN)
        }
    }
    async requestJoinFromLink(userId: number, groupId: string): Promise<RequestJoinFromLink> {
        let data = await this.groupRepsitory.getBaseInformationGroupFromLink(groupId)
        if (data) {
            if (!await this.groupRepsitory.isContainInGroup(userId, data.groupId)) {
                if (await this.groupRepsitory.checkMemberPermisstion(MemberPermisstion.AUTO_APPROVAL, userId, data.groupId)) {
                    await this.groupRepsitory.joinGroup(userId, data.groupId)
                    let messageBehavior: iMessageAction = container.resolve(MessageService)
                    let mess = await messageBehavior.sendNotifyMessage(data.groupId, userId, " joined group", [])
                    let messInfor: iMessageInformation = container.resolve(MessageService)
                    return {
                        isJoin: true,
                        message: await messInfor.getOneMessage(mess.messageId)
                    }
                } else {
                    await this.groupRepsitory.addUserToApprovalQueue(userId, data.groupId)
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
    async isUserExistInGroup(userId: number, groupId: number, status: MemberStatus = MemberStatus.DEFAULT): Promise<boolean> {
        return await this.groupRepsitory.isContainInGroup(userId, groupId, MemberStatus.DEFAULT)
    }
    async changeAvatarGroup(userId: number, groupId: number, file: Express.Multer.File): Promise<ChangeAvatarGroup> {
        if (await this.groupRepsitory.isContainInGroup(userId, groupId, MemberStatus.DEFAULT) && await this.groupRepsitory.checkMemberPermisstion(MemberPermisstion.RENAME_GROUP, userId, groupId) || (await this.groupRepsitory.getPosition(groupId, userId) == PositionInGrop.ADMIN || PositionInGrop.CREATOR)) {
            let data = await this.groupRepsitory.changeAvatarGroup(userId, groupId, file)
            if (data) {
                let messageBehavior: iMessageAction = container.resolve(MessageService)
                let mess = await messageBehavior.sendNotifyMessage(groupId, userId, "change avatar group", [])
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
    async getAllMember(userId: number, groupId: number): Promise<MemberDTO[]> {
        if (await this.isUserExistInGroup(userId, groupId)) {
            let data = await this.groupRepsitory.getAllMember(groupId)
            if (data) {
                return data.map<MemberDTO>((value, index, array) => {
                    return MemberDTO.fromRawData(value)
                });
            }
        }
        throw new MyException("You don't in group").withExceptionCode(HttpStatus.FORBIDDEN)
    }
    async getOneGroup(userId: number, groupId: number): Promise<GroupChatDTO> {
        if (await this.isUserExistInGroup(userId, groupId)) {
            let data = await this.groupRepsitory.getOneGroup(groupId);
            if (data) {
                let a = Group.fromRawData(data)
                return GroupChatDTO.fromBase(a, await container.resolve(MessageService).getLastMessage(groupId), await this.getTotalMember(groupId), await container.resolve(MessageService).getNumMessageUnread(groupId, 1))
            }
        }
        throw new MyException("You don't in group").withExceptionCode(HttpStatus.FORBIDDEN)
    }
    async inviteMember(userId: any, groupId: number, userIDs: number[]): Promise<any> {
        let message: Array<Message> = [];
        if (await this.isUserExistInGroup(userId, groupId)) {
            let position = await this.getPosition(groupId, userId);
            if (position === PositionInGrop.ADMIN || position === PositionInGrop.CREATOR) {
                let inforUser: RelationServiceBehavior = container.resolve(RelationService)
                for (let _userId of userIDs) {
                    if (await inforUser.getRelationship(userId, _userId) !== RelationshipUser.FRIEND) {
                        throw new MyException("List user added isn't your friend").withExceptionCode(HttpStatus.BAD_REQUEST)
                    }

                }
                let messageBehavior: iMessageAction = container.resolve(MessageService)
                let messageBehavior2 = container.resolve(MessageService)
                for (let _userId of userIDs) {
                    await this.groupRepsitory.joinGroup(_userId, groupId)
                    let mess = await messageBehavior.sendNotifyMessage(groupId, userId, " invited member {{@}}", userIDs)
                    message.push(await messageBehavior2.getOneMessage(mess.messageId))
                }
                // return await messageBehavior.getOneMessage(mess.messageId)
            } else if (position === PositionInGrop.MEMBER) {
                if (await this.getAccessGroup(groupId) === GroupAccess.PRIVATE) {
                    throw new MyException("You don't have permisson for action").withExceptionCode(HttpStatus.FORBIDDEN)
                } else {
                    let inforUser: RelationServiceBehavior = container.resolve(RelationService)
                    for (let _userId of userIDs) {
                        if (await inforUser.getRelationship(userId, _userId) !== RelationshipUser.FRIEND) {
                            throw new MyException("List user added isn't your friend").withExceptionCode(HttpStatus.BAD_REQUEST)
                        }
                    }
                    let messageBehavior: iMessageAction = container.resolve(MessageService)
                    let mess = await messageBehavior.sendNotifyMessage(groupId, userId, " invited member {{" + userIDs.length + "}}", userIDs)
                    for (let _userId of userIDs) {
                        await this.groupRepsitory.addUserToApprovalQueue(_userId, groupId)
                    }
                }
            }
            throw new MyException("You don't have permisson for action").withExceptionCode(HttpStatus.FORBIDDEN)
        }
        return message;
    }
    async leaveGroup(userId: any, groupId: number): Promise<Message> {
        if (await this.groupRepsitory.isContainInGroup(userId, groupId, MemberStatus.DEFAULT)) {
            let position = await this.groupRepsitory.getPosition(groupId, userId);
            if (position != PositionInGrop.ADMIN && position != PositionInGrop.CREATOR) {
                await this.groupRepsitory.leaveGroup(userId, groupId)
                let messageBehavior: iMessageAction = container.resolve(MessageService)
                return messageBehavior.sendNotifyMessage(groupId, userId, " was left group ", [])
            }
            else throw new MyException("You can't leave group, you is admin !!! ").withExceptionCode(HttpStatus.BAD_REQUEST)
        }
        else throw new MyException("You don't contain in group").withExceptionCode(HttpStatus.FORBIDDEN)
    }
    async getAllGroup(userId: number): Promise<Array<Group>> {
        let dataRaw = await this.groupRepsitory.getAllGroup(userId)
        if (dataRaw) {
            return dataRaw.map<Group>((value, index, array) => {
                return Group.fromRawData(value)
            });
        }
        return []
    }
    async createCommunityGroup(name: string, userId: number, users: Array<number>): Promise<Group> {
        let inforUser: RelationServiceBehavior = container.resolve(RelationService)
        for (let _userId of users) {
            if (await inforUser.getRelationship(userId, _userId) !== RelationshipUser.FRIEND) {
                throw new MyException("List user added isn't your friend").withExceptionCode(HttpStatus.BAD_REQUEST)
            }
        }
        let group = Group.fromRawData(await this.groupRepsitory.createGroup(name, userId, users))
        let messageBehavior: iMessageAction = container.resolve(MessageService)
        await messageBehavior.sendNotifyMessage(group.groupId, userId, "created group", [])
        if (users.length > 0) {
            let strMessage = "added member "
            for (let i = 0; i < users.length; i++) {
                strMessage += "{{@}}"
            }
            await messageBehavior.sendNotifyMessage(group.groupId, userId, strMessage, users)
        } else throw new MyException("Total users > 2").withExceptionCode(HttpStatus.BAD_GATEWAY)
        return group;
    }
    async getLastViewMember(groupId: number) {
        let rawDataSQL = await this.groupRepsitory.getLastViewMember(groupId)
        if (rawDataSQL) {
            return rawDataSQL.map<LastViewGroup>((value, index, array) => {
                return LastViewGroup.fromRawData(value)
            });
        }
        console.log(rawDataSQL)
        return []
    }
}