import { TypeClass } from "@/lib/types";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { globalContainer } from "../di";
import { MotherController } from "../controller";
import { ParamHandler } from "@/lib/decorator/handler/params.handler";
import { BaseMiddleware } from ".";

export class MiddlewareHandler {
    static handle(controller: MotherController, methodName: string) {
        let guards: TypeClass<BaseMiddleware>[] =
            Reflect.getMetadata(
                "middlewares",
                (controller as any)[methodName]
            ) || [];
        let listHandler: Array<RequestHandler> = []
        for (let guard of guards) {
            listHandler.push(async (req: Request, res: Response, next: NextFunction) => {
                let nextCalled = false;
                const customNext: NextFunction = (...args) => {
                    nextCalled = true;
                    next(...args);
                };
                try {
                    let oHandler = globalContainer.resolve(guard)
                    const handler = oHandler.handle;
                    const name = handler.name
                    let args = await ParamHandler.handle(oHandler, name, req, res, customNext)
                    let result = await handler(...args)
                    console.log("🚀 ~ MiddlewareHandler ~ listHandler.push ~ result:", result)
                    if (!nextCalled && !res.locals.responseSent) {
                        next();
                    }
                }
                catch (e: any) {
                    next(e)
                }
            })
        }
        return listHandler;
    }
    static async responseSentMiddleware(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const originalSend = res.send;
        res.send = function (...args) {
            res.locals.responseSent = true;
            return originalSend.apply(res, args);
        };
        next();
    }
    static async virtualMiddleware(req: Request, res: Response, next: NextFunction) {
        next()
    }
}