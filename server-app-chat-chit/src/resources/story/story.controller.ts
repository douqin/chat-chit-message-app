import { AuthorizeGuard } from "@/middleware/auth.middleware";
import { ResponseBody } from "@/utils/definition/http.response";
import HttpException from "@/utils/exceptions/http.exeception";
import MyException from "@/utils/exceptions/my.exception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import { MotherController } from "@/lib/base";
import { Response, Request, NextFunction } from "express";
import multer from "multer";
import { Server } from "socket.io";
import { convertToObjectDTO, isValidNumberVariable } from "@/utils/validate";
import { inject } from "tsyringe";
import StoryService from "./story.service";
import { Controller, POST, FileUpload, GET, UseMiddleware as UseGuard, DELETE } from "@/lib/decorator";
import { BadRequestException } from "@/utils/exceptions/badrequest.expception";
import { ValidateErrorBuilder } from "@/utils/validate";
import { OptionUploadStoryDTO } from "./dtos/upload.stoty";
import { deleteFile, getOptionForMulter, getUriUpload } from "@/utils/extension/file.upload";

@Controller("/story")
export default class StoryController extends MotherController {

    constructor(@inject(Server) io: Server, @inject(StoryService) private storyService: StoryService) {
        super(io);
    }

    @POST("/upload")
    @FileUpload(multer(getOptionForMulter('story')).single("story"))
    @UseGuard(AuthorizeGuard)
    private async uploadStory(req: Request, res: Response, next: NextFunction) {
        try {
            let option = await convertToObjectDTO(OptionUploadStoryDTO, req.body, {}, {})
            if (req.file) {
                const userId = Number(req.headers['userId'] as string)
                let storyId = await this.storyService.uploadStory(userId, req.file, option)
                res.status(HttpStatus.OK).send(new ResponseBody(
                    true,
                    "OK",
                    {
                        storyId: storyId
                    }
                ));
                return;
            }
            next(
                new BadRequestException(
                    new ValidateErrorBuilder()
                        .setProperty("file")
                        .setConstraints({ "file": "File is required" })
                        .WrapArrayToJson()
                ));
        } catch (e: any) {
            if (e instanceof MyException) {
                next(
                    e
                )
                return
            } else if (Array.isArray(e)) {
                next(new BadRequestException(JSON.parse(JSON.stringify(e))));
            }
            else {
                console.log("🚀 ~ file: story.controller.ts:48 ~ StoryController ~ uploadStory= ~ e:", e)
                next(
                    new HttpException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Có lỗi xảy ra vui lòng thử lại sau"
                    )
                );
            }
        }
        finally{
            if(req.file){
                deleteFile(req.file.filename)
            }
        }
    }
    @GET('')
    @UseGuard(AuthorizeGuard)
    private async getAllStoryFromFriends(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.headers['userId'] as string)
            let story = await this.storyService.getAllStoryFromFriends(userId)
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
    @UseGuard(AuthorizeGuard)
    private async deleteStory(req: Request, res: Response, next: NextFunction) {
        try {
            let idstory = Number(req.params.storyId)
            const userId = Number(req.headers['userId'] as string)
            let story = await this.storyService.seeStory(userId, idstory)
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
    @UseGuard(AuthorizeGuard)
    private async seeStoryFriend(req: Request, res: Response, next: NextFunction) {
        try {
            let idstory = Number(req.params.storyId)
            if (isValidNumberVariable(idstory)) {
                const userId = Number(req.headers['userId'] as string)
                let story = await this.storyService.seeStory(userId, idstory)
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
    @UseGuard(AuthorizeGuard)
    private async reacStory(req: Request, res: Response, next: NextFunction) {
        try {
            let idstory = Number(req.params.idstory)
            let react = Number(req.body.react)
            const userId = Number(req.headers['userId'] as string)
            let story = await this.storyService.reacStory(idstory, userId, react)
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

    @GET(":userId/:storyId")
    @UseGuard(AuthorizeGuard)
    private async getStoryById(req: Request, res: Response, next: NextFunction) {
        try {
            let me = Number(req.headers['userId'])
            let userIdOwnerStory = Number(req.params.userId)
            let storyId = Number(req.params.storyId)
            if (isValidNumberVariable(storyId)) {
                const userId = Number(req.headers['userId'] as string)
                let story = await this.storyService.getStoryById(userIdOwnerStory, me, storyId)
                res.status(HttpStatus.OK).send(new ResponseBody(
                    true,
                    "OK",
                    story
                ));
                return;
            } else {
                next(new ValidateErrorBuilder().setProperty("storyId").setConstraints({ "storyId": "storyId is required" }).WrapArrayToJson())
            }
        } catch (e: any) {
            if (e instanceof MyException) {
                next(
                    new HttpException(
                        e.status,
                        e.message
                    )
                )
                return
            } else {
                console.log("🚀 ~ file: story.controller.ts:121 ~ StoryController ~ getViewedStory=async ~ e:", e)
                next(
                    new HttpException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Có lỗi xảy ra vui lòng thử lại sau"
                    )
                );
            }
        }
    }
}