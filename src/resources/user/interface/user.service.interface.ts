import { User } from "@/models/user.model"


export interface UserServiceBehavior {
    searchUser(phone: string): Promise<User>
    inforUser(phone: string, username : string): Promise<User>
}