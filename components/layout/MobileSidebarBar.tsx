'use client';

import { useState, type ReactNode, type MouseEvent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Menu, X } from 'lucide-react';

interface MobileSidebarBarProps {
  brand: string;
  children: ReactNode;
}

/**
 * Mobile-only top bar (hidden md:up, where the real <aside> sidebar takes
 * over) that opens the same sidebar content in a left slide-in sheet. The
 * sidebar itself never has to know it's being rendered inside a drawer —
 * closing on navigation is handled here via event delegation on <a> clicks.
 */
export function MobileSidebarBar({ brand, children }: MobileSidebarBarProps) {
  const [open, setOpen] = useState(false);

  const handleContentClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('a')) setOpen(false);
  };

  return (
    <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border-subtle bg-surface px-4 py-3 md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-control text-ink transition-colors hover:bg-surface-hover"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <span className="text-[15px] font-semibold text-ink">{brand}</span>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 data-[state=open]:animate-fade-in" />
          <Dialog.Content
            className="fixed inset-y-0 left-0 z-50 h-full w-72 max-w-[80vw] overflow-y-auto focus:outline-none data-[state=open]:animate-slide-in-left"
            aria-describedby={undefined}
            onClick={handleContentClick}
          >
            <Dialog.Title className="sr-only">Navigation menu</Dialog.Title>
            <Dialog.Close
              className="absolute right-3 top-3 z-10 rounded-control bg-white/10 p-1.5 text-white transition-colors hover:bg-white/20"
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
            {children}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
