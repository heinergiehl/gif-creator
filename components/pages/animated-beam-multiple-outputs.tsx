'use client';
import { cn } from '@/lib/utils';
import { AnimatedBeam } from '@/components/magicui/animated-beam';
import React, { forwardRef, useRef } from 'react';
import { Film, ImageIcon, FileImage, Wand2 } from 'lucide-react';

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
  const gifOutputRef = useRef<HTMLDivElement>(null);
  const webpRef = useRef<HTMLDivElement>(null);
  const apngRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        'relative flex w-full max-w-3xl items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-10 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-950/80',
        className,
      )}
      ref={containerRef}
    >
      <div className="flex h-full w-full flex-row items-center justify-between gap-10">
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

        {/* Center hub: editor */}
        <Node
          ref={editorRef}
          label="GIF Creator"
          className="h-20 w-20 rounded-3xl border-pink-200 bg-gradient-to-br from-pink-50 to-cyan-50 dark:border-pink-800/60 dark:from-pink-950/40 dark:to-cyan-950/40"
        >
          <Wand2 className="h-9 w-9 text-pink-500" />
        </Node>

        {/* Right column: outputs */}
        <div className="flex flex-col items-center gap-8">
          <Node ref={gifOutputRef} label=".gif">
            <span className="text-sm font-bold text-pink-500">GIF</span>
          </Node>
          <Node ref={webpRef} label=".webp">
            <span className="text-sm font-bold text-teal-500">WebP</span>
          </Node>
          <Node ref={apngRef} label=".apng">
            <span className="text-sm font-bold text-violet-500">APNG</span>
          </Node>
        </div>
      </div>

      {/* Input beams: left to center */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={videoRef}
        toRef={editorRef}
        curvature={-50}
        gradientStartColor="#ff2975"
        gradientStopColor="#a855f7"
        pathColor="gray"
        pathWidth={1.5}
        pathOpacity={0.15}
        duration={4}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={imagesRef}
        toRef={editorRef}
        gradientStartColor="#a855f7"
        gradientStopColor="#3b82f6"
        pathColor="gray"
        pathWidth={1.5}
        pathOpacity={0.15}
        duration={5}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={gifInputRef}
        toRef={editorRef}
        curvature={50}
        gradientStartColor="#3b82f6"
        gradientStopColor="#00FFF1"
        pathColor="gray"
        pathWidth={1.5}
        pathOpacity={0.15}
        duration={6}
      />

      {/* Output beams: center to right */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={editorRef}
        toRef={gifOutputRef}
        curvature={-50}
        reverse
        gradientStartColor="#00FFF1"
        gradientStopColor="#ff2975"
        pathColor="gray"
        pathWidth={1.5}
        pathOpacity={0.15}
        duration={4}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={editorRef}
        toRef={webpRef}
        reverse
        gradientStartColor="#00FFF1"
        gradientStopColor="#a855f7"
        pathColor="gray"
        pathWidth={1.5}
        pathOpacity={0.15}
        duration={5}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={editorRef}
        toRef={apngRef}
        curvature={50}
        reverse
        gradientStartColor="#00FFF1"
        gradientStopColor="#3b82f6"
        pathColor="gray"
        pathWidth={1.5}
        pathOpacity={0.15}
        duration={6}
      />
    </div>
  );
}
