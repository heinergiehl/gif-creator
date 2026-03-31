'use client';

import { CanvasProvider } from '@/app/components/canvas/canvasContext';
import dynamic from 'next/dynamic';
const RecordComponent = dynamic(() => import('@/app/components/recorder/RecordComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-[#0d0d14] text-sm text-slate-500">
      Loading screen recorder…
    </div>
  ),
});
const RecordPage = () => {
  return (
    <CanvasProvider>
      <RecordComponent />
    </CanvasProvider>
  );
};
export default RecordPage;
