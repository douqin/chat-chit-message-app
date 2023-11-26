import { User } from "@/resources/auth/dtos/user.dto"

export interface UserServiceBehavior {
    searchUser(phone: string): Promise<User>
    inforUser(phone: string, username : string): Promise<User>
}