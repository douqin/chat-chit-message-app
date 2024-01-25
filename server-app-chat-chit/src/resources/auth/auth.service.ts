import { JwtService } from "../../services/jwt/jwt.service";
import { type LoginSuccessfully, User } from "../../models/user.model";
import AuthRepository from "./auth.repository";
import { RegisterAccountDTO } from "./dtos/register.account.dto";
import Gender from "./enums/gender.enum";
import { container, inject, injectable } from "tsyringe";
import { DatabaseCache } from "@/lib/database";
import { ConfirmAccountDTO } from "./dtos/confirm.account.dto";
import MyException from "@/utils/exceptions/my.exception";

@injectable()
export default class AuthService {

    constructor(@inject(AuthRepository) private authRepository: AuthRepository,
        @inject(DatabaseCache) private databaseCache: DatabaseCache) { }
    async verifyAccount(dataOtp: ConfirmAccountDTO) {
        let key = await this.databaseCache.getInstance().hget("otp", dataOtp.phone);
        if (key) {
            if (key == dataOtp.otp) {
                return await this.authRepository.confirmAccount(dataOtp)
            } else throw new MyException("OTP is incorrect")
        } else throw new MyException("OTP is incorrect")
    }
    async loguot(userId: number, refreshToken: string) {
        return await this.authRepository.loguot(userId, refreshToken)
    }

    async getNewAccessToken(userId: number, oldToken: string, refreshToken: string): Promise<string> {
        let token = await container.resolve(JwtService).generateAccessToken(String(userId))
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
                let fullToken = await container.resolve(JwtService).getFullToken(userId, notificationToken)
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