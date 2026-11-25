'use client';

import type { LucideIcon } from 'lucide-react';
import { CARD, FadeIn, Skeleton } from './ui';

export type Tone = 'sky' | 'emerald' | 'amber' | 'violet';

const TONES: Record<Tone, string> = {
  sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  loading,
  delay = 0,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone: Tone;
  loading: boolean;
  delay?: number;
}) {
  return (
    <FadeIn delay={delay}>
      <div className={CARD + ' p-5'}>
        <div className="flex items-start justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <span className={'flex h-10 w-10 items-center justify-center rounded-xl ' + TONES[tone]}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>
        {loading ? (
          <>
            <Skeleton className="mt-4 h-8 w-24" />
            <Skeleton className="mt-3 h-4 w-32" />
          </>
        ) : (
          <>
            <p className="mt-3 font-heading text-3xl font-semibold tracking-tight">{value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{hint ?? '\u00a0'}</p>
          </>
        )}
      </div>
    </FadeIn>
  );
}
