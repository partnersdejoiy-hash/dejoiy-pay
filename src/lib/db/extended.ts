import { db } from './index';
import {
  PayLaterAccount,
  UpiMandate,
  CashbackReward,
  GstInvoice,
  SmartRoutingRule,
  SubscriptionPlan,
} from '../types/payment';

// High-performance persistent in-memory and file backed state for advanced features
let payLaterData: PayLaterAccount = {
  userId: 'usr_dejoiypay_01',
  totalLimit: 25000,
  availableLimit: 18450,
  usedAmount: 6550,
  dueAmount: 6550,
  dueDate: '2026-10-05T00:00:00.000Z',
  billingCycle: '1st - 30th of every month',
  status: 'ACTIVE',
  spends: [
    { id: 'sp_01', merchantName: 'Swiggy Food Delivery', amount: 480, date: '2026-09-08T19:30:00.000Z', status: 'UNBILLED' },
    { id: 'sp_02', merchantName: 'Uber India Mobility', amount: 320, date: '2026-09-07T08:15:00.000Z', status: 'UNBILLED' },
    { id: 'sp_03', merchantName: 'Amazon Prime Annual', amount: 1499, date: '2026-09-02T12:00:00.000Z', status: 'BILLED' },
    { id: 'sp_04', merchantName: 'Zepto Quick Commerce', amount: 4251, date: '2026-08-28T16:45:00.000Z', status: 'BILLED' },
  ],
};

let mandatesData: UpiMandate[] = [
  {
    id: 'dj_man_01',
    userId: 'usr_dejoiypay_01',
    merchantName: 'Netflix Entertainment Services',
    vpa: 'netflix.mandate@hdfcbank',
    amountCap: 649,
    frequency: 'MONTHLY',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2028-12-31T00:00:00.000Z',
    status: 'ACTIVE',
    nextExecutionDate: '2026-10-01T00:00:00.000Z',
    lastExecutionDate: '2026-09-01T04:30:00.000Z',
    lastExecutionStatus: 'SUCCESS',
    purpose: 'Netflix Premium 4K Family Subscription',
  },
  {
    id: 'dj_man_02',
    userId: 'usr_dejoiypay_01',
    merchantName: 'Zerodha Mutual Fund SIP',
    vpa: 'zerodha.sip@icici',
    amountCap: 5000,
    frequency: 'MONTHLY',
    startDate: '2026-03-10T00:00:00.000Z',
    endDate: '2030-03-10T00:00:00.000Z',
    status: 'ACTIVE',
    nextExecutionDate: '2026-10-10T00:00:00.000Z',
    lastExecutionDate: '2026-09-10T08:00:00.000Z',
    lastExecutionStatus: 'SUCCESS',
    purpose: 'Nifty 50 Index Fund Monthly SIP',
  },
  {
    id: 'dj_man_03',
    userId: 'usr_dejoiypay_01',
    merchantName: 'Cult.fit Gym & Fitness',
    vpa: 'cultfit.membership@axisbank',
    amountCap: 2199,
    frequency: 'MONTHLY',
    startDate: '2026-02-15T00:00:00.000Z',
    endDate: '2027-02-15T00:00:00.000Z',
    status: 'PAUSED',
    nextExecutionDate: '2026-10-15T00:00:00.000Z',
    lastExecutionDate: '2026-08-15T06:00:00.000Z',
    lastExecutionStatus: 'SUCCESS',
    purpose: 'Elite Gym All Access Pass',
  },
];

let rewardsData: CashbackReward[] = [
  {
    id: 'rew_01',
    title: 'UPI Payment Cashback',
    description: 'Received for merchant scan & pay transaction over ₹500',
    amount: 35,
    isScratched: false,
    unlockedAt: '2026-09-10T18:00:00.000Z',
    expiryDate: '2026-10-10T00:00:00.000Z',
  },
  {
    id: 'rew_02',
    title: 'Electricity Bill Payment Reward',
    description: 'Direct BBPS bill payment bonus',
    amount: 50,
    isScratched: true,
    unlockedAt: '2026-09-08T12:00:00.000Z',
    expiryDate: '2026-10-08T00:00:00.000Z',
  },
  {
    id: 'rew_03',
    title: 'Friend Referral Bonus',
    description: 'Invited a merchant to join DejoiY Soundbox',
    amount: 150,
    isScratched: true,
    unlockedAt: '2026-09-05T14:30:00.000Z',
    expiryDate: '2026-10-05T00:00:00.000Z',
  },
];

let invoicesData: GstInvoice[] = [
  {
    id: 'dj_inv_4401',
    invoiceNumber: 'INV-2026-09-001',
    merchantId: 'mer_dejoiypay_01',
    customer: {
      name: 'Rohan Verma',
      email: 'rohan.verma@example.com',
      phone: '+91 98112 34567',
      address: 'Suite 401, Cyber City, Gurugram, Haryana - 122002',
      gstin: '06AAACR1234F1Z1',
    },
    items: [
      { id: 'it_1', description: 'DejoiY Cloud Gateway Enterprise License', quantity: 1, unitPrice: 3813.56, taxRate: 18, total: 4500 },
    ],
    subtotal: 3813.56,
    taxAmount: 686.44,
    totalAmount: 4500.0,
    status: 'PAID',
    dueDate: '2026-09-20T00:00:00.000Z',
    paidAt: '2026-09-10T18:30:00.000Z',
    paymentId: 'dj_pay_109283741',
    createdAt: '2026-09-10T10:00:00.000Z',
  },
  {
    id: 'dj_inv_4402',
    invoiceNumber: 'INV-2026-09-002',
    merchantId: 'mer_dejoiypay_01',
    customer: {
      name: 'Innovate Tech Labs',
      email: 'finance@innovatetech.in',
      phone: '+91 98200 55432',
      address: '7th Floor, BKC Tower, Bandra East, Mumbai, Maharashtra - 400051',
      gstin: '27AABCU9912D1ZX',
    },
    items: [
      { id: 'it_2', description: 'Custom API Webhook Integration Retainer', quantity: 2, unitPrice: 10000, taxRate: 18, total: 23600 },
    ],
    subtotal: 20000.0,
    taxAmount: 3600.0,
    totalAmount: 23600.0,
    status: 'ISSUED',
    dueDate: '2026-09-25T00:00:00.000Z',
    createdAt: '2026-09-09T14:00:00.000Z',
  },
];

let smartRulesData: SmartRoutingRule[] = [
  { id: 'sr_1', name: 'Domestic UPI Direct Route', rail: 'upi', primaryProvider: 'direct-upi', fallbackProvider: 'razorpay', maxLatencyMs: 800, active: true },
  { id: 'sr_2', name: 'Domestic Credit/Debit Cards', rail: 'domestic_card', primaryProvider: 'razorpay', fallbackProvider: 'paytm', maxLatencyMs: 1500, active: true },
  { id: 'sr_3', name: 'International Cards & USD', rail: 'intl_card', primaryProvider: 'stripe', fallbackProvider: 'razorpay', maxLatencyMs: 1200, active: true },
  { id: 'sr_4', name: 'Netbanking Direct Rail', rail: 'netbanking', primaryProvider: 'razorpay', fallbackProvider: 'paytm', maxLatencyMs: 1000, active: true },
];

let subscriptionPlansData: SubscriptionPlan[] = [
  { id: 'plan_starter', name: 'Developer Starter', description: 'Up to 500 API calls & standard UPI checkout', amount: 999, currency: 'INR', interval: 'monthly', activeSubscribers: 42, createdAt: '2026-07-01' },
  { id: 'plan_growth', name: 'Growth Business', description: 'Unlimited transactions, Soundbox sync & 0% MDR', amount: 2999, currency: 'INR', interval: 'monthly', activeSubscribers: 128, createdAt: '2026-07-01' },
  { id: 'plan_enterprise', name: 'Enterprise Scale', description: 'Dedicated SLA, Custom Webhook clusters & ERP sync', amount: 9999, currency: 'INR', interval: 'monthly', activeSubscribers: 19, createdAt: '2026-07-01' },
];

export const advancedDb = {
  // Pay Later
  getPayLater() {
    return payLaterData;
  },
  repayPayLater(amount: number) {
    if (amount > payLaterData.usedAmount) amount = payLaterData.usedAmount;
    payLaterData.usedAmount -= amount;
    payLaterData.availableLimit += amount;
    payLaterData.dueAmount = Math.max(0, payLaterData.dueAmount - amount);
    // Deduct from consumer wallet
    db.updateConsumerWalletBalance(-amount);
    return payLaterData;
  },

  // Mandates
  getMandates() {
    return mandatesData;
  },
  createMandate(mandate: Omit<UpiMandate, 'id' | 'status' | 'nextExecutionDate'>) {
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);
    const newMandate: UpiMandate = {
      ...mandate,
      id: `dj_man_${Date.now()}`,
      status: 'ACTIVE',
      nextExecutionDate: nextDate.toISOString(),
    };
    mandatesData.unshift(newMandate);
    return newMandate;
  },
  updateMandateStatus(id: string, status: 'ACTIVE' | 'PAUSED' | 'REVOKED') {
    const m = mandatesData.find(x => x.id === id);
    if (m) m.status = status;
    return m;
  },

  // Rewards
  getRewards() {
    return rewardsData;
  },
  scratchReward(id: string) {
    const r = rewardsData.find(x => x.id === id);
    if (r && !r.isScratched) {
      r.isScratched = true;
      // Instant wallet credit!
      db.updateConsumerWalletBalance(r.amount);
    }
    return r;
  },

  // Invoices
  getInvoices() {
    return invoicesData;
  },
  createInvoice(inv: Omit<GstInvoice, 'id' | 'createdAt' | 'status'>) {
    const newInv: GstInvoice = {
      ...inv,
      id: `dj_inv_${Date.now()}`,
      status: 'ISSUED',
      createdAt: new Date().toISOString(),
    };
    invoicesData.unshift(newInv);
    return newInv;
  },
  markInvoicePaid(id: string, paymentId: string) {
    const inv = invoicesData.find(x => x.id === id || x.invoiceNumber === id);
    if (inv) {
      inv.status = 'PAID';
      inv.paidAt = new Date().toISOString();
      inv.paymentId = paymentId;
    }
    return inv;
  },

  // Smart Routing
  getSmartRules() {
    return smartRulesData;
  },
  updateSmartRule(id: string, updates: Partial<SmartRoutingRule>) {
    const r = smartRulesData.find(x => x.id === id);
    if (r) Object.assign(r, updates);
    return r;
  },

  // Subscriptions
  getSubscriptions() {
    return subscriptionPlansData;
  },
  createSubscriptionPlan(plan: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'activeSubscribers'>) {
    const newPlan: SubscriptionPlan = {
      ...plan,
      id: `plan_${Date.now()}`,
      activeSubscribers: 0,
      createdAt: new Date().toISOString(),
    };
    subscriptionPlansData.push(newPlan);
    return newPlan;
  },
};
