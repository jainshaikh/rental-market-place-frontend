'use client';

import { cn } from '../../lib/utils/cn';
import { Pagination } from '../ui';

/** Shared admin table shell. Five admin pages had five copies of this markup
 * with drifting padding, header casing, and pagination footers. */
export function AdminTable({
  columns,
  children,
  busy,
  className,
}: {
  columns: (string | { label: string; align?: 'left' | 'right' })[];
  children: React.ReactNode;
  busy?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('overflow-hidden rounded-card border border-border-subtle bg-surface shadow-xs', className)}>
      <div className={cn('overflow-x-auto', busy && 'opacity-70 transition-opacity')}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-page text-left">
              {columns.map((col, i) => {
                const label = typeof col === 'string' ? col : col.label;
                const align = typeof col === 'string' ? 'left' : (col.align ?? 'left');
                return (
                  <th
                    key={i}
                    className={cn(
                      'px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-text-faint',
                      align === 'right' && 'text-right',
                    )}
                  >
                    {label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

/** Clickable row. Cells that contain their own controls should stop propagation. */
export function AdminRow({
  onOpen,
  children,
}: {
  onOpen?: () => void;
  children: React.ReactNode;
}) {
  return (
    <tr
      onClick={onOpen}
      className={cn(
        'transition-colors hover:bg-surface-hover',
        onOpen && 'cursor-pointer',
      )}
    >
      {children}
    </tr>
  );
}

export function AdminEmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-14 text-center text-sm text-text-faint">
        {children}
      </td>
    </tr>
  );
}

export function AdminSkeletonRows({ rows = 6, colSpan }: { rows?: number; colSpan: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          <td colSpan={colSpan} className="px-4 py-3">
            <div className="h-10 animate-pulse rounded-control bg-page" />
          </td>
        </tr>
      ))}
    </>
  );
}

/** "Showing 1–20 of 412" + shared Pagination. Replaces four bespoke footers. */
export function AdminTableFooter({
  page,
  totalPages,
  total,
  perPage = 20,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  perPage?: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
      <p className="font-mono text-xs text-text-faint">
        {from.toLocaleString()}–{to.toLocaleString()} of {total.toLocaleString()}
      </p>
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}

/** Segmented status filter. Was duplicated in vehicles, trips, user-vehicles. */
export function StatusTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-control border border-border-subtle bg-surface p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'whitespace-nowrap rounded-[8px] px-3 py-1.5 text-xs font-semibold transition-all duration-200',
            value === tab.value
              ? 'bg-brand text-white shadow-coral'
              : 'text-text-muted hover:bg-surface-hover hover:text-ink',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
