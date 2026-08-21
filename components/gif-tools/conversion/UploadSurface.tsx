'use client';

import * as React from 'react';
import { FileImage, LoaderCircle, LockKeyhole, TriangleAlert, Upload } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UploadSurfaceProps {
  accept: string;
  formatLabel: string;
  title: string;
  description: string;
  busy: boolean;
  busyLabel?: string;
  errorMessage?: string;
  onFile: (file: File) => void;
  onExample: () => void;
}

export function UploadSurface({
  accept,
  formatLabel,
  title,
  description,
  busy,
  busyLabel = 'Reading file…',
  errorMessage,
  onFile,
  onExample,
}: UploadSurfaceProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const errorRef = React.useRef<HTMLDivElement>(null);
  const [dragActive, setDragActive] = React.useState(false);

  React.useEffect(() => {
    if (errorMessage) errorRef.current?.focus();
  }, [errorMessage]);

  const openPicker = () => {
    if (!inputRef.current || busy) return;
    inputRef.current.value = '';
    inputRef.current.click();
  };

  return (
    <div
      className={cn(
        'flex min-h-[500px] items-center justify-center px-5 py-14 transition-colors sm:px-10',
        dragActive && 'bg-blue-50 dark:bg-blue-950/20',
      )}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!busy) setDragActive(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        if (event.currentTarget === event.target) setDragActive(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragActive(false);
        if (busy) return;
        const file = event.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        aria-label={`Choose a ${formatLabel} file`}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
        }}
      />

      <div className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-400">
          {busy ? (
            <LoaderCircle className="h-6 w-6 animate-spin motion-reduce:animate-none" />
          ) : (
            <Upload className="h-6 w-6" />
          )}
        </div>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
          {busy ? busyLabel : title}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
          {description}
        </p>

        <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button
            type="button"
            size="lg"
            className="h-12 bg-blue-600 px-6 text-white hover:bg-blue-500"
            onClick={openPicker}
            disabled={busy}
          >
            <FileImage className="mr-2 h-4 w-4" />
            Choose {formatLabel}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="h-12"
            onClick={onExample}
            disabled={busy}
          >
            Try example
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <LockKeyhole className="h-3.5 w-3.5" />
            Processed in your browser
          </span>
          <span>{formatLabel} only</span>
          <span>Up to 50 MB</span>
        </div>

        {errorMessage ? (
          <Alert
            ref={errorRef}
            tabIndex={-1}
            variant="destructive"
            className="mt-7 text-left outline-none"
          >
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Could not open that file</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}
      </div>
    </div>
  );
}
