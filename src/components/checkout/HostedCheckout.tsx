'use client';
import React, { useState } from 'react';
import { formatINR } from '@/lib/utils';
import { validateVpa, buildUpiUri } from '@/lib/upi/spec';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { QrDisplay } from '../qr/QrDisplay';
import {
  ShieldCheck,
  Lock,
  Smartphone,
  CreditCard,
  Building,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';

interface HostedCheckoutProps {
  orderId: string;
  amount: number;
  currency?: 'INR' | 'USD';
  description?: string;
  merchantName?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  onSuccess?: (paymentId: string) => void;
}

type TabType = 'upi' | 'card' | 'netbanking' | 'wallet';

export function HostedCheckout({
  orderId,
  amount,
  currency = 'INR',
  description = 'Payment to DejoiY Merchant',
  merchantName = 'DejoiY Technologies Pvt Ltd',
  customer: initialCustomer,
  onSuccess,
}: HostedCheckoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>('upi');
  const [customerName, setCustomerName] = useState(initialCustomer?.name || 'Aakash Sharma');
  const [customerEmail, setCustomerEmail] = useState(initialCustomer?.email || 'aakash.sharma@dejoiypay.com');
  const [customerPhone, setCustomerPhone] = useState(initialCustomer?.phone || '9876543210');

  // UPI State
  const [vpa, setVpa] = useState('');
  const [vpaError, setVpaError] = useState('');
  const [showQrMode, setShowQrMode] = useState(false);

  // Card State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvv, setCvv] = useState('');

  // Net Banking State
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // Wallet State
  const [selectedWallet, setSelectedWallet] = useState('paytm');

  // Checkout State Machine
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [failureReason, setFailureReason] = useState('');
  const [completedPaymentId, setCompletedPaymentId] = useState('');
  const [rrn, setRrn] = useState('');

  // Format Card Number
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/[\s\S]{1,4}/g) || [];
    setCardNumber(parts.join(' '));
  };

  const executePayment = async (method: TabType, simulatedOutcome: 'SUCCESS' | 'FAILED' = 'SUCCESS') => {
    setPaymentStatus('PROCESSING');
    setFailureReason('');

    try {
      const paymentData: any = {};
      if (method === 'upi') {
        if (vpa) {
          const check = validateVpa(vpa);
          if (!check.isValid) {
            setVpaError(check.error || 'Invalid VPA');
            setPaymentStatus('IDLE');
            return;
          }
          paymentData.vpa = vpa;
        } else {
          paymentData.vpa = 'customer@upi';
        }
      } else if (method === 'card') {
        paymentData.card = {
          number: cardNumber.replace(/\s/g, '') || '4242424242424242',
          expMonth: expMonth || '12',
          expYear: expYear || '28',
          cvv: cvv || '123',
          name: cardHolder || customerName,
        };
      } else if (method === 'netbanking') {
        paymentData.bankCode = selectedBank;
      } else if (method === 'wallet') {
        paymentData.wallet = selectedWallet;
      }

      const res = await fetch('/api/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': `chk_${orderId}_${Date.now()}`,
        },
        body: JSON.stringify({
          amount,
          currency,
          orderId,
          provider: method === 'card' ? 'stripe' : 'direct-upi',
          method,
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
          },
          paymentData,
          simulatedStatus: simulatedOutcome,
        }),
      });

      const data = await res.json();

      // Artificial banking delay for realism
      setTimeout(() => {
        if (res.ok && data.success) {
          setPaymentStatus('SUCCESS');
          setCompletedPaymentId(data.transaction.id);
          setRrn(data.transaction.paymentMethod.upi?.rrn || data.transaction.providerPaymentId || '4288190123');
          if (onSuccess) onSuccess(data.transaction.id);
        } else {
          setPaymentStatus('FAILED');
          setFailureReason(data.error || data.transaction?.failureReason || 'Transaction declined by issuer');
        }
      }, 1200);
    } catch (err: any) {
      setPaymentStatus('FAILED');
      setFailureReason(err.message || 'Network error occurred during payment');
    }
  };

  if (paymentStatus === 'SUCCESS') {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 text-center shadow-lg animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Payment Successful!</h2>
        <p className="text-xs text-slate-500 mt-1">Receipt has been sent to {customerEmail}</p>

        <div className="my-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-left space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
            <span className="text-slate-500">Amount Paid</span>
            <span className="font-mono font-bold text-base text-slate-900 dark:text-slate-100">{formatINR(amount)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
            <span className="text-slate-500">Transaction ID</span>
            <span className="font-mono">{completedPaymentId}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
            <span className="text-slate-500">Bank Reference (RRN)</span>
            <span className="font-mono font-medium">{rrn}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Merchant</span>
            <span className="font-medium truncate">{merchantName}</span>
          </div>
        </div>

        <Button onClick={() => window.location.reload()} variant="outline" className="w-full text-xs">
          Make Another Payment
        </Button>
      </div>
    );
  }

  if (paymentStatus === 'FAILED') {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 sm:p-8 text-center shadow-lg animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Payment Failed</h2>
        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 max-w-xs mx-auto">{failureReason}</p>

        <div className="my-6 p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 text-xs text-slate-600 dark:text-slate-400 text-left">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">What can you do?</p>
          <ul className="list-disc list-inside space-y-1 text-[11px]">
            <li>Check if your bank account has sufficient balance</li>
            <li>Try using another payment method (Cards or Netbanking)</li>
            <li>Ensure UPI Daily limit has not been exceeded</li>
          </ul>
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setPaymentStatus('IDLE')} className="w-1/2 text-xs">
            Change Method
          </Button>
          <Button variant="primary" onClick={() => executePayment(activeTab, 'SUCCESS')} className="w-1/2 text-xs">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Retry Payment
          </Button>
        </div>
      </div>
    );
  }

  const upiPayload = buildUpiUri({
    pa: 'dejoiypay.merchant@icici',
    pn: merchantName,
    mc: '6012',
    am: amount,
    tr: orderId,
    tn: description.slice(0, 50),
    cu: 'INR',
    mode: '01',
  });

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Merchant Header Bar */}
      <div className="p-5 bg-slate-900 text-white border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
              DP
            </div>
            <div>
              <p className="font-bold text-sm leading-none">{merchantName}</p>
              <div className="flex items-center space-x-1 text-[10px] text-emerald-400 mt-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified DejoiY Merchant</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Payable</span>
            <span className="text-xl font-bold font-mono text-white">{formatINR(amount)}</span>
          </div>
        </div>
      </div>

      {/* Payment Navigation Tabs */}
      <div className="grid grid-cols-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs">
        <button
          onClick={() => { setActiveTab('upi'); setShowQrMode(false); }}
          className={`py-3 px-1 text-center font-medium border-b-2 flex flex-col items-center justify-center transition-colors ${
            activeTab === 'upi'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4 mb-1" />
          UPI / QR
        </button>

        <button
          onClick={() => setActiveTab('card')}
          className={`py-3 px-1 text-center font-medium border-b-2 flex flex-col items-center justify-center transition-colors ${
            activeTab === 'card'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4 mb-1" />
          Cards
        </button>

        <button
          onClick={() => setActiveTab('netbanking')}
          className={`py-3 px-1 text-center font-medium border-b-2 flex flex-col items-center justify-center transition-colors ${
            activeTab === 'netbanking'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4 mb-1" />
          Netbanking
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`py-3 px-1 text-center font-medium border-b-2 flex flex-col items-center justify-center transition-colors ${
            activeTab === 'wallet'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4 mb-1" />
          Wallets
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* UPI TAB */}
        {activeTab === 'upi' && (
          <div className="space-y-4">
            {showQrMode ? (
              <div className="space-y-3">
                <QrDisplay
                  payload={upiPayload}
                  title={`Order #${orderId}`}
                  amount={amount}
                  merchantName={merchantName}
                  showSoundboxTest={false}
                />
                <Button variant="outline" size="sm" onClick={() => setShowQrMode(false)} className="w-full text-xs">
                  &larr; Back to UPI Apps & ID
                </Button>
              </div>
            ) : (
              <>
                {/* UPI Intent Apps */}
                <div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                    Pay via UPI App
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: 'Google Pay', color: 'border-blue-200 hover:bg-blue-50/50', badge: 'GPay' },
                      { name: 'PhonePe', color: 'border-purple-200 hover:bg-purple-50/50', badge: 'PhonePe' },
                      { name: 'Paytm UPI', color: 'border-cyan-200 hover:bg-cyan-50/50', badge: 'Paytm' },
                    ].map(app => (
                      <button
                        key={app.name}
                        type="button"
                        onClick={() => executePayment('upi', 'SUCCESS')}
                        className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center justify-center ${app.color}`}
                      >
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{app.badge}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">{app.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Show QR Alternative */}
                <button
                  type="button"
                  onClick={() => setShowQrMode(true)}
                  className="w-full py-2.5 px-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300"
                >
                  <span className="font-medium">Scan QR Code using any UPI App</span>
                  <span className="text-emerald-600 font-semibold text-[11px]">Show QR &rarr;</span>
                </button>

                {/* Or Enter VPA */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Input
                    label="Or Enter UPI ID / VPA"
                    placeholder="e.g. yourname@okhdfcbank"
                    value={vpa}
                    onChange={e => {
                      setVpa(e.target.value);
                      setVpaError('');
                    }}
                    error={vpaError}
                  />
                  <Button
                    onClick={() => executePayment('upi', 'SUCCESS')}
                    isLoading={paymentStatus === 'PROCESSING'}
                    className="w-full mt-3 bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Pay {formatINR(amount)} via UPI
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* CARD TAB */}
        {activeTab === 'card' && (
          <form
            onSubmit={e => {
              e.preventDefault();
              executePayment('card', 'SUCCESS');
            }}
            className="space-y-3"
          >
            <Input
              label="Card Number"
              placeholder="4532 0000 0000 8821"
              value={cardNumber}
              onChange={e => handleCardNumberChange(e.target.value)}
              required
            />
            <Input
              label="Cardholder Name"
              placeholder="Name on card"
              value={cardHolder}
              onChange={e => setCardHolder(e.target.value)}
              required
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                label="MM"
                placeholder="08"
                maxLength={2}
                value={expMonth}
                onChange={e => setExpMonth(e.target.value)}
                required
              />
              <Input
                label="YY"
                placeholder="28"
                maxLength={2}
                value={expYear}
                onChange={e => setExpYear(e.target.value)}
                required
              />
              <Input
                label="CVV"
                placeholder="•••"
                type="password"
                maxLength={4}
                value={cvv}
                onChange={e => setCvv(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Tokenized via RBI compliant PCI-DSS Layer</span>
            </div>
            <Button
              type="submit"
              isLoading={paymentStatus === 'PROCESSING'}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Pay {formatINR(amount)}
            </Button>
          </form>
        )}

        {/* NETBANKING TAB */}
        {activeTab === 'netbanking' && (
          <div className="space-y-4">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Select Popular Bank
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'HDFC', name: 'HDFC Bank' },
                { code: 'SBIN', name: 'State Bank' },
                { code: 'ICICI', name: 'ICICI Bank' },
                { code: 'AXIS', name: 'Axis Bank' },
                { code: 'KOTAK', name: 'Kotak 811' },
                { code: 'PNB', name: 'Punjab NB' },
              ].map(bank => (
                <button
                  key={bank.code}
                  type="button"
                  onClick={() => setSelectedBank(bank.code)}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    selectedBank === bank.code
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs">{bank.name}</p>
                </button>
              ))}
            </div>

            <Button
              onClick={() => executePayment('netbanking', 'SUCCESS')}
              isLoading={paymentStatus === 'PROCESSING'}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white mt-4"
            >
              Proceed to Bank Portal &rarr;
            </Button>
          </div>
        )}

        {/* WALLET TAB */}
        {activeTab === 'wallet' && (
          <div className="space-y-3">
            {[
              { id: 'paytm', name: 'Paytm Wallet', desc: 'Fast 1-click checkout' },
              { id: 'amazon', name: 'Amazon Pay Balance', desc: 'Amazon gift & wallet balance' },
              { id: 'mobikwik', name: 'MobiKwik', desc: 'Wallet & Zip PayLater' },
            ].map(w => (
              <label
                key={w.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedWallet === w.id
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="walletSelection"
                    checked={selectedWallet === w.id}
                    onChange={() => setSelectedWallet(w.id)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{w.name}</p>
                    <p className="text-[11px] text-slate-500">{w.desc}</p>
                  </div>
                </div>
              </label>
            ))}

            <Button
              onClick={() => executePayment('wallet', 'SUCCESS')}
              isLoading={paymentStatus === 'PROCESSING'}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white mt-4"
            >
              Link & Pay {formatINR(amount)}
            </Button>
          </div>
        )}
      </div>

      {/* Footer Security Badge */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center space-x-2 text-[11px] text-slate-400">
        <Lock className="w-3 h-3 text-slate-400" />
        <span>End-to-End 256-Bit SSL Encrypted by DejoiY Security</span>
      </div>
    </div>
  );
}
