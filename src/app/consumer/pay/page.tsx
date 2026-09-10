'use client';
import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { validateVpa } from '@/lib/upi/spec';
import { formatINR } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Send, Building, ShieldCheck, CheckCircle2, Lock, ArrowRight, UserCheck } from 'lucide-react';

function ConsumerPayForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'bank' ? 'bank' : 'upi';

  const [tab, setTab] = useState<'upi' | 'bank'>(initialTab);

  // UPI Form State
  const [recipientVpa, setRecipientVpa] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [vpaValidated, setVpaValidated] = useState<any>(null);

  // Bank Transfer Form State
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccount, setConfirmAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankHolderName, setBankHolderName] = useState('');

  // 6-digit UPI PIN Modal State
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Payment Success State
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);

  const handleValidateVpa = async () => {
    if (!recipientVpa.trim()) return;
    const res = await fetch('/api/v1/consumer/upi/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vpa: recipientVpa.trim() }),
    });
    const data = await res.json();
    setVpaValidated(data);
    if (data.isValid && !recipientName) {
      setRecipientName(recipientVpa.split('@')[0].replace('.', ' ').toUpperCase());
    }
  };

  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setErrorMsg('Please enter a valid amount');
      return;
    }

    if (tab === 'bank') {
      if (accountNumber !== confirmAccount) {
        setErrorMsg('Account numbers do not match');
        return;
      }
      if (!ifsc.trim() || ifsc.length < 11) {
        setErrorMsg('Enter a valid 11-character IFSC code');
        return;
      }
    }

    setShowPinModal(true);
  };

  const handleConfirmPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6) {
      setErrorMsg('Enter 6-digit UPI PIN');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg('');

      const res = await fetch('/api/v1/consumer/send-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientVpaOrPhone: tab === 'upi' ? recipientVpa : `${accountNumber}@${ifsc}.ifsc`,
          recipientName: tab === 'upi' ? recipientName : bankHolderName,
          amount: parseFloat(amount),
          upiPin: pin,
          note,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      setShowPinModal(false);
      setPaymentSuccess({
        amount: parseFloat(amount),
        recipient: tab === 'upi' ? recipientName : bankHolderName,
        vpa: tab === 'upi' ? recipientVpa : `${accountNumber} (${ifsc})`,
        rrn: data.rrn,
      });
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 text-center shadow-lg space-y-4 animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Transfer Successful!</h2>
        <div className="text-3xl font-bold font-mono text-slate-900 dark:text-slate-100">
          {formatINR(paymentSuccess.amount)}
        </div>
        <p className="text-xs text-slate-500">Transferred to {paymentSuccess.recipient}</p>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 text-xs text-left space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Beneficiary:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{paymentSuccess.recipient}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">UPI ID / A/C:</span>
            <span className="font-mono">{paymentSuccess.vpa}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">UPI Ref (RRN):</span>
            <span className="font-mono font-bold text-emerald-600">{paymentSuccess.rrn}</span>
          </div>
        </div>

        <Button onClick={() => router.push('/consumer')} className="w-full text-xs">
          Return to Wallet Home
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Tabs */}
      <div className="grid grid-cols-2 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 p-1 text-xs">
        <button
          type="button"
          onClick={() => setTab('upi')}
          className={`py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-1.5 ${
            tab === 'upi' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>To UPI ID / Phone</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('bank')}
          className={`py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-1.5 ${
            tab === 'bank' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>To Bank Account</span>
        </button>
      </div>

      <Card className="p-5">
        <form onSubmit={handleInitiatePayment} className="space-y-4">
          {tab === 'upi' ? (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Beneficiary UPI ID or Mobile Number
                </label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="e.g. merchant@icici or 9811234567"
                    value={recipientVpa}
                    onChange={e => {
                      setRecipientVpa(e.target.value);
                      setVpaValidated(null);
                    }}
                    required
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleValidateVpa} className="text-xs shrink-0">
                    Verify
                  </Button>
                </div>
                {vpaValidated && (
                  <div className="mt-2 text-xs flex items-center space-x-1.5">
                    {vpaValidated.isValid ? (
                      <span className="text-emerald-600 font-medium flex items-center">
                        <UserCheck className="w-3.5 h-3.5 mr-1" />
                        Verified: {vpaValidated.provider}
                      </span>
                    ) : (
                      <span className="text-rose-600 font-medium">{vpaValidated.error}</span>
                    )}
                  </div>
                )}
              </div>

              <Input
                label="Beneficiary Name"
                placeholder="Name"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                required
              />
            </>
          ) : (
            <>
              <Input
                label="Bank Account Holder Name"
                placeholder="Full Name as per Bank Records"
                value={bankHolderName}
                onChange={e => setBankHolderName(e.target.value)}
                required
              />
              <Input
                label="Bank Account Number"
                type="password"
                placeholder="Enter Account Number"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                required
              />
              <Input
                label="Re-enter Account Number"
                placeholder="Confirm Account Number"
                value={confirmAccount}
                onChange={e => setConfirmAccount(e.target.value)}
                required
              />
              <Input
                label="IFSC Code"
                placeholder="e.g. HDFC0000050"
                value={ifsc}
                onChange={e => setIfsc(e.target.value.toUpperCase())}
                required
              />
            </>
          )}

          <Input
            label="Amount (INR)"
            type="number"
            step="0.01"
            prefixText="₹"
            placeholder="500.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />

          <Input
            label="Payment Note / Remark (Optional)"
            placeholder="e.g. Dinner split, Rent, Freelance fee"
            value={note}
            onChange={e => setNote(e.target.value)}
          />

          {errorMsg && <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>}

          <Button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 mt-2">
            Proceed to Pay {amount ? `₹${amount}` : ''}
          </Button>
        </form>
      </Card>

      {/* 6-Digit PIN Modal */}
      <Modal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        title="Enter 6-Digit UPI PIN"
        description="Authorizing payment from DejoiY Wallet linked account"
        maxWidth="sm"
      >
        <form onSubmit={handleConfirmPin} className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-700 dark:text-slate-300">
            <Lock className="w-6 h-6" />
          </div>

          <div className="text-xs text-slate-500">
            Transferring <span className="font-bold text-slate-900 dark:text-slate-100">{formatINR(parseFloat(amount) || 0)}</span> to{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-100">{tab === 'upi' ? recipientName : bankHolderName}</span>
          </div>

          <input
            type="password"
            maxLength={6}
            autoFocus
            placeholder="••••••"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
            className="w-48 mx-auto text-center font-mono text-2xl tracking-widest py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            required
          />

          {errorMsg && <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>}

          <div className="flex space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowPinModal(false)} className="w-1/2">
              Cancel
            </Button>
            <Button type="submit" isLoading={isProcessing} className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white">
              Confirm
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function ConsumerPayPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400 font-mono">Loading Payment Terminal...</div>}>
      <ConsumerPayForm />
    </Suspense>
  );
}
