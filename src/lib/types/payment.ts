export type PaymentStatus =
  | 'CREATED'
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'DISPUTED';

export type PaymentMethodType =
  | 'upi'
  | 'card'
  | 'netbanking'
  | 'wallet'
  | 'bank_transfer';

export type ProviderType =
  | 'direct-upi'
  | 'razorpay'
  | 'stripe'
  | 'paytm'
  | 'paytm-business'
  | 'amazon-pay';

export type EnvironmentMode = 'test' | 'live';

export interface PaymentMethodDetails {
  type: PaymentMethodType;
  upi?: {
    vpa: string;
    flow: 'collect' | 'intent' | 'qr';
    rrn?: string;
  };
  card?: {
    last4: string;
    network: 'visa' | 'mastercard' | 'rupay' | 'amex';
    type: 'credit' | 'debit';
    issuer?: string;
    tokenized?: boolean;
  };
  netbanking?: {
    bankCode: string;
    bankName: string;
  };
  wallet?: {
    provider: string;
    phone?: string;
  };
}

export interface PaymentTimelineEntry {
  status: PaymentStatus;
  timestamp: string;
  message: string;
  source: 'customer' | 'provider' | 'system' | 'merchant';
  details?: Record<string, unknown>;
}

export interface PaymentTransaction {
  id: string;                    // dj_pay_...
  orderId: string;               // ord_...
  merchantId: string;
  environment: EnvironmentMode;
  amount: number;                // In paise / cents or INR (stored in whole INR for clarity with decimals)
  currency: 'INR' | 'USD';
  fee: number;                   // Platform fee in INR
  tax: number;                   // GST 18% on fee
  netAmount: number;             // amount - (fee + tax)
  status: PaymentStatus;
  failureReason?: string;
  provider: ProviderType;
  providerPaymentId?: string;
  providerOrderId?: string;
  paymentMethod: PaymentMethodDetails;
  customer: {
    id?: string;
    name: string;
    email: string;
    phone: string;
  };
  notes?: Record<string, string>;
  timeline: PaymentTimelineEntry[];
  refunds: RefundTransaction[];
  settlementStatus: 'pending' | 'settled' | 'on_hold';
  settlementId?: string;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RefundTransaction {
  id: string;                    // dj_ref_...
  paymentId: string;
  amount: number;
  currency: 'INR' | 'USD';
  reason: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  providerRefundId?: string;
  createdAt: string;
  updatedAt: string;
  notes?: Record<string, string>;
}

export interface PaymentLink {
  id: string;                    // dj_plink_...
  merchantId: string;
  environment: EnvironmentMode;
  amount: number;
  currency: 'INR' | 'USD';
  description: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  status: 'ACTIVE' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
  customReference?: string;
  successUrl?: string;
  failureUrl?: string;
  paidAt?: string;
  paymentId?: string;
  visitsCount: number;
  qrPayload: string;
  createdAt: string;
  updatedAt: string;
}

export interface QrCodeDetails {
  id: string;                    // dj_qr_...
  merchantId: string;
  type: 'static' | 'dynamic';
  title: string;
  amount?: number;
  currency?: 'INR';
  vpa: string;
  merchantName: string;
  mcc: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  expiresAt?: string;
  qrPayload: string;
  totalCollected: number;
  transactionCount: number;
  createdAt: string;
}

export interface SettlementBatch {
  id: string;                    // dj_set_...
  merchantId: string;
  amount: number;
  fee: number;
  tax: number;
  netSettled: number;
  status: 'PENDING' | 'PROCESSING' | 'SETTLED' | 'FAILED';
  bankAccount: {
    accountNumberMasked: string;
    ifsc: string;
    bankName: string;
    beneficiaryName: string;
  };
  utr?: string;
  transactionIds: string[];
  scheduledAt: string;
  settledAt?: string;
  createdAt: string;
}

export interface CustomerProfile {
  id: string;                    // dj_cust_...
  merchantId: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  transactionCount: number;
  lastPaymentAt?: string;
  refundsCount: number;
  createdAt: string;
}

export interface WebhookEndpoint {
  id: string;
  merchantId: string;
  url: string;
  secret: string;
  events: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface WebhookDeliveryLog {
  id: string;
  endpointId: string;
  event: string;
  payload: Record<string, unknown>;
  statusCode: number;
  responseBody?: string;
  status: 'success' | 'failed';
  attempts: number;
  sentAt: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entityType: 'payment' | 'refund' | 'settlement' | 'api_key' | 'webhook' | 'settings';
  entityId: string;
  ipAddress?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  timestamp: string;
}
