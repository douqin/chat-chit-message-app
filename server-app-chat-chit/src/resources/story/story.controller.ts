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
import { OptionUploadStoryDTO } from "./dtos/upload.story";
import { deleteFile, getOptionForMulter as getOptionDefaultForMulter } from "@/utils/extension/file.upload";
import { LoveStoryDTO } from "./dtos/love.story";
import { PagingReq } from "@/utils/paging/paging.data";

@Controller("/story")
export default class StoryController extends MotherController {

    constructor(@inject(Server) io: Server, @inject(StoryService) private storyService: StoryService) {
        super(io);
    }

    @POST("/upload")
    @FileUpload(multer(getOptionDefaultForMulter('story')).single("story"))
    @UseGuard(AuthorizeGuard)
    private async uploadStory(req: Request, res: Response, next: NextFunction) {
        try {
            let option = await convertToObjectDTO(OptionUploadStoryDTO, req.body, {}, {
                validationError: {
                    target: false
                }
            })
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
        finally {
            if (req.file) {
                deleteFile(req.file.filename)
            }
        }
    }
    @GET('/explore/reel')
    @UseGuard(AuthorizeGuard)
    private async exploreStoryFriend(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.headers['userId'] as string)
            let option = await convertToObjectDTO(PagingReq, req.query, {}, {
                validationError: {
                    target: false
                }
            });
            let story = await this.storyService.getStoryFromFriends(userId, option.cursor, option.limit)
            res.status(HttpStatus.OK).send(new ResponseBody(
                true,
                "OK",
                story
            ));

        } catch (e: any) {
            if (e instanceof MyException) {
                next(
                    new HttpException(
                        e.status,
                        e.message
                    )
                )
                return
            } else if (Array.isArray(e)) {
                next(
                    new BadRequestException(JSON.parse(JSON.stringify(e)))
                )
            }
            else {
                console.log("🚀 ~ file: story.controller.ts:85 ~ StoryController ~ getAllStoryFromFriends= ~ e:", e)
                next(
                    new HttpException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Có lỗi xảy ra vui lòng thử lại sau"
                    )
                );
            }
        }
    } //FIXME: fix sql (add feature cursor and limit)
    @DELETE("/me/:storyId")
    @UseGuard(AuthorizeGuard)
    private async deleteStory(req: Request, res: Response, next: NextFunction) {
        try {
            let storyId = Number(req.params.storyId)
            if (isValidNumberVariable(storyId)) {
                next(new BadRequestException(new ValidateErrorBuilder()
                    .setProperty("storyId")
                    .setConstraints({
                        storyId: "storyId must be number"
                    })
                    .WrapArrayToJson()))
                return
            }
            const userId = Number(req.headers['userId'] as string)
            await this.storyService.deleteStory(userId, storyId)
            res.status(HttpStatus.OK).send(new ResponseBody(
                true,
                "OK",
                {}
            ));
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
                console.log("🚀 ~ file: story.controller.ts:48 ~ StoryController ~ uploadStory= ~ e:", e)
                next(
                    new HttpException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Có lỗi xảy ra vui lòng thử lại sau"
                    )
                );
            }
        }
    }
    // seen story
    @POST("/:storyId/action/seen")
    @UseGuard(AuthorizeGuard)
    private async seeStoryFriend(req: Request, res: Response, next: NextFunction) {
        try {
            let storyId = Number(req.params.storyId)
            if (isValidNumberVariable(storyId)) {
                const userId = Number(req.headers['userId'] as string)
                await this.storyService.seeStory(userId, storyId)
                //TODO: notice to owner story
                res.status(HttpStatus.OK).send(new ResponseBody(
                    true,
                    "OK",
                    {}
                ));
            } else next(
                new BadRequestException(new ValidateErrorBuilder()
                    .setProperty("storyId")
                    .setConstraints({
                        storyId: "storyId must be number"
                    })
                    .WrapArrayToJson())
            );
            return;
        } catch (e: any) {
            if (e instanceof MyException) {
                next(
                    new HttpException(
                        e.status,
                        e.message
                    )
                )
                return
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
    }

    @GET("/:storyId/action/love")
    @UseGuard(AuthorizeGuard)
    private async loveStory(req: Request, res: Response, next: NextFunction) {
        try {
            let storyId = Number(req.params.storyId)
            if (isValidNumberVariable(storyId)) {
                next(new BadRequestException(new ValidateErrorBuilder()
                    .setProperty("storyId")
                    .setConstraints({
                        storyId: "storyId must be number"
                    })
                    .WrapArrayToJson()))
                return
            }
            let data = await convertToObjectDTO(LoveStoryDTO, req.body, {}, {
                validationError: {
                    target: false
                }
            })
            const userId = Number(req.headers['userId'] as string)
            let story = await this.storyService.loveStory(storyId, userId, data.isLove)
            //TODO: notice to owner story
            res.status(HttpStatus.OK).send(new ResponseBody(
                true,
                "OK",
                story
            ));
            return;
        } catch (e: any) {
            if (e instanceof MyException) {
                next(
                    new HttpException(
                        e.status,
                        e.message
                    )
                )
                return
            } else if (Array.isArray(e)) {
                next(
                    new BadRequestException(JSON.parse(JSON.stringify(e)))
                )
            }
            else {
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

    @GET("/:userId/:storyId")
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
    @GET("/me")
    @UseGuard(AuthorizeGuard)
    private async getMyListStory(req: Request, res: Response, next: NextFunction) {
        try {
            let me = Number(req.headers['userId'])
            let option = await convertToObjectDTO(PagingReq, req.query, {}, {
                validationError: {
                    target: false
                }
            });
            let story = await this.storyService.getMyListStory(me, option.cursor, option.limit)
            res.status(HttpStatus.OK).send(new ResponseBody(
                true,
                "OK",
                story
            ));
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
            } else if (Array.isArray(e)) {
                next(
                    new BadRequestException(JSON.parse(JSON.stringify(e)))
                )
            }
            else {
                console.log("🚀 ~ file: story.controller.ts:85 ~ StoryController ~ getAllStoryFromFriends= ~ e:", e)
                next(
                    new HttpException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Có lỗi xảy ra vui lòng thử lại sau"
                    )
                );
            }
        }
    } //FIXME: fix sql (add feature cursor and limit)
}