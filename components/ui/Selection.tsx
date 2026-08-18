'use client';

import type { LucideIcon } from 'lucide-react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}

export function Checkbox({ checked, onChange, label, className }: CheckboxProps) {
  return (
    <label className={cn('flex cursor-pointer items-center gap-[11px]', className)}>
      <span
        className={cn(
          'flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[5px] border transition-colors',
          checked ? 'border-brand-600 bg-brand-600 text-white' : 'border-border-strong bg-surface',
        )}
      >
        {checked ? <Check className="h-[13px] w-[13px]" /> : null}
      </span>
      <span className="text-[15px] text-ink">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
    </label>
  );
}

interface PillToggleProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

/** Filter chips — transmission/fuel type pill-toggle buttons. */
export function PillToggle({ active, onClick, children, className }: PillToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-chip border px-3.5 py-2 text-[13px] font-medium transition-colors',
        active
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-border-strong bg-surface text-slate-600 hover:border-brand-600',
        className,
      )}
    >
      {children}
    </button>
  );
}

interface RadioCardProps {
  selected: boolean;
  onClick: () => void;
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

/** The "I want to" role-select card — big selectable card with icon + radio dot. */
export function RadioCard({ selected, onClick, icon: Icon, title, description, className }: RadioCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-card border p-[15px] text-left transition-colors',
        selected ? 'border-brand-600 bg-brand-50' : 'border-border-subtle bg-surface hover:border-border-strong',
        className,
      )}
    >
      <div className="mb-[11px] flex items-center justify-between">
        <Icon className={cn('h-[19px] w-[19px]', selected ? 'text-brand-600' : 'text-text-muted')} />
        <span
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded-full border',
            selected ? 'border-brand-600' : 'border-border-strong',
          )}
        >
          {selected ? <span className="h-2 w-2 rounded-full bg-brand-600" /> : null}
        </span>
      </div>
      <div className={cn('mb-[5px] text-sm font-semibold', selected ? 'text-brand-800' : 'text-ink')}>{title}</div>
      <div className={cn('text-xs leading-relaxed', selected ? 'text-brand-700' : 'text-text-muted')}>
        {description}
      </div>
    </button>
  );
}
