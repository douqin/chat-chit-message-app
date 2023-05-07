
import { Request, Response, NextFunction } from "express";
import HttpException from "../utils/exceptions/http.exeception";

function errorMiddleware(
    error: HttpException,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const status = error.status || 500
    const message = error.message || "Something wrong"
    const success = error.success || false
    res.status(status).send(
        {
            success,
            message
        }
    )
}
export default errorMiddleware;