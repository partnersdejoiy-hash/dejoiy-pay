'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatINR, formatRelativeTime } from '@/lib/utils';
import { PaymentTransaction } from '@/lib/types/payment';
import { WalletBalanceCard } from '@/components/consumer/WalletBalanceCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import {
  Smartphone,
  Zap,
  Tv,
  Car,
  Wifi,
  Droplet,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function ConsumerHomePage() {
  const [balance, setBalance] = useState(24850.75);
  const [vpa, setVpa] = useState('aakash@dejoiypay');
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Bill Pay Modal State
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [consumerNumber, setConsumerNumber] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [isPayingBill, setIsPayingBill] = useState(false);
  const [billSuccess, setBillSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [walletRes, txRes] = await Promise.all([
        fetch('/api/v1/consumer/wallet'),
        fetch('/api/v1/payments?limit=5'),
      ]);
      const walletData = await walletRes.json();
      const txData = await txRes.json();

      if (walletData.wallet) {
        setBalance(walletData.wallet.balance);
        setVpa(walletData.wallet.vpa);
      }
      setTransactions(txData.transactions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const billServices = [
    { id: 'mobile', name: 'Mobile Recharge', icon: Smartphone, defaultBiller: 'Jio Prepaid', placeholder: 'Enter 10-digit mobile number' },
    { id: 'electricity', name: 'Electricity', icon: Zap, defaultBiller: 'Tata Power DDL', placeholder: 'Enter Consumer Number / CA Number' },
    { id: 'dth', name: 'DTH TV', icon: Tv, defaultBiller: 'Tata Play', placeholder: 'Enter Subscriber ID' },
    { id: 'fastag', name: 'FASTag Toll', icon: Car, defaultBiller: 'NHAI FASTag Recharge', placeholder: 'Enter Vehicle Number (e.g. DL01AB1234)' },
    { id: 'broadband', name: 'Broadband', icon: Wifi, defaultBiller: 'Airtel Xstream Fiber', placeholder: 'Enter Landline / Account Number' },
    { id: 'water', name: 'Water Utility', icon: Droplet, defaultBiller: 'Delhi Jal Board', placeholder: 'Enter K Number' },
  ];

  const handlePayBill = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(billAmount);
    if (isNaN(amt) || amt <= 0) return;

    try {
      setIsPayingBill(true);
      const res = await fetch('/api/v1/consumer/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory.id,
          billerName: selectedCategory.defaultBiller,
          consumerNumber,
          amount: amt,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBalance(data.newBalance);
        setBillSuccess(`Bill of ${formatINR(amt)} paid successfully! BBPS Ref: ${data.operatorRef}`);
        setTimeout(() => {
          setSelectedCategory(null);
          setBillSuccess('');
          setConsumerNumber('');
          setBillAmount('');
          loadData();
        }, 1500);
      } else {
        alert(data.error || 'Payment failed');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsPayingBill(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <WalletBalanceCard
        balance={balance}
        vpa={vpa}
        onBalanceUpdated={newBal => setBalance(newBal)}
      />

      {/* Recharge & Utility Bills Section */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Recharge & Bill Payments</CardTitle>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200">
            BBPS Verified
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-1">
          {billServices.map(srv => {
            const Icon = srv.icon;
            return (
              <button
                key={srv.id}
                onClick={() => {
                  setSelectedCategory(srv);
                  setBillAmount('499');
                }}
                className="flex flex-col items-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all text-center group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 group-hover:text-emerald-600 transition-colors mb-1.5">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-tight">
                  {srv.name}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Recent Passbook Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm">Recent Passbook Activity</CardTitle>
          <Link href="/consumer/transactions" className="text-xs font-semibold text-emerald-600 hover:underline">
            View Statement &rarr;
          </Link>
        </CardHeader>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {transactions.map(txn => {
            const isDebit = txn.status === 'SUCCESS';
            return (
              <div key={txn.id} className="p-4 flex items-center justify-between">
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
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[180px]">
                      {txn.notes?.purpose || txn.notes?.plan || txn.customer.name || 'Payment'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {formatRelativeTime(txn.createdAt)} &bull; {txn.paymentMethod.type.toUpperCase()}
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
          })}
        </div>
      </Card>

      {/* Bill Payment Sheet Modal */}
      <Modal
        isOpen={Boolean(selectedCategory)}
        onClose={() => setSelectedCategory(null)}
        title={selectedCategory?.name || 'Pay Bill'}
        description={`Direct Bharat Bill Payment System (BBPS) checkout`}
      >
        {billSuccess ? (
          <div className="p-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{billSuccess}</p>
          </div>
        ) : (
          <form onSubmit={handlePayBill} className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">Biller:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedCategory?.defaultBiller}</span>
            </div>

            <Input
              label={selectedCategory?.placeholder || 'Consumer ID'}
              placeholder="Enter number or ID"
              value={consumerNumber}
              onChange={e => setConsumerNumber(e.target.value)}
              required
            />

            <Input
              label="Bill Amount"
              type="number"
              prefixText="₹"
              placeholder="499.00"
              value={billAmount}
              onChange={e => setBillAmount(e.target.value)}
              required
            />

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs flex justify-between">
              <span className="text-slate-500">Available Wallet Balance:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatINR(balance)}</span>
            </div>

            <div className="flex space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setSelectedCategory(null)} className="w-1/2">
                Cancel
              </Button>
              <Button type="submit" isLoading={isPayingBill} className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white">
                Pay Bill
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
