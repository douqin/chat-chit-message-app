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
import Gender from "./enums/gender.enum";
import { BadRequest, InternalServerError } from "@/utils/exceptions/badrequest.expception";
import authHandler from "../../component/auth.handler";
import { JwtPayload } from "jsonwebtoken";

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
            this.getNewAccessToken
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
                    // res.setHeader("token", "Bearer " + data.token.accessToken)
                    // res.cookie("refreshtoken", data.token.refreshToken, { expires : , secure: false, httpOnly: true })
                    res.status(HttpStatus.OK).send(new ResponseBody(true, "OK", data))
                }
                else {
                    next(new HttpException(HttpStatus.NOT_FOUND, 'Incorrect username or password'))
                }
            }
            else next(new BadRequest("Agurment is invalid"));
        } catch (e: any) {
            if (e instanceof MyException) {
                next(new HttpException(e.statusCode, e.message))
                return
            }
            console.log("🚀 ~ file: login.controller.ts:64 ~ LoginController ~ error:", e)
            next(next(new InternalServerError("An error occurred, please try again later.")))
        }
    }
    private registerAccount = async (
        req: Request, res: Response, next: NextFunction
    ) => {
        try {
            const firstname = req.body.firstname
            const phone = req.body.phone
            const password = req.body.password
            const lastname = req.body.lastname
            const email = req.body.email
            const address = req.body.address
            const gender: Gender = Number(req.body.gender) || 3
            const username = req.body.username
            const birthday = new Date(req.body.birthday)

            if (firstname && phone && password && birthday) {
                let isSuccessfully = await this.authService.registerAccount(firstname, phone, password, birthday, gender, username, lastname, email, address)
                if (isSuccessfully) {
                    res.status(HttpStatus.OK).json(
                        new ResponseBody(
                            true,
                            "Tạo tài khoản thành công",
                            {}
                        )
                    )
                    return
                }
            } else {
                next(new BadRequest("Agurment is invalid"))
                return
            }
            next(next(new InternalServerError("An error occurred, please try again later.")))
        }
        catch (e) {
            console.log("🚀 ~ file: auth.controller.ts:105 ~ AuthController ~ e:", e)
            if (e instanceof MyException) {
                next(new HttpException(e.statusCode, e.message))
            }
            next(next(new InternalServerError("An error occurred, please try again later.")))
        }
    }
    private logout = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            let iduser = Number(req.headers['iduser'])
            let refreshToken = req.body.refreshToken
            if (refreshToken) {
                let isOK = await this.authService.loguot(iduser, refreshToken)
                console.log("🚀 ~ file: auth.controller.ts:137 ~ AuthController ~ req.cookies:", res.cookie)
                res.status(HttpStatus.OK).send(new ResponseBody(
                    isOK,
                    "",
                    {}
                ))
            }
            else next(new BadRequest("Agurment is invalid"))
        } catch (e: any) {
            console.log("🚀 ~ file: auth.controller.ts:144 ~ AuthController ~ e:", e)
            if (e instanceof MyException) {
                next(new HttpException(e.statusCode, e.message))
            }
            next(next(new InternalServerError("An error occurred, please try again later.")))
        }
    }
    private getNewAccessToken = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const refreshToken = String(req.body.refreshtoken)
            let token = req.headers["authorization"] as string
            const jwtPayload = await authHandler.decodeRefreshToken(refreshToken) as JwtPayload;
            const { iduser } = jwtPayload.payload;
            if (iduser && refreshToken && token) {
                let newAccessToken = await this.authService.getNewAccessToken(iduser, token, refreshToken)
                res.status(HttpStatus.OK).json(new ResponseBody(
                    true,
                    "",
                    {
                        accessToken: newAccessToken
                    }
                ))
                return
            }
            next(new BadRequest("Agurment is invalid"))
        }
        catch (e) {
            if (e instanceof MyException) {
                next(new HttpException(e.statusCode, e.message))
            }
            next(next(new InternalServerError("An error occurred, please try again later.")))
        }
    }
    // TODO: confirm account
    // TODO: reset otp: confirm account
}


