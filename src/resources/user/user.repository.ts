
import { Database } from "@/config/database/database";
import { UserServiceBehavior } from "./interface/user.service.interface";

export default class UserRepository implements UserServiceBehavior {
    async searchUser(phone: string): Promise<any> {
        const query = ` SELECT user.*  FROM user WHERE user.phone = ?`
        let [data, inforColumn] = await Database.excuteQuery(query) as any
        return data // FIXME:
    }
}