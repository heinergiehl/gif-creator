import { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/login', '/account'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/login', '/account'],
      },
    ],
    sitemap: 'https://www.gifmagic.app/sitemap.xml',
    host: 'https://www.gifmagic.app',
  };
}
