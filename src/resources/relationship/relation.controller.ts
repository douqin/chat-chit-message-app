import MotherController from "@/utils/interface/controller.interface";
import { Server } from "socket.io";
import RelationService from "./relation.service";
import Controller from "@/utils/decorator/decorator";
import { NextFunction, Request, Response } from "express";
import AuthMiddleware from "@/middleware/auth.middleware";
import { ResponseBody } from "@/utils/definition/http.response";
import HttpException from "@/utils/exceptions/http.exeception";
import MyException from "@/utils/exceptions/my.exception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import { RelationServiceBehavior } from "./interface/relation.service.interface";

@Controller("/relationship")
export default class FriendController extends MotherController {
    relationService: RelationServiceBehavior;
    constructor(io: Server) {
        super(io);
        this.relationService = new RelationService();
    }
    initRouter(): MotherController {
        this.router.get("/relationship/friends", AuthMiddleware.auth, this.getAllFriend);
        this.router.get(
            "/relationship/invites",
            AuthMiddleware.auth,
            this.getAllInvite
        )
        this.router.patch("/relationship/unfriend", AuthMiddleware.auth, this.unFriend);
        this.router.post(
            "/relationship/invites",
            AuthMiddleware.auth,
            this.inviteFriend
        )
        this.router.post("/relationship/accept", AuthMiddleware.auth, this.acceptInviteFriend);
        this.router.delete(
            "/relationship/me/invites/",
            AuthMiddleware.auth,
            this.deleteInvite
        )
        this.router.delete(
            "/relationship/invites",
            AuthMiddleware.auth,
            this.deleteMySentInvite
        )
        this.router.get(
            "/relationship/:iduser/relation",
            this.getRelationship
        )
        return this;
    }
    private getAllFriend = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const iduser = Number(req.headers.iduser)
            let data = await this.relationService.getAllFriend(iduser)
            res.status(HttpStatus.OK).send(
                new ResponseBody(
                    true,
                    "",
                    data
                )
            )
        } catch (error: any) {
            if (error instanceof MyException) {
                next(new HttpException(HttpStatus.BAD_REQUEST, error.message))
            }
            next(new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    };
    private getAllInvite = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const iduser = Number(req.headers.iduser)
            let data = await this.relationService.getAllInvite(iduser)
            res.status(HttpStatus.OK).send(
                new ResponseBody(
                    true,
                    "",
                    data
                )
            )
        } catch (error: any) {
            if (error instanceof MyException) {
                next(new HttpException(HttpStatus.BAD_REQUEST, error.message))
            }
            next(new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    };
    private unFriend = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers.iduser)
            const iduserUnFriend = Number(req.body)
            let data = await this.relationService.unFriend(iduser, iduserUnFriend)
            res.status(HttpStatus.OK).send(
                new ResponseBody(
                    true,
                    "",
                    data
                )
            )
        } catch (error: any) {
            if (error instanceof MyException) {
                next(new HttpException(HttpStatus.BAD_REQUEST, error.message))
            }
            next(new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    };
    private inviteFriend = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        let iduser = Number(req.headers["iduser"]);
        let { receiver } = req.body;
        await this.relationService.inviteFriend(iduser, Number(receiver));
    };
    private acceptInviteFriend = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const iduser = Number(req.headers.iduser)
            const idInvite = Number(req.body.invite)
            if (idInvite) {
                const data = await this.relationService.acceptInviteFriend(iduser, idInvite)
                return new ResponseBody(
                    data,
                    "",
                    {}
                )
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Tham số không hợp lệ"))
        }
        catch (e) {

        }
    };
    private deleteInvite = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const iduser = Number(req.headers.iduser)
            const idInvite = Number(req.body.invite)
            if (idInvite) {
                const data = await this.relationService.deleteInvite(iduser, idInvite)
                return new ResponseBody(
                    data,
                    "",
                    {}
                )
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Tham số không hợp lệ"))
        }
        catch (e) {

        }
    };
    private deleteMySentInvite = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const iduser = Number(req.headers.iduser)
            const idInvite = Number(req.body.invite)
            if (idInvite) {
                const data = await this.relationService.deleteMySentInvite(iduser, idInvite)
                return new ResponseBody(
                    data,
                    "",
                    {}
                )
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Tham số không hợp lệ"))
        }
        catch (e) {

        }
    };
    private getRelationship = async (req: Request, res: Response, next: NextFunction) => {

    } //FIXME : 
}
