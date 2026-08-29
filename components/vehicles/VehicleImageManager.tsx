'use client';

import { useRef, useState } from 'react';
import { cn } from '../../lib/utils/cn';
import { useUpload } from '../../hooks/useUpload';
import { useAddVehicleImage, useRemoveVehicleImage, useReorderVehicleImages } from '../../hooks/useVehicles';
import type { VehicleImageFull } from '../../types/api.types';

interface VehicleImageManagerProps {
  vehicleId: string;
  images: VehicleImageFull[];
  className?: string;
}

export function VehicleImageManager({ vehicleId, images, className }: VehicleImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploading, progress, upload } = useUpload('vehicle');
  const addImage = useAddVehicleImage(vehicleId);
  const removeImage = useRemoveVehicleImage(vehicleId);
  const reorderImages = useReorderVehicleImages(vehicleId);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Passing vehicleId lets the backend build a descriptive filename
    // (make-model-year) and apply the KerayeGo watermark — both need to know
    // which vehicle this photo belongs to at upload time, not just when it's
    // attached afterward.
    const result = await upload(file, undefined, vehicleId);
    if (result) {
      await addImage.mutateAsync({
        url: result.url,
        publicId: result.publicId,
      });
    }

    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDragStart = (id: string) => setDraggingId(id);
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };
  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }

    const currentOrder = [...images].sort((a, b) => a.sortOrder - b.sortOrder).map((i) => i.id);
    const fromIdx = currentOrder.indexOf(draggingId);
    const toIdx = currentOrder.indexOf(targetId);

    if (fromIdx === -1 || toIdx === -1) return;

    const reordered = [...currentOrder];
    reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, draggingId);

    setDraggingId(null);
    setDragOverId(null);

    await reorderImages.mutateAsync(reordered);
  };
  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
  };

  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const canUpload = images.length < 10 && !uploading;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700">Vehicle Photos</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {images.length}/10 photos · First photo is the cover · Drag to reorder
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={!canUpload}
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              {progress}%
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 4v16m8-8H4" />
              </svg>
              Add photo
            </>
          )}
        </button>
      </div>

      {/* Image grid */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {sorted.map((img, idx) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => handleDragStart(img.id)}
              onDragOver={(e) => handleDragOver(e, img.id)}
              onDrop={(e) => handleDrop(e, img.id)}
              onDragEnd={handleDragEnd}
              className={cn(
                'relative group aspect-[4/3] rounded-lg overflow-hidden border-2 cursor-grab active:cursor-grabbing transition-all',
                idx === 0 ? 'border-primary' : 'border-transparent',
                dragOverId === img.id && draggingId !== img.id ? 'scale-105 border-blue-400' : '',
                draggingId === img.id ? 'opacity-40' : '',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.altText ?? `Vehicle photo ${idx + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Cover badge */}
              {idx === 0 && (
                <span className="absolute top-1.5 left-1.5 bg-primary text-white text-xs font-medium px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeImage.mutate(img.id)}
                disabled={removeImage.isPending}
                className="absolute top-1.5 right-1.5 h-6 w-6 bg-black/60 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove photo"
              >
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {/* Add slot */}
          {canUpload && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-[4/3] rounded-lg border-2 border-dashed border-slate-300 hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-primary transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs font-medium">Add photo</span>
            </button>
          )}
        </div>
      ) : (
        /* Empty state */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full rounded-xl border-2 border-dashed border-slate-300 hover:border-primary hover:bg-primary/5 p-8 flex flex-col items-center gap-3 text-slate-400 hover:text-primary transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
          <div className="text-center">
            <p className="text-sm font-medium">Upload vehicle photos</p>
            <p className="text-xs mt-0.5">JPG or PNG · Max 5 MB · Up to 10 photos</p>
          </div>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="sr-only"
      />
    </div>
  );
}
