import path from 'path';
import type { Core } from '@strapi/strapi';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * On a fresh database (no Blog Posts, Case Studies or Integrations yet), load the
   * Euphoria demo content from data/ so a new install — local or Strapi Cloud — is
   * ready to use. Turn this off with SEED_DEMO_CONTENT=false.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    if (process.env.SEED_DEMO_CONTENT === 'false') return;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { seedDemoContent, isEmpty } = require(path.join(process.cwd(), 'scripts', 'seed-lib.js'));
    try {
      if (!(await isEmpty(strapi))) return;
      strapi.log.info('[seed] Empty database — loading the Euphoria demo content…');
      await seedDemoContent(strapi, { log: (message: string) => strapi.log.info(`[seed] ${message}`) });
    } catch (error) {
      strapi.log.error(`[seed] Demo content could not be loaded: ${(error as Error).message}`);
    }
  },
};
