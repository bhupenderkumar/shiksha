// Generate Open Graph thumbnail (1200x630 PNG) for UT-1 Date Sheet share preview.
// Run: node scripts/generate-ut1-og.mjs
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const W = 1200;
const H = 630;

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="55%" stop-color="#4338ca"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
    <linearGradient id="badge" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <!-- Decorative circles -->
  <circle cx="1080" cy="80"  r="140" fill="#ffffff" opacity="0.06"/>
  <circle cx="120"  cy="540" r="180" fill="#ffffff" opacity="0.05"/>
  <circle cx="980"  cy="560" r="90"  fill="#ffffff" opacity="0.07"/>

  <!-- School chip -->
  <g transform="translate(60,60)" filter="url(#shadow)">
    <rect width="500" height="58" rx="29" fill="#ffffff" opacity="0.95"/>
    <circle cx="34" cy="29" r="20" fill="#4f46e5"/>
    <text x="34" y="36" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#ffffff" text-anchor="middle">FS</text>
    <text x="74" y="37" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#1e293b">First Step Public School</text>
  </g>

  <!-- UT-1 Badge -->
  <g transform="translate(60,170)" filter="url(#shadow)">
    <rect width="220" height="60" rx="30" fill="url(#badge)"/>
    <text x="110" y="40" font-family="Arial, sans-serif" font-size="26" font-weight="800" fill="#ffffff" text-anchor="middle">UNIT TEST - 1</text>
  </g>

  <!-- Headline -->
  <text x="60" y="320" font-family="Arial, sans-serif" font-size="74" font-weight="800" fill="#ffffff">Examination</text>
  <text x="60" y="400" font-family="Arial, sans-serif" font-size="74" font-weight="800" fill="#fde68a">Date Sheet</text>

  <!-- Date range -->
  <text x="60" y="468" font-family="Arial, sans-serif" font-size="34" font-weight="600" fill="#e0e7ff">5th May 2026 — 13th May 2026</text>

  <!-- Info line -->
  <text x="60" y="520" font-family="Arial, sans-serif" font-size="22" font-weight="500" fill="#cbd5e1">Pre Nursery to Class V  •  09:00 AM – 11:00 AM  •  Online &amp; Offline</text>

  <!-- Session pill -->
  <g transform="translate(60,556)">
    <rect width="320" height="44" rx="22" fill="#ffffff" opacity="0.15"/>
    <text x="160" y="29" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#ffffff" text-anchor="middle">Academic Session 2026 - 27</text>
  </g>

  <!-- Right calendar visual -->
  <g transform="translate(820,200)" filter="url(#shadow)">
    <rect x="0" y="0" width="320" height="320" rx="24" fill="#ffffff"/>
    <rect x="0" y="0" width="320" height="80" rx="24" fill="#ef4444"/>
    <rect x="0" y="56" width="320" height="24" fill="#ef4444"/>
    <text x="160" y="54" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="#ffffff" text-anchor="middle">MAY 2026</text>
    <text x="160" y="180" font-family="Arial, sans-serif" font-size="120" font-weight="800" fill="#1e293b" text-anchor="middle">05</text>
    <text x="160" y="230" font-family="Arial, sans-serif" font-size="22" font-weight="600" fill="#475569" text-anchor="middle">Tuesday</text>
    <text x="160" y="280" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#ef4444" text-anchor="middle">EXAMS START</text>
  </g>

  <!-- Bottom URL -->
  <text x="60" y="612" font-family="Arial, sans-serif" font-size="20" font-weight="600" fill="#cbd5e1">myfirststepschool.com/date-sheet</text>
</svg>
`;

async function run() {
  const outDir = path.join(__dirname, '..', 'public', 'assets', 'images');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'ut1-og.jpg');
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 90, progressive: true })
    .toFile(outFile);
  console.log(`Generated: ${outFile}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
