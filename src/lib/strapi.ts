/**
 * Minimal Strapi v5 REST client. Server/build-time only — never import this
 * from a client-side <script>, so the API token never reaches the browser.
 */
const STRAPI_URL = import.meta.env.STRAPI_URL;
const TOKEN = import.meta.env.STRAPI_API_TOKEN;

type Query = Record<string, string | number | boolean>;

function baseUrl(): string {
  if (!STRAPI_URL) {
    throw new Error(
      'STRAPI_URL is not set. Copy .env.example to .env and point it at your Strapi server (see THEME-CUSTOMIZATION.md → CMS).',
    );
  }
  return STRAPI_URL;
}

export async function strapi<T>(path: string, query: Query = {}): Promise<T> {
  const url = new URL(`/api/${path}`, baseUrl());
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, String(value));
  const res = await fetch(url, { headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {} });
  if (!res.ok) throw new Error(`Strapi ${res.status} on ${url.pathname}${url.search}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

/** Fetch every published entry of a collection, following pagination. */
export async function getAll<T>(collection: string, query: Query = {}): Promise<T[]> {
  const out: T[] = [];
  let page = 1;
  let pageCount = 1;
  do {
    const res = await strapi<{ data: T[]; meta: { pagination: { pageCount: number } } }>(collection, {
      populate: '*',
      'pagination[page]': page,
      'pagination[pageSize]': 100,
      ...query,
    });
    out.push(...res.data);
    pageCount = res.meta.pagination.pageCount;
  } while (++page <= pageCount);
  return out;
}

export interface StrapiMedia {
  url: string;
  alternativeText?: string | null;
  width?: number | null;
  height?: number | null;
}

/** Absolute URL for a Strapi media object (local uploads return relative URLs). */
export function mediaUrl(media?: StrapiMedia | null): string {
  if (!media?.url) return '';
  return media.url.startsWith('http') ? media.url : new URL(media.url, baseUrl()).toString();
}
