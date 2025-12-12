import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function generateIcons() {
  const publicDir = path.join(__dirname, 'public');
  
  for (const { name, size } of sizes) {
    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#4f46e5" rx="${Math.round(size * 0.125)}"/>
        <text x="${size/2}" y="${size * 0.6}" font-family="Arial, sans-serif" font-size="${Math.round(size * 0.42)}" font-weight="bold" fill="white" text-anchor="middle">S</text>
      </svg>
    `;
    
    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(publicDir, name));
    
    console.log(`Generated ${name}`);
  }
  
  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
