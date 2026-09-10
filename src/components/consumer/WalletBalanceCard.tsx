'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/utils';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Send, QrCode, Building, Plus, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface WalletBalanceCardProps {
  balance: number;
  vpa: string;
  onBalanceUpdated?: (newBalance: number) => void;
}

export function WalletBalanceCard({ balance, vpa, onBalanceUpdated }: WalletBalanceCardProps) {
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [amount, setAmount] = useState('1000');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/consumer/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: num }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Added ₹${num.toFixed(2)} to wallet successfully!`);
        if (onBalanceUpdated) onBalanceUpdated(data.balance);
        setTimeout(() => {
          setShowAddMoneyModal(false);
          setSuccessMsg('');
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="w-full rounded-2xl bg-slate-900 text-white p-5 sm:p-6 shadow-md border border-slate-800 relative overflow-hidden">
        {/* Subtle pattern */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none -mr-12 -mt-12" />

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">DejoiY Pay Wallet</span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white mt-0.5">
              {formatINR(balance)}
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddMoneyModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 rounded-full px-3"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Money
          </Button>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-6 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>UPI ID: {vpa}</span>
        </div>

        {/* Quick 4 Actions */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
          <Link
            href="/consumer/scan"
            className="flex flex-col items-center p-2 rounded-xl hover:bg-slate-800 transition-colors text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center mb-1 text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-slate-300">Scan QR</span>
          </Link>

          <Link
            href="/consumer/pay"
            className="flex flex-col items-center p-2 rounded-xl hover:bg-slate-800 transition-colors text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center mb-1 text-sky-400">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-slate-300">To UPI ID</span>
          </Link>

          <Link
            href="/consumer/pay?tab=bank"
            className="flex flex-col items-center p-2 rounded-xl hover:bg-slate-800 transition-colors text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center mb-1 text-indigo-400">
              <Building className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-slate-300">To Bank</span>
          </Link>

          <Link
            href="/consumer/pay?tab=self"
            className="flex flex-col items-center p-2 rounded-xl hover:bg-slate-800 transition-colors text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center mb-1 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-slate-300">Self A/C</span>
          </Link>
        </div>
      </div>

      {/* Add Money Modal */}
      <Modal
        isOpen={showAddMoneyModal}
        onClose={() => setShowAddMoneyModal(false)}
        title="Add Money to DejoiY Wallet"
        description="Top up instantly from your linked bank account via Direct UPI."
      >
        {successMsg ? (
          <div className="p-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <p className="font-semibold text-slate-900 dark:text-slate-100">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleAddMoney} className="space-y-4">
            <Input
              label="Amount to Add"
              type="number"
              prefixText="₹"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="1000"
              required
            />
            {/* Quick amount chips */}
            <div className="flex space-x-2">
              {[500, 1000, 2000, 5000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  +₹{val}
                </button>
              ))}
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Deducted from:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">HDFC Bank •••• 4092</span>
              </div>
              <div className="flex justify-between">
                <span>Fee:</span>
                <span className="text-emerald-600 font-semibold">₹0.00 (Free)</span>
              </div>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full">
              Add {amount ? `₹${amount}` : 'Money'}
            </Button>
          </form>
        )}
      </Modal>
    </>
  );
}
