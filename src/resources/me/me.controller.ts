import MotherController from "@/utils/interface/controller.interface";
import UserService from "./me.service";
import { Server } from "socket.io";
import { NextFunction, Request, Response } from "express";

export default class UserController extends MotherController {
    private userSerivce: UserService
    constructor(io: Server) {
        super(io)
        this.userSerivce = new UserService()
    }
    initRouter(): MotherController {
        this.router.get(
            "/me/profile",
            this.getMyProfile
        )
        this.router.patch(
            "/me/profile",
            this.updateMyprofile
        )
        this.router.patch(
            "/me/password",
            this.changePassword
        )
        return this
    }
    private getMyProfile = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

    }
    private changePassword = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

    }
    private updateMyprofile = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

    }
}