import Controller from "@/utils/decorator/decorator";
import { HttpStatus } from "@/utils/exceptions/httpstatus.exception";
import MotherController from "@/utils/interface/controller.interface";
import authHandler from "../../component/auth.handler";
import { NextFunction, Request, Response } from "express";
import { Server } from "socket.io";
import MessageService from "./message.service";
import HttpException from "@/utils/exceptions/http.exeception";
import { JwtPayload } from "jsonwebtoken";
import multer from "multer";
import { HttpSuccess } from "@/utils/definition/http.success";
import MessageBehavior from "./interface/message.interaface";
@Controller("/messagge")
export default class MessageController extends MotherController {
    private messageService: MessageBehavior;
    constructor(io: Server) {
        super(io);
        this.messageService = new MessageService();
    }
    initRouter(): MotherController {
        // FIXME : add 2 auth
        // auth user is loggin
        // auth user joinned group
        this.router.get(
            "/messagge/:group",
            // AuthMiddleware.auth,
            this.getAllMessageFromGroup
        );
        this.router.post(
            "/messagge/:group/text",
            this.sendTextMessage
        );
        this.router.post(
            "/messagge/:group/file",
            multer().single("message"),
            this.sendFileMessage
        );

        this.router.post("/messagge/:id/revoke", this.revokeMessage);
        this.router.post("/messagge/:id/reacts/:type", this.reactMessage);
        this.router.post("/messagge/:id/pin", this.pinMessage);
        this.router.patch("/messagge/:id/delpin", this.deleteMessagePinned);
        return this;
    }
    private deleteMessagePinned = (req: Request, res: Response, next: NextFunction) => { };
    private pinMessage = async (req: Request, res: Response, next: NextFunction) => { };
    private getAllMessageFromGroup = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { id } = req.params;
            if (id) {
                let token = req.headers["token"] as string;
                if (token) {
                    console.log(token);
                    let accesstoken = token.split(" ")[1];
                    if (accesstoken) {
                        const jwtPayload = (await authHandler.decodeAccessToken(
                            accesstoken
                        )) as JwtPayload;
                        const { iduser } = jwtPayload.payload;
                        let data = await this.messageService.getAllMessageFromGroup(
                            Number(id),
                            iduser
                        );
                        res.status(HttpStatus.FOUND).send(data);
                        return;
                    }
                }
            }
            next(
                new HttpException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy nội dung yêu cầu"
                )
            );
        } catch (e: any) {
            if (e instanceof Error) {
                next(new HttpException(HttpStatus.NOT_ACCEPTABLE, e.message));
            }
            next(
                new HttpException(
                    HttpStatus.FORBIDDEN,
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

    };
    private sendTextMessage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { group } = req.params;
            const { message } = req.body;
            console.info(message);
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
                            this.io.emit("message", {
                                group, iduser, message
                            })
                        }
                        res.status(HttpStatus.OK).send("OK");
                        return;
                    }
                }
            }
            next(
                new HttpException(
                    HttpStatus.BAD_REQUEST,
                    "Có lỗi xảy ra vui lòng thủ lại sau"
                )
            );
        } catch (e: any) {
            if (e instanceof multer.MulterError) {
                next(new HttpException(HttpStatus.BAD_REQUEST, e.message));
            }
            next(new HttpException(HttpStatus.BAD_REQUEST, e.toString()));
        }
    };
    private revokeMessage = async (req: Request, res: Response, next: NextFunction) => {
        next();
    };
    private reactMessage = async (req: Request, res: Response, next: NextFunction) => {

    };
}
