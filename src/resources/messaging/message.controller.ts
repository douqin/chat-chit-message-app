import Controller from "@/utils/decorator/decorator";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import MotherController from "@/utils/interface/controller.interface";
import authHandler from "../../component/auth.handler";
import { NextFunction, Request, Response } from "express";
import { Server } from "socket.io";
import MessageService from "./message.service";
import HttpException from "@/utils/exceptions/http.exeception";
import { JwtPayload } from "jsonwebtoken";
import multer from "multer";
import { ResponseBody } from "@/utils/definition/http.response";
import MessageBehavior from "./interface/message.interaface";
import MyException from "@/utils/exceptions/my.exception";
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
            // AuthMiddleware.auth,
            this.getAllMessageFromGroup
        );
        this.router.post(
            "/messagge/:group/text",
            multer().none(),
            this.sendTextMessage
        );
        this.router.post(
            "/messagge/:idgroup/file",
            multer().array("files", 12),
            this.sendFileMessage
        );

        this.router.patch("/messagge/:id/statusmessage", this.changeStatusMessage);
        this.router.post("/messagge/:id/react/:type", this.reactMessage);
        this.router.patch("/messagge/:id/pin/:ispin", this.changePinMessage);
        return this;
    }
    private changePinMessage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, ispin, idgroup } = req.params;
            if (id && idgroup) {
                let token = req.headers["token"] as string;
                if (token) {
                    let accesstoken = token.split(" ")[1];
                    if (accesstoken) {
                        const jwtPayload = (await authHandler.decodeAccessToken(
                            accesstoken
                        )) as JwtPayload;
                        const { iduser } = jwtPayload.payload;
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
                        } else {
                            next(new HttpException(HttpStatus.FORBIDDEN, "Bạn không có quyền thực hiện hành vi này"))
                        }
                        return;
                    }
                }
            }
            next(
                new HttpException(
                    HttpStatus.BAD_REQUEST,
                    "Không tìm thấy nội dung yêu cầu"
                )
            );
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
                let token = req.headers["token"] as string;
                if (token) {
                    let accesstoken = token.split(" ")[1];
                    HttpStatus.CONTINUE
                    if (accesstoken) {
                        const jwtPayload = (await authHandler.decodeAccessToken(
                            accesstoken
                        )) as JwtPayload;
                        const { iduser } = jwtPayload.payload;
                        let data = await this.messageService.getAllMessageFromGroup(
                            Number(idgroup),
                            iduser
                        );
                        res.status(HttpStatus.FOUND).send(data);
                        return;
                    }
                }
            }
            next(
                new HttpException(
                    HttpStatus.BAD_REQUEST,
                    "Không tìm thấy nội dung yêu cầu"
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
                let token = req.headers["token"] as string;
                if (token) {

                    let accesstoken = token.split(" ")[1];
                    if (accesstoken) {
                        const jwtPayload = (await authHandler.decodeAccessToken(
                            accesstoken
                        )) as JwtPayload;
                        const { iduser } = jwtPayload.payload;
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
                }
            }
            next(
                new HttpException(
                    HttpStatus.BAD_REQUEST,
                    "Có lỗi xảy ra vui lòng thử lại"
                )
            );
        } catch (e: any) {
            console.log("🚀 ~ file: message.controller.ts:131 ~ MessageController ~ e:", e)
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
    private sendTextMessage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { group } = req.params;
            const { message } = req.body;
            if (group) {
                let token = req.headers["token"] as string;

                if (token) {
                    let accesstoken = token.split(" ")[1];

                    if (accesstoken) {
                        const jwtPayload = (await authHandler.decodeAccessToken(
                            accesstoken
                        )) as JwtPayload;
                        const { iduser } = jwtPayload.payload;
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
                }
                else {
                    new HttpException(
                        HttpStatus.BAD_REQUEST,
                        "Ban không có quyền này"
                    )
                }
            }
            next(
                new HttpException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Có lỗi xảy ra vui lòng thủ lại sau"
                )
            );
        } catch (e: any) {
            console.log("🚀 ~ file: message.controller.ts:144 ~ MessageController ~ sendTextMessage= ~ e:", e)
            next(new HttpException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra vui lòng thử lại sau"));
        }
    };
    private changeStatusMessage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, idgroup } = req.params;
            if (id && idgroup) {
                let token = req.headers["token"] as string;
                if (token) {
                    let accesstoken = token.split(" ")[1];
                    if (accesstoken) {
                        const jwtPayload = (await authHandler.decodeAccessToken(
                            accesstoken
                        )) as JwtPayload;
                        const { iduser } = jwtPayload.payload;
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
                        } else {
                            next(new HttpException(HttpStatus.FORBIDDEN, "Bạn không có quyền thực hiện hành vi này"))
                        }
                        return;
                    }
                }
            }
            next(
                new HttpException(
                    HttpStatus.BAD_REQUEST,
                    "Có lỗi xảy ra vui lòng thử lại sau"
                )
            );
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
            if (id) {
                let token = req.headers["token"] as string;
                if (token) {
                    let accesstoken = token.split(" ")[1];
                    if (accesstoken) {
                        const jwtPayload = (await authHandler.decodeAccessToken(
                            accesstoken
                        )) as JwtPayload;
                        const { iduser } = jwtPayload.payload;
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
                }
            }
            next(
                new HttpException(
                    HttpStatus.BAD_REQUEST,
                    "Không tìm thấy nội dung yêu cầu"
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
            next(
                new HttpException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Có lỗi xảy ra vui lòng thử lại sau"
                )
            );
        }
    };
}
