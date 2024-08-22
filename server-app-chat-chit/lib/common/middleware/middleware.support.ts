import { BaseMiddleware } from "@/lib/common";
import { globalContainer } from "@/lib/common";
import { TypeClass } from "@/lib/types";
import { NextFunction, Request, Response } from "express";

export function middlewareDecorator(
  middlewares: TypeClass<BaseMiddleware>[]
)  {
  let _middlewares = middlewares;
    let a  = []
    for (let i = 0; i < _middlewares.length; i++) {
      a.push(globalContainer.resolve(_middlewares[i]).use)
    }
    // a.push(middlewareVirtual)
    return a;
}
export function middlewareVirtual(
  req: Request,
  res: Response,
  next: NextFunction
) {
  next();
}
export function responseSentMiddleware(
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
