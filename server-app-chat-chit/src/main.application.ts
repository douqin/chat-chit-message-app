import { HttpStatus } from './utils/extension/httpstatus.exception';
import express, { Application, NextFunction, Response, Request } from "express";
import MotherController from "@/utils/interface/controller.interface";
import ErrorMiddleware from "@/middleware/error.midleware";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import SocketBuilder from './config/socketio/socket.builder'
import { ResponseBody } from './utils/definition/http.response';
import { Database, MySqlBuilder, iDatabase } from './config/database/database';
import { DatabaseCache } from './config/database/redis';
import { container } from 'tsyringe';
import { RegisterModuleController } from './utils/extension/controller.container.module';
import ModuleController from './resources/module.controller';
import { IRouteDefinition } from './utils/decorator/http.method/router.definition.interface';
import multer from 'multer';
import { constructor } from 'tsyringe/dist/typings/types';
import { BaseMiddleware } from './middleware/base.middleware';
class App {
    private server: any
    private io: Server
    private express: Application
    private port: number
    private static _instance = new App();
    private constructor() {
        this.express = express()
        this.port = Number(process.env.PORT) || 3000
        this.server = require("http").createServer(this.express);
        this.io = new SocketBuilder(require("socket.io")(this.server, {
            cors: {
                origin: '*',
                credentials: true
            }
        }))
            .initalizeMiddleware()
            .initalizeServer()
            .build()
        container.register<Server>(Server, { useValue: this.io })
        RegisterModuleController((new ModuleController() as any).controllers);
        this.initaliseDatabase()
        this.initaliseMiddleware()
        let controller: MotherController[] = container.resolveAll<MotherController>("controller")
        this.initaliseController(controller)
        this.initErrorHandler()
    }
    private initErrorHandler() {
        this.express.use(ErrorMiddleware);
    }
    private initaliseController(controllers: MotherController[]) {
        controllers.forEach((controller: MotherController) => {

            // controller.initRouter();
            // this.express.use(controller.pathMain, controller.router);

            // Tương tự, lất ra tất cả các `routes`
            const routes: IRouteDefinition[] = Reflect.getMetadata('routes', controller) || [];
            console.log("🚀 ~ App ~ controllers.forEach ~ routes:", routes)

            // Duyệt qua tất cả các routes và đăng ký chúng với express

            routes.forEach((route) => {
                const multerX = Reflect.getMetadata('multer', (controller as any)[route.methodName]) || undefined;
                let middlewares: constructor<BaseMiddleware>[] = Reflect.getMetadata('middlewares', (controller as any)[route.methodName]) || []
                if (multerX)
                    this.express[route.requestMethod](controller.pathMain + route.path, multerX, middlewareDecorator(middlewares), (req: Request, res: Response, next: NextFunction) => {
                        (controller as any)[route.methodName](req, res, next);
                    });
                else
                    this.express[route.requestMethod](controller.pathMain + route.path, middlewareDecorator(middlewares), (req: Request, res: Response, next: NextFunction) => {
                        // Thực thi phương thức xử lý request, truyền vào là request và response
                        (controller as any)[route.methodName](req, res, next);
                    });
            });

        });
        this.express.use((
            req,
            res,
        ) => {
            res.status(HttpStatus.NOT_FOUND).send(new ResponseBody(
                false,
                "Không tìm thấy trang bạn yêu cầu",
                {
                    "url": req.url
                }
            ))
        })
    }
    private initaliseMiddleware() {
        this.express.use(helmet());
        this.express.use(cors());
        this.express.use(morgan('dev'));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: true }));
        this.express.use(express.static('public'));
        this.express.use(compression());
    }
    private initaliseDatabase() {
        container.register<Database>(Database, { useValue: new MySqlBuilder().initPool().build() })
        DatabaseCache.getInstance()
    }
    public listen(): void {
        this.server.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}`)
        });
    }
    public static gI() {
        return App._instance;
    }
}
export default App;
function middlewareDecorator(middlewares: constructor<BaseMiddleware>[]) {
    let _middlewares = middlewares;
    return (req: Request, res: Response, next: NextFunction) => {
        console.log("🚀 ~ a ~ middlewares:", middlewares)
        if (middlewares.length == 0) {
            next()
            return
        }
        for (let i = 0; i < _middlewares.length; i++) {
            let a = container.resolve(_middlewares[i]).use(req, res, next)
        }
    }
    // return a
}