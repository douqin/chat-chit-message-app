import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import { MotherController } from "@/lib/common";

import { NextFunction, Request, Response } from "express";
import { Server } from "socket.io";
import MessageService from "./message.service";
import HttpException from "@/utils/exceptions/http.exeception";
import multer from "multer";
import { ResponseBody } from "@/utils/definition/http.response";
import MyException from "@/utils/exceptions/my.exception";
import { AuthorizeGuard } from "@/middleware/auth.middleware";
import { MessageStatus } from "./enum/message.status.enum";
import { isValidNumberVariable } from "@/utils/validate";
import { BadRequestException, InternalServerError } from "@/utils/exceptions/badrequest.expception";
import { inject } from "tsyringe";
import { getRoomGroupIO } from "@/utils/extension/room.group";
import { EventMessageIO } from "./constant/event.io";
import { ReactMessage } from "./enum/message.react.enum";
import { Controller, GET, UseMiddleware, POST, FileUpload, PATCH } from "@/lib/decorator";
import { deleteFile, getOptionDefaultForMulter } from "@/utils/extension/file.upload";

@Controller("/message")
export default class MessageController extends MotherController {
    constructor(@inject(Server) io: Server, @inject(MessageService) private messageService: MessageService) {
        super(io);
    }


    @GET("/:groupId/")
    @UseMiddleware(AuthorizeGuard)
    private async getMessageFromGroup(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        console.log("🚀 ~ MessageController ~ req:")
        try {
            const groupId = Number(req.params.groupId)
            const limit = Number(req.query.limit)
            const cursor = Number(req.query.cursor)
            if (isValidNumberVariable(groupId) && isValidNumberVariable(limit) && isValidNumberVariable(cursor)) {
                const userId = Number(req.headers['userId'] as string)
                let data = await this.messageService.getAllMessageFromGroup(
                    Number(groupId),
                    userId, cursor, limit
                );
                res.status(HttpStatus.OK).send(new ResponseBody(
                    true,
                    "",
                    data
                ));
                return;
            } else next(
                new HttpException(
                    HttpStatus.BAD_REQUEST,
                    "Error Agurment"
                )
            );

        } catch (e: any) {
            if (e instanceof MyException) {
                next(
                    new HttpException(
                        HttpStatus.FORBIDDEN,
                        e.message
                    )
                )
            }
            console.error(e)
            next(
                new HttpException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Có lỗi xảy ra vui lòng thử lại sau"
                )
            );
        }
    };
    @POST("/:groupId/file")
    @UseMiddleware(AuthorizeGuard)
    @FileUpload(multer(getOptionDefaultForMulter('message')).array("files", 7))
    private async sendFileMessage(req: Request, res: Response, next: NextFunction) {
        try {
            const groupId = Number(req.params.groupId);
            if (isValidNumberVariable(groupId) && req.files) {
                const userId = Number(req.headers['userId'] as string)
                let data = await this.messageService.sendFileMessage(
                    Number(groupId),
                    userId,
                    req.files as Express.Multer.File[]
                );
                res.status(HttpStatus.OK).send(new ResponseBody(
                    true,
                    "OK",
                    data
                ));
                this.io
                    .to(getRoomGroupIO(groupId))
                    .emit(EventMessageIO.NEW_MESSAGE,
                        [data]
                    )
                return;
            }
            next(
                new HttpException(
                    HttpStatus.BAD_REQUEST,
                    "File lỗi"
                )
            );
        } catch (e: any) {
            console.log("🚀 ~ file: message.controller.ts:131 ~ MessageController ~ e:", e)
            if (e instanceof MyException) {
                next(
                    new HttpException(
                        e.status,
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
        } finally {
            if (req.file) {
                deleteFile(req.file.filename)
            }
        }
    };
    @POST("/:groupId/text")
    @UseMiddleware(AuthorizeGuard)
    private async sendTextMessage(req: Request, res: Response, next: NextFunction) {
        try {
            const groupId = Number(req.params.groupId)
            const replyMessageId = Number(req.body.replyMessageId) || null
            const message = String(req.body.content)
            let tags: Array<number> = req.body.manipulates || [];
            if (isValidNumberVariable(groupId) && message) {
                const userId = Number(req.headers['userId'] as string)
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
                res.status(HttpStatus.OK).send(
                    new ResponseBody(
                        true,
                        "OK",
                        messageModel
                    )
                );
                return
            }
            next(new BadRequestException("Agurment is invalid"))
        } catch (e: any) {
            console.log("🚀 ~ file: message.controller.ts:211 ~ MessageController ~ sendTextMessage= ~ e:", e)
            next(new InternalServerError("An error occurred, please try again later."));
        }
    };
    @POST('/:groupId/:messageId/react/:type')
    @UseMiddleware(AuthorizeGuard)
    private async reactMessage(req: Request, res: Response, next: NextFunction) {
        try {
            const groupId = Number(req.params.groupId);
            const type: ReactMessage = Number(req.params.type);
            const messageId = Number(req.params.messageId);
            if (isValidNumberVariable(messageId) && isValidNumberVariable(type) && isValidNumberVariable(groupId)) {
                const userId = Number(req.headers['userId'] as string)
                let model = await this.messageService.reactMessage(messageId, type, userId, groupId)
                this.io.to(getRoomGroupIO(groupId)).emit(EventMessageIO.REACT_MESSAGE, model)
                res.status(HttpStatus.OK).send(
                    new ResponseBody(
                        true,
                        "OK",
                        model
                    )
                );
            } else next(new BadRequestException("Agurment is invalid"))

        } catch (e: any) {
            console.log("🚀 ~ file: message.controller.ts:241 ~ MessageController ~ reactMessage= ~ e:", e)
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
    @PATCH("/:groupId/:messageId/recall")
    @UseMiddleware(AuthorizeGuard)
    private async removeCall(req: Request, res: Response, next: NextFunction) { //FIXME: POSTMAN CHECK
        try {
            const userId = Number(req.headers.userId)
            console.log("🚀 ~ MessageController ~ removeCall ~ userId:", userId)
            const groupId = Number(req.params.groupId)
            console.log("🚀 ~ MessageController ~ removeCall ~ groupId:", groupId)
            const idmessgae = Number(req.params.messageId)
            console.log("🚀 ~ MessageController ~ removeCall ~ idmessgae:", idmessgae)
            if (isValidNumberVariable(userId) && isValidNumberVariable(groupId) && isValidNumberVariable(idmessgae)) {
                let whowasdel = await this.messageService.removeCall(userId, groupId, idmessgae)
                this.io.to(getRoomGroupIO(groupId)).emit(EventMessageIO.RECALL_MESSAGE,
                    {
                        "userId": userId,
                        "messageId": idmessgae,
                        "delby": whowasdel
                    }
                )
                res.status(HttpStatus.OK).json(new ResponseBody(
                    true,
                    "",
                    {}
                ))
                return
            }
            next(new BadRequestException("Agurment is invalid"))
        }
        catch (error) {
            if (error instanceof MyException) {
                next(new HttpException(error.status, error.message))
                return
            }
            console.log("🚀 ~ MessageController ~ removeCall ~ error:", error)
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }

    @GET("/:groupId/:messageId/one/")
    @UseMiddleware(AuthorizeGuard)
    private async getOneMessage(req: Request, res: Response, next: NextFunction) {
        try {
            const groupId = Number(req.params.groupId)
            const messageId = Number(req.params.messageId)
            if (isValidNumberVariable(groupId) && isValidNumberVariable(messageId)) {
                let data = await this.messageService.getOneMessage(messageId)
                res.status(HttpStatus.OK).json(new ResponseBody(
                    true,
                    "",
                    data
                ))
                return
            }
            next(new BadRequestException("Agurment is invalid"))
        }
        catch (e) {
            if (e instanceof MyException) {
                next(
                    new HttpException(
                        e.status,
                        e.message
                    )
                )
                return
            }
            console.log("🚀 ~ file: message.controller.ts:131 ~ MessageController ~ e:", e)
            next(new InternalServerError("An error occurred, please try again later."));
        }
    }

    @POST("/:groupId/:messageId/forward/:groupIdAddressee/")
    @UseMiddleware(AuthorizeGuard)
    private async forwardMessage(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.headers['userId'] as string)
            const groupId = Number(req.params.groupId)
            const messageId = Number(req.params.messageId)
            const groupIdAddressee = Number(req.params.groupIdAddressee)
            if (isValidNumberVariable(groupId) && isValidNumberVariable(messageId)) {
                let data = await this.messageService.forwardMessage(userId, groupId, messageId, groupIdAddressee)
                this.io.to(getRoomGroupIO(groupId)).emit(EventMessageIO.NEW_MESSAGE, [data])
                res.status(HttpStatus.OK).json(new ResponseBody(
                    true,
                    "",
                    data
                ))
                return
            }
            next(new BadRequestException("Agurment is invalid"))
        }
        catch (e) {
            if (e instanceof MyException) {
                next(
                    new HttpException(
                        e.status,
                        e.message
                    )
                )
                return
            }
            console.log("🚀 ~ file: message.controller.ts:131 ~ MessageController ~ e:", e)
            next(new InternalServerError("An error occurred, please try again later."));
        }
    }


    @POST("/:groupId/gif/")
    @UseMiddleware(AuthorizeGuard)
    private async sendGifMessage(req: Request, res: Response, next: NextFunction) {
        try {
            const groupId = Number(req.params.groupId)
            const gifId = String(req.body.content)
            const replyMessageId = Number(req.body.replyMessageId) || null
            if (isValidNumberVariable(groupId) && gifId) {
                const userId = Number(req.headers['userId'] as string)
                let data = await this.messageService.sendGifMessage(groupId, userId, gifId, replyMessageId)
                this.io.to(getRoomGroupIO(groupId)).emit(EventMessageIO.NEW_MESSAGE, [data])
                res.status(HttpStatus.OK).json(new ResponseBody(
                    true,
                    "",
                    data
                ))
                return
            }
            next(new BadRequestException("Agurment is invalid"))
        }
        catch (e) {
            if (e instanceof MyException) {
                next(
                    new HttpException(
                        e.status,
                        e.message
                    )
                )
                return
            }
            console.log("🚀 ~ file: message.controller.ts:131 ~ MessageController ~ e:", e)
            next(new InternalServerError("An error occurred, please try again later."));
        }
    }

    @PATCH("/:groupId/:messageId/pin/:ispin/")
    @UseMiddleware(AuthorizeGuard)
    private async changePinMessage(req: Request, res: Response, next: NextFunction) {
        try {
            const messageId = Number(req.params.messageId)
            console.log("🚀 ~ MessageController ~ changePinMessage ~ req.params:", req.params)
            const ispin = Boolean(Number(req.params.ispin))
            console.log("🚀 ~ MessageController ~ changePinMessage ~ ispin:", ispin)
            const groupId = Number(req.params.groupId)
            if (isValidNumberVariable(messageId)) {
                const userId = Number(req.headers['userId'] as string)
                await this.messageService.changePinMessage(groupId, (messageId), (userId), ispin)
                res.status(HttpStatus.OK).send(new ResponseBody(
                    true,
                    "",
                    {}
                ));
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
            }
            next(new BadRequestException("Agurment is invalid"))
        } catch (e: any) {
            console.log("🚀 ~ file: message.controller.ts:71 ~ MessageController ~ changePinMessage= ~ e:", e);
            if (e instanceof MyException) {
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

    @GET("/pin/:groupId/")
    @UseMiddleware(AuthorizeGuard)
    private async getListPinMessage(req: Request, res: Response, next: NextFunction) {
        try {
            const groupId = Number(req.params.groupId)
            const userId = Number(req.headers['userId'] as string)
            if (isValidNumberVariable(groupId)) {
                let data = await this.messageService.getListPinMessage(userId, groupId)
                res.status(HttpStatus.OK).json(new ResponseBody(
                    true,
                    "",
                    data
                ))
                return
            }
            next(new BadRequestException("Agurment is invalid"))
        }
        catch (error) {
            if (error instanceof MyException) {
                next(new HttpException(error.status, error.message))
                return
            }
            console.log("🚀 ~ MessageController ~ getPinMessage ~ error:", error)
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }

    @GET("/:groupId/files/all")
    @UseMiddleware(AuthorizeGuard)
    private async getAllFileFromGroup(req: Request, res: Response, next: NextFunction) {
        console.log("🚀 ~ MessageController ~ getAllFileFromGroup ~ req:", req)
        try {
            let groupId = Number(req.params.groupId)
            let limit = Number(req.query.limit)
            let cursor = Number(req.query.cursor)
            if (isValidNumberVariable(groupId) && isValidNumberVariable(limit) && isValidNumberVariable(cursor)) {
                let data = await this.messageService.getAllFileFromGroup(groupId, cursor, limit)
                res.status(HttpStatus.OK).json(new ResponseBody(
                    true,
                    "",
                    data
                ))
                return
            }
            next(new BadRequestException("Agurment is invalid"))
        }
        catch (error) {
            if (error instanceof MyException) {
                next(new HttpException(error.status, error.message))
                return
            }
            console.log("🚀 ~ MessageController ~ getAllFileFromGroup ~ error:", error)
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
}

