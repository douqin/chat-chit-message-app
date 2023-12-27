import HttpException from "@/utils/exceptions/http.exeception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import MotherController from "@/utils/interface/controller.interface";
import { NextFunction, Request, Response } from "express";
import { Server } from "socket.io";
import GroupService from "@/resources/group/group.service";
import Controller from "@/utils/decorator/controller";
import LastViewGroup from "./dtos/lastview.dto";
import iGroupServiceBehavior from "@/resources/group/interface/group.service.interface";
import MyException from "@/utils/exceptions/my.exception";
import multer from "multer";
import { ResponseBody } from "@/utils/definition/http.response";
import AuthMiddleware from "@/middleware/auth.middleware";
import validVariable from "@/utils/extension/vailid_variable";
import { User } from "../../models/user.model";
import { EVENT_GROUP_SOCKET } from "./constant/group.constant";
import { BadRequestException, InternalServerError } from "@/utils/exceptions/badrequest.expception";
import { inject } from "tsyringe";
@Controller("/group")
export default class GroupController extends MotherController {
        constructor(@inject(Server) io: Server, @inject(GroupService) private groupService: GroupService) {
        super(io)
    }

    initRouter(): MotherController {
        this.router.get('',
            AuthMiddleware.auth,
            this.getSomeGroup
        )
        this.router.get('/:id',
            AuthMiddleware.auth,
            this.getOneGroup
        )
        this.router.post('/create',
            multer().none(),
            AuthMiddleware.auth,
            this.createGroup
        )
        this.router.patch("/:id/avatar",
            multer().single("avatar"),
            AuthMiddleware.auth,
            this.changeAvatarGroup)
        this.router.post("/:id/lastview",
            multer().none(), AuthMiddleware.auth,
            this.getLastViewMember)
        this.router.get("/:id/getallmembers", AuthMiddleware.auth, this.getAllMember)
        this.router.post("/:id/invitemembers", multer().none(), AuthMiddleware.auth, this.inviteMember)
        this.router.post("/:id/members/leave", multer().none(), AuthMiddleware.auth, this.leaveGroup)
        this.router.post("/:id/members/join-from-link", multer().none(), AuthMiddleware.auth, this.joinfromLink)

        this.router.patch("/admin/:id/rename",
            multer().none(),
            AuthMiddleware.auth,
            // AuthMiddleware.authAdmin,
            this.renameGroup)
        this.router.delete(
            '/admin/:id/manager',
            multer().none(),
            AuthMiddleware.auth,
            // AuthMiddleware.authAdmin,
            this.removeManager
        )
        this.router.patch(
            '/admin/:id/manager',
            multer().none(),
            AuthMiddleware.auth,
            // AuthMiddleware.authAdmin,
            this.addManager
        )
        this.router.delete(
            '/admin/:id/member',
            multer().none(),
            AuthMiddleware.auth,
            // AuthMiddleware.authAdmin,
            this.removeMember
        )
        this.router.post(
            '/admin/:id/approval',
            multer().none(),
            AuthMiddleware.auth,
            // AuthMiddleware.authAdmin,
            this.approvalMember
        )
        this.router.patch(
            '/admin/:id/blockmember',
            multer().none(),
            AuthMiddleware.auth,
            // AuthMiddleware.authAdmin,
            this.blockMember
        )
        this.router.get(
            '/:idgroup/member/:idmember/infor',
            AuthMiddleware.auth,
            this.getInformationMember
        )
        return this
    }
    private joinfromLink = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers['iduser'])
            const idgroup = Number(req.params.id)
            if (idgroup) {
                let data = await this.groupService.joinfromLink(iduser, idgroup)
                res.status(HttpStatus.OK).json(
                    new ResponseBody(
                        true,
                        "",
                        {}
                    )
                )
                return
            }
            next(new BadRequestException("Agurment is invalid"))
        }
        catch (error) {
            console.log("🚀 ~ file: group.controller.ts:74 ~ GroupController ~ joinfromLink= ~ error:", error)
            if (error instanceof MyException) {
                next(new HttpException(error.status, error.message))
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
    // ?cursor&limit
    private getSomeGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit = Number(req.query.limit)
            const cursor = Number(req.query.cursor as string)
            const iduser = Number(req.headers['iduser'] as string)
            if (validVariable(limit) && validVariable(cursor)) {
                let data = await this.groupService.getSomeGroup(iduser, cursor, limit)
                res.status(HttpStatus.OK).json(new ResponseBody(
                    true,
                    "OK",
                    data
                ))
            } else next(new HttpException(HttpStatus.BAD_REQUEST, "Argument's wrong")) 
        } catch (error: any) {
            console.log("🚀 ~ file: group.controller.ts:130 ~ GroupController ~ getSomeGroup= ~ error:", error)
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
    private createGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers['iduser'] as string)
            const name = String(req.body.name)
            const users: Array<number> = req.body.users
            if (name) {
                let data = await this.groupService.createGroup(name, iduser, users)
                // FIXME: socker ?
                for(let a of users){
                    this.io.to("").emit("invite-to-group", )
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
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }

    }
    private changeAvatarGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers['iduser'] as string)
            const {
                id
            } = req.params
            if (await this.groupService.isContainInGroup(iduser, Number(id))) {
                let file = req.file;
                if (file && file.mimetype.includes("image")) {
                    let data = await this.groupService.changeAvatarGroup(iduser, Number(id), file)
                    this.io.to(id).emit(EVENT_GROUP_SOCKET.CHANGE_AVATAR, data?.url)
                    res.status(HttpStatus.OK).json(new ResponseBody(
                        true,
                        "",
                        data?.url
                    ))
                    return
                }
                else {
                    next(new HttpException(HttpStatus.BAD_REQUEST, "Ảnh không hợp lệ"))
                    return
                }
            } else {
                next(new HttpException(HttpStatus.NOT_ACCEPTABLE, "Bạn không có quyền thực hiện hành động này"))
                return
            }
        } catch (error: any) {
            if (error instanceof MyException) {
                next(new HttpException(error.status, error.message))
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
    private getLastViewMember = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers['iduser'] as string)
            const {
                id
            } = req.params
            if (await this.groupService.isContainInGroup(iduser, Number(id))) {
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
    private getOneGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers['iduser'] as string)
            const { id } = req.params;
            if (await this.groupService.isContainInGroup(iduser, Number(id))) {
                let data = await this.groupService.getOneGroup(Number(id))
                res.status(HttpStatus.OK).json(new ResponseBody(true, "OK", data))
                return
            }
            else {
                next(new HttpException(HttpStatus.FORBIDDEN, "Bạn không có quyền thực hiện hành động này"))
                return
            }
        } catch (error: any) {
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
    private getAllMember = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers['iduser'] as string)
            const { id } = req.params;
            if (await this.groupService.isContainInGroup(iduser, Number(id))) {
                let data = await this.groupService.getAllMember(Number(id))
                res.status(HttpStatus.OK).json(new ResponseBody(true, "OK", data))
                return
            }
            else {
                next(new HttpException(HttpStatus.FORBIDDEN, "Bạn không có quyền thực hiện hành động này"))
                return
            }

        } catch (error: any) {
            console.log("🚀 ~ file: group.controller.ts:239 ~ GroupController ~ getAllMember= ~ error:", error)
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
    private inviteMember = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers['iduser'])
            const idgroup = Number(req.params.id)
            const idusers: Array<any> = []
            let isSuccessfully = await this.groupService.inviteMember(iduser, idgroup, idusers)
            res.status(HttpStatus.OK).send(new ResponseBody(isSuccessfully, "OK", {}))
        } catch (error: any) {
            if (error instanceof MyException) {
                next(new HttpException(error.status, error.message))
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    } //FIXME: socket ? 
    private leaveGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers['iduser'] as string)
            const {
                id
            } = req.params
            if (await this.groupService.isContainInGroup(iduser, Number(id))) {
                let isSuccessfully = await this.groupService.leaveGroup(iduser, Number(id))
                if (isSuccessfully) {
                    this.io.to(id).emit(EVENT_GROUP_SOCKET.LEAVE_GROUP, iduser);
                    res.status(HttpStatus.OK).send(new ResponseBody(
                        true,
                        "OK",
                        null
                    ))
                }
                return
            }
        } catch (error: any) {
            console.log("🚀 ~ file: group.controller.ts:333 ~ GroupController ~ leaveGroup= ~ error:", error)
            if (error instanceof MyException) {
                next(new HttpException(error.status, error.message))
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
    private addManager = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers.iduser)
            const invitee = Number(req.body.invitee)
            const idgroup = Number(req.params.id)
            if (invitee && idgroup && iduser !== invitee) {
                //FIXME: socket ?
                let data = await this.groupService.addManager(iduser, invitee, idgroup)
                res.status(HttpStatus.OK).send(
                    new ResponseBody(
                        data,
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
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
    private removeManager = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers.iduser)
            const manager = Number(req.body.manager)
            const idgroup = Number(req.params.id)
            if (manager && idgroup && iduser !== manager) {
                 //FIXME: socket ?
                let data = await this.groupService.removeManager(iduser, manager, idgroup)
                res.status(HttpStatus.OK).send(
                    new ResponseBody(
                        data,
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
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
    private removeMember = async (
        req: Request, res: Response, next: NextFunction
    ) => {
        try {
            const iduser = Number(req.headers.iduser)
            const iduserAdd = Number(req.body.member)
            const idgroup = Number(req.params.id)
            if (iduserAdd && idgroup && iduser !== iduserAdd) {
                 //FIXME: socket ?
                let data = await this.groupService.removeMember(iduser, iduserAdd, idgroup)
                res.status(HttpStatus.OK).send(
                    new ResponseBody(
                        data,
                        "",
                        {}
                    )
                )
                return
            }
            next(new BadRequestException("Agurment is invalid"))
        } catch (error: any) {
            console.log("🚀 ~ file: group.controller.ts:339 ~ GroupController ~ error:", error)
            if (error instanceof MyException) {
                next(new HttpException(error.status, error.message))
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
    private renameGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers['iduser'])
            const name = req.body['name']
            const idgroup = Number(req.params.id)
            if (idgroup) {
                 //FIXME: socket ?
                let isOK = await this.groupService.renameGroup(iduser, idgroup, name)
                res.status(HttpStatus.OK).send(
                    new ResponseBody(
                        isOK,
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
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }

    } //FIXME: socker ?
    private blockMember = async (req: Request, res: Response, next: NextFunction) => {
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
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }
    } //FIXME: add check OK with POSTMAN
    private approvalMember = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers.iduser)
            const iduserAdd = Number(req.body.member)
            const idgroup = Number(req.params.id)
            if (iduserAdd && idgroup && iduser !== iduserAdd) {
                 //FIXME: socket ?
                let data = await this.groupService.approvalMember(iduser, iduserAdd, idgroup)
                res.status(HttpStatus.OK).send(
                    new ResponseBody(
                        data,
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
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
    private getInformationMember = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers.iduser)
            const idmember = Number(req.params.idmember)
            const idgroup = Number(req.params.idgroup)
            if (validVariable(idmember) && validVariable(idgroup)) {
                let data = await this.groupService.getInformationMember(iduser, idmember, idgroup)
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
            console.log("🚀 ~ file: group.controller.ts:456 ~ GroupController ~ getInformationMember= ~ error:", error)
            if (error instanceof MyException) {
                next(new HttpException(error.status, error.message))
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
}