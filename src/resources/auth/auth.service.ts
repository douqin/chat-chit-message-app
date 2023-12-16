import { type LoginSuccessfully, User } from "../../models/user.model";
import AuthRepository from "./auth.repository";
import AuthHandler from '../../component/auth.handler'
import authHandler from "../../component/auth.handler";
import { JwtPayload } from "jsonwebtoken";
import MyException from "@/utils/exceptions/my.exception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import Gender from "./enums/gender.enum";
export default class AuthService {

    async loguot(iduser: number, refreshToken: string) {
        return await this.authRepository.loguot(iduser, refreshToken)
    }

    async getNewAccessToken(iduser: number, oldToken: string, refreshToken: string): Promise<string> {
        let token = await authHandler.generateAccessToken(String(iduser))
        if (token) {
            // this.authRepository.saveNewAccessToken(iduser, iduser)
            return token
        } else throw new Error("")
    }
    private authRepository: AuthRepository;

    constructor() {
        this.authRepository = new AuthRepository()
    }

    async login(phone: string, password: string, notificationToken: string): Promise<LoginSuccessfully | undefined> {
        let userRaw = await this.authRepository.login(phone, password, notificationToken);
        if (userRaw) {
            const {
                iduser
            } = userRaw
            let user: User = User.fromRawData(userRaw)
            if (user) {
                let fullToken = await AuthHandler.getFullToken(iduser, notificationToken)
                if (fullToken) {
                    let response: LoginSuccessfully = {
                        user: user,
                        token: fullToken
                    }
                    return response;
                }
            }
        }
        return undefined
    }
    async registerAccount(firstname: string, phone: any, password: any, birthday: Date, gender: Gender, username?: string, lastname?: string, email?: string, address?: string) {
        return await this.authRepository.registerAccount(firstname, phone, password, birthday, gender, username, lastname, email, address)
    }

}