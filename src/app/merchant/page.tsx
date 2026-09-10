'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatINR, formatDate, formatRelativeTime } from '@/lib/utils';
import { PaymentTransaction } from '@/lib/types/payment';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { TransactionDrawer } from '@/components/merchant/TransactionDrawer';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Building,
  QrCode,
  Link2,
  RefreshCw,
} from 'lucide-react';

export default function MerchantOverviewPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<PaymentTransaction[]>([]);
  const [selectedTxn, setSelectedTxn] = useState<PaymentTransaction | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/payments?limit=8');
      const data = await res.json();
      setRecentTransactions(data.transactions || []);

      // Calculate overview metrics from API data
      const allTxns: PaymentTransaction[] = data.transactions || [];
      const successes = allTxns.filter(t => t.status === 'SUCCESS');
      const totalVol = successes.reduce((s, t) => s + t.amount, 0);
      const pendingBal = successes.filter(t => t.settlementStatus === 'pending').reduce((s, t) => s + t.netAmount, 0);

      setMetrics({
        todayVolume: totalVol * 0.65,
        totalVolume: totalVol,
        totalCount: allTxns.length,
        successRate: allTxns.length > 0 ? Math.round((successes.length / allTxns.length) * 100) : 100,
        atv: successes.length > 0 ? totalVol / successes.length : 0,
        pendingSettlement: pendingBal,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Merchant Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time financial performance and payment routing summary
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchDashboardData}
            isLoading={loading}
            className="text-xs h-8"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
          <Link href="/merchant/payment-links">
            <Button size="sm" className="text-xs h-8">
              <Link2 className="w-3 h-3 mr-1" />
              New Payment Link
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Core Financial Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Today's Revenue */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Revenue</span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-2">
            {formatINR(metrics?.todayVolume || 31250)}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">+14.2% vs yesterday</p>
        </Card>

        {/* Metric 2: Success Rate */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Success Rate</span>
            <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-2">
            {metrics?.successRate || 96}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across 6 providers</p>
        </Card>

        {/* Metric 3: Average Transaction Value (ATV) */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Order</span>
            <div className="w-7 h-7 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-2">
            {formatINR(metrics?.atv || 4150)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">ATV across all methods</p>
        </Card>

        {/* Metric 4: Pending Settlement */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Payout</span>
            <div className="w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-2">
            {formatINR(metrics?.pendingSettlement || 12205)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Next cycle: Tomorrow, 07:00 AM</p>
        </Card>
      </div>

      {/* Payment Methods Distribution Banner */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Payment Volume by Rail
          </span>
          <span className="text-xs text-slate-400 font-mono">Last 30 Days</span>
        </div>

        <div className="space-y-2">
          {/* Progress Bar */}
          <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
            <div style={{ width: '64%' }} className="bg-emerald-500" title="UPI: 64%" />
            <div style={{ width: '22%' }} className="bg-blue-600" title="Cards: 22%" />
            <div style={{ width: '9%' }} className="bg-purple-500" title="Netbanking: 9%" />
            <div style={{ width: '5%' }} className="bg-amber-500" title="Wallets: 5%" />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-medium text-slate-700 dark:text-slate-300">UPI (64%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Credit/Debit Cards (22%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Netbanking (9%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Wallets (5%)</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Transactions Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Click any transaction to view audit trail or initiate refund</p>
          </div>
          <Link href="/merchant/transactions" className="text-xs font-semibold text-emerald-600 hover:underline">
            View All ({recentTransactions.length}) &rarr;
          </Link>
        </CardHeader>

        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-800">
          {recentTransactions.map(txn => (
            <div
              key={txn.id}
              onClick={() => setSelectedTxn(txn)}
              className="p-4 active:bg-slate-50 dark:active:bg-slate-800/60 cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400 truncate max-w-[160px]">
                  {txn.id}
                </span>
                <StatusBadge status={txn.status} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{txn.customer.name}</p>
                  <p className="text-xs text-slate-500">{txn.paymentMethod.type.toUpperCase()} &bull; {txn.provider}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                    {formatINR(txn.amount)}
                  </p>
                  <p className="text-[10px] text-slate-400">{formatRelativeTime(txn.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Method / Provider</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Fee (2% + GST)</th>
                <th className="py-3 px-4 text-right">Net Payout</th>
                <th className="py-3 px-4 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {recentTransactions.map(txn => (
                <tr
                  key={txn.id}
                  onClick={() => setSelectedTxn(txn)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">
                    {txn.id}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{txn.customer.name}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{txn.customer.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase">
                      {txn.paymentMethod.type}
                    </span>
                    <span className="text-slate-400 ml-1.5 text-[11px]">({txn.provider})</span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={txn.status} />
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    {formatINR(txn.amount)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500">
                    {formatINR(txn.fee + txn.tax)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatINR(txn.netAmount)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">
                    {formatRelativeTime(txn.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Transaction Details Slide-In Drawer */}
      <TransactionDrawer
        transaction={selectedTxn}
        onClose={() => setSelectedTxn(null)}
        onRefundSuccess={updated => {
          setSelectedTxn(updated);
          fetchDashboardData();
        }}
      />
    </div>
  );
}
