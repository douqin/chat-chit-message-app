import { LoginSuccessfully, User } from "./dtos/user.dto";
import AuthRepository from "./auth.repository";
import AuthHandler from '../../component/auth.handler'
import authHandler from "../../component/auth.handler";
import { JwtPayload } from "jsonwebtoken";
import MyException from "@/utils/exceptions/my.exception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
export default class AuthService {
    async getNewAccessToken(iduser: number, oldToken: string, refreshToken: string): Promise<string> {
        let jwtPayload = authHandler.decodeRefreshToken(refreshToken) as JwtPayload;
        if (Number(jwtPayload.payload.iduser) === iduser) {
            let token = await authHandler.generateAccessToken(String(iduser))
            if (token) {
                this.authRepository.saveNewAccessToken(iduser, iduser)
            } else throw new Error("")
        }
        throw new MyException("Token không hợp lệ").withExceptionCode(HttpStatus.BAD_REQUEST)
    }
    private authRepository: AuthRepository;
    constructor() {
        this.authRepository = new AuthRepository()
    }

    async login(phone: string, password: string, notificationToken : string): Promise<LoginSuccessfully | undefined> {
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
    async registerAccount(name: string, phone: any, password: any) {
        return await this.authRepository.registerAccount(name, phone, password)
    }

}