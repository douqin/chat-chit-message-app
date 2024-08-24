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
  ControllerHandler,
  HttpException,
  InternalServerError,
  MiddlewareHandler,
  MotherController,
} from "@/lib/common";
import { globalContainer } from "@/lib/common/di";
import { Controller, IRouteDefinition, requiredMetadataKeyParam } from "@/lib/decorator";
import {
  TypeParam,
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
    this.express.use(MiddlewareHandler.responseSentMiddleware);
  }
  public initializeController(controllers: MotherController[]) {
    this.controllers = controllers;
  }
  public startAllControllers() {
    let controllers = this.controllers;
    controllers.forEach((controller: MotherController) => {
      ControllerHandler.handle(this.router, controller);
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
    this.server.listen(port, () => {
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
    builder.initializeBaseSocket(this.io).initializeMiddleware().initializeServer().reBuild();
  }
}

export default App;
