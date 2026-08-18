'use client';

import { useRef, useState } from 'react';
import { useUpload } from '../../hooks/useUpload';
import { DOCUMENT_TYPES } from '../../lib/api/media.api';
import { StatusBadge } from '../common/StatusBadge';
import { cn } from '../../lib/utils/cn';
import type { UploadedDocument } from '../../lib/api/providers.api';

interface DocumentUploadProps {
  existingDocuments: UploadedDocument[];
  onUploaded: (doc: { id: string; url: string; documentType: string }) => void;
  className?: string;
}

export function DocumentUpload({ existingDocuments, onUploaded, className }: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState(DOCUMENT_TYPES[0].value);
  const { uploading, progress, upload } = useUpload('document');

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await upload(file, selectedType);
    if (result) {
      onUploaded({ id: '', url: result.url, documentType: selectedType });
    }

    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Existing documents */}
      {existingDocuments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Uploaded documents</p>
          {existingDocuments.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <svg className="h-5 w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {DOCUMENT_TYPES.find((t) => t.value === doc.documentType)?.label ?? doc.documentType}
                  </p>
                  {doc.rejectionReason && (
                    <p className="text-xs text-destructive mt-0.5">{doc.rejectionReason}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <StatusBadge status={doc.status} size="sm" />
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload new document */}
      <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5">
        <p className="text-sm font-medium text-slate-700 mb-3">Upload a document</p>

        {/* Document type select */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as typeof selectedType)}
          disabled={uploading}
          className="w-full mb-3 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary bg-white disabled:opacity-50"
        >
          {DOCUMENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Uploading… {progress}%
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Choose file to upload
            </>
          )}
        </button>

        <p className="mt-1.5 text-xs text-slate-400">
          PDF, JPG or PNG · Max 10MB per file
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          onChange={handleChange}
          className="sr-only"
        />
      </div>
    </div>
  );
}
