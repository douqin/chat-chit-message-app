import { Database } from '@/config/database/database';
import MyException from '@/utils/exceptions/my.exception';
import { HttpStatus } from '@/utils/extension/httpstatus.exception';
export default class AuthRepository {
    async loguot(iduser: number, refreshToken: string): Promise<boolean> {
        let query = `SELECT * FROM token WHERE token.iduser = ? and refreshtoken = ?`
        let [raw, inforColumn] = await Database.excuteQuery(query, [iduser, refreshToken]) as any
        if (raw.length == 1) {
            console.log("🚀 ~ file: auth.repository.ts:9 ~ AuthRepository ~ loguot ~ raw:", raw[0].id)
            query = 'DELETE FROM token WHERE token.id = ?'
            await Database.excuteQuery(query, [raw[0].id])
            return true
        }
        return false
    }
    async saveNewAccessToken(token: number, iduser: number): Promise<boolean> {
        const query = 'UPDATE token SET token.accesstoken = ? WHERE token.iduser = ?'
        await Database.excuteQuery(query, [token, iduser])
        return true
    }
    constructor() { }
    public async login(phone: string, password: string, notificationToken: string): Promise<any> {
        const query = `SELECT * FROM user WHERE user.phone = ? AND user.password = ?`
        let [data] = await Database.excuteQuery(query, [phone, password]) as any
        return data[0];
    }
    public async registerAccount(name: string, phone: any, password: any) {
        let query = `SELECT COUNT(*) FROM USER WHERE user.phone = (?);`
        let [data, inforColumn] = await Database.excuteQuery(
            query, [phone]
        )
        const [{ 'COUNT(*)': count }] = data as any;
        if (count == 1) {
            throw new MyException("Phone is invalid").withExceptionCode(HttpStatus.BAD_REQUEST)
        }
        try {
            let query2 = `INSERT INTO user( user.name,user.phone, user.password) VALUES (?,?,?);`
            await Database.excuteQuery(
                query2, [name, phone, password]
            )
        }
        catch (e) {
            return false;
        }
        return true;
    }
}