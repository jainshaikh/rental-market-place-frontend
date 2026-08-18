'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useUpload } from '../../hooks/useUpload';
import type { UploadContext } from '../../lib/api/media.api';
import { cn } from '../../lib/utils/cn';

interface ImageUploadProps {
  context: UploadContext;
  currentUrl?: string | null;
  onUploaded: (url: string, publicId: string) => void;
  label?: string;
  aspectRatio?: 'square' | 'wide' | 'banner';
  className?: string;
}

const ASPECT_CLASSES = {
  square: 'aspect-square',
  wide:   'aspect-video',
  banner: 'aspect-[3/1]',
};

export function ImageUpload({
  context,
  currentUrl,
  onUploaded,
  label = 'Upload image',
  aspectRatio = 'square',
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const { uploading, progress, upload } = useUpload(context);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    const result = await upload(file);
    if (result) {
      onUploaded(result.url, result.publicId);
      URL.revokeObjectURL(objectUrl);
      setPreview(result.url);
    } else {
      setPreview(currentUrl ?? null);
    }

    // Reset input so the same file can be re-selected if needed
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <p className="text-sm font-medium text-slate-700">{label}</p>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          'relative overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-primary hover:bg-primary/5 disabled:opacity-60',
          ASPECT_CLASSES[aspectRatio],
        )}
      >
        {preview ? (
          <Image
            src={preview}
            alt="Upload preview"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-slate-400 text-center">
              Click to upload<br />JPG, PNG or WebP · Max 5MB
            </span>
          </div>
        )}

        {/* Upload progress overlay */}
        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
            <div className="w-16 h-1.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="mt-2 text-white text-xs font-medium">{progress}%</span>
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="sr-only"
      />

      {preview && !uploading && (
        <button
          type="button"
          onClick={() => {
            setPreview(null);
            onUploaded('', '');
          }}
          className="text-xs text-slate-400 hover:text-destructive self-start"
        >
          Remove image
        </button>
      )}
    </div>
  );
}
