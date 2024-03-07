import { MotherController } from "@/lib/common";

import UserService from "./user.service";
import { Server } from "socket.io";
import { NextFunction, Request, Response } from "express";
import { ResponseBody } from "@/utils/definition/http.response";
import HttpException from "@/utils/exceptions/http.exeception";
import MyException from "@/utils/exceptions/my.exception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import { BadRequestException, InternalServerError } from "@/utils/exceptions/badrequest.expception";
import { AuthorizeGuard } from "@/middleware/auth.middleware";
import { inject, injectable, singleton } from "tsyringe";
import { Body, Controller, GET, Header, Next, Req, Res, UseMiddleware } from "@/lib/decorator";


@Controller("/user")
export default class UserController extends MotherController {

    constructor(@inject(Server) io: Server, @inject(UserService) private userSerivce: UserService) {
        super(io)
    }
    @GET("/user/searchuser")
    @UseMiddleware(AuthorizeGuard)
    private async searchUser(req: Request, res: Response, next: NextFunction) {
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
            next(new BadRequestException("Agurment is invalid"))
        } catch (error: any) {
            console.log("🚀 ~ file: user.controller.ts:37 ~ UserController ~ searchUser= ~ error:", error)
            if (error instanceof MyException) {
                next(error)
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
    @GET("/user/:username")
    @UseMiddleware(AuthorizeGuard)
    private async inforUser(req: Request, res: Response, next: NextFunction) {
        try {
            let username = String(req.params.username)
            let userId = Number(req.headers.userId)
            let data = await this.userSerivce.inforUser(userId, username)
            // TODO: add status(gồm 4 trạng thái), numberCommonFriend: int}.
            if (username) {
                res.status(HttpStatus.OK).send(
                    new ResponseBody(
                        true,
                        "",
                        data
                    )
                )
                return
            } else
                next(new BadRequestException("Agurment is invalid"))
        } catch (error: any) {
            if (error instanceof MyException) {
                next(new HttpException(error.status, error.message))
            } else if (error instanceof HttpException) {
                next(new HttpException(error.status, error.message))
            }
            //TODO: conflifct MyException vs HttpException
            console.log("🚀 ~ file: user.controller.ts:64 ~ UserController ~ inforUser= ~ error:", error)
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }

    @GET("/eeee")
    private async getFriend(@Body("test") test : string, @Header("concac") concac: string, @Res() res: Response, @Next() next: NextFunction) {
        console.log("🚀 ~ getFriend ~ test:", test)
        throw new HttpException(400, "test")
        res.status(HttpStatus.OK).send({
            'message': 'get friend'
        })
    }
}
