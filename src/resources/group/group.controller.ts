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
        this.router.get('/group/date/:lasttime',
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
        this.router.post("/group/:id/members/join-from", multer().none(), AuthMiddleware.auth, this.joinfrom)
        return this
    }
    private joinfrom = async (req: Request, res: Response, next: NextFunction) => {
        //TODO:
    }

    private getAllGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers['iduser'] as string)
            let data = await this.groupService.getAllGroup(iduser)
            res.status(HttpStatus.OK).json(new ResponseBody(
                true,
                "OK",
                data
            ))
        } catch (error: any) {
            console.log("🚀 ~ file: group.controller.ts:84 ~ GroupController ~ getAllGroup= ~ error:", error)
            next(new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    };
    private createGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers['iduser'] as string)
            const { name } = req.body
            if (name) {
                let data = await this.groupService.createGroup(name, iduser)
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
            console.info(error)
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
                res.status(HttpStatus.FOUND).json(new ResponseBody(
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
                res.status(HttpStatus.FOUND).json(new ResponseBody(true, "OK", data))
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
    private inviteMember = async (req: Request, res: Response, next: NextFunction) => { // FIXME:
        try {
            const iduser = Number(req.headers['iduser'] as string)
            const {
                id
            } = req.params
            const {
                userIDs
            } = req.body
            let isSuccessfully = await this.groupService.inviteMember(iduser, Number(id), userIDs)
            if (isSuccessfully) {
                res.status(HttpStatus.OK).send(new ResponseBody(true, "OK", {}))
                return
            }
            res.status(HttpStatus.OK).send(new ResponseBody(false, "OK", {}))
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
    
}