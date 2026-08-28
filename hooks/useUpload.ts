'use client';

import { useState, useCallback } from 'react';
import { mediaApi, type UploadContext } from '../lib/api/media.api';
import { toast } from 'sonner';

export interface UploadState {
  uploading: boolean;
  progress: number;
  url: string | null;
  publicId: string | null;
  error: string | null;
}

export function useUpload(context: UploadContext) {
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    url: null,
    publicId: null,
    error: null,
  });

  const upload = useCallback(
    async (
      file: File,
      documentType?: string,
      entityId?: string,
    ): Promise<{ url: string; publicId: string; id?: string } | null> => {
      setState({ uploading: true, progress: 0, url: null, publicId: null, error: null });

      try {
        const result = await mediaApi.upload(file, context, documentType, entityId, (percent) => {
          setState((prev) => ({ ...prev, progress: percent }));
        });

        setState({
          uploading: false,
          progress: 100,
          url: result.url,
          publicId: result.publicId,
          error: null,
        });

        return { url: result.url, publicId: result.publicId, id: result.id };
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { error?: { message?: string } } } })
            ?.response?.data?.error?.message ?? 'Upload failed';

        setState({ uploading: false, progress: 0, url: null, publicId: null, error: message });
        toast.error(message);
        return null;
      }
    },
    [context],
  );

  const reset = useCallback(() => {
    setState({ uploading: false, progress: 0, url: null, publicId: null, error: null });
  }, []);

  return { ...state, upload, reset };
}
