'use client';

import { useEffect, useState } from 'react';
import { ImageResourceClient } from './ImageResourceClient';
import { getImageResults } from './utils/getImageResults';
import { Loader2, Search, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!query.trim()) {
      setImages([]);
      setError(null);
      setLoading(false);
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
  }, [query, imageType, retryKey]);

  if (!query.trim()) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
        <Search className="h-5 w-5" aria-hidden="true" />
        <span>Enter a search term to find optional images.</span>
      </div>
    );
  }

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
      <div
        className="flex flex-col items-center justify-center gap-3 py-10 text-center text-sm text-red-600 dark:text-red-400"
        role="alert"
      >
        <SearchX className="h-5 w-5" aria-hidden="true" />
        <span>{error} Your uploaded files are unaffected.</span>
        <Button type="button" variant="outline" size="sm" onClick={() => setRetryKey((key) => key + 1)}>
          Retry search
        </Button>
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
