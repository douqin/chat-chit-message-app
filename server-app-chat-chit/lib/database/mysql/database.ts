import chalk from "chalk";
import mysql from "mysql2/promise";
import { ConfigService } from "@/lib/config";

class Database implements iDatabase {
  constructor(private pool: mysql.Pool) {}
  async transaction<T>(callback: (conn: iDatabase) => Promise<T>): Promise<T> {
    let conn = null;
    let a: T;
    try {
      conn = await this.pool.getConnection();
      await conn.beginTransaction();
      a = await callback(new DB(conn));
      await conn.commit();
    } catch (error) {
      if (conn) await conn.rollback();
      throw error;
    } finally {
      if (conn) await conn.release();
    }
    return a;
  }
  async executeQuery(
    query: string,
    a?: any[] | undefined
  ): Promise<
    [
      (
        | mysql.OkPacket
        | mysql.ResultSetHeader
        | mysql.RowDataPacket[]
        | mysql.RowDataPacket[][]
        | mysql.OkPacket[]
      ),
      mysql.FieldPacket[]
    ]
  > {
    return await this.pool.query(query, a);
  }
}
interface iDatabase {
  executeQuery(
    query: string,
    a?: any[]
  ): Promise<
    [
      (
        | mysql.RowDataPacket[]
        | mysql.RowDataPacket[][]
        | mysql.OkPacket
        | mysql.OkPacket[]
        | mysql.ResultSetHeader
      ),
      mysql.FieldPacket[]
    ]
  >;

  transaction<T>(callback: (conn: iDatabase) => Promise<T>): Promise<T>;
}
class DatabaseBuilder {
  private pool!: mysql.Pool;
  constructor() {}
  initPool() {
    let configService = ConfigService.getInstance();
    this.pool = mysql.createPool({
      port: Number(configService.get("DATABASE_PORT")),
      database: configService.get("DATABASE_NAME"),
      host: configService.get("DATABASE_HOST"),
      user: configService.get("DATABASE_USER"),
      password: configService.get("DATABASE_PASSWORD"),
    });
    console.log(
      chalk.black(`Mysql: `),
      chalk.green(`Initialization successful`),
    );
    return this;
  }
  build() {
    return new Database(this.pool);
  }
}
class DB implements iDatabase {
  constructor(private pool: mysql.PoolConnection) {}
  async executeQuery(
    query: string,
    a?: any[] | undefined
  ): Promise<
    [
      (
        | mysql.RowDataPacket[]
        | mysql.RowDataPacket[][]
        | mysql.OkPacket
        | mysql.OkPacket[]
        | mysql.ResultSetHeader
      ),
      mysql.FieldPacket[]
    ]
  > {
    return await this.pool.query(query, a);
  }
  transaction<T>(callback: (conn: iDatabase) => Promise<T>): Promise<T> {
    throw new Error("Method not implemented.");
  }
}
declare type QuerySuccessResult = [mysql.RowDataPacket[], mysql.FieldPacket[]];
declare type InsertSuccessResult = [
  mysql.ResultSetHeader[],
  mysql.FieldPacket[]
];
export {
  Database as Database,
  DatabaseBuilder as MySqlBuilder,
  QuerySuccessResult,
  InsertSuccessResult,
  iDatabase,
};
