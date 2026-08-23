'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLS = { sm: 'h-3.5 w-3.5', md: 'h-5 w-5', lg: 'h-7 w-7' };

// Read-only when onChange is omitted; interactive (click + hover preview) when provided.
export function RatingStars({ value, onChange, size = 'md', className }: RatingStarsProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const interactive = !!onChange;
  const display = hovered ?? value;

  return (
    <div
      className={cn('inline-flex items-center gap-0.5', className)}
      onMouseLeave={() => interactive && setHovered(null)}
      role={interactive ? 'radiogroup' : undefined}
      aria-label={interactive ? 'Rating' : `Rated ${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => interactive && setHovered(n)}
          className={cn(
            interactive ? 'cursor-pointer' : 'cursor-default',
            'disabled:cursor-default',
          )}
          aria-label={interactive ? `Rate ${n} out of 5` : undefined}
        >
          <Star
            className={cn(
              SIZE_CLS[size],
              n <= display ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-border-strong',
            )}
          />
        </button>
      ))}
    </div>
  );
}

interface RatingBadgeProps {
  average: number | null;
  count: number;
  size?: 'sm' | 'md';
  className?: string;
}

// Compact "★ 4.8 (23)" summary for cards/headers — falls back to "No ratings yet".
export function RatingBadge({ average, count, size = 'md', className }: RatingBadgeProps) {
  if (!count || average === null) {
    return <span className={cn('text-text-faint', size === 'sm' ? 'text-xs' : 'text-sm', className)}>No ratings yet</span>;
  }
  return (
    <span className={cn('inline-flex items-center gap-1', size === 'sm' ? 'text-xs' : 'text-sm', className)}>
      <Star className={cn(size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4', 'fill-amber-400 text-amber-400')} />
      <span className="font-semibold text-ink">{average.toFixed(1)}</span>
      <span className="text-text-muted">({count})</span>
    </span>
  );
}
