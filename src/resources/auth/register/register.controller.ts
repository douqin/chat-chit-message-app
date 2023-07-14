import Controller from "@/utils/decorator/decorator";
import MotherController from "@/utils/interface/controller.interface";
import multer from "multer";
import { NextFunction, Response, Request } from "express";
import { Server } from "socket.io";
import RegisterService from "./register.service";
import LoginMiddleware from "../login/login.validation";
import { HttpStatus } from "@/utils/exceptions/httpstatus.exception";
import HttpException from "@/utils/exceptions/http.exeception";
import { ResponseBody } from "@/utils/definition/http.response";
import MyException from "@/utils/exceptions/my.exception";
@Controller("/register")
export default class RegisterController extends MotherController {
    private registerService: RegisterService;
    constructor(io: Server) {
        super(io)
        this.registerService = new RegisterService();
    }
    initRouter(): MotherController {
        this.router.post(
            "/register",
            multer().none(),
            // LoginMiddleware.isLogged,
            this.registerAccount
        )
        return this
    }
    registerAccount = async (
        req: Request, res: Response, next: NextFunction
    ) => {
        try {
            const name = req.body.name.toString() || null
            const phone = req.body.phone.toString() || null
            const password = req.body.password.toString() || null
            if (name && phone && password) {
                let isSuccessfully = await this.registerService.registerAccount(name, phone, password)
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
            if(e instanceof MyException){
                next(new HttpException(HttpStatus.BAD_REQUEST, e.message))
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, 'Có lỗi xảy ra vui lòng thử lại sau'))
        }
    }
}