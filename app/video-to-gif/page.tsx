import Link from 'next/link';
import { Footer } from '@/app/components/ui/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Video to GIF Converter - Convert MP4, AVI, MOV to Animated GIF | GifMagic.app',
  description:
    'Free online video to GIF converter. Transform MP4, AVI, MOV, and other video formats into high-quality animated GIFs. Resize, crop, optimize, and edit frames. No watermarks, no sign-up required.',
  keywords:
    'video to GIF converter, MP4 to GIF, AVI to GIF, MOV to GIF, convert video to GIF, online GIF converter, animated GIF maker, video converter, GIF from video, free video to GIF, resize GIF from video, crop video to GIF, optimize GIF size, video GIF editor',
  alternates: { canonical: 'https://www.gifmagic.app/video-to-gif' },
};
const features = [
  {
    name: '⚡ Fast Video to GIF Conversion',
    body: 'Convert videos to high-quality animated GIFs in seconds. Support for MP4, AVI, MOV, and other popular video formats with optimized processing.',
  },
  {
    name: '💾 Secure Local Processing',
    body: 'All video to GIF conversion happens locally in your browser. No files uploaded to servers, ensuring complete privacy for your video content.',
  },
  {
    name: '💻 Advanced GIF Editor & Customization',
    body: 'Professional GIF editing tools: resize animated GIFs, crop regions, rotate images, add text overlays, control frame rate, optimize file size, and apply effects to your converted videos.',
  },
  {
    name: '🎯 Frame-by-Frame Control',
    body: 'Extract specific frames from your video, control animation timing, adjust playback speed, and edit individual frames for perfect GIF creation.',
  },
  {
    name: '🔧 Multiple Video Format Support',
    body: 'Convert MP4, AVI, MOV, WMV, FLV, and other video formats to GIF. Automatic format detection and optimized conversion for each video type.',
  },
  {
    name: '📱 Mobile-Friendly Video to GIF Converter',
    body: 'Create GIFs from videos on any device. Our responsive video to GIF converter works perfectly on desktop, tablet, and mobile browsers.',
  },
];
const faqData = [
  {
    question: 'How do I convert MP4 to GIF with high quality?',
    answer:
      'Upload your MP4 video to our converter, select your desired frame range and quality settings. Our tool maintains high resolution while optimizing file size. You can resize, crop, and adjust frame rate for perfect GIF quality from your MP4 video.',
  },
  {
    question: 'What video formats can I convert to GIF?',
    answer:
      'Our video to GIF converter supports MP4, AVI, MOV, WMV, FLV, WebM, and most other popular video formats. Simply upload your video file and our tool will automatically detect and convert it to an optimized animated GIF.',
  },
  {
    question: 'Can I edit the GIF after converting from video?',
    answer:
      'Yes! After converting your video to GIF, use our built-in editor to resize dimensions, crop regions, add text overlays, adjust animation speed, optimize file size, and apply effects. Full frame-by-frame editing control available.',
  },
  {
    question: 'Is there a file size limit for video to GIF conversion?',
    answer:
      'Currently we support video files up to 100MB for optimal performance. For larger videos, consider trimming to your desired segment first. Our converter optimizes output GIF size while maintaining quality.',
  },
  {
    question: 'How do I reduce GIF file size after video conversion?',
    answer:
      'Use our GIF optimizer to reduce file size: lower the frame rate, resize dimensions, reduce color palette, or crop unnecessary areas. Our compression algorithms maintain visual quality while significantly reducing file size.',
  },
  {
    question: 'Can I convert video to GIF on mobile devices?',
    answer:
      'Absolutely! Our video to GIF converter is fully responsive and works on all mobile devices. Convert videos to GIFs directly from your phone or tablet browser with the same features as desktop.',
  },
  {
    question: 'Do you add watermarks to converted GIFs?',
    answer:
      'No, all GIFs created with our video to GIF converter are completely free of watermarks. Download and use your converted animated GIFs for any purpose without attribution requirements.',
  },
  {
    question: 'How long does video to GIF conversion take?',
    answer:
      'Conversion speed depends on video length and quality settings, but most videos convert to GIF in under 30 seconds. Processing happens locally in your browser for fast, secure conversion.',
  },
];
export default function VideoToGif() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Video to GIF Converter - GifMagic.app",
    "url": "https://www.gifmagic.app/video-to-gif",
    "description": "Free online video to GIF converter. Convert MP4, AVI, MOV videos to high-quality animated GIFs with professional editing tools.",
    "applicationCategory": "VideoApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "MP4 to GIF converter",
      "AVI to GIF converter",
      "MOV to GIF converter",
      "Video frame extraction",
      "GIF quality optimization",
      "Frame rate control",
      "Video cropping",
      "Animation speed adjustment",
      "No watermarks"
    ],
    "author": {
      "@type": "Organization",
      "name": "GifMagic.app"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="relative z-40 h-full w-full text-black dark:text-white">
      <div className="absolute inset-0 z-[10] h-full w-full items-center px-5 py-24 opacity-100 [background:radial-gradient(125%_125%_at_50%_50%,#fdfdfd_30%,#63e_100%)] dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
      <div className="absolute bottom-0 left-0 right-0 top-0 z-[20] h-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px] opacity-30 dark:bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] dark:bg-[size:24px_24px] dark:opacity-100"></div>
      <div className="relative z-40 flex flex-col opacity-100">
        <main className="mt-[62px] font-sans">
          <section className="hero bg-base-200">
            <div className="hero-content text-center">
              <div className="mx-auto max-w-lg">
              
                  <h1 className="text-5xl font-bold">
                    Free Video to GIF Converter - MP4, AVI, MOV to Animated GIF
                  </h1>
                  <p className="py-6">
                    Convert videos to high-quality animated GIFs with our professional video to GIF converter. Upload MP4, AVI, MOV files and transform them into optimized GIFs. Advanced editing tools included: resize dimensions, crop regions, add text overlays, control frame rate, and optimize file size. No watermarks, completely free.
                  </p>
                  <Link href="/video-to-gif/converter-and-editor" className="btn btn-primary">
                    Convert Video to GIF Now
                  </Link>
         
              </div>
            </div>
          </section>
          <section className="py-16">
            <div className="container mx-auto flex h-full w-full flex-col px-4">
    
                <h2 className="mb-8 text-center text-3xl font-bold">
                  Professional Video to GIF Conversion Features
                </h2>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {features.map((feature, index) => (
                    <div key={index} className="rounded-lg border bg-white/5 p-6 backdrop-blur-sm dark:bg-black/20">
                      <h3 className="mb-3 text-xl font-semibold">{feature.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{feature.body}</p>
                    </div>
                  ))}
                </div>
       
            </div>
          </section>
          <section className="py-16">
      
              <div className="container mx-auto px-4">
                <h2 className="mb-8 text-center text-3xl font-bold">
                  How to Convert Video to GIF Online
                </h2>
                <div className="mx-auto max-w-4xl space-y-6">
                  <div className="rounded-lg border bg-white/5 p-6 backdrop-blur-sm dark:bg-black/20">
                    <h3 className="mb-3 text-lg font-semibold">1. Upload Your Video File</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Select your video file (MP4, AVI, MOV, WMV, etc.) and upload it to our converter. Files are processed locally for privacy and security.
                    </p>
                  </div>
                  <div className="rounded-lg border bg-white/5 p-6 backdrop-blur-sm dark:bg-black/20">
                    <h3 className="mb-3 text-lg font-semibold">2. Customize Your GIF Settings</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Choose your desired frame range, adjust quality settings, resize dimensions, and set frame rate. Preview your GIF in real-time.
                    </p>
                  </div>
                  <div className="rounded-lg border bg-white/5 p-6 backdrop-blur-sm dark:bg-black/20">
                    <h3 className="mb-3 text-lg font-semibold">3. Edit and Optimize</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Use our editing tools to crop regions, add text overlays, apply effects, and optimize file size for your specific needs.
                    </p>
                  </div>
                  <div className="rounded-lg border bg-white/5 p-6 backdrop-blur-sm dark:bg-black/20">
                    <h3 className="mb-3 text-lg font-semibold">4. Download Your Animated GIF</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Download your high-quality animated GIF with no watermarks. Perfect for social media, websites, or messaging.
                    </p>
                  </div>
                </div>
              </div>
   
          </section>
          <section className=" py-16">

              <div className="container mx-auto px-4">
                <h2 className="mb-8 text-center text-3xl font-bold">
                  Video to GIF Converter FAQ
                </h2>
                <div className="mx-auto max-w-4xl space-y-6">
                  {faqData.map((faq, index) => (
                    <div key={index} className="rounded-lg border bg-white/5 p-6 backdrop-blur-sm dark:bg-black/20">
                      <h3 className="mb-3 text-xl font-semibold">{faq.question}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
      
          </section>
        </main>
        <Footer />
      </div>
    </div>
    </>
  );
}
