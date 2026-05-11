type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now >= entry.resetAt) store.delete(key);
    }
  }, CLEANUP_INTERVAL_MS);
  if (typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

/**
 * In-memory sliding-window rate limiter with lazy deletion.
 *
 * Expired entries are cleaned up on access (lazy) and also swept every
 * 5 minutes as a safety net so the Map never grows unbounded.
 */
export function rateLimit(
  key: string,
  { maxAttempts, windowMs }: { maxAttempts: number; windowMs: number },
): { allowed: boolean; remaining: number } {
  ensureCleanup();

  const now = Date.now();
  let entry = store.get(key);

  if (entry && now >= entry.resetAt) {
    store.delete(key);
    entry = undefined;
  }

  if (!entry) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }

  entry.count += 1;

  return {
    allowed: entry.count <= maxAttempts,
    remaining: Math.max(0, maxAttempts - entry.count),
  };
}
