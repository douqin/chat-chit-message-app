import { HttpStatus } from './../../utils/extension/httpstatus.exception';
import MotherController from "@/utils/interface/controller.interface";
import MeService from "./me.service";
import { Server } from "socket.io";
import { NextFunction, Request, Response } from "express";
import AuthMiddleware from "@/middleware/auth.middleware";
import multer from "multer";
import MyException from "@/utils/exceptions/my.exception";
import HttpException from "@/utils/exceptions/http.exeception";
import { ResponseBody } from '@/utils/definition/http.response';
import { InternalServerError } from '@/utils/exceptions/badrequest.expception';

export default class MeController extends MotherController {
    private meSerivce: MeService
    constructor(io: Server) {
        super(io)
        this.meSerivce = new MeService()
    }
    initRouter(): MotherController {
        this.router.get(
            "/me/profile",
            AuthMiddleware.auth,
            this.getMyProfile
        )

        this.router.patch(
            "/me/profile",
            multer().none(),
            AuthMiddleware.auth,
            this.updateMyprofile
        )

        this.router.patch(
            "/me/password",
            AuthMiddleware.auth,
            this.changePassword
        )
        this.router.patch(
            "/me/avatar",
            AuthMiddleware.auth,
            multer({
                limits: {
                    fieldSize: 7000
                }
            }).single('avatar'),
            this.changeAvatar
        )
        this.router.patch(
            "/me/background",
            AuthMiddleware.auth,
            multer().single('background'),
            this.changeBackground
        )
        return this
    }
    private changeBackground = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
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
                next(new HttpException(e.statusCode, e.message))
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }

    }
    private changeAvatar = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
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
                next(new HttpException(e.statusCode, e.message))
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
    private getMyProfile = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
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
    private changePassword = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            let iduser = Number(req.headers['iduser'])
            const { password } = req.body
            await this.meSerivce.changePassword(iduser, password)
        }
        catch (e) {
            if (e instanceof MyException) {
                next(new HttpException(e.statusCode, e.message))
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
    private updateMyprofile = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
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