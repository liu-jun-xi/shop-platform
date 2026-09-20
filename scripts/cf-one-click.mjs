/**
 * One-click Cloudflare setup + deploy.
 * Usage: node scripts/cf-one-click.mjs
 * Requires: npx wrangler login (once)
 */
import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wranglerToml = path.join(root, 'wrangler.toml');
const D1_NAME = 'shop-db';
const R2_PRODUCTS = 'shop-products';
const R2_USERS = 'shop-users';

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}`);
  return execSync(cmd, {
    cwd: root,
    encoding: 'utf8',
    stdio: opts.silent ? 'pipe' : 'inherit',
    env: { ...process.env, ...opts.env }
  });
}

function runCapture(cmd) {
  console.log(`\n> ${cmd}`);
  const r = spawnSync(cmd, {
    cwd: root,
    encoding: 'utf8',
    shell: true,
    env: process.env
  });
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  if (r.status !== 0 && !optsAllowFail(cmd, out)) {
    console.error(out);
    throw new Error(`Command failed: ${cmd}`);
  }
  return out;
}

function optsAllowFail(cmd, out) {
  // R2 / D1 already exists is OK
  return /already exists|already exist|Duplicate|code: 10004|code: 10007|A bucket with this name already exists/i.test(out)
    || (cmd.includes('r2 bucket create') && /400|409|Conflict/i.test(out));
}

function ensureWranglerLogin() {
  try {
    const who = runCapture('npx wrangler whoami');
    if (/You are not authenticated|not logged in|Please login/i.test(who)) {
      throw new Error('not logged in');
    }
    console.log('Wrangler account OK');
  } catch {
    console.log('Please login to Cloudflare (browser will open)...');
    run('npx wrangler login');
  }
}

function createD1() {
  let toml = fs.readFileSync(wranglerToml, 'utf8');
  const currentId = (toml.match(/database_id\s*=\s*"([^"]+)"/) || [])[1];
  const isPlaceholder = !currentId || currentId === '00000000-0000-0000-0000-000000000001';

  if (!isPlaceholder) {
    console.log(`D1 already configured: ${currentId}`);
    return currentId;
  }

  let out = '';
  try {
    out = runCapture(`npx wrangler d1 create ${D1_NAME}`);
  } catch (e) {
    out = String(e.message || e);
    // Maybe already exists — try list
    const list = runCapture('npx wrangler d1 list');
    const m = list.match(new RegExp(`${D1_NAME}[^\\n]*?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})`, 'i'))
      || list.match(new RegExp(`([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})[^\\n]*${D1_NAME}`, 'i'));
    if (m) {
      const id = m[1];
      toml = toml.replace(/database_id\s*=\s*"[^"]+"/, `database_id = "${id}"`);
      fs.writeFileSync(wranglerToml, toml, 'utf8');
      console.log(`Linked existing D1 ${D1_NAME}: ${id}`);
      return id;
    }
    throw e;
  }

  const idMatch = out.match(/database_id\s*=\s*"([0-9a-f-]{36})"/i)
    || out.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/);
  if (!idMatch) {
    throw new Error('Could not parse D1 database_id from wrangler output:\n' + out);
  }
  const id = idMatch[1];
  toml = toml.replace(/database_id\s*=\s*"[^"]+"/, `database_id = "${id}"`);
  fs.writeFileSync(wranglerToml, toml, 'utf8');
  console.log(`Wrote database_id to wrangler.toml: ${id}`);
  return id;
}

function createR2(name) {
  try {
    runCapture(`npx wrangler r2 bucket create ${name}`);
    console.log(`R2 bucket ready: ${name}`);
  } catch (e) {
    const msg = String(e.message || e);
    if (/already exists|already exist|10004|Conflict|400|409/i.test(msg)) {
      console.log(`R2 bucket already exists: ${name}`);
      return;
    }
    // wrangler may print success to stderr; treat soft
    console.log(`R2 create note for ${name}: ${msg.slice(0, 200)}`);
  }
}

function setJwtSecret() {
  const secret = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
  console.log('\nSetting JWT_SECRET (generated random if JWT_SECRET env not set)...');
  // Non-interactive secret put via stdin
  const r = spawnSync('npx', ['wrangler', 'secret', 'put', 'JWT_SECRET'], {
    cwd: root,
    input: secret,
    encoding: 'utf8',
    shell: true
  });
  if (r.status !== 0) {
    console.error(r.stdout, r.stderr);
    throw new Error('Failed to put JWT_SECRET');
  }
  console.log('JWT_SECRET set on Worker');
}

function main() {
  console.log('=== Cloudflare one-click setup ===');
  console.log('Project:', root);

  ensureWranglerLogin();
  createD1();
  createR2(R2_PRODUCTS);
  createR2(R2_USERS);

  console.log('\nInstalling deps + building frontend...');
  run('npm run install:all');
  run('npm run build');

  console.log('\nApplying D1 migrations (remote)...');
  run('npx wrangler d1 migrations apply shop-db --remote');

  setJwtSecret();

  console.log('\nDeploying Worker...');
  run('npx wrangler deploy');

  console.log('\n=== Done ===');
  console.log('Default admin: admin / 123456  (change immediately)');
  console.log('Open the workers.dev URL printed above, or bind a custom domain in Cloudflare dashboard.');
}

main();
