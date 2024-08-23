import { HttpStatus } from "../../common/exceptions/httpstatus.exception";
import express, {
  Application,
  NextFunction,
  Response,
  Request,
  RequestHandler,
  Router,
} from "express";
import ErrorMiddleware from "@/middleware/error.midleware";
import { Server, ServerOptions } from "socket.io";
import { ResponseBody } from "../../../src/utils/definition/http.response";
import { Database, MySqlBuilder } from "../../database/mysql/database";
import { DatabaseCache } from "../../database/redis/redis";
import {
  BadRequestException,
  BaseMiddleware,
  HttpException,
  InternalServerError,
  middlewareDecorator,
  middlewareVirtual,
  MotherController,
  responseSentMiddleware,
} from "@/lib/common";
import { globalContainer } from "@/lib/common/di";
import { IRouteDefinition, requiredMetadataKeyParam } from "@/lib/decorator";
import {
  Type,
  iParam,
} from "@/lib/decorator";
import { convertToObjectDTO } from "../../../src/utils/validate";
import chalk from "chalk";
import { TypeClass } from "@/lib/types";
import { createServer } from "http";
import iSocketBuilder from "@/lib/socket.builder.interface";
export class App {
  private server: any;
  private io: Server;
  private express: Application;
  private router: Router;
  controllers: any;
  constructor() {
    this.express = express();
    this.router = express.Router({
      /**caseSensitive: true, strict: true**/
    });
    this.initializeDatabase();
  }
  public initBaseRequestHandler() {
    this.express.use(responseSentMiddleware);
  }
  public initializeController(controllers: MotherController[]) {
    this.controllers = controllers;
  }
  public startAllControllers() {
    let controllers = this.controllers;
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
        this.router[route.requestMethod](
          controller.pathMain + route.path,
          multerX,
          ...middlewareDecorator(middlewares),
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
              console.log(data)
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
    });
    this.express.use(this.router);
    this.express.use((req, res) => {
      res.status(HttpStatus.NOT_FOUND).send(
        new ResponseBody(false, "NOT FOUND", {
          url: req.url,
        })
      );
    });
  }
  private initializeDatabase() {
    globalContainer.register<Database>(Database, {
      useValue: new MySqlBuilder().initPool().build(),
    });
    globalContainer.register<DatabaseCache>(DatabaseCache, {
      useValue: new DatabaseCache(),
    });
  }
  public listen(port: number): void {
    this.startAllControllers();
    this.express.use(ErrorMiddleware);
    this.express.listen(port, () => {
      console.log(
        chalk.black(`Application:`),
        chalk.green(`Server started on port:`),
        chalk.green(`${port}`)
      );
    });
  }
  public use(middleware: RequestHandler) {
    this.express.use(middleware);
  }
  static logAllRoute(app: App): void {
    app.router.stack.forEach((r) => {
      if (r.route && r.route.path) {
        console.log(
          chalk.green(`Route:`),
          chalk.green(`${r.route.stack[0].method}: `),
          chalk.green(`${r.route.path}`)
        );
      }
    });
  }
  public initSocket(baseConfigSocket: Partial<ServerOptions>): void {
    this.server = createServer(this.express);
    this.io = new Server(this.server, baseConfigSocket);
    globalContainer.register<Server>(Server, { useValue: this.io });
  }
  public configSocket(builder: iSocketBuilder) {
    builder.intializeBaseSocket(this.io).initalizeMiddleware().initalizeServer().reBuild();
  }
}

export default App;
