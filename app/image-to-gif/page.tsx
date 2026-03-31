import { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '../components/ui/Footer';
import { LatestPostsSection } from '@/components/blog/LatestPostsSection';
import { SITE_BRAND } from '@/lib/site';
export const metadata: Metadata = {
  title: `Image to GIF Converter - Create Animated GIFs from Photos | ${SITE_BRAND}`,
  description:
    'Free image to GIF converter. Turn JPG, PNG, WebP, and HEIC photos into animated GIFs. Arrange frames, add text, resize, crop, and optimize file size — no watermark.',
  keywords: 'image to GIF, photo to GIF, JPG to GIF, PNG to GIF, WebP to GIF, create animated GIF from images, image animation maker, photo GIF converter, animated image creator, free image to GIF converter',
  alternates: { canonical: '/image-to-gif' },
};
export default function ImageToGif() {
  return (
    <div>
      <main className="mt-16 font-sans">
        <section className="hero bg-base-200 text-center">
          <div className="hero-content">
            <div className="max-w-lg">
              <h1 className="text-5xl font-bold">Free Image to GIF Converter</h1>
              <p className="py-6">
                Turn photos into smooth, looping GIFs in minutes. Upload JPG, PNG, WebP, or HEIC images, arrange the order, set timing, add text, crop and resize, then export an optimized animated GIF. Free to use and watermark-free.
              </p>
              <Link href="/image-to-gif/converter-and-editor">
                <span className="btn btn-primary">Create Your GIF</span>
              </Link>
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-3xl font-bold">Make an Animated GIF from Images</h2>
            <p className="mb-10 text-lg">
              {SITE_BRAND} makes it easy to create an animated GIF from an image sequence. Upload your photos, adjust the timing, and export a lightweight GIF that’s ready for social media, websites, and messaging.
            </p>

            <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-3">
              <div className="rounded-lg border bg-white/5 p-6 backdrop-blur-sm dark:bg-black/20">
                <h3 className="mb-2 text-xl font-semibold">1. Upload photos</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Add JPG, PNG, WebP, or HEIC images and we’ll turn them into frames.
                </p>
              </div>
              <div className="rounded-lg border bg-white/5 p-6 backdrop-blur-sm dark:bg-black/20">
                <h3 className="mb-2 text-xl font-semibold">2. Arrange and edit</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Reorder frames, set duration, crop and resize, and add text for captions.
                </p>
              </div>
              <div className="rounded-lg border bg-white/5 p-6 backdrop-blur-sm dark:bg-black/20">
                <h3 className="mb-2 text-xl font-semibold">3. Export and share</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Download an optimized animated GIF — clean exports with no watermark.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-4xl px-4 text-left">
            <h2 className="mb-6 text-3xl font-bold text-center">Image to GIF FAQ</h2>
            <div className="space-y-6">
              <div className="rounded-lg border bg-white/5 p-6 backdrop-blur-sm dark:bg-black/20">
                <h3 className="mb-2 text-xl font-semibold">What image formats do you support?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  You can create GIFs from JPG, PNG, WebP, HEIC, and most common image formats. Upload a sequence and export a single animated GIF.
                </p>
              </div>
              <div className="rounded-lg border bg-white/5 p-6 backdrop-blur-sm dark:bg-black/20">
                <h3 className="mb-2 text-xl font-semibold">How do I control GIF speed?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Adjust the frame duration to speed up or slow down your animation. Shorter durations create a faster GIF; longer durations create a slower one.
                </p>
              </div>
              <div className="rounded-lg border bg-white/5 p-6 backdrop-blur-sm dark:bg-black/20">
                <h3 className="mb-2 text-xl font-semibold">How can I reduce GIF file size?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Resize dimensions, reduce the number of frames, or increase frame duration. Exporting an optimized size helps GIFs load faster on the web.
                </p>
              </div>
            </div>
          </div>
        </section>
        <LatestPostsSection
          title="Image to GIF guides worth linking to"
          description="Support image-sequence and photo-to-GIF searches with focused tutorials on timing, smooth playback, and file-size control."
          postSlugs={[
            'turn-images-into-a-smooth-animated-gif',
            'how-to-edit-a-gif-without-losing-quality',
            'optimize-gif-size-without-losing-quality',
          ]}
        />
        <Footer />
      </main>
    </div>
  );
}
