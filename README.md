# Euphoria: Fintech & SaaS Astro Theme

Euphoria is a polished marketing theme for finance, fintech and SaaS products. It has three home pages, three about pages, three contact pages, and a blog, case studies and integrations that are managed in Strapi. Built with Astro 7 and Strapi 5, with GSAP-powered scroll and hover animations and smooth scrolling.

**Live demo:** https://euphoria-astro.vercel.app

## Features

- 16 page templates: Home V1–V3, About V1–V3, Contact V1–V3, Features, Pricing, Blog, Case Studies, Integrations, Style Guide and 404
- Three CMS collections in Strapi (Blog Posts, Case Studies, Integrations), each with listing sections and its own detail page (`/blog/[slug]`, `/case-study/[slug]`, `/integration/[slug]`)
- Demo content included: one command seeds 26 entries and their images into Strapi
- Responsive layout tuned for desktop, tablet and mobile
- Page-load, scroll-reveal, counter, marquee, slider, accordion and mega-menu interactions
- SEO built in: per-page titles and descriptions, canonical URLs, Open Graph and Twitter tags, sitemap and robots.txt
- Forms that post to any form backend (Formspree, Web3Forms, Basin…) through one environment variable
- Strapi MCP server enabled, so AI assistants such as Claude Code can manage your content

## Tech stack

Astro 7 · Strapi 5 (headless CMS) · GSAP 3 (ScrollTrigger, SplitText) · Lenis smooth scroll · lottie-web · Switzer and Satoshi fonts

## Quick start

You need **Node.js 22.12 or newer**.

1. **Start the CMS** (in a first terminal):

   ```bash
   cd strapi
   npm install
   npm run setup             # creates strapi/.env with random secrets
   npm run seed              # loads the demo content (run it while Strapi is stopped)
   npm run develop           # http://localhost:1337/admin — create your admin account
   ```

2. **Start the site** (in a second terminal, from the project root):

   ```bash
   npm install
   cp .env.example .env      # STRAPI_URL=http://localhost:1337 (leave empty to use the bundled demo content)
   npm run dev               # http://localhost:4321
   ```

## Commands

Run from the project root:

| Command | Action |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the dev server at `localhost:4321` |
| `npm run build` | Build the production site to `./dist/` (Strapi must be running) |
| `npm run preview` | Preview the production build locally |

Run from `strapi/`:

| Command | Action |
| --- | --- |
| `npm run setup` | Create `strapi/.env` with random secrets (skips if it exists) |
| `npm run develop` | Start Strapi with the admin panel at `localhost:1337/admin` |
| `npm run seed` | Create or update the demo content (stop Strapi first) |
| `npm run build` / `npm run start` | Build and run Strapi in production |

## Project structure

```text
/
├── public/            fonts, images, videos, Lottie files and the form script
├── src/
│   ├── components/
│   │   ├── global/    Navbar, Footer, SEO, animation preload styles
│   │   ├── sections/  page sections (one folder per page, shared/ for reused ones)
│   │   ├── cms/       CMS-driven lists (blog cards, case studies, integrations, testimonials)
│   │   ├── detail/    hero + article blocks for the CMS detail pages
│   │   └── ui/        small building blocks
│   ├── config/        site.ts (brand, contact, social, video) and navigation.ts (menus)
│   ├── layouts/       BaseLayout.astro
│   ├── lib/           Strapi client and typed CMS helpers
│   ├── pages/         routes
│   ├── scripts/       GSAP animations and interactions
│   └── styles/        design tokens and theme styles
└── strapi/            Strapi 5 project: content types, demo data and seed script
```

## Customize

- Brand name, logo, contact CTA, social links and the promo video: `src/config/site.ts`
- Navbar, mega menu and footer links: `src/config/navigation.ts`
- Colors, fonts and spacing: the `:root` variables at the top of `src/styles/theme.css`
- Your own CSS: `src/styles/custom.css`
- Environment variables: `.env.example`

The full guide is in [THEME-CUSTOMIZATION.md](./THEME-CUSTOMIZATION.md).

## Deployment

The site builds to static HTML. Deploy it on Vercel (or any static host) and set `SITE_URL`. Without `STRAPI_URL` it builds from the bundled demo content; to use your CMS, host Strapi somewhere it can be reached at build time and set `STRAPI_URL` (and `STRAPI_API_TOKEN` if the Public role can't read the collections). Add a Strapi webhook that calls your Vercel deploy hook so publishing content rebuilds the site. The steps are in [THEME-CUSTOMIZATION.md](./THEME-CUSTOMIZATION.md#17-deployment).

## Credits & license

- Design: [Inks Studio](https://inks.studio)
- Fonts: Switzer and Satoshi by the Indian Type Foundry (Fontshare)
- Libraries: [Astro](https://astro.build), [Strapi](https://strapi.io), [GSAP](https://gsap.com) (Standard "No Charge" License), [Lenis](https://github.com/darkroomengineering/lenis) (MIT), [lottie-web](https://github.com/airbnb/lottie-web) (MIT)

Euphoria is released under the [MIT License](./LICENSE).
