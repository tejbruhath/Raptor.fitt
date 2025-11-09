import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  // Only initialize Redis if URL is provided
  if (!process.env.REDIS_URL) {
    console.warn('Redis URL not configured. Caching disabled.');
    return null;
  }

  if (!redis) {
    try {
      redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        lazyConnect: true,
      });

      redis.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      redis.on('connect', () => {
        console.log('Redis connected successfully');
      });
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      return null;
    }
  }

  return redis;
}

// Cache helpers
export async function getCached<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis GET error:', error);
    return null;
  }
}

export async function setCached<T>(
  key: string,
  value: T,
  expirationSeconds: number = 3600
): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.setex(key, expirationSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Redis SET error:', error);
    return false;
  }
}

export async function deleteCached(key: string): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Redis DELETE error:', error);
    return false;
  }
}

export async function invalidatePattern(pattern: string): Promise<number> {
  const client = getRedisClient();
  if (!client) return 0;

  try {
    const keys = await client.keys(pattern);
    if (keys.length === 0) return 0;
    return await client.del(...keys);
  } catch (error) {
    console.error('Redis invalidate pattern error:', error);
    return 0;
  }
}

// Analytics cache helpers
export async function cacheUserAnalytics(userId: string, data: any): Promise<boolean> {
  return setCached(`analytics:${userId}`, data, 300); // 5 minutes
}

export async function getUserAnalytics(userId: string): Promise<any | null> {
  return getCached(`analytics:${userId}`);
}

// Leaderboard cache helpers
export async function cacheLeaderboard(crewId: string, data: any): Promise<boolean> {
  return setCached(`leaderboard:${crewId}`, data, 60); // 1 minute
}

export async function getLeaderboard(crewId: string): Promise<any | null> {
  return getCached(`leaderboard:${crewId}`);
}

// Recovery patterns cache
export async function cacheRecoveryPattern(userId: string, data: any): Promise<boolean> {
  return setCached(`recovery:${userId}`, data, 3600); // 1 hour
}

export async function getRecoveryPattern(userId: string): Promise<any | null> {
  return getCached(`recovery:${userId}`);
}
