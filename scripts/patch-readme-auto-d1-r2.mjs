import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mdPath = path.join(root, 'README.md');
let md = fs.readFileSync(mdPath, 'utf8');
const t = (a) => String.fromCharCode(...a);

const block = [
  `## ${t([0x81ea,0x52a8,0x521b,0x5efa])} D1 / R2`,
  '',
  `${t([0x4e0d,0x7528,0x624b,0x52a8,0x5728,0x63a7,0x5236,0x53f0,0x70b9,0x521b,0x5efa])}。${t([0x672c,0x673a,0x6267,0x884c])}：`,
  '',
  '```bash',
  'npm run install:all',
  'npx wrangler login',
  'npm run cf:one-click',
  '```',
  '',
  `${t([0x811a,0x672c,0x4f1a])}：`,
  `1. \`wrangler d1 create shop-db\` ${t([0x5e76,0x5199,0x5165])} \`database_id\``,
  `2. \`wrangler r2 bucket create shop-products\` / \`shop-users\``,
  `3. ${t([0x8fc1,0x79fb])} D1`,
  `4. \`wrangler deploy\` ${t([0x7ed1,0x5b9a,0x8d44,0x6e90])} + ${t([0x8bbe,0x7f6e])} JWT_SECRET`,
  '',
  `${t([0x82e5,0x8d44,0x6e90,0x5df2,0x5b58,0x5728,0x4f1a,0x81ea,0x52a8,0x8df3,0x8fc7,0x521b,0x5efa])}。`,
  '',
].join('\n');

if (md.includes('wrangler d1 create shop-db')) {
  // replace old "本机真正一键" section if present, else insert after first ---
  if (md.includes(t([0x672c,0x673a]) + t([0x771f,0x6b63]))) {
    md = md.replace(
      new RegExp(`## ${t([0x672c,0x673a])}${t([0x771f,0x6b63])}[\\s\\S]*?(?=\\n## )`),
      block + '\n'
    );
  } else if (!md.includes(t([0x81ea,0x52a8,0x521b,0x5efa]) + ' D1')) {
    md = md.replace(/\n---\n/, '\n---\n\n' + block + '\n---\n');
  }
} else if (!md.includes(t([0x81ea,0x52a8,0x521b,0x5efa]) + ' D1')) {
  md = md.replace(/\n---\n/, '\n---\n\n' + block + '\n---\n');
}

fs.writeFileSync(mdPath, md, 'utf8');
console.log('README patched');
