const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateIcons() {
    const sizes = {
        'favicon-16x16.png': 16,
        'favicon-32x32.png': 32,
        'apple-touch-icon.png': 180,
        'og-image.jpg': [1200, 630] // For social media sharing
    };

    const inputSvg = path.join(__dirname, '../public/icons/favicon.svg');
    const outputDir = path.join(__dirname, '../public/icons');

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    for (const [filename, size] of Object.entries(sizes)) {
        const outputPath = path.join(outputDir, filename);
        const width = Array.isArray(size) ? size[0] : size;
        const height = Array.isArray(size) ? size[1] : size;

        await sharp(inputSvg)
            .resize(width, height)
            .toFile(outputPath);
        
        console.log(`Generated ${filename}`);
    }
}

generateIcons().catch(console.error);
