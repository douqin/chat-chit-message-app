
import mysql from "mysql2";
require('dotenv').config()
const DATABASE_NAME = process.env.DATABASE_NAME;
const DATABASE_PORT = process.env.DATABASE_PORT;
const DATABASE_USER = process.env.DATABASE_USER;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
const DATABASE_HOST = process.env.DATABASE_HOST;

class Database implements iDatabase {

    constructor(private pool: mysql.Pool) {

    }
    transaction(): void {
        throw new Error("Method not implemented.");
    }
    async excuteQuery(query: string, a?: any[] | undefined): Promise<[mysql.OkPacket | mysql.ResultSetHeader | mysql.RowDataPacket[] | mysql.RowDataPacket[][] | mysql.OkPacket[], mysql.FieldPacket[]]> {
        return await this.pool.promise().query(
            query, a
        )
    }

}
interface iDatabase {

    excuteQuery(query: string, a?: any[]): Promise<[mysql.RowDataPacket[] | mysql.RowDataPacket[][] | mysql.OkPacket | mysql.OkPacket[] | mysql.ResultSetHeader, mysql.FieldPacket[]]>

    transaction(): void;
}
class DatabaseBuilder {
    private pool!: mysql.Pool;
    constructor() {
        console.log("🚀 ~ file: mysql.ts:10 ~ DATABASE_PASSWORD:", DATABASE_PASSWORD)
        console.log("🚀 ~ file: mysql.ts:8 ~ DATABASE_USER:", DATABASE_USER)
        console.log("🚀 ~ file: mysql.ts:6 ~ DATABASE_PORT:", DATABASE_PORT)
        console.log("🚀 ~ file: mysql.ts:4 ~ DATABASE_NAME:", DATABASE_NAME)
    }
    initPool() {
        this.pool = mysql.createPool({
            port: isNaN(Number(DATABASE_PORT)) ? undefined : Number(DATABASE_PORT),
            database: DATABASE_NAME,
            host: DATABASE_HOST,
            user: DATABASE_USER,
            password: DATABASE_PASSWORD
        })
        return this
    }
    build() {
        
        return new Database(this.pool);
    }
}
declare type QuerySuccessResult = [mysql.RowDataPacket[], mysql.FieldPacket[]];
declare type InsertSuccessResult = [mysql.ResultSetHeader[], mysql.FieldPacket[]];
export { Database as Database, DatabaseBuilder as MySqlBuilder, QuerySuccessResult, InsertSuccessResult, iDatabase };