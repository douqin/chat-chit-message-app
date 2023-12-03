import { User } from "../../models/user.model";
import { UserRepositoryBehavior } from "./interface/user.repository.interface";
import { UserServiceBehavior } from "./interface/user.service.interface";
import UserRepository from "./user.repository";

export default class UserService implements UserServiceBehavior {
    private userRepository: UserRepositoryBehavior
    constructor() {
        this.userRepository = new UserRepository()
    }
    async inforUser(phone: string, username: string): Promise<User> {
        return User.fromRawData(
            await this.userRepository.inforUser(phone, username)
        )
    }

    async searchUser(phone: string): Promise<any> {
        return User.fromRawData(
            await this.userRepository.searchUser(phone)
        )
    }
} 