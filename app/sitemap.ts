import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const toUrl = (path: string) => new URL(path, SITE_URL).toString();
  return [
    {
      url: toUrl('/'),
      changeFrequency: 'weekly',
      priority: 1,
      lastModified,
    },
    {
      url: toUrl('/video-to-gif'),
      changeFrequency: 'weekly',
      priority: 0.9,
      lastModified,
    },
    {
      url: toUrl('/video-to-gif/converter-and-editor'),
      changeFrequency: 'weekly',
      priority: 0.7,
      lastModified,
    },
    {
      url: toUrl('/image-to-gif'),
      changeFrequency: 'weekly',
      priority: 0.9,
      lastModified,
    },
    {
      url: toUrl('/image-to-gif/converter-and-editor'),
      changeFrequency: 'weekly',
      priority: 0.7,
      lastModified,
    },
    {
      url: toUrl('/edit-gifs'),
      changeFrequency: 'weekly',
      priority: 0.9,
      lastModified,
    },
    {
      url: toUrl('/edit-gifs/converter-and-editor'),
      changeFrequency: 'weekly',
      priority: 0.7,
      lastModified,
    },
    {
      url: toUrl('/screen-to-video'),
      changeFrequency: 'weekly',
      priority: 0.6,
      lastModified,
    },
    {
      url: toUrl('/privacy-policy'),
      changeFrequency: 'monthly',
      priority: 0.3,
      lastModified,
    },
    {
      url: toUrl('/terms-of-service'),
      changeFrequency: 'monthly',
      priority: 0.3,
      lastModified,
    },
    {
      url: toUrl('/contact'),
      changeFrequency: 'monthly',
      priority: 0.3,
      lastModified,
    },
    {
      url: toUrl('/info/cookies'),
      changeFrequency: 'monthly',
      priority: 0.2,
      lastModified,
    },
  ];
}
