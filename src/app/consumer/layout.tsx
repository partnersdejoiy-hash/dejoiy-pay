'use client';
import React, { useEffect, useState } from 'react';
import { ConsumerNavbar } from '@/components/consumer/ConsumerNavbar';
import { ConsumerBottomNav } from '@/components/consumer/ConsumerBottomNav';

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState(24850.75);

  useEffect(() => {
    fetch('/api/v1/consumer/wallet')
      .then(r => r.json())
      .then(d => {
        if (d.wallet?.balance !== undefined) setBalance(d.wallet.balance);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <ConsumerNavbar balance={balance} />
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6 space-y-6 pb-24 md:pb-8">
        {children}
      </main>
      <ConsumerBottomNav />
    </div>
  );
}
