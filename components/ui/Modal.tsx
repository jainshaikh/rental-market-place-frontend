'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/** General-purpose modal (action forms, status-change dialogs). For a plain
 * yes/no destructive confirmation, prefer ConfirmDialog instead. */
export function Modal({ open, onOpenChange, title, description, children, footer, className }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-sheet bg-surface shadow-lg focus:outline-none',
            className,
          )}
        >
          <div className="p-6 pb-5">
            <div className="mb-2 flex items-start justify-between gap-4">
              <Dialog.Title className="text-[19px] font-semibold leading-snug tracking-tight text-ink">
                {title}
              </Dialog.Title>
              <Dialog.Close className="rounded-control p-1 text-text-faint hover:bg-surface-hover hover:text-slate-600">
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>
            {description ? <p className="text-sm leading-relaxed text-text-muted">{description}</p> : null}
            {children ? <div className="mt-4">{children}</div> : null}
          </div>
          {footer ? (
            <div className="flex justify-end gap-2.5 border-t border-border-subtle bg-page px-6 py-[18px]">
              {footer}
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
