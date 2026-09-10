import fs from 'fs';
import path from 'path';
import {
  PaymentTransaction,
  PaymentLink,
  QrCodeDetails,
  SettlementBatch,
  CustomerProfile,
  WebhookEndpoint,
  WebhookDeliveryLog,
  PaymentStatus,
  EnvironmentMode,
  ProviderType,
} from '../types/payment';

interface ConsumerWallet {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  balance: number;
  currency: 'INR';
  vpa: string;
  upiPinConfigured: boolean;
  dailyLimit: number;
  perTxnLimit: number;
  biometricEnabled: boolean;
  savedMethods: {
    upiIds: Array<{ id: string; vpa: string; bankName: string; isDefault: boolean }>;
    bankAccounts: Array<{ id: string; bankName: string; accountNumberMasked: string; ifsc: string; isPrimary: boolean }>;
    cards: Array<{ id: string; last4: string; network: 'visa' | 'mastercard' | 'rupay'; expMonth: string; expYear: string; cardHolder: string }>;
  };
}

export interface DatabaseSchema {
  environment: EnvironmentMode;
  transactions: PaymentTransaction[];
  paymentLinks: PaymentLink[];
  qrCodes: QrCodeDetails[];
  settlements: SettlementBatch[];
  customers: CustomerProfile[];
  webhooks: WebhookEndpoint[];
  webhookLogs: WebhookDeliveryLog[];
  consumerWallet: ConsumerWallet;
}

const DB_FILE_PATH = path.resolve(process.cwd(), 'data/dejoiypay.json');

class DatabaseEngine {
  private data: DatabaseSchema;
  private isLoaded = false;

  constructor() {
    this.data = this.getDefaultState();
    this.init();
  }

  private getDefaultState(): DatabaseSchema {
    return {
      environment: (process.env.PAYMENT_ENV as EnvironmentMode) || 'test',
      transactions: [],
      paymentLinks: [],
      qrCodes: [],
      settlements: [],
      customers: [],
      webhooks: [],
      webhookLogs: [],
      consumerWallet: {
        id: 'wlt_usr_01',
        userId: 'usr_dejoiypay_01',
        name: 'Aakash Sharma',
        phone: '+91 98765 43210',
        email: 'aakash.sharma@dejoiypay.com',
        balance: 24850.75,
        currency: 'INR',
        vpa: 'aakash@dejoiypay',
        upiPinConfigured: true,
        dailyLimit: 100000,
        perTxnLimit: 50000,
        biometricEnabled: true,
        savedMethods: {
          upiIds: [
            { id: 'upi_1', vpa: 'aakash@okhdfcbank', bankName: 'HDFC Bank', isDefault: true },
            { id: 'upi_2', vpa: 'aakash@okicici', bankName: 'ICICI Bank', isDefault: false },
          ],
          bankAccounts: [
            { id: 'bnk_1', bankName: 'HDFC Bank Ltd', accountNumberMasked: '•••• •••• 4092', ifsc: 'HDFC0000128', isPrimary: true },
            { id: 'bnk_2', bankName: 'State Bank of India', accountNumberMasked: '•••• •••• 9918', ifsc: 'SBIN0001824', isPrimary: false },
          ],
          cards: [
            { id: 'crd_1', last4: '8821', network: 'visa', expMonth: '08', expYear: '28', cardHolder: 'AAKASH SHARMA' },
            { id: 'crd_2', last4: '4109', network: 'rupay', expMonth: '11', expYear: '27', cardHolder: 'AAKASH SHARMA' },
          ],
        },
      },
    };
  }

  private init() {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        if (raw.trim()) {
          this.data = JSON.parse(raw);
          this.isLoaded = true;
          return;
        }
      }
      // Populate seed if file was absent or empty
      this.seedInitialData();
      this.persist();
      this.isLoaded = true;
    } catch (err) {
      console.error('Database load error, resetting to initial seed:', err);
      this.seedInitialData();
    }
  }

  private persist() {
    try {
      const tempPath = `${DB_FILE_PATH}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE_PATH);
    } catch (err) {
      console.error('Failed to persist database:', err);
    }
  }

  private seedInitialData() {
    const now = new Date();
    const isoHoursAgo = (hours: number) => new Date(now.getTime() - hours * 3600 * 1000).toISOString();
    const isoDaysAgo = (days: number) => new Date(now.getTime() - days * 24 * 3600 * 1000).toISOString();

    this.data.customers = [
      {
        id: 'cust_delhi_01',
        merchantId: 'mer_dejoiypay_01',
        name: 'Rohan Verma',
        email: 'rohan.verma@example.com',
        phone: '+91 98112 34567',
        totalSpent: 42500,
        transactionCount: 12,
        lastPaymentAt: isoHoursAgo(2),
        refundsCount: 0,
        createdAt: isoDaysAgo(45),
      },
      {
        id: 'cust_bengaluru_02',
        merchantId: 'mer_dejoiypay_01',
        name: 'Priyanka Sundaram',
        email: 'priyanka.sundaram@techindia.org',
        phone: '+91 99001 88234',
        totalSpent: 87400,
        transactionCount: 28,
        lastPaymentAt: isoHoursAgo(5),
        refundsCount: 1,
        createdAt: isoDaysAgo(60),
      },
      {
        id: 'cust_mumbai_03',
        merchantId: 'mer_dejoiypay_01',
        name: 'Aditya Kapoor',
        email: 'aditya.kapoor@innovate.co',
        phone: '+91 98200 55432',
        totalSpent: 19800,
        transactionCount: 5,
        lastPaymentAt: isoDaysAgo(1),
        refundsCount: 0,
        createdAt: isoDaysAgo(20),
      },
      {
        id: 'cust_hyderabad_04',
        merchantId: 'mer_dejoiypay_01',
        name: 'Sneha Reddy',
        email: 'sneha.reddy@startup.in',
        phone: '+91 97010 33412',
        totalSpent: 135000,
        transactionCount: 42,
        lastPaymentAt: isoDaysAgo(2),
        refundsCount: 2,
        createdAt: isoDaysAgo(90),
      },
    ];

    this.data.transactions = [
      {
        id: 'dj_pay_109283741',
        orderId: 'ord_inv_88210',
        merchantId: 'mer_dejoiypay_01',
        environment: 'test',
        amount: 4500.0,
        currency: 'INR',
        fee: 90.0,
        tax: 16.2,
        netAmount: 4393.8,
        status: 'SUCCESS',
        provider: 'direct-upi',
        providerPaymentId: 'upi_pay_99812401',
        paymentMethod: {
          type: 'upi',
          upi: { vpa: 'rohan.verma@okhdfcbank', flow: 'intent', rrn: '425510982314' },
        },
        customer: {
          id: 'cust_delhi_01',
          name: 'Rohan Verma',
          email: 'rohan.verma@example.com',
          phone: '+91 98112 34567',
        },
        notes: { plan: 'DejoiY Cloud Pro Annual', invoiceNumber: 'INV-2026-09-001' },
        timeline: [
          { status: 'CREATED', timestamp: isoHoursAgo(2), message: 'Order created via Checkout Link', source: 'customer' },
          { status: 'PENDING', timestamp: isoHoursAgo(2), message: 'UPI Intent triggered on HDFC Bank app', source: 'provider' },
          { status: 'SUCCESS', timestamp: isoHoursAgo(2), message: 'Payment authorized and captured (RRN: 425510982314)', source: 'provider' },
        ],
        refunds: [],
        settlementStatus: 'settled',
        settlementId: 'dj_set_90112',
        createdAt: isoHoursAgo(2),
        updatedAt: isoHoursAgo(2),
      },
      {
        id: 'dj_pay_109283742',
        orderId: 'ord_inv_88211',
        merchantId: 'mer_dejoiypay_01',
        environment: 'test',
        amount: 12500.0,
        currency: 'INR',
        fee: 250.0,
        tax: 45.0,
        netAmount: 12205.0,
        status: 'SUCCESS',
        provider: 'razorpay',
        providerPaymentId: 'pay_rzp_9843109',
        paymentMethod: {
          type: 'card',
          card: { last4: '4242', network: 'visa', type: 'credit', issuer: 'HDFC Bank', tokenized: true },
        },
        customer: {
          id: 'cust_bengaluru_02',
          name: 'Priyanka Sundaram',
          email: 'priyanka.sundaram@techindia.org',
          phone: '+91 99001 88234',
        },
        notes: { service: 'Enterprise API Gateway Subscription' },
        timeline: [
          { status: 'CREATED', timestamp: isoHoursAgo(5), message: 'Payment intent created', source: 'customer' },
          { status: 'PROCESSING', timestamp: isoHoursAgo(5), message: '3D Secure OTP verification in progress', source: 'provider' },
          { status: 'SUCCESS', timestamp: isoHoursAgo(5), message: 'Payment captured successfully via Razorpay', source: 'provider' },
        ],
        refunds: [],
        settlementStatus: 'pending',
        createdAt: isoHoursAgo(5),
        updatedAt: isoHoursAgo(5),
      },
      {
        id: 'dj_pay_109283743',
        orderId: 'ord_inv_88212',
        merchantId: 'mer_dejoiypay_01',
        environment: 'test',
        amount: 3200.0,
        currency: 'INR',
        fee: 64.0,
        tax: 11.52,
        netAmount: 3124.48,
        status: 'REFUNDED',
        provider: 'direct-upi',
        providerPaymentId: 'upi_pay_7721890',
        paymentMethod: {
          type: 'upi',
          upi: { vpa: 'priyanka@ybl', flow: 'qr', rrn: '425510443219' },
        },
        customer: {
          id: 'cust_bengaluru_02',
          name: 'Priyanka Sundaram',
          email: 'priyanka.sundaram@techindia.org',
          phone: '+91 99001 88234',
        },
        timeline: [
          { status: 'CREATED', timestamp: isoDaysAgo(1), message: 'QR Code scanned at DejoiY kiosk', source: 'customer' },
          { status: 'SUCCESS', timestamp: isoDaysAgo(1), message: 'Payment confirmed via Soundbox', source: 'provider' },
          { status: 'REFUNDED', timestamp: isoHoursAgo(8), message: 'Full refund initiated by merchant: Customer return', source: 'merchant' },
        ],
        refunds: [
          {
            id: 'dj_ref_77192',
            paymentId: 'dj_pay_109283743',
            amount: 3200.0,
            currency: 'INR',
            reason: 'Customer requested cancellation within 24h',
            status: 'SUCCESS',
            providerRefundId: 'upi_ref_449102',
            createdAt: isoHoursAgo(8),
            updatedAt: isoHoursAgo(8),
          },
        ],
        settlementStatus: 'pending',
        createdAt: isoDaysAgo(1),
        updatedAt: isoHoursAgo(8),
      },
      {
        id: 'dj_pay_109283744',
        orderId: 'ord_inv_88213',
        merchantId: 'mer_dejoiypay_01',
        environment: 'test',
        amount: 899.0,
        currency: 'INR',
        fee: 0,
        tax: 0,
        netAmount: 0,
        status: 'FAILED',
        failureReason: 'Bank declined transaction: Insufficient funds in linked account',
        provider: 'direct-upi',
        paymentMethod: {
          type: 'upi',
          upi: { vpa: 'aditya.kapoor@oksbi', flow: 'collect' },
        },
        customer: {
          id: 'cust_mumbai_03',
          name: 'Aditya Kapoor',
          email: 'aditya.kapoor@innovate.co',
          phone: '+91 98200 55432',
        },
        timeline: [
          { status: 'CREATED', timestamp: isoDaysAgo(2), message: 'UPI Collect request generated', source: 'merchant' },
          { status: 'FAILED', timestamp: isoDaysAgo(2), message: 'Declined by SBI UPI Switch: Insufficient Funds (U16)', source: 'provider' },
        ],
        refunds: [],
        settlementStatus: 'pending',
        createdAt: isoDaysAgo(2),
        updatedAt: isoDaysAgo(2),
      },
      {
        id: 'dj_pay_109283745',
        orderId: 'ord_inv_88214',
        merchantId: 'mer_dejoiypay_01',
        environment: 'test',
        amount: 28500.0,
        currency: 'INR',
        fee: 570.0,
        tax: 102.6,
        netAmount: 27827.4,
        status: 'SUCCESS',
        provider: 'stripe',
        providerPaymentId: 'ch_strp_994120',
        paymentMethod: {
          type: 'card',
          card: { last4: '9012', network: 'mastercard', type: 'credit', issuer: 'Citibank', tokenized: true },
        },
        customer: {
          id: 'cust_hyderabad_04',
          name: 'Sneha Reddy',
          email: 'sneha.reddy@startup.in',
          phone: '+91 97010 33412',
        },
        timeline: [
          { status: 'CREATED', timestamp: isoDaysAgo(3), message: 'International invoice checkout loaded', source: 'customer' },
          { status: 'PROCESSING', timestamp: isoDaysAgo(3), message: 'Risk assessment passed (Stripe Radar)', source: 'provider' },
          { status: 'SUCCESS', timestamp: isoDaysAgo(3), message: 'Charge confirmed and settled', source: 'provider' },
        ],
        refunds: [],
        settlementStatus: 'settled',
        settlementId: 'dj_set_90110',
        createdAt: isoDaysAgo(3),
        updatedAt: isoDaysAgo(3),
      },
    ];

    this.data.paymentLinks = [
      {
        id: 'dj_plink_88190',
        merchantId: 'mer_dejoiypay_01',
        environment: 'test',
        amount: 2499.0,
        currency: 'INR',
        description: 'DejoiY Developer Annual License Key (Team Tier)',
        customer: { name: 'Vikram Mehta', email: 'vikram@mehta.dev', phone: '+91 98450 11223' },
        status: 'ACTIVE',
        expiresAt: new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString(),
        customReference: 'DEV-LIC-2026',
        visitsCount: 14,
        qrPayload: 'upi://pay?pa=dejoiypay.merchant@icici&pn=DejoiY%20Technologies&am=2499.00&cu=INR&tr=dj_plink_88190',
        createdAt: isoDaysAgo(1),
        updatedAt: isoDaysAgo(1),
      },
      {
        id: 'dj_plink_88191',
        merchantId: 'mer_dejoiypay_01',
        environment: 'test',
        amount: 15000.0,
        currency: 'INR',
        description: 'Custom Fintech Integration & Security Audit Retainer',
        customer: { name: 'Kavita Rao', email: 'kavita@fintechzen.com', phone: '+91 99200 44556' },
        status: 'PAID',
        expiresAt: isoDaysAgo(1),
        customReference: 'AUDIT-ZEN-01',
        paidAt: isoHoursAgo(6),
        paymentId: 'dj_pay_109283742',
        visitsCount: 4,
        qrPayload: 'upi://pay?pa=dejoiypay.merchant@icici&pn=DejoiY%20Technologies&am=15000.00&cu=INR&tr=dj_plink_88191',
        createdAt: isoDaysAgo(4),
        updatedAt: isoHoursAgo(6),
      },
    ];

    this.data.qrCodes = [
      {
        id: 'dj_qr_counter_01',
        merchantId: 'mer_dejoiypay_01',
        type: 'static',
        title: 'Main Billing Counter QR',
        currency: 'INR',
        vpa: 'dejoiypay.merchant@icici',
        merchantName: 'DejoiY Technologies Pvt Ltd',
        mcc: '6012',
        status: 'ACTIVE',
        qrPayload: 'upi://pay?pa=dejoiypay.merchant@icici&pn=DejoiY%20Technologies%20Pvt%20Ltd&mc=6012&cu=INR&mode=01',
        totalCollected: 184500.0,
        transactionCount: 88,
        createdAt: isoDaysAgo(60),
      },
      {
        id: 'dj_qr_event_02',
        merchantId: 'mer_dejoiypay_01',
        type: 'dynamic',
        title: 'Bangalore Tech Expo 2026 Booth Standee',
        amount: 499.0,
        currency: 'INR',
        vpa: 'dejoiypay.merchant@icici',
        merchantName: 'DejoiY Technologies',
        mcc: '6012',
        status: 'ACTIVE',
        qrPayload: 'upi://pay?pa=dejoiypay.merchant@icici&pn=DejoiY%20Technologies&mc=6012&am=499.00&cu=INR&mode=01&tr=EXPO2026',
        totalCollected: 24950.0,
        transactionCount: 50,
        createdAt: isoDaysAgo(10),
      },
    ];

    this.data.settlements = [
      {
        id: 'dj_set_90112',
        merchantId: 'mer_dejoiypay_01',
        amount: 85200.0,
        fee: 1704.0,
        tax: 306.72,
        netSettled: 83189.28,
        status: 'SETTLED',
        bankAccount: {
          accountNumberMasked: '•••• •••• 9102',
          ifsc: 'HDFC0000050',
          bankName: 'HDFC Bank Ltd',
          beneficiaryName: 'DEJOIY TECHNOLOGIES PVT LTD',
        },
        utr: 'HDFCR2026090800192841',
        transactionIds: ['dj_pay_109283741'],
        scheduledAt: isoDaysAgo(2),
        settledAt: isoDaysAgo(1),
        createdAt: isoDaysAgo(2),
      },
      {
        id: 'dj_set_90110',
        merchantId: 'mer_dejoiypay_01',
        amount: 42000.0,
        fee: 840.0,
        tax: 151.2,
        netSettled: 41008.8,
        status: 'SETTLED',
        bankAccount: {
          accountNumberMasked: '•••• •••• 9102',
          ifsc: 'HDFC0000050',
          bankName: 'HDFC Bank Ltd',
          beneficiaryName: 'DEJOIY TECHNOLOGIES PVT LTD',
        },
        utr: 'HDFCR2026090500881923',
        transactionIds: ['dj_pay_109283745'],
        scheduledAt: isoDaysAgo(5),
        settledAt: isoDaysAgo(4),
        createdAt: isoDaysAgo(5),
      },
    ];

    this.data.webhooks = [
      {
        id: 'wh_ep_01',
        merchantId: 'mer_dejoiypay_01',
        url: 'https://api.example.com/webhooks/dejoiypay',
        secret: 'whsec_99182a4c11b0e9823f',
        events: ['payment.success', 'payment.failed', 'refund.processed', 'settlement.completed'],
        status: 'active',
        createdAt: isoDaysAgo(30),
      },
    ];

    this.data.webhookLogs = [
      {
        id: 'wh_log_01',
        endpointId: 'wh_ep_01',
        event: 'payment.success',
        payload: { event: 'payment.success', paymentId: 'dj_pay_109283741', amount: 4500 },
        statusCode: 200,
        responseBody: '{"received": true}',
        status: 'success',
        attempts: 1,
        sentAt: isoHoursAgo(2),
      },
    ];
  }

  // --- Transactions ---
  getTransactions(params?: {
    status?: PaymentStatus;
    provider?: ProviderType;
    method?: string;
    search?: string;
    environment?: EnvironmentMode;
    limit?: number;
    offset?: number;
  }): { transactions: PaymentTransaction[]; total: number } {
    let list = [...this.data.transactions];

    if (params?.environment) {
      list = list.filter(t => t.environment === params.environment);
    }
    if (params?.status) {
      list = list.filter(t => t.status === params.status);
    }
    if (params?.provider) {
      list = list.filter(t => t.provider === params.provider);
    }
    if (params?.method) {
      list = list.filter(t => t.paymentMethod.type === params.method);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        t =>
          t.id.toLowerCase().includes(q) ||
          t.orderId.toLowerCase().includes(q) ||
          t.customer.name.toLowerCase().includes(q) ||
          t.customer.email.toLowerCase().includes(q) ||
          t.customer.phone.includes(q) ||
          (t.providerPaymentId && t.providerPaymentId.toLowerCase().includes(q))
      );
    }

    // Sort descending by date
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = list.length;
    const offset = params?.offset || 0;
    const limit = params?.limit || 50;
    const paginated = list.slice(offset, offset + limit);

    return { transactions: paginated, total };
  }

  getTransactionById(id: string): PaymentTransaction | undefined {
    return this.data.transactions.find(t => t.id === id || t.orderId === id);
  }

  createTransaction(txn: Omit<PaymentTransaction, 'id' | 'createdAt' | 'updatedAt' | 'fee' | 'tax' | 'netAmount' | 'timeline' | 'refunds'> & {
    timeline?: PaymentTransaction['timeline'];
  }): PaymentTransaction {
    const fee = Math.round(txn.amount * 0.02 * 100) / 100; // 2% flat gateway fee
    const tax = Math.round(fee * 0.18 * 100) / 100;         // 18% GST on fee
    const netAmount = Math.round((txn.amount - (fee + tax)) * 100) / 100;

    const newTxn: PaymentTransaction = {
      ...txn,
      id: `dj_pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fee,
      tax,
      netAmount,
      timeline: txn.timeline || [
        {
          status: txn.status,
          timestamp: new Date().toISOString(),
          message: `Transaction initialized with status ${txn.status}`,
          source: 'system',
        },
      ],
      refunds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.transactions.unshift(newTxn);

    // Update customer record
    const customerIndex = this.data.customers.findIndex(c => c.email === txn.customer.email);
    if (customerIndex >= 0) {
      if (txn.status === 'SUCCESS') {
        this.data.customers[customerIndex].totalSpent += txn.amount;
      }
      this.data.customers[customerIndex].transactionCount += 1;
      this.data.customers[customerIndex].lastPaymentAt = new Date().toISOString();
    } else {
      this.data.customers.push({
        id: `dj_cust_${Date.now()}`,
        merchantId: txn.merchantId,
        name: txn.customer.name,
        email: txn.customer.email,
        phone: txn.customer.phone,
        totalSpent: txn.status === 'SUCCESS' ? txn.amount : 0,
        transactionCount: 1,
        lastPaymentAt: new Date().toISOString(),
        refundsCount: 0,
        createdAt: new Date().toISOString(),
      });
    }

    this.persist();
    return newTxn;
  }

  updateTransactionStatus(
    id: string,
    status: PaymentStatus,
    options?: { message?: string; source?: PaymentTransaction['timeline'][0]['source']; failureReason?: string; providerPaymentId?: string }
  ): PaymentTransaction | undefined {
    const txn = this.getTransactionById(id);
    if (!txn) return undefined;

    txn.status = status;
    txn.updatedAt = new Date().toISOString();
    if (options?.failureReason) txn.failureReason = options.failureReason;
    if (options?.providerPaymentId) txn.providerPaymentId = options.providerPaymentId;

    txn.timeline.push({
      status,
      timestamp: new Date().toISOString(),
      message: options?.message || `Status updated to ${status}`,
      source: options?.source || 'system',
    });

    this.persist();
    return txn;
  }

  createRefund(paymentId: string, amount: number, reason: string): { success: boolean; refund?: any; error?: string } {
    const txn = this.getTransactionById(paymentId);
    if (!txn) return { success: false, error: 'Transaction not found' };
    if (txn.status !== 'SUCCESS' && txn.status !== 'PARTIALLY_REFUNDED') {
      return { success: false, error: `Cannot refund transaction in status ${txn.status}` };
    }

    const totalRefundedSoFar = txn.refunds.reduce((sum, r) => sum + r.amount, 0);
    if (totalRefundedSoFar + amount > txn.amount) {
      return { success: false, error: `Refund amount exceeds refundable balance (Max: ₹${txn.amount - totalRefundedSoFar})` };
    }

    const refund = {
      id: `dj_ref_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      paymentId: txn.id,
      amount,
      currency: txn.currency,
      reason,
      status: 'SUCCESS' as const,
      providerRefundId: `p_ref_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    txn.refunds.push(refund);
    const newTotalRefunded = totalRefundedSoFar + amount;
    if (newTotalRefunded >= txn.amount) {
      txn.status = 'REFUNDED';
    } else {
      txn.status = 'PARTIALLY_REFUNDED';
    }

    txn.timeline.push({
      status: txn.status,
      timestamp: new Date().toISOString(),
      message: `Refund of ₹${amount.toFixed(2)} processed (${reason})`,
      source: 'merchant',
    });

    this.persist();
    return { success: true, refund };
  }

  // --- Payment Links ---
  getPaymentLinks(): PaymentLink[] {
    return this.data.paymentLinks;
  }

  getPaymentLinkById(id: string): PaymentLink | undefined {
    return this.data.paymentLinks.find(pl => pl.id === id);
  }

  createPaymentLink(link: Omit<PaymentLink, 'id' | 'createdAt' | 'updatedAt' | 'visitsCount' | 'status'>): PaymentLink {
    const newLink: PaymentLink = {
      ...link,
      id: `dj_plink_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: 'ACTIVE',
      visitsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.paymentLinks.unshift(newLink);
    this.persist();
    return newLink;
  }

  incrementPaymentLinkVisit(id: string): void {
    const link = this.getPaymentLinkById(id);
    if (link) {
      link.visitsCount += 1;
      this.persist();
    }
  }

  markPaymentLinkPaid(id: string, paymentId: string): void {
    const link = this.getPaymentLinkById(id);
    if (link) {
      link.status = 'PAID';
      link.paidAt = new Date().toISOString();
      link.paymentId = paymentId;
      link.updatedAt = new Date().toISOString();
      this.persist();
    }
  }

  // --- QR Codes ---
  getQrCodes(): QrCodeDetails[] {
    return this.data.qrCodes;
  }

  createQrCode(qr: Omit<QrCodeDetails, 'id' | 'createdAt' | 'totalCollected' | 'transactionCount'>): QrCodeDetails {
    const newQr: QrCodeDetails = {
      ...qr,
      id: `dj_qr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      totalCollected: 0,
      transactionCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.data.qrCodes.unshift(newQr);
    this.persist();
    return newQr;
  }

  // --- Settlements ---
  getSettlements(): SettlementBatch[] {
    return this.data.settlements;
  }

  triggerSettlement(): SettlementBatch {
    // Find all unsettled success payments
    const pendingTxns = this.data.transactions.filter(t => t.status === 'SUCCESS' && t.settlementStatus === 'pending');
    const totalAmount = pendingTxns.reduce((sum, t) => sum + t.amount, 0);
    const totalFee = pendingTxns.reduce((sum, t) => sum + t.fee, 0);
    const totalTax = pendingTxns.reduce((sum, t) => sum + t.tax, 0);
    const netSettled = totalAmount - (totalFee + totalTax);

    const settlementId = `dj_set_${Date.now()}`;
    const batch: SettlementBatch = {
      id: settlementId,
      merchantId: 'mer_dejoiypay_01',
      amount: totalAmount,
      fee: totalFee,
      tax: totalTax,
      netSettled: netSettled > 0 ? netSettled : 0,
      status: 'SETTLED',
      bankAccount: {
        accountNumberMasked: '•••• •••• 9102',
        ifsc: 'HDFC0000050',
        bankName: 'HDFC Bank Ltd',
        beneficiaryName: 'DEJOIY TECHNOLOGIES PVT LTD',
      },
      utr: `DEJOIY${Date.now().toString().slice(-8)}`,
      transactionIds: pendingTxns.map(t => t.id),
      scheduledAt: new Date().toISOString(),
      settledAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    pendingTxns.forEach(t => {
      t.settlementStatus = 'settled';
      t.settlementId = settlementId;
    });

    this.data.settlements.unshift(batch);
    this.persist();
    return batch;
  }

  // --- Customers ---
  getCustomers(): CustomerProfile[] {
    return this.data.customers;
  }

  // --- Consumer Wallet ---
  getConsumerWallet(): ConsumerWallet {
    return this.data.consumerWallet;
  }

  updateConsumerWalletBalance(delta: number): number {
    this.data.consumerWallet.balance = Math.round((this.data.consumerWallet.balance + delta) * 100) / 100;
    this.persist();
    return this.data.consumerWallet.balance;
  }

  // --- Webhook Configuration & Logs ---
  getWebhooks(): WebhookEndpoint[] {
    return this.data.webhooks;
  }

  createWebhook(url: string, events: string[]): WebhookEndpoint {
    const ep: WebhookEndpoint = {
      id: `wh_ep_${Date.now()}`,
      merchantId: 'mer_dejoiypay_01',
      url,
      secret: `whsec_${Math.random().toString(36).substring(2, 16)}`,
      events,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    this.data.webhooks.unshift(ep);
    this.persist();
    return ep;
  }

  getWebhookLogs(): WebhookDeliveryLog[] {
    return this.data.webhookLogs;
  }

  recordWebhookLog(log: Omit<WebhookDeliveryLog, 'id' | 'sentAt'>): WebhookDeliveryLog {
    const entry: WebhookDeliveryLog = {
      ...log,
      id: `wh_log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sentAt: new Date().toISOString(),
    };
    this.data.webhookLogs.unshift(entry);
    if (this.data.webhookLogs.length > 200) {
      this.data.webhookLogs.pop();
    }
    this.persist();
    return entry;
  }

  // --- Metrics Summary ---
  getMetrics() {
    const txns = this.data.transactions;
    const successTxns = txns.filter(t => t.status === 'SUCCESS');
    const failedTxns = txns.filter(t => t.status === 'FAILED');
    const pendingTxns = txns.filter(t => t.status === 'PENDING' || t.status === 'PROCESSING');
    const refundedTxns = txns.filter(t => t.status === 'REFUNDED' || t.status === 'PARTIALLY_REFUNDED');

    const totalVolume = successTxns.reduce((sum, t) => sum + t.amount, 0);
    const totalRefunds = refundedTxns.reduce((sum, t) => sum + t.refunds.reduce((s, r) => s + r.amount, 0), 0);
    const successRate = txns.length > 0 ? (successTxns.length / txns.length) * 100 : 100;
    const atv = successTxns.length > 0 ? totalVolume / successTxns.length : 0;

    // Today's revenue calculation
    const today = new Date().toISOString().split('T')[0];
    const todayVolume = successTxns
      .filter(t => t.createdAt.startsWith(today))
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingSettlementBalance = successTxns
      .filter(t => t.settlementStatus === 'pending')
      .reduce((sum, t) => sum + t.netAmount, 0);

    // Method breakdown
    const methodBreakdown: Record<string, { count: number; volume: number }> = {};
    successTxns.forEach(t => {
      const m = t.paymentMethod.type;
      if (!methodBreakdown[m]) {
        methodBreakdown[m] = { count: 0, volume: 0 };
      }
      methodBreakdown[m].count += 1;
      methodBreakdown[m].volume += t.amount;
    });

    return {
      totalVolume,
      todayVolume,
      transactionCount: txns.length,
      successCount: successTxns.length,
      failedCount: failedTxns.length,
      pendingCount: pendingTxns.length,
      refundCount: refundedTxns.length,
      totalRefunds,
      successRate: Math.round(successRate * 10) / 10,
      atv: Math.round(atv * 100) / 100,
      pendingSettlementBalance,
      methodBreakdown,
    };
  }
}

export const db = new DatabaseEngine();
