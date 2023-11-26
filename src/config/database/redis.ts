import { Redis } from "ioredis"

const DATABASE_REDIS_URL = process.env.DATABASE_REDIS_URL || "";
export class DatabaseCache {
    private static redis: Redis;

    private constructor() {
    }

    public static getInstance(): Redis {
        if (DatabaseCache.redis)
            return DatabaseCache.redis
        return DatabaseCache.redis = new Redis(DATABASE_REDIS_URL)
    }
}