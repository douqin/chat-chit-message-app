import { NextFunction, Request, Response } from 'express';
export default abstract class BaseMiddleware {
  public abstract use(req: Request, res: Response, next: NextFunction): void;
}