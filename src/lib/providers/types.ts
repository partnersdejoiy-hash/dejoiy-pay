import { PaymentStatus, ProviderType } from '../types/payment';

export interface ProviderOrderRequest {
  amount: number;             // Amount in standard currency units (e.g. INR 500.00)
  currency: 'INR' | 'USD';
  receipt: string;            // Internal Order / Reference ID
  notes?: Record<string, string>;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface ProviderOrderResponse {
  providerOrderId: string;
  amount: number;
  currency: 'INR' | 'USD';
  status: 'created' | 'attempted' | 'paid';
  provider: ProviderType;
  rawResponse?: unknown;
}

export interface ProviderPaymentRequest {
  orderId: string;
  providerOrderId?: string;
  amount: number;
  currency: 'INR' | 'USD';
  method: 'upi' | 'card' | 'netbanking' | 'wallet';
  paymentData: {
    vpa?: string;
    card?: {
      number: string;
      expMonth: string;
      expYear: string;
      cvv: string;
      name: string;
    };
    bankCode?: string;
    wallet?: string;
  };
}

export interface ProviderPaymentResponse {
  providerPaymentId: string;
  status: PaymentStatus;
  amount: number;
  currency: 'INR' | 'USD';
  rrn?: string;
  failureReason?: string;
  requiresAction?: boolean;
  actionUrl?: string;
  rawResponse?: unknown;
}

export interface ProviderRefundRequest {
  providerPaymentId: string;
  amount: number;
  currency: 'INR' | 'USD';
  reason: string;
  notes?: Record<string, string>;
}

export interface ProviderRefundResponse {
  providerRefundId: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  rawResponse?: unknown;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  event?: string;
  payload?: Record<string, unknown>;
  error?: string;
}

export interface IPaymentProvider {
  readonly providerName: ProviderType;
  isConfigured(): boolean;
  createOrder(req: ProviderOrderRequest): Promise<ProviderOrderResponse>;
  createPayment(req: ProviderPaymentRequest): Promise<ProviderPaymentResponse>;
  verifyPayment(params: { paymentId: string; orderId: string; signature: string }): Promise<boolean>;
  capturePayment(paymentId: string, amount: number): Promise<{ success: boolean; status: PaymentStatus }>;
  refundPayment(req: ProviderRefundRequest): Promise<ProviderRefundResponse>;
  getPayment(paymentId: string): Promise<ProviderPaymentResponse>;
  verifyWebhook(rawBody: string, headers: Record<string, string>): Promise<WebhookVerificationResult>;
}
