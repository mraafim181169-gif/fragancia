'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'default'
  | 'dark'
  | 'live'
  | 'upcoming'
  | 'completed'
  | 'open'
  | 'closed'
  | 'category'
  | 'team'
  | 'outline';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  pulse?: boolean;
}

export function Badge({
  children,
  variant = 'default',
  pulse = false,
  className,
  ...props
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    default:
      'bg-neutral-100 text-neutral-800 border-neutral-200/80 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700/60',
    dark:
      'bg-neutral-900 text-white border-neutral-800 dark:bg-white dark:text-neutral-950 dark:border-neutral-200 font-semibold',
    live:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60',
    upcoming:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60',
    completed:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60',
    open:
      'bg-emerald-500/10 text-emerald-700 border-emerald-300/50 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
    closed:
      'bg-amber-500/10 text-amber-700 border-amber-300/50 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30',
    category:
      'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',
    team:
      'bg-neutral-100 text-neutral-900 font-mono border-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700',
    outline:
      'bg-transparent text-neutral-700 border-neutral-300 dark:text-neutral-300 dark:border-neutral-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide uppercase border transition-colors whitespace-nowrap',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      )}
      {children}
    </span>
  );
}
