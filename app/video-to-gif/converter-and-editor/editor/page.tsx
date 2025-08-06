'use client';
import React from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for the editor component (client-side only)
const DynamicEditor = dynamic(() => import('@/components/video-to-gif/Editor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  ),
});

export default function VideoToGifEditorPage() {
  return <DynamicEditor />;
}
