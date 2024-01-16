import { NextFunction, Request, Response } from 'express';
export abstract class BaseMiddleware {
  public abstract use(req: Request, res: Response, next: NextFunction): void;
}