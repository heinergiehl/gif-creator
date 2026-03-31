'use client';

import { useEffect, useState } from 'react';
import { ImageResourceClient } from './ImageResourceClient';
import { getImageResults } from './utils/getImageResults';
import { Loader2, SearchX } from 'lucide-react';

interface ImageSearchProps {
  query: string;
  imageType: string;
}

export const ImageSearchSuspended = ({ query, imageType }: ImageSearchProps) => {
  const [images, setImages] = useState<
    Array<{ id: string; webformatURL: string; previewWidth: number; previewHeight: number }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setImages([]);
      return;
    }

    let cancelled = false;
    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await getImageResults(query, imageType);
        if (!cancelled) setImages(results ?? []);
      } catch {
        if (!cancelled) setError('Failed to load images. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // Debounce so we don't fire on every keystroke
    const timer = setTimeout(fetchImages, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, imageType]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-sm text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Searching for &ldquo;{query}&rdquo;…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-sm text-red-500">
        <SearchX className="h-5 w-5" />
        <span>{error}</span>
      </div>
    );
  }

  if (images.length === 0 && query.trim()) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-sm text-slate-500">
        <SearchX className="h-5 w-5" />
        <span>No results for &ldquo;{query}&rdquo;</span>
      </div>
    );
  }

  return <ImageResourceClient images={images} />;
};
