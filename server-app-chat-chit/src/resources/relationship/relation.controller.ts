import { MotherController } from "@/lib/base";

import { Server } from "socket.io";
import RelationService from "./relation.service";
import { NextFunction, Request, Response } from "express";
import { ResponseBody } from "@/utils/definition/http.response";
import HttpException from "@/utils/exceptions/http.exeception";
import MyException from "@/utils/exceptions/my.exception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import multer from "multer";
import isValidNumberVariable from "@/utils/extension/vailid_variable";
import { User } from "@/models/user.model";
import { BadRequestException, InternalServerError } from "@/utils/exceptions/badrequest.expception";
import { inject } from "tsyringe";
import { AuthorizeMiddleware } from "@/middleware/auth.middleware";
import { Controller, POST, UseMiddleware, GET, PATCH, DELETE } from "@/lib/decorator";

@Controller("/relationship")
export default class RelationshipController extends MotherController {

    constructor(@inject(Server) io: Server, @inject(RelationService) private relationService: RelationService) {
        super(io);
    }

    @POST("/:iduser/block")
    @UseMiddleware(AuthorizeMiddleware)
    private async blockUser(req: Request, res: Response, next: NextFunction) {
        try {
            const iduser = Number(req.headers.iduser)
            const iduserBlock = Number(req.params.iduser)
            if (isValidNumberVariable(iduserBlock) && iduser !== iduserBlock) {
                let data = await this.relationService.blockUser(iduser, iduserBlock)
                res.status(HttpStatus.OK).send(
                    new ResponseBody(
                        true,
                        "",
                        data
                    )
                )
            } else next(new BadRequestException("Agurment is invalid"))
        } catch (error: any) {
            console.log("🚀 ~ file: relation.controller.ts:49 ~ FriendController ~ error:", error)
            if (error instanceof HttpException) {
                next(error)
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
    @GET("/friends")
    @UseMiddleware(AuthorizeMiddleware)
    private async getAllFriend(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const iduser = Number(req.headers.iduser)
            const cursor = Number(req.query.cursor)
            const limit = Number(req.query.limit)
            if (isValidNumberVariable(cursor) && isValidNumberVariable(limit)) {
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
    }
    @GET("/invites/me")
    @UseMiddleware(AuthorizeMiddleware)
    private async getAllInvite(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
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
                return
            }
            next(new InternalServerError("An error occurred, please try again later."))
        }
    };
    @PATCH("/:iduser/unfriend")
    @UseMiddleware(AuthorizeMiddleware)
    private async unFriend(req: Request, res: Response, next: NextFunction) {
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
    @POST("/invites/me/:userId")
    @UseMiddleware(AuthorizeMiddleware)
    private async inviteToBecomeFriend(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            let iduser = Number(req.headers["iduser"]);
            let idreceiver = Number(req.params.userId)
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
    @POST("/accept")
    @UseMiddleware(AuthorizeMiddleware)
    private async acceptInviteFriend(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const iduser: number = Number(req.headers.iduser)
            const idInvite: number = Number(req.body.idInvite)
            if (isValidNumberVariable(idInvite)) {
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
    @DELETE("/invites/:invite")
    @UseMiddleware(AuthorizeMiddleware)
    private async deleteInvite(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const iduser = Number(req.headers.iduser)
            const idInvite = Number(req.params.invite)
            if (isValidNumberVariable(idInvite)) {
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
    @DELETE("/invites/me/:invite/")
    @UseMiddleware(AuthorizeMiddleware)
    private async deleteMySentInvite(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
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
    @GET("/:iduser/relation")
    @UseMiddleware(AuthorizeMiddleware)
    private async getRelationship(req: Request, res: Response, next: NextFunction) {
        try {
            const iduser = Number(req.headers.iduser)
            const iduserWGet = Number(req.params.iduser)
            if (isValidNumberVariable(iduserWGet)) {
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
    @GET("/friends/online")
    @UseMiddleware(AuthorizeMiddleware)
    private async getFriendOnline(req: Request, res: Response, next: NextFunction) {
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
