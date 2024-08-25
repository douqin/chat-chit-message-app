import { ConfigService } from "@/lib/config";
import chalk from "chalk";
import { Redis } from "ioredis";


export class DatabaseCache {
  private static redis: Redis;

  public constructor() {}

  public getInstance(): Redis {
    if (DatabaseCache.redis) {
      return DatabaseCache.redis;
    }
    let configService = ConfigService.getInstance();
    DatabaseCache.redis = new Redis(
      Number(configService.get("REDIS_PORT")),
      configService.get("REDIS_HOST") || "",
      {
        maxRetriesPerRequest: null,
      }
    );
    console.log(
      chalk.green(`[Redis]: `, `Initialization successful`)
    );
    return DatabaseCache.redis;
  }
}
