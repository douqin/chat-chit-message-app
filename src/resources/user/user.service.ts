import { UserServiceBehavior } from "./interface/user.service.interface";
import UserRepository from "./user.repository";

export default class UserService implements UserServiceBehavior {
    private userRepository: UserRepository
    constructor() {
        this.userRepository = new UserRepository()
    }
    async searchUser(phone: string): Promise<any> {
        await this.userRepository.searchUser(phone)
    }
} 