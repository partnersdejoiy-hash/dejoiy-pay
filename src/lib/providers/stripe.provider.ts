import { IPaymentProvider, ProviderOrderRequest, ProviderOrderResponse, ProviderPaymentRequest, ProviderPaymentResponse, ProviderRefundRequest, ProviderRefundResponse, WebhookVerificationResult } from './types';
import { verifyStripeSignature } from '../security/hmac';

export class StripeProvider implements IPaymentProvider {
  readonly providerName = 'stripe' as const;

  private secretKey: string;
  private webhookSecret: string;

  constructor() {
    this.secretKey = process.env.STRIPE_SECRET_KEY || '';
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  }

  isConfigured(): boolean {
    return Boolean(this.secretKey);
  }

  async createOrder(req: ProviderOrderRequest): Promise<ProviderOrderResponse> {
    const paymentIntentId = `pi_${Math.random().toString(36).substring(2, 24)}`;
    return {
      providerOrderId: paymentIntentId,
      amount: req.amount,
      currency: req.currency,
      status: 'created',
      provider: this.providerName,
      rawResponse: {
        id: paymentIntentId,
        object: 'payment_intent',
        amount: Math.round(req.amount * 100),
        currency: req.currency.toLowerCase(),
        client_secret: `${paymentIntentId}_secret_${Math.random().toString(36).substring(2, 16)}`,
        status: 'requires_payment_method',
      },
    };
  }

  async createPayment(req: ProviderPaymentRequest): Promise<ProviderPaymentResponse> {
    const chargeId = `ch_${Math.random().toString(36).substring(2, 24)}`;
    return {
      providerPaymentId: chargeId,
      status: 'SUCCESS',
      amount: req.amount,
      currency: req.currency,
      rawResponse: {
        id: chargeId,
        object: 'charge',
        amount: Math.round(req.amount * 100),
        currency: req.currency.toLowerCase(),
        paid: true,
        status: 'succeeded',
      },
    };
  }

  async verifyPayment(params: { paymentId: string; orderId: string; signature: string }): Promise<boolean> {
    return Boolean(params.paymentId && params.paymentId.startsWith('ch_'));
  }

  async capturePayment(paymentId: string, amount: number): Promise<{ success: boolean; status: 'SUCCESS' }> {
    return { success: true, status: 'SUCCESS' };
  }

  async refundPayment(req: ProviderRefundRequest): Promise<ProviderRefundResponse> {
    const refundId = `re_${Math.random().toString(36).substring(2, 24)}`;
    return {
      providerRefundId: refundId,
      amount: req.amount,
      status: 'SUCCESS',
      rawResponse: {
        id: refundId,
        object: 'refund',
        amount: Math.round(req.amount * 100),
        currency: req.currency.toLowerCase(),
        charge: req.providerPaymentId,
        status: 'succeeded',
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
    const sigHeader = headers['stripe-signature'];
    if (!sigHeader) {
      return { isValid: false, error: 'Missing stripe-signature header' };
    }

    if (this.webhookSecret) {
      const isValid = verifyStripeSignature(rawBody, sigHeader, this.webhookSecret);
      if (!isValid) {
        return { isValid: false, error: 'Invalid Stripe signature' };
      }
    }

    try {
      const payload = JSON.parse(rawBody);
      return { isValid: true, event: payload.type, payload };
    } catch {
      return { isValid: false, error: 'Invalid JSON payload' };
    }
  }
}
