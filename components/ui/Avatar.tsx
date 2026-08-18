import { cn } from '../../lib/utils/cn';

interface AvatarProps {
  name: string;
  /** People are circles, businesses (providers) are rounded squares. */
  shape?: 'circle' | 'square';
  size?: 'sm' | 'md' | 'lg';
  tone?: 'brand' | 'neutral' | 'ink';
  className?: string;
}

const SIZE_CLS: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-10 w-10 text-sm',
  lg: 'h-11 w-11 text-[15px]',
};

const TONE_CLS: Record<NonNullable<AvatarProps['tone']>, string> = {
  brand: 'bg-brand-600 text-white',
  neutral: 'bg-surface-hover text-slate-600',
  ink: 'bg-ink text-white',
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, shape = 'circle', size = 'md', tone = 'neutral', className }: AvatarProps) {
  return (
    <span
      className={cn(
        'inline-flex flex-shrink-0 items-center justify-center font-semibold leading-none',
        shape === 'circle' ? 'rounded-full' : 'rounded-control',
        SIZE_CLS[size],
        TONE_CLS[tone],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
