import { NextFunction, Request, Response } from 'express';


export abstract class BaseMiddleware<Argument = any> {
  public abstract handle(...args: Argument[]): Promise<void | Error>;
}