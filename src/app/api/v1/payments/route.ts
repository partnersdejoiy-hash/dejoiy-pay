import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getPaymentProvider } from '@/lib/providers';
import { IdempotencyGuard } from '@/lib/security/idempotency';
import { recordAuditLog } from '@/lib/security/audit';
import { ProviderType, PaymentStatus } from '@/lib/types/payment';

const createPaymentSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  currency: z.enum(['INR', 'USD']).default('INR'),
  orderId: z.string().optional(),
  provider: z.enum(['direct-upi', 'razorpay', 'stripe', 'paytm', 'paytm-business', 'amazon-pay']).default('direct-upi'),
  method: z.enum(['upi', 'card', 'netbanking', 'wallet', 'bank_transfer']).default('upi'),
  customer: z.object({
    name: z.string().min(2, 'Customer name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
  }),
  paymentData: z.object({
    vpa: z.string().optional(),
    card: z.object({
      number: z.string(),
      expMonth: z.string(),
      expYear: z.string(),
      cvv: z.string(),
      name: z.string(),
    }).optional(),
    bankCode: z.string().optional(),
    wallet: z.string().optional(),
  }).default({}),
  notes: z.record(z.string()).optional(),
  simulatedStatus: z.enum(['SUCCESS', 'FAILED', 'PENDING']).optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') as PaymentStatus | undefined;
  const provider = searchParams.get('provider') as ProviderType | undefined;
  const method = searchParams.get('method') || undefined;
  const search = searchParams.get('search') || undefined;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

  const result = db.getTransactions({ status, provider, method, search, limit, offset });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const idempotencyKey = req.headers.get('Idempotency-Key') || req.headers.get('x-idempotency-key');

  if (idempotencyKey) {
    const cached = IdempotencyGuard.check(idempotencyKey);
    if (cached.exists && !cached.inFlight && cached.data) {
      return NextResponse.json(cached.data, {
        status: cached.statusCode || 200,
        headers: { 'X-Cache-Lookup': 'HIT', 'Idempotency-Key': idempotencyKey },
      });
    }
    if (cached.inFlight) {
      return NextResponse.json(
        { error: 'Conflict: A request with this Idempotency-Key is currently processing.' },
        { status: 409 }
      );
    }
    IdempotencyGuard.acquireLock(idempotencyKey);
  }

  try {
    const body = await req.json();
    const validation = createPaymentSchema.safeParse(body);

    if (!validation.success) {
      if (idempotencyKey) IdempotencyGuard.release(idempotencyKey);
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { amount, currency, orderId: customOrderId, provider: providerName, method, customer, paymentData, notes, simulatedStatus } = validation.data;
    const orderId = customOrderId || `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const provider = getPaymentProvider(providerName);

    // Call Provider Payment Flow
    const providerRes = await provider.createPayment({
      orderId,
      amount,
      currency,
      method: method as any,
      paymentData,
    });

    const finalStatus: PaymentStatus = simulatedStatus || providerRes.status;

    // Mask card details if provided (never store raw card or CVV)
    const paymentMethodObj: any = {
      type: method,
    };

    if (method === 'upi') {
      paymentMethodObj.upi = {
        vpa: paymentData.vpa || 'customer@upi',
        flow: paymentData.vpa ? 'collect' : 'intent',
        rrn: providerRes.rrn,
      };
    } else if (method === 'card' && paymentData.card) {
      paymentMethodObj.card = {
        last4: paymentData.card.number.slice(-4),
        network: paymentData.card.number.startsWith('4') ? 'visa' : 'mastercard',
        type: 'credit',
        tokenized: true,
      };
    } else if (method === 'netbanking') {
      paymentMethodObj.netbanking = {
        bankCode: paymentData.bankCode || 'HDFC',
        bankName: paymentData.bankCode === 'SBIN' ? 'State Bank of India' : 'HDFC Bank Ltd',
      };
    } else if (method === 'wallet') {
      paymentMethodObj.wallet = {
        provider: paymentData.wallet || 'Paytm Wallet',
      };
    }

    const transaction = db.createTransaction({
      orderId,
      merchantId: 'mer_dejoiypay_01',
      environment: (process.env.PAYMENT_ENV as any) || 'test',
      amount,
      currency,
      status: finalStatus,
      failureReason: finalStatus === 'FAILED' ? (providerRes.failureReason || 'Declined by payment processor') : undefined,
      provider: providerName,
      providerPaymentId: providerRes.providerPaymentId,
      paymentMethod: paymentMethodObj,
      customer,
      notes,
      settlementStatus: 'pending',
      idempotencyKey: idempotencyKey || undefined,
      timeline: [
        {
          status: 'CREATED',
          timestamp: new Date().toISOString(),
          message: `Order ${orderId} created for ₹${amount.toFixed(2)} via ${providerName}`,
          source: 'customer',
        },
        {
          status: finalStatus,
          timestamp: new Date().toISOString(),
          message:
            finalStatus === 'SUCCESS'
              ? `Payment confirmed by ${providerName} (RRN: ${providerRes.rrn || 'N/A'})`
              : finalStatus === 'FAILED'
              ? `Payment failed: ${providerRes.failureReason || 'Declined'}`
              : 'Payment is pending bank confirmation',
          source: 'provider',
        },
      ],
    });

    recordAuditLog({
      actor: customer.email,
      action: 'PAYMENT_CREATED',
      entityType: 'payment',
      entityId: transaction.id,
      changes: { status: { old: null, new: finalStatus } },
    });

    const responsePayload = {
      success: finalStatus === 'SUCCESS',
      transaction,
      providerResponse: providerRes,
    };

    if (idempotencyKey) {
      IdempotencyGuard.store(idempotencyKey, 200, responsePayload);
    }

    return NextResponse.json(responsePayload, { status: 201 });
  } catch (err: any) {
    if (idempotencyKey) IdempotencyGuard.release(idempotencyKey);
    return NextResponse.json({ error: 'Internal server error', message: err.message }, { status: 500 });
  }
}
