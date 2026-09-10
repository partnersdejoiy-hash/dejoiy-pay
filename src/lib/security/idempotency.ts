interface CachedIdempotentResponse {
  statusCode: number;
  response: unknown;
  timestamp: number;
  inFlight: boolean;
}

const idempotencyCache = new Map<string, CachedIdempotentResponse>();

export class IdempotencyGuard {
  // Expiration in 24 hours
  private static TTL_MS = 24 * 60 * 60 * 1000;

  static check(key: string): { exists: boolean; inFlight: boolean; data?: unknown; statusCode?: number } {
    const entry = idempotencyCache.get(key);
    if (!entry) return { exists: false, inFlight: false };

    // Check expiration
    if (Date.now() - entry.timestamp > this.TTL_MS) {
      idempotencyCache.delete(key);
      return { exists: false, inFlight: false };
    }

    if (entry.inFlight) {
      return { exists: true, inFlight: true };
    }

    return { exists: true, inFlight: false, data: entry.response, statusCode: entry.statusCode };
  }

  static acquireLock(key: string): boolean {
    const existing = idempotencyCache.get(key);
    if (existing && !this.isExpired(existing)) {
      return false; // Already locked or resolved
    }

    idempotencyCache.set(key, {
      statusCode: 200,
      response: null,
      timestamp: Date.now(),
      inFlight: true,
    });
    return true;
  }

  static store(key: string, statusCode: number, response: unknown): void {
    idempotencyCache.set(key, {
      statusCode,
      response,
      timestamp: Date.now(),
      inFlight: false,
    });
  }

  static release(key: string): void {
    idempotencyCache.delete(key);
  }

  private static isExpired(entry: CachedIdempotentResponse): boolean {
    return Date.now() - entry.timestamp > this.TTL_MS;
  }
}
