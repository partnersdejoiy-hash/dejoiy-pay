'use client';
import React, { useEffect, useState } from 'react';
import { PaymentTransaction, RefundTransaction } from '@/lib/types/payment';
import { formatINR, formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { RotateCcw, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Array<RefundTransaction & { originalTxn?: PaymentTransaction }>>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [paymentId, setPaymentId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/payments?status=REFUNDED');
      const data = await res.json();
      const txns: PaymentTransaction[] = data.transactions || [];

      // Extract all refunds
      const allRefs: Array<RefundTransaction & { originalTxn?: PaymentTransaction }> = [];
      txns.forEach(t => {
        t.refunds.forEach(r => {
          allRefs.push({ ...r, originalTxn: t });
        });
      });

      setRefunds(allRefs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleCreateRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const amt = parseFloat(amount);
    if (!paymentId.trim()) {
      setFormError('Please provide a valid Payment ID');
      return;
    }
    if (isNaN(amt) || amt <= 0) {
      setFormError('Please enter a valid positive refund amount');
      return;
    }
    if (!reason.trim()) {
      setFormError('Please provide a reason for the refund');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/v1/payments/${paymentId.trim()}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': `ref_page_${Date.now()}`,
        },
        body: JSON.stringify({ amount: amt, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Refund failed');

      setShowModal(false);
      setPaymentId('');
      setAmount('');
      setReason('');
      fetchRefunds();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const totalRefundAmount = refunds.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Refunds & Disputes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit and initiate full or partial customer refunds with provider idempotency
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={fetchRefunds} isLoading={loading} className="text-xs h-8">
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowModal(true)} className="text-xs h-8 bg-rose-600 hover:bg-rose-700 text-white">
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Initiate Refund
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Refunded Volume</span>
          <p className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">
            {formatINR(totalRefundAmount)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Settled back to customer bank accounts</p>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Refund Count</span>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {refunds.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Across UPI and Cards</p>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dispute Status</span>
          <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">0 Active</p>
          <p className="text-[11px] text-slate-400 mt-1">Zero chargebacks pending</p>
        </Card>
      </div>

      {/* Refunds Table */}
      <Card>
        <CardHeader>
          <CardTitle>Refund Audit Trail</CardTitle>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Refund ID</th>
                <th className="py-3 px-4">Original Payment ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {refunds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No refunds processed yet.
                  </td>
                </tr>
              ) : (
                refunds.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">
                      {r.id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {r.paymentId}
                    </td>
                    <td className="py-3.5 px-4">
                      {r.originalTxn ? (
                        <>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{r.originalTxn.customer.name}</p>
                          <p className="text-[10px] text-slate-400">{r.originalTxn.customer.email}</p>
                        </>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {r.reason}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                      - {formatINR(r.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500">
                      {formatDate(r.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Initiate Refund Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Initiate Customer Refund"
        description="Funds will be credited back via the original payment source."
      >
        <form onSubmit={handleCreateRefund} className="space-y-4">
          <Input
            label="Payment ID"
            placeholder="e.g. dj_pay_109283741"
            value={paymentId}
            onChange={e => setPaymentId(e.target.value)}
            required
          />
          <Input
            label="Refund Amount"
            type="number"
            step="0.01"
            prefixText="₹"
            placeholder="500.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />
          <Input
            label="Reason for Refund"
            placeholder="e.g. Product returned, Customer cancellation"
            value={reason}
            onChange={e => setReason(e.target.value)}
            required
          />
          {formError && <p className="text-xs text-rose-600 font-medium">{formError}</p>}
          <div className="flex space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="w-1/2">
              Cancel
            </Button>
            <Button type="submit" variant="danger" isLoading={submitting} className="w-1/2">
              Confirm Refund
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
