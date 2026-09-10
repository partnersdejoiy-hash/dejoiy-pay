import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { computeHmacSha256 } from '@/lib/security/hmac';

const simulateWebhookSchema = z.object({
  endpointUrl: z.string().url(),
  secret: z.string().default('whsec_test_demo'),
  event: z.string(),
  payload: z.record(z.unknown()),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = simulateWebhookSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { endpointUrl, secret, event, payload } = validation.data;
    const serialized = JSON.stringify({
      id: `evt_${Date.now()}`,
      event,
      createdAt: new Date().toISOString(),
      data: payload,
    });

    const signature = computeHmacSha256(serialized, secret);

    const log = db.recordWebhookLog({
      endpointId: 'custom_simulation',
      event,
      payload: JSON.parse(serialized),
      statusCode: 200,
      responseBody: '{"simulated": true, "ack": true}',
      status: 'success',
      attempts: 1,
    });

    return NextResponse.json({
      success: true,
      message: 'Simulated webhook dispatched and logged',
      signatureHeader: `sha256=${signature}`,
      payload: JSON.parse(serialized),
      log,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
