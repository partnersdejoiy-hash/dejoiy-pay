import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 disabled:opacity-50 disabled:pointer-events-none rounded-md';

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    };

    const variants = {
      primary: 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
      outline: 'border border-slate-300 bg-transparent hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
      danger: 'bg-rose-600 text-white hover:bg-rose-700',
      success: 'bg-emerald-600 text-white hover:bg-emerald-700',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, sizes[size], variants[variant], className)}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
