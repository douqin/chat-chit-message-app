import { User } from "@/models/user.model"

export interface iUserRepositoryBehavior {
    searchUser(phone: string): Promise<User>
    infoUser(username: string): Promise<any>
}