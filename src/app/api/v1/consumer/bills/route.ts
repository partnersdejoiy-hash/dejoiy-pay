import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const billPaySchema = z.object({
  category: z.enum(['mobile', 'electricity', 'dth', 'fastag', 'broadband', 'water']),
  billerName: z.string(),
  consumerNumber: z.string(),
  amount: z.number().positive(),
  paymentMethod: z.string().default('wallet'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = billPaySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { category, billerName, consumerNumber, amount } = validation.data;
    const wallet = db.getConsumerWallet();

    if (wallet.balance < amount) {
      return NextResponse.json({ error: `Insufficient wallet balance (Available: ₹${wallet.balance.toFixed(2)})` }, { status: 400 });
    }

    db.updateConsumerWalletBalance(-amount);

    const operatorRef = `BBPS_${Math.floor(10000000 + Math.random() * 90000000)}`;
    const txn = db.createTransaction({
      orderId: `bill_${Date.now()}`,
      merchantId: 'mer_dejoiypay_bbps',
      environment: 'test',
      amount,
      currency: 'INR',
      status: 'SUCCESS',
      provider: 'direct-upi',
      providerPaymentId: operatorRef,
      paymentMethod: { type: 'wallet', wallet: { provider: 'DejoiY Wallet' } },
      customer: {
        name: 'Aakash Sharma',
        email: 'aakash.sharma@dejoiypay.com',
        phone: '+91 98765 43210',
      },
      notes: { category, billerName, consumerNumber, bbpsRef: operatorRef },
      settlementStatus: 'settled',
    });

    return NextResponse.json({
      success: true,
      operatorRef,
      transaction: txn,
      newBalance: db.getConsumerWallet().balance,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
