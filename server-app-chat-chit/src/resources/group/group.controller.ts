import HttpException from "@/utils/exceptions/http.exeception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import { MotherController } from "@/lib/base";
import { NextFunction, Request, Response } from "express";
import { Server } from "socket.io";
import GroupService from "@/resources/group/group.service";
import LastViewGroup from "./dtos/lastview.dto";
import iGroupServiceBehavior from "@/resources/group/interface/group.service.interface";
import MyException from "@/utils/exceptions/my.exception";
import multer from "multer";
import { ResponseBody } from "@/utils/definition/http.response";
import { AuthorizeMiddleware } from "@/middleware/auth.middleware";
import isValidNumberVariable from "@/utils/extension/vailid_variable";
import { User } from "../../models/user.model";
import { EventGroupIO } from "./constant/group.constant";
import { BadRequestException, InternalServerError } from "@/utils/exceptions/badrequest.expception";
import { inject } from "tsyringe";
import { getRoomUserIO } from "@/utils/extension/room.user";
import { getRoomGroupIO } from "@/utils/extension/room.group";
import { EventMessageIO } from "../messaging/constant/event.io";
import { Controller, DELETE, FileUpload, GET, PATCH, POST , UseMiddleware} from "@/lib/decorator";
@Controller("/group")
export default class GroupController extends MotherController {
    constructor(@inject(Server) io: Server, @inject(GroupService) private groupService: GroupService) {
        super(io)
    }

    @POST('/:id/admin/pending')
    @UseMiddleware(AuthorizeMiddleware)
    private async getListUserPending(req: Request, res: Response, next: NextFunction) {
        try {
            const idgroup = Number(req.params.id)
            const iduser = Number(req.headers['iduser'])
            if (isValidNumberVariable(idgroup)) {
                let data = await this.groupService.getListUserPending(iduser, idgroup)
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
    @UseMiddleware(AuthorizeMiddleware)
    private async requestJoinFromLink(req: Request, res: Response, next: NextFunction) {
        try {
            const iduser = Number(req.headers['iduser'])
            const link = String(req.params.link)
            if (link) {
                let data = await this.groupService.requestJoinFromLink(iduser, link)
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
    @UseMiddleware(AuthorizeMiddleware)
    private async getBaseInformationGroupFromLink(req: Request, res: Response, next: NextFunction) {
        try {
            const iduser = Number(req.headers['iduser'])
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
    @UseMiddleware(AuthorizeMiddleware)
    private async getSomeGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const limit = Number(req.query.limit)
            const cursor = Number(req.query.cursor as string)
            const iduser = Number(req.headers['iduser'] as string)
            if (isValidNumberVariable(limit) && isValidNumberVariable(cursor)) {
                let data = await this.groupService.getSomeGroup(iduser, cursor, limit)
                res.status(HttpStatus.OK).json(new ResponseBody(
                    true,
                    "OK",
                    data
                ))
            } else next(new HttpException(HttpStatus.BAD_REQUEST, "Argument's wrong"))
        } catch (error: any) {
            if (error instanceof MyException) {
                next(new HttpException(error.status, error.message))
                return
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
    @POST('/community-group')
    @UseMiddleware(AuthorizeMiddleware)
    private async createCommunityGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const iduser = Number(req.headers['iduser'] as string)
            const name = String(req.body.name)
            const users: Array<number> = req.body.users
            if (name) {
                let data = await this.groupService.createCommunityGroup(name, iduser, users)
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
    @UseMiddleware(AuthorizeMiddleware)
    private async createInvidualGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const iduser = Number(req.headers['iduser'] as string)
            const idUserAddressee = Number(req.params.userId)
            if (idUserAddressee) {
                let data = await this.groupService.createInvidualGroup(iduser, idUserAddressee)
                if (!data.isExisted) {
                    this.io.to(getRoomUserIO(iduser)).emit(EventGroupIO.CREATE_INDIVIDUAL_GROUP, data)
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
    @UseMiddleware(AuthorizeMiddleware)
    private async changeAvatarGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const iduser = Number(req.headers['iduser'] as string)
            const id = Number(req.params.id)
            if (await this.groupService.isUserExistInGroup(iduser, Number(id))) {
                let file = req.file;
                if (file && file.mimetype.includes("image")) {
                    let data = await this.groupService.changeAvatarGroup(iduser, Number(id), file)
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
    @UseMiddleware(AuthorizeMiddleware)
    private async getLastViewMember(req: Request, res: Response, next: NextFunction) {
        try {
            const iduser = Number(req.headers['iduser'] as string)
            const {
                id
            } = req.params
            if (await this.groupService.isUserExistInGroup(iduser, Number(id))) {
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
    @UseMiddleware(AuthorizeMiddleware)
    private async getOneGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const iduser = Number(req.headers['iduser'] as string)
            const id = req.params.id;
            let data = await this.groupService.getOneGroup(iduser, Number(id))
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
    @UseMiddleware(AuthorizeMiddleware)
    private async getAllMember(req: Request, res: Response, next: NextFunction) {
        try {
            const iduser = Number(req.headers['iduser'] as string)
            const id = Number(req.params.id);
            if (isValidNumberVariable(id)) {
                let data = await this.groupService.getAllMember(iduser, Number(id))
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
            const iduser = Number(req.headers['iduser'])
            const idgroup = Number(req.params.id)
            const idusers: Array<number> = req.body.userIds
            let message = await this.groupService.inviteMember(iduser, idgroup, idusers)
            if (message.length > 0) {
                this.io.to(getRoomGroupIO(idgroup)).emit(EventMessageIO.NEW_MESSAGE, [message])
                this.io.to(getRoomGroupIO(idgroup)).emit(EventMessageIO.UPDATE_MEMBER, [idusers])
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
    @UseMiddleware(AuthorizeMiddleware)
    private async leaveGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const iduser = Number(req.headers['iduser'] as string)
            const id = Number(req.params.id)
            if (isValidNumberVariable(iduser) && isValidNumberVariable(id)) {
                let message = await this.groupService.leaveGroup(iduser, Number(id))
                this.io.to(getRoomGroupIO(id)).emit(EventGroupIO.LEAVE_GROUP, iduser);
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
    @UseMiddleware(AuthorizeMiddleware)
    private async addManager(req: Request, res: Response, next: NextFunction) {
        try {
            const iduser = Number(req.headers.iduser)
            const invitee = Number(req.body.invitee)
            const idgroup = Number(req.params.id)
            if (isValidNumberVariable(invitee) && isValidNumberVariable(idgroup) && iduser !== invitee) {
                //FIXME: socket ?
                let data = await this.groupService.addManager(iduser, invitee, idgroup)
                this.io.to(getRoomGroupIO(idgroup)).emit(EventGroupIO.ADD_MANAGER, { userIds: invitee })
                this.io.to(getRoomGroupIO(idgroup)).emit(EventMessageIO.NEW_MESSAGE, [data])
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
    @UseMiddleware(AuthorizeMiddleware)
    private async removeManager(req: Request, res: Response, next: NextFunction) {
        try {
            const iduser = Number(req.headers.iduser)
            const manager = Number(req.body.manager)
            const idgroup = Number(req.params.id)
            if (isValidNumberVariable(manager) && isValidNumberVariable(idgroup) && iduser !== manager) {
                let data = await this.groupService.removeManager(iduser, manager, idgroup)
                this.io.to(getRoomGroupIO(idgroup)).emit(EventGroupIO.REMOVE_MANAGER, { userId: manager })
                this.io.to(getRoomGroupIO(idgroup)).emit(EventMessageIO.NEW_MESSAGE, [data])
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
    @UseMiddleware(AuthorizeMiddleware)
    private async removeMember(
        req: Request, res: Response, next: NextFunction
    ) {
        try {
            const iduser = Number(req.headers.iduser)
            const iduserAdd = Number(req.params.userId)
            const idgroup = Number(req.params.id)
            if (isValidNumberVariable(iduserAdd) && isValidNumberVariable(idgroup) && iduser !== iduserAdd) {
                let data = await this.groupService.removeMember(iduser, iduserAdd, idgroup)
                this.io.to(getRoomGroupIO(idgroup)).emit(EventGroupIO.MEMBER_WAS_REMOVE, { userId: iduserAdd })
                this.io.to(getRoomGroupIO(idgroup)).emit(EventMessageIO.NEW_MESSAGE, [data])
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
    @UseMiddleware(AuthorizeMiddleware)
    private async renameGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const iduser = Number(req.headers['iduser'])
            const name = req.body['name']
            const idgroup = Number(req.params.id)
            if (isValidNumberVariable(idgroup)) {
                let data = await this.groupService.renameGroup(iduser, idgroup, name)
                this.io.to(getRoomGroupIO(idgroup)).emit(EventGroupIO.RENAME_GROUP, { name: name })
                this.io.to(getRoomGroupIO(idgroup)).emit(EventMessageIO.NEW_MESSAGE, [data])
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
    @UseMiddleware(AuthorizeMiddleware)
    private async blockMember(req: Request, res: Response, next: NextFunction) {
        try {
            const iduser = Number(req.headers.iduser)
            const iduserAdd = Number(req.body.manager)
            const idgroup = Number(req.params.id)
            if (iduserAdd && idgroup && iduser !== iduserAdd) {
                //FIXME: socket ?
                let data = await this.groupService.blockMember(iduser, iduserAdd, idgroup)
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
    @UseMiddleware(AuthorizeMiddleware)
    private async approvalMember(req: Request, res: Response, next: NextFunction) {
        try {
            const iduser = Number(req.headers.iduser)
            const iduserAdd = Number(req.params.userId)
            const idgroup = Number(req.params.id)
            if (isValidNumberVariable(iduserAdd) && isValidNumberVariable(idgroup) && iduser !== iduserAdd) {
                let data = await this.groupService.approvalMember(iduser, iduserAdd, idgroup)
                this.io.to(getRoomGroupIO(idgroup)).emit(EventGroupIO.APPROVAL_MEMBER, { userIds: iduserAdd })
                this.io.to(getRoomUserIO(iduserAdd)).emit(EventMessageIO.NEW_MESSAGE, [data])
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
    @GET('/:idgroup/member/:userId/')
    @UseMiddleware(AuthorizeMiddleware)
    private async getInformationMember(req: Request, res: Response, next: NextFunction) {
        try {
            const iduser = Number(req.headers.iduser)
            const userId = Number(req.params.userId)
            const idgroup = Number(req.params.idgroup)
            if (isValidNumberVariable(userId) && isValidNumberVariable(idgroup)) {
                let data = await this.groupService.getInformationMember(iduser, userId, idgroup)
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
    @UseMiddleware(AuthorizeMiddleware)
    private async changeNickname(req: Request, res: Response, next: NextFunction) {
        try {
            let nickname = req.body.nickname
            const iduser = Number(req.headers.iduser)
            const idgroup = Number(req.params.id)
            if (nickname && isValidNumberVariable(iduser) && isValidNumberVariable(idgroup)) {
                let data = await this.groupService.changeNickname(iduser, iduser, idgroup, nickname)
                this.io.to(getRoomGroupIO(idgroup)).emit(EventGroupIO.CHANGE_NICKNAME, data)
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
            const iduser = Number(req.headers.iduser)
            if (isValidNumberVariable(id)) {
                let data = await this.groupService.deleteGroup(iduser, id)
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