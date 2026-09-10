import { describe, it, expect } from 'vitest';
import { IdempotencyGuard } from '../src/lib/security/idempotency';

describe('Idempotency Guard & Replay Protection', () => {
  it('should acquire lock for new key and report in-flight', () => {
    const key = `idem_test_${Date.now()}`;
    const acquired = IdempotencyGuard.acquireLock(key);
    expect(acquired).toBe(true);

    const check = IdempotencyGuard.check(key);
    expect(check.exists).toBe(true);
    expect(check.inFlight).toBe(true);
  });

  it('should prevent concurrent execution of same idempotency key', () => {
    const key = `idem_test_conflict_${Date.now()}`;
    expect(IdempotencyGuard.acquireLock(key)).toBe(true);
    expect(IdempotencyGuard.acquireLock(key)).toBe(false);
  });

  it('should store and return cached response on retry', () => {
    const key = `idem_test_cached_${Date.now()}`;
    IdempotencyGuard.acquireLock(key);
    IdempotencyGuard.store(key, 201, { paymentId: 'dj_pay_123', status: 'SUCCESS' });

    const check = IdempotencyGuard.check(key);
    expect(check.exists).toBe(true);
    expect(check.inFlight).toBe(false);
    expect(check.statusCode).toBe(201);
    expect((check.data as any).status).toBe('SUCCESS');
  });
});
