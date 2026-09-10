import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PaymentStatus } from './types/payment';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number, showSymbol = true): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return showSymbol ? `₹${formatted}` : formatted;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

export function getStatusBadgeStyle(status: PaymentStatus): { bg: string; text: string; border: string; label: string } {
  switch (status) {
    case 'SUCCESS':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-500/20',
        label: 'Success',
      };
    case 'PROCESSING':
      return {
        bg: 'bg-blue-500/10',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-500/20',
        label: 'Processing',
      };
    case 'PENDING':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-500/20',
        label: 'Pending',
      };
    case 'REFUNDED':
      return {
        bg: 'bg-purple-500/10',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-500/20',
        label: 'Refunded',
      };
    case 'PARTIALLY_REFUNDED':
      return {
        bg: 'bg-purple-500/10',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-500/20',
        label: 'Partial Refund',
      };
    case 'REFUND_PENDING':
      return {
        bg: 'bg-indigo-500/10',
        text: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-500/20',
        label: 'Refund Pending',
      };
    case 'FAILED':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-500/20',
        label: 'Failed',
      };
    case 'CANCELLED':
      return {
        bg: 'bg-slate-500/10',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-500/20',
        label: 'Cancelled',
      };
    case 'EXPIRED':
      return {
        bg: 'bg-zinc-500/10',
        text: 'text-zinc-600 dark:text-zinc-400',
        border: 'border-zinc-500/20',
        label: 'Expired',
      };
    case 'DISPUTED':
      return {
        bg: 'bg-orange-500/10',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-500/20',
        label: 'Disputed',
      };
    case 'CREATED':
    default:
      return {
        bg: 'bg-slate-500/10',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-500/20',
        label: 'Created',
      };
  }
}
