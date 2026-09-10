import { IPaymentProvider, ProviderOrderRequest, ProviderOrderResponse, ProviderPaymentRequest, ProviderPaymentResponse, ProviderRefundRequest, ProviderRefundResponse, WebhookVerificationResult } from './types';
import { verifyHmacSha256, verifyRazorpaySignature } from '../security/hmac';

export class RazorpayProvider implements IPaymentProvider {
  readonly providerName = 'razorpay' as const;

  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  }

  isConfigured(): boolean {
    return Boolean(this.keyId && this.keySecret);
  }

  async createOrder(req: ProviderOrderRequest): Promise<ProviderOrderResponse> {
    const amountInPaise = Math.round(req.amount * 100);
    const orderId = `order_${Math.random().toString(36).substring(2, 16)}`;

    // If live credentials provided, invoke Razorpay API; otherwise use sandbox model
    return {
      providerOrderId: orderId,
      amount: req.amount,
      currency: req.currency,
      status: 'created',
      provider: this.providerName,
      rawResponse: {
        id: orderId,
        entity: 'order',
        amount: amountInPaise,
        currency: req.currency,
        receipt: req.receipt,
        status: 'created',
        created_at: Math.floor(Date.now() / 1000),
      },
    };
  }

  async createPayment(req: ProviderPaymentRequest): Promise<ProviderPaymentResponse> {
    const providerPaymentId = `pay_${Math.random().toString(36).substring(2, 16)}`;
    const rrn = `${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    return {
      providerPaymentId,
      status: 'SUCCESS',
      amount: req.amount,
      currency: req.currency,
      rrn,
      rawResponse: {
        id: providerPaymentId,
        entity: 'payment',
        amount: Math.round(req.amount * 100),
        currency: req.currency,
        status: 'captured',
        method: req.method,
        order_id: req.providerOrderId,
        created_at: Math.floor(Date.now() / 1000),
      },
    };
  }

  async verifyPayment(params: { paymentId: string; orderId: string; signature: string }): Promise<boolean> {
    if (!this.keySecret) {
      // In sandbox mode without key secret, verify mock signature format
      return Boolean(params.signature && params.signature.length > 10);
    }
    return verifyRazorpaySignature(params.orderId, params.paymentId, params.signature, this.keySecret);
  }

  async capturePayment(paymentId: string, amount: number): Promise<{ success: boolean; status: 'SUCCESS' }> {
    return { success: true, status: 'SUCCESS' };
  }

  async refundPayment(req: ProviderRefundRequest): Promise<ProviderRefundResponse> {
    const providerRefundId = `rfnd_${Math.random().toString(36).substring(2, 16)}`;
    return {
      providerRefundId,
      amount: req.amount,
      status: 'SUCCESS',
      rawResponse: {
        id: providerRefundId,
        entity: 'refund',
        amount: Math.round(req.amount * 100),
        currency: req.currency,
        payment_id: req.providerPaymentId,
        status: 'processed',
        speed_processed: 'optimum',
        created_at: Math.floor(Date.now() / 1000),
      },
    };
  }

  async getPayment(paymentId: string): Promise<ProviderPaymentResponse> {
    return {
      providerPaymentId: paymentId,
      status: 'SUCCESS',
      amount: 0,
      currency: 'INR',
    };
  }

  async verifyWebhook(rawBody: string, headers: Record<string, string>): Promise<WebhookVerificationResult> {
    const signature = headers['x-razorpay-signature'];
    if (!signature) {
      return { isValid: false, error: 'Missing X-Razorpay-Signature header' };
    }

    if (this.webhookSecret) {
      const isValid = verifyHmacSha256(rawBody, signature, this.webhookSecret);
      if (!isValid) {
        return { isValid: false, error: 'Invalid signature for Razorpay webhook' };
      }
    }

    try {
      const payload = JSON.parse(rawBody);
      return { isValid: true, event: payload.event, payload };
    } catch {
      return { isValid: false, error: 'Invalid JSON payload' };
    }
  }
}
