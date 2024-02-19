import { JwtAuthService } from "../../services/jwt/jwt.service";
import { type LoginSuccessfully, User } from "../../models/user.model";
import AuthRepository from "./auth.repository";
import { RegisterAccountDTO } from "./dtos/register.account.dto";
import jwt, { sign as _sign, verify as _verify } from 'jsonwebtoken';
import { container, inject, injectable } from "tsyringe";
import { DatabaseCache } from "@/lib/database";
import { ConfirmAccountDTO } from "./dtos/confirm.account.dto";
import MyException from "@/utils/exceptions/my.exception";
import { OTPData, OTPTarget } from "@/services/mail/dto/otp.data";
import { eventbusMail, MailerEvent } from "../../even-bus/mail";
import { CreateOtpDTO } from "./dtos/create.otp";
import { ResetPasswordDto } from "./dtos/reset-password.dto";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import { DataResetPassword } from "./dtos/data.reset.password";
import { verifyOtpSuccessfully as VerifyOtpSuccessfully } from "./dtos/verify-otp-successfully";
import { Mutex, MutexInterface } from "async-mutex";
import { generateRandomSixDigitNumber } from "@/utils/extension/ramdom-number";

@injectable()
export default class AuthService {
    private mutex1 = new Mutex();
    private mutex2 = new Mutex();
    constructor(@inject(AuthRepository) private authRepository: AuthRepository,
        @inject(DatabaseCache) private databaseCache: DatabaseCache) {

    }
    async isExistEmail(email: string): Promise<boolean>{
        return await this.authRepository.isExistEmail(email)
    }
    async verifyOtpForgotPassword(dataOtp: ConfirmAccountDTO): Promise<VerifyOtpSuccessfully> {
        console.log("🚀 ~ AuthService ~ verifyOtpForgotPassword ~ dataOtp:", dataOtp)
        let strdata = await this.databaseCache.getInstance().get(dataOtp.email + ":" + `${OTPTarget.FORGOT_PASSWORD}`);
        console.log("🚀 ~ AuthService ~ verifyOtpForgotPassword ~ strdata:", strdata)
        if (strdata) {
            let data: OTPData = JSON.parse(strdata)
            console.log("🚀 ~ AuthService ~ verifyOtpForgotPassword ~ data:", data)
            if (data.otp == dataOtp.otp) {
                await this.databaseCache.getInstance().del(dataOtp.email + ":" + `${OTPTarget.FORGOT_PASSWORD}`);
                const key = crypto.randomUUID();
                await this.databaseCache.getInstance().set(key + ":" + OTPTarget.RESET_PASSWORD, (JSON.stringify(dataOtp.email)))
                await this.databaseCache.getInstance().expire(key + ":" + OTPTarget.RESET_PASSWORD, 60 * 1000)
                return {
                    email: dataOtp.email,
                    key: key
                }
            } else throw new MyException("OTP is incorrect").withExceptionCode(HttpStatus.BAD_REQUEST)
        } else throw new MyException("OTP is incorrect").withExceptionCode(HttpStatus.BAD_REQUEST)
    }

    async resetPassword(dataOtp: ResetPasswordDto) {
        let strdata = await this.databaseCache.getInstance().get(dataOtp.key + ":" + OTPTarget.RESET_PASSWORD);
        console.log("🚀 ~ AuthService ~ resetPassword ~ strdata:", strdata)
        if (strdata) {
            let data: string = JSON.parse(strdata)
            if (data) {
                await this.databaseCache.getInstance().del(dataOtp.key + ":" + OTPTarget.RESET_PASSWORD);
                await this.authRepository.resetPassword(dataOtp.email, dataOtp.newPassword)
            } else throw new MyException("OTP is incorrect").withExceptionCode(HttpStatus.BAD_REQUEST)
        } else throw new MyException("OTP is incorrect").withExceptionCode(HttpStatus.BAD_REQUEST)
    }

    async createOTP(o: CreateOtpDTO) {
        if(await this.authRepository.isExistEmail(o.email) == false) throw new MyException("Email is not exist").withExceptionCode(HttpStatus.BAD_REQUEST)
        switch (o.target) {
            case OTPTarget.REGISTER:
                const release1 = await this.mutex1.acquire();
                try {
                    let otpRegister = generateRandomSixDigitNumber();
                    let strdata = await this.databaseCache.getInstance().get(o.email + ":" + OTPTarget.REGISTER);
                    if (strdata) {
                        let data: OTPData = JSON.parse(strdata)
                        if (data.timeAbleReNew <= new Date().getTime()) {
                            eventbusMail.emit(MailerEvent.SEND_MAIL_OTP_REGISTER, {
                                email: o.email,
                                otp: otpRegister
                            })
                        } else throw new MyException(`Time limit in ${Math.floor((data.timeAbleReNew - new Date().getTime()) / 1000)} second`).withExceptionCode(HttpStatus.BAD_REQUEST)
                    } else {
                        eventbusMail.emit(MailerEvent.SEND_MAIL_OTP_REGISTER, {
                            email: o.email,
                            otp: otpRegister
                        })
                    }
                    await this.databaseCache.getInstance().set(o.email + ":" + OTPTarget.REGISTER, (JSON.stringify({
                        otp: otpRegister,
                        timeAbleResend: new Date().getTime() + 120,
                        target: OTPTarget.REGISTER
                    })))
                    await this.databaseCache.getInstance().expire(o.email + ":" + OTPTarget.REGISTER, 10 * 60)
                } finally {
                    release1();
                }
                break;
            case OTPTarget.FORGOT_PASSWORD:
                const release2 = await this.mutex2.acquire();
                try {
                    let otp = generateRandomSixDigitNumber();
                    let strdata2 = await this.databaseCache.getInstance().get(o.email + ":" + OTPTarget.FORGOT_PASSWORD);
                    if (strdata2) {
                        let data: OTPData = JSON.parse(strdata2)
                        if (data.timeAbleReNew <= new Date().getTime()) {
                            eventbusMail.emit(MailerEvent.FORGOT_PASSWORD, {
                                email: o.email,
                                otp: otp
                            })
                        } else throw new MyException(`Time limit in ${Math.floor((data.timeAbleReNew - new Date().getTime()) / 1000)} second`).withExceptionCode(HttpStatus.BAD_REQUEST)
                    } else {
                        eventbusMail.emit(MailerEvent.FORGOT_PASSWORD, {
                            email: o.email,
                            otp: otp
                        })
                    }
                    let otpData: OTPData = {
                        otp: otp,
                        timeAbleReNew: new Date().getTime() + 120000,
                        target: OTPTarget.FORGOT_PASSWORD
                    }
                    await this.databaseCache.getInstance().set(o.email + ":" + OTPTarget.FORGOT_PASSWORD, (JSON.stringify(otpData)))
                    await this.databaseCache.getInstance().expire(o.email + ":" + OTPTarget.FORGOT_PASSWORD, 10 * 60)
                } finally {
                    release2();
                }
                break;
        }
    }

    async verifyAccount(dataOtp: ConfirmAccountDTO) {
        let strdata = await this.databaseCache.getInstance().get(dataOtp.email + `${OTPTarget.REGISTER}`);
        if (strdata) {
            let data: OTPData = JSON.parse(strdata)
            if (data.otp == dataOtp.otp) {
                return await this.authRepository.verifyAccount(dataOtp.email)
            } else throw new MyException("OTP is incorrect").withExceptionCode(400)
        } else throw new MyException("OTP is incorrect").withExceptionCode(400)
    }
    async loguot(userId: number, refreshToken: string) {
        return await this.authRepository.loguot(userId, refreshToken)
    }

    async getNewAccessToken(userId: number, oldToken: string, refreshToken: string): Promise<string> {
        let token = await container.resolve(JwtAuthService).generateAccessToken(String(userId))
        if (token) {
            return token
        } else throw new Error("")
    }

    async login(phone: string, password: string, notificationToken: string): Promise<LoginSuccessfully | undefined> {
        let userRaw = await this.authRepository.login(phone, password, notificationToken);
        if (userRaw) {
            const {
                userId
            } = userRaw
            let user: User = User.fromRawData(userRaw)
            if (user) {
                let fullToken = await container.resolve(JwtAuthService).getFullToken(userId, notificationToken)
                if (fullToken) {
                    let response: LoginSuccessfully = {
                        user: user,
                        token: fullToken
                    }
                    await this.authRepository.saveFullToken(userId, fullToken, notificationToken)
                    return response;
                }
            }
        }
        return undefined
    }
    async registerAccount(registerData: RegisterAccountDTO) {
        return await this.authRepository.registerAccount(registerData)
    }
    async createKeyPair(userId: number) {
        crypto.randomUUID();
        // return await this.authRepository.createKeyPair(userId)
    }
}