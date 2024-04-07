import chalk from "chalk";
import { Redis } from "ioredis";

const REDIS_HOST = process.env.REDIS_HOST || "";
const REDIS_PORT = Number(process.env.REDIS_PORT);
export class DatabaseCache {
  private static redis: Redis;

  public constructor() {}

  public getInstance(): Redis {
    if (DatabaseCache.redis) {
      return DatabaseCache.redis;
    }
    DatabaseCache.redis = new Redis(REDIS_PORT, REDIS_HOST, {
      maxRetriesPerRequest: null,
    });
    console.log(
      chalk.black(`Redis:`),
      chalk.green(`Initialization successful`)
    );
    return DatabaseCache.redis;
  }
}
