'use strict';

/**
 * Euphoria demo content: Blog Posts, Case Studies and Integrations.
 *
 * - Uploads the images in data/uploads to the Media Library (once, by file name).
 * - Creates or updates every entry in data/*.json by slug and publishes it.
 * - Gives the Public role read access (find / findOne) to the three collections.
 *
 * Used by `npm run seed` (scripts/seed.js) and, on a fresh database, by the
 * bootstrap in src/index.ts.
 */
const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'data');
const UPLOADS = path.join(DATA, 'uploads');

const COLLECTIONS = [
  { file: 'blog-posts.json', uid: 'api::blog-post.blog-post', media: ['mainImage', 'authorPhoto', 'articleImage1', 'articleImage2'] },
  { file: 'case-studies.json', uid: 'api::case-study.case-study', media: ['authorPhoto', 'companyLogo', 'mainImage', 'cardPhoto', 'articleImage'] },
  { file: 'integrations.json', uid: 'api::integration.integration', media: ['logo', 'mainImage'] },
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

async function seedCollection(strapi, collection, cache, { prune, log }) {
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
  if (prune) {
    const slugs = new Set(items.map((item) => item.slug));
    const all = await strapi.documents(collection.uid).findMany({ status: 'draft', fields: ['slug'], limit: 1000 });
    for (const doc of all.filter((d) => !slugs.has(d.slug))) {
      await strapi.documents(collection.uid).delete({ documentId: doc.documentId });
      log(`  pruned ${collection.uid} "${doc.slug}"`);
    }
  }
  const total = await strapi.documents(collection.uid).count({ status: 'published' });
  const ok = total >= items.length;
  log(`${ok ? '✓' : '✗'} ${collection.uid}: ${items.length} in data, ${created} created, ${updated} updated, ${total} published`);
  return ok;
}

async function allowPublicRead(strapi, log) {
  const role = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
  if (!role) return;
  for (const { uid } of COLLECTIONS) {
    for (const action of ['find', 'findOne']) {
      const name = `${uid}.${action}`;
      const exists = await strapi.query('plugin::users-permissions.permission').findOne({ where: { action: name, role: role.id } });
      if (!exists) await strapi.query('plugin::users-permissions.permission').create({ data: { action: name, role: role.id } });
    }
  }
  log('✓ Public role can read Blog Posts, Case Studies and Integrations');
}

/** Seed everything. Returns true when every collection has all its demo entries. */
async function seedDemoContent(strapi, { prune = false, log = console.log } = {}) {
  const cache = new Map();
  let ok = true;
  for (const collection of COLLECTIONS) ok = (await seedCollection(strapi, collection, cache, { prune, log })) && ok;
  await allowPublicRead(strapi, log);
  return ok;
}

/** True when none of the three collections has any entry yet (a fresh database). */
async function isEmpty(strapi) {
  for (const { uid } of COLLECTIONS) if ((await strapi.documents(uid).count({ status: 'draft' })) > 0) return false;
  return true;
}

module.exports = { seedDemoContent, isEmpty, COLLECTIONS };
