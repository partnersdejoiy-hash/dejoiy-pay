'use client';
import React, { useEffect, useState } from 'react';
import { PayLaterAccount } from '@/lib/types/payment';
import { formatINR, formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  CreditCard,
  Clock,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  ArrowUpRight,
  TrendingDown,
} from 'lucide-react';

export default function ConsumerPayLaterPage() {
  const [account, setAccount] = useState<PayLaterAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [repayAmount, setRepayAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadAccount = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/consumer/paylater');
      const data = await res.json();
      if (data.payLater) {
        setAccount(data.payLater);
        setRepayAmount(data.payLater.dueAmount.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccount();
  }, []);

  const handleRepay = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(repayAmount);
    if (isNaN(amt) || amt <= 0) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/v1/consumer/paylater', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt }),
      });
      const data = await res.json();
      if (res.ok) {
        setAccount(data.payLater);
        setSuccessMsg(`Repayment of ${formatINR(amt)} completed successfully!`);
        setTimeout(() => {
          setShowRepayModal(false);
          setSuccessMsg('');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !account) {
    return <div className="p-8 text-center text-xs font-mono text-slate-400">Loading DejoiY Pay Later...</div>;
  }

  const limitUsagePct = Math.round((account.usedAmount / account.totalLimit) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          DejoiY Pay Later
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Zero-interest instant 30-day revolving credit line
        </p>
      </div>

      {/* Credit Card Graphic Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-base tracking-tight">DEJOIY</span>
            <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded">
              POSTPAID
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            0% Interest Line
          </span>
        </div>

        <div className="space-y-1 mb-6">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Available Credit Limit</span>
          <div className="text-3xl font-bold font-mono text-emerald-400">
            {formatINR(account.availableLimit)}
          </div>
          <p className="text-xs text-slate-400">
            Total Approved Limit: <span className="font-mono text-white">{formatINR(account.totalLimit)}</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1 mb-4">
          <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
            <div
              style={{ width: `${limitUsagePct}%` }}
              className="h-full bg-amber-400 rounded-full"
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{limitUsagePct}% utilized</span>
            <span>Billing cycle: {account.billingCycle}</span>
          </div>
        </div>

        {/* Repay Action */}
        <div className="pt-4 border-t border-slate-700/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Total Due:</span>
            <span className="text-lg font-bold font-mono text-white">{formatINR(account.dueAmount)}</span>
          </div>
          {account.dueAmount > 0 ? (
            <Button
              size="sm"
              onClick={() => setShowRepayModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs h-8 px-4"
            >
              Repay Now
            </Button>
          ) : (
            <span className="text-xs text-emerald-400 font-semibold flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              All Dues Cleared
            </span>
          )}
        </div>
      </div>

      {/* Spends History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm">Recent Pay Later Spends</CardTitle>
          <span className="text-xs text-slate-400">Auto-clears on bill date</span>
        </CardHeader>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {account.spends.map(sp => (
            <div key={sp.id} className="p-4 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{sp.merchantName}</p>
                  <p className="text-[10px] text-slate-400">{formatDate(sp.date)}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  - {formatINR(sp.amount)}
                </p>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    sp.status === 'BILLED' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {sp.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Repay Modal */}
      <Modal
        isOpen={showRepayModal}
        onClose={() => setShowRepayModal(false)}
        title="Repay DejoiY Pay Later Dues"
        description="Amount will be deducted from your DejoiY Wallet balance."
        maxWidth="sm"
      >
        {successMsg ? (
          <div className="p-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleRepay} className="space-y-4">
            <Input
              label="Repayment Amount (INR)"
              type="number"
              prefixText="₹"
              placeholder={account.dueAmount.toString()}
              value={repayAmount}
              onChange={e => setRepayAmount(e.target.value)}
              required
            />

            <div className="flex space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowRepayModal(false)} className="w-1/2">
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting} className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white">
                Confirm Repay
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
