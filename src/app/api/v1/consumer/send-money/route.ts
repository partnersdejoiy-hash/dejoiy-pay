import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { validateVpa } from '@/lib/upi/spec';

const sendMoneySchema = z.object({
  recipientVpaOrPhone: z.string().min(3),
  recipientName: z.string().min(2),
  amount: z.number().positive(),
  upiPin: z.string().length(6, '6-digit UPI PIN is required'),
  note: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = sendMoneySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { recipientVpaOrPhone, recipientName, amount, upiPin, note } = validation.data;

    // PIN check simulation (default valid pin '123456' or any 6 digits in test mode)
    if (upiPin === '000000') {
      return NextResponse.json({ error: 'Incorrect UPI PIN. 2 attempts remaining.' }, { status: 403 });
    }

    const wallet = db.getConsumerWallet();
    if (wallet.balance < amount) {
      return NextResponse.json({ error: `Insufficient wallet balance (Available: ₹${wallet.balance.toFixed(2)})` }, { status: 400 });
    }

    // Deduct balance
    db.updateConsumerWalletBalance(-amount);

    const rrn = `${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const txn = db.createTransaction({
      orderId: `p2p_${Date.now()}`,
      merchantId: 'mer_dejoiypay_p2p',
      environment: 'test',
      amount,
      currency: 'INR',
      status: 'SUCCESS',
      provider: 'direct-upi',
      providerPaymentId: `upi_${rrn}`,
      paymentMethod: {
        type: 'upi',
        upi: { vpa: recipientVpaOrPhone, flow: 'intent', rrn },
      },
      customer: {
        name: recipientName,
        email: 'peer@dejoiypay.network',
        phone: recipientVpaOrPhone.includes('@') ? '+91 99999 00000' : recipientVpaOrPhone,
      },
      notes: { note: note || 'Peer transfer via DejoiY Pay', rrn },
      settlementStatus: 'settled',
      timeline: [
        { status: 'CREATED', timestamp: new Date().toISOString(), message: 'Payment initiated by user', source: 'customer' },
        { status: 'SUCCESS', timestamp: new Date().toISOString(), message: `Transferred to ${recipientName} (RRN: ${rrn})`, source: 'provider' },
      ],
    });

    return NextResponse.json({
      success: true,
      transaction: txn,
      newBalance: db.getConsumerWallet().balance,
      rrn,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
