import { NextRequest, NextResponse } from 'next/server';
import { maskApiKey } from '@/lib/security/mask';

export async function GET() {
  const env = process.env.PAYMENT_ENV || 'test';
  const prefix = env === 'live' ? 'dj_sec_live_' : 'dj_sec_test_';
  const pubPrefix = env === 'live' ? 'dj_pub_live_' : 'dj_pub_test_';

  const fullPublishableKey = `${pubPrefix}88f12b0a99c43d8`;
  const fullSecretKey = `${prefix}99c27e44a0081d2f`;

  return NextResponse.json({
    environment: env,
    publishableKey: fullPublishableKey,
    secretKeyMasked: maskApiKey(fullSecretKey),
    createdAt: '2026-08-15T10:00:00.000Z',
    lastUsedAt: new Date().toISOString(),
  });
}

export async function POST() {
  const env = process.env.PAYMENT_ENV || 'test';
  const prefix = env === 'live' ? 'dj_sec_live_' : 'dj_sec_test_';
  const rawSecret = `${prefix}${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;

  return NextResponse.json({
    message: 'New API Key generated. Store this key securely. It will not be shown again in full.',
    environment: env,
    secretKey: rawSecret,
    secretKeyMasked: maskApiKey(rawSecret),
    createdAt: new Date().toISOString(),
  });
}
