import React from 'react';
import { cn } from '@/lib/utils';
import { PaymentStatus } from '@/lib/types/payment';
import { getStatusBadgeStyle } from '@/lib/utils';

export function StatusBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  const style = getStatusBadgeStyle(status);
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border uppercase tracking-wider',
        style.bg,
        style.text,
        style.border,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75" />
      {style.label}
    </span>
  );
}

export function Badge({ children, variant = 'default', className }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'; className?: string }) {
  const variants = {
    default: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
    success: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    info: 'bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  };

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border', variants[variant], className)}>
      {children}
    </span>
  );
}
