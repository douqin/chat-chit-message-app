import { MotherController } from "@/lib/common";

import { Server } from "socket.io";
import RelationService from "./relation.service";
import { NextFunction, Request, Response } from "express";
import { ResponseBody } from "@/utils/definition/http.response";
import HttpException from "@/utils/exceptions/http.exeception";
import MyException from "@/utils/exceptions/my.exception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import multer from "multer";
import { isValidNumberVariable } from "@/utils/validate";
import { User } from "@/models/user.model";
import { BadRequestException, InternalServerError } from "@/utils/exceptions/badrequest.expception";
import { inject } from "tsyringe";
import { AuthorizeGuard } from "@/middleware/auth.middleware";
import { Controller, POST, UseMiddleware, GET, PATCH, DELETE } from "@/lib/decorator";

@Controller("/relationship")
export default class RelationshipController extends MotherController {

    constructor(@inject(Server) io: Server, @inject(RelationService) private relationService: RelationService) {
        super(io);
    }

    @POST("/:userId/block")
    @UseMiddleware(AuthorizeGuard)
    private async blockUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.headers.userId)
            const userIdBlock = Number(req.params.userId)
            if (isValidNumberVariable(userIdBlock) && userId !== userIdBlock) {
                let data = await this.relationService.blockUser(userId, userIdBlock)
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
    @UseMiddleware(AuthorizeGuard)
    private async getAllFriend(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const userId = Number(req.headers.userId)
            const cursor = Number(req.query.cursor)
            const limit = Number(req.query.limit)
            if (isValidNumberVariable(cursor) && isValidNumberVariable(limit)) {
                let data = await this.relationService.getAllFriend(userId, cursor, limit)
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
    @UseMiddleware(AuthorizeGuard)
    private async getAllInvite(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const cursor = Number(req.query.cursor)
            const limit = Number(req.query.limit)
            const userId = Number(req.headers.userId)
            let data = await this.relationService.getAllInvite(userId, cursor, limit)
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
    @PATCH("/:userId/unfriend")
    @UseMiddleware(AuthorizeGuard)
    private async unFriend(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.headers.userId)
            const userIdUnFriend = Number(req.params.userId)
            let data = await this.relationService.unFriend(userId, userIdUnFriend)
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
    @UseMiddleware(AuthorizeGuard)
    private async inviteToBecomeFriend(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            let userId = Number(req.headers["userId"]);
            let idreceiver = Number(req.params.userId)
            if (idreceiver) {
                if (userId === idreceiver) next(new BadRequestException("Agurment is invalid"))
                await this.relationService.inviteToBecomeFriend(userId, idreceiver);
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
    @UseMiddleware(AuthorizeGuard)
    private async acceptInviteFriend(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const userId: number = Number(req.headers.userId)
            const idInvite: number = Number(req.body.idInvite)
            if (isValidNumberVariable(idInvite)) {
                await this.relationService.acceptInviteFriend(userId, idInvite)
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
    @UseMiddleware(AuthorizeGuard)
    private async deleteInvite(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const userId = Number(req.headers.userId)
            const idInvite = Number(req.params.invite)
            if (isValidNumberVariable(idInvite)) {
                const data = await this.relationService.deleteInvite(userId, idInvite)
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
    @UseMiddleware(AuthorizeGuard)
    private async deleteMySentInvite(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const userId = Number(req.headers.userId)
            const idInvite = Number(req.body.invite)
            if (idInvite) {
                const data = await this.relationService.deleteMySentInvite(userId, idInvite)
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
    @GET("/:userId/relation")
    @UseMiddleware(AuthorizeGuard)
    private async getRelationship(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.headers.userId)
            const userIdWGet = Number(req.params.userId)
            if (isValidNumberVariable(userIdWGet)) {
                const data = await this.relationService.getRelationship(userId, userIdWGet)
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
    @UseMiddleware(AuthorizeGuard)
    private async getFriendOnline(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.headers.userId)
            const data: User[] = await this.relationService.getFriendOnline(userId)
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
