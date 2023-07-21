
import { MySql } from '@/config/sql/mysql';
class LoginRepository {
    static instance = new LoginRepository()
    constructor() { }

    /**number = 0 - > login with phone number 
     * number = 1 - > login with mail
     * **/
    async login(phone: string, password: string): Promise<any> {
        let data: any = await MySql.excuteQuery("SELECT iduser,phone,email,name,birthday,gender FROM user WHERE phone ='" +
            `${phone}` +
            "' AND password ='" +
            `${password}` +
            "'")
        if (!data || (data instanceof Error)) {
            return undefined
        }
        return data[0];
    }
}
export default LoginRepository.instance