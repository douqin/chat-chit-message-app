import HttpException from "@/utils/exceptions/http.exeception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import { MotherController } from "@/lib/common";
import { NextFunction, Request, Response } from "express";
import { Server } from "socket.io";
import GroupService from "@/resources/group/group.service";
import LastViewGroup from "./dtos/lastview.dto";
import iGroupServiceBehavior from "@/resources/group/interface/group.service.interface";
import MyException from "@/utils/exceptions/my.exception";
import multer from "multer";
import { ResponseBody } from "@/utils/definition/http.response";
import { AuthorizeGuard } from "@/middleware/auth.middleware";
import { convertToObjectDTO, isValidNumberVariable } from "@/utils/validate";
import { User } from "../../models/user.model";
import { EventGroupIO } from "./constant/group.constant";
import { BadRequestException, InternalServerError } from "@/utils/exceptions/badrequest.expception";
import { inject } from "tsyringe";
import { getRoomUserIO } from "@/utils/extension/room.user";
import { getRoomGroupIO } from "@/utils/extension/room.group";
import { EventMessageIO } from "../messaging/constant/event.io";
import { Controller, DELETE, FileUpload, GET, PATCH, POST, UseMiddleware } from "@/lib/decorator";
import { PagingReq } from "@/utils/paging/paging.data";
@Controller("/group")
export default class GroupController extends MotherController {
    constructor(@inject(Server) io: Server, @inject(GroupService) private groupService: GroupService) {
        super(io)
    }

    @POST('/:id/admin/pending')
    @UseMiddleware(AuthorizeGuard)
    private async getListUserPending(req: Request, res: Response, next: NextFunction) {
        try {
            const groupId = Number(req.params.id)
            const userId = Number(req.headers['userId'])
            if (isValidNumberVariable(groupId)) {
                let data = await this.groupService.getListUserPending(userId, groupId)
                res.status(HttpStatus.OK).json(new ResponseBody(
                    true,
                    "",
                    data
                ))
                return
            }
            next(new BadRequestException("Agurment is invalid"))
        } catch (e: any) {
            if (e instanceof MyException) {
                next(new HttpException(e.status, e.message))
                return
            }
            console.log("🚀 ~ GroupController ~ getListUserPending= ~ e:", e)
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
    @POST("/:link/request-join")
    @UseMiddleware(AuthorizeGuard)
    private async requestJoinFromLink(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.headers['userId'])
            const link = String(req.params.link)
            if (link) {
                let data = await this.groupService.requestJoinFromLink(userId, link)
                if (data.isJoin && data.message) {
                    this.io.to(getRoomGroupIO(data.message.groupId)).emit(EventGroupIO.REQUEST_JOIN_FROM_LINK, data)
                    res.status(HttpStatus.OK).json(
                        new ResponseBody(
                            true,
                            "You joined the group successfully",
                            {}
                        )
                    )
                }
                else {
                    res.status(HttpStatus.OK).json(
                        new ResponseBody(
                            true,
                            "You in queue and wait for admin approval",
                            {}
                        )
                    )
                }
                return
            }
            next(new BadRequestException("Agurment is invalid"))
        }
        catch (error) {
            if (error instanceof MyException) {
                next(new HttpException(error.status, error.message))
                return
            }
            console.log("🚀 ~ GroupController ~ requestJoinFromLink= ~ error:", error)
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }

    @GET("/:link")
    @UseMiddleware(AuthorizeGuard)
    private async getBaseInformationGroupFromLink(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.headers['userId'])
            const link = req.params.link
            if (link) {
                let data = await this.groupService.getBaseInformationGroupFromLink(link)
                res.status(HttpStatus.OK).json(
                    new ResponseBody(
                        true,
                        "",
                        data
                    )
                )
                return
            }
            next(new BadRequestException("Agurment is invalid"))
        }
        catch (e) {
            if (e instanceof MyException) {
                next(new HttpException(e.status, e.message))
                return
            }
            console.log("🚀 ~ GroupController ~ changeNickname= ~ error:", e)
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
    @GET("/")
    @UseMiddleware(AuthorizeGuard)
    private async getSomeGroup(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("🚀 ~ GroupController ~ getSomeGroup ~ req.query:", req.query)
            let pagingReq = await convertToObjectDTO(PagingReq, req.query, {}, { validationError: { target: false } })
            const userId = Number(req.headers['userId'] as string)
            let data = await this.groupService.getSomeGroup(userId, pagingReq.cursor, pagingReq.limit)
            res.status(HttpStatus.OK).json(new ResponseBody(
                true,
                "OK",
                data
            ))
        } catch (error: any) {
            if (error instanceof MyException) {
                next(new HttpException(error.status, error.message))
            }
            else if (Array.isArray(error)) {
                next(
                    new BadRequestException(JSON.parse(JSON.stringify(error)))
                )
            } else {
                console.log("🚀 ~ GroupController ~ getSomeGroup ~ error:", error)
                next(new InternalServerError("An error occurred, please try again later."))
            }

        }
    }
    @POST('/community-group')
    @UseMiddleware(AuthorizeGuard)
    private async createCommunityGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.headers['userId'] as string)
            const name = String(req.body.name)
            const users: Array<number> = req.body.users
            if (name) {
                let data = await this.groupService.createCommunityGroup(name, userId, users)
                // FIXME: socker ?
                for (let a of users) {
                    this.io.to("").emit("invite-to-group",)
                }
                res.status(HttpStatus.OK).send(new ResponseBody(
                    true,
                    "",
                    data
                ))
                return
            }

        }
        catch (e: any) {
            console.log(e)
            if (e instanceof MyException) {
                next(new HttpException(e.status, e.message))
                return
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }

    }
    //FIXME: change status group to default or stranger
    @POST('/individual-group/:userId')
    @UseMiddleware(AuthorizeGuard)
    private async createInvidualGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.headers['userId'] as string)
            const userIdAddressee = Number(req.params.userId)
            if (userIdAddressee) {
                let data = await this.groupService.createInvidualGroup(userId, userIdAddressee)
                if (!data.isExisted) {
                    this.io.to(getRoomUserIO(userId)).emit(EventGroupIO.CREATE_INDIVIDUAL_GROUP, data)
                }
                res.status(HttpStatus.OK).send(new ResponseBody(
                    true,
                    "",
                    data
                ))
                return
            }

        }
        catch (e: any) {
            if (e instanceof MyException) {
                next(new HttpException(e.status, e.message))
                return
            }
            console.log("🚀 ~ GroupController ~ createInvidualGroup= ~ e:", e)
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
    @PATCH('/:id/avatar')
    @FileUpload(multer().single("avatar"))
    @UseMiddleware(AuthorizeGuard)
    private async changeAvatarGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.headers['userId'] as string)
            const id = Number(req.params.id)
            if (await this.groupService.isUserExistInGroup(userId, Number(id))) {
                let file = req.file;
                if (file && file.mimetype.includes("image")) {
                    let data = await this.groupService.changeAvatarGroup(userId, Number(id), file)
                    this.io.to(getRoomGroupIO(id)).emit(EventGroupIO.CHANGE_AVATAR, { url: data?.url })
                    this.io.to(getRoomGroupIO(id)).emit(EventMessageIO.NEW_MESSAGE, [data?.message])
                    res.status(HttpStatus.OK).json(new ResponseBody(
                        true,
                        "",
                        {}
                    ))
                    return
                }
                else {
                    next(new HttpException(HttpStatus.BAD_REQUEST, "Ảnh không hợp lệ"))
                    return
                }
            } else {
                next(new HttpException(HttpStatus.NOT_ACCEPTABLE, "You don't have permisson for action"))
            }
        } catch (error: any) {
            if (error instanceof MyException) {
                next(new HttpException(error.status, error.message))
                return
            }
            console.log("🚀 ~ GroupController ~ changeAvatarGroup= ~ error:", error)
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }

    //FIXME:  logic
    @GET('/:id/lastview')
    @UseMiddleware(AuthorizeGuard)
    private async getLastViewMember(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.headers['userId'] as string)
            const {
                id
            } = req.params
            if (await this.groupService.isUserExistInGroup(userId, Number(id))) {
                let data: LastViewGroup[] = await this.groupService.getLastViewMember(Number(id))
                res.status(HttpStatus.OK).json(new ResponseBody(
                    true,
                    "OK",
                    data
                ))
                return
            }
        } catch (error: any) {
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
    @GET('/:id/community-group')
    @UseMiddleware(AuthorizeGuard)
    private async getOneGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.headers['userId'] as string)
            const id = req.params.id;
            let data = await this.groupService.getOneGroup(userId, Number(id))
            res.status(HttpStatus.OK).json(new ResponseBody(true, "OK", data))
            return
        } catch (e: any) {
            if (e instanceof MyException) {
                next(new HttpException(e.status, e.message))
                return
            }
            console.log("🚀 ~ GroupController ~ changeNickname= ~ error:", e)
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }

    @GET('/:id/members')
    @UseMiddleware(AuthorizeGuard)
    private async getAllMember(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.headers['userId'] as string)
            const id = Number(req.params.id);
            if (isValidNumberVariable(id)) {
                let data = await this.groupService.getAllMember(userId, Number(id))
                res.status(HttpStatus.OK).json(new ResponseBody(true, "OK", data))
                return
            }
            next(new BadRequestException("Agurment is invalid"))

        } catch (e: any) {
            if (e instanceof MyException) {
                next(new HttpException(e.status, e.message))
                return
            }
            console.log("🚀 ~ GroupController ~ createInvidualGroup= ~ e:", e)
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
    @POST('/:id/invite-members')
    private async inviteMember(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.headers['userId'])
            const groupId = Number(req.params.id)
            const userIds: Array<number> = req.body.userIds
            let message = await this.groupService.inviteMember(userId, groupId, userIds)
            if (message.length > 0) {
                this.io.to(getRoomGroupIO(groupId)).emit(EventMessageIO.NEW_MESSAGE, [message])
                this.io.to(getRoomGroupIO(groupId)).emit(EventMessageIO.UPDATE_MEMBER, [userIds])
                //add noti for user
            }
            res.status(HttpStatus.OK).send(new ResponseBody(true, "OK", {}))
        } catch (error: any) {
            if (error instanceof MyException) {
                next(new HttpException(error.status, error.message))
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
    @POST('/:id/members/leave')
    @UseMiddleware(AuthorizeGuard)
    private async leaveGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.headers['userId'] as string)
            const id = Number(req.params.id)
            if (isValidNumberVariable(userId) && isValidNumberVariable(id)) {
                let message = await this.groupService.leaveGroup(userId, Number(id))
                this.io.to(getRoomGroupIO(id)).emit(EventGroupIO.LEAVE_GROUP, userId);
                this.io.to(getRoomGroupIO(id)).emit(EventMessageIO.NEW_MESSAGE, [message]);
                res.status(HttpStatus.OK).send(new ResponseBody(
                    true,
                    "OK",
                    null
                ))
                return
            }
            next(new BadRequestException("Agurment is invalid"))
        } catch (error: any) {
            if (error instanceof MyException) {
                next(new HttpException(error.status, error.message))
            }
            console.log("🚀 ~ GroupController ~ leaveGroup= ~ error:", error)
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
    @PATCH('/admin/:id/manager')
    @UseMiddleware(AuthorizeGuard)
    private async addManager(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.headers.userId)
            const invitee = Number(req.body.invitee)
            const groupId = Number(req.params.id)
            if (isValidNumberVariable(invitee) && isValidNumberVariable(groupId) && userId !== invitee) {
                //FIXME: socket ?
                let data = await this.groupService.addManager(userId, invitee, groupId)
                this.io.to(getRoomGroupIO(groupId)).emit(EventGroupIO.ADD_MANAGER, { userIds: invitee })
                this.io.to(getRoomGroupIO(groupId)).emit(EventMessageIO.NEW_MESSAGE, [data])
                res.status(HttpStatus.OK).send(
                    new ResponseBody(
                        true,
                        "",
                        {}
                    )
                )
                return
            }
            next(new BadRequestException("Agurment is invalid"))
        } catch (error: any) {
            if (error instanceof MyException) {
                next(new HttpException(error.status, error.message))
                return
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
    @DELETE('/admin/:id/manager')
    @UseMiddleware(AuthorizeGuard)
    private async removeManager(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.headers.userId)
            const manager = Number(req.body.manager)
            const groupId = Number(req.params.id)
            if (isValidNumberVariable(manager) && isValidNumberVariable(groupId) && userId !== manager) {
                let data = await this.groupService.removeManager(userId, manager, groupId)
                this.io.to(getRoomGroupIO(groupId)).emit(EventGroupIO.REMOVE_MANAGER, { userId: manager })
                this.io.to(getRoomGroupIO(groupId)).emit(EventMessageIO.NEW_MESSAGE, [data])
                res.status(HttpStatus.OK).send(
                    new ResponseBody(
                        true,
                        "",
                        {}
                    )
                )
                return
            }
            next(new BadRequestException("Agurment is invalid"))
        } catch (error: any) {
            if (error instanceof MyException) {
                next(new HttpException(error.status, error.message))
                return
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
    @DELETE('/admin/:id/member/:userId')
    @UseMiddleware(AuthorizeGuard)
    private async removeMember(
        req: Request, res: Response, next: NextFunction
    ) {
        try {
            const userId = Number(req.headers.userId)
            const userIdAdd = Number(req.params.userId)
            const groupId = Number(req.params.id)
            if (isValidNumberVariable(userIdAdd) && isValidNumberVariable(groupId) && userId !== userIdAdd) {
                let data = await this.groupService.removeMember(userId, userIdAdd, groupId)
                this.io.to(getRoomGroupIO(groupId)).emit(EventGroupIO.MEMBER_WAS_REMOVE, { userId: userIdAdd })
                this.io.to(getRoomGroupIO(groupId)).emit(EventMessageIO.NEW_MESSAGE, [data])
                res.status(HttpStatus.OK).send(
                    new ResponseBody(
                        true,
                        "",
                        {}
                    )
                )
                return
            }
            next(new BadRequestException("Agurment is invalid"))
        } catch (error: any) {
            if (error instanceof MyException) {
                next(new HttpException(error.status, error.message))
                return
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
    @PATCH('/admin/:id/rename')
    @UseMiddleware(AuthorizeGuard)
    private async renameGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.headers['userId'])
            const name = req.body['name']
            const groupId = Number(req.params.id)
            if (isValidNumberVariable(groupId)) {
                let data = await this.groupService.renameGroup(userId, groupId, name)
                this.io.to(getRoomGroupIO(groupId)).emit(EventGroupIO.RENAME_GROUP, { name: name })
                this.io.to(getRoomGroupIO(groupId)).emit(EventMessageIO.NEW_MESSAGE, [data])
                res.status(HttpStatus.OK).send(
                    new ResponseBody(
                        true,
                        "",
                        {}
                    )
                )
                next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
            }
        }
        catch (error: any) {
            if (error instanceof MyException) {
                next(new HttpException(error.status, error.message))
                return
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }

    }
    @PATCH('/admin/:id/blockmember')
    @UseMiddleware(AuthorizeGuard)
    private async blockMember(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.headers.userId)
            const userIdAdd = Number(req.body.manager)
            const groupId = Number(req.params.id)
            if (userIdAdd && groupId && userId !== userIdAdd) {
                //FIXME: socket ?
                let data = await this.groupService.blockMember(userId, userIdAdd, groupId)
                res.status(HttpStatus.OK).send(
                    new ResponseBody(
                        data,
                        "",
                        {}
                    )
                )
            }
            next(new BadRequestException("Agurment is invalid"))
        } catch (error: any) {
            if (error instanceof MyException) {
                next(new HttpException(error.status, error.message))
                return
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
    @POST("/admin/:id/approval/:userId")
    @UseMiddleware(AuthorizeGuard)
    private async approvalMember(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.headers.userId)
            const userIdAdd = Number(req.params.userId)
            const groupId = Number(req.params.id)
            if (isValidNumberVariable(userIdAdd) && isValidNumberVariable(groupId) && userId !== userIdAdd) {
                let data = await this.groupService.approvalMember(userId, userIdAdd, groupId)
                this.io.to(getRoomGroupIO(groupId)).emit(EventGroupIO.APPROVAL_MEMBER, { userIds: userIdAdd })
                this.io.to(getRoomUserIO(userIdAdd)).emit(EventMessageIO.NEW_MESSAGE, [data])
                //TODO: socket notification to user was approval
                res.status(HttpStatus.OK).send(
                    new ResponseBody(
                        true,
                        "",
                        {}
                    )
                )
                return
            }
            next(new BadRequestException("Agurment is invalid"))
        } catch (e: any) {
            if (e instanceof MyException) {
                next(new HttpException(e.status, e.message))
                return
            }
            console.log("🚀 ~ GroupController ~ approvalMember= ~ e:", e)
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
    @GET('/:groupId/member/:userId/')
    @UseMiddleware(AuthorizeGuard)
    private async getInformationMember(req: Request, res: Response, next: NextFunction) {
        try {
            const myId = Number(req.headers.userId)
            const userIdGet = Number(req.params.userId)
            const groupId = Number(req.params.groupId)
            if (isValidNumberVariable(userIdGet) && isValidNumberVariable(groupId)) {
                let data = await this.groupService.getInformationMember(userIdGet, myId, groupId)
                res.status(HttpStatus.OK).send(
                    new ResponseBody<User>(
                        true,
                        "",
                        data
                    )
                )
                return
            }
            next(new BadRequestException("Agurment is invalid"))
        } catch (error: any) {
            if (error instanceof MyException) {
                next(new HttpException(error.status, error.message))
                return
            }
            console.log("🚀 ~ GroupController ~ getInformationMember= ~ error:", error)
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
    @PATCH('/:id/renickname')
    @UseMiddleware(AuthorizeGuard)
    private async changeNickname(req: Request, res: Response, next: NextFunction) {
        try {
            let nickname = req.body.nickname
            const userId = Number(req.headers.userId)
            const groupId = Number(req.params.id)
            if (nickname && isValidNumberVariable(userId) && isValidNumberVariable(groupId)) {
                let data = await this.groupService.changeNickname(userId, userId, groupId, nickname)
                this.io.to(getRoomGroupIO(groupId)).emit(EventGroupIO.CHANGE_NICKNAME, data)
                res.status(HttpStatus.OK).send(
                    new ResponseBody(
                        true,
                        "",
                        {}
                    )
                )
            }
        }
        catch (e: any) {
            if (e instanceof MyException) {
                next(new HttpException(e.status, e.message))
                return
            }
            console.log("🚀 ~ GroupController ~ changeNickname= ~ error:", e)
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
    // TODO: delete group
    private async deleteGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id)
            const userId = Number(req.headers.userId)
            if (isValidNumberVariable(id)) {
                let data = await this.groupService.deleteGroup(userId, id)
                res.status(HttpStatus.OK).send(
                    new ResponseBody(
                        true,
                        "",
                        {}
                    )
                )
            }
        }
        catch (e: any) {
            if (e instanceof MyException) {
                next(new HttpException(e.status, e.message))
                return
            }
            console.log("🚀 ~ GroupController ~ changeNickname= ~ error:", e)
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
}