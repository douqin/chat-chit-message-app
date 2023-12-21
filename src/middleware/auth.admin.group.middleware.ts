import { Response, Request, NextFunction } from "express"

`check user is admin or not by group id as middleware`
export class AuthMiddleware {
    static authAdminGroup = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => { 
        try{
            // check user is admin or not by group id
            // if admin then next()
            // else throw error
            
            next()
        }
        catch(e){
            // next(e)
        }
    }
}