import { NextFunction, Request, RequestHandler, Response } from "express"

export default class AuthMiddleware {
    static auth(): RequestHandler {
        return async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            console.log(AuthMiddleware.name)
            next()
        };
    }
    static authAdmin(): RequestHandler {
        return async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            console.log(AuthMiddleware.name)
            next()
        };
    }
}