import { describe, it, expect } from 'vitest';
import { db } from '../src/lib/db';

describe('Payment & Refund State Machine Validation', () => {
  it('should create transaction in SUCCESS status and transition to REFUNDED on full refund', () => {
    const txn = db.createTransaction({
      orderId: `ord_sm_${Date.now()}`,
      merchantId: 'mer_test',
      environment: 'test',
      amount: 1000,
      currency: 'INR',
      status: 'SUCCESS',
      provider: 'direct-upi',
      paymentMethod: { type: 'upi', upi: { vpa: 'user@upi', flow: 'intent' } },
      customer: { name: 'Test User', email: 'user@example.com', phone: '9876543210' },
      settlementStatus: 'pending',
    });

    expect(txn.status).toBe('SUCCESS');
    expect(txn.fee).toBe(20); // 2% of 1000
    expect(txn.tax).toBe(3.6); // 18% of 20
    expect(txn.netAmount).toBe(976.4);

    // Partial Refund of ₹400
    const partialRef = db.createRefund(txn.id, 400, 'Partial return');
    expect(partialRef.success).toBe(true);
    const updated1 = db.getTransactionById(txn.id);
    expect(updated1?.status).toBe('PARTIALLY_REFUNDED');

    // Remaining Refund of ₹600
    const fullRef = db.createRefund(txn.id, 600, 'Remaining return');
    expect(fullRef.success).toBe(true);
    const updated2 = db.getTransactionById(txn.id);
    expect(updated2?.status).toBe('REFUNDED');

    // Over-refund attempt (should be rejected)
    const excessRef = db.createRefund(txn.id, 100, 'Illegal refund');
    expect(excessRef.success).toBe(false);
  });
});
