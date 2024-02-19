import { User } from '../../models/user.model';
import MyException from "@/utils/exceptions/my.exception";
import MeRepository from "./me.repository";
import { inject, injectable } from 'tsyringe';

@injectable()
export default class MeService {
    async getMyProfile(userId: number) {
        let data = await this.meRepository.getMyProfile(userId)
        return User.fromRawData(data)
    }
    async changePassword(userId: number, password: any) {
        //TODO: check password 
        this.meRepository.changePassword(userId, password)
    }
    async updateMyprofile(userId: number, firstname: any, lastname: any, gender: any, birthday: any, bio: any, username: any) {
        this.meRepository.updateMyProfile(userId, firstname, lastname, gender, birthday, bio, username)
    }
    async changeBackground(userId: number, file: Express.Multer.File) {
        if (file.mimetype.includes('image')) {
            return await this.meRepository.changeBackground(userId, file)
        } else throw new MyException("File phải có định dạng img")
    }

    constructor(@inject(MeRepository) private meRepository: MeRepository) {
    }
    async changeAvatar(userId: number, file: Express.Multer.File) {
        if (file.mimetype.includes('image')) {
            return await this.meRepository.changeAvatar(userId, file)
        } else throw new MyException("File phải có định dạng img")
    }
} 