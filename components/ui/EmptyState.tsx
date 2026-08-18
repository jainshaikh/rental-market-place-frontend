import type { LucideIcon } from 'lucide-react';
import { WifiOff } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void; variant?: 'primary' | 'secondary' };
  className?: string;
}

/** Named what's missing, why it matters, and gives exactly one way forward. */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('rounded-card border border-border-subtle bg-surface px-6 py-[34px] text-center', className)}>
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-card bg-surface-hover text-text-faint">
        <Icon className="h-[23px] w-[23px]" />
      </div>
      <div className="mb-[7px] text-base font-semibold text-ink">{title}</div>
      {description ? (
        <p className="mx-auto mb-5 max-w-[30ch] text-sm leading-relaxed text-text-muted">{description}</p>
      ) : null}
      {action ? (
        <Button variant={action.variant ?? 'primary'} size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  onBack?: () => void;
  className?: string;
}

export function ErrorState({
  title = "We couldn't load this",
  description = 'Something went wrong while fetching this page.',
  onRetry,
  onBack,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('rounded-card border border-border-subtle bg-surface px-6 py-[34px] text-center', className)}>
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-card bg-status-red-bg text-red-600">
        <WifiOff className="h-[23px] w-[23px]" />
      </div>
      <div className="mb-[7px] text-base font-semibold text-ink">{title}</div>
      <p className="mx-auto mb-5 max-w-[30ch] text-sm leading-relaxed text-text-muted">{description}</p>
      <div className="flex justify-center gap-2.5">
        {onRetry ? (
          <Button variant="primary" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
        {onBack ? (
          <Button variant="secondary" onClick={onBack}>
            Go back
          </Button>
        ) : null}
      </div>
    </div>
  );
}
