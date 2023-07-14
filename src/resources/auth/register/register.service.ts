import RegisterRepository from "./register.repositry";

export default class RegisterService {
    registerRepository: RegisterRepository;
    constructor(){
        this.registerRepository = new RegisterRepository();
    }
    async registerAccount(name : string, phone: any, password: any)  {
        return await this.registerRepository.registerAccount(name, phone, password)
    }

}