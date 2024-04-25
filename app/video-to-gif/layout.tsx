import { Metadata } from 'next';
import React from 'react';
export const metadata: Metadata = {
  title: 'Free MP4 Video to GIF Converter and Editor',
  description:
    'Convert videos to GIFs, and edit them. This means you can add other elemens to the GIF, like text, images, and more.',
  keywords: 'video, gif, converter, editor, free',
};
function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
export default Layout;
