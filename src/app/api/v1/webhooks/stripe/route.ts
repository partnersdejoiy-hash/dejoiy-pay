import { NextRequest, NextResponse } from 'next/server';
import { getPaymentProvider } from '@/lib/providers';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sigHeader = req.headers.get('stripe-signature') || '';

  const provider = getPaymentProvider('stripe');
  const verification = await provider.verifyWebhook(rawBody, { 'stripe-signature': sigHeader });

  if (!verification.isValid) {
    return NextResponse.json({ error: verification.error || 'Invalid signature' }, { status: 400 });
  }

  const payload = verification.payload as any;
  const event = payload?.type;

  if (event === 'payment_intent.succeeded' && payload?.data?.object?.id) {
    const piId = payload.data.object.id;
    const txn = db.getTransactionById(piId) || db.getTransactions({ search: piId }).transactions[0];
    if (txn && txn.status !== 'SUCCESS') {
      db.updateTransactionStatus(txn.id, 'SUCCESS', {
        message: 'Stripe webhook: payment_intent.succeeded received',
        source: 'provider',
      });
    }
  }

  return NextResponse.json({ status: 'ok', received: true });
}
