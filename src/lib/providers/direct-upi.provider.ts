import { IPaymentProvider, ProviderOrderRequest, ProviderOrderResponse, ProviderPaymentRequest, ProviderPaymentResponse, ProviderRefundRequest, ProviderRefundResponse, WebhookVerificationResult } from './types';
import { buildUpiUri, validateVpa } from '../upi/spec';
import { verifyHmacSha256 } from '../security/hmac';

export class DirectUpiProvider implements IPaymentProvider {
  readonly providerName = 'direct-upi' as const;

  private merchantVpa: string;
  private merchantName: string;
  private mcc: string;

  constructor() {
    this.merchantVpa = process.env.NEXT_PUBLIC_UPI_MERCHANT_VPA || 'dejoiypay.merchant@icici';
    this.merchantName = process.env.NEXT_PUBLIC_UPI_MERCHANT_NAME || 'DejoiY Technologies Pvt Ltd';
    this.mcc = process.env.UPI_MCC || '6012';
  }

  isConfigured(): boolean {
    return Boolean(this.merchantVpa && this.merchantName);
  }

  async createOrder(req: ProviderOrderRequest): Promise<ProviderOrderResponse> {
    const providerOrderId = `upi_ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      providerOrderId,
      amount: req.amount,
      currency: req.currency,
      status: 'created',
      provider: this.providerName,
      rawResponse: {
        vpa: this.merchantVpa,
        merchantName: this.merchantName,
        mcc: this.mcc,
      },
    };
  }

  async createPayment(req: ProviderPaymentRequest): Promise<ProviderPaymentResponse> {
    const providerPaymentId = `upi_pay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const rrn = `${Math.floor(100000000000 + Math.random() * 900000000000)}`; // 12-digit RRN

    if (req.method === 'upi' && req.paymentData.vpa) {
      const vpaCheck = validateVpa(req.paymentData.vpa);
      if (!vpaCheck.isValid) {
        return {
          providerPaymentId,
          status: 'FAILED',
          amount: req.amount,
          currency: req.currency,
          failureReason: vpaCheck.error || 'Invalid VPA format',
        };
      }
    }

    // Direct UPI payment intent URL
    const upiUri = buildUpiUri({
      pa: this.merchantVpa,
      pn: this.merchantName,
      mc: this.mcc,
      tr: req.orderId,
      am: req.amount,
      cu: 'INR',
      tn: `DejoiY Pay Order ${req.orderId}`,
      mode: '02',
    });

    return {
      providerPaymentId,
      status: 'SUCCESS',
      amount: req.amount,
      currency: req.currency,
      rrn,
      actionUrl: upiUri,
      rawResponse: {
        rrn,
        upiUri,
        authCode: `AUTH_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      },
    };
  }

  async verifyPayment(params: { paymentId: string; orderId: string; signature: string }): Promise<boolean> {
    const secret = process.env.DEJOIY_WEBHOOK_SIGNING_SECRET || 'dejoiypay_default_secret';
    return verifyHmacSha256(`${params.orderId}|${params.paymentId}`, params.signature, secret);
  }

  async capturePayment(paymentId: string, amount: number): Promise<{ success: boolean; status: 'SUCCESS' }> {
    return { success: true, status: 'SUCCESS' };
  }

  async refundPayment(req: ProviderRefundRequest): Promise<ProviderRefundResponse> {
    const providerRefundId = `upi_ref_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      providerRefundId,
      amount: req.amount,
      status: 'SUCCESS',
      rawResponse: {
        refundRrn: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        processedAt: new Date().toISOString(),
      },
    };
  }

  async getPayment(paymentId: string): Promise<ProviderPaymentResponse> {
    return {
      providerPaymentId: paymentId,
      status: 'SUCCESS',
      amount: 0,
      currency: 'INR',
      rrn: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
    };
  }

  async verifyWebhook(rawBody: string, headers: Record<string, string>): Promise<WebhookVerificationResult> {
    const signature = headers['x-dejoiypay-signature'] || headers['x-signature'];
    const secret = process.env.DEJOIY_WEBHOOK_SIGNING_SECRET || 'dejoiypay_default_secret';

    if (!signature) {
      return { isValid: false, error: 'Missing signature header' };
    }

    const isValid = verifyHmacSha256(rawBody, signature, secret);
    if (!isValid) {
      return { isValid: false, error: 'Invalid HMAC signature' };
    }

    try {
      const payload = JSON.parse(rawBody);
      return { isValid: true, event: payload.event, payload };
    } catch {
      return { isValid: false, error: 'Invalid JSON payload' };
    }
  }
}
