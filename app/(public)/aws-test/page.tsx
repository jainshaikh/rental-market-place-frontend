'use client';

import { useState } from 'react';
import { ImageUpload } from '../../../components/uploads/ImageUpload';
import { mediaApi } from '../../../lib/api/media.api';
import { toast } from 'sonner';

// Temporary page to verify the AWS S3 storage adapter end-to-end through the real
// upload API (STORAGE_PROVIDER=s3 in the backend .env). Safe to delete once confirmed.
export default function AwsTestPage() {
  const [result, setResult] = useState<{ url: string; publicId: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!result) return;
    setDeleting(true);
    try {
      await mediaApi.delete(result.publicId);
      toast.success('Deleted from S3');
      setResult(null);
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-xl font-semibold">AWS S3 upload test</h1>
      <p className="mb-6 text-sm text-slate-500">
        Uploads through the real <code>/media/upload</code> endpoint. You must be logged in.
      </p>

      <ImageUpload
        context="vehicle"
        label="Test image"
        onUploaded={(url, publicId) => {
          if (url) setResult({ url, publicId });
        }}
      />

      {result && (
        <div className="mt-6 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs">
          <p className="break-all">
            <span className="font-medium">URL:</span> {result.url}
          </p>
          <p className="break-all">
            <span className="font-medium">Key:</span> {result.publicId}
          </p>
          <a href={result.url} target="_blank" rel="noreferrer" className="text-primary underline">
            Open in new tab (confirms public read access)
          </a>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="block text-destructive underline disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete from S3'}
          </button>
        </div>
      )}
    </div>
  );
}
