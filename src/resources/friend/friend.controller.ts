
import MotherController from "@/utils/interface/controller.interface";
import { Server } from "socket.io";
import FriendService from "./friend.service";
import Controller from "@/utils/decorator/decorator";
import { NextFunction, Request, Response } from "express";
import AuthMiddleware from "@/middleware/auth.middleware";

@Controller("/friends")
export default class FriendController extends MotherController {
    friendService: FriendService
    constructor(io: Server) {
        super(io);
        this.friendService = new FriendService()
    }
    initRouter(): MotherController {
        this.router.get("/friends",
            AuthMiddleware.auth,
            this.getAllFriend
        )
        this.router.get("/friends/invites",
            AuthMiddleware.auth,

            this.getAllInvite
        )
        this.router.patch("/friends/unfriend",
            AuthMiddleware.auth,
            this.unFriend
        )
        this.router.post("/friends/invites",
            AuthMiddleware.auth,
            this.inviteFriend
        )
        this.router.post("/friends/accept",
            AuthMiddleware.auth,
            this.acceptInvite
        )
        this.router.delete("/friends/me/invites/",
            AuthMiddleware.auth,
            this.deleteMyInvite
        )
        this.router.delete("/friends/invites",
            AuthMiddleware.auth,
            this.deleteMySentInvite
        )
        return this;
    }
    private getAllFriend = (req: Request, res: Response, next: NextFunction) => {

    }
    private getAllInvite = (req: Request, res: Response, next: NextFunction) => {

    }
    private unFriend = (req: Request, res: Response, next: NextFunction) => {

    }
    private inviteFriend = async (req: Request, res: Response, next: NextFunction) => {
        let iduser = Number(req.headers['iduser'])
        let { receiver } = req.body
        await this.friendService.inviteFriend(iduser,Number(receiver))
    }
    private acceptInvite = (req: Request, res: Response, next: NextFunction) => {

    }
    private deleteMyInvite = (req: Request, res: Response, next: NextFunction) => {

    }
    private deleteMySentInvite = (req: Request, res: Response, next: NextFunction) => {

    }
}