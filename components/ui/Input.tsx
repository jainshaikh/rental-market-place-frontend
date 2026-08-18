'use client';

import { forwardRef, useId } from 'react';
import { cn } from '../../lib/utils/cn';

interface FieldWrapperProps {
  label?: string;
  required?: boolean;
  helper?: string;
  error?: string;
  className?: string;
  children: (fieldId: string, describedBy: string | undefined) => React.ReactNode;
}

function FieldWrapper({ label, required, helper, error, className, children }: FieldWrapperProps) {
  const autoId = useId();
  const fieldId = autoId;
  const helperId = helper ? `${fieldId}-helper` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = errorId ?? helperId;

  return (
    <div className={className}>
      {label ? (
        <label htmlFor={fieldId} className="mb-2 block text-[13px] font-semibold text-slate-700">
          {label}
          {required ? <span className="ml-0.5 text-red-600">*</span> : null}
        </label>
      ) : null}
      {children(fieldId, describedBy)}
      {error ? (
        <p id={errorId} className="mt-[7px] flex items-center gap-1.5 text-[13px] text-red-700">
          {error}
        </p>
      ) : helper ? (
        <p id={helperId} className="mt-[7px] text-[13px] text-text-faint">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  helper?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, required, helper, error, wrapperClassName, className, id, ...props }, ref) => {
    return (
      <FieldWrapper label={label} required={required} helper={helper} error={error} className={wrapperClassName}>
        {(fieldId, describedBy) => (
          <input
            ref={ref}
            id={id ?? fieldId}
            aria-describedby={describedBy}
            aria-invalid={!!error}
            className={cn(
              'w-full rounded-control border bg-surface px-3.5 py-[11px] text-[15px] text-ink placeholder:text-text-faint outline-none transition-shadow',
              'focus:border-brand-600 focus:ring-[3px] focus:ring-brand-600/18',
              'disabled:cursor-not-allowed disabled:bg-page disabled:text-text-faint',
              error ? 'border-red-600' : 'border-border-strong',
              className,
            )}
            {...props}
          />
        )}
      </FieldWrapper>
    );
  },
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  helper?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, required, helper, error, wrapperClassName, className, id, rows = 4, ...props }, ref) => {
    return (
      <FieldWrapper label={label} required={required} helper={helper} error={error} className={wrapperClassName}>
        {(fieldId, describedBy) => (
          <textarea
            ref={ref}
            id={id ?? fieldId}
            rows={rows}
            aria-describedby={describedBy}
            aria-invalid={!!error}
            className={cn(
              'w-full resize-none rounded-control border bg-surface px-3.5 py-[11px] text-[15px] leading-relaxed text-ink placeholder:text-text-faint outline-none transition-shadow',
              'focus:border-brand-600 focus:ring-[3px] focus:ring-brand-600/18',
              'disabled:cursor-not-allowed disabled:bg-page disabled:text-text-faint',
              error ? 'border-red-600' : 'border-border-strong',
              className,
            )}
            {...props}
          />
        )}
      </FieldWrapper>
    );
  },
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  helper?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, required, helper, error, wrapperClassName, className, id, children, ...props }, ref) => {
    return (
      <FieldWrapper label={label} required={required} helper={helper} error={error} className={wrapperClassName}>
        {(fieldId, describedBy) => (
          <select
            ref={ref}
            id={id ?? fieldId}
            aria-describedby={describedBy}
            aria-invalid={!!error}
            className={cn(
              'w-full appearance-none rounded-control border bg-surface bg-[length:16px] bg-[right_12px_center] bg-no-repeat px-3.5 py-[11px] text-[15px] text-ink outline-none transition-shadow',
              'focus:border-brand-600 focus:ring-[3px] focus:ring-brand-600/18',
              'disabled:cursor-not-allowed disabled:bg-page disabled:text-text-faint',
              error ? 'border-red-600' : 'border-border-strong',
              className,
            )}
            {...props}
          >
            {children}
          </select>
        )}
      </FieldWrapper>
    );
  },
);
Select.displayName = 'Select';
