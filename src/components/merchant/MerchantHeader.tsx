'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, AlertTriangle, ArrowDownToLine, Menu, X, PlusCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface MerchantHeaderProps {
  onInstantSettlement?: () => void;
  isSettling?: boolean;
}

export function MerchantHeader({ onInstantSettlement, isSettling }: MerchantHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
      {/* Mobile brand & toggle */}
      <div className="flex items-center space-x-3 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-md border border-slate-200 text-slate-600"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Link href="/merchant" className="flex items-center space-x-1.5">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white">DEJOIY</span>
          <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded">PAY</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="hidden md:flex items-center relative max-w-sm w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by Payment ID, Order ID, VPA, Customer..."
          className="w-full pl-9 pr-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Test Mode Warning Indicator */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-medium">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Test Mode Active</span>
        </div>

        {/* Instant Settlement Button */}
        {onInstantSettlement && (
          <Button
            size="sm"
            variant="outline"
            isLoading={isSettling}
            onClick={onInstantSettlement}
            className="text-xs h-8 border-slate-300 dark:border-slate-700"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Instant Settlement
          </Button>
        )}

        <Link href="/merchant/payment-links">
          <Button size="sm" className="text-xs h-8">
            <PlusCircle className="w-3.5 h-3.5 mr-1" />
            Create Link
          </Button>
        </Link>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 shadow-lg space-y-2 z-40 animate-in slide-in-from-top-2">
          <Link
            href="/merchant"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2 text-sm font-medium rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Overview
          </Link>
          <Link
            href="/merchant/transactions"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2 text-sm font-medium rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Transactions
          </Link>
          <Link
            href="/merchant/refunds"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2 text-sm font-medium rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Refunds
          </Link>
          <Link
            href="/merchant/payment-links"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2 text-sm font-medium rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Payment Links
          </Link>
          <Link
            href="/merchant/qr-codes"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2 text-sm font-medium rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            QR Codes
          </Link>
          <Link
            href="/merchant/settlements"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2 text-sm font-medium rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Settlements
          </Link>
          <Link
            href="/merchant/developers"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2 text-sm font-medium rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Developers & API
          </Link>
          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/consumer"
              className="block p-2 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded"
            >
              Switch to Consumer Wallet &rarr;
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
