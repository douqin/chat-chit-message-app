import { LoginSuccessfully, User } from "./dtos/user.dto";
import loginRepository from "./login.repository";
import AuthHandler from '../../../component/auth.handler'
export default class LoginService {

    constructor() { }

    async login(phone: string, password: string, notificationToken: string = ""): Promise<LoginSuccessfully | undefined> {
        let userRaw = await loginRepository.login(phone, password);
        if (userRaw) {
            const {
                iduser
            } = userRaw[0]
            let user: User = User.fromRawData(userRaw[0])
            if (user) {
                let fullToken = await AuthHandler.getFullToken(iduser)
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
}