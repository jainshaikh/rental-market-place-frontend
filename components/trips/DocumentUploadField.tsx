'use client';

import { useRef } from 'react';
import { AlertCircle, Check, Loader2, Upload } from 'lucide-react';
import { useUpload } from '../../hooks/useUpload';
import { cn } from '../../lib/utils/cn';

export interface UploadedDoc {
  url: string;
  publicId: string;
}

interface DocumentUploadFieldProps {
  label: string;
  hint?: string;
  value: UploadedDoc | null;
  onChange: (doc: UploadedDoc | null) => void;
  /** Required-field validation message (shown after a submit attempt). */
  error?: string;
  entityId?: string; // groups this upload into the owning vehicle's S3 folder
}

export function DocumentUploadField({ label, hint, value, onChange, error, entityId }: DocumentUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploading, progress, error: uploadError, upload, reset } = useUpload('trip_document');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await upload(file, undefined, entityId);
    if (result) onChange(result);

    if (inputRef.current) inputRef.current.value = '';
  };

  const retry = () => {
    reset();
    inputRef.current?.click();
  };

  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
        {label}
        <span className="ml-0.5 text-red-600">*</span>
      </label>
      {hint && <p className="mb-2 text-xs text-text-faint">{hint}</p>}

      {value ? (
        <div className="flex items-center justify-between rounded-control border border-status-emerald-border bg-status-emerald-bg px-3.5 py-2.5">
          <span className="flex items-center gap-2 text-sm font-medium text-status-emerald-fg">
            <Check className="h-4 w-4 flex-shrink-0" />
            Uploaded
          </span>
          <button type="button" onClick={() => onChange(null)} className="text-xs font-semibold text-text-muted hover:text-red-600">
            Replace
          </button>
        </div>
      ) : uploadError ? (
        <div className="flex items-center gap-3 rounded-control border border-status-red-border bg-status-red-bg px-3.5 py-2.5">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600" />
          <span className="flex-1 text-xs text-status-red-fg">{uploadError}</span>
          <button type="button" onClick={retry} className="flex-shrink-0 rounded-chip border border-status-red-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-status-red-fg hover:bg-surface-hover">
            Retry
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-control border-2 border-dashed px-3 py-3.5 text-sm text-text-muted transition-colors hover:border-brand-600 hover:bg-brand-50 hover:text-brand-600 disabled:opacity-60',
            error ? 'border-red-600' : 'border-border-strong',
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
              Uploading… {progress}%
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload photo
            </>
          )}
        </button>
      )}

      {error && <p className="mt-1.5 text-xs text-red-700">{error}</p>}

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleFileChange} className="sr-only" />
    </div>
  );
}
