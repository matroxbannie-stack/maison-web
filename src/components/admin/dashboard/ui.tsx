'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const CARD =
  'rounded-2xl border border-border bg-background shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_30px_-14px_rgba(0,0,0,0.10)]';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={'animate-pulse rounded-xl bg-muted ' + className} />;
}

export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400"
    >
      <span>{message}</span>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-red-500/10"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
