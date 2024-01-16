import { LoginSuccessfully } from "@/models/user.model"
import Gender from "../enums/gender.enum"

export default interface iServiceBeahvior {
    loguot(iduser: number, refreshToken: string) : Promise<boolean>

    getNewAccessToken(iduser: number, oldToken: string, refreshToken: string) : Promise<string>

    login(phone: string, password: string, notificationToken: string): Promise<LoginSuccessfully | undefined>
    registerAccount(firstname: string, phone: any, password: any, birthday: Date, gender: Gender, lastname?: string, email?: string, address?: string) : Promise<boolean>   
}