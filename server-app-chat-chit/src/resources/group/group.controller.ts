import { BadRequestException, HttpException, HttpStatus, MotherController } from "@/lib/common";
import { NextFunction, Request, Response } from "express";
import { Server } from "socket.io";
import GroupService from "@/resources/group/group.service";
import LastViewGroup from "./dtos/lastview.dto";
import multer from "multer";
import { ResponseBody } from "@/utils/definition/http.response";
import { AuthorizeGuard } from "@/middleware/auth.middleware";
import { convertToObjectDTO, isValidNumberVariable } from "@/utils/validate";
import { User } from "../../models/user.model";
import { EventGroupIO } from "./constant/group.constant";
import { inject } from "tsyringe";
import { getRoomUserIO } from "@/utils/extension/room.user";
import { getRoomGroupIO } from "@/utils/extension/room.group";
import { EventMessageIO } from "../messaging/constant/event.io";
import { Controller, DELETE, FileUpload, GET, PATCH, POST, Params, Headers, UseGuard, Query, Body, Req } from "@/lib/decorator";
import { PagingReq } from "@/utils/paging/paging.data";
@Controller("/group")
export default class GroupController extends MotherController {
    constructor(@inject(Server) io: Server, @inject(GroupService) private groupService: GroupService) {
        super(io)
    }

    @POST('/:id/admin/pending')
    @UseGuard(AuthorizeGuard)
    private async getListUserPending(@Params("id") groupId: number, @Headers("userId") userId: number) {
        if (isValidNumberVariable(groupId)) {
            let data = await this.groupService.getListUserPending(userId, groupId)
            return (new ResponseBody(
                true,
                "",
                data
            ))
        }
        throw (new BadRequestException("Agurment is invalid"))
    }
    @POST("/:link/request-join")
    @UseGuard(AuthorizeGuard)
    private async requestJoinFromLink(@Headers("userId") userId: number, @Params("link") link: string) {
        if (link) {
            let data = await this.groupService.requestJoinFromLink(userId, link)
            if (data.isJoin && data.message) {
                this.io.to(getRoomGroupIO(data.message.groupId)).emit(EventGroupIO.REQUEST_JOIN_FROM_LINK, data)
                return (new ResponseBody(
                    true,
                    "You joined the group successfully",
                    {}
                )
                )
            }
            else {
                return new ResponseBody(
                    true,
                    "You in queue and wait for admin approval",
                    {}
                )
            }
        }
        throw (new BadRequestException("Agurment is invalid"))
    }

    @GET("/:link")
    @UseGuard(AuthorizeGuard)
    private async getBaseInformationGroupFromLink(@Headers("userId") userId: number, @Params("link") link: string) {
        if (link) {
            let data = await this.groupService.getBaseInformationGroupFromLink(link)
            return (
                new ResponseBody(
                    true,
                    "",
                    data
                )
            )
        }
        throw (new BadRequestException("Agurment is invalid"))
    }

    @GET("/")
    @UseGuard(AuthorizeGuard)
    private async getSomeGroup(@Query() pagingReq: PagingReq, @Headers("userId") userId: number) {
        let data = await this.groupService.getSomeGroup(userId, pagingReq.cursor, pagingReq.limit)
        return (new ResponseBody(
            true,
            "OK",
            data
        ))
    }

    @POST('/community-group')
    @UseGuard(AuthorizeGuard)
    private async createCommunityGroup(@Headers("userId") userId: number, @Body("users") users: number[], @Body("name") name: string) {
        if (name) {
            let data = await this.groupService.createCommunityGroup(name, userId, users)
            // FIXME: socker ?
            for (let a of users) {
                this.io.to("").emit("invite-to-group",)
            }
            return (new ResponseBody(
                true,
                "",
                data
            ))
        }
    }
    //FIXME: change status group to default or stranger
    @POST('/individual-group/:userId')
    @UseGuard(AuthorizeGuard)
    private async createInvidualGroup(@Headers("userId") userId: number, @Params("userId") userIdAddressee: number) {
        if (userIdAddressee) {
            let data = await this.groupService.createInvidualGroup(userId, userIdAddressee)
            if (!data.isExisted) {
                this.io.to(getRoomUserIO(userId)).emit(EventGroupIO.CREATE_INDIVIDUAL_GROUP, data)
            }
            return (new ResponseBody(
                true,
                "",
                data
            ))
        }
    }
    @PATCH('/:id/avatar')
    @FileUpload(multer().single("avatar"))
    @UseGuard(AuthorizeGuard)
    private async changeAvatarGroup(@Headers("userId") userId: number, @Params("id") id: number, @Req() req: Request) {
        if (await this.groupService.isUserExistInGroup(userId, Number(id))) {
            let file = req.file;
            if (file && file.mimetype.includes("image")) {
                let data = await this.groupService.changeAvatarGroup(userId, (id), file)
                this.io.to(getRoomGroupIO(id)).emit(EventGroupIO.CHANGE_AVATAR, { url: data?.url })
                this.io.to(getRoomGroupIO(id)).emit(EventMessageIO.NEW_MESSAGE, [data?.message])
                return (new ResponseBody(
                    true,
                    "",
                    {}
                ))
            }
            else {
                throw (new HttpException(HttpStatus.BAD_REQUEST, "Ảnh không hợp lệ"))
            }
        } else {
            throw (new HttpException(HttpStatus.NOT_ACCEPTABLE, "You don't have permisson for action"))
        }
    }

    //FIXME:  logic
    @GET('/:id/lastview')
    @UseGuard(AuthorizeGuard)
    private async getLastViewMember(@Headers("userId") userId: number, @Params("id") id: number) {
        if (await this.groupService.isUserExistInGroup(userId, Number(id))) {
            let data: LastViewGroup[] = await this.groupService.getLastViewMember(Number(id))
            return (new ResponseBody(
                true,
                "OK",
                data
            ))
        }
    }
    @GET('/:id/community-group')
    @UseGuard(AuthorizeGuard)
    private async getOneGroup(@Headers("userId") userId: number, @Params("id") id: number) {
        let data = await this.groupService.getOneGroup(userId, Number(id))
        return (new ResponseBody(true, "OK", data))
    }

    @GET('/:id/members')
    @UseGuard(AuthorizeGuard)
    private async getAllMember(@Headers("userId") userId: number, @Params("id") id: number) {
        if (isValidNumberVariable(id)) {
            let data = await this.groupService.getAllMember(userId, Number(id))
            return (new ResponseBody(true, "OK", data))
        }
        throw (new BadRequestException("Agurment is invalid"))
    }
    @POST('/:id/invite-members')
    private async inviteMember(@Headers("userId") userId: number, @Params("id") groupId: number, @Body("userIds") userIds: number[]) {
        let message = await this.groupService.inviteMember(userId, groupId, userIds)
        if (message.length > 0) {
            this.io.to(getRoomGroupIO(groupId)).emit(EventMessageIO.NEW_MESSAGE, [message])
            this.io.to(getRoomGroupIO(groupId)).emit(EventMessageIO.UPDATE_MEMBER, [userIds])
            //add noti for user
        }
        return (new ResponseBody(true, "OK", {}))
    }
    @POST('/:id/members/leave')
    @UseGuard(AuthorizeGuard)
    private async leaveGroup(@Headers("userId") userId: number, @Params("id") id: number) {
        if (isValidNumberVariable(userId) && isValidNumberVariable(id)) {
            let message = await this.groupService.leaveGroup(userId, Number(id))
            this.io.to(getRoomGroupIO(id)).emit(EventGroupIO.LEAVE_GROUP, userId);
            this.io.to(getRoomGroupIO(id)).emit(EventMessageIO.NEW_MESSAGE, [message]);
            return (new ResponseBody(
                true,
                "OK",
                null
            ))
        }
        throw (new BadRequestException("Agurment is invalid"))
    }
    @PATCH('/admin/:id/manager')
    @UseGuard(AuthorizeGuard)
    private async addManager(@Headers("userId") userId: number, @Params("id") groupId: number, @Body("invitee") invitee: number) {
        if (isValidNumberVariable(invitee) && isValidNumberVariable(groupId) && userId !== invitee) {
            let data = await this.groupService.addManager(userId, invitee, groupId)
            this.io.to(getRoomGroupIO(groupId)).emit(EventGroupIO.ADD_MANAGER, { userIds: invitee })
            this.io.to(getRoomGroupIO(groupId)).emit(EventMessageIO.NEW_MESSAGE, [data])
            return (
                new ResponseBody(
                    true,
                    "",
                    {}
                )
            )
        }
        throw (new BadRequestException("Agurment is invalid"))
    }
    @DELETE('/admin/:id/manager')
    @UseGuard(AuthorizeGuard)
    private async removeManager(@Headers("userId") userId: number, @Params("id") groupId: number, @Body("manager") manager: number) {
        if (isValidNumberVariable(manager) && isValidNumberVariable(groupId) && userId !== manager) {
            let data = await this.groupService.removeManager(userId, manager, groupId)
            this.io.to(getRoomGroupIO(groupId)).emit(EventGroupIO.REMOVE_MANAGER, { userId: manager })
            this.io.to(getRoomGroupIO(groupId)).emit(EventMessageIO.NEW_MESSAGE, [data])
            return (
                new ResponseBody(
                    true,
                    "",
                    {}
                )
            )
        }
        throw (new BadRequestException("Agurment is invalid"))
    }
    @DELETE('/admin/:id/member/:userId')
    @UseGuard(AuthorizeGuard)
    private async removeMember(
        @Headers("userId") userId: number,
        @Params("id") groupId: number,
        @Params("userId") userIdAdd: number,
    ) {
        if (isValidNumberVariable(userIdAdd) && isValidNumberVariable(groupId) && userId !== userIdAdd) {
            let data = await this.groupService.removeMember(userId, userIdAdd, groupId)
            this.io.to(getRoomGroupIO(groupId)).emit(EventGroupIO.MEMBER_WAS_REMOVE, { userId: userIdAdd })
            this.io.to(getRoomGroupIO(groupId)).emit(EventMessageIO.NEW_MESSAGE, [data])
            return (
                new ResponseBody(
                    true,
                    "",
                    {}
                )
            )
        }
        throw (new BadRequestException("Agurment is invalid"))
    }
    @PATCH('/admin/:id/rename')
    @UseGuard(AuthorizeGuard)
    private async renameGroup(@Headers("userId") userId: number, @Params("id") groupId: number, @Body("name") name: string) {
        if (isValidNumberVariable(groupId)) {
            let data = await this.groupService.renameGroup(userId, groupId, name)
            this.io.to(getRoomGroupIO(groupId)).emit(EventGroupIO.RENAME_GROUP, { name: name })
            this.io.to(getRoomGroupIO(groupId)).emit(EventMessageIO.NEW_MESSAGE, [data])
            return (
                new ResponseBody(
                    true,
                    "",
                    {}
                )
            )
        }
    }
    @PATCH('/admin/:id/blockmember')
    @UseGuard(AuthorizeGuard)
    private async blockMember(@Headers("userId") userId: number, @Params("id") groupId: number, @Body("manager") userIdAdd: number) {
        if (userIdAdd && groupId && userId !== userIdAdd) {
            let data = await this.groupService.blockMember(userId, userIdAdd, groupId)
            return (
                new ResponseBody(
                    data,
                    "",
                    {}
                )
            )
        }
        throw (new BadRequestException("Agurment is invalid"))
    }
    @POST("/admin/:id/approval/:userId")
    @UseGuard(AuthorizeGuard)
    private async approvalMember(@Headers("userId") userId: number, @Params("id") groupId: number, @Params("userId") userIdAdd: number) {
        if (isValidNumberVariable(userIdAdd) && isValidNumberVariable(groupId) && userId !== userIdAdd) {
            let data = await this.groupService.approvalMember(userId, userIdAdd, groupId)
            this.io.to(getRoomGroupIO(groupId)).emit(EventGroupIO.APPROVAL_MEMBER, { userIds: userIdAdd })
            this.io.to(getRoomUserIO(userIdAdd)).emit(EventMessageIO.NEW_MESSAGE, [data])
            //TODO: socket notification to user was approval
            return (
                new ResponseBody(
                    true,
                    "",
                    {}
                )
            )
        }
        throw (new BadRequestException("Agurment is invalid"))
    }
    @GET('/:groupId/member/:userId/')
    @UseGuard(AuthorizeGuard)
    private async getInformationMember(@Headers("userId") myId: number, @Params("groupId") groupId: number, @Params("userId") userIdGet: number) {
        if (isValidNumberVariable(userIdGet) && isValidNumberVariable(groupId)) {
            let data = await this.groupService.getInformationMember(userIdGet, myId, groupId)
            return (
                new ResponseBody<User>(
                    true,
                    "",
                    data
                )
            )
        }
        throw (new BadRequestException("Agurment is invalid"))
    }
    @PATCH('/:id/renickname')
    @UseGuard(AuthorizeGuard)
    private async changeNickname(@Body("nickname") nickname: string, @Headers("userId") userId: number, @Params("id") groupId: number) {
        if (nickname && isValidNumberVariable(userId) && isValidNumberVariable(groupId)) {
            let data = await this.groupService.changeNickname(userId, userId, groupId, nickname)
            this.io.to(getRoomGroupIO(groupId)).emit(EventGroupIO.CHANGE_NICKNAME, data)
            return (
                new ResponseBody(
                    true,
                    "",
                    {}
                )
            )
        }
    }
    // TODO: delete group
    private async deleteGroup(@Params("id") id: number, @Headers("userId") userId: number) {
        if (isValidNumberVariable(id)) {
            let data = await this.groupService.deleteGroup(userId, id)
            return (
                new ResponseBody(
                    true,
                    "",
                    {}
                )
            )
        }
    }
}