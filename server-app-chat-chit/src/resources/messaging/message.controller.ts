import { BadRequestException, HttpException, HttpStatus, MotherController } from "@/lib/common";
import { NextFunction, Request, Response } from "express";
import { Server } from "socket.io";
import MessageService from "./message.service";
import multer from "multer";
import { ResponseBody } from "@/utils/definition/http.response";
import { AuthorizeGuard } from "@/middleware/auth.middleware";
import { isValidNumberVariable } from "@/utils/validate";
import { inject } from "tsyringe";
import { getRoomGroupIO } from "@/utils/extension/room.group";
import { EventMessageIO } from "./constant/event.io";
import { Controller, GET, UseGuard, POST, FileUpload, PATCH, Params, Query, Headers, Req, Body } from "@/lib/decorator";
import { deleteFile, getOptionDefaultForMulter } from "@/utils/extension/file.upload";
import { AuthorizeMember } from "@/middleware/member.middlerware";

@Controller("/message")
export default class MessageController extends MotherController {
    constructor(@inject(Server) io: Server, @inject(MessageService) private messageService: MessageService) {
        super(io);
    }


    @GET("/:groupId/")
    @UseGuard(AuthorizeGuard)
    @UseGuard(AuthorizeMember)
    private async getMessageFromGroup(
        @Params("groupId") groupId: number,
        @Query("limit") limit: number,
        @Query("cursor") cursor: number,
        @Headers("userId") userId: number
    ) {
        console.log("🚀 ~ file: message.controller.ts:72 ~ MessageController ~ privateasyncgetMessageFromGroup ~ groupId", groupId)
        if (isValidNumberVariable(groupId) && isValidNumberVariable(limit) && isValidNumberVariable(cursor)) {
            let data = await this.messageService.getAllMessageFromGroup(
                Number(groupId),
                userId, cursor, limit
            );
            return (new ResponseBody(
                true,
                "",
                data
            ));
        } else throw (
            new HttpException(
                HttpStatus.BAD_REQUEST,
                "Error Argument"
            )
        );

    };
    @POST("/:groupId/file")
    @UseGuard(AuthorizeGuard)
    @FileUpload(multer(getOptionDefaultForMulter('message')).array("files", 7))
    @UseGuard(AuthorizeMember)
    private async sendFileMessage(@Params("groupId") groupId: number, @Headers("userId") userId: number, @Req() req: Request) {
        if (isValidNumberVariable(groupId) && req.files) {
            const userId = Number(req.headers['userId'] as string)
            let data = await this.messageService.sendFileMessage(
                Number(groupId),
                userId,
                req.files as Express.Multer.File[]
            );
            if (req.file) {
                deleteFile(req.file.filename)
            }
            this.io
                .to(getRoomGroupIO(groupId))
                .emit(EventMessageIO.NEW_MESSAGE,
                    [data]
                )
            return (new ResponseBody(
                true,
                "OK",
                data
            ));
        }
        throw (
            new HttpException(
                HttpStatus.BAD_REQUEST,
                "File lỗi"
            )
        );
    };
    @POST("/:groupId/text")
    @UseGuard(AuthorizeGuard)
    @UseGuard(AuthorizeMember)
    private async sendTextMessage(@Params("groupId") groupId: number, @Body("replyMessageId") replyMessageId: number, @Body("content") message: string, @Headers("userId") userId: number, @Body("manipulates") tags: Array<number>) {
        if (isValidNumberVariable(groupId) && message) {
            let messageModel = await this.messageService.sendTextMessage(groupId, userId, message, tags, replyMessageId)
            this.io
                .to(getRoomGroupIO(groupId))
                .emit(EventMessageIO.NEW_MESSAGE,
                    [messageModel]
                )
            //TODO: send notification   
            // const sockets = await this.io.in(`${groupId}_group`).fetchSockets();
            // let tokens = getAllNotificationTokenFromSockets(sockets)
            // let tokenSaved = await getAllNotificationTokenFromServer(groupId)
            // tokens = await checkElementsInAnotInB<string>(tokens, tokenSaved.map<string>((value: TokenDb, index: number, array: TokenDb[])  {
            //     return value.notificationtoken;
            // }))
            // if (tokens.length != 0) {
            //     await ServiceFCM.gI().sendMulticast(messageModel, tokens)
            // }
            return (
                new ResponseBody(
                    true,
                    "OK",
                    messageModel
                )
            );
            return
        }
        throw (new BadRequestException("Argument is invalid"))
    };
    @POST('/:groupId/:messageId/react/:type')
    @UseGuard(AuthorizeGuard)
    @UseGuard(AuthorizeMember)
    private async reactMessage(@Params("groupId") groupId: number, @Params("messageId") messageId: number, @Params("type") type: number, @Headers("userId") userId: number) {
        if (isValidNumberVariable(messageId) && isValidNumberVariable(type) && isValidNumberVariable(groupId)) {
            let model = await this.messageService.reactMessage(messageId, type, userId, groupId)
            this.io.to(getRoomGroupIO(groupId)).emit(EventMessageIO.REACT_MESSAGE, model)
            return (
                new ResponseBody(
                    true,
                    "OK",
                    model
                )
            );
        } else throw (new BadRequestException("Argument is invalid"))
    };
    @PATCH("/:groupId/:messageId/recall")
    @UseGuard(AuthorizeGuard)
    @UseGuard(AuthorizeMember)
    private async reCallMessage(@Headers("userId") userId: number, @Params("groupId") groupId: number, @Params("messageId") messageId: number) { 
        //FIXME: POSTMAN CHECK
        if (isValidNumberVariable(userId) && isValidNumberVariable(groupId) && isValidNumberVariable(messageId)) {
            let whowasdel = await this.messageService.reCallMessage(userId, groupId, messageId)
            this.io.to(getRoomGroupIO(groupId)).emit(EventMessageIO.RECALL_MESSAGE,
                {
                    "userId": userId,
                    "messageId": messageId,
                    "delby": whowasdel
                }
            )
            return (new ResponseBody(
                true,
                "",
                {}
            ))
        }
        throw (new BadRequestException("Argument is invalid"))
    }

    @GET("/:groupId/:messageId/one/")
    @UseGuard(AuthorizeGuard)
    @UseGuard(AuthorizeMember)
    private async getOneMessage(@Params("groupId") groupId: number, @Params("messageId") messageId: number, @Headers("userId") userId: number) {
        if (isValidNumberVariable(groupId) && isValidNumberVariable(messageId)) {
            let data = await this.messageService.getOneMessage(messageId)
            return (new ResponseBody(
                true,
                "",
                data
            ))
            return
        }
        throw (new BadRequestException("Argument is invalid"))
    }

    @POST("/:groupId/:messageId/forward/:groupIdAddressee/")
    @UseGuard(AuthorizeGuard)
    @UseGuard(AuthorizeMember)
    private async forwardMessage(@Headers("userId") userId: number, @Params("groupId") groupId: number, @Params("messageId") messageId: number, @Params("groupIdAddressee") groupIdAddressee: number, @Req() req: Request) {
        if (isValidNumberVariable(groupId) && isValidNumberVariable(messageId)) {
            let data = await this.messageService.forwardMessage(userId, groupId, messageId, groupIdAddressee)
            this.io.to(getRoomGroupIO(groupId)).emit(EventMessageIO.NEW_MESSAGE, [data])
            return (new ResponseBody(
                true,
                "",
                data
            ))
        }
        throw (new BadRequestException("Argument is invalid"))
    }

    @POST("/:groupId/gif/")
    @UseGuard(AuthorizeGuard)
    @UseGuard(AuthorizeMember)
    private async sendGifMessage(
        @Headers("userId") userId: number,
        @Params("groupId") groupId: number,
        @Body("content") gifId: string,
        @Body("replyMessageId") replyMessageId: number,
    ) {
        if (isValidNumberVariable(groupId) && gifId) {
            let data = await this.messageService.sendGifMessage(groupId, userId, gifId, replyMessageId)
            this.io.to(getRoomGroupIO(groupId)).emit(EventMessageIO.NEW_MESSAGE, [data])
            return (new ResponseBody(
                true,
                "",
                data
            ))
        }
        throw (new BadRequestException("Argument is invalid"))
    }

    @PATCH("/:groupId/:messageId/pin/:ispin/")
    @UseGuard(AuthorizeGuard)
    @UseGuard(AuthorizeMember)
    private async changePinMessage(@Params("groupId") groupId: number, @Params("messageId") messageId: number, @Params("ispin") ispin: boolean, @Headers("userId") userId: number) {
        if (isValidNumberVariable(messageId)) {
            await this.messageService.changePinMessage(groupId, (messageId), (userId), ispin)
            if (ispin) {
                this.io.to(getRoomGroupIO(groupId)).emit(
                    EventMessageIO.PIN_MESSAGE,
                    {
                        "messageId": messageId,
                    }
                )
            } else {
                this.io.to(getRoomGroupIO(groupId)).emit(
                    EventMessageIO.UN_PIN_MESSAGE,
                    {
                        "messageId": messageId,
                    }
                )
            }
            return (new ResponseBody(
                true,
                "",
                {}
            ));

        }
        throw (new BadRequestException("Argument is invalid"))
    };

    @GET("/pin/:groupId/")
    @UseGuard(AuthorizeGuard)
    @UseGuard(AuthorizeMember)
    private async getListPinMessage(@Headers("userId") userId: number, @Params("groupId") groupId: number) {
        if (isValidNumberVariable(groupId)) {
            let data = await this.messageService.getListPinMessage(userId, groupId)
            return (new ResponseBody(
                true,
                "",
                data
            ))
        }
        throw (new BadRequestException("Argument is invalid"))
    }

    @GET("/:groupId/files/all")
    @UseGuard(AuthorizeGuard)
    @UseGuard(AuthorizeMember)
    private async getAllFileFromGroup(
        @Headers("userId") userId: number,
        @Params("groupId") groupId: number,
        @Query("limit") limit: number,
        @Query("cursor") cursor: number
    ) {
        if (isValidNumberVariable(groupId) && isValidNumberVariable(limit) && isValidNumberVariable(cursor)) {
            let data = await this.messageService.getAllFileFromGroup(groupId, cursor, limit)
            return (new ResponseBody(
                true,
                "",
                data
            ))
        }
        throw (new BadRequestException("Argument is invalid"))
    }
}

