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
        this.router.get('/group/:lasttime',
            // AuthMiddleware.auth,
            this.getAllGroup
        )
        this.router.get('/group/:id',
            // AuthMiddleware.auth,
            this.getOneGroup
        )
        this.router.post('/group/create',
            multer().none(),
            // AuthMiddleware.auth,
            this.createGroup
        )
        this.router.patch("/group/:id/avatar",
            multer().single("avatar"),
            // AuthMiddleware.auth,
            this.changeAvatarGroup)
        this.router.post("/group/:id/lastview",
            multer().none(),
            // AuthMiddleware.auth,
            this.getLastViewMember)
        // this.router.patch("/group/:id/notify/:isnotify",
        //     // AuthMiddleware.auth,
        //     this.turnOffOrOn)
        this.router.get("/group/:id/getallmembers", this.getAllMember)
        this.router.post("/group/:id/invitemembers", multer().none(), this.inviteMember)
        this.router.post("/group/:id/members/leave", multer().none(), this.leaveGroup)
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
                    res.status(HttpStatus.OK).json(new ResponseBody(
                        true,
                        "OK",
                        data
                    ))
                    return
                }
                else {
                    next(new HttpException(HttpStatus.NOT_ACCEPTABLE, "Token không hợp lệ"))
                    return
                }
            } else {
                next(new HttpException(HttpStatus.NOT_ACCEPTABLE, "Token không ton tai"))
                return
            }
        } catch (error: any) {
            //FIXME: 
            console.log("🚀 ~ file: group.controller.ts:84 ~ GroupController ~ getAllGroup= ~ error:", error)
            if (error instanceof Object) {
                if (error.name.includes("JsonWebTokenError")) {
                    console.log(error)
                    next(new HttpException(HttpStatus.BAD_REQUEST, "Token không hợp lệ"))
                    return
                }
            }
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
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Token không hợp lệ"))
        }
        catch (e: any) {
            console.log(e)
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }

    }
    private changeAvatarGroup = async (req: Request, res: Response, next: NextFunction) => {
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
                    if (await this.groupService.isContainInGroup(iduser, Number(id))) {
                        let file = req.file;
                        if (file && file.mimetype.startsWith("image/")) {
                            let data = await this.groupService.changeAvatarGroup(iduser, Number(id), file,)
                            this.io.to(id).emit("avatar_change", data)
                            res.status(HttpStatus.OK).json(new ResponseBody(
                                true,
                                "",
                                data
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
                } else {
                    next(new HttpException(HttpStatus.NOT_ACCEPTABLE, "Token không hợp lệ"))
                    return
                }
            } else {
                next(new HttpException(HttpStatus.NOT_ACCEPTABLE, "Token không hợp lệ"))
            }
        } catch (error: any) {
            if (error instanceof MyException) {
                next(new HttpException(HttpStatus.BAD_REQUEST, error.message))
            }
            console.info(error)
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
                    else {
                        next(new HttpException(HttpStatus.NOT_ACCEPTABLE, "Bạn không có quyền thực hiện hành động này"))
                        return
                    }
                }
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        } catch (error: any) {
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
    private getOneGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let token = req.headers["token"] as string
            if (token) {
                let accesstoken = token.split(" ")[1]
                if (accesstoken) {
                    const jwtPayload = await authHandler.decodeAccessToken(accesstoken) as JwtPayload;
                    const { iduser } = jwtPayload.payload;
                    const { id } = req.params;
                    if (await this.groupService.isContainInGroup(iduser, Number(id))) {
                        let data = await this.groupService.getOneGroup(Number(id))
                        res.status(HttpStatus.FOUND).json(new ResponseBody(true, "OK", data))
                        return
                    }
                    else {
                        next(new HttpException(HttpStatus.NOT_ACCEPTABLE, "Bạn không có quyền thực hiện hành động này"))
                        return
                    }

                }
                else {
                    next(new HttpException(HttpStatus.NOT_ACCEPTABLE, "Token không hợp lệ"))
                }
            } else {
                next(new HttpException(HttpStatus.NOT_ACCEPTABLE, "Token không hợp lệ"))
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Token khong ton tai"))
        } catch (error: any) {
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
    private getAllMember = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let token = req.headers["token"] as string
            if (token) {
                let accesstoken = token.split(" ")[1]
                if (accesstoken) {
                    const jwtPayload = await authHandler.decodeAccessToken(accesstoken) as JwtPayload;
                    const { iduser } = jwtPayload.payload;
                    const { id } = req.params;
                    if (await this.groupService.isContainInGroup(iduser, Number(id))) {
                        let data = await this.groupService.getAllMember(Number(id))
                        res.status(HttpStatus.FOUND).json(new ResponseBody(true, "OK", data))
                        return
                    }
                    else {
                        next(new HttpException(HttpStatus.NOT_ACCEPTABLE, "Bạn không có quyền thực hiện hành động này"))
                        return
                    }
                }
                else {
                    next(new HttpException(HttpStatus.NOT_ACCEPTABLE, "Token không hợp lệ"))
                }
            } else {
                next(new HttpException(HttpStatus.NOT_ACCEPTABLE, "Token không hợp lệ"))
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Token khong ton tai"))
        } catch (error: any) {
            console.info(error);
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
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

                        res.status(HttpStatus.OK).send(new ResponseBody(true, "OK", true))
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
                    else {
                        next(new HttpException(HttpStatus.NOT_ACCEPTABLE, "Bạn không có quyền thực hiện hành động này"))
                        return
                    }
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
}