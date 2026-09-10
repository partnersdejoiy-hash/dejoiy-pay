import { IPaymentProvider, ProviderOrderRequest, ProviderOrderResponse, ProviderPaymentRequest, ProviderPaymentResponse, ProviderRefundRequest, ProviderRefundResponse, WebhookVerificationResult } from './types';

export class AmazonPayProvider implements IPaymentProvider {
  readonly providerName = 'amazon-pay' as const;

  private merchantId: string;
  private publicKeyId: string;

  constructor() {
    this.merchantId = process.env.AMAZON_PAY_MERCHANT_ID || '';
    this.publicKeyId = process.env.AMAZON_PAY_PUBLIC_KEY_ID || '';
  }

  isConfigured(): boolean {
    return Boolean(this.merchantId && this.publicKeyId);
  }

  async createOrder(req: ProviderOrderRequest): Promise<ProviderOrderResponse> {
    const checkoutSessionId = `amzn_cs_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    return {
      providerOrderId: checkoutSessionId,
      amount: req.amount,
      currency: req.currency,
      status: 'created',
      provider: this.providerName,
      rawResponse: {
        checkoutSessionId,
        webCheckoutDetail: {
          amazonPayRedirectUrl: `https://pay.amazon.in/checkout/v2?session=${checkoutSessionId}`,
        },
        chargePermissionType: 'OneTime',
      },
    };
  }

  async createPayment(req: ProviderPaymentRequest): Promise<ProviderPaymentResponse> {
    const chargeId = `S02-AMZN-CHRG-${Math.floor(10000000 + Math.random() * 90000000)}`;
    return {
      providerPaymentId: chargeId,
      status: 'SUCCESS',
      amount: req.amount,
      currency: req.currency,
      rawResponse: {
        chargeId,
        chargeAmount: {
          amount: req.amount.toFixed(2),
          currencyCode: req.currency,
        },
        statusDetails: {
          state: 'Captured',
          reasonCode: null,
          lastUpdateTimestamp: new Date().toISOString(),
        },
      },
    };
  }

  async verifyPayment(params: { paymentId: string; orderId: string; signature: string }): Promise<boolean> {
    return Boolean(params.paymentId && params.paymentId.includes('AMZN'));
  }

  async capturePayment(paymentId: string, amount: number): Promise<{ success: boolean; status: 'SUCCESS' }> {
    return { success: true, status: 'SUCCESS' };
  }

  async refundPayment(req: ProviderRefundRequest): Promise<ProviderRefundResponse> {
    const refundId = `S02-AMZN-RFND-${Math.floor(10000000 + Math.random() * 90000000)}`;
    return {
      providerRefundId: refundId,
      amount: req.amount,
      status: 'SUCCESS',
      rawResponse: {
        refundId,
        refundAmount: {
          amount: req.amount.toFixed(2),
          currencyCode: req.currency,
        },
        statusDetails: {
          state: 'Refunded',
        },
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
      return { isValid: true, event: payload.NotificationType || 'AMAZON_PAY_EVENT', payload };
    } catch {
      return { isValid: false, error: 'Invalid Amazon Pay webhook payload' };
    }
  }
}
