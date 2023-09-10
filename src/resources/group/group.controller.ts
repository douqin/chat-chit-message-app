import HttpException from "@/utils/exceptions/http.exeception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import MotherController from "@/utils/interface/controller.interface";
import authHandler from "../../component/auth.handler";
import { NextFunction, Request, Response } from "express";
import { Server } from "socket.io";
import { JwtPayload } from "jsonwebtoken";
import GroupService from "@/resources/group/group.service";
import Controller from "@/utils/decorator/decorator";
import LastViewGroup from "./dtos/lastview.dto";
import GroupServiceBehavior from "@/resources/group/interface/group.service.interface";
import MyException from "@/utils/exceptions/my.exception";
import multer from "multer";
import { ResponseBody } from "@/utils/definition/http.response";
import AuthMiddleware from "@/middleware/auth.middleware";
@Controller("/group")
export default class GroupController extends MotherController {
    private groupService: GroupServiceBehavior;
    constructor(io: Server) {
        super(io)
        this.groupService = new GroupService()
    }

    initRouter(): MotherController {
        this.router.get('/group',
            AuthMiddleware.auth,
            this.getAllGroup
        )
        this.router.get('/group/:id',
            AuthMiddleware.auth,
            this.getOneGroup
        )
        this.router.post('/group/create',
            multer().none(),
            AuthMiddleware.auth,
            this.createGroup
        )
        this.router.patch("/group/:id/avatar",
            multer().single("avatar"),
            AuthMiddleware.auth,
            this.changeAvatarGroup)
        this.router.post("/group/:id/lastview",
            multer().none(), AuthMiddleware.auth,
            this.getLastViewMember)

        this.router.get("/group/:id/getallmembers", AuthMiddleware.auth, this.getAllMember)
        this.router.post("/group/:id/invitemembers", multer().none(), AuthMiddleware.auth, this.inviteMember)
        this.router.post("/group/:id/members/leave", multer().none(), AuthMiddleware.auth, this.leaveGroup)
        this.router.post("/group/:id/members/join-from-link", multer().none(), AuthMiddleware.auth, this.joinfromLink)

        this.router.patch("/group/admin/:id/rename",
            multer().none(),
            AuthMiddleware.auth,
            // AuthMiddleware.authAdmin,
            this.renameGroup)
        this.router.delete(
            '/group/admin/:id/manager',
            multer().none(),
            AuthMiddleware.auth,
            // AuthMiddleware.authAdmin,
            this.removeManager
        )
        this.router.patch(
            '/group/admin/:id/manager',
            multer().none(),
            AuthMiddleware.auth,
            // AuthMiddleware.authAdmin,
            this.addManager
        )
        this.router.delete(
            '/group/admin/:id/member',
            multer().none(),
            AuthMiddleware.auth,
            // AuthMiddleware.authAdmin,
            this.removeMember
        )
        this.router.post(
            '/group/admin/:id/approval',
            multer().none(),
            AuthMiddleware.auth,
            // AuthMiddleware.authAdmin,
            this.approvalMember
        )
        this.router.patch(
            '/group/admin/:id/blockmember',
            multer().none(),
            AuthMiddleware.auth,
            // AuthMiddleware.authAdmin,
            this.blockMember
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
            next(new HttpException(HttpStatus.BAD_REQUEST, "Tham số không hợp lệ"))
        }
        catch (error) {
            console.log("🚀 ~ file: group.controller.ts:74 ~ GroupController ~ joinfromLink= ~ error:", error)
            if (error instanceof MyException) {
                next(new HttpException(error.statusCode, error.message))
            }
            next(new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
    private getAllGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers['iduser'] as string)
            console.log("🚀 ~ file: group.controller.ts:125 ~ GroupController ~ getAllGroup= ~ iduser:", iduser)
            let data = await this.groupService.getAllGroup(iduser)
            res.status(HttpStatus.OK).json(new ResponseBody(
                true,
                "OK",
                data
            ))
        } catch (error: any) {
            next(new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
    private createGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers['iduser'] as string)
            const { name } = req.body
            const users: Array<number> = []
            if (name) {
                let data = await this.groupService.createGroup(name, iduser, users)
                // TODO: create group with multi user
                res.status(HttpStatus.OK).send(new ResponseBody(
                    true,
                    "",
                    {}
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
                    this.io.to(id).emit("avatar_change", data?.url)
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
                next(new HttpException(HttpStatus.BAD_REQUEST, error.message))
            }
            next(new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Có lỗi xảy ra vui lòng thử lại sau"))
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
    private inviteMember = async (req: Request, res: Response, next: NextFunction) => { // FIXME:
        try {
            const iduser = Number(req.headers['iduser'])
            const idgroup = Number(req.params.id)
            const idusers: Array<any> = []
            let isSuccessfully = await this.groupService.inviteMember(iduser, idgroup, idusers)
            res.status(HttpStatus.OK).send(new ResponseBody(isSuccessfully, "OK", {}))
        } catch (error: any) {
            if (error instanceof MyException) {
                next(new HttpException(HttpStatus.BAD_REQUEST, error.message))
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
    private leaveGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers['iduser'] as string)
            const {
                id
            } = req.params
            if (await this.groupService.isContainInGroup(iduser, Number(id))) {
                let isSuccessfully = await this.groupService.leaveGroup(iduser, Number(id))
                if (isSuccessfully) {
                    this.io.to(id).emit("user_leave_group", iduser);
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
                next(new HttpException(HttpStatus.BAD_REQUEST, error.message))
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
            next(new HttpException(HttpStatus.BAD_REQUEST, "Tham số không hợp lệ"))
        } catch (error: any) {
            if (error instanceof MyException) {
                next(new HttpException(HttpStatus.BAD_REQUEST, error.message))
            }
            next(new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
    private removeManager = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers.iduser)
            const manager = Number(req.body.manager)
            const idgroup = Number(req.params.id)
            if (manager && idgroup && iduser !== manager) {
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
            next(new HttpException(HttpStatus.BAD_REQUEST, "Tham số không hợp lệ"))
        } catch (error: any) {
            if (error instanceof MyException) {
                next(new HttpException(HttpStatus.BAD_REQUEST, error.message))
            }
            next(new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Có lỗi xảy ra vui lòng thử lại sau"))
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
            next(new HttpException(HttpStatus.BAD_REQUEST, "Tham số không hợp lệ"))
        } catch (error: any) {
            console.log("🚀 ~ file: group.controller.ts:339 ~ GroupController ~ error:", error)
            if (error instanceof MyException) {
                next(new HttpException(HttpStatus.BAD_REQUEST, error.message))
            }
            next(new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
    private renameGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers['iduser'])
            const name = req.body['name']
            const idgroup = Number(req.params.id)
            if (idgroup) {
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
                next(new HttpException(HttpStatus.BAD_REQUEST, error.message))
            }
            next(new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Có lỗi xảy ra vui lòng thử lại sau"))
        }

    }
    private blockMember = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers.iduser)
            const iduserAdd = Number(req.body.manager)
            const idgroup = Number(req.params.id)
            if (iduserAdd && idgroup && iduser !== iduserAdd) {
                let data = await this.groupService.blockMember(iduser, iduserAdd, idgroup)
                res.status(HttpStatus.OK).send(
                    new ResponseBody(
                        data,
                        "",
                        {}
                    )
                )
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Tham số không hợp lệ"))
        } catch (error: any) {
            if (error instanceof MyException) {
                next(new HttpException(HttpStatus.BAD_REQUEST, error.message))
            }
            next(new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    } //FIXME: add check OK with POSTMAN
    private approvalMember = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers.iduser)
            const iduserAdd = Number(req.body.member)
            const idgroup = Number(req.params.id)
            if (iduserAdd && idgroup && iduser !== iduserAdd) {
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
            next(new HttpException(HttpStatus.BAD_REQUEST, "Tham số không hợp lệ"))
        } catch (error: any) {
            if (error instanceof MyException) {
                next(new HttpException(HttpStatus.BAD_REQUEST, error.message))
            }
            next(new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
}