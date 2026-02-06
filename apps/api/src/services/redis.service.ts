/**
 * Redis Service
 * Singleton Redis client with graceful fallback caching
 * App works without Redis - cache misses simply hit the database
 */

import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';

let redisClient: Redis | null = null;
let isConnected = false;

/**
 * Get or create the Redis client singleton.
 * Logs connection status but never throws - app works without Redis.
 */
export function getRedisClient(): Redis | null {
  if (redisClient) return isConnected ? redisClient : null;

  try {
    redisClient = new Redis(config.redis.url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) return null; // stop retrying after 3 attempts
        return Math.min(times * 200, 2000);
      },
    });

    redisClient.on('connect', () => {
      isConnected = true;
      logger.info('Redis connected');
    });

    redisClient.on('error', (err) => {
      isConnected = false;
      logger.warn('Redis error (cache disabled, app continues normally)', { error: err.message });
    });

    redisClient.on('close', () => {
      isConnected = false;
    });

    // Attempt connection (non-blocking)
    redisClient.connect().catch(() => {
      logger.warn('Redis connection failed - running without cache');
    });
  } catch (err) {
    logger.warn('Redis init failed - running without cache');
    redisClient = null;
  }

  return redisClient;
}

/**
 * Cache helper with automatic fallback.
 * If Redis is unavailable, simply calls the fetcher and returns fresh data.
 *
 * @param key    Cache key
 * @param ttl    Time-to-live in seconds
 * @param fetcher  Async function that produces the value on cache miss
 */
export async function cache<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
  const client = getRedisClient();

  // Try cache read
  if (client && isConnected) {
    try {
      const cached = await client.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    } catch {
      // Cache read failed - fall through to fetcher
    }
  }

  // Cache miss or Redis unavailable - fetch fresh data
  const data = await fetcher();

  // Try cache write (fire-and-forget)
  if (client && isConnected) {
    try {
      await client.set(key, JSON.stringify(data), 'EX', ttl);
    } catch {
      // Cache write failed - no-op
    }
  }

  return data;
}

/**
 * Invalidate cache keys by pattern.
 * For example: invalidateCache('brand-kit:tenant-123*')
 */
export async function invalidateCache(pattern: string): Promise<void> {
  const client = getRedisClient();
  if (!client || !isConnected) return;

  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch {
    // Cache invalidation failed - stale data will expire via TTL
  }
}
