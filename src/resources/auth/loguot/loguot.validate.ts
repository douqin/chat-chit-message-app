import HttpException from '@/utils/exceptions/http.exeception';
import { HttpStatus } from "@/utils/exceptions/httpstatus.exception";
import { NextFunction, RequestHandler, Response, Request } from "express";

export default class LogoutMiddleware {
    static validate(): RequestHandler {
        return async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            next()
        };
    }
}