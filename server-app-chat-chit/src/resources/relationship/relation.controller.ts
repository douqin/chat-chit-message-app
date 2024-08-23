import { BadRequestException, HttpException, HttpStatus, MotherController } from "@/lib/common";
import { Server } from "socket.io";
import RelationService from "./relation.service";
import { ResponseBody } from "@/utils/definition/http.response";
import { isValidNumberVariable } from "@/utils/validate";
import { User } from "@/models/user.model";
import { inject } from "tsyringe";
import { AuthorizeGuard } from "@/middleware/auth.middleware";
import { Controller, POST, UseGuard, GET, PATCH, DELETE, Headers, Params, Query } from "@/lib/decorator";
import { PagingReq } from "@/utils/paging/paging.data";

@Controller("/relationship")
export default class RelationshipController extends MotherController {

    constructor(@inject(Server) io: Server, @inject(RelationService) private relationService: RelationService) {
        super(io);
    }

    @PATCH("/:userId/block")
    @UseGuard(AuthorizeGuard)
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
        } else throw (new BadRequestException("Argument is invalid"))
    }
    @PATCH("/:userId/un-block")
    @UseGuard(AuthorizeGuard)
    private async unBlockUser(@Headers("userId") userId: number, @Params("userId") unBlockingUserId: number) {
        if (isValidNumberVariable(unBlockingUserId) && userId !== unBlockingUserId) {
            let data = await this.relationService.unBlockUser(userId, unBlockingUserId)
            return (
                new ResponseBody(
                    true,
                    "",
                    data
                )
            )
        } else throw (new BadRequestException("Argument is invalid"))
    }
    @GET("/friends")
    @UseGuard(AuthorizeGuard)
    private async getAllFriend(
        @Headers("userId") userId: number,
        @Query("cursor") cursor: number,
        @Query("limit") limit: number
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
        } 
        console.log("🚀 ~ RelationshipController ~ getAllFriend: ", cursor, limit)
        throw (new BadRequestException("Argument is invalid"))
    }
    @GET("/invites/me")
    @UseGuard(AuthorizeGuard)
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
    @UseGuard(AuthorizeGuard)
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
    @UseGuard(AuthorizeGuard)
    private async inviteToBecomeFriend(
        @Headers("userId") userId: number,
        @Params("userId") idreceiver: number
    ) {
        if (idreceiver) {
            if (userId === idreceiver) throw (new BadRequestException("Argument is invalid"))
            await this.relationService.inviteToBecomeFriend(userId, idreceiver);
            return (new ResponseBody(
                true,
                "",
                {}
            ))
        } else throw (
            new HttpException(
                HttpStatus.BAD_REQUEST,
                "Error Argument"
            )
        )
    };
    @POST("/accept")
    @UseGuard(AuthorizeGuard)
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
        throw (new BadRequestException("Argument is invalid"))
    };
    @DELETE("/invites/:invite")
    @UseGuard(AuthorizeGuard)
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
        throw (new BadRequestException("Argument is invalid"))

    };
    @DELETE("/invites/me/:invite/")
    @UseGuard(AuthorizeGuard)
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
        throw (new BadRequestException("Argument is invalid"))
    };
    @GET("/:userId/relation")
    @UseGuard(AuthorizeGuard)
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
        throw (new BadRequestException("Argument is invalid"))
    }
    @GET("/friends/online")
    @UseGuard(AuthorizeGuard)
    private async getFriendOnline(@Headers("userId") userId: number) {
        const data: User[] = await this.relationService.getFriendOnline(userId)
        return new ResponseBody(
            true,
            "",
            {}
        )
    }

    @GET("/:userId/friends/common")
    @UseGuard(AuthorizeGuard)
    private async getFriendsCommonBetWeenUser(
        @Headers("userId") userId: number,
        @Params("userId") userIdWGet: number,
        @Query("cursor") cursor: number,
        @Query("limit") limit: number
    ) {
        console.log("🚀 ~ RelationshipController ~ limit:", limit)
        console.log("🚀 ~ RelationshipController ~ userId:", userId)
        console.log("🚀 ~ RelationshipController ~ userIdWGet:", userIdWGet)
        console.log("🚀 ~ RelationshipController ~ cursor:", cursor)
        if (isValidNumberVariable(cursor) && isValidNumberVariable(limit)) {
            const data = await this.relationService.getFriendsCommonBetWeenUser(userId, userIdWGet, cursor, limit)
            return new ResponseBody(
                true,
                "",
                data
            )
        }
        throw (new BadRequestException("Argument is invalid"))
    }
}

