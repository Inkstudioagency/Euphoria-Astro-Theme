'use strict';

/**
 * Seeds the Euphoria demo content (see scripts/seed-lib.js).
 *
 *   npm run seed              create or update the demo entries (safe to run again)
 *   npm run seed -- --prune   also delete entries whose slug is not in data/*.json
 *
 * Runs Strapi programmatically, so no API token is needed. Stop `npm run develop`
 * first. A fresh database is also seeded automatically on startup (src/index.ts).
 */
const path = require('path');
const { createStrapi, compileStrapi } = require('@strapi/strapi');
const { seedDemoContent } = require('./seed-lib');

/**
 * Seeding while `npm run develop` is running is unsafe: the seed recompiles the
 * project, the dev server reloads mid-way and can drop content types and
 * permissions. Refuse to run if something answers on Strapi's port.
 */
function assertServerStopped() {
  const net = require('net');
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
  const port = Number(process.env.PORT || 1337);
  return new Promise((resolve, reject) => {
    const socket = net.connect({ port, host: '127.0.0.1' });
    socket.once('connect', () => {
      socket.destroy();
      reject(new Error(`Port ${port} is in use. Stop \`npm run develop\` (Ctrl+C) before running \`npm run seed\`.`));
    });
    socket.once('error', () => resolve());
  });
}

async function main() {
  await assertServerStopped();
  process.env.SEED_DEMO_CONTENT = 'false'; // the bootstrap must not seed as well
  const app = await createStrapi(await compileStrapi()).load();
  app.log.level = 'error';
  let ok = true;
  try {
    ok = await seedDemoContent(app, { prune: process.argv.includes('--prune') });
  } finally {
    await app.destroy();
  }
  if (!ok) process.exit(1);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
