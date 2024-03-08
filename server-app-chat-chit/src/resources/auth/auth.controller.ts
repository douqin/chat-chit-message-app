import HttpException from "@/utils/exceptions/http.exeception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import { NextFunction, Response, Request } from "express";
import { Server } from "socket.io";
import multer from "multer";
import { ResponseBody } from "@/utils/definition/http.response";
import MyException from "@/utils/exceptions/my.exception";
import {
  BadRequestException,
  InternalServerError,
} from "@/utils/exceptions/badrequest.expception";
import {
  JsonWebTokenError,
  JwtPayload,
  NotBeforeError,
  TokenExpiredError,
} from "jsonwebtoken";
import { container, inject } from "tsyringe";
import { Body, Controller } from "@/lib/decorator";
import { FileUpload } from "@/lib/decorator";
import { POST } from "@/lib/decorator";
import { MotherController } from "@/lib/common";
import AuthService from "./auth.service";
import { JwtAuthService } from "@/services/jwt/jwt.service";
import { convertToObjectDTO } from "@/utils/validate";
import { ConfirmAccountDTO } from "./dtos/confirm.account.dto";
import { eventbusMail, MailerEvent } from "./../../even-bus/mail"
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
    @Body() data : RegisterAccountDTO,
    res: Response,
    next: NextFunction
  ) {
    // let data = await convertToObjectDTO(RegisterAccountDTO, req.body as any, undefined, { validationError: { target: false } });
    await this.authService.registerAccount(data);
    await this.authService.createOTP({
      email: data.email,
      target: OTPTarget.REGISTER
    })
    res
      .status(HttpStatus.CREATED)
      .json(new ResponseBody(true, "OK", {}));
  }

  @POST("/verify-account")
  private async confirmAccount(
    req: Request,
    res: Response,
    next: NextFunction) {
    try {
      const dataOtp = await convertToObjectDTO(ConfirmAccountDTO, req.body as any, undefined, { validationError: { target: false } });
      await this.authService.verifyAccount(dataOtp);
      res.status(HttpStatus.OK).send(new ResponseBody(true, "OK", {}));
    }
    catch (e) {
      if (e instanceof MyException) {
        next(new HttpException(e.status, e.message));
      } else if (e instanceof TokenExpiredError) {
        next(new BadRequestException("Token expired"));
      } else if (e instanceof JsonWebTokenError) {
        next(new BadRequestException("Token invalid"));
      } else if (e instanceof NotBeforeError) {
        next(new BadRequestException("Token invalid"));
      } else {
        console.log("🚀 ~ file: auth.controller.ts:175 ~ AuthController ~ e:", e);
        next(
          new InternalServerError("An error occurred, please try again later.")
        );
      }
    }
  }

  @POST("/forgot-password/verify-otp")
  private async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const dataOtp = await convertToObjectDTO(ConfirmAccountDTO, req.body as any, undefined, { validationError: { target: false } });
      let data = await this.authService.verifyOtpForgotPassword(dataOtp);
      res.status(HttpStatus.OK).send(new ResponseBody(true, "OK", data));
    } catch (e: any) {
      if (e instanceof MyException) {
        next(new HttpException(e.status, e.message));
      } else if (e instanceof TokenExpiredError) {
        next(new BadRequestException("Token expired"));
      } else if (e instanceof JsonWebTokenError) {
        next(new BadRequestException("Token invalid"));
      } else if (e instanceof NotBeforeError) {
        next(new BadRequestException("Token invalid"));
      } else {
        console.log("🚀 ~ file: auth.controller.ts:175 ~ AuthController ~ e:", e);
        next(
          new InternalServerError("An error occurred, please try again later.")
        );
      }
    }
  }
  @POST("/forgot-password/reset-password")
  private async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const dataOtp = await convertToObjectDTO(ResetPasswordDto, req.body as any, undefined, { validationError: { target: false } });
      let data = await this.authService.resetPassword(dataOtp);
      res.status(HttpStatus.OK).send(new ResponseBody(true, "OK", {}));
    } catch (e: any) {
      if (e instanceof MyException) {
        next(new HttpException(e.status, e.message));
      } else if (e instanceof TokenExpiredError) {
        next(new BadRequestException("Token expired"));
      } else if (e instanceof JsonWebTokenError) {
        next(new BadRequestException("Token invalid"));
      } else if (e instanceof NotBeforeError) {
        next(new BadRequestException("Token invalid"));
      } else {
        console.log("🚀 ~ file: auth.controller.ts:175 ~ AuthController ~ e:", e);
        next(
          new InternalServerError("An error occurred, please try again later.")
        );
      }
    }
  }

  @POST("/create-otp")
  private async createOTP(req: Request, res: Response, next: NextFunction) {
    try {
      let dataOtp = await convertToObjectDTO(CreateOtpDTO, req.body as any, undefined, { validationError: { target: false } });
      let data = await this.authService.createOTP(dataOtp);
      res.status(HttpStatus.OK).send(new ResponseBody(true, "OK", data));
    } catch (e: any) {
      if (e instanceof MyException) {
        next(new HttpException(e.status, e.message));
      }
      else if (e instanceof TokenExpiredError) {
        next(new BadRequestException("Token expired"));
      } else if (e instanceof JsonWebTokenError) {
        next(new BadRequestException("Token invalid"));
      } else if (e instanceof NotBeforeError) {
        next(new BadRequestException("Token invalid"));
      } else {
        console.log("🚀 ~ file: auth.controller.ts:175 ~ AuthController ~ e:", e);
        next(
          new InternalServerError("An error occurred, please try again later.")
        );
      }
    }
  }

  @POST("/logout")
  private async logout(req: Request, res: Response, next: NextFunction) {
    try {
      let userId = Number(req.headers["userId"]);
      let refreshToken = req.body.refreshToken;
      if (refreshToken) {
        let isOK = await this.authService.loguot(userId, refreshToken);
        res.status(HttpStatus.OK).send(new ResponseBody(isOK, "", {}));
      } else next(new BadRequestException("Agurment is invalid"));
    } catch (e: any) {
      if (e instanceof MyException) {
        next(new HttpException(e.status, e.message));
      } else if (e instanceof TokenExpiredError) {
        next(new BadRequestException("Token expired"));
      } else if (e instanceof JsonWebTokenError) {
        next(new BadRequestException("Token invalid"));
      } else if (e instanceof NotBeforeError) {
        next(new BadRequestException("Token invalid"));
      } else {
        console.log("🚀 ~ file: auth.controller.ts:175 ~ AuthController ~ e:", e);
        next(
          new InternalServerError("An error occurred, please try again later.")
        );
      }
    }
  }

  @POST("/refreshtoken")
  private async getNewAccessToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const refreshToken = String(req.body.refreshtoken);
      let token = req.headers["authorization"] as string;
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
        res.status(HttpStatus.OK).json(
          new ResponseBody(true, "", {
            accessToken: newAccessToken,
          })
        );
        return;
      }
      next(new BadRequestException("Agurment is invalid"));
    } catch (e) {
      if (e instanceof MyException) {
        next(new HttpException(e.status, e.message));
      } else if (e instanceof TokenExpiredError) {
        next(new BadRequestException("Token expired"));
      } else if (e instanceof JsonWebTokenError) {
        next(new BadRequestException("Token invalid"));
      } else if (e instanceof NotBeforeError) {
        next(new BadRequestException("Token invalid"));
      } else {
        console.log("🚀 ~ file: auth.controller.ts:175 ~ AuthController ~ e:", e);
        next(
          new InternalServerError("An error occurred, please try again later.")
        );
      }
    }
  }
}
