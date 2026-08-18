'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const tileCls =
  'flex h-9 w-9 items-center justify-center rounded-control border border-border-subtle bg-surface text-sm font-medium font-mono text-slate-700 transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40';

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <div className={cn('flex items-center justify-center gap-1.5', className)}>
      <button type="button" className={tileCls} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p, i) => (
        <div key={p} className="flex items-center gap-1.5">
          {i > 0 && p - pages[i - 1] > 1 ? <span className="px-1 text-sm text-text-faint">…</span> : null}
          <button
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              tileCls,
              p === page && 'border-brand-600 bg-brand-600 text-white hover:bg-brand-600',
            )}
          >
            {p}
          </button>
        </div>
      ))}
      <button
        type="button"
        className={tileCls}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
