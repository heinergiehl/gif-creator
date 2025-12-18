'use client';

import React from 'react';
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

export default function VideoToGifEditorPage() {
  return <DynamicEditor />;
}
