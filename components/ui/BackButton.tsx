'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

interface BackButtonProps {
  label?: string;
  // Used when there's no real browser history to go back to (e.g. a direct
  // link/bookmark landed the user straight on this page) — router.back()
  // would otherwise silently do nothing.
  fallbackHref?: string;
  className?: string;
}

export function BackButton({ label = 'Back', fallbackHref = '/', className }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window !== 'undefined' && window.history.length > 2) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-1 text-sm font-medium text-text-muted transition-colors hover:text-ink',
        className,
      )}
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
