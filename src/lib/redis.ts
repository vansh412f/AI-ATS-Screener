import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
  ratelimit: Ratelimit | undefined;
};

export const redis: Redis =
  globalForRedis.redis ??
  new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

export const ratelimit: Ratelimit =
  globalForRedis.ratelimit ??
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "24 h"),
    prefix: "ratelimit:ats",
    analytics: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
  globalForRedis.ratelimit = ratelimit;
}