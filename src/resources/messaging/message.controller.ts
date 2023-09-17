import Controller from "@/utils/decorator/decorator";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import MotherController from "@/utils/interface/controller.interface";
import { NextFunction, Request, Response } from "express";
import { Server } from "socket.io";
import MessageService from "./message.service";
import HttpException from "@/utils/exceptions/http.exeception";
import multer from "multer";
import { ResponseBody } from "@/utils/definition/http.response";
import MessageServiceBehavior from "./interface/message.service.interaface";
import MyException from "@/utils/exceptions/my.exception";
import AuthMiddleware from "@/middleware/auth.middleware";
import { TokenDb, checkElementsInAnotInB, getAllNotificationTokenFromServer, getAllNotificationTokenFromSockets } from "@/utils/extension/extension.notification.token";
import { ServiceFCM } from "../../component/firebase/firebase.service";
@Controller("/message")
export default class MessageController extends MotherController {
    private messageService: MessageServiceBehavior;
    constructor(io: Server) {
        super(io);
        this.messageService = new MessageService();
    }

    initRouter(): MotherController {
        this.router.get(
            "/message/:idgroup",
            AuthMiddleware.auth,
            this.getMessageFromGroup
        );
        this.router.post(
            "/message/:idgroup/text",
            multer().none(),
            AuthMiddleware.auth,
            this.sendTextMessage
        );
        this.router.post(
            "/message/:idgroup/file",
            multer().array("files", 12),
            AuthMiddleware.auth,
            this.sendFileMessage
        );
        this.router.post("/message/:id/react/:type", multer().none(), AuthMiddleware.auth, this.reactMessage);
        this.router.patch("/message/:id/pin/:ispin", multer().none(), AuthMiddleware.auth, this.changePinMessage);
        this.router.patch("/message/:id/removemessage", multer().none(), AuthMiddleware.auth, this.removeMessage)
        this.router.patch("/message/:id/ ", multer().none(), AuthMiddleware.auth, this.updateLastView)
        return this;
    }
    private changePinMessage = async (req: Request, res: Response, next: NextFunction) => {
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
    private getMessageFromGroup = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { idgroup } = req.params;
            const time = req.query;
            if (Number(idgroup)) {
                const iduser = Number(req.headers['iduser'] as string)
                let data = await this.messageService.getAllMessageFromGroup(
                    Number(idgroup),
                    iduser
                );
                res.status(HttpStatus.OK).send(new ResponseBody(
                    true,
                    "",
                    data
                ));
                return;
            }

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
    private sendFileMessage = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { idgroup } = req.params;
            if (Number(idgroup) && req.files) {
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
                    .emit("message",
                        data
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
                        e.statusCode,
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
    private sendTextMessage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const idgroup = Number(req.params.idgroup);
            console.log("🚀 ~ file: message.controller.ts:181 ~ MessageController ~ sendTextMessage= ~ idgroup:", idgroup)
            const message = String(req.body.message);
            console.log("🚀 ~ file: message.controller.ts:182 ~ MessageController ~ sendTextMessage= ~ message:", message)
            if (idgroup && message) {
                const iduser = Number(req.headers['iduser'] as string)
                let messageModel = await this.messageService.sendTextMessage(idgroup, iduser, message)
                this.io
                    .to(`${idgroup}_group`)
                    .emit("message",
                        messageModel
                    )
                const sockets = await this.io.in(`${idgroup}_group`).fetchSockets();
                let tokens = getAllNotificationTokenFromSockets(sockets)
                let tokenSaved = await getAllNotificationTokenFromServer(idgroup)
                tokens = await checkElementsInAnotInB<string>(tokens, tokenSaved.map<string>((value: TokenDb, index: number, array: TokenDb[]) => {
                    return value.notificationtoken;
                }))
                if (tokens.length != 0) {
                    await ServiceFCM.gI().sendMulticast(messageModel, tokens)
                }
                res.status(HttpStatus.OK).send(
                    new ResponseBody(
                        true,
                        "OK",
                        messageModel
                    )
                );
                return;
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Tham số không hợp lệ"))
        } catch (e: any) {
            console.log("🚀 ~ file: message.controller.ts:211 ~ MessageController ~ sendTextMessage= ~ e:", e)
            next(new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Có lỗi xảy ra vui lòng thử lại sau"));
        }
    };
    private reactMessage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, type, idgroup } = req.params;
            if (id && Number(type) && Number(idgroup)) {
                const iduser = Number(req.headers['iduser'] as string)

                let isOK = await this.messageService.reactMessage(
                    Number(id), Number(type), iduser
                )
                if (!isOK) {
                    next(new HttpException(HttpStatus.FORBIDDEN, "Bạn không có quyền thực hiện hành động này"))
                    return
                }
                res.status(HttpStatus.OK).send(
                    new ResponseBody(
                        true,
                        "OK",
                        {}
                    )
                );
                this.io.to(`${idgroup}`).emit('react_message', {
                    iduser,
                    id,
                    type
                })
                return;

            }

        } catch (e: any) {
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
    private removeMessage = async (req: Request, res: Response, next: NextFunction) => { //FIXME: POSTMAN CHECK
        try {
            const iduser = Number(req.headers.iduser)
            const idgroup = Number(req.body.idgroup)
            const idmessgae = Number(req.params.id)
            if (iduser && idgroup && idmessgae) {
                let isOK = await this.messageService.removeMessage(iduser, idgroup, idmessgae)
                res.status(HttpStatus.OK).json(new ResponseBody(
                    isOK,
                    "",
                    {}
                ))
                return
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Tham số không hợp lệ"))
        }
        catch (error) {
            if (error instanceof MyException) {
                next(new HttpException(HttpStatus.BAD_REQUEST, error.message))
            }
            next(new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
    private updateLastView = async (req: Request, res: Response, next: NextFunction) => {

        try {
            const iduser = Number(req.headers.iduser)
            const idmessgae = Number(req.params.id)
            if (iduser && idmessgae) {
                let isOK = await this.messageService.updateLastView(iduser, idmessgae)
                res.status(HttpStatus.OK).json(new ResponseBody(
                    isOK,
                    "",
                    {}
                ))
                return
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, "Tham số không hợp lệ"))
        }
        catch (error) {
            if (error instanceof MyException) {
                next(new HttpException(HttpStatus.BAD_REQUEST, error.message))
            }
            next(new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Có lỗi xảy ra vui lòng thử lại sau"))
        }
    }
}

