'use client';
import React, { useEffect, useState } from 'react';
import { SettlementBatch } from '@/lib/types/payment';
import { formatINR, formatDate, formatRelativeTime } from '@/lib/utils';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Building2, ArrowDownToLine, CheckCircle2, Clock, RefreshCw } from 'lucide-react';

export default function SettlementsPage() {
  const [settlements, setSettlements] = useState<SettlementBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSettling, setIsSettling] = useState(false);
  const [settleMsg, setSettleMsg] = useState('');

  const fetchSettlements = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/settlements');
      const data = await res.json();
      setSettlements(data.settlements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, []);

  const handleInstantSettlement = async () => {
    try {
      setIsSettling(true);
      const res = await fetch('/api/v1/settlements', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSettleMsg(`Settlement processed: ${formatINR(data.settlement.netSettled)} dispatched to your bank.`);
        fetchSettlements();
        setTimeout(() => setSettleMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSettling(false);
    }
  };

  const totalSettledAmount = settlements.reduce((sum, s) => sum + s.netSettled, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Settlements & Payouts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated T+1 cycles and instant merchant on-demand bank disbursements
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={fetchSettlements} isLoading={loading} className="text-xs h-8">
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleInstantSettlement}
            isLoading={isSettling}
            className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 mr-1" />
            Trigger Instant Settlement
          </Button>
        </div>
      </div>

      {settleMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{settleMsg}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Settled Volume
          </span>
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {formatINR(totalSettledAmount)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Direct NEFT/RTGS to linked merchant account</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Linked Primary Bank
          </span>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
            HDFC Bank Ltd &bull; •••• 9102
          </p>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">IFSC: HDFC0000050 &bull; Verified</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Settlement Frequency
          </span>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
            Standard Daily (T+1) + Instant On-Demand
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">0% instant payout fee on Direct UPI rail</p>
        </Card>
      </div>

      {/* Settlements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Settlement History & UTR Audit</CardTitle>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Settlement ID</th>
                <th className="py-3.5 px-4">Bank Reference (UTR)</th>
                <th className="py-3.5 px-4">Beneficiary Account</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Gross Amount</th>
                <th className="py-3.5 px-4 text-right">Fees & GST</th>
                <th className="py-3.5 px-4 text-right">Net Settled</th>
                <th className="py-3.5 px-4 text-right">Settled Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {settlements.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">
                    {s.id}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {s.utr || 'IN_PROGRESS'}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{s.bankAccount.bankName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{s.bankAccount.accountNumberMasked} ({s.bankAccount.ifsc})</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-600 dark:text-slate-300">
                    {formatINR(s.amount)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                    {formatINR(s.fee + s.tax)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatINR(s.netSettled)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-500">
                    {formatDate(s.settledAt || s.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
