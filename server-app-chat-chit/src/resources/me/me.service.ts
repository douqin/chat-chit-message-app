import { User } from '../../models/user.model';
import MyException from "@/utils/exceptions/my.exception";
import MeRepository from "./me.repository";
import { inject, injectable } from 'tsyringe';

@injectable()
export default class MeService {
    async getMyProfile(iduser: number) {
        let data = await this.meRepository.getMyProfile(iduser)
        return User.fromRawData(data)
    }
    async changePassword(iduser: number, password: any) {
        //TODO: check password 
        this.meRepository.changePassword(iduser, password)
    }
    async updateMyprofile(iduser: number, firstname: any, lastname: any, gender: any, birthday: any, bio: any, username: any) {
        this.meRepository.updateMyProfile(iduser, firstname, lastname, gender, birthday, bio, username)
    }
    async changeBackground(iduser: number, file: Express.Multer.File) {
        if (file.mimetype.includes('image')) {
            return await this.meRepository.changeBackground(iduser, file)
        } else throw new MyException("File phải có định dạng img")
    }

    constructor(@inject(MeRepository) private meRepository: MeRepository) {
    }
    async changeAvatar(iduser: number, file: Express.Multer.File) {
        if (file.mimetype.includes('image')) {
            return await this.meRepository.changeAvatar(iduser, file)
        } else throw new MyException("File phải có định dạng img")
    }
} 