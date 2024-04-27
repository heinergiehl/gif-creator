'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import Script from 'next/script';
const DynmaicEditor = dynamic(() => import('@/components/video-to-gif/Editor'), {
  ssr: false,
});
export default function ConverterAndEditor() {
  return (
    <>
      <DynmaicEditor />
    </>
  );
}
