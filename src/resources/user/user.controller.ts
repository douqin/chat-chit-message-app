import MotherController from "@/utils/interface/controller.interface";
import UserService from "./user.service";
import { Server } from "socket.io";
import { NextFunction, Request, Response } from "express";

export default class UserController extends MotherController {
    private userSerivce: UserService
    constructor(io: Server) {
        super(io)
        this.userSerivce = new UserService()
    }
    initRouter(): MotherController {
        this.router.post("/user/searchuser/:phone", this.searchUser)
        return this
    }
    private searchUser = (req: Request, res: Response, next: NextFunction) => {

    }
}