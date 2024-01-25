import { Database, iDatabase } from "@/lib/database";
import { iDrive } from "@/services/cloud/drive.interface";
import { CloudDrive } from "@/services/cloud/drive.service";
import { dateStrJSToMysql } from "@/utils/extension/date.transform";
import { inject, injectable } from "tsyringe";


@injectable()
export default class MeRepository {

    constructor(@inject(CloudDrive) private drive: iDrive, @inject(Database) private db: iDatabase) { }

    async getMyProfile(userId: number) {
        const query = 'SELECT user.phone, user.firstname, user.lastname, user.gender,user.birthday, user.bio, user.username, user.avatar, user.background FROM user WHERE user.userId = ?'
        let [data, inforC] = await this.db.executeQuery(query, [userId]) as any
        if (data[0]) {
            const {
                avatar
            } = data[0]
            if (avatar) {
                data[0].avatar = this.drive.getUrlFile(avatar)
            }
        }
        return data[0]
    }
    async changePassword(userId: number, password: any) {
        const query = 'UPDATE user SET user.password = ? WHERE user.userId = ?'
        await this.db.executeQuery(query, [password, userId])
    }
    async updateMyProfile(userId: number, firstname: any, lastname: string, gender: any, birthday: any, bio: any, username: any) {
        const queryUpdate = 'UPDATE user SET' +
            (firstname != null ? ` user.firstname  =  '${firstname}' ` : "") +
            (lastname != null && lastname.length > 0 ? `,user.lastname = '${lastname}' ` : ``) +
            (gender != null ? ` ,user.gender = ${gender} ` : ``) +
            (birthday != null ? ` ,user.birthday = '${(dateStrJSToMysql(birthday))}' ` : ``) +
            (bio != null ? ` ,user.bio = '${bio}' ,` : ``) +
            (username != null ? ` ,user.username = '${username}' ` : ``) + ` WHERE user.userId = ?`
        console.log("🚀 ~ file: me.repository.ts:25 ~ MeRepository ~ updateMyProfile ~ queryUpdate:", queryUpdate)
        await this.db.executeQuery(queryUpdate, [userId])
    }
    async changeBackground(userId: number, file: Express.Multer.File) {
        const queryGetAvatar = 'SELECT user.background from user WHERE user.userId = ? '
        let [[{ 'avatar': avatar }], data] = await this.db.executeQuery(queryGetAvatar, [userId]) as any;
        if (avatar) {
            await this.drive.delete(avatar)
        }
        let infoImage = await this.drive.uploadFile(file.filename, file.buffer)
        const updateAvatar = 'UPDATE user SET user.background  = ? WHERE user.userId = ?'
        await this.db.executeQuery(updateAvatar, [
            infoImage?.id,
            userId
        ])
        return infoImage
        //FIXME: check something
    }

    async changeAvatar(userId: number, file: Express.Multer.File) {
        const queryGetAvatar = 'SELECT user.avatar from user WHERE user.userId = ? '
        let [[{ 'avatar': avatar }], data] = await this.db.executeQuery(queryGetAvatar, [userId]) as any;
        if (avatar) {
            await this.drive.delete(avatar)
        }
        let infoImage = await this.drive.uploadFile(file.filename, file.buffer)
        const updateAvatar = 'UPDATE user SET user.avatar  = ? WHERE user.userId = ?'
        await this.db.executeQuery(updateAvatar, [
            infoImage?.id,
            userId
        ])
        return infoImage
        //FIXME: check something
    }
}