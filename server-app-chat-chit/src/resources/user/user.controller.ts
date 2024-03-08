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
import { Body, Controller, GET, Headers, Next, Params, Query, Req, Res, UseMiddleware } from "@/lib/decorator";


@Controller("/user")
export default class UserController extends MotherController {

    constructor(@inject(Server) io: Server, @inject(UserService) private userSerivce: UserService) {
        super(io)
    }
    @GET("/user/searchuser")
    @UseMiddleware(AuthorizeGuard)
    private async searchUser(
        @Query("phone") phone: string) {
        if (phone) {
            return new ResponseBody(
                true,
                "",
                await this.userSerivce.searchUser(phone)
            )

        }
        throw (new BadRequestException("Agurment is invalid"))
    }
    @GET("/user/:username")
    @UseMiddleware(AuthorizeGuard)
    private async inforUser(
        @Params("username") username: string, @Headers("userId") userId: number) {
        let data = await this.userSerivce.inforUser(userId, username)
        // TODO: add status(gồm 4 trạng thái), numberCommonFriend: int}.
        if (username) {
           return new ResponseBody(
                    true,
                    "",
                    data
                )
        } else
            throw (new BadRequestException("Agurment is invalid"))
    }
}
