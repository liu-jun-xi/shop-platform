/**
 * One-click: auto-create D1 + R2 (via Wrangler provision), migrate, secret, deploy.
 * Usage:
 *   npm run install:all
 *   npx wrangler login
 *   npm run cf:one-click
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

function runCapture(cmd, { allowFail = false } = {}) {
  console.log(`\n> ${cmd}`);
  const r = spawnSync(cmd, {
    cwd: root,
    encoding: 'utf8',
    shell: true,
    env: process.env
  });
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  if (r.status !== 0 && !allowFail) {
    console.error(out);
    throw new Error(`Command failed: ${cmd}`);
  }
  return out;
}

function ensureWranglerLogin() {
  const who = runCapture('npx wrangler whoami', { allowFail: true });
  if (/not authenticated|not logged in|Please login|Unable to authenticate/i.test(who) || !/Account|email|@/i.test(who)) {
    console.log('Opening browser for Cloudflare login...');
    run('npx wrangler login');
  } else {
    console.log('Wrangler account OK');
  }
}

function writeDatabaseId(id) {
  let toml = fs.readFileSync(wranglerToml, 'utf8');
  if (/database_id\s*=/.test(toml)) {
    toml = toml.replace(/database_id\s*=\s*"[^"]*"/, `database_id = "${id}"`);
  } else {
    toml = toml.replace(
      /database_name\s*=\s*"shop-db"/,
      `database_name = "shop-db"\ndatabase_id = "${id}"`
    );
  }
  fs.writeFileSync(wranglerToml, toml, 'utf8');
  console.log(`database_id written to wrangler.toml: ${id}`);
}

function findD1IdFromList() {
  const list = runCapture('npx wrangler d1 list', { allowFail: true });
  // JSON mode if available
  try {
    const jsonOut = runCapture('npx wrangler d1 list --json', { allowFail: true });
    const data = JSON.parse(jsonOut.trim().split('\n').filter(l => l.startsWith('[') || l.startsWith('{')).join('\n') || jsonOut);
    const rows = Array.isArray(data) ? data : (data?.databases || data?.result || []);
    const hit = rows.find(r => (r.name || r.database_name) === D1_NAME);
    if (hit?.uuid || hit?.id) return hit.uuid || hit.id;
  } catch { /* fall through */ }

  const re = new RegExp(`${D1_NAME}[^\\n]*?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})`, 'i');
  const re2 = new RegExp(`([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})[^\\n]*${D1_NAME}`, 'i');
  const m = list.match(re) || list.match(re2);
  return m?.[1] || null;
}

/** Prefer Wrangler auto-provision on deploy; fall back to explicit create. */
function ensureD1AndR2() {
  console.log('\n--- Ensuring D1 + R2 exist ---');

  // Explicit create is reliable even before first deploy
  const d1Create = runCapture(`npx wrangler d1 create ${D1_NAME}`, { allowFail: true });
  let id =
    (d1Create.match(/database_id\s*=\s*"([0-9a-f-]{36})"/i) || [])[1] ||
    (d1Create.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/) || [])[1];

  if (!id) {
    id = findD1IdFromList();
  }
  if (!id) {
    throw new Error('Failed to create or locate D1 database shop-db. Check Cloudflare account permissions.');
  }
  writeDatabaseId(id);

  for (const name of [R2_PRODUCTS, R2_USERS]) {
    const out = runCapture(`npx wrangler r2 bucket create ${name}`, { allowFail: true });
    if (/Created|Success|already exists|already exist|10004|Conflict|ok/i.test(out) || !out.includes('ERROR')) {
      console.log(`R2 ready: ${name}`);
    } else {
      console.log(`R2 create output for ${name}:\n${out.slice(0, 300)}`);
    }
  }
}

function setJwtSecret() {
  const secret = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
  console.log('\nSetting JWT_SECRET...');
  const r = spawnSync('npx', ['wrangler', 'secret', 'put', 'JWT_SECRET'], {
    cwd: root,
    input: secret + '\n',
    encoding: 'utf8',
    shell: true
  });
  if (r.status !== 0) {
    console.error(r.stdout, r.stderr);
    throw new Error('Failed to put JWT_SECRET — set CLOUDFLARE token permissions or run: npx wrangler secret put JWT_SECRET');
  }
  console.log('JWT_SECRET set');
}

function main() {
  console.log('=== Cloudflare one-click (auto D1 + R2) ===');
  console.log('Project:', root);

  ensureWranglerLogin();
  ensureD1AndR2();

  console.log('\nInstalling deps + building...');
  run('npm run install:all');
  run('npm run build');

  console.log('\nApplying remote D1 migrations...');
  run(`npx wrangler d1 migrations apply ${D1_NAME} --remote`);

  console.log('\nDeploying Worker (also links bindings)...');
  run('npx wrangler deploy');

  setJwtSecret();

  console.log('\n=== Done ===');
  console.log('D1: shop-db | R2: shop-products, shop-users');
  console.log('Admin: admin / 123456  (change immediately)');
  console.log('Use the workers.dev URL from deploy output.');
}

main();
