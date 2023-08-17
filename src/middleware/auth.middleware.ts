import HttpException from "@/utils/exceptions/http.exeception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import authHandler from "../component/auth.handler";
import { NextFunction, Request, Response } from "express"

export default class AuthMiddleware {
    static auth = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            let token = req.headers["token"] as string
            if (token) {
                let accesstoken = token.split(" ")[1]
                if (accesstoken) {
                    const jwtPayload = await authHandler.decodeAccessToken(accesstoken) as JwtPayload;
                    const { iduser } = jwtPayload.payload;
                    if (iduser) {
                        req.headers['iduser'] = iduser;
                        next()
                    }
                }
                else {
                    next(new HttpException(HttpStatus.FORBIDDEN, "Token không hợp lệ"))
                    return
                }
            } else next(new HttpException(HttpStatus.FORBIDDEN, "Token không hợp lệ"))
        }
        catch (e) {
            if (e instanceof TokenExpiredError) {
                next(new HttpException(HttpStatus.UNAUTHORIZED, e.message))
            }
            next(new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    };
}
