import Controller from "@/utils/decorator/decorator";
import HttpException from "@/utils/exceptions/http.exeception";
import { HttpStatus } from "@/utils/exceptions/httpstatus.exception";
import MotherController from "@/utils/interface/controller.interface";
import authHandler from "component/auth.handler";
import { NextFunction, Request, Response } from "express";
import { Server } from "socket.io";
import AdminService from "./admin.service";
import { JwtPayload } from "jsonwebtoken";
import AuthMiddleware from "@/middleware/auth.middleware";
import { AdminServiceBehavior } from "./interface/admin.service.interface";

@Controller("/admin")
export default class AdminController extends MotherController {
    private adminService: AdminServiceBehavior;
    constructor(io: Server) {
        super(io)
        this.adminService = new AdminService()
    }
    initRouter(): MotherController {
        this.router.patch("/admin/group/:id/rename",
            // AuthMiddleware.authAdmin,
            this.renameGroup)
        this.router.delete(
            '/admin/group/:id/manager',
            // AuthMiddleware.authAdmin,
            this.deleteManager
        )
        this.router.post(
            '/admin/group/:id/manager',
            // AuthMiddleware.authAdmin,
            this.addManager
        )
        this.router.delete(
            '/admin/group/:id/member',
            // AuthMiddleware.authAdmin,
            this.deleteMember
        )
        this.router.delete(
            '/admin/group/:id/message',
            // AuthMiddleware.authAdmin,
            this.deleteMessage
        )
        return this;
    }
    private addManager = async (req: Request, res: Response, next: NextFunction) => { //FIXME:
        try {
            const {
                id
            }: any = req.params
            let token = req.headers["token"] as string
            if (token) {
                let accesstoken = token.split(" ")[1]
                if (accesstoken) {
                    const jwtPayload = await authHandler.decodeAccessToken(accesstoken) as JwtPayload;
                    const { iduser } = jwtPayload.payload;
                    if (await this.adminService.isAdminGroup(iduser, id)) {
                        this.adminService.addManager(iduser, id)
                        res.status(HttpStatus.FOUND).send("OKE")
                        return
                    } else
                        next(new HttpException(HttpStatus.NOT_MODIFIED, "Bạn không có quyền"))
                }
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        } catch (error: any) {
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
    private deleteManager = async (req: Request, res: Response, next: NextFunction) => { //FIXME:
        try {
            const {
                id
            }: any = req.params
            let token = req.headers["token"] as string
            if (token) {
                let accesstoken = token.split(" ")[1]
                if (accesstoken) {
                    const jwtPayload = await authHandler.decodeAccessToken(accesstoken) as JwtPayload;
                    const { iduser } = jwtPayload.payload;
                    if (await this.adminService.isAdminGroup(iduser, id)) {
                        this.adminService.deleteManager(iduser, id)
                        res.status(HttpStatus.FOUND).send("OKE")
                        return
                    } else
                        next(new HttpException(HttpStatus.NOT_MODIFIED, "Bạn không có quyền"))
                }
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        } catch (error: any) {
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
    private deleteMember = async ( // FIXME: 
        req: Request, res: Response, next: NextFunction
    ) => {
        try {
            const {
                id
            }: any = req.params
            let token = req.headers["token"] as string
            if (token) {
                let accesstoken = token.split(" ")[1]
                if (accesstoken) {
                    const jwtPayload = await authHandler.decodeAccessToken(accesstoken) as JwtPayload;
                    const { iduser } = jwtPayload.payload;
                    if (await this.adminService.isAdminGroup(iduser, id)) {
                        this.adminService.deleteMember(iduser, id)
                        res.status(HttpStatus.FOUND).send("OKE")
                        return
                    } else
                        next(new HttpException(HttpStatus.NOT_MODIFIED, "Bạn không có quyền"))
                }
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        } catch (error: any) {
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }


    }
    private deleteMessage = async ( // FIXME: 
        req: Request, res: Response, next: NextFunction
    ) => {
    }
    private renameGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name } = req.body
            const { id } = req.params
            let isSuccessfully = await this.adminService.renameGroup(name, Number(id))
            if (isSuccessfully) {
                res.status(HttpStatus.OK).send("OKE")
                return
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
        catch (e: any) {
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }

    }
}