'use client';
import React, { useEffect, useState } from 'react';
import { SmartRoutingRule, ProviderType } from '@/lib/types/payment';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Network, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function SmartRoutingPage() {
  const [rules, setRules] = useState<SmartRoutingRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/merchant/smart-routing');
      const data = await res.json();
      setRules(data.rules || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggleRule = async (id: string, active: boolean) => {
    try {
      const res = await fetch('/api/v1/merchant/smart-routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates: { active } }),
      });
      if (res.ok) fetchRules();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Smart Gateway Routing & Failover
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Intelligent automated payment routing across Direct UPI, Razorpay, Stripe, Paytm, and Amazon Pay
        </p>
      </div>

      {/* Rules Grid */}
      <div className="space-y-4">
        {rules.map(rule => (
          <Card key={rule.id} className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Network className="w-4 h-4 text-emerald-600" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{rule.name}</h3>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600">
                  {rule.rail}
                </span>
              </div>

              <label className="flex items-center space-x-2 cursor-pointer">
                <span className="text-xs text-slate-500">{rule.active ? 'Active' : 'Disabled'}</span>
                <input
                  type="checkbox"
                  checked={rule.active}
                  onChange={e => handleToggleRule(rule.id, e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </label>
            </div>

            {/* Visual Route Flow */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 font-semibold uppercase text-slate-800 dark:text-slate-200">
                  {rule.primaryProvider} (Primary)
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 font-semibold uppercase text-slate-500">
                  {rule.fallbackProvider} (Failover)
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Failover threshold: &gt;{rule.maxLatencyMs}ms latency or gateway 5xx</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
