import HttpException from "@/utils/exceptions/http.exeception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import { NextFunction, Response, Request } from "express";
import { Server } from "socket.io";
import AuthService from "./auth.service";
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
import {
  RegisterAccountDTO,
  RegisterAccountDTOSchema,
} from "./dtos/register.account.dto";
import { Controller } from "@/lib/decorator";
import { FileUpload } from "@/lib/decorator";
import { POST } from "@/lib/decorator";
import { JwtService } from "src/services/jwt/jwt.service";
import { MotherController } from "@/lib/base";
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
      let data: RegisterAccountDTO = RegisterAccountDTOSchema.parse(req.body);
      await this.authService.registerAccount(data);
      res
        .status(HttpStatus.OK)
        .json(new ResponseBody(true, "Tạo tài khoản thành công", {}));
    } catch (e) {
      console.log("🚀 ~ file: auth.controller.ts:105 ~ AuthController ~ e:", e);
      if (e instanceof MyException) {
        next(new HttpException(e.status, e.message));
      }
      next(
        next(
          new InternalServerError("An error occurred, please try again later.")
        )
      );
    }
  }

  @POST("/logout")
  private async logout(req: Request, res: Response, next: NextFunction) {
    try {
      let iduser = Number(req.headers["iduser"]);
      let refreshToken = req.body.refreshToken;
      if (refreshToken) {
        let isOK = await this.authService.loguot(iduser, refreshToken);
        console.log(
          "🚀 ~ file: auth.controller.ts:137 ~ AuthController ~ req.cookies:",
          res.cookie
        );
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
      const { iduser } = jwtPayload.payload;
      if (iduser && refreshToken && token) {
        let newAccessToken = await this.authService.getNewAccessToken(
          iduser,
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
      }
      console.log("🚀 ~ file: auth.controller.ts:175 ~ AuthController ~ e:", e);
      next(
        next(
          new InternalServerError("An error occurred, please try again later.")
        )
      );
    }
  }
}
