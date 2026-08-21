import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';
import { canonicalStaticPages } from '@/lib/gif-tools';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const toUrl = (path: string) => new URL(path, SITE_URL).toString();
  const posts = getAllPosts();
  const latestPostDate = posts.reduce<string | undefined>((latest, post) => {
    const postDate = post.updated ?? post.date;
    return !latest || postDate > latest ? postDate : latest;
  }, undefined);

  const routeEntries: MetadataRoute.Sitemap = canonicalStaticPages.map((page) => {
    const updatedAt = page.path === '/blog' ? latestPostDate : page.updatedAt;

    return {
      url: toUrl(page.path),
      ...(updatedAt ? { lastModified: new Date(updatedAt) } : {}),
    };
  });

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: toUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.updated ?? post.date),
  }));

  return [...routeEntries, ...blogEntries];
}
