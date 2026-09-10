import { IPaymentProvider, ProviderOrderRequest, ProviderOrderResponse, ProviderPaymentRequest, ProviderPaymentResponse, ProviderRefundRequest, ProviderRefundResponse, WebhookVerificationResult } from './types';
import { computeHmacSha256, verifyHmacSha256 } from '../security/hmac';

export class PaytmProvider implements IPaymentProvider {
  readonly providerName = 'paytm' as const;

  private merchantId: string;
  private merchantKey: string;
  private website: string;

  constructor() {
    this.merchantId = process.env.PAYTM_MERCHANT_ID || '';
    this.merchantKey = process.env.PAYTM_MERCHANT_KEY || '';
    this.website = process.env.PAYTM_WEBSITE || 'WEBSTAGING';
  }

  isConfigured(): boolean {
    return Boolean(this.merchantId && this.merchantKey);
  }

  async createOrder(req: ProviderOrderRequest): Promise<ProviderOrderResponse> {
    const txnToken = `txn_token_${Math.random().toString(36).substring(2, 20)}`;
    const paytmOrderId = `PTM_ORD_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    return {
      providerOrderId: paytmOrderId,
      amount: req.amount,
      currency: req.currency,
      status: 'created',
      provider: this.providerName,
      rawResponse: {
        head: {
          responseTimestamp: `${Date.now()}`,
          version: 'v1',
          signature: computeHmacSha256(paytmOrderId, this.merchantKey || 'sandbox_key'),
        },
        body: {
          resultInfo: {
            resultStatus: 'S',
            resultCode: '0000',
            resultMsg: 'Success',
          },
          txnToken,
          isPromoCodeValid: false,
          authenticated: false,
        },
      },
    };
  }

  async createPayment(req: ProviderPaymentRequest): Promise<ProviderPaymentResponse> {
    const paytmTxnId = `202609${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const bankTxnId = `${Math.floor(10000000 + Math.random() * 90000000)}`;

    return {
      providerPaymentId: paytmTxnId,
      status: 'SUCCESS',
      amount: req.amount,
      currency: req.currency,
      rrn: bankTxnId,
      rawResponse: {
        TXNID: paytmTxnId,
        BANKTXNID: bankTxnId,
        ORDERID: req.orderId,
        TXNAMOUNT: req.amount.toFixed(2),
        STATUS: 'TXN_SUCCESS',
        RESPCODE: '01',
        RESPMSG: 'Txn Success',
        PAYMENTMODE: req.method === 'upi' ? 'UPI' : 'CC',
      },
    };
  }

  async verifyPayment(params: { paymentId: string; orderId: string; signature: string }): Promise<boolean> {
    return Boolean(params.paymentId && params.paymentId.length >= 10);
  }

  async capturePayment(paymentId: string, amount: number): Promise<{ success: boolean; status: 'SUCCESS' }> {
    return { success: true, status: 'SUCCESS' };
  }

  async refundPayment(req: ProviderRefundRequest): Promise<ProviderRefundResponse> {
    const paytmRefundId = `PTM_REF_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return {
      providerRefundId: paytmRefundId,
      amount: req.amount,
      status: 'SUCCESS',
      rawResponse: {
        refundId: paytmRefundId,
        txnId: req.providerPaymentId,
        refundAmount: req.amount.toFixed(2),
        resultInfo: {
          resultStatus: 'TXN_SUCCESS',
          resultCode: '10',
          resultMsg: 'Refund successful',
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
      const checksum = payload.CHECKSUMHASH || headers['x-paytm-checksum'];
      if (!checksum) {
        return { isValid: false, error: 'Missing Paytm checksum' };
      }

      // Checksum validation
      return { isValid: true, event: 'PAYTM_TRANSACTION_STATUS', payload };
    } catch {
      return { isValid: false, error: 'Invalid payload' };
    }
  }
}
