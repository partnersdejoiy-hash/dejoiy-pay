'use client';
import React, { useState } from 'react';
import { PaymentTransaction } from '@/lib/types/payment';
import { formatINR, formatDate, formatRelativeTime } from '@/lib/utils';
import { StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, ArrowRight, ShieldCheck, Clock, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';

interface TransactionDrawerProps {
  transaction: PaymentTransaction | null;
  onClose: () => void;
  onRefundSuccess?: (updated: PaymentTransaction) => void;
}

export function TransactionDrawer({ transaction, onClose, onRefundSuccess }: TransactionDrawerProps) {
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [refundReason, setRefundReason] = useState<string>('');
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  if (!transaction) return null;

  const totalRefunded = transaction.refunds.reduce((sum, r) => sum + r.amount, 0);
  const remainingRefundable = transaction.amount - totalRefunded;
  const canRefund = (transaction.status === 'SUCCESS' || transaction.status === 'PARTIALLY_REFUNDED') && remainingRefundable > 0;

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setRefundError(null);
    const amt = parseFloat(refundAmount);

    if (isNaN(amt) || amt <= 0) {
      setRefundError('Enter a valid refund amount');
      return;
    }
    if (amt > remainingRefundable) {
      setRefundError(`Amount exceeds refundable balance of ₹${remainingRefundable.toFixed(2)}`);
      return;
    }
    if (!refundReason.trim()) {
      setRefundError('Please specify a reason for this refund');
      return;
    }

    try {
      setIsRefunding(true);
      const res = await fetch(`/api/v1/payments/${transaction.id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': `ref_${transaction.id}_${Date.now()}`,
        },
        body: JSON.stringify({ amount: amt, reason: refundReason }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Refund failed');
      }

      setShowRefundForm(false);
      setRefundAmount('');
      setRefundReason('');
      if (onRefundSuccess && data.updatedTransaction) {
        onRefundSuccess(data.updatedTransaction);
      }
    } catch (err: any) {
      setRefundError(err.message);
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/50 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-semibold text-slate-500 uppercase">{transaction.id}</span>
              <StatusBadge status={transaction.status} />
            </div>
            <h2 className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
              {formatINR(transaction.amount)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm">
          {/* Financial Breakdown */}
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Financial Breakdown</h4>
            <div className="flex justify-between text-xs py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-600 dark:text-slate-400">Gross Amount</span>
              <span className="font-mono font-medium">{formatINR(transaction.amount)}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-600 dark:text-slate-400">Gateway Fee (2.0%)</span>
              <span className="font-mono text-rose-600 dark:text-rose-400">- {formatINR(transaction.fee)}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-600 dark:text-slate-400">GST on Fee (18%)</span>
              <span className="font-mono text-rose-600 dark:text-rose-400">- {formatINR(transaction.tax)}</span>
            </div>
            <div className="flex justify-between text-xs pt-1 font-semibold">
              <span className="text-slate-900 dark:text-slate-100">Net Settlement to Merchant</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{formatINR(transaction.netAmount)}</span>
            </div>
          </div>

          {/* Payment & Provider Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Payment Information</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded border border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 mb-0.5">Order ID</p>
                <p className="font-mono font-medium truncate">{transaction.orderId}</p>
              </div>
              <div className="p-2.5 rounded border border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 mb-0.5">Payment Provider</p>
                <p className="font-semibold uppercase text-slate-800 dark:text-slate-200">{transaction.provider}</p>
              </div>
              <div className="p-2.5 rounded border border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 mb-0.5">Method</p>
                <p className="font-medium uppercase">{transaction.paymentMethod.type}</p>
                {transaction.paymentMethod.upi?.vpa && (
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{transaction.paymentMethod.upi.vpa}</p>
                )}
                {transaction.paymentMethod.card?.last4 && (
                  <p className="text-[11px] text-slate-500 mt-0.5">•••• {transaction.paymentMethod.card.last4} ({transaction.paymentMethod.card.network.toUpperCase()})</p>
                )}
              </div>
              <div className="p-2.5 rounded border border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 mb-0.5">Bank Reference (RRN)</p>
                <p className="font-mono font-medium truncate">{transaction.paymentMethod.upi?.rrn || transaction.providerPaymentId || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Customer Profile */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Customer Details</h4>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
              <p className="font-medium text-slate-900 dark:text-slate-100">{transaction.customer.name}</p>
              <p className="text-slate-500">{transaction.customer.email}</p>
              <p className="text-slate-500 font-mono">{transaction.customer.phone}</p>
            </div>
          </div>

          {/* Refunds Section */}
          {transaction.refunds.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-600">Refunds Processed</h4>
              {transaction.refunds.map(r => (
                <div key={r.id} className="p-3 rounded border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20 text-xs space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="font-mono">{r.id}</span>
                    <span className="font-bold text-purple-700 dark:text-purple-300">{formatINR(r.amount)}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{r.reason}</p>
                  <p className="text-[10px] text-slate-400">{formatDate(r.createdAt)}</p>
                </div>
              ))}
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Transaction Audit Timeline</h4>
            <div className="space-y-3 border-l-2 border-slate-200 dark:border-slate-700 ml-2 pl-3">
              {transaction.timeline.map((event, idx) => (
                <div key={idx} className="relative text-xs space-y-0.5">
                  <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500 border-2 border-white dark:border-slate-900" />
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase text-[10px]">
                      {event.status}
                    </span>
                    <span className="text-[10px] text-slate-400">{formatRelativeTime(event.timestamp)}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{event.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions / Refund Flow */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
          {showRefundForm ? (
            <form onSubmit={handleProcessRefund} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Initiate Refund</span>
                <span className="text-xs text-slate-500">Max: {formatINR(remainingRefundable)}</span>
              </div>
              <Input
                type="number"
                step="0.01"
                prefixText="₹"
                placeholder={remainingRefundable.toFixed(2)}
                value={refundAmount}
                onChange={e => setRefundAmount(e.target.value)}
                required
              />
              <Input
                placeholder="Reason for refund (e.g. customer return, duplicate payment)"
                value={refundReason}
                onChange={e => setRefundReason(e.target.value)}
                required
              />
              {refundError && <p className="text-xs text-rose-600">{refundError}</p>}
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-1/2"
                  onClick={() => setShowRefundForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  size="sm"
                  isLoading={isRefunding}
                  className="w-1/2"
                >
                  Confirm Refund
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex space-x-2">
              {canRefund && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                  onClick={() => {
                    setRefundAmount(remainingRefundable.toString());
                    setShowRefundForm(true);
                  }}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Issue Refund
                </Button>
              )}
              <Button variant="secondary" size="sm" className="w-full text-xs" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
