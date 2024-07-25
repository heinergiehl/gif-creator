import { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Free Video to GIF Converter and Editor',
  description:
    'Convert videos to GIFs, and edit them. This means you can add other elemens to the GIF, like text, images, and more.',
  keywords: 'video, gif, converter, editor, free',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="touch-none">{children}</div>;
}
