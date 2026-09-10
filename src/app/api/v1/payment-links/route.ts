import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { buildUpiUri } from '@/lib/upi/spec';
import { recordAuditLog } from '@/lib/security/audit';

const createLinkSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().min(3, 'Description is required'),
  customer: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }).optional(),
  customReference: z.string().optional(),
  expiresInDays: z.number().int().min(1).max(90).default(7),
});

export async function GET() {
  const links = db.getPaymentLinks();
  return NextResponse.json({ paymentLinks: links });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = createLinkSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { amount, description, customer, customReference, expiresInDays } = validation.data;
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 3600 * 1000).toISOString();
    const tempId = `dj_plink_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const qrPayload = buildUpiUri({
      pa: process.env.NEXT_PUBLIC_UPI_MERCHANT_VPA || 'dejoiypay.merchant@icici',
      pn: process.env.NEXT_PUBLIC_UPI_MERCHANT_NAME || 'DejoiY Technologies Pvt Ltd',
      am: amount,
      tr: tempId,
      tn: description.slice(0, 50),
      cu: 'INR',
      mode: '01',
    });

    const paymentLink = db.createPaymentLink({
      merchantId: 'mer_dejoiypay_01',
      environment: (process.env.PAYMENT_ENV as any) || 'test',
      amount,
      currency: 'INR',
      description,
      customer,
      expiresAt,
      customReference,
      qrPayload,
    });

    recordAuditLog({
      actor: 'merchant_admin',
      action: 'PAYMENT_LINK_CREATED',
      entityType: 'payment',
      entityId: paymentLink.id,
    });

    return NextResponse.json({ success: true, paymentLink }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to create payment link', message: err.message }, { status: 500 });
  }
}
