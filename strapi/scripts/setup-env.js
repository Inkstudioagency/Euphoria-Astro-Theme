'use strict';

/**
 * Creates strapi/.env from .env.example with freshly generated secrets.
 *
 *   npm run setup
 *
 * Does nothing if .env already exists, so it never overwrites your keys.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, '..');
const target = path.join(root, '.env');
if (fs.existsSync(target)) {
  console.log('.env already exists — nothing to do.');
  process.exit(0);
}

const secret = () => crypto.randomBytes(16).toString('base64');
const env = fs
  .readFileSync(path.join(root, '.env.example'), 'utf8')
  .replace(/^APP_KEYS=.*$/m, `APP_KEYS="${[secret(), secret(), secret(), secret()].join(',')}"`)
  .replace(/=tobemodified$/gm, () => `=${secret()}`);

fs.writeFileSync(target, env);
console.log('Created strapi/.env with new secrets.');
