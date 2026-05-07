// Generate Open Graph thumbnail (1200x630 JPG) for homepage social previews.
// Run: node scripts/generate-og-image.mjs
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const W = 1200;
const H = 630;

// Brand palette (from school logo)
//   Cream: #F5E9D7   Red: #C73E2C   Gold: #F5C518   Ink: #1a1a1a
const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F5E9D7"/>
      <stop offset="55%" stop-color="#FFF6E2"/>
      <stop offset="100%" stop-color="#F5C518"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000" flood-opacity="0.18"/>
    </filter>
  </defs>

  <!-- Background gradient -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Decorative shapes -->
  <circle cx="1100" cy="80"  r="160" fill="#C73E2C" opacity="0.08"/>
  <circle cx="100"  cy="560" r="200" fill="#C73E2C" opacity="0.07"/>
  <circle cx="1050" cy="540" r="100" fill="#F5C518" opacity="0.30"/>

  <!-- Top brand bar -->
  <rect x="0" y="0" width="${W}" height="14" fill="#C73E2C"/>
  <rect x="0" y="14" width="${W}" height="6" fill="#F5C518"/>

  <!-- 4.9 star badge -->
  <g transform="translate(60,52)" filter="url(#shadow)">
    <rect width="240" height="58" rx="29" fill="#1a1a1a"/>
    <text x="22" y="38" font-family="Arial, sans-serif" font-size="30" fill="#F5C518">★</text>
    <text x="58" y="38" font-family="Arial, sans-serif" font-size="22" font-weight="800" fill="#ffffff">4.9 on Google</text>
  </g>

  <!-- Admissions Open badge -->
  <g transform="translate(310,52)" filter="url(#shadow)">
    <rect width="280" height="58" rx="29" fill="#C73E2C"/>
    <text x="140" y="38" font-family="Arial, sans-serif" font-size="22" font-weight="800" fill="#ffffff" text-anchor="middle">ADMISSIONS OPEN 2026-27</text>
  </g>

  <!-- Headline -->
  <text x="60" y="220" font-family="Arial, sans-serif" font-size="56" font-weight="900" fill="#1a1a1a">First Step</text>
  <text x="60" y="282" font-family="Arial, sans-serif" font-size="48" font-weight="900" fill="#C73E2C">Pre School &amp; Primary</text>

  <!-- Sub-headline -->
  <text x="60" y="340" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#1a1a1a">Best Play School in Saurabh Vihar,</text>
  <text x="60" y="376" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#1a1a1a">Badarpur, Delhi</text>

  <!-- USP bullets -->
  <text x="60" y="430" font-family="Arial, sans-serif" font-size="22" font-weight="500" fill="#3a3a3a">Playgroup · Nursery · LKG · UKG · Class 1 to Class 5</text>
  <text x="60" y="464" font-family="Arial, sans-serif" font-size="20" font-weight="500" fill="#3a3a3a">Activity-based learning  ·  CCTV campus  ·  Trained teachers</text>

  <!-- Phone CTA pill -->
  <g transform="translate(60,500)" filter="url(#shadow)">
    <rect width="380" height="64" rx="32" fill="#1a1a1a"/>
    <circle cx="34" cy="32" r="18" fill="#F5C518"/>
    <text x="34" y="40" font-family="Arial, sans-serif" font-size="22" font-weight="800" fill="#1a1a1a" text-anchor="middle">📞</text>
    <text x="76" y="42" font-family="Arial, sans-serif" font-size="26" font-weight="800" fill="#ffffff">+91 96679 35518</text>
  </g>

  <!-- Right side: logo medallion (smaller, top-right) -->
  <g transform="translate(880,150)" filter="url(#shadow)">
    <circle cx="140" cy="140" r="140" fill="#ffffff"/>
    <circle cx="140" cy="140" r="140" fill="none" stroke="#C73E2C" stroke-width="6"/>
    <circle cx="140" cy="140" r="124" fill="none" stroke="#F5C518" stroke-width="3"/>
  </g>

  <!-- Bottom brand bar -->
  <rect x="0" y="${H - 56}" width="${W}" height="56" fill="#1a1a1a"/>
  <text x="60" y="${H - 20}" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#F5C518">myfirststepschool.com</text>
  <text x="${W - 60}" y="${H - 20}" font-family="Arial, sans-serif" font-size="20" font-weight="500" fill="#F5E9D7" text-anchor="end">H-164, Saurabh Vihar, Jaitpur, Badarpur, Delhi 110044</text>
</svg>
`;

async function run() {
  const outDir = path.join(__dirname, '..', 'public', 'assets', 'images');
  fs.mkdirSync(outDir, { recursive: true });

  // Composite the actual logo PNG on top of the medallion circle for authenticity
  const logoPath = path.join(outDir, 'logo.PNG');
  const baseBuf = await sharp(Buffer.from(svg)).png().toBuffer();

  let composited = baseBuf;
  if (fs.existsSync(logoPath)) {
    // Round logo using a circular mask so it fits the medallion cleanly.
    const size = 220;
    const mask = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/></svg>`
    );
    const logoBuf = await sharp(logoPath)
      .resize(size, size, { fit: 'cover' })
      .composite([{ input: mask, blend: 'dest-in' }])
      .png()
      .toBuffer();
    // medallion centre is at (880+140, 150+140) = (1020, 290)
    // place 220x220 logo centred on (1020, 290) → top-left (910, 180)
    composited = await sharp(baseBuf)
      .composite([{ input: logoBuf, top: 180, left: 910 }])
      .png()
      .toBuffer();
  }

  const outFile = path.join(outDir, 'og-image.jpg');
  await sharp(composited).jpeg({ quality: 88, progressive: true }).toFile(outFile);
  console.log(`Generated: ${outFile}`);

  // Also produce a PNG version for higher quality (used by Twitter / LinkedIn occasionally)
  const outFilePng = path.join(outDir, 'og-image.png');
  await sharp(composited).png({ compressionLevel: 9 }).toFile(outFilePng);
  console.log(`Generated: ${outFilePng}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
