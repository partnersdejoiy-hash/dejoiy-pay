import crypto from 'crypto';

export function computeHmacSha256(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function timingSafeEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'hex');
    const bufB = Buffer.from(b, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export function verifyHmacSha256(payload: string, signature: string, secret: string): boolean {
  if (!payload || !signature || !secret) return false;
  const expectedSignature = computeHmacSha256(payload, secret);
  return timingSafeEqual(expectedSignature, signature);
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
  if (!orderId || !paymentId || !signature || !secret) return false;
  const payload = `${orderId}|${paymentId}`;
  return verifyHmacSha256(payload, signature, secret);
}

export function verifyStripeSignature(rawBody: string, header: string, secret: string): boolean {
  if (!rawBody || !header || !secret) return false;
  
  // Header format: t=1612345678,v1=5257a869e7ecebeda32affa62cd...
  const parts = header.split(',');
  let timestamp = '';
  let signature = '';

  for (const part of parts) {
    const [key, value] = part.trim().split('=');
    if (key === 't') timestamp = value;
    if (key === 'v1') signature = value;
  }

  if (!timestamp || !signature) return false;

  const payload = `${timestamp}.${rawBody}`;
  return verifyHmacSha256(payload, signature, secret);
}
