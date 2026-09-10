import { describe, it, expect } from 'vitest';
import { computeHmacSha256, verifyHmacSha256, verifyRazorpaySignature, verifyStripeSignature } from '../src/lib/security/hmac';
import { maskCardNumber, maskVpa, maskApiKey } from '../src/lib/security/mask';
import { validateVpa, buildUpiUri } from '../src/lib/upi/spec';

describe('Security & Cryptography Utilities', () => {
  const secret = 'super_secret_signing_key_456';
  const payload = JSON.stringify({ event: 'payment.success', amount: 1500 });

  it('should generate and verify valid HMAC-SHA256 signatures', () => {
    const signature = computeHmacSha256(payload, secret);
    expect(signature).toBeDefined();
    expect(signature.length).toBe(64); // 32 bytes in hex = 64 chars

    const isValid = verifyHmacSha256(payload, signature, secret);
    expect(isValid).toBe(true);

    const isTampered = verifyHmacSha256(payload + 'tampered', signature, secret);
    expect(isTampered).toBe(false);
  });

  it('should verify Razorpay signature scheme (orderId|paymentId)', () => {
    const orderId = 'order_123';
    const paymentId = 'pay_456';
    const sig = computeHmacSha256(`${orderId}|${paymentId}`, secret);

    expect(verifyRazorpaySignature(orderId, paymentId, sig, secret)).toBe(true);
    expect(verifyRazorpaySignature(orderId, 'pay_wrong', sig, secret)).toBe(false);
  });

  it('should verify Stripe signature scheme (timestamp.payload)', () => {
    const ts = '1612345678';
    const sig = computeHmacSha256(`${ts}.${payload}`, secret);
    const header = `t=${ts},v1=${sig}`;

    expect(verifyStripeSignature(payload, header, secret)).toBe(true);
  });

  describe('Masking Utilities (PCI-DSS & Sensitive Credential Safeguards)', () => {
    it('should mask card number preserving last 4 digits only', () => {
      expect(maskCardNumber('4532882199014242')).toBe('•••• •••• •••• 4242');
    });

    it('should mask VPA / UPI ID', () => {
      expect(maskVpa('rohan.verma@okhdfcbank')).toContain('••••@okhdfcbank');
    });

    it('should mask API keys', () => {
      const key = 'dj_sec_live_98a76d123e45f67a89b';
      const masked = maskApiKey(key);
      expect(masked.startsWith('dj_sec_live_')).toBe(true);
      expect(masked).toContain('••••');
    });
  });

  describe('NPCI UPI Specification Compliance', () => {
    it('should validate standard UPI handles', () => {
      expect(validateVpa('merchant@icici').isValid).toBe(true);
      expect(validateVpa('user@okhdfcbank').isValid).toBe(true);
      expect(validateVpa('invalid-format').isValid).toBe(false);
    });

    it('should construct valid NPCI UPI Deep Link URI', () => {
      const uri = buildUpiUri({
        pa: 'dejoiypay.merchant@icici',
        pn: 'DejoiY Technologies',
        am: 1250,
        tr: 'ORD_991',
        tn: 'Invoice 991',
      });
      expect(uri).toContain('upi://pay?');
      expect(uri).toContain('pa=dejoiypay.merchant%40icici');
      expect(uri).toContain('am=1250.00');
      expect(uri).toContain('cu=INR');
    });
  });
});
