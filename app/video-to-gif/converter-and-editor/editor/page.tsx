import React from 'react';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Dynamic import of the client-side Editor component
const DynamicEditor = dynamic(
  () => import('@/components/video-to-gif/Editor'),
  {
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-600">Loading Video to GIF Editor...</p>
        </div>
      </div>
    ),
    ssr: false, // Disable server-side rendering for this component
  }
);

export const metadata: Metadata = {
  title: 'Video to GIF Editor - Professional Online GIF Creator | GifMagic.app',
  description: 'Professional video to GIF editor with advanced features. Upload videos, convert to GIF, resize, crop, add text, optimize file size. No watermarks, completely free.',
  keywords: 'video to GIF editor, GIF creator, video converter, MP4 to GIF, online GIF editor, animated GIF maker',
};

export default function VideoToGifEditorPage() {
  return <DynamicEditor />;
}
