type RateLimitOptions = {
  limit?: number;
  windowMs?: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
  windowMs: number;
  lastSeenAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: number;
};

export const RATE_LIMIT_PROFILES = {
  adminLogin: {
    limit: 5,
    windowMs: 60_000,
  },
  adminApi: {
    limit: 10,
    windowMs: 60_000,
  },
  publicApi: {
    limit: 60,
    windowMs: 60_000,
  },
  searchApi: {
    limit: 300,
    windowMs: 60_000,
  },
} as const;

export type RateLimitScope = keyof typeof RATE_LIMIT_PROFILES;

const DEFAULT_LIMIT = RATE_LIMIT_PROFILES.adminApi.limit;
const DEFAULT_WINDOW_MS = RATE_LIMIT_PROFILES.adminApi.windowMs;
const CLEANUP_INTERVAL_MS = 30_000;
const MAX_BUCKETS = 10_000;

const buckets = new Map<string, RateLimitBucket>();
let lastCleanupAt = 0;

function normalizePositiveInteger(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return Math.floor(value);
}

function cleanupBuckets(now: number): void {
  const shouldRunCleanup = now - lastCleanupAt >= CLEANUP_INTERVAL_MS || buckets.size > MAX_BUCKETS;

  if (!shouldRunCleanup) {
    return;
  }

  buckets.forEach((bucket, key) => {
    const expired = now > bucket.resetAt;
    const stale = now - bucket.lastSeenAt > bucket.windowMs * 2;

    if (expired || stale) {
      buckets.delete(key);
    }
  });

  while (buckets.size > MAX_BUCKETS) {
    const oldestKey = buckets.keys().next().value;

    if (!oldestKey) {
      break;
    }

    buckets.delete(oldestKey);
  }

  lastCleanupAt = now;
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const forwardedIp = forwardedFor.split(",")[0]?.trim();

    if (forwardedIp) {
      return forwardedIp;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();

  if (realIp) {
    return realIp;
  }

  return "unknown";
}

export function consumeRateLimit(key: string, options: RateLimitOptions = {}): RateLimitResult {
  const now = Date.now();
  const limit = normalizePositiveInteger(options.limit ?? DEFAULT_LIMIT, DEFAULT_LIMIT);
  const windowMs = normalizePositiveInteger(options.windowMs ?? DEFAULT_WINDOW_MS, DEFAULT_WINDOW_MS);

  cleanupBuckets(now);

  const existingBucket = buckets.get(key);

  if (!existingBucket || now > existingBucket.resetAt) {
    const resetAt = now + windowMs;

    buckets.set(key, {
      count: 1,
      resetAt,
      windowMs,
      lastSeenAt: now,
    });

    return {
      allowed: true,
      limit,
      remaining: Math.max(limit - 1, 0),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
      resetAt,
    };
  }

  existingBucket.lastSeenAt = now;

  if (existingBucket.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      retryAfterSeconds: Math.max(Math.ceil((existingBucket.resetAt - now) / 1000), 1),
      resetAt: existingBucket.resetAt,
    };
  }

  existingBucket.count += 1;

  return {
    allowed: true,
    limit,
    remaining: Math.max(limit - existingBucket.count, 0),
    retryAfterSeconds: Math.max(Math.ceil((existingBucket.resetAt - now) / 1000), 1),
    resetAt: existingBucket.resetAt,
  };
}

export function consumeRateLimitByScope(
  scope: RateLimitScope,
  identifier: string,
  options: RateLimitOptions = {},
): RateLimitResult {
  const profile = RATE_LIMIT_PROFILES[scope];

  return consumeRateLimit(`${scope}:${identifier}`, {
    limit: options.limit ?? profile.limit,
    windowMs: options.windowMs ?? profile.windowMs,
  });
}
