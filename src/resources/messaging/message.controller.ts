import Controller from "@/utils/decorator/decorator";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import MotherController from "@/utils/interface/controller.interface";
import { NextFunction, Request, Response } from "express";
import { Server } from "socket.io";
import MessageService from "./message.service";
import HttpException from "@/utils/exceptions/http.exeception";
import multer from "multer";
import { ResponseBody } from "@/utils/definition/http.response";
import MessageBehavior from "./interface/message.interaface";
import MyException from "@/utils/exceptions/my.exception";
import AuthMiddleware from "@/middleware/auth.middleware";
@Controller("/messagge")
export default class MessageController extends MotherController {
    private messageService: MessageBehavior;
    constructor(io: Server) {
        super(io);
        this.messageService = new MessageService();
    }

    initRouter(): MotherController {
        this.router.get(
            "/messagge/:idgroup",
            multer().none(),
            AuthMiddleware.auth,
            this.getAllMessageFromGroup
        );
        this.router.post(
            "/messagge/:group/text",
            multer().none(),
            AuthMiddleware.auth,
            this.sendTextMessage
        );
        this.router.post(
            "/messagge/:idgroup/file",
            multer().array("files", 12),
            AuthMiddleware.auth,
            this.sendFileMessage
        );
        this.router.patch("/messagge/:id/statusmessage", AuthMiddleware.auth, this.changeStatusMessage);
        this.router.post("/messagge/:id/react/:type", AuthMiddleware.auth, this.reactMessage);
        this.router.patch("/messagge/:id/pin/:ispin", AuthMiddleware.auth, this.changePinMessage);
        return this;
    }
    private changePinMessage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, ispin, idgroup } = req.params;
            if (id && idgroup) {
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
    private getAllMessageFromGroup = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { idgroup } = req.params;
            if (idgroup) {
                const iduser = Number(req.headers['iduser'] as string)
                let data = await this.messageService.getAllMessageFromGroup(
                    Number(idgroup),
                    iduser
                );
                res.status(HttpStatus.FOUND).send(data);
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
    private sendFileMessage = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { idgroup } = req.params;

            if (idgroup && req.files) {
                const iduser = Number(req.headers['iduser'] as string)
                let data = await this.messageService.sendFileMessage(
                    Number(idgroup),
                    iduser,
                    req.files
                );
                res.status(HttpStatus.FOUND).send(new ResponseBody(
                    true,
                    "OK",
                    {}
                ));
                this.io
                    .to(`${idgroup}`)
                    .emit("message_file", {
                        iduser,
                        data
                    });
                return;
            }


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
            const { group } = req.params;
            const { message } = req.body;
            if (group && message) {
                const iduser = Number(req.headers['iduser'] as string)

                let isSuccessfully = await this.messageService.sendTextMessage(Number(group), iduser, message)
                if (isSuccessfully) {
                    this.io
                        .to(`${group}`)
                        .emit("message_text", {
                            iduser, message
                        })
                    res.status(HttpStatus.OK).send(
                        new ResponseBody(
                            true,
                            "OK",
                            {}
                        )
                    );
                }
                return;
            }
        } catch (e: any) {
            console.log("🚀 ~ file: message.controller.ts:144 ~ MessageController ~ sendTextMessage= ~ e:", e)
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"));
        }
    };
    private changeStatusMessage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, idgroup } = req.params;
            if (id && idgroup) {
                const iduser = Number(req.headers['iduser'] as string)

                let isOK = await this.messageService.changeStatusMessage(
                    Number(id), Number(iduser)
                )
                if (!isOK) {
                    res.status(HttpStatus.OK).send(new ResponseBody(
                        true,
                        "",
                        {}
                    ));
                    this.io.to(`${idgroup}`).emit('change_state_message', {
                        iduser,
                        id,

                    })
                }
            }
        } catch (e: any) {
            console.log("🚀 ~ file: message.controller.ts:232 ~ MessageController ~ unsend= ~ e:", e)
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
                    HttpStatus.FORBIDDEN,
                    "Có lỗi xảy ra vui lòng thử lại sau"
                )
            );
        }
    };
    private reactMessage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, type, idgroup } = req.params;
            if (id && type && idgroup) {
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
}
