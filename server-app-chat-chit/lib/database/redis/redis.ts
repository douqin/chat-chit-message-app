import { Redis } from "ioredis";

const REDIS_HOST = process.env.REDIS_HOST || "";
const REDIS_PORT = Number(process.env.REDIS_PORT);
export class DatabaseCache {
  private static redis: Redis;

  public constructor() { }

  public getInstance(): Redis {
    return DatabaseCache.redis = new Redis(
      REDIS_PORT, REDIS_HOST, {
      maxRetriesPerRequest: null,
    });
  }
}
