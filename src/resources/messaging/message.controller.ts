import Controller from "@/utils/decorator/controller";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import MotherController from "@/utils/interface/controller.interface";
import { NextFunction, Request, Response } from "express";
import { Server } from "socket.io";
import MessageService from "./message.service";
import HttpException from "@/utils/exceptions/http.exeception";
import multer from "multer";
import { ResponseBody } from "@/utils/definition/http.response";
import MyException from "@/utils/exceptions/my.exception";
import { AuthorizeMiddleware } from "@/middleware/auth.middleware";
import { MessageStatus } from "./enum/message.status.enum";
import isValidNumberVariable from "@/utils/extension/vailid_variable";
import { BadRequestException, InternalServerError } from "@/utils/exceptions/badrequest.expception";
import { inject } from "tsyringe";
import { getRoomGroupIO } from "@/utils/extension/room.group";
import { EventMessageIO } from "./constant/event.io";
import UseMiddleware from "@/utils/decorator/middleware/use.middleware";
import { GET } from "@/utils/decorator/http.method/get";
import { POST } from "@/utils/decorator/http.method/post";
import { PATCH } from "@/utils/decorator/http.method/patch";
import { FileUpload } from "@/utils/decorator/file.upload/multer.upload";

@Controller("/message")
export default class MessageController extends MotherController {
    constructor(@inject(Server) io: Server, @inject(MessageService) private messageService: MessageService) {
        super(io);
    }

    @POST("/:id/pin/:ispin")
    @UseMiddleware(AuthorizeMiddleware)
    private async changePinMessage(req: Request, res: Response, next: NextFunction) {
        try {
            const { id, ispin, idgroup } = req.params;
            if (id && Number(idgroup)) {
                const iduser = Number(req.headers['iduser'] as string)
                let isOK = await this.messageService.changePinMessage(Number(id), Number(iduser), Number(ispin))
                console.log("🚀 ~ file: message.controller.ts:57 ~ MessageController ~ changePinMessage= ~ isOK:", isOK)
                if (isOK) {
                    res.status(HttpStatus.OK).send(new ResponseBody(
                        true,
                        "",
                        {}
                    ));
                    this.io.to(`${idgroup}`).emit(
                        'pin_message',
                        {
                            iduser,
                            id,
                            ispin
                        }
                    )
                }
            }
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

    @GET("/:idgroup")
    @UseMiddleware(AuthorizeMiddleware)
    private async getMessageFromGroup(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const idgroup = Number(req.params.idgroup)
            const limit = Number(req.query.limit)
            const cursor = Number(req.query.cursor)
            if (isValidNumberVariable(idgroup)) {
                const iduser = Number(req.headers['iduser'] as string)
                let data = await this.messageService.getAllMessageFromGroup(
                    Number(idgroup),
                    iduser, cursor, limit
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
    @POST("/:idgroup/file")
    @UseMiddleware(AuthorizeMiddleware)
    @FileUpload(multer().array("files", 12))
    private async sendFileMessage(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const idgroup = req.params.idgroup;
            if ((idgroup) && req.files) {
                const iduser = Number(req.headers['iduser'] as string)
                let data = await this.messageService.sendFileMessage(
                    Number(idgroup),
                    iduser,
                    req.files
                );
                res.status(HttpStatus.OK).send(new ResponseBody(
                    true,
                    "OK",
                    data
                ));
                this.io
                    .to(`${idgroup}_group`)
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
        }
    };
    @POST("/:idgroup/text")
    @UseMiddleware(AuthorizeMiddleware)
    private async sendTextMessage(req: Request, res: Response, next: NextFunction) {
        try {
            const idgroup = Number(req.params.idgroup)
            const message = String(req.body.message)
            let tags: Array<number> = []
            try {
                tags = JSON.parse(req.body.tags)
            } catch { }
            if (isValidNumberVariable(idgroup) && message) {
                const iduser = Number(req.headers['iduser'] as string)
                let messageModel = await this.messageService.sendTextMessage(idgroup, iduser, message, tags)
                this.io
                    .to(getRoomGroupIO(idgroup))
                    .emit(EventMessageIO.NEW_MESSAGE,
                        [messageModel]
                    )
                // const sockets = await this.io.in(`${idgroup}_group`).fetchSockets();
                // let tokens = getAllNotificationTokenFromSockets(sockets)
                // let tokenSaved = await getAllNotificationTokenFromServer(idgroup)
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
    @POST('/:id/react')
    @UseMiddleware(AuthorizeMiddleware)
    private async reactMessage(req: Request, res: Response, next: NextFunction) {
        try {
            const idgroup = Number(req.body.idgroup);
            const type = Number(req.body.type);
            const idmessage = Number(req.params.id);

            if (idmessage && type && idgroup) {
                const iduser = Number(req.headers['iduser'] as string)

                let model = await this.messageService.reactMessage(
                    Number(idmessage), Number(type), iduser, idgroup
                )
                this.io.to(`${idgroup}_group`).emit('react_message',
                    model
                )
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
    @PATCH("/:id/removemessage")
    @UseMiddleware(AuthorizeMiddleware)
    private async removeMessage(req: Request, res: Response, next: NextFunction) { //FIXME: POSTMAN CHECK
        try {
            const iduser = Number(req.headers.iduser)
            const idgroup = Number(req.body.idgroup)
            const idmessgae = Number(req.params.id)
            if (iduser && idgroup && idmessgae) {
                let isOK = await this.messageService.removeMessage(iduser, idgroup, idmessgae)
                this.io.to(`${idgroup}_group`).emit('del_message',
                    iduser,
                    idmessgae,
                    MessageStatus.DEL_BY_OWNER
                )
                res.status(HttpStatus.OK).json(new ResponseBody(
                    isOK,
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
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
    @PATCH("/:id/ ")
    @UseMiddleware(AuthorizeMiddleware)
    private async updateLastView(req: Request, res: Response, next: NextFunction) {
        try {
            const iduser = Number(req.headers.iduser)
            const idmessgae = Number(req.params.id)
            if (iduser && idmessgae) {
                let isOK = await this.messageService.updateLastView(iduser, idmessgae)
                //FIXME: socket to [member]
                res.status(HttpStatus.OK).json(new ResponseBody(
                    isOK,
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
            next(new InternalServerError("An error occurred, please try again later."))
        }
    }
}

