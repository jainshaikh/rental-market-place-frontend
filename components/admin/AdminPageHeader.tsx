import { cn } from '../../lib/utils/cn';

interface AdminPageHeaderProps {
  title: string;
  /** Falls back to `fallback` while the count is still loading. */
  subtitle?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  className?: string;
}

/** Every admin page repeated the same h1 + subtitle block with slightly
 * different sizes. This is the one version. */
export function AdminPageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-4', className)}>
      <div>
        {eyebrow && (
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-bold tracking-[-0.035em] text-ink">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-shrink-0 items-center gap-2.5">{actions}</div>}
    </div>
  );
}
