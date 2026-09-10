import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefixText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, prefixText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            {label}
          </label>
        )}
        <div className="relative flex rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm focus-within:border-slate-900 dark:focus-within:border-slate-300 focus-within:ring-1 focus-within:ring-slate-900 dark:focus-within:ring-slate-300">
          {prefixText && (
            <span className="inline-flex items-center px-3 border-r border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm font-medium bg-slate-50 dark:bg-slate-800/50 rounded-l-md select-none">
              {prefixText}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full rounded-md bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
              prefixText && 'rounded-l-none',
              className
            )}
            {...props}
          />
        </div>
        {hint && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
        {error && <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
