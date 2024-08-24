import { User } from "@/models/user.model"
import { InfoUserDto } from "../dtos/infor.user.dto"


export interface UserServiceBehavior {
    searchUser(phone: string): Promise<User>
    infoUser(userId : number, username : string): Promise<InfoUserDto>
}