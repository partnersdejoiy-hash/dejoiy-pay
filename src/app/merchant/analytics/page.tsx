'use client';
import React, { useState } from 'react';
import { formatINR } from '@/lib/utils';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BarChart3, TrendingUp, ShieldCheck, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function AnalyticsPage() {
  const [range, setRange] = useState<'today' | '7d' | '30d' | '90d'>('30d');

  const providerStats = [
    { provider: 'DejoiY Direct UPI', volume: 184500, txns: 120, successRate: 98.2, avgLatency: '420ms' },
    { provider: 'Razorpay', volume: 64200, txns: 32, successRate: 95.8, avgLatency: '890ms' },
    { provider: 'Stripe Global', volume: 48900, txns: 18, successRate: 94.4, avgLatency: '650ms' },
    { provider: 'Paytm Business', volume: 31200, txns: 24, successRate: 96.1, avgLatency: '510ms' },
    { provider: 'Amazon Pay', volume: 14500, txns: 9, successRate: 97.0, avgLatency: '580ms' },
  ];

  const failureReasons = [
    { reason: 'Customer Bank / UPI Switch Down', pct: 45, count: 9 },
    { reason: 'Insufficient Funds in Account', pct: 30, count: 6 },
    { reason: 'Customer Aborted 3D Secure / OTP', pct: 15, count: 3 },
    { reason: 'Transaction Expired (Timeout)', pct: 10, count: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Analytics & Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Deep funnel diagnostics, payment rail routing efficiency, and failure telemetry
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
          {(['today', '7d', '30d', '90d'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded font-medium capitalize transition-colors ${
                range === r
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {r === 'today' ? 'Today' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Provider Performance Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Provider Routing & Success Telemetry</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Provider</th>
                <th className="py-3.5 px-4 text-right">Processed Volume</th>
                <th className="py-3.5 px-4 text-center">Transactions</th>
                <th className="py-3.5 px-4 text-center">Success Rate</th>
                <th className="py-3.5 px-4 text-center">API Latency</th>
                <th className="py-3.5 px-4">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {providerStats.map(p => (
                <tr key={p.provider} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    {p.provider}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    {formatINR(p.volume)}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-600 dark:text-slate-300">
                    {p.txns}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {p.successRate}%
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                    {p.avgLatency}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Operational</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Failure Root-Cause Diagnostics */}
      <Card className="p-5">
        <CardTitle className="mb-1">Payment Failure Root Causes</CardTitle>
        <p className="text-xs text-slate-500 mb-4">
          Automated classification of declined transactions to help merchants optimize retry flows
        </p>

        <div className="space-y-4">
          {failureReasons.map(f => (
            <div key={f.reason} className="space-y-1 text-xs">
              <div className="flex justify-between font-medium">
                <span className="text-slate-800 dark:text-slate-200">{f.reason}</span>
                <span className="text-slate-500 font-mono">{f.count} incidents ({f.pct}%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${f.pct}%` }}
                  className="h-full bg-rose-500 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
