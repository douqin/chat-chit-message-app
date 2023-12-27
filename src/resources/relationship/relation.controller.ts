import MotherController from "@/utils/interface/controller.interface";
import { Server } from "socket.io";
import RelationService from "./relation.service";
import Controller from "@/utils/decorator/controller";
import { NextFunction, Request, Response } from "express";
import AuthMiddleware from "@/middleware/auth.middleware";
import { ResponseBody } from "@/utils/definition/http.response";
import HttpException from "@/utils/exceptions/http.exeception";
import MyException from "@/utils/exceptions/my.exception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import { RelationServiceBehavior } from "./interface/relation.service.interface";
import multer from "multer";
import validVariable from "@/utils/extension/vailid_variable";
import { User } from "@/models/user.model";
import { BadRequestException, InternalServerError } from "@/utils/exceptions/badrequest.expception";
import { inject } from "tsyringe";

@Controller("/relationship")
export default class RelationshipController extends MotherController {

    constructor(@inject(Server) io: Server, @inject(RelationService) private relationService: RelationService) {
        super(io);
    }
    initRouter(): MotherController {
        this.router.get("/friends", AuthMiddleware.auth, this.getAllFriend);
        this.router.get("/invites", AuthMiddleware.auth, this.getAllInvite)
        this.router.patch("/:iduser/unfriend", AuthMiddleware.auth, multer().none(), this.unFriend);
        this.router.post("/invites", AuthMiddleware.auth, multer().none(), this.inviteToBecomeFriend)
        this.router.post("/accept", AuthMiddleware.auth, multer().none(), this.acceptInviteFriend);
        this.router.delete("/invites/:invite", AuthMiddleware.auth, multer().none(), this.deleteInvite)
        this.router.delete("/invites", AuthMiddleware.auth, multer().none(), this.deleteMySentInvite)
        this.router.get("/:iduser/relation", AuthMiddleware.auth, this.getRelationship)
        this.router.get("/friends/online", AuthMiddleware.auth, this.getFriendOnline)
        return this;
    }
    private getAllFriend = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const iduser = Number(req.headers.iduser)
            const cursor = Number(req.query.cursor)
            const limit = Number(req.query.limit)
            if (validVariable(cursor) && validVariable(limit)) {
                let data = await this.relationService.getAllFriend(iduser, cursor, limit)
                res.status(HttpStatus.OK).send(
                    new ResponseBody(
                        true,
                        "",
                        data
                    )
                )
            } else res.status(HttpStatus.OK).send(
                new ResponseBody(
                    true,
                    "",
                    []
                )
            )
        } catch (error: any) {
            console.log("🚀 ~ file: relation.controller.ts:49 ~ FriendController ~ error:", error)
            if (error instanceof MyException) {
                next(error)
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }
    };
    private getAllInvite = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const cursor = Number(req.query.cursor)
            const limit = Number(req.query.limit)
            const iduser = Number(req.headers.iduser)
            let data = await this.relationService.getAllInvite(iduser, cursor, limit)
            res.status(HttpStatus.OK).send(
                new ResponseBody(
                    true,
                    "",
                    data
                )
            )
        } catch (error: any) {
            console.log(error)
            if (error instanceof MyException) {
                next(new HttpException(error.status, error.message))
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }
    };
    private unFriend = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers.iduser)
            const iduserUnFriend = Number(req.params.iduser)
            let data = await this.relationService.unFriend(iduser, iduserUnFriend)
            res.status(HttpStatus.OK).send(
                new ResponseBody(
                    true,
                    "",
                    data
                )
            )
        } catch (error: any) {
            if (error instanceof HttpException) {
                next(error)
                return
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }
    };
    private inviteToBecomeFriend = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            let iduser = Number(req.headers["iduser"]);
            let idreceiver = Number(req.body.receiver)
            if (idreceiver) {
                if (iduser === idreceiver) next(new BadRequestException("Agurment is invalid"))
                await this.relationService.inviteToBecomeFriend(iduser, idreceiver);
                res.status(HttpStatus.OK).send(new ResponseBody(
                    true,
                    "",
                    {}
                ))
            } else next(
                new HttpException(
                    HttpStatus.BAD_REQUEST,
                    "Error Agurment"
                )
            )
        }
        catch (e) {
            console.log("🚀 ~ file: relation.controller.ts:118 ~ FriendController ~ e:", e)
            if (e instanceof HttpException) {
                next(
                    e
                )
            }
            next(
                new HttpException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Có lỗi xảy ra vui lòng thử lại sau"
                )
            );
        }
    };
    private acceptInviteFriend = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const iduser: number = Number(req.headers.iduser)
            const idInvite: number = Number(req.body.idInvite)
            if (validVariable(idInvite)) {
                await this.relationService.acceptInviteFriend(iduser, idInvite)
                res.status(HttpStatus.OK).send(new ResponseBody(
                    true,
                    "",
                    {}
                ))
                return
            }
            next(new BadRequestException("Agurment is invalid"))
        }
        catch (e) {
            console.log("🚀 ~ file: relation.controller.ts:156 ~ FriendController ~ e:", e)
            if (e instanceof MyException) {
                next(
                    new HttpException(
                        HttpStatus.FORBIDDEN,
                        e.message
                    )
                )
            }
            next(
                new HttpException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Có lỗi xảy ra vui lòng thử lại sau"
                )
            );
        }
    };
    private deleteInvite = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const iduser = Number(req.headers.iduser)
            const idInvite = Number(req.params.invite)
            if (validVariable(idInvite)) {
                const data = await this.relationService.deleteInvite(iduser, idInvite)
                res.status(HttpStatus.OK).send(new ResponseBody(
                    data,
                    "",
                    {}
                ))
                return
            }
            next(new BadRequestException("Agurment is invalid"))
        }
        catch (e) {
            if (e instanceof HttpException) {
                next(
                    e
                )
            }
            next(
                new HttpException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Có lỗi xảy ra vui lòng thử lại sau"
                )
            );
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
            next(new BadRequestException("Agurment is invalid"))
        }
        catch (e) {

        }
    };
    private getRelationship = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers.iduser)
            const iduserWGet = Number(req.params.iduser)
            if (validVariable(iduserWGet)) {
                const data = await this.relationService.getRelationship(iduser, iduserWGet)
                res.status(HttpStatus.OK).send(new ResponseBody(
                    true,
                    "",
                    {
                        relationship: data
                    }
                ))
                return
            }
            next(new BadRequestException("Agurment is invalid"))
        }
        catch (e) {
            if (e instanceof HttpException) {
                next(e)
            }
            else next(new InternalServerError("An error occurred, please try again later."))
        }
    } 
    private getFriendOnline = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers.iduser)
            const data: User[] = await this.relationService.getFriendOnline(iduser)
            return new ResponseBody(
                true,
                "",
                {}
            )
        }
        catch (e) {

        }
    }
}
