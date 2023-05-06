import HttpException from "@/utils/exceptions/http.exeception";
import { HttpStatus } from "@/utils/exceptions/httpstatus.exception";
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

@Controller("/group")
export default class GroupController extends MotherController {
    private groupService: GroupServiceBehavior;
    constructor(io: Server) {
        super(io)
        this.groupService = new GroupService()
    }

    initRouter(): MotherController {
        this.router.get('/group',
            // AuthMiddleware.auth,
            this.getAllGroup
        )
        this.router.get('/group/:id',
            // AuthMiddleware.auth,
            this.getOneGroup
        )
        this.router.post('/group/create',
            // AuthMiddleware.auth,
            this.createGroup
        )
        this.router.patch("/group/:id/avatar",
            // AuthMiddleware.auth,
            this.changeAvatarGroup)
        this.router.post("/group/:id/lastview",
            // AuthMiddleware.auth,
            this.getLastViewMember)
        // this.router.patch("/group/:id/notify/:isnotify",
        //     // AuthMiddleware.auth,
        //     this.turnOffOrOn)
        this.router.get("/group/:id/getallmembers", this.getAllMember)
        this.router.post("/group/:id/invitemembers", this.inviteMember)
        this.router.post("/group/:id/members/leave", this.leaveGroup)
        // this.router.post("/group/:id/members/join-from", this.joinfrom)
        return this
    }

    private getAllGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let token = req.headers["token"] as string
            if (token) {
                let accesstoken = token.split(" ")[1]
                if (accesstoken) {
                    const jwtPayload = await authHandler.decodeAccessToken(accesstoken) as JwtPayload;
                    const { iduser } = jwtPayload.payload;
                    let data = await this.groupService.getAllGroup(iduser)
                    res.status(HttpStatus.FOUND).send(data)
                    return
                }
                else {
                    next(new HttpException(HttpStatus.NOT_ACCEPTABLE, "Token không hợp lệ"))
                }
            } else {
                next(new HttpException(HttpStatus.NOT_ACCEPTABLE, "Token không hợp lệ"))
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau "))
        } catch (error: any) {
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    };
    private createGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let token = req.headers["token"] as string
            if (token) {
                let accesstoken = token.split(" ")[1]
                if (accesstoken) {
                    const jwtPayload = await authHandler.decodeAccessToken(accesstoken) as JwtPayload;
                    const { iduser } = jwtPayload.payload;
                    const { name, type } = req.body
                    if (name) {
                        await this.groupService.createGroup(name, iduser)
                        res.status(HttpStatus.FOUND).send("OKE")
                        return
                    }
                }
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
        catch (e: any) {
            console.log(e)
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }

    }
    private changeAvatarGroup = async (req: Request, res: Response, next: NextFunction) => {      // FIXME :
        try {
            let token = req.headers["token"] as string
            if (token) {
                let accesstoken = token.split(" ")[1]
                if (accesstoken) {

                }
            }
            next(new HttpException(HttpStatus.NOT_ACCEPTABLE, "Bạn không có quyền"))
        }
        catch (e: any) {
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
    private getLastViewMember = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let token = req.headers["token"] as string
            if (token) {
                let accesstoken = token.split(" ")[1]
                if (accesstoken) {
                    const jwtPayload = await authHandler.decodeAccessToken(accesstoken) as JwtPayload;
                    const { iduser } = jwtPayload.payload;
                    let data: LastViewGroup[] = await this.groupService.getLastViewMember(iduser)
                    res.status(HttpStatus.FOUND).send(data)
                    return
                }
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        } catch (error: any) {
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
    private getOneGroup = async (req: Request, res: Response, next: NextFunction) => { //FIXME:
        try {
            let token = req.headers["token"] as string
            if (token) {
                let accesstoken = token.split(" ")[1]
                if (accesstoken) {

                }
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
        catch (e: any) {
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
    private getAllMember = async (req: Request, res: Response, next: NextFunction) => { //FIXME:
        try {
            let token = req.headers["token"] as string
            if (token) {
                let accesstoken = token.split(" ")[1]
                if (accesstoken) {

                }
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
        catch (e: any) {
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
        // FIXME:
    }
    private inviteMember = async (req: Request, res: Response, next: NextFunction) => { // FIXME:
        try {
            let token = req.headers["token"] as string
            if (token) {
                let accesstoken = token.split(" ")[1]
                if (accesstoken) {
                    const jwtPayload = await authHandler.decodeAccessToken(accesstoken) as JwtPayload;
                    const { iduser } = jwtPayload.payload;
                    const {
                        id
                    } = req.params
                    const {
                        userIDs
                    } = req.body
                    let isSuccessfully = await this.groupService.inviteMember(iduser, Number(id), userIDs)
                    if (isSuccessfully) {
                        res.status(HttpStatus.OK).send("OKE")
                        //FIXME : send data to socket
                    }
                    return
                }
                else {
                    next(new HttpException(HttpStatus.NOT_ACCEPTABLE, "Token không hợp lệ"))
                    return
                }
            } else {
                next(new HttpException(HttpStatus.NOT_ACCEPTABLE, "Token không hợp lệ"))
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau "))
        } catch (error: any) {
            if (error instanceof MyException) {
                next(new HttpException(HttpStatus.BAD_REQUEST, error.message))
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
    private leaveGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let token = req.headers["token"] as string
            if (token) {
                let accesstoken = token.split(" ")[1]
                if (accesstoken) {
                    const jwtPayload = await authHandler.decodeAccessToken(accesstoken) as JwtPayload;
                    const { iduser } = jwtPayload.payload;
                    const {
                        id
                    } = req.params
                    let isSuccessfully = await this.groupService.leaveGroup(iduser, Number(id))
                    if (isSuccessfully) {
                        res.status(HttpStatus.OK).send("OKE")
                        //FIXME : send data to socket
                    }
                    return
                }
                else {
                    next(new HttpException(HttpStatus.NOT_ACCEPTABLE, "Token không hợp lệ"))
                    return
                }
            } else {
                next(new HttpException(HttpStatus.NOT_ACCEPTABLE, "Token không hợp lệ"))
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau "))
        } catch (error: any) {
            if (error instanceof MyException) {
                if (error.statusCode == 1) {
                    next(new HttpException(HttpStatus.BAD_REQUEST, error.message))
                }
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
}