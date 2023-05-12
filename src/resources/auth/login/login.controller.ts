import MotherController from "@/utils/interface/controller.interface"
import HttpException from "@/utils/exceptions/http.exeception";
import { HttpStatus } from "@/utils/exceptions/httpstatus.exception";
import { NextFunction, Router, Response, Request } from "express";
import { Server } from "socket.io";
import LoginMiddleware from "./login.validation";
import { stringify } from "querystring";
import LoginService from "./login.service";
import Controller from "@/utils/decorator/decorator";
import multer from "multer";
import { HttpSuccess } from "@/utils/definition/http.success";
@Controller("/login")
export default class LoginController extends MotherController {

    loginService: LoginService

    constructor(io: Server) {
        super(io);
        this.loginService = new LoginService()
    }

    initRouter(): MotherController {

        this.router.post(
            "/login",
            multer().none(),
            LoginMiddleware.checkAuth(),
            this.login
        )
        this.router.post(
            "/refreshtoken",
            multer().none(),
            LoginMiddleware.checkAuth(),
            this.login
        )
        this.router.post(
            "/signup",
            multer().none(),
            LoginMiddleware.checkAuth(),
            this.login
        )
        return this
    }

    private login = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const phone = req.body.phone.toString();
            const password = req.body.password.toString();

            // const post = await this.PostService.create(title, body);
            let data = await this.loginService.login(phone, password);
            if (data) {
                res.setHeader("token", "Bearer " + data.token.accessToken)
                res.cookie("refreshtoken", data.token.refreshToken, { secure: false, httpOnly: true })
                res.status(HttpStatus.ACCEPTED).send(new HttpSuccess(true, "", data))
            }
            else {
                next(new HttpException(HttpStatus.NOT_FOUND, 'Sai tài khoản hoặc mật khẩu'))
            }
        } catch (error: any) {
            console.log("Login Controller" + stringify(error))
            next(new HttpException(HttpStatus.FORBIDDEN, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    };
}


