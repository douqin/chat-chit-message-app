import UserRepository from "./user.repository";

export default class UserService {
    private userRepository: UserRepository
    constructor() {
        this.userRepository = new UserRepository()
    }
} 