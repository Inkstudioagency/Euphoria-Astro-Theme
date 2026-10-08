# Euphoria — Theme Customization Guide

This guide covers installing, customizing, managing content and deploying the Euphoria Astro theme.

## 1. Overview

Euphoria is a marketing site for fintech and SaaS products, made of two projects in one repository:

- **The Astro site** (project root): static pages, components, styles and animations.
- **The Strapi CMS** (`strapi/`): Blog Posts, Case Studies and Integrations. The site reads them at build time.

Everything that is not CMS content (headlines, pricing tables, FAQs, team members…) lives in the page section components, as in any Astro project.

## 2. Requirements

| Tool | Version |
| --- | --- |
| Node.js | 22.12 or newer |
| Astro | 7.x (installed by `npm install`) |
| Strapi | 5.57 (installed in `strapi/`) |

## 3. Installation

```bash
# 1. CMS
cd strapi
npm install
npm run setup        # creates strapi/.env with random secrets
npm run seed         # loads the demo content; run it while Strapi is NOT running
npm run develop      # opens http://localhost:1337/admin — create your admin account

# 2. Site (new terminal, project root)
npm install
cp .env.example .env
npm run dev          # http://localhost:4321
```

`npm run seed` also gives the Strapi **Public** role read access (find / findOne) to the three collections, so the site works without an API token.

**No CMS yet?** Leave `STRAPI_URL` empty and the site builds from the same demo content that the seed loads (`strapi/data/*.json` and `strapi/data/uploads/`). The live demo is built this way. Set `STRAPI_URL` when your Strapi is ready and the site switches to it.

## 4. Commands

| Where | Command | What it does |
| --- | --- | --- |
| root | `npm run dev` | Dev server at `localhost:4321` |
| root | `npm run build` | Static build to `dist/` (Strapi must be reachable) |
| root | `npm run preview` | Serve the build locally |
| `strapi/` | `npm run setup` | Create `.env` with random secrets |
| `strapi/` | `npm run develop` | Strapi with the admin panel |
| `strapi/` | `npm run seed` | Create or update the demo content (stop Strapi first) |
| `strapi/` | `npm run build`, `npm run start` | Production build and start |

## 5. Folder structure

```text
public/
  fonts/            Switzer (woff2) and Satoshi (otf)
  images/           all static images and icons
  videos/           background videos and their posters
  documents/        Lottie animation files (JSON)
  js/forms.js       form submission (see §15)
  robots.txt
src/
  components/
    global/         Navbar.astro, Footer.astro, SEO.astro, InteractionPreload.astro
    sections/       page sections — one folder per page, shared/ for sections used on several pages
    cms/            lists fed by Strapi (BlogCardList, FeaturedPostList, CaseStudyGrid, …)
    detail/         hero + article for the three CMS detail pages
    ui/             ArrowIcon, VideoLightboxData
  config/
    site.ts         brand, CTA, social links, promo video, copyright
    navigation.ts   navbar links, Pages mega menu, footer columns
  layouts/
    BaseLayout.astro
  lib/
    strapi.ts       REST client (build time only)
    cms.ts          typed loaders: getBlogPosts, getFeaturedPosts, getRegularPosts, getCaseStudies, getIntegrations
  pages/            routes (see §6)
  scripts/          animations and interactions (see §16)
  styles/
    normalize.css, base.css        browser reset and component base styles
    theme.css                      theme styles and design tokens (:root)
    custom.css                     put your own CSS here
strapi/
  config/server.ts  server + MCP settings
  src/api/          blog-post, case-study, integration content types
  data/             demo content (JSON) and data/uploads/ images
  scripts/          seed.js, setup-env.js
```

## 6. Pages and routes

| Route | File | CMS data |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | case studies (testimonial slider), 3 featured posts |
| `/home-v2` | `src/pages/home-v2.astro` | case studies (card slider), 4 featured posts |
| `/home-v3` | `src/pages/home-v3.astro` | case studies (two testimonial rows), posts 4–6 |
| `/about-v1` | `src/pages/about-v1.astro` | case studies, 3 featured posts |
| `/about-v2` | `src/pages/about-v2.astro` | case studies, 4 featured posts |
| `/about-v3` | `src/pages/about-v3.astro` | case studies (two rows), 3 featured posts |
| `/contact-v1`, `/contact-v2`, `/contact-v3` | `src/pages/contact-v*.astro` | — |
| `/features` | `src/pages/features.astro` | case studies (testimonial slider) |
| `/pricing` | `src/pages/pricing.astro` | — |
| `/blog` | `src/pages/blog/index.astro` | 3 featured posts (hero), all non-featured posts (grid) |
| `/blog/[slug]` | `src/pages/blog/[slug].astro` | one post + 3 featured posts |
| `/case-studies` | `src/pages/case-studies.astro` | all case studies |
| `/case-study/[slug]` | `src/pages/case-study/[slug].astro` | one case study |
| `/integrations` | `src/pages/integrations.astro` | all integrations (with filter pills) |
| `/integration/[slug]` | `src/pages/integration/[slug].astro` | one integration + the first 3 integrations |
| `/style-guide` | `src/pages/style-guide.astro` | — (not indexed) |
| `/404` | `src/pages/404.astro` | — (not indexed) |

To remove a page, delete its file in `src/pages/` and remove its links from `src/config/navigation.ts`.

## 7. Components and layout

- **`BaseLayout.astro`** wraps every page: `<head>` (SEO, fonts, preload styles), Navbar, Footer and the shared scripts. Props: `title`, `description`, `image`, `type`, `noindex`, `navVariant` (`'base'` or `'overlay'`, used on Home V3) and `scripts`.
- **Section components** (`src/components/sections/**`) hold each page's content. Edit text, images and links there directly. Sections in `shared/` (Marquee, Faq, FaqV2, FaqV3, CtaSimple, CtaDark, BlogHorizontal, VideoTestimonial) appear on several pages, so a change there updates all of them.
- **CMS lists** (`src/components/cms/`):

| Component | Props | Used on |
| --- | --- | --- |
| `BlogCardList` | `posts`, `variant` (`stacked`, `stacked-arrow`, `horizontal`, `grid`, `overlay`, `overlay-link`), `cardHover`, `arrowLabel` | home, about, blog, blog posts |
| `FeaturedPostList` | `posts` | blog hero |
| `TestimonialSlideList` | `items` | Home V1, About V1, Features |
| `TestimonialCardList` | `items`, `direction`, `compact`, `lazy` | Home V3, About V3 |
| `CaseCardSlider` | `items` | Home V2, About V2 |
| `CaseStudyGrid` | `items` | Case Studies |
| `IntegrationGrid` | `items`, `filterable` | Integrations, integration pages |

To change which posts a section shows, edit the line at the top of the section file, for example `const list1 = await getFeaturedPosts(3);`.

> **Keep the element structure, classes and attributes** (`reveal-anim-1`, `hero-title`, `card-hover`, `data-w-id`…). The animations target them. Changing text, images and links is always safe.

## 8. Colors, typography and spacing

All design tokens are CSS variables in the `:root` block at the top of `src/styles/theme.css`:

| Token | Default |
| --- | --- |
| `--_color---primary-color--400` (accent orange) | `#ff6b1e` |
| `--_color---gray-color--900` (dark / primary button) | `#0d0f12` |
| `--_color---gray-color--800` (headings) | `#212529` |
| `--_color---gray-color--600` (body text) | `#495057` |
| `--_typography---font-family--body-font-family` | `Satoshi, Arial, sans-serif` |
| `--_typography---font-family--heading-font-family` | same as body |

Change a value there and it updates everywhere. Type sizes (`--_typography---typography--h1` … `h6`), line heights, letter spacing and spacers live in the same block.

**Fonts.** Switzer and Satoshi are self-hosted from `public/fonts/` through `@font-face` rules at the top of `theme.css`. To use another font, add its files to `public/fonts/`, add `@font-face` rules in `src/styles/custom.css`, and point the font-family variables at it. Update the `<link rel="preload">` in `BaseLayout.astro` too.

Add your own rules to `src/styles/custom.css`. It loads last, so it wins over the theme styles.

## 9. Header, navigation and footer

- **Links and labels:** `src/config/navigation.ts` (`mainNav`, `megaMenu`, `footerNav`).
- **Logo, CTA button, copyright, credits, social links:** `src/config/site.ts`.
- **Markup:** `src/components/global/Navbar.astro` and `Footer.astro`. The active page is highlighted automatically.

Keep social links on root domains (`https://x.com`) in the demo, and replace them with your profiles on your own site.

## 10. Images and assets

Static images live in `public/images/` and are referenced as `/images/<file>`. To replace one, overwrite the file with the same name, or change the `src` in the section component. Many images also have smaller versions (`-p-500`, `-p-800`, `-p-1080`…) listed in `srcset`. Replace those too, or remove the `srcset`/`sizes` attributes.

CMS images (blog, case studies, integrations) are uploaded in Strapi's Media Library.

Background videos are in `public/videos/` (`_mp4.mp4`, `_webm.webm` and a `_poster` image per video). The video opened by the "Watch Video" buttons is set by `site.video.youtubeId` in `src/config/site.ts`.

## 11. Strapi CMS

### Content types

All three use Draft & Publish. The site shows published entries only.

**Blog Post** (`api::blog-post.blog-post`)

| Field | Type | Notes |
| --- | --- | --- |
| name | text | title (required) |
| slug | UID | URL: `/blog/<slug>` |
| mainImage | image | card and hero image |
| excerpt | long text | cards and meta description |
| postBody, postBodyContinued | rich text | article before and after the two inline images; HTML is supported |
| articleImage1, articleImage2 | image | the two inline images |
| readTime | text | e.g. `5 min read` |
| publishedDate | date-time | sort order (newest first) and card date |
| category | enum | Automation, Finance, Product, Company |
| featured | boolean | featured posts fill the journal sections and blog hero |
| authorName, authorRole, authorPhoto | text / image | author info |

**Case Study** (`api::case-study.case-study`)

| Field | Type | Notes |
| --- | --- | --- |
| name, slug | text / UID | URL: `/case-study/<slug>` |
| order | integer | display order (1 first) |
| company, industry | text | card labels |
| excerpt | long text | cards and meta description |
| quote / longQuote | long text | short quote (testimonials, detail page) / long quote (Home V2 card slider) |
| authorName, authorRole, authorPhoto | text / image | quoted person |
| companyLogo | image | logo on cards and hero |
| stat1Value, stat1Label, stat2Value, stat2Label | text | the two result stats |
| mainImage, cardPhoto, articleImage | image | detail hero / Home V2 card photo / image inside the article |
| clientSummary, featuresSummary, resultSummary | text | the three summary cards |
| body, bodyContinued | rich text | article before and after `articleImage` |

**Integration** (`api::integration.integration`)

| Field | Type | Notes |
| --- | --- | --- |
| name, slug | text / UID | URL: `/integration/<slug>` |
| order | integer | display order (1 first) |
| logo | image | card and hero logo |
| mainImage | image | spare image field |
| excerpt | long text | card text, hero summary, meta description |
| body | rich text | setup guide on the detail page |
| category | text | tag on the "more integrations" cards |
| filterCategory | text | tag and filter on the Integrations page: `Finance`, `Human resource`, `CRM` or `Marketing` |
| website | text | the app's website |

To add a filter category, add a pill with `data-filter="<Category>"` in `src/components/sections/integrations/Integrations.astro` and use the same text in `filterCategory`.

### Managing content

Open `http://localhost:1337/admin` → **Content Manager**, pick a collection, create or edit an entry and click **Publish**. Then rebuild the site (in production, the deploy webhook does this — see §17).

### Seeding

`npm run seed` (in `strapi/`, with Strapi stopped) uploads `data/uploads/*`, then creates or updates every entry in `data/*.json` by slug and publishes it. It refuses to run while Strapi is running, because a dev-server reload during seeding can break the content types.

### Connecting AI assistants (Strapi MCP server)

The Strapi MCP server is on by default (`mcp.enabled` in `strapi/config/server.ts`, or `STRAPI_MCP_ENABLED=false` in `strapi/.env` to turn it off). It lets an AI client list, create, update, publish and unpublish entries and manage the Media Library, within the permissions of an admin token. It cannot create content types or upload new files.

1. In the Strapi admin panel, create an **Admin token** under Settings. Its owner's role caps what the token can do, so give it only the permissions you need.
2. Connect Claude Code:

   ```bash
   claude mcp add strapi-mcp --transport http http://localhost:1337/mcp -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

Never commit the token. Docs: https://docs.strapi.io/cms/features/strapi-mcp-server

## 12. Environment variables

**Site** (`.env` in the project root, see `.env.example`):

| Name | Required | Description | Example |
| --- | --- | --- | --- |
| `STRAPI_URL` | no | Strapi base URL, read at build time. Leave it empty to build from the bundled demo content (`strapi/data/`) | `http://localhost:1337` |
| `STRAPI_API_TOKEN` | no | Read-only API token. Only needed if the Public role cannot read the collections | — |
| `SITE_URL` | yes in production | Public site URL for canonical, Open Graph and sitemap | `https://example.com` |
| `PUBLIC_FORM_ENDPOINT` | no | Form backend URL. Empty = demo mode | `https://formspree.io/f/xxxx` |

**CMS** (`strapi/.env`, see `strapi/.env.example`): `HOST`, `PORT`, the secrets (`APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY`), `DATABASE_CLIENT`, `DATABASE_FILENAME` and `STRAPI_MCP_ENABLED`.

Never put Strapi variables in `PUBLIC_*` variables, and never commit `.env` files.

## 13. SEO

- Static pages: pass `title` and `description` to `BaseLayout` at the top of each file in `src/pages/`.
- CMS pages: the title is the entry name, the description is its excerpt, and the share image is its main image.
- Defaults (description, share image `/images/og-image.webp`): `src/config/site.ts`.
- Canonical and Open Graph URLs use `SITE_URL`.
- `@astrojs/sitemap` creates `sitemap-index.xml` at build time (404 and Style Guide are excluded). `robots.txt` is generated from `SITE_URL` (`src/pages/robots.txt.ts`).
- `noindex` is set on `/404` and `/style-guide`.

## 14. Dynamic routes and slugs

`src/pages/blog/[slug].astro`, `case-study/[slug].astro` and `integration/[slug].astro` call `getStaticPaths()`, which creates one page per published entry using its `slug`. Changing a slug changes the URL, so update any links that point to it.

## 15. Forms

Contact, about and case-study forms keep the original markup and success/error messages. `public/js/forms.js` sends them:

1. Create a form endpoint with any provider that accepts `POST` with form data (Formspree, Web3Forms, Basin, your own API).
2. Set `PUBLIC_FORM_ENDPOINT` in `.env` (and in Vercel) and rebuild.

The fields are sent with their `name` attributes, plus `form-name` (the form's `data-name`). While sending, the button shows its `data-wait` text. On success the form hides and the success message shows. On failure the error message shows. Without an endpoint, forms run in **demo mode**: they show success and send nothing.

## 16. Animations

All animations use [GSAP](https://gsap.com) (with ScrollTrigger and SplitText), [Lenis](https://lenis.darkroom.engineering) and [lottie-web](https://github.com/airbnb/lottie-web), installed from npm. `src/scripts/main.ts` is the entry point; Astro bundles it and `BaseLayout.astro` loads it on every page.

| File (`src/scripts/`) | What it does |
| --- | --- |
| `interactions.js` | Page-load and scroll reveals, split-text titles, parallax images, card hovers, mega menu and mobile menu, FAQ accordion, About V1 journey and mission cards, About V2 timeline, Home V2 growth accordion, Home V3 feature steps, stat cards and video expand, Lottie icons, video lightbox, background-video buttons |
| `template-interactions.js` | Card sliders, office slider, blog accordion, filter pills, marquees, timeline year highlight, mobile-menu scroll lock |
| `smooth-scroll.js` | Lenis smooth scrolling |
| `counter.js` | Number count-up (`data-counter`) |

You opt an element into an animation by giving it an attribute:

| Attribute | Effect |
| --- | --- |
| `page-load-1` … `page-load-7` | Fades up when the page loads, 0.2s apart |
| `hero-title` | Letters fade up when the page loads |
| `reveal-anim-1` … `reveal-anim-6` | Fades up when scrolled into view, delayed 0s … 1s |
| `reveal-2s` | Fades in when scrolled into view |
| `section-title` | Letters fade up when scrolled into view |
| `text-color-reveal` / `text-scroll-reveal` | Letter colour / opacity follows the scroll |

Durations, delays and easings are written next to each animation in `interactions.js` (the shared fade-up easing is the `EASE` constant at the top). Before the scripts run, `src/components/global/InteractionPreload.astro` hides the animated elements so nothing flashes; `interactions.js` reveals them once their start state is set. If you add a new attribute or class to that file, add the matching animation too.

- **Reduced motion:** with "reduce motion" turned on, content appears in its final state and hover/scroll effects are skipped.
- **Turn off smooth scrolling:** remove `initSmoothScroll();` from `src/scripts/main.ts`.

## 17. Deployment

The site is static, so Strapi only has to be reachable while the site builds.

1. **Host Strapi** (Strapi Cloud, Railway, Render…) with a Postgres database. Set the same secrets as in `strapi/.env`, plus the database variables. To load the demo content there, run `npm run seed` once with `strapi/.env` pointing at the production database. Then create your admin account.
2. **Deploy the site on Vercel:** import the repository. Vercel detects Astro. Under Settings → Environment Variables, set `STRAPI_URL` (your hosted Strapi), `SITE_URL` (your domain) and, if used, `STRAPI_API_TOKEN` and `PUBLIC_FORM_ENDPOINT`. Deploy.
3. **Rebuild on publish:** in Vercel, create a Deploy Hook (Settings → Git → Deploy Hooks). In Strapi, go to Settings → Webhooks, create a webhook with that URL and select the entry create, update, delete, publish and unpublish events.

## 18. Troubleshooting

| Problem | Fix |
| --- | --- |
| Build log says `building with the bundled demo content` | `STRAPI_URL` is empty. Set it to use your Strapi content |
| Build fails with `Strapi 403` | The Public role can't read the collection. Run `npm run seed`, or enable find/findOne under Settings → Users & Permissions → Roles → Public, or set `STRAPI_API_TOKEN` |
| Build fails with `Strapi 401` | `STRAPI_API_TOKEN` is wrong or expired |
| `fetch failed` / `ECONNREFUSED` | Strapi isn't running or `STRAPI_URL` points to the wrong host/port |
| CMS lists show "No items found." | Nothing is published in that collection |
| New content doesn't show | Rebuild the site (or set up the deploy webhook) |
| `npm run seed` says the port is in use | Stop `npm run develop` first |
| Strapi says `unable to open database file` | Set `DATABASE_FILENAME=.tmp/data.db` in `strapi/.env` |
| Forms always show success | `PUBLIC_FORM_ENDPOINT` is empty (demo mode) |
| Animations don't play / content stays hidden | Check the browser console for errors in `src/scripts/`. An element listed in `InteractionPreload.astro` stays hidden if its script fails |

## 19. Credits and licenses

- Design: Inks Studio — https://inks.studio
- Fonts: Switzer and Satoshi, Indian Type Foundry via Fontshare (ITF Free Font License)
- GSAP 3.15 (ScrollTrigger, SplitText): GreenSock Standard "No Charge" License — https://gsap.com/standard-license
- Lenis: MIT · lottie-web: MIT
- Astro (MIT), Strapi Community Edition (MIT)

Euphoria is released under the MIT License (see `LICENSE`).
