
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
    res.status(status).send(
        {
            status,
            message
        }
    )
}
export default errorMiddleware;