import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mdPath = path.join(root, 'README.md');
let md = fs.readFileSync(mdPath, 'utf8');

if (md.includes('cf:one-click')) {
  console.log('README already updated');
  process.exit(0);
}

const t = (a) => String.fromCharCode(...a);
const section = [
  '',
  `## ${t([0x672c,0x673a])}${t([0x771f,0x6b63])}${t([0x4e00,0x952e,0x90e8,0x7f72])} (D1 + R2 + deploy)`,
  '',
  `${t([0x7f51,0x9875])} Deploy Button ${t([0x4ecd,0x9700,0x624b,0x52a8,0x521b,0x5efa])} D1/R2。${t([0x672c,0x673a,0x63a8,0x8350])}：`,
  '',
  '```bash',
  'npm run install:all',
  'npx wrangler login',
  'npm run cf:one-click',
  '```',
  '',
  `${t([0x811a,0x672c,0x4f1a,0x81ea,0x52a8])}：${t([0x521b,0x5efa])} D1/R2、${t([0x5199,0x5165])} database_id、${t([0x8fc1,0x79fb])}、${t([0x8bbe,0x7f6e])} JWT_SECRET、deploy。`,
  '',
].join('\n');

const anchor = `## ${t([0x4e00,0x952e,0x90e8,0x7f72,0x5230])} Cloudflare`;
if (md.includes(anchor)) {
  md = md.replace(anchor, section + anchor);
} else {
  md = section + '\n' + md;
}
fs.writeFileSync(mdPath, md, 'utf8');
console.log('README updated');
