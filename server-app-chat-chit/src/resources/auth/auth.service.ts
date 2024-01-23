import { JwtService } from "../../services/jwt/jwt.service";
import { type LoginSuccessfully, User } from "../../models/user.model";
import AuthRepository from "./auth.repository";
import { RegisterAccountDTO } from "./dtos/register.account.dto";
import Gender from "./enums/gender.enum";
import { container, inject, injectable } from "tsyringe";

@injectable()
export default class AuthService {

    constructor(@inject(AuthRepository) private authRepository: AuthRepository) {
        
    }

    async loguot(iduser: number, refreshToken: string) {
        return await this.authRepository.loguot(iduser, refreshToken)
    }

    async getNewAccessToken(iduser: number, oldToken: string, refreshToken: string): Promise<string> {
        let token = await container.resolve(JwtService).generateAccessToken(String(iduser))
        if (token) {
            return token
        } else throw new Error("")
    }

    async login(phone: string, password: string, notificationToken: string): Promise<LoginSuccessfully | undefined> {
        let userRaw = await this.authRepository.login(phone, password, notificationToken);
        if (userRaw) {
            const {
                iduser
            } = userRaw
            let user: User = User.fromRawData(userRaw)
            if (user) {
                let fullToken = await container.resolve(JwtService).getFullToken(iduser, notificationToken)
                if (fullToken) {
                    let response: LoginSuccessfully = {
                        user: user,
                        token: fullToken
                    }
                    await this.authRepository.saveFullToken(iduser, fullToken, notificationToken)
                    return response;
                }
            }
        }
        return undefined
    }
    async registerAccount( registerData : RegisterAccountDTO) {
        return await this.authRepository.registerAccount(registerData)
    }

}