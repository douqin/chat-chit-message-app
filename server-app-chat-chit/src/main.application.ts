import { HttpStatus } from "./utils/extension/httpstatus.exception";
import express, { Application, NextFunction, Response, Request } from "express";
import ErrorMiddleware from "@/middleware/error.midleware";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import SocketBuilder from "./config/socketio/socket.builder";
import { ResponseBody } from "./utils/definition/http.response";
import { Database, MySqlBuilder, iDatabase } from "../lib/database/mysql/database";
import { DatabaseCache } from "../lib/database/redis/redis";
import { RegisterModuleController } from "./utils/extension/controller.container.module";
import ModuleController from "./resources/module.controller";
import { IRouteDefinition } from "../lib/decorator/http.method/definition/router.definition.interface";
import { constructor } from "tsyringe/dist/typings/types";
import { BaseMiddleware, MotherController } from "@/lib/common";
import { globalContainer } from "@/lib/common/di";
import { Mutex } from "async-mutex";
import { requiredMetadataKeyParam } from "@/lib/decorator";
import { Type, iParam } from "@/lib/decorator/parameter/definition/params.interface";
import { convertToObjectDTO } from "./utils/validate";
class App {
  private server: any;
  private io: Server;
  private express: Application;
  private port: number;
  private static _instance = new App();
  private constructor() {
    this.express = express();
    this.port = Number(process.env.PORT) || 3000;
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
    RegisterModuleController((new ModuleController() as any).controllers);
    this.initaliseDatabase();
    this.initaliseMiddleware();
    let controller: MotherController[] =
      globalContainer.resolveAll<MotherController>("controller");
    this.initaliseController(controller);
    this.initErrorHandler();
  }
  private initErrorHandler() {
    this.express.use(ErrorMiddleware);
  }
  private initaliseController(controllers: MotherController[]) {
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
        let middlewares: constructor<BaseMiddleware>[] =
          Reflect.getMetadata(
            "middlewares",
            (controller as any)[route.methodName]
          ) || [];
        let data: iParam[] = Reflect.getMetadata(requiredMetadataKeyParam, controller, route.methodName) || [];
        router[route.requestMethod](
          controller.pathMain + route.path,
          middlewareDecorator(middlewares),
          async (req: Request, res: Response, next: NextFunction) => {
            console.log("🚀 ~ file: main.application.ts ~ line 104 ~ App ~ initaliseController ~ data", data)
            let argsType: any[] = Reflect.getMetadata("design:paramtypes", controller, route.methodName);
            console.log("🚀 ~ App ~ routes.forEach ~ argsType:", argsType)
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
                      args.push(await convertToObjectDTO(argsType[_i], req.body[i.propertyKey]));
                    } else args.push(await convertToObjectDTO(argsType[_i], req.body));
                    break;
                  case Type.Params:
                    if (i.propertyKey) {
                      args.push(req.params[i.propertyKey]);
                    } else
                      args.push(req.params);
                    break;
                  case Type.Query:
                    if (i.propertyKey) {
                      args.push(req.query[i.propertyKey]);
                    } else
                      args.push(req.query);
                    break;
                  case Type.Headers:
                    if (i.propertyKey) {
                      args.push(req.headers[i.propertyKey]);
                    } else
                      args.push(req.headers);
                    break;
                }
              }
            }
            (controller as any)[route.methodName](...args);
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
  private initaliseMiddleware() {
    this.express.use(helmet());
    this.express.use(cors());
    this.express.use(morgan("dev"));
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: true }));
    this.express.use(express.static("public"));
    this.express.use(compression());
  }
  private initaliseDatabase() {
    globalContainer.register<Database>(Database, {
      useValue: new MySqlBuilder().initPool().build(),
    });
    globalContainer.register<DatabaseCache>(DatabaseCache, {
      useValue: new DatabaseCache(),
    });
  }
  public listen(): void {
    this.server.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}`);
    });
  }
  public static gI() {
    return App._instance;
  }
}
function middlewareDecorator(middlewares: constructor<BaseMiddleware>[]) {
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
function middlewareVirtual() {
  return (req: Request, res: Response, next: NextFunction) => {
    next();
  };
}
export default App;
