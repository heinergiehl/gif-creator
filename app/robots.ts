import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
export default function robots(): MetadataRoute.Robots {
  const siteOrigin = SITE_URL.origin;
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/auth/'],
      },
    ],
    sitemap: `${siteOrigin}/sitemap.xml`,
    host: siteOrigin,
  };
}
