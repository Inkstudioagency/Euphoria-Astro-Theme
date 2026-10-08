import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS')!,
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
  // Strapi MCP server (http://localhost:1337/mcp) — lets AI clients such as
  // Claude Code manage Blog Posts, Case Studies and Integrations with an Admin token.
  // https://docs.strapi.io/cms/features/strapi-mcp-server
  mcp: {
    enabled: env.bool('STRAPI_MCP_ENABLED', true),
  },
});

export default config;
