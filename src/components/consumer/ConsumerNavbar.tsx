'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatINR } from '@/lib/utils';
import { Wallet, Shield, ArrowRightLeft, Bell } from 'lucide-react';

interface ConsumerNavbarProps {
  balance?: number;
}

export function ConsumerNavbar({ balance = 24850.75 }: ConsumerNavbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/consumer" className="flex items-center space-x-2">
          <span className="font-extrabold tracking-tight text-lg text-slate-900 dark:text-white">
            DEJOIY
          </span>
          <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded tracking-wider">
            PAY
          </span>
          <span className="text-[10px] font-medium text-slate-500 border border-slate-200 dark:border-slate-700 px-1 py-0.5 rounded hidden sm:inline-block">
            WALLET
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link href="/consumer" className={pathname === '/consumer' ? 'text-emerald-600 font-semibold' : 'hover:text-slate-900 dark:hover:text-white'}>
            Home
          </Link>
          <Link href="/consumer/pay" className={pathname === '/consumer/pay' ? 'text-emerald-600 font-semibold' : 'hover:text-slate-900 dark:hover:text-white'}>
            Send Money
          </Link>
          <Link href="/consumer/scan" className={pathname === '/consumer/scan' ? 'text-emerald-600 font-semibold' : 'hover:text-slate-900 dark:hover:text-white'}>
            Scan & Pay
          </Link>
          <Link href="/consumer/transactions" className={pathname === '/consumer/transactions' ? 'text-emerald-600 font-semibold' : 'hover:text-slate-900 dark:hover:text-white'}>
            Passbook
          </Link>
          <Link href="/consumer/security" className={pathname === '/consumer/security' ? 'text-emerald-600 font-semibold' : 'hover:text-slate-900 dark:hover:text-white'}>
            Security
          </Link>
        </nav>

        {/* Right Actions: Balance Chip & Switch to Merchant */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium">
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatINR(balance)}</span>
          </div>

          <Link
            href="/merchant"
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowRightLeft className="w-3 h-3 text-slate-400" />
            <span className="hidden sm:inline">Merchant Portal</span>
            <span className="sm:hidden">Biz</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
