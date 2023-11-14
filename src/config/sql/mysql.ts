import mysql from "mysql2";
require('dotenv').config()
const DATABASE_NAME = process.env.DATABASE_NAME;
const DATABASE_USER = process.env.DATABASE_USER;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;

class MySql {

    public static excuteQuery: (query: string, a?: any[]) => Promise<[mysql.RowDataPacket[] | mysql.RowDataPacket[][] | mysql.OkPacket | mysql.OkPacket[] | mysql.ResultSetHeader, mysql.FieldPacket[]]>

}
class MySqlBuilder {
    private pool!: mysql.Pool;
    constructor() {

    }
    initPool() {
        this.pool = mysql.createPool({
            database: DATABASE_NAME,
            host: 'localhost',
            user: DATABASE_USER,
            password: DATABASE_PASSWORD,
            multipleStatements : false
        })
        return this
    }
    build() {
        
        MySql.excuteQuery = async (query: string, a?: any[]) => {
            return await this.pool.promise().query(
                query, a
            )
        }
    }
}
export { MySql, MySqlBuilder };