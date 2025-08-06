import React from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function EditGifsConverterPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Professional GIF Editor & Converter",
    "url": "https://www.gifmagic.app/edit-gifs/converter-and-editor",
    "description": "Advanced GIF editor with professional editing tools. Edit animated GIFs, resize, crop, add text, optimize quality.",
    "applicationCategory": "ImageApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Edit animated GIFs",
      "Resize GIF dimensions",
      "Crop GIF regions",
      "Rotate GIF animations",
      "Frame-by-frame editing",
      "Text overlay on GIFs",
      "GIF speed control",
      "Quality optimization",
      "Split GIF frames",
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
      title: "Upload Your GIF",
      description: "Select and upload your existing animated GIF file. Our editor supports all standard GIF formats and maintains animation quality."
    },
    {
      step: "2", 
      title: "Edit & Enhance",
      description: "Use professional editing tools to resize, crop, rotate, add text, adjust timing, and apply effects to your animated GIF."
    },
    {
      step: "3",
      title: "Download Optimized GIF",
      description: "Export your edited animated GIF with optimized file size and quality. Perfect for social media, web, and presentations."
    }
  ];

  const features = [
    {
      icon: "✂️",
      title: "Precise GIF Cropping",
      description: "Crop specific regions of your animated GIFs with pixel-perfect precision. Remove unwanted areas while maintaining smooth animation."
    },
    {
      icon: "📐",
      title: "Resize Animated GIFs",
      description: "Resize your GIF dimensions to any size while preserving animation quality. Perfect for social media requirements and web optimization."
    },
    {
      icon: "🔄",
      title: "Rotate & Flip Animations",
      description: "Rotate GIFs by any angle, flip horizontally or vertically. Correct orientation issues and create mirror effects with ease."
    },
    {
      icon: "🎯",
      title: "Frame-by-Frame Editor",
      description: "Edit individual frames of your GIF animation. Add, remove, reorder frames, and control timing for each frame independently."
    },
    {
      icon: "📝",
      title: "Text & Effects Overlay",
      description: "Add text overlays, stickers, watermarks, and visual effects to your animated GIFs. Customize fonts, colors, and positioning."
    },
    {
      icon: "⚡",
      title: "Speed & Quality Control",
      description: "Adjust animation speed, optimize file size, control frame rate, and balance quality vs. file size for perfect results."
    }
  ];

  const faqData = [
    {
      question: "How do I edit an existing animated GIF?",
      answer: "Upload your GIF file to our editor, then use our professional tools to resize, crop, add text, adjust timing, or apply effects. All changes are applied to the entire animation sequence automatically."
    },
    {
      question: "Can I edit individual frames in a GIF?",
      answer: "Yes! Our frame-by-frame editor allows you to modify individual frames, add or remove frames, reorder sequences, and control timing for each frame independently."
    },
    {
      question: "How do I resize a GIF without losing quality?",
      answer: "Our smart resizing algorithm maintains animation quality while changing dimensions. You can resize by percentage, specific dimensions, or preset sizes for social media platforms."
    },
    {
      question: "Can I add text that animates with the GIF?",
      answer: "Absolutely! Add text overlays that remain consistent across all frames, or create frame-specific text that changes with the animation. Full font and styling control included."
    },
    {
      question: "How do I optimize GIF file size?",
      answer: "Use our optimization tools to reduce file size: adjust frame rate, resize dimensions, reduce color palette, crop unnecessary areas, or remove redundant frames while maintaining visual quality."
    },
    {
      question: "Can I split a GIF into individual frames?",
      answer: "Yes! Extract individual frames from your animated GIF for separate editing. You can also reassemble frames into new animations with different timing and effects."
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-blue-600/5 dark:from-green-400/5 dark:to-blue-400/5"></div>
          <div className="relative max-w-7xl mx-auto">
            <div className="text-center">
              <div className="mb-8 p-8 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 shadow-xl backdrop-blur-sm">
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-green-700 to-blue-700 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent mb-6 drop-shadow-sm">
                  Professional GIF Editor & Converter
                </h1>
                <p className="text-xl text-gray-700 dark:text-gray-200 mb-8 max-w-4xl mx-auto leading-relaxed">
                  Edit and enhance your animated GIFs with professional-grade tools. Resize dimensions, crop regions, add text overlays, adjust animation timing, optimize file size, and apply stunning effects. Perfect for social media content, marketing materials, and creative projects.
                </p>
                <Link 
                  href="/create-and-edit-gifs/converter-and-editor/editor"
                  className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1"
                >
                  Start Editing GIFs
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Advanced GIF Editing Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-xl hover:shadow-green-500/10 dark:hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-2 group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-700 dark:text-gray-200">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How-to Guide */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              How to Edit Your Animated GIFs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {howToSteps.map((step, index) => (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{step.title}</h3>
                  <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Why Choose Our GIF Editor
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Frame-Level Control</h3>
                <p className="text-gray-700 dark:text-gray-200 mb-4 leading-relaxed">
                  Edit individual frames with precision control. Add, remove, reorder, and time each frame independently for perfect animation sequences.
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-200">
                  <li className="flex items-center"><span className="text-green-600 dark:text-green-400 mr-2">•</span> Frame-by-frame editing</li>
                  <li className="flex items-center"><span className="text-green-600 dark:text-green-400 mr-2">•</span> Timing adjustments</li>
                  <li className="flex items-center"><span className="text-green-600 dark:text-green-400 mr-2">•</span> Sequence reordering</li>
                </ul>
              </Card>
              
              <Card className="p-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Quality Optimization</h3>
                <p className="text-gray-700 dark:text-gray-200 mb-4 leading-relaxed">
                  Balance file size and visual quality with intelligent compression algorithms. Perfect for web use and social media sharing.
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-200">
                  <li className="flex items-center"><span className="text-blue-600 dark:text-blue-400 mr-2">•</span> Smart compression</li>
                  <li className="flex items-center"><span className="text-blue-600 dark:text-blue-400 mr-2">•</span> File size optimization</li>
                  <li className="flex items-center"><span className="text-blue-600 dark:text-blue-400 mr-2">•</span> Quality preservation</li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600/5 to-blue-600/5 dark:from-green-400/5 dark:to-blue-400/5 border-y border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Ready to Edit Your GIFs?
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-200 mb-8 leading-relaxed">
              Transform your animated GIFs with our professional editing tools and optimization features.
            </p>
            <Link 
              href="/edit-gifs/converter-and-editor/editor"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1"
            >
              Launch GIF Editor
            </Link>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              GIF Editor FAQ
            </h2>
            <div className="space-y-6">
              {faqData.map((faq, index) => (
                <Card key={index} className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{faq.question}</h3>
                  <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
