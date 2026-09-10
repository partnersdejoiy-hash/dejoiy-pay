'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ArrowLeftRight,
  RotateCcw,
  Link2,
  QrCode,
  Building2,
  BarChart3,
  Users,
  Code2,
  Settings,
  ShieldAlert,
  Wallet,
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: SidebarItem[] = [
  { name: 'Overview', href: '/merchant', icon: LayoutDashboard },
  { name: 'Transactions', href: '/merchant/transactions', icon: ArrowLeftRight },
  { name: 'Refunds', href: '/merchant/refunds', icon: RotateCcw },
  { name: 'Payment Links', href: '/merchant/payment-links', icon: Link2 },
  { name: 'QR Codes & Soundbox', href: '/merchant/qr-codes', icon: QrCode },
  { name: 'Settlements', href: '/merchant/settlements', icon: Building2 },
  { name: 'Analytics & Reports', href: '/merchant/analytics', icon: BarChart3 },
  { name: 'Customers', href: '/merchant/customers', icon: Users },
  { name: 'Developers & API', href: '/merchant/developers', icon: Code2 },
  { name: 'Settings', href: '/merchant/settings', icon: Settings },
];

export function MerchantSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <Link href="/merchant" className="flex items-center space-x-2">
            <span className="font-extrabold tracking-tight text-lg text-slate-900 dark:text-white">
              DEJOIY
            </span>
            <span className="bg-emerald-600 text-white text-[11px] font-black px-1.5 py-0.5 rounded tracking-wider">
              PAY
            </span>
            <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 px-1 py-0.5 rounded">
              BIZ
            </span>
          </Link>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-inherit' : 'text-slate-400')} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Switcher */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        {/* Switch to Consumer Wallet View */}
        <Link
          href="/consumer"
          className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs text-slate-700 dark:text-slate-300 font-medium"
        >
          <div className="flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span>Switch to Wallet</span>
          </div>
          <span className="text-[10px] text-slate-400">Personal &rarr;</span>
        </Link>

        {/* Environment Badge */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-mono uppercase font-semibold text-[11px] text-amber-600 dark:text-amber-400">
              TEST SANDBOX
            </span>
          </div>
          <span className="text-[10px] text-slate-400">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
