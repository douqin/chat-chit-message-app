import MyException from '@/utils/exceptions/my.exception';
import { HttpStatus } from '@/utils/extension/httpstatus.exception';
import { FieldPacket, ResultSetHeader } from 'mysql2';
import { inject, injectable } from 'tsyringe';
import Token from '@/utils/definition/token';
import { RegisterAccountDTO } from './dtos/register.account.dto';
import { Database, iDatabase } from '@/lib/database';
import { dateJSToMysql } from '@/utils/extension/date.transform';

@injectable()
export default class AuthRepository {
    constructor(@inject(Database) private db: iDatabase) {
        
    }
    async loguot(iduser: number, refreshToken: string): Promise<boolean> {
        console.log("🚀 ~ file: auth.repository.ts:15 ~ AuthRepository ~ loguot ~ refreshToken:", refreshToken)
        console.log("🚀 ~ file: auth.repository.ts:15 ~ AuthRepository ~ loguot ~ iduser:", iduser)
        let query = `SELECT * FROM token WHERE iduser = ? and refreshtoken = ?`
        let [raw, inforColumn] = await this.db.excuteQuery(query, [iduser, refreshToken]) as any
        if (raw.length == 1) {
            query = 'DELETE FROM token WHERE token.id = ?'
            await this.db.excuteQuery(query, [raw[0].id])
            return true
        } else throw new MyException("Token don't exist").withExceptionCode(HttpStatus.BAD_REQUEST)
    }
    async saveNewAccessToken(token: number, iduser: number): Promise<boolean> {
        const query = 'UPDATE token SET token.accesstoken = ? WHERE token.iduser = ?'
        await this.db.excuteQuery(query, [token, iduser])
        return true
    }
    public async login(phone: string, password: string, notificationToken: string): Promise<any> {
        const query = `SELECT * FROM user WHERE user.phone = ? AND user.password = ?`
        let [data] = await this.db.excuteQuery(query, [phone, password]) as any
        return data[0];
    }
    public async saveFullToken(iduser: number, token: Token, notificationToken: string): Promise<boolean> {
        let refreshToken = token.refreshToken
        let query = 'INSERT INTO token (iduser, refreshtoken, notificationtoken) VALUES (?,?,?)';
        let result: boolean = true;
        try {
            await this.db.excuteQuery(query, [iduser, refreshToken, notificationToken != null ? notificationToken : ""]);
        }
        catch (err) {
            console.log(err)
            result = false;
        }
        return result;
    }
    public async registerAccount(registerAccount : RegisterAccountDTO) {
        let query = `SELECT COUNT(*) FROM user WHERE user.phone = (?);`
        let [data, inforColumn] = await this.db.excuteQuery(
            query, [registerAccount.phone]
        )
        const [{ 'COUNT(*)': count }] = data as any;
        if (count == 1) {
            throw new MyException("Phone is exist").withExceptionCode(HttpStatus.BAD_REQUEST)
        }
        let query2 = `INSERT INTO user( firstname, phone, password, birthday, gender, username, lastname, email, address) VALUES (?,?,?,?,?,?,?,?,?);`
        let _username = crypto.randomUUID().toString();
        let [dataUser, C] = await this.db.excuteQuery(
            query2, [registerAccount.firstname, registerAccount.phone, registerAccount.password, dateJSToMysql(registerAccount.birthday), registerAccount.gender, _username, registerAccount.lastname, registerAccount.email, registerAccount.address]
        ) as [ResultSetHeader, FieldPacket[]]
        return true;
    }
}