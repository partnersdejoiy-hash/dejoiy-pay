'use client';
import React, { useEffect, useState } from 'react';
import { PaymentTransaction, PaymentStatus, ProviderType } from '@/lib/types/payment';
import { formatINR, formatDate, formatRelativeTime } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { TransactionDrawer } from '@/components/merchant/TransactionDrawer';
import { Search, Download, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState<PaymentTransaction | null>(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [providerFilter, setProviderFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (providerFilter !== 'ALL') params.set('provider', providerFilter);
      if (methodFilter !== 'ALL') params.set('method', methodFilter);

      const res = await fetch(`/api/v1/payments?${params.toString()}`);
      const data = await res.json();
      setTransactions(data.transactions || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter, providerFilter, methodFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions();
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'OrderID', 'Amount', 'Currency', 'Status', 'Provider', 'Method', 'CustomerName', 'CustomerEmail', 'CreatedAt'];
    const rows = transactions.map(t => [
      t.id,
      t.orderId,
      t.amount,
      t.currency,
      t.status,
      t.provider,
      t.paymentMethod.type,
      `"${t.customer.name}"`,
      t.customer.email,
      t.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dejoiypay-transactions-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Transactions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {total} payments recorded across all channels
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={handleExportCSV} className="text-xs h-8">
            <Download className="w-3.5 h-3.5 mr-1" />
            Export CSV
          </Button>
          <Button size="sm" variant="outline" onClick={fetchTransactions} isLoading={loading} className="text-xs h-8">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Payment ID, Order ID, Customer Name, Phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
              <option value="REFUNDED">Refunded</option>
              <option value="PARTIALLY_REFUNDED">Partially Refunded</option>
            </select>

            {/* Provider Filter */}
            <select
              value={providerFilter}
              onChange={e => setProviderFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Providers</option>
              <option value="direct-upi">Direct UPI</option>
              <option value="razorpay">Razorpay</option>
              <option value="stripe">Stripe</option>
              <option value="paytm">Paytm</option>
              <option value="paytm-business">Paytm Business</option>
              <option value="amazon-pay">Amazon Pay</option>
            </select>

            {/* Method Filter */}
            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Methods</option>
              <option value="upi">UPI</option>
              <option value="card">Cards</option>
              <option value="netbanking">Net Banking</option>
              <option value="wallet">Wallets</option>
            </select>

            <Button type="submit" size="sm" className="text-xs h-8">
              Filter
            </Button>
          </div>
        </form>
      </Card>

      {/* Transaction List Card */}
      <Card>
        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-800">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No transactions match your search.</div>
          ) : (
            transactions.map(txn => (
              <div
                key={txn.id}
                onClick={() => setSelectedTxn(txn)}
                className="p-4 active:bg-slate-50 dark:active:bg-slate-800/60 cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {txn.id}
                  </span>
                  <StatusBadge status={txn.status} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{txn.customer.name}</p>
                    <p className="text-xs text-slate-500">
                      {txn.paymentMethod.type.toUpperCase()} &bull; {txn.provider}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                      {formatINR(txn.amount)}
                    </p>
                    <p className="text-[10px] text-slate-400">{formatRelativeTime(txn.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Method & Provider</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Gross Amount</th>
                <th className="py-3.5 px-4 text-right">Fee</th>
                <th className="py-3.5 px-4 text-right">Net Amount</th>
                <th className="py-3.5 px-4 text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No transactions match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                transactions.map(txn => (
                  <tr
                    key={txn.id}
                    onClick={() => setSelectedTxn(txn)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">
                      {txn.id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {txn.orderId}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{txn.customer.name}</p>
                      <p className="text-[11px] text-slate-400">{txn.customer.email}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase">
                        {txn.paymentMethod.type}
                      </span>
                      <span className="text-slate-400 ml-1.5 text-[11px]">({txn.provider})</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={txn.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatINR(txn.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                      {formatINR(txn.fee + txn.tax)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatINR(txn.netAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500">
                      {formatDate(txn.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Transaction Slide-in Drawer */}
      <TransactionDrawer
        transaction={selectedTxn}
        onClose={() => setSelectedTxn(null)}
        onRefundSuccess={updated => {
          setSelectedTxn(updated);
          fetchTransactions();
        }}
      />
    </div>
  );
}
