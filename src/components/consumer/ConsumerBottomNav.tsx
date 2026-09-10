'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Send, QrCode, ReceiptText, ShieldCheck } from 'lucide-react';

export function ConsumerBottomNav() {
  const pathname = usePathname();

  const navs = [
    { name: 'Home', href: '/consumer', icon: Home },
    { name: 'Pay', href: '/consumer/pay', icon: Send },
    { name: 'Scan', href: '/consumer/scan', icon: QrCode, isFab: true },
    { name: 'Passbook', href: '/consumer/transactions', icon: ReceiptText },
    { name: 'Security', href: '/consumer/security', icon: ShieldCheck },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navs.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isFab) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center -mt-5"
              >
                <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {item.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-12 py-1 text-[11px] font-medium transition-colors',
                isActive ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
