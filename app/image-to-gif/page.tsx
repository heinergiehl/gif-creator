import { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '../components/ui/Footer';
export const metadata: Metadata = {
  title: 'Image to GIF Converter - Create Animated GIFs from Photos | GifMagic.app',
  description:
    'Convert images to animated GIFs online. Create GIFs from JPG, PNG, WebP photos. Add text, effects, resize, crop, and optimize animated images. Free image to GIF maker with no watermarks.',
  keywords: 'image to GIF, photo to GIF, JPG to GIF, PNG to GIF, WebP to GIF, create animated GIF from images, image animation maker, photo GIF converter, animated image creator, free image to GIF converter',
  alternates: { canonical: 'https://www.gifmagic.app/image-to-gif' },
};
export default function ImageToGif() {
  return (
    <div>
      <main className="mt-16 font-sans">
        <section className="hero bg-base-200 text-center">
          <div className="hero-content">
            <div className="max-w-lg">
              <h1 className="text-5xl font-bold">Advanced Image to GIF Converter & Editor</h1>
              <p className="py-6">
                Transform static images into animated GIFs with professional editing tools. Upload JPG, PNG, WebP photos and create stunning animations. Add text overlays, resize dimensions, crop regions, apply effects, and optimize file sizes. Free online image to GIF maker with no watermarks.
              </p>
              <Link href="/image-to-gif/converter-and-editor">
                <span className="btn btn-primary">Create Your GIF</span>
              </Link>
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="text-center">
            <h2 className="mb-8 text-3xl font-bold">Professional Image to Animated GIF Conversion</h2>
            <p className="mb-8">
              Create professional animated GIFs from your photos with advanced editing capabilities. Our image to GIF converter supports multiple formats (JPG, PNG, WebP, HEIC), offers frame-by-frame control, animation timing adjustment, resize and crop tools, text overlays, and file optimization. Perfect for creating reaction GIFs, photo animations, marketing content, and social media assets.
            </p>
          </div>
        </section>
        <Footer />
      </main>
    </div>
  );
}
