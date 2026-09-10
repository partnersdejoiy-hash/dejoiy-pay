'use client';
import React, { useEffect, useState } from 'react';
import { CashbackReward } from '@/lib/types/payment';
import { formatINR } from '@/lib/utils';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Gift, Sparkles, CheckCircle2, Trophy } from 'lucide-react';

export default function ConsumerRewardsPage() {
  const [rewards, setRewards] = useState<CashbackReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [scratchingId, setScratchingId] = useState<string | null>(null);
  const [revealedReward, setRevealedReward] = useState<CashbackReward | null>(null);

  const loadRewards = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/consumer/rewards');
      const data = await res.json();
      setRewards(data.rewards || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRewards();
  }, []);

  const handleScratch = async (r: CashbackReward) => {
    if (r.isScratched) {
      setRevealedReward(r);
      return;
    }

    try {
      setScratchingId(r.id);
      const res = await fetch('/api/v1/consumer/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: r.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setRevealedReward(data.reward);
        loadRewards();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setScratchingId(null);
    }
  };

  const totalCashbackEarned = rewards
    .filter(r => r.isScratched)
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Cashback & Scratch Cards
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Earn instant wallet credits on every merchant UPI payment
        </p>
      </div>

      {/* Rewards Trophy Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 flex items-center justify-between shadow-lg">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider opacity-80">Total Cashback Won</span>
          <div className="text-3xl font-extrabold font-mono mt-0.5">{formatINR(totalCashbackEarned)}</div>
          <p className="text-xs opacity-90 mt-1">Directly credited to your DejoiY Wallet</p>
        </div>
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-slate-950" />
        </div>
      </div>

      {/* Scratch Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {rewards.map(r => (
          <div
            key={r.id}
            onClick={() => handleScratch(r)}
            className={`aspect-square rounded-2xl cursor-pointer transition-all p-4 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-sm border ${
              r.isScratched
                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                : 'bg-gradient-to-br from-emerald-600 to-teal-800 text-white border-emerald-500 hover:scale-[1.02]'
            }`}
          >
            {r.isScratched ? (
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Cashback</span>
                <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {formatINR(r.amount)}
                </div>
                <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{r.title}</p>
                <span className="text-[9px] text-slate-400">Claimed &bull; In Wallet</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mx-auto">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-bold block">TAP TO SCRATCH</span>
                <span className="text-[10px] opacity-80 block">Win up to ₹100</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Revealed Modal */}
      {revealedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-2xl space-y-3 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase">You Won</span>
            <div className="text-3xl font-extrabold font-mono text-emerald-600">
              {formatINR(revealedReward.amount)}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{revealedReward.description}</p>
            <p className="text-[11px] text-emerald-600 font-semibold">Credited to DejoiY Wallet Balance</p>
            <Button onClick={() => setRevealedReward(null)} className="w-full text-xs mt-2">
              Awesome!
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
