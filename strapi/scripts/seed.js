'use strict';

/**
 * Seeds the Euphoria demo content: Blog Posts, Case Studies and Integrations.
 *
 *   npm run seed
 *
 * - Reads data/*.json and uploads the images in data/uploads to the Media Library.
 * - Creates or updates every entry by slug and publishes it (safe to run again).
 * - Gives the Public role read access (find / findOne) to the three collections
 *   so the Astro site can fetch published content.
 *
 * Runs Strapi programmatically, so no API token is needed. Stop `npm run develop`
 * first if you use the default SQLite database.
 */
const fs = require('fs');
const path = require('path');
const { createStrapi, compileStrapi } = require('@strapi/strapi');

/** `npm run seed -- --prune` also deletes entries whose slug is not in data/*.json. */
const PRUNE = process.argv.includes('--prune');
const DATA = path.join(__dirname, '..', 'data');
const UPLOADS = path.join(DATA, 'uploads');

const COLLECTIONS = [
  {
    file: 'blog-posts.json',
    uid: 'api::blog-post.blog-post',
    media: ['mainImage', 'authorPhoto', 'articleImage1', 'articleImage2'],
  },
  {
    file: 'case-studies.json',
    uid: 'api::case-study.case-study',
    media: ['authorPhoto', 'companyLogo', 'mainImage', 'cardPhoto', 'articleImage'],
  },
  {
    file: 'integrations.json',
    uid: 'api::integration.integration',
    media: ['logo', 'mainImage'],
  },
];

const MIME = { '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };

async function uploadFile(strapi, fileName, cache) {
  if (!fileName) return null;
  if (cache.has(fileName)) return cache.get(fileName);
  const existing = await strapi.query('plugin::upload.file').findOne({ where: { name: fileName } });
  if (existing) {
    cache.set(fileName, existing.id);
    return existing.id;
  }
  const filepath = path.join(UPLOADS, fileName);
  const { size } = fs.statSync(filepath);
  const mimetype = MIME[path.extname(fileName).toLowerCase()] || 'application/octet-stream';
  const [file] = await strapi
    .plugin('upload')
    .service('upload')
    .upload({
      files: { filepath, originalFilename: fileName, originalFileName: fileName, mimetype, size },
      data: { fileInfo: { name: fileName, alternativeText: '', caption: '' } },
    });
  cache.set(fileName, file.id);
  return file.id;
}

async function seedCollection(strapi, collection, cache) {
  const items = JSON.parse(fs.readFileSync(path.join(DATA, collection.file), 'utf8'));
  let created = 0;
  let updated = 0;
  for (const item of items) {
    const data = { ...item };
    for (const field of collection.media) data[field] = await uploadFile(strapi, item[field], cache);

    const existing = await strapi.documents(collection.uid).findFirst({ filters: { slug: item.slug }, status: 'draft' });
    if (existing) {
      await strapi.documents(collection.uid).update({ documentId: existing.documentId, data, status: 'published' });
      updated++;
    } else {
      await strapi.documents(collection.uid).create({ data, status: 'published' });
      created++;
    }
  }
  if (PRUNE) {
    const slugs = new Set(items.map((item) => item.slug));
    const all = await strapi.documents(collection.uid).findMany({ status: 'draft', fields: ['slug'], limit: 1000 });
    for (const doc of all.filter((d) => !slugs.has(d.slug))) {
      await strapi.documents(collection.uid).delete({ documentId: doc.documentId });
      console.log(`  pruned ${collection.uid} "${doc.slug}"`);
    }
  }
  const total = await strapi.documents(collection.uid).count({ status: 'published' });
  const ok = total >= items.length ? '✓' : '✗';
  console.log(`${ok} ${collection.uid}: ${items.length} in data, ${created} created, ${updated} updated, ${total} published`);
  return total >= items.length;
}

async function allowPublicRead(strapi) {
  const role = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
  if (!role) return;
  for (const { uid } of COLLECTIONS) {
    for (const action of ['find', 'findOne']) {
      const name = `${uid}.${action}`;
      const exists = await strapi.query('plugin::users-permissions.permission').findOne({ where: { action: name, role: role.id } });
      if (!exists) await strapi.query('plugin::users-permissions.permission').create({ data: { action: name, role: role.id } });
    }
  }
  console.log('✓ Public role can read Blog Posts, Case Studies and Integrations');
}

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
  const app = await createStrapi(await compileStrapi()).load();
  app.log.level = 'error';
  let ok = true;
  try {
    const cache = new Map();
    for (const collection of COLLECTIONS) ok = (await seedCollection(app, collection, cache)) && ok;
    await allowPublicRead(app);
  } finally {
    await app.destroy();
  }
  if (!ok) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
