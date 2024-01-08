import { HttpStatus } from './utils/extension/httpstatus.exception';
import express, { Application } from "express";
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
import AuthController from './resources/auth/auth.controller';
import GroupController from './resources/group/group.controller';
import MeController from './resources/me/me.controller';
import MessageController from './resources/messaging/message.controller';
import TestController from './resources/test/test.controller';
import StoryController from './resources/story/story.controller';
import FriendController from './resources/relationship/relation.controller';
import { Database, MySqlBuilder, iDatabase } from './config/database/database';
import UserController from './resources/user/user.controller';
import { DatabaseCache } from './config/database/redis';
import { container } from 'tsyringe';
import { RegisterModuleController } from './utils/extension/controller.container.module';
import controllers from './resources/module.controller';
import ModuleController from './resources/module.controller';
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
        this.express.all('*', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
            res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
        });
        controllers.forEach((controller: MotherController) => {
            controller.initRouter();
            this.express.use(controller.pathMain, controller.router);
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
        this.express.use(cors({
            origin: ['http://localhost:3000', 'http://localhost:3003'],
            credentials: true
        }));
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
