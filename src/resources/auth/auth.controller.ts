import MotherController from "@/utils/interface/controller.interface"
import HttpException from "@/utils/exceptions/http.exeception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import { NextFunction, Router, Response, Request } from "express";
import { Server } from "socket.io";
import LoginMiddleware from "./middleware/auth.validation";
import { stringify } from "querystring";
import AuthService from "./auth.service";
import Controller from "@/utils/decorator/decorator";
import multer from "multer";
import { ResponseBody } from "@/utils/definition/http.response";
import AuthMiddleware from "@/middleware/auth.middleware";
import MyException from "@/utils/exceptions/my.exception";
@Controller("/auth")
export default class AuthController extends MotherController {

    authService: AuthService

    constructor(io: Server) {
        super(io);
        this.authService = new AuthService()
    }

    initRouter(): MotherController {

        this.router.post(
            "/auth/login",
            multer().none(),
            LoginMiddleware.checkAuth(),
            this.login
        )
        this.router.post(
            "/auth/refreshtoken",
            multer().none(),
            LoginMiddleware.checkAuth(),
            this.getRefreshToken
        )
        this.router.post(
            "/auth/register",
            multer().none(),
            LoginMiddleware.checkAuth(),
            this.registerAccount
        )
        this.router.post(
            "/auth/logout",
            multer().none(),
            AuthMiddleware.auth,
            this.logout
        )
        return this
    }

    private login = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const phone = String(req.body.phone)
            const password = String(req.body.password)
            const notificationToken = String(req.body.notification)
            if (phone && password && notificationToken) {
                let data = await this.authService.login(phone, password, notificationToken);
                if (data) {
                    res.setHeader("token", "Bearer " + data.token.accessToken)
                    res.cookie("refreshtoken", data.token.refreshToken, { secure: false, httpOnly: true })
                    res.status(HttpStatus.ACCEPTED).send(new ResponseBody(true, "OK", data))
                }
                else {
                    next(new HttpException(HttpStatus.NOT_FOUND, 'Sai tài khoản hoặc mật khẩu'))
                }
            }
            else next(new HttpException(HttpStatus.BAD_REQUEST, 'Tham số không hợp lệ'));
        } catch (error: any) {
            console.log("🚀 ~ file: login.controller.ts:64 ~ LoginController ~ error:", error)
            next(new HttpException(HttpStatus.FORBIDDEN, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
    private registerAccount = async (
        req: Request, res: Response, next: NextFunction
    ) => {
        try {
            const name = req.body.name.toString() || null
            const phone = req.body.phone.toString() || null
            const password = req.body.password.toString() || null
            if (name && phone && password) {
                let isSuccessfully = await this.authService.registerAccount(name, phone, password)
                if (isSuccessfully) {
                    res.json(
                        new ResponseBody(
                            true,
                            "Tạo tài khoản thành công",
                            {}
                        )
                    )
                    return
                }
                next(new HttpException(HttpStatus.BAD_REQUEST, 'Có lỗi xảy ra vui lòng thử lại sau'))
                return
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, 'Có lỗi xảy ra vui lòng thử lại sau'))
        }
        catch (e) {
            if (e instanceof DOMException) {
                next(new HttpException(HttpStatus.BAD_REQUEST, e.message))
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, 'Có lỗi xảy ra vui lòng thử lại sau'))
        }
    }
    private logout = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            let iduser = Number(req.headers['iduser'])
            let refreshToken = String(req.body.refreshToken)
            let isOK = await this.authService.loguot(iduser, refreshToken)
            res.status(HttpStatus.OK).send(new ResponseBody(
                isOK,
                "",
                {}
            ))
        } catch (error: any) {
            console.log("🚀 ~ file: auth.controller.ts:125 ~ AuthController ~ error:", error)
            next(new HttpException(HttpStatus.FORBIDDEN, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
    private getRefreshToken = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const iduser = Number(req.headers.iduser)
            const refreshToken = String(req.body.refreshtoken)
            let token = req.headers["token"] as string
            if (iduser && refreshToken && token) {
                let newAccessToken = await this.authService.getNewAccessToken(iduser, token, refreshToken)
                res.status(HttpStatus.OK).json(new ResponseBody(
                    true,
                    "",
                    {
                        token : newAccessToken
                    }
                ))
                return
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Tham số không hợp lệ"))
        }
        catch (error) {
            if (error instanceof MyException) {
                next(new HttpException(HttpStatus.BAD_REQUEST, error.message))
            }
            next(new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
    // TODO: confirm account
    // TODO: reset otp: confirm account
}


