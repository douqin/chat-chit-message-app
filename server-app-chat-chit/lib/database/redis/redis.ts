import { Redis } from "ioredis";

const REDIS_HOST = process.env.REDIS_HOST || "";
const REDIS_PORT = process.env.REDIS_PORT || "";
export class DatabaseCache {
  private static redis: Redis;

  public constructor() {}

  public getInstance(): Redis {
    if (DatabaseCache.redis) return DatabaseCache.redis;
    return DatabaseCache.redis = new Redis();
  }
}
