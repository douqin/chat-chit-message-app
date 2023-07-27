import HttpException from "@/utils/exceptions/http.exeception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import { JwtPayload } from "jsonwebtoken";
import authHandler from "../component/auth.handler";
import { NextFunction, Request, Response } from "express"

export default class AuthMiddleware {
    static auth = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
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
    };
}
