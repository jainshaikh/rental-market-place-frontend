'use client';

import { cn } from '../../lib/utils/cn';

export interface TabOption {
  value: string;
  label: string;
  count?: number;
}

interface TabsProps {
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/** Underline tabs — page-level navigation (e.g. a profile's own sub-sections). */
export function UnderlineTabs({ options, value, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-6 border-b border-border-subtle', className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              '-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors',
              active ? 'border-brand-600 text-brand-600' : 'border-transparent text-text-muted hover:text-slate-700',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Segmented tabs — status filters (pill group on a grey track). */
export function SegmentedTabs({ options, value, onChange, className }: TabsProps) {
  return (
    <div className={cn('inline-flex w-fit gap-0.5 rounded-control bg-surface-hover p-1', className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex items-center gap-1.5 rounded-chip px-3.5 py-2 text-[13px] font-semibold transition-colors',
              active ? 'bg-surface text-ink shadow-xs' : 'text-text-muted hover:text-slate-700',
            )}
          >
            {opt.label}
            {typeof opt.count === 'number' ? (
              <span className={cn('text-[11px]', active ? 'text-text-muted' : 'text-text-faint')}>{opt.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
