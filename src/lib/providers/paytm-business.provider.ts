import { IPaymentProvider, ProviderOrderRequest, ProviderOrderResponse, ProviderPaymentRequest, ProviderPaymentResponse, ProviderRefundRequest, ProviderRefundResponse, WebhookVerificationResult } from './types';

export class PaytmBusinessProvider implements IPaymentProvider {
  readonly providerName = 'paytm-business' as const;

  private merchantId: string;
  private merchantKey: string;

  constructor() {
    this.merchantId = process.env.PAYTM_MERCHANT_ID || '';
    this.merchantKey = process.env.PAYTM_MERCHANT_KEY || '';
  }

  isConfigured(): boolean {
    return Boolean(this.merchantId && this.merchantKey);
  }

  async createOrder(req: ProviderOrderRequest): Promise<ProviderOrderResponse> {
    const businessOrderId = `PTM_BIZ_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      providerOrderId: businessOrderId,
      amount: req.amount,
      currency: req.currency,
      status: 'created',
      provider: this.providerName,
      rawResponse: {
        mid: this.merchantId || 'TEST_BIZ_MID',
        orderId: businessOrderId,
        channelId: 'WAP',
        soundboxEligible: true,
      },
    };
  }

  async createPayment(req: ProviderPaymentRequest): Promise<ProviderPaymentResponse> {
    const txnId = `BIZ_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    return {
      providerPaymentId: txnId,
      status: 'SUCCESS',
      amount: req.amount,
      currency: req.currency,
      rrn: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      rawResponse: {
        txnId,
        orderId: req.orderId,
        soundboxVoicePayload: `DejoiY Pay par ${req.amount} rupaye prapt hue.`,
      },
    };
  }

  async verifyPayment(params: { paymentId: string; orderId: string; signature: string }): Promise<boolean> {
    return Boolean(params.paymentId && params.paymentId.startsWith('BIZ_'));
  }

  async capturePayment(paymentId: string, amount: number): Promise<{ success: boolean; status: 'SUCCESS' }> {
    return { success: true, status: 'SUCCESS' };
  }

  async refundPayment(req: ProviderRefundRequest): Promise<ProviderRefundResponse> {
    const refundId = `BIZ_REF_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return {
      providerRefundId: refundId,
      amount: req.amount,
      status: 'SUCCESS',
      rawResponse: {
        refundId,
        status: 'ACCEPTED',
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
    try {
      const payload = JSON.parse(rawBody);
      return { isValid: true, event: 'SOUNDBOX_ALERT', payload };
    } catch {
      return { isValid: false, error: 'Invalid JSON' };
    }
  }
}
