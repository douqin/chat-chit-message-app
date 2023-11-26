import { Database } from "@/config/sql/database";
import { UserServiceBehavior } from "./interface/user.service.interface";

export default class UserRepository implements UserServiceBehavior {
    async searchUser(phone: string): Promise<any> {
        const query = ` SELECT user.iduser	
        user.email,	
        user.phone	,
        user.lastname,	
        user.birthday,	
        user.gender	,
        user.avatar	,
        user.background,	
        user.firstname	,
        user.bio	,
        user.username  FROM user WHERE user.phone = ?`
        let [data, inforColumn] = await Database.excuteQuery(query) as any
        return data // FIXME:
    }
}