import { HttpStatus } from "../../../src/utils/extension/httpstatus.exception";
import express, { Application, NextFunction, Response, Request, RequestHandler } from "express";
import ErrorMiddleware from "@/middleware/error.midleware";
import { Server } from "socket.io";
import SocketBuilder from "../../../src/config/socketio/socket.builder";
import { ResponseBody } from "../../../src/utils/definition/http.response";
import {
  Database,
  MySqlBuilder,
} from "../../database/mysql/database";
import { DatabaseCache } from "../../database/redis/redis";
import { BaseMiddleware, middlewareDecorator, middlewareVirtual, MotherController, responseSentMiddleware } from "@/lib/common";
import { globalContainer } from "@/lib/common/di";
import { IRouteDefinition, requiredMetadataKeyParam } from "@/lib/decorator";
import {
  Type,
  iParam,
} from "@/lib/decorator/parameter/definition/params.interface";
import { convertToObjectDTO } from "../../../src/utils/validate";
import HttpException from "../../../src/utils/exceptions/http.exeception";
import { BadRequestException, InternalServerError } from "../../../src/utils/exceptions";
import chalk from "chalk";
import { TypeClass } from "@/lib/types";
export class App {
  private server: any;
  private io: Server;
  private express: Application;
  constructor() {
    this.express = express();
    this.server = require("http").createServer(this.express);
    this.io = new SocketBuilder(
      require("socket.io")(this.server, {
        cors: {
          origin: "*",
          credentials: true,
        },
      })
    )
      .initalizeMiddleware()
      .initalizeServer()
      .build();
    globalContainer.register<Server>(Server, { useValue: this.io });
    this.initaliseDatabase();
    this.initBaseRequesthandler();
  }
  private initBaseRequesthandler() {
    this.express.use(responseSentMiddleware)
    this.express.use(ErrorMiddleware);
  }
  public createControllers(controllers: MotherController[]) {
    let router = express.Router({
      /**caseSensitive: true, strict: true**/
    });

    controllers.forEach((controller: MotherController) => {
      const routes: IRouteDefinition[] =
        Reflect.getMetadata("routes", controller) || [];
        routes.forEach((route) => {
        const multerX =
          Reflect.getMetadata(
            "multer",
            (controller as any)[route.methodName]
          ) || middlewareVirtual;
        let middlewares: TypeClass<BaseMiddleware>[] =
          Reflect.getMetadata(
            "middlewares",
            (controller as any)[route.methodName]
          ) || [];
        let data: iParam[] =
          Reflect.getMetadata(
            requiredMetadataKeyParam,
            controller,
            route.methodName
          ) || [];
        router[route.requestMethod](
          controller.pathMain + route.path,
          multerX,
          middlewareDecorator(middlewares),
          async (req: Request, res: Response, next: NextFunction) => {
            try {
              let argsType: any[] = Reflect.getMetadata(
                "design:paramtypes",
                controller,
                route.methodName
              );
              let args: any[] = [req, res, next];
              if (data.length > 0) {
                args.length = 0;
                for (let _i = 0; _i < data.length; _i++) {
                  let i = data[_i];
                  switch (i.type) {
                    case Type.Next:
                      args.push(next);
                      break;
                    case Type.Res:
                      args.push(res);
                      break;
                    case Type.Req:
                      args.push(req);
                      break;
                    case Type.Body:
                      if (i.propertyKey) {
                        args.push(
                          await convertToObjectDTO(
                            argsType[_i],
                            req.body[i.propertyKey],
                            undefined,
                            { validationError: { target: false } }
                          )
                        );
                      } else
                        args.push(
                          await convertToObjectDTO(argsType[_i], req.body)
                        );
                      break;
                    case Type.Params:
                      if (i.propertyKey) {
                        args.push(
                          await convertToObjectDTO(
                            argsType[_i],
                            req.params[i.propertyKey],
                            undefined,
                            { validationError: { target: false } }
                          )
                        );
                      } else args.push(req.params);
                      break;
                    case Type.Query:
                      if (i.propertyKey) {
                        args.push(
                          await convertToObjectDTO(
                            argsType[_i],
                            req.query[i.propertyKey],
                            undefined,
                            { validationError: { target: false } }
                          )
                        );
                      } else
                        args.push(
                          await convertToObjectDTO(
                            argsType[_i],
                            req.query,
                            undefined,
                            { validationError: { target: false } }
                          )
                        );
                      break;
                    case Type.Headers:
                      if (i.propertyKey) {
                        args.push(
                          await convertToObjectDTO(
                            argsType[_i],
                            req.headers[i.propertyKey],
                            undefined,
                            { validationError: { target: false } }
                          )
                        );
                      } else args.push(req.headers);
                      break;
                  }
                }
              }
              let dataRes = await (controller as any)[route.methodName](
                ...args
              );
              console.log("🚀 ~ App ~ route.methodName:", route.methodName);
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
    });
    this.express.use(router);
    this.express.use((req, res) => {
      res.status(HttpStatus.NOT_FOUND).send(
        new ResponseBody(false, "NOT FOUND", {
          url: req.url,
        })
      );
    });
  }
  private initaliseDatabase() {
    globalContainer.register<Database>(Database, {
      useValue: new MySqlBuilder().initPool().build(),
    });
    globalContainer.register<DatabaseCache>(DatabaseCache, {
      useValue: new DatabaseCache(),
    });
  }
  public listen(port: number): void {
    this.server.listen(port, () => {
      console.log(
        chalk.green(`Server listening on port:`),
        chalk.green(`${port}`)
      );
    });
  }
  public use(middleware: RequestHandler) {
    this.express.use(middleware);
  };

}

export default App;
