'use client';

import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

export const buttonVariants = cva(
  // transition-all (not transition-colors) is what lets the lift animate.
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control font-semibold ' +
    'transition-all duration-200 ease-spring ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-600 ' +
    'disabled:pointer-events-none disabled:opacity-45 disabled:translate-y-0 disabled:shadow-none',
  {
    variants: {
      variant: {
        primary:
          'bg-brand text-white shadow-coral hover:-translate-y-0.5 hover:shadow-coral-lg active:translate-y-0 active:scale-[0.98]',
        secondary:
          'bg-surface text-ink border border-border-strong hover:border-brand-600 hover:text-brand-700 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0',
        ghost: 'bg-transparent text-slate-700 hover:bg-surface-hover',
        link: 'bg-transparent text-brand-700 hover:bg-brand-50 px-3',
        danger:
          'bg-red-600 text-white hover:bg-red-700 hover:-translate-y-0.5 active:translate-y-0',
        'danger-outline':
          'bg-surface text-red-700 border border-status-red-border hover:bg-status-red-bg hover:-translate-y-0.5 active:translate-y-0',
        whatsapp:
          'bg-whatsapp text-white shadow-[0_10px_26px_rgba(37,211,102,0.32)] hover:bg-whatsapp-hover hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(37,211,102,0.40)] active:translate-y-0',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-[42px] px-5 text-sm',
        lg: 'h-[52px] px-7 text-[15px]',
        icon: 'h-[42px] w-[42px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
