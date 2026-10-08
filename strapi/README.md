# Euphoria CMS (Strapi 5)

The headless CMS for the Euphoria Astro theme. It holds three collections:

| Collection | API | Used on |
| --- | --- | --- |
| Blog Post | `/api/blog-posts` | Blog page, journal sections, `/blog/[slug]` |
| Case Study | `/api/case-studies` | Case Studies page, testimonial sliders, `/case-study/[slug]` |
| Integration | `/api/integrations` | Integrations page, `/integration/[slug]` |

## Setup

```bash
npm install
npm run setup     # creates .env with random secrets
npm run seed      # demo content + images, and public read access (Strapi must be stopped)
npm run develop   # http://localhost:1337/admin
```

- `data/*.json` and `data/uploads/` hold the demo content. `npm run seed` is safe to run again: it updates entries by slug.
- The MCP server is enabled at `http://localhost:1337/mcp` (`config/server.ts`). See `../THEME-CUSTOMIZATION.md` for connecting Claude Code.

Full documentation: [`../THEME-CUSTOMIZATION.md`](../THEME-CUSTOMIZATION.md).
