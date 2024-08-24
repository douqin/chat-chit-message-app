import { IRouteDefinition } from "@/lib/decorator";
import { MotherController } from "./mother.controller";
import { MiddlewareHandler } from "../middleware";
import { Router, Request, Response, NextFunction } from "express";
import chalk from "chalk";
import { HttpStatus, HttpException, BadRequestException, InternalServerError } from "../exceptions";
import { ParamHandler } from "@/lib/decorator/handler/params.handler";

export class ControllerHandler {
    static handle(router: Router, controller: MotherController) {
        const routes: IRouteDefinition[] =
            Reflect.getMetadata("routes", controller) || [];
        routes.forEach((route) => {
            const multerX =
                Reflect.getMetadata(
                    "multer",
                    (controller as any)[route.methodName]
                ) || MiddlewareHandler.virtualMiddleware;

            router[route.requestMethod](
                controller.pathMain + route.path,
                multerX,
                ...MiddlewareHandler.handle(controller, route.methodName),
                async (req: Request, res: Response, next: NextFunction) => {
                    try {
                        let args = await ParamHandler.handle(controller, route.methodName, req, res, next);
                        let dataRes = await (controller as any)[route.methodName](
                            ...args
                        );
                        if (!res.locals.responseSent && dataRes !== undefined) {
                            const httpCode: HttpStatus =
                                Reflect.getMetadata(
                                    "httpCode",
                                    controller,
                                    route.methodName
                                ) || HttpStatus.OK;
                            res.status(httpCode).send(dataRes);
                        }
                    } catch (e) {
                        if (e instanceof HttpException) {
                            next(e);
                            // } else if (isArrayOf<ValidationError>(e)) {
                        } else if (Array.isArray(e)) {
                            next(new BadRequestException(JSON.parse(JSON.stringify(e))));
                        } else {
                            console.log(chalk.red("Error:"), e);
                            next(
                                new InternalServerError(
                                    "An error occurred, please try again later."
                                )
                            );
                        }
                    }
                }
            );
        });
    }
}