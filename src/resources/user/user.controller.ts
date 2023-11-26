import MotherController from "@/utils/interface/controller.interface";
import UserService from "./user.service";
import { Server } from "socket.io";
import { NextFunction, Request, Response } from "express";
import { UserServiceBehavior } from "./interface/user.service.interface";
import { ResponseBody } from "@/utils/definition/http.response";
import HttpException from "@/utils/exceptions/http.exeception";
import MyException from "@/utils/exceptions/my.exception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";

export default class UserController extends MotherController {
    private userSerivce: UserServiceBehavior
    constructor(io: Server) {
        super(io)
        this.userSerivce = new UserService()
    }
    initRouter(): MotherController {
        this.router.get("/user/searchuser", this.searchUser)
        this.router.get("/user/:username", this.inforUser)
        return this
    }
    private searchUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let phone = String(req.query.phone)
            if (phone) {
                res.status(HttpStatus.OK).send(
                    new ResponseBody(
                        true,
                        "",
                        await this.userSerivce.searchUser(phone)
                    )
                )
                return
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Tham số không hợp lệ"))
        } catch (error: any) {
            console.log("🚀 ~ file: user.controller.ts:37 ~ UserController ~ searchUser= ~ error:", error)
            if (error instanceof MyException) {
                next(new HttpException(HttpStatus.BAD_REQUEST, error.message))
            }
            next(new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }

    private inforUser = (req: Request, res: Response, next: NextFunction) => {
        try {
            let username = Number(req.params.username)
            
            next(new HttpException(HttpStatus.BAD_REQUEST, "Tham số không hợp lệ"))
        } catch (error: any) {
            if (error instanceof MyException) {
                next(new HttpException(HttpStatus.BAD_REQUEST, error.message))
            }
            next(new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
}