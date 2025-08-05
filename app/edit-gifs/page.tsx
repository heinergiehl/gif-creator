import { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '../components/ui/Footer';
import { NeonGradientCard } from '@/components/magicui/neon-gradient-card';
import { CTA } from '@/components/pages/CTA';

export const metadata: Metadata = {
  title: 'GIF Editor - Resize, Crop, Rotate & Optimize Animated GIFs | GifMagic.app',
  description:
    'Professional GIF editor with advanced tools. Resize animated GIFs, crop regions, rotate images, edit individual frames, add text overlays, optimize file size, split frames, and more. Free online GIF editing tools.',
  keywords: 'GIF editor, edit animated GIF, resize GIF, crop GIF, rotate GIF, GIF frame editor, optimize GIF size, add text to GIF, split GIF frames, animated image editor, GIF effects, frame-by-frame editor, compress GIF, GIF animation editor',
  alternates: { canonical: 'https://www.gifmagic.app/edit-gifs' },
};

const editingFeatures = [
  {
    icon: '🎨',
    title: 'Resize Animated GIFs',
    description: 'Resize your animated GIFs to any dimensions while maintaining quality. Perfect for social media, web use, or specific size requirements.',
  },
  {
    icon: '✂️',
    title: 'Crop GIF Regions',
    description: 'Crop specific regions of your animated GIFs. Select custom areas, use preset aspect ratios, or auto-crop transparent areas.',
  },
  {
    icon: '🔄',
    title: 'Rotate & Flip Animations',
    description: 'Rotate animated GIFs by any degree, flip horizontally or vertically. Correct orientation issues in your animated images.',
  },
  {
    icon: '🎯',
    title: 'Frame-by-Frame Editor',
    description: 'Edit individual frames of your GIF animation. Add, remove, reorder frames, and control timing for each frame.',
  },
  {
    icon: '📝',
    title: 'Add Text & Effects',
    description: 'Add text overlays, stickers, and visual effects to your animated GIFs. Customize fonts, colors, and positioning.',
  },
  {
    icon: '⚡',
    title: 'Optimize & Compress',
    description: 'Reduce GIF file size without losing quality. Optimize colors, frame rate, and compression for faster loading.',
  },
];

export default function EditGifs() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "GIF Editor - GifMagic.app",
            "url": "https://www.gifmagic.app/edit-gifs",
            "description": "Professional online GIF editor with advanced editing tools for animated images.",
            "applicationCategory": "ImageApplication",
            "featureList": [
              "Resize animated GIFs",
              "Crop GIF regions", 
              "Rotate animated images",
              "Frame-by-frame editing",
              "Add text to GIFs",
              "Optimize GIF file size",
              "Split GIF frames",
              "Animation speed control"
            ]
          })
        }}
      />
      <div className="relative z-40 h-full w-screen text-black dark:text-white md:w-full">
        <div
          className="absolute inset-0 z-[10] h-full w-full items-center px-5 py-24 opacity-100 
                   [background:radial-gradient(125%_125%_at_50%_50%,#fdfdfd_30%,#63e_100%)]
                   dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"
        ></div>
        <div
          className="absolute bottom-0 left-0 right-0 top-0 z-[20] h-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] 
              bg-[size:24px_24px] opacity-30 dark:bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)]
              dark:bg-[size:24px_24px] dark:opacity-100"
        ></div>
        <div className="relative z-40 flex w-full flex-col items-center justify-center opacity-100">
          <section className="mt-[100px] min-h-screen w-full">
            <div className="flex items-center justify-center">
              <div className="flex max-w-6xl flex-col items-center justify-center gap-x-2 px-4">
                <NeonGradientCard className="mt-[170px] flex items-center justify-center">
                  <h1 className="pointer-events-none z-10 w-full bg-gradient-to-br from-[#ff2975] from-35% to-[#00FFF1] bg-clip-text text-center text-7xl font-bold leading-none tracking-tighter text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
                    Professional GIF Editor
                  </h1>
                </NeonGradientCard>
                <p className="max-w-6xl text-pretty px-4 py-6 text-center text-xl md:px-0">
                  Advanced online GIF editor with professional tools. Resize animated GIFs, crop regions, rotate images, edit frames, add text, optimize file sizes, and more. All processing done locally for complete privacy.
                </p>
                <div className="mx-auto flex flex-col items-center justify-center space-x-4 space-y-8">
                  <CTA />
                </div>
              </div>
            </div>
          </section>

          <section className="z-[999] w-full py-20">
            <div className="container mx-auto px-4">
              <h2 className="pointer-events-none mb-16 whitespace-pre-wrap bg-gradient-to-b from-black to-gray-200/80 bg-clip-text text-center text-3xl font-bold leading-none text-transparent dark:from-white dark:to-slate-600/20 md:text-6xl">
                Advanced GIF Editing Tools
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {editingFeatures.map((feature, index) => (
                  <div key={index} className="rounded-lg border bg-white/5 p-6 backdrop-blur-sm dark:bg-black/20">
                    <div className="mb-4 text-4xl">{feature.icon}</div>
                    <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="w-full py-20">
            <div className="container mx-auto px-4">
              <h2 className="pointer-events-none mb-8 whitespace-pre-wrap bg-gradient-to-b from-black to-gray-200/90 bg-clip-text text-center text-3xl font-bold leading-none text-transparent dark:from-white dark:to-slate-600/20 md:text-5xl">
                How to Edit Your GIFs
              </h2>
              <div className="mx-auto max-w-4xl space-y-6">
                <div className="rounded-lg border bg-white/5 p-6 backdrop-blur-sm dark:bg-black/20">
                  <h3 className="mb-3 text-lg font-semibold">1. Upload Your Animated GIF</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Upload your GIF file or drag and drop it into the editor. We support various animated formats including GIF, WebP, and APNG.
                  </p>
                </div>
                <div className="rounded-lg border bg-white/5 p-6 backdrop-blur-sm dark:bg-black/20">
                  <h3 className="mb-3 text-lg font-semibold">2. Choose Your Editing Tools</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Select from our comprehensive editing tools: resize dimensions, crop regions, rotate orientation, edit individual frames, add text overlays, or optimize file size.
                  </p>
                </div>
                <div className="rounded-lg border bg-white/5 p-6 backdrop-blur-sm dark:bg-black/20">
                  <h3 className="mb-3 text-lg font-semibold">3. Preview and Download</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Preview your edited animated GIF in real-time, make final adjustments, and download your optimized result. No watermarks, completely free.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </div>
    </>
  );
}
