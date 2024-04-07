import { HttpStatus } from './../../utils/extension/httpstatus.exception';
import { MotherController } from "@/lib/common";

import MeService from "./me.service";
import { Server } from "socket.io";
import { NextFunction, Request, Response } from "express";
import multer from "multer";
import MyException from "@/utils/exceptions/my.exception";
import HttpException from "@/utils/exceptions/http.exeception";
import { ResponseBody } from '@/utils/definition/http.response';
import { InternalServerError } from '@/utils/exceptions/badrequest.expception';
import { inject } from 'tsyringe';
import { Controller, PATCH, FileUpload, UseMiddleware, GET, Req, Headers, Body } from '@/lib/decorator';
import { AuthorizeGuard } from '@/middleware/auth.middleware';

@Controller("/me")
export default class MeController extends MotherController {
    constructor(@inject(Server) io: Server, @inject(MeService) private meSerivce: MeService) {
        super(io)
    }
    @PATCH("/background")
    @FileUpload(multer().single('background'))
    @UseMiddleware(AuthorizeGuard)
    private async changeBackground(
        @Headers('userId') userId: number,
        @Req() req: Request
    ) {
        if (req.file) {
            let response = await this.meSerivce.changeBackground(userId, req.file)
            return (new ResponseBody(
                true,
                "",
                response?.url
            ))
        } else throw (new HttpException(HttpStatus.BAD_REQUEST, "File rỗng !!"))
    }
    @PATCH("/avatar")
    @UseMiddleware(AuthorizeGuard)
    private async changeAvatar(
        @Headers('userId') userId: number,
        @Req() req: Request
    ) {
        if (req.file) {
            let response = await this.meSerivce.changeAvatar(userId, req.file)
            return (new ResponseBody(
                true,
                "",
                response?.url
            ))
        } else throw (new HttpException(HttpStatus.BAD_REQUEST, "File rỗng !!"))

    }

    @GET('/profile')
    @UseMiddleware(AuthorizeGuard)
    private async getMyProfile(
        @Headers('userId') userId: number
    ) {
        let user = await this.meSerivce.getMyProfile(userId)
        return (new ResponseBody(
            true,
            "",
            user
        ))
    }
    @PATCH('/profile')
    @UseMiddleware(AuthorizeGuard)
    private async updateMyprofile(
        @Headers('userId') userId: number,
        @Body() user : any
    ) {
        await this.meSerivce.updateMyprofile(userId, user.firstname, user.lastname, user.gender, user.birthday, user.bio, user.username)
        return (new ResponseBody(
            true,
            "",
            {}
        ))
    }
}