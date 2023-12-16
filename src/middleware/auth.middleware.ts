import HttpException from "@/utils/exceptions/http.exeception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import authHandler from "../component/auth.handler";
import { NextFunction, Request, Response } from "express"
import { BadRequest, Forbidden, InternalServerError } from "@/utils/exceptions/badrequest.expception";

export default class AuthMiddleware {
    static auth = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            let token = req.headers["authorization"] as string
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
                    next(new HttpException(HttpStatus.UNAUTHORIZED, "Token không hợp lệ"))
                    return
                }
            } else next(new HttpException(HttpStatus.FORBIDDEN, "Token không hợp lệ"))
        }
        catch (e : any) {
            console.log("🚀 ~ file: auth.middleware.ts:33 ~ AuthMiddleware ~ e:", e)
            if (e instanceof TokenExpiredError) {
                next(new HttpException(HttpStatus.UNAUTHORIZED, e.message))
            } 
            next(new Forbidden("Invalid token"))
        }
    };
}
