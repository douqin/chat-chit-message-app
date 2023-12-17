
import { Database, QueryOK } from "@/config/database/database";
import { UserServiceBehavior } from "./interface/user.service.interface";
import { UserRepositoryBehavior } from "./interface/user.repository.interface";

export default class UserRepository implements UserRepositoryBehavior {

    async inforUser( username : string): Promise<any> {
        const query = "SELECT * FROM user WHERE user.username = ?"
        let [data, inforColumn] = await Database.excuteQuery(query, [username]) as QueryOK
        return data[0] // TODO: check in postman
    }
    async searchUser(phone: string): Promise<any> {
        const query = ` SELECT *  FROM user WHERE user.phone = ?`
        let [data, inforColumn] = await Database.excuteQuery(query, [phone]) as any
        return data[0] // TODO: check in postman
    }
}