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
import { Database, MySqlBuilder } from './config/database/database';
import UserController from './resources/user/user.controller';
import { DatabaseCache } from './config/database/redis';
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
        this.initaliseDatabase()
        this.initaliseMiddleware()
        let controller: MotherController[] = [
            new AuthController(this.io).initRouter(),
            new GroupController(this.io).initRouter(),
            new MessageController(this.io).initRouter(),
            new MeController(this.io).initRouter(),
            new TestController(this.io).initRouter(),
            new StoryController(this.io).initRouter(),
            new FriendController(this.io).initRouter(),
            new UserController(this.io).initRouter()
        ]
        this.initaliseController(controller) 
        this.initErrorHandler()
    }
    private initErrorHandler() {
        this.express.use(ErrorMiddleware);
    }
    private initaliseController(controllers: MotherController[]) {
        controllers.forEach((controller: MotherController) => {
            this.express.use('', controller.router);
        });
        this.express.use((
            req,
            res,
            next
        ) => {
            res.status(HttpStatus.NOT_FOUND).send(new ResponseBody(
                false,
                "Không tìm thấy trang bạn yêu cầu",
                {
                    "url" : req.url
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
        new MySqlBuilder().initPool().build();
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
