import { HttpStatus } from '@/utils/extension/httpstatus.exception';
import { Request, Response, NextFunction, RequestHandler } from 'express';

class LoginMiddleware {
    static checkAuth(): RequestHandler {
        return async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            try {
                const { phone, password } = req.body;

                if (!phone && !password) {
                    res.status(HttpStatus.BAD_REQUEST).send({ errors: "BAD REQUEST" });
                    let contentType = req.headers['content-type']
                    let token = req.headers['token']
                    // if (token) {
                    //     res.status(HttpStatus.BAD_REQUEST).send({ errors: "BAD REQUEST" })
                    //     return
                    // }
                    if (!contentType) {
                        res.status(HttpStatus.BAD_REQUEST).send({ errors: "BAD REQUEST" });
                    }
                } else
                    next();
            } catch (e: any) {
                const errors: string[] = [];
                res.status(HttpStatus.BAD_REQUEST).send({ errors: errors });
            }
        };
    }
    static isLogged() : RequestHandler{
        return async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            //TODO: check user loggedd
            next();
        }
    }
}

export default LoginMiddleware;