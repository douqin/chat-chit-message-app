import { AuthorizeGuard } from "@/middleware/auth.middleware";
import { ResponseBody } from "@/utils/definition/http.response";
import { BadRequestException, MotherController } from "@/lib/common";
import { Response, Request, NextFunction } from "express";
import multer from "multer";
import { Server } from "socket.io";
import { convertToObjectDTO, isValidNumberVariable } from "@/utils/validate";
import { inject } from "tsyringe";
import StoryService from "./story.service";
import { Controller, POST, FileUpload, GET, UseMiddleware as UseGuard, DELETE, Params, Headers, Query, Body } from "@/lib/decorator";
import { ValidateErrorBuilder } from "@/utils/validate";
import { OptionUploadStoryDTO } from "./dtos/upload.story";
import { deleteFile, getOptionDefaultForMulter as getOptionDefaultForMulter } from "@/utils/extension/file.upload";
import { LoveStoryDTO } from "./dtos/love.story";
import { PagingReq } from "@/utils/paging/paging.data";

@Controller("/story")
export default class StoryController extends MotherController {

    constructor(@inject(Server) io: Server, @inject(StoryService) private storyService: StoryService) {
        super(io);
    }

    @GET("/story/:userId")
    @UseGuard(AuthorizeGuard)
    private async getStoryFromUser(req: Request, res: Response, next: NextFunction) {
        let userId = Number(req.params.userId)
        let me = Number(req.headers['userId'])
        if (isValidNumberVariable(userId)) {
            let option = await convertToObjectDTO(PagingReq, req.query, {}, {
                validationError: {
                    target: false
                }
            });
            let story = await this.storyService.getStoryFromUser(me, userId, option.cursor, option.limit)
            return new ResponseBody(
                true,
                "OK",
                story
            );
        } else {
            throw (new ValidateErrorBuilder().setProperty("userId").setConstraints({ "userId": "userId is required" }).WrapArrayToJson())
        }
    }

    @POST("/upload")
    @FileUpload(multer(getOptionDefaultForMulter('story')).single("story"))
    @UseGuard(AuthorizeGuard)
    private async uploadStory(req: Request, res: Response, next: NextFunction) {
        let option = await convertToObjectDTO(OptionUploadStoryDTO, req.body, {}, {
            validationError: {
                target: false
            }
        })
        if (req.file) {
            const userId = Number(req.headers['userId'] as string)
            let storyId = await this.storyService.uploadStory(userId, req.file, option)
            if (req.file) {
                deleteFile(req.file.filename)
            }
            return new ResponseBody(
                true,
                "OK",
                {
                    storyId: storyId
                }
            )
        }
        throw (
            new BadRequestException(
                new ValidateErrorBuilder()
                    .setProperty("file")
                    .setConstraints({ "file": "File is required" })
                    .WrapArrayToJson()
            ));

    }
    @GET('/explore/reel')
    @UseGuard(AuthorizeGuard)
    private async exploreStoryFriend(req: Request, res: Response, next: NextFunction) {
        const userId = Number(req.headers['userId'] as string)
        let option = await convertToObjectDTO(PagingReq, req.query, {}, {
            validationError: {
                target: false
            }
        });
        let story = await this.storyService.getStoryFromFriends(userId, option.cursor, option.limit)
        return new ResponseBody(
            true,
            "OK",
            story
        );

    }
    //FIXME: fix sql (add feature cursor and limit)
    @DELETE("/me/:storyId")
    @UseGuard(AuthorizeGuard)
    private async deleteStory(@Params("storyId") storyId: number, @Headers("userId") userId: number) {
        if (!isValidNumberVariable(storyId)) {
            throw (new BadRequestException(new ValidateErrorBuilder()
                .setProperty("storyId")
                .setConstraints({
                    storyId: "storyId must be number"
                })
                .WrapArrayToJson()))
        }
        await this.storyService.deleteStory(userId, storyId)
        return new ResponseBody(
            true,
            "OK",
            {}
        );
    }
    // seen story
    @POST("/:storyId/action/seen")
    @UseGuard(AuthorizeGuard)
    private async seeStoryFriend(@Params("storyId") storyId: number, @Headers("userId") userId: number) {
        if (isValidNumberVariable(storyId)) {
            await this.storyService.seeStory(userId, storyId)
            //TODO: notice to owner story
            return (new ResponseBody(
                true,
                "OK",
                {}
            ));
        } else throw (
            new BadRequestException(new ValidateErrorBuilder()
                .setProperty("storyId")
                .setConstraints({
                    storyId: "storyId must be number"
                })
                .WrapArrayToJson())
        );
    }

    @POST("/:storyId/action/love")
    @UseGuard(AuthorizeGuard)
    private async loveStory(@Params("storyId") storyId: number, @Headers("userId") userId: number, @Body() data : LoveStoryDTO) {
        if (!isValidNumberVariable(storyId)) {
            throw (new BadRequestException(new ValidateErrorBuilder()
                .setProperty("storyId")
                .setConstraints({
                    storyId: "storyId must be number"
                })
                .WrapArrayToJson()))
        }
        let story = await this.storyService.loveStory(storyId, userId, (data.isLove))
        //TODO: notice to owner story
        throw (new ResponseBody(
            true,
            "OK",
            story
        ));
    }

    @GET("/me/:userId/:storyId")
    @UseGuard(AuthorizeGuard)
    private async getStoryById(@Params("storyId") storyId: number, @Headers("userId") me: number, @Params("userId") userIdOwnerStory: number) {
        if (isValidNumberVariable(storyId)) {
            let story = await this.storyService.getStoryById(userIdOwnerStory, me, storyId)
            return (new ResponseBody(
                true,
                "OK",
                story
            ));
            return;
        } else {
            throw (new ValidateErrorBuilder().setProperty("storyId").setConstraints({ "storyId": "storyId is required" }).WrapArrayToJson())
        }
    }
    @GET("/uploaded/me")
    @UseGuard(AuthorizeGuard)
    private async getMyListStory(@Headers("userId") me: number, @Query() option: PagingReq) {
        let story = await this.storyService.getMyListStory(me, option.cursor, option.limit)
        return (new ResponseBody(
            true,
            "OK",
            story
        ));
    }
}