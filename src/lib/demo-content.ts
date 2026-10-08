/**
 * Demo content fallback.
 *
 * When STRAPI_URL is not set, the site builds from the same demo content that
 * `npm run seed` loads into Strapi (strapi/data/*.json + strapi/data/uploads/).
 * This lets the theme build and preview without a running CMS. Set STRAPI_URL
 * to read live content from Strapi instead.
 */
import blogPosts from '../../strapi/data/blog-posts.json';
import caseStudies from '../../strapi/data/case-studies.json';
import integrations from '../../strapi/data/integrations.json';

const uploads = import.meta.glob('../../strapi/data/uploads/*', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

type Raw = Record<string, unknown>;

/** Turn the file names used in the demo JSON into built asset URLs. */
function withMedia(entry: Raw, mediaFields: string[]): Raw {
  const out: Raw = { ...entry };
  for (const key of mediaFields) {
    const file = entry[key];
    out[key] = typeof file === 'string' ? uploads[`../../strapi/data/uploads/${file}`] ?? '' : '';
  }
  for (const [key, value] of Object.entries(out)) if (value === null || value === undefined) out[key] = '';
  return out;
}

const byOrder = (a: Raw, b: Raw) => Number(a.order) - Number(b.order);

export const demoBlogPosts = () =>
  (blogPosts as Raw[])
    .map((e) => withMedia(e, ['mainImage', 'authorPhoto', 'articleImage1', 'articleImage2']))
    .sort((a, b) => new Date(String(b.publishedDate)).getTime() - new Date(String(a.publishedDate)).getTime());

export const demoCaseStudies = () =>
  (caseStudies as Raw[]).map((e) => withMedia(e, ['authorPhoto', 'companyLogo', 'mainImage', 'cardPhoto', 'articleImage'])).sort(byOrder);

export const demoIntegrations = () =>
  (integrations as Raw[]).map((e) => withMedia(e, ['logo', 'mainImage'])).sort(byOrder);
