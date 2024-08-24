import { BadRequestException, MotherController } from "@/lib/common";
import UserService from "./user.service";
import { Server } from "socket.io";
import { ResponseBody } from "@/utils/definition/http.response";
import { AuthorizeGuard } from "@/middleware/auth.middleware";
import { inject } from "tsyringe";
import {
  Controller,
  GET,
  Headers,
  Params,
  Query,
  UseGuard,
} from "@/lib/decorator";

@Controller("/user")
export default class UserController extends MotherController {
  constructor(
    @inject(Server) io: Server,
    @inject(UserService) private userService: UserService
  ) {
    super(io);
  }
  @GET("/searchuser")
  @UseGuard(AuthorizeGuard)
  private async searchUser(@Query("phone") phone: string) {
    if (phone) {
      return new ResponseBody(
        true,
        "",
        await this.userService.searchUser(phone)
      );
    }
    throw new BadRequestException("Argument is invalid");
  }
  @GET("/:username")
  @UseGuard(AuthorizeGuard)
  private async inforUser(
    @Params("username") username: string,
    @Headers("userId") userId: number
  ) {
    let data = await this.userService.infoUser(userId, username);
    if (username) {
      return new ResponseBody(true, "", data);
    } else throw new BadRequestException("Argument is invalid");
  }
}
