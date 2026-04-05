'use client';
import { cn } from '@/lib/utils';
import { AnimatedBeam } from '@/components/magicui/animated-beam';
import React, { forwardRef, useRef } from 'react';
import { Film, ImageIcon, FileImage, Wand2, Sparkles } from 'lucide-react';

const Node = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode; label?: string }
>(({ className, children, label }, ref) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={ref}
        className={cn(
          'z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-900',
          className,
        )}
      >
        {children}
      </div>
      {label && (
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      )}
    </div>
  );
});
Node.displayName = 'Node';

export default function AnimatedBeamDemo({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);
  const gifInputRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  return (
    /* No card — transparent, no border */
    <div
      className={cn('relative flex w-full max-w-3xl items-center justify-center py-6', className)}
      ref={containerRef}
    >
      <div className="flex h-full w-full flex-row items-center justify-center gap-20">

        {/* Left column: inputs */}
        <div className="flex flex-col items-center gap-8">
          <Node ref={videoRef} label="Video">
            <Film className="h-6 w-6 text-pink-500" />
          </Node>
          <Node ref={imagesRef} label="Images">
            <ImageIcon className="h-6 w-6 text-purple-500" />
          </Node>
          <Node ref={gifInputRef} label="GIF / APNG">
            <FileImage className="h-6 w-6 text-blue-500" />
          </Node>
        </div>

        {/* Center column: GIF Creator/Editor hub */}
        <Node
          ref={editorRef}
          label="GIF Creator / Editor"
          className="h-20 w-20 rounded-3xl border-pink-200 bg-gradient-to-br from-pink-50 to-cyan-50 dark:border-pink-800/60 dark:from-pink-950/40 dark:to-cyan-950/40"
        >
          <Wand2 className="h-9 w-9 text-pink-500" />
        </Node>

        {/* Right column: GIF output — aligned to middle of left column (Images) */}
        <Node
          ref={outputRef}
          label="GIF / WebP / APNG"
          className="h-16 w-16 rounded-2xl border-pink-200 bg-gradient-to-br from-pink-50 to-fuchsia-50 shadow-lg dark:border-pink-800/60 dark:from-pink-950/40 dark:to-fuchsia-950/40"
        >
          <Sparkles className="h-7 w-7 text-pink-500" />
        </Node>

      </div>

      {/* Input beams: left column → GIF Creator/Editor */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={videoRef}
        toRef={editorRef}
        curvature={-40}
        gradientStartColor="#ff2975"
        gradientStopColor="#a855f7"
        pathColor="#f9a8d4"
        pathWidth={1.5}
        pathOpacity={0.4}
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={imagesRef}
        toRef={editorRef}
        gradientStartColor="#a855f7"
        gradientStopColor="#3b82f6"
        pathColor="#d8b4fe"
        pathWidth={1.5}
        pathOpacity={0.4}
        duration={3.5}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={gifInputRef}
        toRef={editorRef}
        curvature={40}
        gradientStartColor="#3b82f6"
        gradientStopColor="#00FFF1"
        pathColor="#93c5fd"
        pathWidth={1.5}
        pathOpacity={0.4}
        duration={4}
      />

      {/* GIF Creator/Editor → GIF output (horizontal, right side) */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={editorRef}
        toRef={outputRef}
        gradientStartColor="#ff2975"
        gradientStopColor="#a855f7"
        pathColor="#f9a8d4"
        pathWidth={2}
        pathOpacity={0.55}
        duration={2.5}
      />
    </div>
  );
}
