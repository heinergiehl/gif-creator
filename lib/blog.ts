import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { absoluteUrl } from '@/lib/site';

const BLOG_DIRECTORY = path.join(process.cwd(), 'content', 'blog');
const WORDS_PER_MINUTE = 220;

export interface BlogFrontmatter {
  title: string;
  description: string;
  date: string;
  updated?: string;
  author: string;
  category: string;
  tags: string[];
  keywords: string[];
  featured?: boolean;
  featuredRank?: number;
  relatedSlugs?: string[];
  ctaHref: string;
  ctaLabel: string;
}

export interface BlogPostMeta extends BlogFrontmatter {
  slug: string;
  url: string;
  readingTimeMinutes: number;
  wordCount: number;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
  html: string;
}

function ensureStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  return [];
}

function parseBlogFile(fileName: string): BlogPost {
  const slug = fileName.replace(/\.md$/, '');
  const rawFile = fs.readFileSync(path.join(BLOG_DIRECTORY, fileName), 'utf8');
  const { data, content } = matter(rawFile);
  const normalizedContent = content.trim();
  const wordCount = normalizedContent.split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
  const html = remark().use(remarkGfm).use(remarkHtml).processSync(normalizedContent).toString();

  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ''),
    date: String(data.date ?? new Date().toISOString()),
    updated: typeof data.updated === 'string' ? data.updated : undefined,
    author: String(data.author ?? 'GIF-Creator Editorial Team'),
    category: String(data.category ?? 'GIF Tutorials'),
    tags: ensureStringArray(data.tags),
    keywords: ensureStringArray(data.keywords),
    featured: Boolean(data.featured),
    featuredRank: typeof data.featuredRank === 'number' ? data.featuredRank : undefined,
    relatedSlugs: ensureStringArray(data.relatedSlugs),
    ctaHref: String(data.ctaHref ?? '/edit-gifs'),
    ctaLabel: String(data.ctaLabel ?? 'Open the GIF editor'),
    url: absoluteUrl(`/blog/${slug}`),
    readingTimeMinutes,
    wordCount,
    content: normalizedContent,
    html,
  };
}

function sortPosts(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((left, right) => {
    const leftRank = left.featuredRank ?? Number.MAX_SAFE_INTEGER;
    const rightRank = right.featuredRank ?? Number.MAX_SAFE_INTEGER;

    if (left.featured && right.featured && leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    return new Date(right.date).getTime() - new Date(left.date).getTime();
  });
}

let cachedPosts: BlogPost[] | null = null;

function readAllPosts(): BlogPost[] {
  if (cachedPosts) {
    return cachedPosts;
  }

  const files = fs
    .readdirSync(BLOG_DIRECTORY)
    .filter((fileName) => fileName.endsWith('.md'));

  cachedPosts = sortPosts(files.map(parseBlogFile));
  return cachedPosts;
}

export function getAllPosts(): BlogPostMeta[] {
  return readAllPosts().map(({ content, html, ...post }) => post);
}

export function getFeaturedPosts(limit = 3): BlogPostMeta[] {
  return getAllPosts()
    .filter((post) => post.featured)
    .slice(0, limit);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return readAllPosts().find((post) => post.slug === slug);
}

export function getPostsBySlugs(slugs: string[]): BlogPostMeta[] {
  const postMap = new Map(getAllPosts().map((post) => [post.slug, post]));
  return slugs.map((slug) => postMap.get(slug)).filter((post): post is BlogPostMeta => Boolean(post));
}

export function getRelatedPosts(slug: string, limit = 3): BlogPostMeta[] {
  const posts = readAllPosts();
  const currentPost = posts.find((post) => post.slug === slug);

  if (!currentPost) {
    return [];
  }

  const explicitRelated = getPostsBySlugs(currentPost.relatedSlugs ?? []).filter(
    (post) => post.slug !== slug,
  );

  if (explicitRelated.length >= limit) {
    return explicitRelated.slice(0, limit);
  }

  const explicitSlugs = new Set(explicitRelated.map((post) => post.slug));
  const currentTags = new Set(currentPost.tags.map((tag) => tag.toLowerCase()));

  const inferredRelated = posts
    .filter((post) => post.slug !== slug && !explicitSlugs.has(post.slug))
    .map((post) => {
      const sharedTags = post.tags.filter((tag) => currentTags.has(tag.toLowerCase())).length;
      return { post, sharedTags };
    })
    .sort((left, right) => {
      if (right.sharedTags !== left.sharedTags) {
        return right.sharedTags - left.sharedTags;
      }

      return new Date(right.post.date).getTime() - new Date(left.post.date).getTime();
    })
    .map(({ post }) => {
      const { content, html, ...meta } = post;
      return meta;
    });

  return [...explicitRelated, ...inferredRelated].slice(0, limit);
}

export function getBlogCategories(): string[] {
  return [...new Set(getAllPosts().map((post) => post.category))];
}
