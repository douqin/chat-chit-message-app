import AuthMiddleware from "@/middleware/auth.middleware";
import { ResponseBody } from "@/utils/definition/http.response";
import HttpException from "@/utils/exceptions/http.exeception";
import MyException from "@/utils/exceptions/my.exception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import MotherController from "@/utils/interface/controller.interface";
import { Response, Request, NextFunction } from "express";
import multer from "multer";
import { Server } from "socket.io";
import iStoryServiceBehavior from "./interfaces/story.service.interface";
import validVariable from "@/utils/extension/vailid_variable";
import { inject, injectable, singleton } from "tsyringe";
import Controller from "@/utils/decorator/controller";
import StoryService from "./story.service";

@Controller("story")
export default class StoryController extends MotherController {
    
    constructor(@inject(Server) io: Server, @inject(StoryService) private storyService: StoryService) {
        super(io);
    }

    initRouter(): MotherController {
        this.router.get("/:idstory/react", AuthMiddleware.auth, this.reacStory)
        this.router.get("", AuthMiddleware.auth, this.getAllStoryFromFriends)
        this.router.post("/upload", AuthMiddleware.auth, multer().single("story"), this.uploadStory)
        this.router.delete("/delete", AuthMiddleware.auth, multer().none(), this.deleteStory)
        this.router.post("/see", AuthMiddleware.auth, multer().none(), this.seeStoryFriend)
        this.router.post("/getviewedstory", AuthMiddleware.auth, multer().none(), this.getViewedStory)
        return this;
    }
    // upload story
    private uploadStory = async (req: Request, res: Response, next: NextFunction) => {
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
                new HttpException(
                    HttpStatus.BAD_REQUEST,
                    "File lỗi"
                )
            );
        } catch (e: any) {
            console.log("🚀 ~ file: story.controller.ts:48 ~ StoryController ~ uploadStory= ~ e:", e)
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
    }
    // get story friends
    private getAllStoryFromFriends = async (req: Request, res: Response, next: NextFunction) => {
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
    private deleteStory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let idstory = Number(req.body.idstory)
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
    private seeStoryFriend = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let idstory = Number(req.params.idstory)
            if (validVariable(idstory)) {
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
            }
            next(
                new HttpException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Có lỗi xảy ra vui lòng thử lại sau"
                )
            );
        }
    }

    private getViewedStory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const iduser = Number(req.headers['iduser'] as string)
            let story = await this.storyService.getViewedStory(iduser)
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
            }
            next(
                new HttpException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Có lỗi xảy ra vui lòng thử lại sau"
                )
            );
        }
    }

    private reacStory = async (req: Request, res: Response, next: NextFunction) => {
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