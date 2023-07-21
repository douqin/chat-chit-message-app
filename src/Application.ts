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
import { MySqlBuilder } from "@/config/sql/mysql";
import LogoutController from "@/resources/auth/loguot/loguot.controller";
import GroupController from "@/resources/group/group.controller";
import LoginController from "./resources/auth/login/login.controller";
import MessageController from "@/resources/messaging/message.controller";
import RegisterController from "./resources/auth/register/register.controller";
import AuthMiddleware from "./middleware/auth.middleware";
import SocketMiddleware from "./middleware/socket.middleware";
class App {
    private server: any
    private io: Server
    private express: Application
    private port: number
    constructor(port: number) {
        this.express = express()
        this.port = port
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
            new LoginController(this.io).initRouter(),
            new LogoutController(this.io).initRouter(),
            new GroupController(this.io).initRouter(),
            new MessageController(this.io).initRouter(),
            new RegisterController(this.io).initRouter()
        ]
        this.initaliseController(controller);
        this.initErrorHandler();
    }
    private initErrorHandler() {
        this.express.use(ErrorMiddleware);
    }
    private initaliseController(controllers: MotherController[]) {
        controllers.forEach((controller: MotherController) => {
            this.express.use('', controller.router);
        });
    }
    private initaliseMiddleware() {
        this.io.use(SocketMiddleware.validateIncomingConnect)
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
    }
    public listen(): void {
        this.server.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}`)
        });
    }
}
export default App;
