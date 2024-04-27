import { Metadata } from 'next';
import React from 'react';
export const metadata: Metadata = {
  title: 'Edit GIFs for Free Online',
  description: 'Edit GIFs for free online. You can add text, images, and more to your GIFs.',
  keywords: 'gif, editor, free, online',
  alternates: {
    canonical: 'https://gifmagic.app/edit-gifs/converter-and-editor',
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
