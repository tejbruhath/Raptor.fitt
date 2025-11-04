/**
 * Simple in-memory rate limiter
 * For production, use Redis or external service
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 10 * 60 * 1000);

export interface RateLimitConfig {
  interval: number; // milliseconds
  limit: number; // max requests per interval
}

export const rateLimitConfigs = {
  default: { interval: 60 * 1000, limit: 60 }, // 60 req/min
  ai: { interval: 60 * 1000, limit: 10 }, // 10 req/min for AI
  export: { interval: 60 * 60 * 1000, limit: 5 }, // 5 req/hour for exports
  upload: { interval: 60 * 1000, limit: 20 }, // 20 req/min for uploads
};

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = rateLimitConfigs.default
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = `${identifier}`;

  // Initialize or reset if expired
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 0,
      resetTime: now + config.interval,
    };
  }

  // Increment counter
  store[key].count++;

  const remaining = Math.max(0, config.limit - store[key].count);
  const success = store[key].count <= config.limit;

  return {
    success,
    remaining,
    resetTime: store[key].resetTime,
  };
}

export function getRateLimitHeaders(
  limit: number,
  remaining: number,
  resetTime: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(resetTime).toISOString(),
  };
}
