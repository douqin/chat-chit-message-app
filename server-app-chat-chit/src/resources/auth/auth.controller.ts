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
import { Controller } from "@/lib/decorator";
import { FileUpload } from "@/lib/decorator";
import { POST } from "@/lib/decorator";
import { MotherController } from "@/lib/base";
import { RegisterAccountDTO } from "./dtos/register.account.dto";
import AuthService from "./auth.service";
import { JwtService } from "@/services/jwt/jwt.service";
import { convertToObjectDTO } from "@/utils/validate";
import { ConfirmAccountDTO } from "./dtos/confirm.account.dto";
@Controller("/auth")
export default class AuthController extends MotherController {
  constructor(
    @inject(Server) io: Server,
    @inject(AuthService) private authService: AuthService
  ) {
    super(io);
  }

  @POST("/login")
  @FileUpload(multer().none())
  private async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const phone = String(req.body.phone);
      const password = String(req.body.password);
      const notificationToken = String(req.body.notification);
      if (phone && password && notificationToken) {
        let data = await this.authService.login(
          phone,
          password,
          notificationToken
        );
        if (data) {
          res.status(HttpStatus.OK).send(new ResponseBody(true, "OK", data));
        } else {
          next(
            new HttpException(
              HttpStatus.NOT_FOUND,
              "Incorrect username or password"
            )
          );
        }
      } else next(new BadRequestException("Agurment is invalid"));
    } catch (e: any) {
      console.log("🚀 ~ file: auth.controller.ts:76 ~ AuthController ~ e:", e);
      if (e instanceof MyException) {
        next(new HttpException(e.status, e.message));
        return;
      }
      console.log(
        "🚀 ~ file: login.controller.ts:64 ~ LoginController ~ error:",
        e
      );
      next(
        next(
          new InternalServerError("An error occurred, please try again later.")
        )
      );
    }
  }

  // TODO: confirm account
  // TODO: reset otp: confirm account
  @POST("/register")
  @FileUpload(multer().none())
  private async registerAccount(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let data = await convertToObjectDTO(RegisterAccountDTO, req.body as any, undefined, { validationError: { target: false } });
      await this.authService.registerAccount(data);
      res
        .status(HttpStatus.CREATED)
        .json(new ResponseBody(true, "OK", {}));
    } catch (e) {
      if (e instanceof MyException) {
        next(new HttpException(e.status, e.message));
      }
      else if (Array.isArray(e)) {
        next(new BadRequestException(JSON.parse(JSON.stringify(e))));
      } else {
        console.log("🚀 ~ AuthController ~ e:", e)
        next(
          next(
            new InternalServerError("An error occurred, please try again later.")
          )
        );
      }
    }
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
      }
      else if (Array.isArray(e)) {
        next(new BadRequestException(JSON.parse(JSON.stringify(e))));
      }
      else {
        console.log("🚀 ~ file: auth.controller.ts:175 ~ AuthController ~ e:", e);
        next(
          new InternalServerError("An error occurred, please try again later.")
        );
      }
    }
  }

  @POST("/forgot-password")
  private async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let phone = String(req.body.phone);
      // let data = await this.authService.forgotPassword(phone);
      // res.status(HttpStatus.OK).send(new ResponseBody(true, "OK", data));
    } catch (e: any) {
      console.log("🚀 ~ file: auth.controller.ts:144 ~ AuthController ~ e:", e);
      if (e instanceof HttpException) {
        next(e);
      } else
        next(
          new InternalServerError("An error occurred, please try again later.")
        );
    }
  }

  @POST("/reset-otp")
  private async resetOTP(req: Request, res: Response, next: NextFunction) {
    try {
      let phone = String(req.body.phone);
      // let data = await this.authService.resetOTP(phone);
      // res.status(HttpStatus.OK).send(new ResponseBody(true, "OK", data));
    } catch (e: any) {
      console.log("🚀 ~ file: auth.controller.ts:144 ~ AuthController ~ e:", e);
      if (e instanceof HttpException) {
        next(e);
      } else
        next(
          new InternalServerError("An error occurred, please try again later.")
        );
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
      console.log("🚀 ~ file: auth.controller.ts:144 ~ AuthController ~ e:", e);
      if (e instanceof HttpException) {
        next(e);
      }
      next(
        next(
          new InternalServerError("An error occurred, please try again later.")
        )
      );
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
        .resolve(JwtService)
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
