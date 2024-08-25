import { Request, Response, NextFunction } from "express";
import { ResponseBody } from "@/utils/definition/http.response";
import { HttpException, HttpStatus } from "@/lib/common";
import chalk from "chalk";

export default function errorMiddlewareHTTP(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (error instanceof HttpException) {
        const status = error.status
        const message = error.message
        const success = error.success
        res.status(status).send(
            new ResponseBody(
                success,
                message,
                {}
            )
        )
        return
    } 
    console.log(chalk.red("INTERNAL SERVER ERROR: ", error))
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(
        new ResponseBody(
            false,
            "INTERNAL SERVER ERROR",
            {}
        )
    )
}
