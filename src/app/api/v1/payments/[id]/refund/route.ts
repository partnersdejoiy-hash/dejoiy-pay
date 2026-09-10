import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getPaymentProvider } from '@/lib/providers';
import { IdempotencyGuard } from '@/lib/security/idempotency';
import { recordAuditLog } from '@/lib/security/audit';

const refundSchema = z.object({
  amount: z.number().positive('Refund amount must be greater than 0'),
  reason: z.string().min(3, 'Reason for refund is required'),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const idempotencyKey = req.headers.get('Idempotency-Key') || req.headers.get('x-idempotency-key');

  if (idempotencyKey) {
    const cached = IdempotencyGuard.check(idempotencyKey);
    if (cached.exists && !cached.inFlight && cached.data) {
      return NextResponse.json(cached.data, {
        status: cached.statusCode || 200,
        headers: { 'X-Cache-Lookup': 'HIT' },
      });
    }
    IdempotencyGuard.acquireLock(idempotencyKey);
  }

  try {
    const body = await req.json();
    const validation = refundSchema.safeParse(body);

    if (!validation.success) {
      if (idempotencyKey) IdempotencyGuard.release(idempotencyKey);
      return NextResponse.json({ error: 'Validation failed', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { amount, reason } = validation.data;
    const txn = db.getTransactionById(params.id);

    if (!txn) {
      if (idempotencyKey) IdempotencyGuard.release(idempotencyKey);
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Call provider refund
    const provider = getPaymentProvider(txn.provider);
    await provider.refundPayment({
      providerPaymentId: txn.providerPaymentId || txn.id,
      amount,
      currency: txn.currency,
      reason,
    });

    const refundResult = db.createRefund(txn.id, amount, reason);
    if (!refundResult.success) {
      if (idempotencyKey) IdempotencyGuard.release(idempotencyKey);
      return NextResponse.json({ error: refundResult.error }, { status: 400 });
    }

    recordAuditLog({
      actor: 'merchant_admin',
      action: 'REFUND_ISSUED',
      entityType: 'refund',
      entityId: refundResult.refund.id,
      changes: { amount: { old: 0, new: amount } },
    });

    const responsePayload = {
      success: true,
      message: `Refund of ₹${amount.toFixed(2)} processed successfully`,
      refund: refundResult.refund,
      updatedTransaction: db.getTransactionById(params.id),
    };

    if (idempotencyKey) {
      IdempotencyGuard.store(idempotencyKey, 200, responsePayload);
    }

    return NextResponse.json(responsePayload);
  } catch (err: any) {
    if (idempotencyKey) IdempotencyGuard.release(idempotencyKey);
    return NextResponse.json({ error: 'Refund processing failed', message: err.message }, { status: 500 });
  }
}
