import MotherController from "@/utils/interface/controller.interface";
import { Server } from "socket.io";
import FriendService from "./friend.service";
import Controller from "@/utils/decorator/decorator";
import { NextFunction, Request, Response } from "express";

@Controller("/friends")
export default class FriendController extends MotherController {
    friendService: FriendService
    constructor(io: Server) {
        super(io);
        this.friendService = new FriendService()
    }
    initRouter(): MotherController {
        this.router.get("/friends",
            this.getAllFriend
        )
        this.router.get("/friends/invites",
            this.getAllInvite
        )
        this.router.patch("/friends/unfriend",
            this.unFriend
        )
        this.router.post("/friends/invites",
            this.inviteFriend
        )
        this.router.post("/friends/accept",
            this.acceptInvite
        )
        this.router.get("/friends/suggest",
            this.getMySuggestFriend
        )
        this.router.delete("/friends/me/invites/",
            this.deleteMyInvite
        )
        this.router.delete("/friends/invites",
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
    private inviteFriend = (req: Request, res: Response, next: NextFunction) => {

    }
    private acceptInvite = (req: Request, res: Response, next: NextFunction) => {

    }
    private getMySuggestFriend = (req: Request, res: Response, next: NextFunction) => {

    }
    private deleteMyInvite = (req: Request, res: Response, next: NextFunction) => {

    }
    private deleteMySentInvite = (req: Request, res: Response, next: NextFunction) => {

    }


}