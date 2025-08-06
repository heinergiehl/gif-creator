import React from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function ImageToGifConverterPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Professional Image to GIF Converter & Editor",
    "url": "https://www.gifmagic.app/image-to-gif/converter-and-editor",
    "description": "Advanced image to GIF converter with professional editing tools. Create animated GIFs from JPG, PNG, WebP photos.",
    "applicationCategory": "ImageApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "JPG to GIF conversion",
      "PNG to GIF conversion", 
      "WebP to GIF conversion",
      "Image sequence animation",
      "Text overlay on GIFs",
      "Resize animated GIFs",
      "Crop GIF regions",
      "Animation timing control",
      "GIF quality optimization",
      "No watermarks"
    ],
    "author": {
      "@type": "Organization",
      "name": "GifMagic.app"
    }
  };

  const howToSteps = [
    {
      step: "1",
      title: "Upload Your Images",
      description: "Select and upload your JPG, PNG, WebP, or HEIC images. Our converter supports all major image formats for creating animated sequences."
    },
    {
      step: "2", 
      title: "Arrange & Edit",
      description: "Arrange your images in the desired sequence, add text overlays, resize dimensions, crop regions, and control animation timing."
    },
    {
      step: "3",
      title: "Download Animated GIF",
      description: "Export your high-quality animated GIF with optimized file size. No watermarks, perfect for social media and web use."
    }
  ];

  const features = [
    {
      icon: "📸",
      title: "Multi-Format Image Support",
      description: "Upload JPG, PNG, WebP, HEIC, and other image formats to create stunning animated GIFs from your photo collections."
    },
    {
      icon: "🎬",
      title: "Image Sequence Animation",
      description: "Arrange multiple images into smooth animated sequences with customizable frame duration and transition effects."
    },
    {
      icon: "✨",
      title: "Professional Editing Tools",
      description: "Add text overlays, resize dimensions, crop regions, apply filters, and optimize quality for perfect animated results."
    },
    {
      icon: "⚡",
      title: "Fast Processing",
      description: "Create animated GIFs from images in seconds with our optimized processing engine. Works entirely in your browser for privacy."
    },
    {
      icon: "🎯",
      title: "Animation Control",
      description: "Precise control over animation timing, loop settings, frame duration, and playback speed for professional results."
    },
    {
      icon: "💾",
      title: "Quality Optimization",
      description: "Intelligent compression algorithms reduce file size while maintaining visual quality, perfect for web and social media."
    }
  ];

  const faqData = [
    {
      question: "How do I create an animated GIF from multiple images?",
      answer: "Upload your images in the desired sequence, adjust the frame duration for each image, and our tool will automatically create a smooth animated GIF. You can rearrange images, control timing, and preview the animation before downloading."
    },
    {
      question: "What image formats can I use to create GIFs?",
      answer: "Our image to GIF converter supports JPG, PNG, WebP, HEIC, BMP, and most other common image formats. Simply upload your photos and we'll convert them into an animated sequence."
    },
    {
      question: "Can I control the animation speed of my image-based GIF?",
      answer: "Yes! You can adjust the frame duration for each image individually, set custom delays between frames, and control the overall animation speed to create the perfect timing for your animated GIF."
    },
    {
      question: "How do I optimize GIF quality when creating from images?",
      answer: "Use our quality optimization settings to balance file size and visual quality. You can adjust color palette, resize dimensions, and optimize compression for your specific use case - whether for social media, web, or high-quality preservation."
    },
    {
      question: "Is there a limit to how many images I can use?",
      answer: "You can use multiple images to create your animated GIF, though we recommend keeping sequences reasonable for optimal file size and loading performance. Our tool handles batch processing efficiently."
    },
    {
      question: "Can I add text and effects to my image-based GIF?",
      answer: "Absolutely! Our editor includes text overlay tools, filters, effects, and transitions. Add captions, watermarks, or decorative text to enhance your animated GIF created from images."
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-400/10 dark:to-purple-400/10"></div>
          <div className="relative max-w-7xl mx-auto">
            <div className="text-center">
              <div className="mb-8 p-8 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/20 dark:border-blue-700/20">
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                  Professional Image to GIF Converter & Editor
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto">
                  Transform static images into stunning animated GIFs with our advanced converter. Upload JPG, PNG, WebP photos and create professional animations with frame-by-frame control, text overlays, and quality optimization. Perfect for social media, marketing, and creative projects.
                </p>
                <Link 
                  href="/image-to-gif/converter-and-editor/editor"
                  className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Start Creating GIFs from Images
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Advanced Image to GIF Conversion Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How-to Guide */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              How to Create Animated GIFs from Images
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {howToSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Why Choose Our Image to GIF Converter
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Multi-Format Support</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Convert JPG, PNG, WebP, HEIC, and other image formats into animated GIFs. Our converter automatically optimizes each format for the best results.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• High-resolution image support</li>
                  <li>• Batch image processing</li>
                  <li>• Automatic format detection</li>
                </ul>
              </Card>
              
              <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Professional Editing</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Advanced editing tools for creating professional-quality animated GIFs from your image collections with precise control.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• Frame-by-frame timing control</li>
                  <li>• Text and effect overlays</li>
                  <li>• Quality optimization</li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-400/10 dark:to-purple-400/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Ready to Create Amazing Animated GIFs?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Start converting your images to high-quality animated GIFs with our professional editing tools.
            </p>
            <Link 
              href="/image-to-gif/converter-and-editor/editor"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Launch Image to GIF Editor
            </Link>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Image to GIF Converter FAQ
            </h2>
            <div className="space-y-6">
              {faqData.map((faq, index) => (
                <Card key={index} className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{faq.question}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
