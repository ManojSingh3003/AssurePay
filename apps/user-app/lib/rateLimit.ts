import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
    try {
        const currentPoints = await redis.get(key);

        if (currentPoints && parseInt(currentPoints) >= limit) {
            return false;
        }

        const multi = redis.multi();
        multi.incr(key);
        if (!currentPoints) {
            multi.pexpire(key, windowMs);
        }
        await multi.exec();

        return true;
    } catch (error) {
        console.error("Redis Rate Limit Error:", error);
        return true;
    }
}
