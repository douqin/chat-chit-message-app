import HttpException from "@/utils/exceptions/http.exeception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import MotherController from "@/utils/interface/controller.interface";
import { Router, Request, Response, NextFunction } from "express";
import { stringify } from "node:querystring";
import { Server } from "socket.io";
import LogoutMiddleware from "./loguot.validate";

export default class LogoutController extends MotherController {
    initRouter(): MotherController {
        this.router.post(
            '/logout',
            LogoutMiddleware.validate,
            this.logout
        )
        return this
    }
    constructor(io: Server) {
        super(io);

    }
    private logout = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            console.log("aasaa")
            res.status(HttpStatus.NOT_ACCEPTABLE).send(new HttpException(HttpStatus.NOT_ACCEPTABLE, "Bạn chưa đăng nhập vui lòng thử lại"))
        } catch (error: any) {
            console.log("Login Controller" + stringify(error))
            next(new HttpException(HttpStatus.FORBIDDEN, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
}