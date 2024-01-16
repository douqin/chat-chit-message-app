import { HttpStatus } from './../../utils/extension/httpstatus.exception';
import MotherController from "@/utils/interface/controller.interface";
import MeService from "./me.service";
import { Server } from "socket.io";
import { NextFunction, Request, Response } from "express";
import multer from "multer";
import MyException from "@/utils/exceptions/my.exception";
import HttpException from "@/utils/exceptions/http.exeception";
import { ResponseBody } from '@/utils/definition/http.response';
import { InternalServerError } from '@/utils/exceptions/badrequest.expception';
import { inject } from 'tsyringe';
import Controller from '@/utils/decorator/controller';
import UseMiddleware from '@/utils/decorator/middleware/use.middleware';
import { GET } from '@/utils/decorator/http.method/get';
import { PATCH } from '@/utils/decorator/http.method/patch';
import { FileUpload } from '@/utils/decorator/file.upload/multer.upload';
import { AuthorizeMiddleware } from '@/middleware/auth.middleware';

@Controller("/me")
export default class MeController extends MotherController {
    constructor(@inject(Server) io: Server, @inject(MeService) private meSerivce: MeService) {
        super(io)
    }
    @PATCH("/background")
    @FileUpload(multer().single('background'))
    @UseMiddleware(AuthorizeMiddleware)
    private async changeBackground(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            let iduser = Number(req.headers['iduser'])
            if (req.file) {
                let response = await this.meSerivce.changeBackground(iduser, req.file)
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
    @UseMiddleware(AuthorizeMiddleware)
    private async changeAvatar(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            let iduser = Number(req.headers['iduser'])
            if (req.file) {
                let response = await this.meSerivce.changeAvatar(iduser, req.file)
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
    @UseMiddleware(AuthorizeMiddleware)
    private async getMyProfile(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            let iduser = Number(req.headers['iduser'])
            let user = await this.meSerivce.getMyProfile(iduser)
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
    @UseMiddleware(AuthorizeMiddleware)
    private async updateMyprofile(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            let iduser = Number(req.headers['iduser'])
            const { firstname, lastname, gender, birthday, bio, username } = req.body;
            await this.meSerivce.updateMyprofile(iduser, firstname, lastname, gender, birthday, bio, username)
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