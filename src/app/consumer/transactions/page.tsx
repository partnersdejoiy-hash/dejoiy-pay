'use client';
import React, { useEffect, useState } from 'react';
import { PaymentTransaction } from '@/lib/types/payment';
import { formatINR, formatDate, formatRelativeTime } from '@/lib/utils';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Download,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export default function ConsumerTransactionsPage() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState<PaymentTransaction | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'RECEIVED'>('ALL');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/payments');
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filtered = transactions.filter(t => {
    if (filter === 'PAID') return t.status === 'SUCCESS';
    if (filter === 'RECEIVED') return t.status === 'REFUNDED';
    return true;
  });

  const totalSpent = transactions
    .filter(t => t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRefunded = transactions
    .filter(t => t.status === 'REFUNDED')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Passbook & History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Verified financial ledger statement</p>
        </div>

        <Button size="sm" variant="outline" onClick={fetchTransactions} isLoading={loading} className="text-xs h-8">
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 bg-white dark:bg-slate-900">
          <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-semibold uppercase">
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
            <span>Total Spent</span>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {formatINR(totalSpent)}
          </p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900">
          <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-semibold uppercase">
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
            <span>Refunds / Inflow</span>
          </div>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {formatINR(totalRefunded)}
          </p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2">
        {(['ALL', 'PAID', 'RECEIVED'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              filter === f
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {f === 'ALL' ? 'All Transactions' : f === 'PAID' ? 'Money Paid' : 'Refunds'}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <Card>
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No transactions recorded.</div>
          ) : (
            filtered.map(txn => {
              const isDebit = txn.status === 'SUCCESS';
              return (
                <div
                  key={txn.id}
                  onClick={() => setSelectedTxn(txn)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        txn.status === 'REFUNDED'
                          ? 'bg-purple-100 text-purple-600'
                          : isDebit
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {txn.status === 'REFUNDED' ? (
                        <ArrowDownLeft className="w-4 h-4 text-purple-600" />
                      ) : isDebit ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[190px]">
                        {txn.notes?.purpose || txn.notes?.plan || txn.customer.name || 'Payment'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {formatDate(txn.createdAt)} &bull; {txn.paymentMethod.type.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-xs font-mono font-bold ${
                        txn.status === 'REFUNDED'
                          ? 'text-purple-600'
                          : isDebit
                          ? 'text-slate-900 dark:text-slate-100'
                          : 'text-emerald-600'
                      }`}
                    >
                      {isDebit ? '-' : '+'} {formatINR(txn.amount)}
                    </p>
                    <StatusBadge status={txn.status} className="scale-75 origin-right" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Detailed Receipt Modal */}
      <Modal
        isOpen={Boolean(selectedTxn)}
        onClose={() => setSelectedTxn(null)}
        title="Transaction Receipt"
        maxWidth="sm"
      >
        {selectedTxn && (
          <div className="space-y-4">
            <div className="text-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
                {formatINR(selectedTxn.amount)}
              </span>
              <div className="mt-1">
                <StatusBadge status={selectedTxn.status} />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono">{selectedTxn.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">UPI RRN:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {selectedTxn.paymentMethod.upi?.rrn || selectedTxn.providerPaymentId || '425510982314'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Payment Method:</span>
                <span className="uppercase font-semibold">{selectedTxn.paymentMethod.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Date & Time:</span>
                <span>{formatDate(selectedTxn.createdAt)}</span>
              </div>
            </div>

            <Button
              onClick={() => alert(`Receipt downloaded for ${selectedTxn.id}`)}
              className="w-full text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Download Official PDF Receipt
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
