import dynamic from 'next/dynamic';
const RecordComponent = dynamic(() => import('@/app/components/recorder/RecordComponent'), {
  ssr: false,
});
const RecordPage = () => {
  return <RecordComponent />;
};
export default RecordPage;
