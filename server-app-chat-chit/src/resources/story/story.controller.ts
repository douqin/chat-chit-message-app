import { AuthorizeMiddleware } from "@/middleware/auth.middleware";
import { ResponseBody } from "@/utils/definition/http.response";
import HttpException from "@/utils/exceptions/http.exeception";
import MyException from "@/utils/exceptions/my.exception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import { MotherController } from "@/lib/base";

import { Response, Request, NextFunction } from "express";
import multer from "multer";
import { Server } from "socket.io";
import isValidNumberVariable from "@/utils/extension/vailid_variable";
import { inject } from "tsyringe";
import StoryService from "./story.service";
import { Controller, POST, FileUpload, GET, UseMiddleware, DELETE } from "@/lib/decorator";
import { BadRequestException } from "@/utils/exceptions/badrequest.expception";

@Controller("/story")
export default class StoryController extends MotherController {

    constructor(@inject(Server) io: Server, @inject(StoryService) private storyService: StoryService) {
        super(io);
    }

    @POST("/upload")
    @FileUpload(multer().single("story"))
    private async uploadStory(req: Request, res: Response, next: NextFunction) {
        try {
            if (req.file) {
                const iduser = Number(req.headers['iduser'] as string)
                let story = await this.storyService.uploadStory(req.file, iduser)
                res.status(HttpStatus.OK).send(new ResponseBody(
                    true,
                    "OK",
                    story
                ));
                return;
            }
            next(
                new BadRequestException(
                    "File's wrong"
                )
            );
        } catch (e: any) {
            if (e instanceof MyException) {
                next(
                    e
                )
                return
            }
            console.log("🚀 ~ file: story.controller.ts:48 ~ StoryController ~ uploadStory= ~ e:", e)
            next(
                new HttpException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Có lỗi xảy ra vui lòng thử lại sau"
                )
            );
        }
    }
    @GET('')
    @UseMiddleware(AuthorizeMiddleware)
    private async getAllStoryFromFriends(req: Request, res: Response, next: NextFunction) {
        try {
            const iduser = Number(req.headers['iduser'] as string)
            let story = await this.storyService.getAllStoryFromFriends(iduser)
            res.status(HttpStatus.OK).send(new ResponseBody(
                true,
                "OK",
                story
            ));
        } catch (e: any) {
            console.log("🚀 ~ file: story.controller.ts:85 ~ StoryController ~ getAllStoryFromFriends= ~ e:", e)
            if (e instanceof MyException) {
                next(
                    new HttpException(
                        e.status,
                        e.message
                    )
                )
                return
            }
            next(
                new HttpException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Có lỗi xảy ra vui lòng thử lại sau"
                )
            );
        }
    }
    // del story
    @DELETE(":storyId/delete")
    @UseMiddleware(AuthorizeMiddleware)
    private async deleteStory(req: Request, res: Response, next: NextFunction) {
        try {
            let idstory = Number(req.params.storyId)
            const iduser = Number(req.headers['iduser'] as string)
            let story = await this.storyService.seeStory(iduser, idstory)
            res.status(HttpStatus.OK).send(new ResponseBody(
                true,
                "OK",
                {}
            ));
            return;
        } catch (e: any) {
            console.log("🚀 ~ file: story.controller.ts:48 ~ StoryController ~ uploadStory= ~ e:", e)
            if (e instanceof MyException) {
                next(
                    new HttpException(
                        e.status,
                        e.message
                    )
                )
                return
            }
            next(
                new HttpException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Có lỗi xảy ra vui lòng thử lại sau"
                )
            );
        }
    }
    // seen story
    @POST(":storyId/see")
    @UseMiddleware(AuthorizeMiddleware)
    private async seeStoryFriend(req: Request, res: Response, next: NextFunction) {
        try {
            let idstory = Number(req.params.storyId)
            if (isValidNumberVariable(idstory)) {
                const iduser = Number(req.headers['iduser'] as string)
                let story = await this.storyService.seeStory(iduser, idstory)
                res.status(HttpStatus.OK).send(new ResponseBody(
                    true,
                    "OK",
                    {}
                ));
            } else next(
                new HttpException(
                    HttpStatus.BAD_REQUEST,
                    "Argurments are wrong"
                )
            );
            return;
        } catch (e: any) {
            console.log("🚀 ~ file: story.controller.ts:48 ~ StoryController ~ uploadStory= ~ e:", e)
            if (e instanceof MyException) {
                next(
                    new HttpException(
                        e.status,
                        e.message
                    )
                )
                return
            }
            next(
                new HttpException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Có lỗi xảy ra vui lòng thử lại sau"
                )
            );
        }
    }

    @GET("/:storyId/react")
    @UseMiddleware(AuthorizeMiddleware)
    private async reacStory(req: Request, res: Response, next: NextFunction) {
        try {
            let idstory = Number(req.params.idstory)
            let react = Number(req.body.react)
            const iduser = Number(req.headers['iduser'] as string)
            let story = await this.storyService.reacStory(idstory, iduser, react)
            res.status(HttpStatus.OK).send(new ResponseBody(
                true,
                "OK",
                story
            ));
            return;
        } catch (e: any) {
            console.log("🚀 ~ file: story.controller.ts:121 ~ StoryController ~ getViewedStory=async ~ e:", e)
            if (e instanceof MyException) {
                next(
                    new HttpException(
                        e.status,
                        e.message
                    )
                )
                return 
            }
            next(
                new HttpException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Có lỗi xảy ra vui lòng thử lại sau"
                )
            );
        }
    } // TODO: check api is Ok ?

}