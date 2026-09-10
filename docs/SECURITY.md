# DejoiY Pay — Security & Compliance Architecture

## 1. Zero Sensitive Data Storage (PCI-DSS)
- **Raw Card Numbers & CVV are NEVER stored**: Card data is tokenized using provider-hosted mechanisms.
- Database records only contain:
  - Last 4 digits
  - Card network (Visa, Mastercard, RuPay)
  - Token reference ID

## 2. Cryptographic Webhook Verification (HMAC-SHA256)
All webhook notifications must be verified using timing-safe comparison to protect against replay and forgery attacks:
```ts
import { computeHmacSha256, timingSafeEqual } from '@/lib/security/hmac';

export function verifyWebhook(rawBody: string, signature: string, secret: string): boolean {
  const expected = computeHmacSha256(rawBody, secret);
  return timingSafeEqual(expected, signature);
}
```

## 3. Replay Protection & Idempotency
- Double-clicking or network retries on payment submission are prevented via the `Idempotency-Key` header.
- Cached responses are returned with `idempotency-key` and `X-Cache-Lookup: HIT`.

## 4. Masking & Privacy Controls
- All API keys, consumer phone numbers, emails, and VPAs displayed in the frontend are masked.
- Raw secret keys are displayed only once upon generation.
