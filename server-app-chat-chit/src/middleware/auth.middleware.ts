import { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express"
import { BaseMiddleware as BaseGuard, UnAuthorizedException } from "@/lib/common";
import { Middleware as Guard, Next, Req, Res } from "@/lib/decorator";
import { JwtAuthService } from "@/services/jwt/jwt.service";
import { container } from "tsyringe";

@Guard()
export class AuthorizeGuard extends BaseGuard {
    public async handle(@Req() req: Request, @Res() res: Response): Promise<void | Error> {
        try {
            let token = req.headers["authorization"] as string
            if (token) {
                let accesstoken = token.split(" ")[1]
                if (accesstoken) {
                    const jwtPayload = await container.resolve(JwtAuthService).decodeAccessToken(accesstoken) as JwtPayload;
                    const { userId } = jwtPayload.payload;
                    if (userId) {
                        req.headers['userId'] = userId;
                        return
                    }
                }
            }
            return new UnAuthorizedException("Invalid token")
        }
        catch (e: any) {
            console.log("🚀 ~ file: auth.middleware.ts:33 ~ AuthMiddleware ~ e:", e)
            if (e instanceof TokenExpiredError) {
                return (new UnAuthorizedException(e.message))
            }
            return (new UnAuthorizedException("Invalid token"))
        }
    }
}