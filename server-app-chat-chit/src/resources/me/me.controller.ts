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
import { Controller, PATCH, FileUpload, UseMiddleware, GET } from '@/lib/decorator';
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
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            let userId = Number(req.headers['userId'])
            if (req.file) {
                let response = await this.meSerivce.changeBackground(userId, req.file)
                res.status(HttpStatus.OK).send(new ResponseBody(
                    true,
                    "",
                    response?.url
                ))
            } else next(new HttpException(HttpStatus.BAD_REQUEST, "File rỗng !!"))
        }
        catch (e) {
            if (e instanceof MyException) {
                next(new HttpException(e.status, e.message))
                return
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }

    }
    @PATCH("/avatar")
    @UseMiddleware(AuthorizeGuard)
    private async changeAvatar(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            let userId = Number(req.headers['userId'])
            if (req.file) {
                let response = await this.meSerivce.changeAvatar(userId, req.file)
                res.status(HttpStatus.OK).send(new ResponseBody(
                    true,
                    "",
                    response?.url
                ))
            } else next(new HttpException(HttpStatus.BAD_REQUEST, "File rỗng !!"))
        }
        catch (e) {
            console.log("🚀 ~ file: me.controller.ts:95 ~ MeController ~ e:", e)
            if (e instanceof MyException) {
                next(new HttpException(e.status, e.message))
                return
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }

    @GET('/profile')
    @UseMiddleware(AuthorizeGuard)
    private async getMyProfile(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            let userId = Number(req.headers['userId'])
            let user = await this.meSerivce.getMyProfile(userId)
            res.status(HttpStatus.OK).send(new ResponseBody(
                true,
                "",
                user
            ))
        }
        catch (e) {

        }
    }
    @PATCH('/profile')
    @UseMiddleware(AuthorizeGuard)
    private async updateMyprofile(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            let userId = Number(req.headers['userId'])
            const { firstname, lastname, gender, birthday, bio, username } = req.body;
            await this.meSerivce.updateMyprofile(userId, firstname, lastname, gender, birthday, bio, username)
            res.status(HttpStatus.OK).send(new ResponseBody(
                true,
                "",
                {}
            ))
        }
        catch (e) {
            next(new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Có lỗi xảy ra vui long thử lại sau"))
        }
    }

}