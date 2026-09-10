import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { buildUpiUri } from '@/lib/upi/spec';

const dynamicQrSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  expiresInMinutes: z.number().int().min(1).max(60).default(15),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = dynamicQrSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { title, amount, expiresInMinutes } = validation.data;
    const vpa = process.env.NEXT_PUBLIC_UPI_MERCHANT_VPA || 'dejoiypay.merchant@icici';
    const merchantName = process.env.NEXT_PUBLIC_UPI_MERCHANT_NAME || 'DejoiY Technologies';
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();
    const tempId = `qr_dyn_${Date.now()}`;

    const qrPayload = buildUpiUri({
      pa: vpa,
      pn: merchantName,
      mc: '6012',
      am: amount,
      tr: tempId,
      tn: title,
      cu: 'INR',
      mode: '01',
    });

    const qrCode = db.createQrCode({
      merchantId: 'mer_dejoiypay_01',
      type: 'dynamic',
      title,
      amount,
      currency: 'INR',
      vpa,
      merchantName,
      mcc: '6012',
      status: 'ACTIVE',
      expiresAt,
      qrPayload,
    });

    return NextResponse.json({ success: true, qrCode }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to create QR code', message: err.message }, { status: 500 });
  }
}
