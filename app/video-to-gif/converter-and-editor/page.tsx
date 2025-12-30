import React from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { SITE_BRAND, absoluteUrl } from '@/lib/site';

export default function VideoToGifConverterPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Professional Video to GIF Converter & Editor",
    "url": absoluteUrl('/video-to-gif/converter-and-editor'),
    "description": "Advanced video to GIF converter with professional editing tools. Convert MP4, AVI, MOV to high-quality animated GIFs with frame-by-frame editing.",
    "applicationCategory": "VideoApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "MP4 to GIF conversion",
      "AVI to GIF conversion", 
      "MOV to GIF conversion",
      "Frame-by-frame editing",
      "Text overlay on GIFs",
      "Resize animated GIFs",
      "Crop GIF regions",
      "Animation speed control",
      "GIF quality optimization",
      "No watermarks"
    ],
    "author": {
      "@type": "Organization",
      "name": SITE_BRAND
    }
  };

  const howToSteps = [
    {
      step: "1",
      title: "Upload Your Video",
      description: "Select and upload your MP4, AVI, MOV, or other video file. Our converter supports all major video formats."
    },
    {
      step: "2", 
      title: "Edit & Customize",
      description: "Use our professional editing tools to resize, crop, add text, adjust speed, and optimize your GIF animation."
    },
    {
      step: "3",
      title: "Download High-Quality GIF",
      description: "Export your optimized animated GIF with no watermarks. Perfect quality for web, social media, or presentations."
    }
  ];

  const features = [
    {
      title: "🎬 Advanced Video Processing",
      description: "Convert MP4, AVI, MOV, WMV, and other video formats to high-quality animated GIFs with professional processing algorithms."
    },
    {
      title: "✂️ Precise Frame Editing", 
      description: "Extract specific frames, control animation timing, adjust playback speed, and edit individual frames for perfect GIF creation."
    },
    {
      title: "🎨 Professional Text & Effects",
      description: "Add animated text overlays, apply visual effects, insert stickers, and customize your GIF with professional design tools."
    },
    {
      title: "📐 Size & Quality Optimization",
      description: "Resize dimensions, crop regions, optimize file size, and control compression while maintaining visual quality for any platform."
    },
    {
      title: "⚡ Real-Time Preview",
      description: "See your changes instantly with our real-time preview system. Preview animation, timing, and effects before downloading."
    },
    {
      title: "🔒 Secure Local Processing",
      description: "All video processing happens locally in your browser. Your files never leave your device, ensuring complete privacy and security."
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="relative min-h-screen">
        {/* Background gradients */}
        <div className="absolute inset-0 z-[10] h-full w-full items-center px-5 py-24 opacity-100 [background:radial-gradient(125%_125%_at_50%_50%,#fdfdfd_30%,#63e_100%)] dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
        <div className="absolute bottom-0 left-0 right-0 top-0 z-[20] h-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px] opacity-30 dark:bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] dark:bg-[size:24px_24px] dark:opacity-100"></div>
        
        <div className="relative z-40">
          {/* Hero Section */}
          <section className="container mx-auto px-4 pt-24 pb-16">
            <div className="text-center max-w-4xl mx-auto">
              <div className="mb-8 p-6 rounded-lg bg-gradient-to-r from-[#ff2975]/10 to-[#00FFF1]/10 border border-white/20">
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-br from-[#ff2975] from-35% to-[#00FFF1] bg-clip-text text-transparent">
                  Professional Video to GIF Converter & Editor
                </h1>
              </div>
              
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Transform your videos into stunning animated GIFs with our advanced editing tools. 
                Convert MP4, AVI, MOV files with professional frame-by-frame editing, text overlays, 
                and optimization controls. Completely free with no watermarks.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link 
                  href="/editor"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-white h-11 px-8 bg-gradient-to-r from-[#ff2975] to-[#00FFF1] hover:opacity-90"
                >
                  Start Converting Videos →
                </Link>
                <Link href="/video-to-gif" className="text-blue-500 hover:underline">
                  ← Back to Video to GIF Info
                </Link>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="container mx-auto px-4 py-16">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-b from-black to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
              How to Convert Video to GIF
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {howToSteps.map((step, index) => (
                <Card key={index} className="p-6 text-center bg-white/10 backdrop-blur-sm border border-white/20">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#ff2975] to-[#00FFF1] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#ff2975]">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="container mx-auto px-4 py-16">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-b from-black to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
              Professional Video to GIF Features
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <Card key={index} className="p-6 bg-white/10 backdrop-blur-sm border border-white/20">
                  <h3 className="text-xl font-bold mb-3 text-[#ff2975]">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* Supported Formats */}
          <section className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-b from-black to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
                Supported Video Formats
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Our video to GIF converter supports all major video formats for maximum compatibility
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['MP4', 'AVI', 'MOV', 'WMV', 'FLV', 'WebM', 'MKV', 'MPEG'].map((format) => (
                  <div key={format} className="p-4 bg-gradient-to-r from-[#ff2975]/10 to-[#00FFF1]/10 rounded-lg border border-white/20">
                    <span className="font-bold text-lg">{format}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Editor Section */}
          <section id="editor-section" className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <Card className="p-8 bg-gradient-to-r from-[#ff2975]/10 to-[#00FFF1]/10 border border-white/20">
                <h2 className="text-3xl font-bold mb-4 text-[#ff2975]">Ready to Create Amazing GIFs?</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Upload your video file and start converting to high-quality animated GIFs with our professional editing tools.
                </p>
                <div className="mb-6">
                  <Link 
                    href="/video-to-gif/converter-and-editor/editor"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-white h-11 px-8 bg-gradient-to-r from-[#ff2975] to-[#00FFF1] hover:opacity-90"
                  >
                    Launch Video to GIF Editor
                  </Link>
                </div>
                <noscript>
                  <div className="p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                    <p className="text-yellow-800 dark:text-yellow-200">
                      <strong>JavaScript Required:</strong> Our interactive video to GIF converter requires JavaScript to function. 
                      Please enable JavaScript in your browser for the full editing experience.
                    </p>
                  </div>
                </noscript>
              </Card>
            </div>
          </section>

          {/* Alternative Methods */}
          <section className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-[#ff2975]">Alternative Ways to Convert Video to GIF</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-6 bg-white/10 backdrop-blur-sm border border-white/20">
                  <h3 className="text-xl font-bold mb-3 text-[#ff2975]">🖥️ Desktop Software</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    For advanced users, consider desktop applications like FFmpeg, GIMP, or Photoshop for professional video to GIF conversion with extensive customization options.
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• FFmpeg command line tool</li>
                    <li>• Adobe Photoshop timeline</li>
                    <li>• GIMP animation features</li>
                  </ul>
                </Card>
                <Card className="p-6 bg-white/10 backdrop-blur-sm border border-white/20">
                  <h3 className="text-xl font-bold mb-3 text-[#ff2975]">📱 Mobile Apps</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Convert videos to GIFs on your mobile device using dedicated apps available on iOS and Android app stores.
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• GIF Maker apps</li>
                    <li>• Video editing apps</li>
                    <li>• Social media native tools</li>
                  </ul>
                </Card>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
