
import { Request, Response, NextFunction } from "express";
import { ResponseBody } from "@/utils/definition/http.response";
import { HttpException } from "@/lib/common";

export default function errorMiddlewareHTTP(
    error: HttpException,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const status = error.status || 500
    const message = error.message || "Something wrong"
    const success = error.success || false
    res.status(status).send(
        new ResponseBody(
            success,
            message,
            {}
        )
    )
}
// export function errorMiddlewareIO(
//     error: HttpException,
    
// ): void {
//     const status = error.status || 500
//     const message = error.message || "Something wrong"
//     const success = error.success || false
//     res.status(status).send(
//         new ResponseBody(
//             success,
//             message,
//             {}
//         )
//     )
// }
