
import { MySql } from '@/config/sql/mysql';
import MyException from '@/utils/exceptions/my.exception';
export default class AuthRepository {
    async saveNewAccessToken(token: number, iduser: number): Promise<boolean> {
        const query = 'UPDATE token SET token.accesstoken = ? WHERE token.iduser = ?'
        await MySql.excuteQuery(query, [token, iduser])
        return true
    }
    constructor() { }
    public async login(phone: string, password: string): Promise<any> {
        const query = `SELECT * FROM user WHERE user.phone = ? AND user.password = ?`
        let [data] = await MySql.excuteQuery(query, [phone, password]) as any
        return data[0];
    }
    public async registerAccount(name: string, phone: any, password: any) {
        let query = `SELECT COUNT(*) FROM USER WHERE user.phone = (?);`
        let [data, inforColumn] = await MySql.excuteQuery(
            query, [phone]
        )
        const [{ 'COUNT(*)': count }] = data as any;
        if (count == 1) {
            throw new MyException("Số điện thoại đã tồn tại")
        }
        try {
            let query2 = `INSERT INTO user( user.name,user.phone, user.password) VALUES (?,?,?);`
            await MySql.excuteQuery(
                query2, [name, phone, password]
            )
        }
        catch (e) {
            return false;
        }
        return true;
    }
}