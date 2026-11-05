import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
let redisClient = null;
let isConnected = false;

// Initialize Redis only if explicitly configured or running in environment with Redis
if (process.env.ENABLE_REDIS === "true" || process.env.REDIS_URL) {
  try {
    redisClient = new Redis(REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      retryStrategy: (times) => {
        if (times > 3) {
          return null; // Stop retrying after 3 attempts
        }
        return Math.min(times * 200, 1000);
      },
    });

    redisClient.on("connect", () => {
      isConnected = true;
      console.log("⚡ [Redis] Connected successfully to cache cluster");
    });

    redisClient.on("error", (err) => {
      isConnected = false;
      // Soft warning - application will fallback to database directly
      console.warn("⚠️ [Redis] Connection warning (using database direct fallback):", err.message);
    });

    redisClient.connect().catch((err) => {
      isConnected = false;
      console.warn("⚠️ [Redis] Initial connect skipped (running without cache):", err.message);
    });
  } catch (err) {
    isConnected = false;
    console.warn("⚠️ [Redis] Client initialization skipped:", err.message);
  }
}

/**
 * Check if Redis is healthy and available
 */
export const isRedisAvailable = () => isConnected && redisClient !== null;

/**
 * Retrieve cached JSON value
 */
export const getCache = async (key) => {
  if (!isRedisAvailable()) return null;
  try {
    const raw = await redisClient.get(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[Redis] getCache error for key ${key}:`, err.message);
    return null;
  }
};

/**
 * Store value in cache with TTL in seconds (default: 10 mins)
 */
export const setCache = async (key, value, ttlSeconds = 600) => {
  if (!isRedisAvailable()) return false;
  try {
    const serialized = JSON.stringify(value);
    await redisClient.set(key, serialized, "EX", ttlSeconds);
    return true;
  } catch (err) {
    console.warn(`[Redis] setCache error for key ${key}:`, err.message);
    return false;
  }
};

/**
 * Invalidate a single key
 */
export const delCache = async (key) => {
  if (!isRedisAvailable()) return false;
  try {
    await redisClient.del(key);
    return true;
  } catch (err) {
    console.warn(`[Redis] delCache error for key ${key}:`, err.message);
    return false;
  }
};

/**
 * Invalidate keys matching a pattern (e.g. "restaurants:*")
 */
export const delCachePattern = async (pattern) => {
  if (!isRedisAvailable()) return false;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
    return true;
  } catch (err) {
    console.warn(`[Redis] delCachePattern error for ${pattern}:`, err.message);
    return false;
  }
};

export default redisClient;
