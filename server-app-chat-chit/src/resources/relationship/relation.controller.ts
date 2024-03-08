import { MotherController } from "@/lib/common";
import { Server } from "socket.io";
import RelationService from "./relation.service";
import { NextFunction, Request, Response } from "express";
import { ResponseBody } from "@/utils/definition/http.response";
import HttpException from "@/utils/exceptions/http.exeception";
import MyException from "@/utils/exceptions/my.exception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import { isValidNumberVariable } from "@/utils/validate";
import { User } from "@/models/user.model";
import { BadRequestException, InternalServerError } from "@/utils/exceptions/badrequest.expception";
import { inject } from "tsyringe";
import { AuthorizeGuard } from "@/middleware/auth.middleware";
import { Controller, POST, UseMiddleware, GET, PATCH, DELETE, Headers, Params } from "@/lib/decorator";
import { PagingReq } from "@/utils/paging/paging.data";

@Controller("/relationship")
export default class RelationshipController extends MotherController {

    constructor(@inject(Server) io: Server, @inject(RelationService) private relationService: RelationService) {
        super(io);
    }

    @POST("/:userId/block")
    @UseMiddleware(AuthorizeGuard)
    private async blockUser(@Headers("userId") userId: number, @Params("userId") userIdBlock: number) {
        if (isValidNumberVariable(userIdBlock) && userId !== userIdBlock) {
            let data = await this.relationService.blockUser(userId, userIdBlock)
            return (
                new ResponseBody(
                    true,
                    "",
                    data
                )
            )
        } else throw (new BadRequestException("Agurment is invalid"))
    }
    @GET("/friends")
    @UseMiddleware(AuthorizeGuard)
    private async getAllFriend(
        @Headers("userId") userId: number,
        @Params("cursor") cursor: number,
        @Params("limit") limit: number
    ) {
        if (isValidNumberVariable(cursor) && isValidNumberVariable(limit)) {
            let data = await this.relationService.getAllFriend(userId, cursor, limit)
            return (
                new ResponseBody(
                    true,
                    "",
                    data
                )
            )
        } else return (
            new ResponseBody(
                true,
                "",
                []
            )
        )
    }
    @GET("/invites/me")
    @UseMiddleware(AuthorizeGuard)
    private async getAllInvite(
        @Headers("userId") userId: number,
        @Params() paging: PagingReq
    ) {
        let data = await this.relationService.getAllInvite(userId, paging.cursor, paging.limit)
        return (
            new ResponseBody(
                true,
                "",
                data
            )
        )
    };
    @PATCH("/:userId/unfriend")
    @UseMiddleware(AuthorizeGuard)
    private async unFriend(
        @Headers("userId") userId: number,
        @Params("userId") userIdUnFriend: number
    ) {
        let data = await this.relationService.unFriend(userId, userIdUnFriend)
        return (
            new ResponseBody(
                true,
                "",
                data
            )
        )
    };
    @POST("/invites/me/:userId")
    @UseMiddleware(AuthorizeGuard)
    private async inviteToBecomeFriend(
        @Headers("userId") userId: number,
        @Params("userId") idreceiver: number
    ) {
        if (idreceiver) {
            if (userId === idreceiver) throw (new BadRequestException("Agurment is invalid"))
            await this.relationService.inviteToBecomeFriend(userId, idreceiver);
            return (new ResponseBody(
                true,
                "",
                {}
            ))
        } else throw (
            new HttpException(
                HttpStatus.BAD_REQUEST,
                "Error Agurment"
            )
        )
    };
    @POST("/accept")
    @UseMiddleware(AuthorizeGuard)
    private async acceptInviteFriend(
        @Headers("userId") userId: number,
        @Params("idInvite") idInvite: number
    ) {
        if (isValidNumberVariable(idInvite)) {
            await this.relationService.acceptInviteFriend(userId, idInvite)
            return (new ResponseBody(
                true,
                "",
                {}
            ))
        }
        throw (new BadRequestException("Agurment is invalid"))
    };
    @DELETE("/invites/:invite")
    @UseMiddleware(AuthorizeGuard)
    private async deleteInvite(
        @Headers("userId") userId: number,
        @Params("invite") idInvite: number
    ) {
        if (isValidNumberVariable(idInvite)) {
            const data = await this.relationService.deleteInvite(userId, idInvite)
            return (new ResponseBody(
                data,
                "",
                {}
            ))
        }
        throw (new BadRequestException("Agurment is invalid"))

    };
    @DELETE("/invites/me/:invite/")
    @UseMiddleware(AuthorizeGuard)
    private async deleteMySentInvite(
        @Headers("userId") userId: number,
        @Params("invite") idInvite: number
    ) {
        if (idInvite) {
            const data = await this.relationService.deleteMySentInvite(userId, idInvite)
            return new ResponseBody(
                data,
                "",
                {}
            )
        }
        throw (new BadRequestException("Agurment is invalid"))
    };
    @GET("/:userId/relation")
    @UseMiddleware(AuthorizeGuard)
    private async getRelationship(@Headers("userId") userId: number, @Params("userId") userIdWGet: number) {
        if (isValidNumberVariable(userIdWGet)) {
            const data = await this.relationService.getRelationship(userId, userIdWGet)
            return (new ResponseBody(
                true,
                "",
                {
                    relationship: data
                }
            ))
        }
        throw (new BadRequestException("Agurment is invalid"))
    }
    @GET("/friends/online")
    @UseMiddleware(AuthorizeGuard)
    private async getFriendOnline(@Headers("userId") userId: number) {
        const data: User[] = await this.relationService.getFriendOnline(userId)
        return new ResponseBody(
            true,
            "",
            {}
        )
    }
}

