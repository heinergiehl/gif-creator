import React from 'react';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import { Sidebar } from '@/components/video-to-gif/Sidebar';
const DynmaicEditor = dynamic(() => import('@/components/video-to-gif/Editor'), {
  ssr: false,
});
function page() {
  return (
    <>
      <DynmaicEditor />
    </>
  );
}
export default page;
