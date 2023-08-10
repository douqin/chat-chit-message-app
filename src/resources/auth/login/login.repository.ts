
import { MySql } from '@/config/sql/mysql';
class LoginRepository {
    static instance = new LoginRepository()
    constructor() { }
    async login(phone: string, password: string): Promise<any> {
        const query = `SELECT * FROM user WHERE user.phone = ? AND user.password = ?`
        let [data] = await MySql.excuteQuery(query, [phone, password]) as any
        console.log("🚀 ~ file: login.repository.ts:9 ~ LoginRepository ~ login ~ data:", data)
        return data[0];
    }
}
export default LoginRepository.instance