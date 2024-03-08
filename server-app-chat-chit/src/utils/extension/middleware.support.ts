import { BaseMiddleware } from "@/lib/common";
import { globalContainer } from "@/lib/common/di";
import { NextFunction, Request, Response } from "express";
import { constructor } from "tsyringe/dist/typings/types";

export function middlewareDecorator(middlewares: constructor<BaseMiddleware>[]) {
    let _middlewares = middlewares;
    return (req: Request, res: Response, next: NextFunction) => {
        if (middlewares.length == 0) {
            next();
            return;
        }
        for (let i = 0; i < _middlewares.length; i++) {
            let a = globalContainer.resolve(_middlewares[i]).use(req, res, next);
        }
    };
}
export function middlewareVirtual
    (req: Request, res: Response, next: NextFunction) {
    next();
};
export function responseSentMiddleware(req: Request, res: Response, next: NextFunction) {
    const originalSend = res.send; 
    res.send = function (...args) {
        res.locals.responseSent = true;
        return originalSend.apply(res, args); 
    };
    next();
}
