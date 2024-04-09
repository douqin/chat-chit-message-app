import { Server } from "socket.io";
import multer from "multer";
import { ResponseBody } from "@/utils/definition/http.response";
import {
  JwtPayload,
} from "jsonwebtoken";
import { container, inject } from "tsyringe";
import { Body, Controller, Headers } from "@/lib/decorator";
import { FileUpload } from "@/lib/decorator";
import { POST } from "@/lib/decorator";
import { BadRequestException, HttpException, HttpStatus, MotherController } from "@/lib/common";
import AuthService from "./auth.service";
import { JwtAuthService } from "@/services/jwt/jwt.service";
import { ConfirmAccountDTO } from "./dtos/confirm.account.dto";
import { CreateOtpDTO } from "./dtos/create.otp";
import { ResetPasswordDto } from "./dtos/reset-password.dto";
import { RegisterAccountDTO } from "./dtos/register.account.dto";
import { OTPTarget } from "@/services/mail";
import { LoginSuccessfully } from "@/models/user.model";
import { HttpCode } from "@/lib/decorator/http.status/http-status-code";
@Controller("/auth")
export default class AuthController extends MotherController {
  constructor(
    @inject(Server) io: Server,
    @inject(AuthService) private authService: AuthService
  ) {
    super(io);
  }

  @HttpCode(HttpStatus.CREATED)
  @POST("/login")
  @FileUpload(multer().none())
  private async login(
    @Body("phone") phone: string,
    @Body("password") password: string,
    @Body("notificationToken") notificationToken: string,
  ): Promise<ResponseBody<LoginSuccessfully>> {
    console.log("🚀 ~ AuthController ~ phone:", phone)
    console.log("🚀 ~ AuthController ~ password:", password)
    if (phone && password) {
      let data = await this.authService.login(
        phone,
        password,
        notificationToken
      );
      if (data) {
        return new ResponseBody(true, "OK", data);
      } else {
        throw (
          new HttpException(
            HttpStatus.NOT_FOUND,
            "Incorrect username or password"
          )
        );
      }
    } else throw (new BadRequestException("Agurment is invalid"));
  }

  @HttpCode(HttpStatus.CREATED)
  @POST("/register")
  @FileUpload(multer().none())
  private async registerAccount(
    @Body() data: RegisterAccountDTO,
  ) {
    await this.authService.registerAccount(data);
    await this.authService.createOTP({
      email: data.email,
      target: OTPTarget.REGISTER
    })
    return new ResponseBody(true, "OK", {});
  }

  @POST("/verify-account")
  private async confirmAccount(
    @Body() dataOtp: ConfirmAccountDTO
  ) {
    await this.authService.verifyAccount(dataOtp);
    return new ResponseBody(true, "OK", {});
  }

  @POST("/forgot-password/verify-otp")
  private async forgotPassword(
    @Body() dataOtp: ConfirmAccountDTO
  ) {
    let data = await this.authService.verifyOtpForgotPassword(dataOtp);
    return new ResponseBody(true, "OK", data);
  }

  @POST("/forgot-password/reset-password")
  private async resetPassword(
    @Body() dataOtp: ResetPasswordDto
  ) {
    let data = await this.authService.resetPassword(dataOtp);
    return new ResponseBody(true, "OK", {});
  }

  @POST("/create-otp")
  private async createOTP(@Body() dataOtp: CreateOtpDTO) {
    let data = await this.authService.createOTP(dataOtp);
    return new ResponseBody(true, "OK", data);
  }

  @POST("/logout")
  private async logout(@Headers("userId") userId: number, @Body("refreshToken") refreshToken: string) {
    if (refreshToken) {
      let isOK = await this.authService.loguot(userId, refreshToken);
      return new ResponseBody(isOK, "", {});
    } else throw (new BadRequestException("Agurment is invalid"));
  }

  @POST("/refreshtoken")
  private async getNewAccessToken(
    @Body("refreshToken") refreshToken: string,
    @Headers("authorization") token: string
  ): Promise<ResponseBody<any>> {
    const jwtPayload = (await container
      .resolve(JwtAuthService)
      .decodeRefreshToken(refreshToken)) as JwtPayload;
    const { userId } = jwtPayload.payload;
    if (userId && refreshToken && token) {
      let newAccessToken = await this.authService.getNewAccessToken(
        userId,
        token,
        refreshToken
      );
      return new ResponseBody(true, "", {
        accessToken: newAccessToken,
      })
    }
    throw new BadRequestException("Agurment is invalid");
  }
}
