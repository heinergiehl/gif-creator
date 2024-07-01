import { CanvasProvider } from '@/app/components/canvas/canvasContext';
import dynamic from 'next/dynamic';
const RecordComponent = dynamic(() => import('@/app/components/recorder/RecordComponent'), {
  ssr: false,
});
const RecordPage = () => {
  return (
    <CanvasProvider>
      <RecordComponent />
    </CanvasProvider>
  );
};
export default RecordPage;
