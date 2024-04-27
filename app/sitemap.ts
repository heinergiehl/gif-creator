import { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.gifmagic.app',
      changeFrequency: 'daily',
      priority: 1,
      lastModified: new Date().toISOString(),
    },
    {
      url: 'https://www.gifmagic.app/video-to-gif',
      changeFrequency: 'daily',
      priority: 1,
      lastModified: new Date().toISOString(),
    },
    {
      url: 'https://www.gifmagic.app/video-to-gif/converter-and-editor',
      changeFrequency: 'daily',
      priority: 0.5,
      lastModified: new Date().toISOString(),
    },
    {
      url: 'https://www.gifmagic.app/image-to-gif',
      changeFrequency: 'daily',
      priority: 1,
      lastModified: new Date().toISOString(),
    },
    {
      url: 'https://www.gifmagic.app/image-to-gif/converter-and-editor',
      changeFrequency: 'daily',
      priority: 0.5,
      lastModified: new Date().toISOString(),
    },
    {
      url: 'https://www.gifmagic.app/screen-to-video',
      changeFrequency: 'daily',
      priority: 1,
      lastModified: new Date().toISOString(),
    },
    {
      url: 'https://www.gifmagic.app/screen-to-video/record-screen',
      changeFrequency: 'daily',
      priority: 0.5,
      lastModified: new Date().toISOString(),
    },
  ];
}
