import { NextRequest, NextResponse } from 'next/server';
import { getPaymentProvider } from '@/lib/providers';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature') || '';

  const provider = getPaymentProvider('razorpay');
  const verification = await provider.verifyWebhook(rawBody, { 'x-razorpay-signature': signature });

  if (!verification.isValid) {
    return NextResponse.json({ error: verification.error || 'Invalid signature' }, { status: 400 });
  }

  const payload = verification.payload as any;
  const event = payload?.event;

  if (event === 'payment.captured' && payload?.payload?.payment?.entity?.id) {
    const rzpId = payload.payload.payment.entity.id;
    const orderId = payload.payload.payment.entity.order_id;
    // Find matching transaction
    const txn = db.getTransactionById(orderId) || db.getTransactions({ search: rzpId }).transactions[0];
    if (txn && txn.status !== 'SUCCESS') {
      db.updateTransactionStatus(txn.id, 'SUCCESS', {
        message: 'Razorpay webhook: payment.captured received',
        source: 'provider',
      });
    }
  }

  return NextResponse.json({ status: 'ok', received: true });
}
