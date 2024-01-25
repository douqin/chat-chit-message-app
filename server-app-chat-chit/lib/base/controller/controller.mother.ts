import { Router } from "express";
import { Server } from "socket.io";

export abstract class MotherController {
    pathMain : string;
    io: Server;
    router: Router;
    constructor(io: Server) {
        this.pathMain = ""
        this.io = io
        this.router = Router()
    }
}