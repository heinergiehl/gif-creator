import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';
import { getPublicAppRoutes, getRouteChangeFrequency, getRoutePriority } from '@/lib/site-content';
import { SITE_URL } from '@/lib/site';
export default function sitemap(): MetadataRoute.Sitemap {
  const toUrl = (path: string) => new URL(path, SITE_URL).toString();
  const routeEntries = getPublicAppRoutes().map((route) => ({
    url: toUrl(route),
    changeFrequency: getRouteChangeFrequency(route),
    priority: getRoutePriority(route),
    lastModified: new Date(),
  }));

  const blogEntries = getAllPosts().map((post) => ({
    url: toUrl(`/blog/${post.slug}`),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
    lastModified: new Date(post.updated ?? post.date),
  }));

  return [...routeEntries, ...blogEntries];
}
