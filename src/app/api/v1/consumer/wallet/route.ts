import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const addMoneySchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  method: z.enum(['upi', 'card', 'netbanking']).default('upi'),
});

export async function GET() {
  const wallet = db.getConsumerWallet();
  return NextResponse.json({ wallet });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = addMoneySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { amount } = validation.data;
    const newBalance = db.updateConsumerWalletBalance(amount);

    // Create a transaction record for the deposit
    db.createTransaction({
      orderId: `topup_${Date.now()}`,
      merchantId: 'dejoiypay_wallet_load',
      environment: 'test',
      amount,
      currency: 'INR',
      status: 'SUCCESS',
      provider: 'direct-upi',
      providerPaymentId: `wlt_load_${Date.now()}`,
      paymentMethod: { type: 'upi', upi: { vpa: 'aakash@dejoiypay', flow: 'intent' } },
      customer: {
        name: 'Aakash Sharma',
        email: 'aakash.sharma@dejoiypay.com',
        phone: '+91 98765 43210',
      },
      notes: { purpose: 'Wallet Balance Topup' },
      settlementStatus: 'settled',
    });

    return NextResponse.json({ success: true, balance: newBalance, added: amount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
