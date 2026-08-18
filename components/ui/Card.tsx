import { forwardRef } from 'react';
import { cn } from '../../lib/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PADDING: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-7',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover, padding = 'md', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-card border border-border-subtle bg-surface shadow-xs',
        hover && 'transition-shadow hover:shadow-sm',
        PADDING[padding],
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';
