import { Database, QuerySuccessResult, iDatabase } from "@/lib/database";
import { iUserRepositoryBehavior } from "./interface/user.repository.interface";
import { inject, injectable } from "tsyringe";

@injectable()
export default class UserRepository implements iUserRepositoryBehavior {

    constructor(@inject(Database) private db: iDatabase) { }

    async inforUser(username: string): Promise<any> {
        console.log("🚀 ~ UserRepository ~ inforUser ~ username:", username)
        const query = "SELECT * FROM user WHERE user.username = ?"
        let [data, inforColumn] = await this.db.executeQuery(query, [username]) as QuerySuccessResult
        return data[0]
    }
    async searchUser(phone: string): Promise<any> {
        const query = ` SELECT *  FROM user WHERE user.phone = ?`
        let [data, inforColumn] = await this.db.executeQuery(query, [phone]) as any
        return data[0]
    }
}