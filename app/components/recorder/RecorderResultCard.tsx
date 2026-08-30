'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Download, ArrowRight } from 'lucide-react';

interface RecorderResultCardProps {
  trimmedVideoUrl: string;
}

export function RecorderResultCard({
  trimmedVideoUrl,
}: RecorderResultCardProps) {
  if (!trimmedVideoUrl) return null;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
      <video
        controls
        src={trimmedVideoUrl}
        className="max-h-[65%] w-auto rounded-lg shadow-2xl shadow-black/50 ring-1 ring-white/10"
      />

      <div className="flex items-center gap-3">
        <a href={trimmedVideoUrl} download="recording.mp4">
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-500">
            <Download className="h-4 w-4" />
            Download MP4
          </Button>
        </a>
        <Link href="/video-to-gif/editor">
          <Button
            variant="outline"
            className="gap-2 border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06] hover:text-white"
          >
            Open GIF Editor
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
