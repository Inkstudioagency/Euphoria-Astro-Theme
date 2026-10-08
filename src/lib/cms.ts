/**
 * Typed access to the three Strapi collections (Blog Posts, Case Studies,
 * Integrations). Each collection is fetched once per build and shared by
 * every page and component that needs it.
 */
import { getAll, mediaUrl, type StrapiMedia } from './strapi';
import { demoBlogPosts, demoCaseStudies, demoIntegrations } from './demo-content';

/** Without STRAPI_URL the build uses the bundled demo content (see demo-content.ts). */
const useDemoContent = !import.meta.env.STRAPI_URL;
if (useDemoContent) console.warn('[cms] STRAPI_URL is not set — building with the bundled demo content.');

export interface BlogPost {
  name: string;
  slug: string;
  mainImage: string;
  excerpt: string;
  postBody: string;
  readTime: string;
  publishedDate: string;
  category: string;
  featured: boolean;
  authorName: string;
  authorPhoto: string;
  authorRole: string;
  articleImage1: string;
  articleImage2: string;
  postBodyContinued: string;
}

export interface CaseStudy {
  name: string;
  slug: string;
  order: number;
  company: string;
  industry: string;
  excerpt: string;
  quote: string;
  longQuote: string;
  authorName: string;
  authorRole: string;
  authorPhoto: string;
  companyLogo: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  mainImage: string;
  cardPhoto: string;
  articleImage: string;
  clientSummary: string;
  featuresSummary: string;
  resultSummary: string;
  body: string;
  bodyContinued: string;
}

export interface Integration {
  name: string;
  slug: string;
  order: number;
  logo: string;
  mainImage: string;
  excerpt: string;
  body: string;
  category: string;
  filterCategory: string;
  website: string;
}

type Raw = Record<string, unknown>;

/** Replace every Strapi media object with its absolute URL. */
function flatten<T>(entry: Raw, mediaFields: string[]): T {
  const out: Raw = { ...entry };
  for (const key of mediaFields) out[key] = mediaUrl(entry[key] as StrapiMedia | null);
  for (const [key, value] of Object.entries(out)) if (value === null) out[key] = '';
  return out as T;
}

const cache = new Map<string, Promise<unknown[]>>();
function once<T>(key: string, load: () => Promise<T[]>): Promise<T[]> {
  if (!cache.has(key)) cache.set(key, load());
  return cache.get(key) as Promise<T[]>;
}

/** All blog posts, newest first (by Published date). */
export const getBlogPosts = () =>
  once<BlogPost>('blog-posts', async () =>
    useDemoContent ? (demoBlogPosts() as unknown as BlogPost[]) : (await getAll<Raw>('blog-posts', { sort: 'publishedDate:desc' })).map((e) =>
      flatten<BlogPost>(e, ['mainImage', 'authorPhoto', 'articleImage1', 'articleImage2']),
    ),
  );

/** All case studies in their display order. */
export const getCaseStudies = () =>
  once<CaseStudy>('case-studies', async () =>
    useDemoContent ? (demoCaseStudies() as unknown as CaseStudy[]) : (await getAll<Raw>('case-studies', { sort: 'order:asc' })).map((e) =>
      flatten<CaseStudy>(e, ['authorPhoto', 'companyLogo', 'mainImage', 'cardPhoto', 'articleImage']),
    ),
  );

/** All integrations in their display order. */
export const getIntegrations = () =>
  once<Integration>('integrations', async () =>
    useDemoContent ? (demoIntegrations() as unknown as Integration[]) : (await getAll<Raw>('integrations', { sort: 'order:asc' })).map((e) =>
      flatten<Integration>(e, ['logo', 'mainImage']),
    ),
  );

/** Posts with "Featured" switched on, newest first. */
export async function getFeaturedPosts(limit?: number, offset = 0) {
  const posts = (await getBlogPosts()).filter((p) => p.featured);
  return posts.slice(offset, limit === undefined ? undefined : offset + limit);
}

/** Posts with "Featured" switched off, newest first. */
export async function getRegularPosts(limit?: number) {
  return (await getBlogPosts()).filter((p) => !p.featured).slice(0, limit);
}

export const blogUrl = (post: Pick<BlogPost, 'slug'>) => `/blog/${post.slug}`;
export const caseStudyUrl = (item: Pick<CaseStudy, 'slug'>) => `/case-study/${item.slug}`;
export const integrationUrl = (item: Pick<Integration, 'slug'>) => `/integration/${item.slug}`;

/** "September 26, 2026" — the date format used across the theme. */
export function formatDate(value: string): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}
