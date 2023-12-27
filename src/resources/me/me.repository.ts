import { Database, iDatabase } from "@/config/database/database";
import { iDrive } from "../../component/cloud/drive.interface";
import { CloudDrive } from "../../component/cloud/drive.service";
import { dateStrJSToMysql } from "@/utils/extension/date_to_date";
import { inject, injectable } from "tsyringe";


@injectable()
export default class MeRepository {

    constructor(@inject(CloudDrive) private drive: iDrive, @inject(Database) private db: iDatabase) { }

    async getMyProfile(iduser: number) {
        const query = 'SELECT user.phone, user.firstname, user.lastname, user.gender,user.birthday, user.bio, user.username, user.avatar, user.background FROM user WHERE user.iduser = ?'
        let [data, inforC] = await this.db.excuteQuery(query, [iduser]) as any
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
    async changePassword(iduser: number, password: any) {
        const query = 'UPDATE user SET user.password = ? WHERE user.iduser = ?'
        await this.db.excuteQuery(query, [password, iduser])
    }
    async updateMyProfile(iduser: number, firstname: any, lastname: string, gender: any, birthday: any, bio: any, username: any) {
        const queryUpdate = 'UPDATE user SET' +
            (firstname != null ? ` user.firstname  =  '${firstname}' ` : "") +
            (lastname != null && lastname.length > 0 ? `,user.lastname = '${lastname}' ` : ``) +
            (gender != null ? ` ,user.gender = ${gender} ` : ``) +
            (birthday != null ? ` ,user.birthday = '${(dateStrJSToMysql(birthday))}' ` : ``) +
            (bio != null ? ` ,user.bio = '${bio}' ,` : ``) +
            (username != null ? ` ,user.username = '${username}' ` : ``) + ` WHERE user.iduser = ?`
        console.log("🚀 ~ file: me.repository.ts:25 ~ MeRepository ~ updateMyProfile ~ queryUpdate:", queryUpdate)
        await this.db.excuteQuery(queryUpdate, [iduser])
    }
    async changeBackground(iduser: number, file: Express.Multer.File) {
        const queryGetAvatar = 'SELECT user.background from user WHERE user.iduser = ? '
        let [[{ 'avatar': avatar }], data] = await this.db.excuteQuery(queryGetAvatar, [iduser]) as any;
        if (avatar) {
            await this.drive.delete(avatar)
        }
        let infoImage = await this.drive.uploadFile(file.filename, file.buffer)
        const updateAvatar = 'UPDATE user SET user.background  = ? WHERE user.iduser = ?'
        await this.db.excuteQuery(updateAvatar, [
            infoImage?.id,
            iduser
        ])
        return infoImage
        //FIXME: check something
    }

    async changeAvatar(iduser: number, file: Express.Multer.File) {
        const queryGetAvatar = 'SELECT user.avatar from user WHERE user.iduser = ? '
        let [[{ 'avatar': avatar }], data] = await this.db.excuteQuery(queryGetAvatar, [iduser]) as any;
        if (avatar) {
            await this.drive.delete(avatar)
        }
        let infoImage = await this.drive.uploadFile(file.filename, file.buffer)
        const updateAvatar = 'UPDATE user SET user.avatar  = ? WHERE user.iduser = ?'
        await this.db.excuteQuery(updateAvatar, [
            infoImage?.id,
            iduser
        ])
        return infoImage
        //FIXME: check something
    }
}