import { MySql } from "@/config/sql/mysql";
import { iDrive } from '../../../component/cloud/drive.interface';
import { ServiceDrive } from '../../../component/cloud/drive.service';
import MyException from "@/utils/exceptions/my.exception";

export default class RegisterRepository {
    public drive: iDrive
    constructor() {
        this.drive = ServiceDrive.gI();
    }
    async registerAccount(name: string, phone: any, password: any) {
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