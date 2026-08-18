'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Loader2, Plus, X } from 'lucide-react';
import { useUpload } from '../../hooks/useUpload';
import type { UserVehicleImageInput } from '../../lib/api/user-vehicles.api';

const MAX_PHOTOS = 6;

interface VehiclePhotosFieldProps {
  entityId: string; // client-generated vehicle id — groups uploads into one S3 folder
  images: UserVehicleImageInput[];
  onChange: (images: UserVehicleImageInput[]) => void;
}

// First image is the poster/cover shown as the card thumbnail and trip detail hero.
export function VehiclePhotosField({ entityId, images, onChange }: VehiclePhotosFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploading, progress, upload } = useUpload('user_vehicle_photo');

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await upload(file, undefined, entityId);
    if (result) onChange([...images, result]);

    if (inputRef.current) inputRef.current.value = '';
  };

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Vehicle photos</label>
      <p className="mb-2.5 text-xs text-text-faint">First photo is the poster shown on trip cards.</p>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((image, index) => (
          <div key={image.publicId} className="relative aspect-square overflow-hidden rounded-media border border-border-subtle">
            <Image src={image.url} alt="" fill className="object-cover" sizes="150px" />
            {index === 0 && (
              <span className="absolute left-1 top-1 rounded-chip bg-ink/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                Poster
              </span>
            )}
            <button
              type="button"
              onClick={() => removeAt(index)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-white hover:bg-ink/90"
              aria-label="Remove photo"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {images.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-media border-2 border-dashed border-border-strong text-text-faint transition-colors hover:border-brand-600 hover:text-brand-600 disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
                <span className="text-[10px]">{progress}%</span>
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                <span className="text-[10px]">Add photo</span>
              </>
            )}
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleChange} className="sr-only" />
    </div>
  );
}
