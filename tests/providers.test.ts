import { describe, it, expect } from 'vitest';
import { providerRegistry } from '../src/lib/providers';
import { DirectUpiProvider } from '../src/lib/providers/direct-upi.provider';
import { RazorpayProvider } from '../src/lib/providers/razorpay.provider';
import { StripeProvider } from '../src/lib/providers/stripe.provider';
import { PaytmProvider } from '../src/lib/providers/paytm.provider';
import { PaytmBusinessProvider } from '../src/lib/providers/paytm-business.provider';
import { AmazonPayProvider } from '../src/lib/providers/amazon-pay.provider';

describe('Payment Provider Abstraction Layer', () => {
  it('should register all 6 providers in the registry', () => {
    const list = providerRegistry.list();
    expect(list.length).toBe(6);
    const ids = list.map(p => p.id);
    expect(ids).toContain('direct-upi');
    expect(ids).toContain('razorpay');
    expect(ids).toContain('stripe');
    expect(ids).toContain('paytm');
    expect(ids).toContain('paytm-business');
    expect(ids).toContain('amazon-pay');
  });

  describe('DirectUpiProvider', () => {
    const provider = new DirectUpiProvider();

    it('should create order and return UPI params', async () => {
      const order = await provider.createOrder({
        amount: 500,
        currency: 'INR',
        receipt: 'rec_123',
      });
      expect(order.status).toBe('created');
      expect(order.amount).toBe(500);
      expect(order.provider).toBe('direct-upi');
    });

    it('should create payment and generate NPCI compliant intent uri', async () => {
      const payment = await provider.createPayment({
        orderId: 'ord_test_01',
        amount: 1500,
        currency: 'INR',
        method: 'upi',
        paymentData: { vpa: 'user@okhdfcbank' },
      });
      expect(payment.status).toBe('SUCCESS');
      expect(payment.actionUrl).toContain('upi://pay');
      expect(payment.actionUrl).toContain('pa=');
      expect(payment.rrn).toBeDefined();
    });

    it('should refund payment', async () => {
      const refund = await provider.refundPayment({
        providerPaymentId: 'upi_pay_123',
        amount: 500,
        currency: 'INR',
        reason: 'Customer return',
      });
      expect(refund.status).toBe('SUCCESS');
      expect(refund.providerRefundId).toBeDefined();
    });
  });

  describe('RazorpayProvider', () => {
    const provider = new RazorpayProvider();

    it('should create razorpay order format', async () => {
      const order = await provider.createOrder({
        amount: 2000,
        currency: 'INR',
        receipt: 'ord_rzp_1',
      });
      expect(order.provider).toBe('razorpay');
      expect(order.providerOrderId).toBeDefined();
    });

    it('should process payment', async () => {
      const payment = await provider.createPayment({
        orderId: 'ord_rzp_1',
        amount: 2000,
        currency: 'INR',
        method: 'card',
        paymentData: {},
      });
      expect(payment.status).toBe('SUCCESS');
      expect(payment.providerPaymentId.startsWith('pay_')).toBe(true);
    });
  });

  describe('StripeProvider', () => {
    const provider = new StripeProvider();

    it('should create payment intent format', async () => {
      const order = await provider.createOrder({
        amount: 100,
        currency: 'USD',
        receipt: 'ord_strp_1',
      });
      expect(order.providerOrderId.startsWith('pi_')).toBe(true);
    });

    it('should process charge', async () => {
      const payment = await provider.createPayment({
        orderId: 'ord_strp_1',
        amount: 100,
        currency: 'USD',
        method: 'card',
        paymentData: {},
      });
      expect(payment.providerPaymentId.startsWith('ch_')).toBe(true);
    });
  });

  describe('Paytm & Amazon Pay Providers', () => {
    it('Paytm should create transaction token format', async () => {
      const paytm = new PaytmProvider();
      const order = await paytm.createOrder({ amount: 350, currency: 'INR', receipt: 'ptm_1' });
      expect(order.providerOrderId.startsWith('PTM_ORD_')).toBe(true);
    });

    it('Amazon Pay should create checkout session format', async () => {
      const amzn = new AmazonPayProvider();
      const order = await amzn.createOrder({ amount: 800, currency: 'INR', receipt: 'amz_1' });
      expect(order.providerOrderId.startsWith('amzn_cs_')).toBe(true);
    });
  });
});
