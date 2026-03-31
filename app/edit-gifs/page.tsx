import Link from 'next/link';
import type { Metadata } from 'next';
import { LatestPostsSection } from '@/components/blog/LatestPostsSection';
import { SITE_BRAND, absoluteUrl } from '@/lib/site';
import { Footer } from '../components/ui/Footer';
import { NeonGradientCard } from '@/components/magicui/neon-gradient-card';
import { CTA } from '@/components/pages/CTA';

export const metadata: Metadata = {
  title: `Free Online GIF Editor - Create & Edit Animated GIFs | ${SITE_BRAND}`,
  description:
    'Create and edit animated GIFs online. Resize, crop, rotate, add text, adjust timing, and optimize file size — with clean exports and no watermarks.',
  keywords: 'GIF editor, online GIF editor, free GIF editor, create GIF, edit animated GIF, resize GIF, crop GIF, rotate GIF, GIF frame editor, optimize GIF size, add text to GIF, split GIF frames, animated image editor, GIF effects, frame-by-frame editor, compress GIF, GIF animation editor, GIF maker, animated GIF creator, no watermark GIF editor',
  alternates: { canonical: '/edit-gifs' },
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
            "name": `GIF Editor - ${SITE_BRAND}`,
            "url": absoluteUrl('/edit-gifs'),
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
            ],
            "author": {
              "@type": "Organization",
              "name": SITE_BRAND
            }
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
                    Free Online GIF Editor
                  </h1>
                </NeonGradientCard>
                <p className="max-w-6xl text-pretty px-4 py-6 text-center text-xl md:px-0">
                  Edit animated GIFs with a fast, browser-based editor. Resize, crop, rotate, add text, adjust timing, and optimize file size — then export a clean GIF with no watermark.
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

          <section className="w-full py-20 bg-white/5 dark:bg-black/10">
            <div className="container mx-auto px-4">
              <h2 className="pointer-events-none mb-12 whitespace-pre-wrap bg-gradient-to-b from-black to-gray-200/90 bg-clip-text text-center text-3xl font-bold leading-none text-transparent dark:from-white dark:to-slate-600/20 md:text-5xl">
                Create and Edit GIFs in Three Simple Steps
              </h2>
              <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
                <div className="rounded-lg border bg-white/10 p-6 text-center backdrop-blur-sm dark:bg-black/20">
                  <div className="mb-4 inline-block rounded-full bg-gradient-to-br from-[#ff2975] to-[#00FFF1] p-3 text-2xl font-bold text-white">1</div>
                  <h3 className="mb-3 text-xl font-bold">Upload Your Media</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Easily upload a GIF, video, or a series of images. Our editor supports all major formats and is optimized for a smooth workflow.
                  </p>
                </div>
                <div className="rounded-lg border bg-white/10 p-6 text-center backdrop-blur-sm dark:bg-black/20">
                  <div className="mb-4 inline-block rounded-full bg-gradient-to-br from-[#ff2975] to-[#00FFF1] p-3 text-2xl font-bold text-white">2</div>
                  <h3 className="mb-3 text-xl font-bold">Edit and Enhance</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Use our powerful tools to bring your vision to life. Resize, crop, add text, apply filters, and edit frame-by-frame with precision.
                  </p>
                </div>
                <div className="rounded-lg border bg-white/10 p-6 text-center backdrop-blur-sm dark:bg-black/20">
                  <div className="mb-4 inline-block rounded-full bg-gradient-to-br from-[#ff2975] to-[#00FFF1] p-3 text-2xl font-bold text-white">3</div>
                  <h3 className="mb-3 text-xl font-bold">Download and Share</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Preview your creation and download the high-quality, optimized GIF. No watermarks, ever. Share your masterpiece with the world.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="w-full py-20">
            <div className="container mx-auto px-4">
              <h2 className="pointer-events-none mb-12 whitespace-pre-wrap bg-gradient-to-b from-black to-gray-200/90 bg-clip-text text-center text-3xl font-bold leading-none text-transparent dark:from-white dark:to-slate-600/20 md:text-5xl">
                Why Choose Our GIF Editor?
              </h2>
              <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border bg-white/5 p-6 backdrop-blur-sm dark:bg-black/20">
                  <h3 className="mb-3 text-lg font-semibold">Comprehensive Toolset</h3>
                  <p className="text-gray-600 dark:text-gray-300">From basic resizing to advanced frame-by-frame editing, we have all the tools you need.</p>
                </div>
                <div className="rounded-lg border bg-white/5 p-6 backdrop-blur-sm dark:bg-black/20">
                  <h3 className="mb-3 text-lg font-semibold">User-Friendly Interface</h3>
                  <p className="text-gray-600 dark:text-gray-300">Our intuitive editor is powerful for professionals yet easy for beginners to master.</p>
                </div>
                <div className="rounded-lg border bg-white/5 p-6 backdrop-blur-sm dark:bg-black/20">
                  <h3 className="mb-3 text-lg font-semibold">High-Quality Output</h3>
                  <p className="text-gray-600 dark:text-gray-300">Create stunning, high-quality GIFs optimized for the web without sacrificing quality.</p>
                </div>
                <div className="rounded-lg border bg-white/5 p-6 backdrop-blur-sm dark:bg-black/20">
                  <h3 className="mb-3 text-lg font-semibold">Privacy-Focused</h3>
                  <p className="text-gray-600 dark:text-gray-300">All processing is done in your browser. Your files are never uploaded to our servers.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="w-full py-20 bg-white/5 dark:bg-black/10">
            <div className="container mx-auto px-4">
              <h2 className="pointer-events-none mb-8 whitespace-pre-wrap bg-gradient-to-b from-black to-gray-200/90 bg-clip-text text-center text-3xl font-bold leading-none text-transparent dark:from-white dark:to-slate-600/20 md:text-5xl">
                Frequently Asked Questions
              </h2>
              <div className="mx-auto max-w-4xl space-y-6">
                <div className="rounded-lg border bg-white/10 p-6 backdrop-blur-sm dark:bg-black/20">
                  <h3 className="mb-3 text-lg font-semibold">How do I create a GIF from a video?</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Simply upload your video file, select the segment you want to convert, make any desired edits, and export it as a high-quality animated GIF.
                  </p>
                </div>
                <div className="rounded-lg border bg-white/10 p-6 backdrop-blur-sm dark:bg-black/20">
                  <h3 className="mb-3 text-lg font-semibold">Can I add text to a GIF?</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Yes! Our editor allows you to add and customize text overlays with various fonts, colors, and animations to make your GIFs more engaging.
                  </p>
                </div>
                <div className="rounded-lg border bg-white/10 p-6 backdrop-blur-sm dark:bg-black/20">
                  <h3 className="mb-3 text-lg font-semibold">Is it possible to resize a GIF without losing quality?</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Our smart resizing algorithm minimizes quality loss. For best results, start with a high-resolution source and use our optimization tools to balance file size and quality.
                  </p>
                </div>
                <div className="rounded-lg border bg-white/10 p-6 backdrop-blur-sm dark:bg-black/20">
                  <h3 className="mb-3 text-lg font-semibold">Is this GIF editor free to use?</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Absolutely. All our GIF editing tools are completely free to use, with no watermarks or hidden costs. Enjoy unlimited access to all features.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <LatestPostsSection
            title="Editing, resizing, and optimization guides"
            description="Reinforce editing intent with supporting content that answers adjacent questions users search before and after opening the editor."
            postSlugs={[
              'how-to-edit-a-gif-without-losing-quality',
              'optimize-gif-size-without-losing-quality',
              'how-to-make-a-gif-from-a-video',
            ]}
          />

          <Footer />
        </div>
      </div>
    </>
  );
}
