import { User } from "@/models/user.model"
import { InforUserDto } from "../dtos/infor.user.dto"


export interface UserServiceBehavior {
    searchUser(phone: string): Promise<User>
    inforUser(iduser : number, username : string): Promise<InforUserDto>
}