import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'public', 'icons');
const screenshotsDir = path.join(__dirname, 'public', 'screenshots');

// Create directories
[iconsDir, screenshotsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Create base SVG icon
async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');

  for (const size of sizes) {
    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.15}"/>
        <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="${size * 0.45}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">M</text>
        <circle cx="${size * 0.75}" cy="${size * 0.25}" r="${size * 0.08}" fill="#fbbf24" opacity="0.9"/>
      </svg>
    `;

    try {
      await sharp(Buffer.from(svg))
        .png()
        .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
      console.log(`✓ Created icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`✗ Error creating icon-${size}x${size}.png:`, error.message);
    }
  }
}

// Generate screenshots
async function generateScreenshots() {
  console.log('\n📸 Generating screenshots...\n');

  // Wide screenshot (desktop)
  const wideSvg = `
    <svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
      <rect width="1280" height="720" fill="#1a1a1a"/>
      <rect x="40" y="40" width="1200" height="640" fill="#2a2a2a" rx="10"/>
      <text x="640" y="320" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="#6366f1" text-anchor="middle">Movie App</text>
      <text x="640" y="400" font-family="Arial, sans-serif" font-size="28" fill="#9ca3af" text-anchor="middle">Browse Search and Discover Movies</text>
    </svg>
  `;

  try {
    await sharp(Buffer.from(wideSvg))
      .png()
      .toFile(path.join(screenshotsDir, 'screenshot-wide.png'));
    console.log('✓ Created screenshot-wide.png');
  } catch (error) {
    console.error('✗ Error creating wide screenshot:', error.message);
  }

  // Mobile screenshot
  const mobileSvg = `
    <svg width="750" height="1334" viewBox="0 0 750 1334" xmlns="http://www.w3.org/2000/svg">
      <rect width="750" height="1334" fill="#1a1a1a"/>
      <rect x="25" y="25" width="700" height="1284" fill="#2a2a2a" rx="10"/>
      <text x="375" y="600" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#6366f1" text-anchor="middle">🎬</text>
      <text x="375" y="700" font-family="Arial, sans-serif" font-size="42" font-weight="bold" fill="#6366f1" text-anchor="middle">Movie App</text>
      <text x="375" y="760" font-family="Arial, sans-serif" font-size="20" fill="#9ca3af" text-anchor="middle">Mobile Experience</text>
    </svg>
  `;

  try {
    await sharp(Buffer.from(mobileSvg))
      .png()
      .toFile(path.join(screenshotsDir, 'screenshot-mobile.png'));
    console.log('✓ Created screenshot-mobile.png');
  } catch (error) {
    console.error('✗ Error creating mobile screenshot:', error.message);
  }
}

// Run generation
(async () => {
  try {
    await generateIcons();
    await generateScreenshots();
    console.log('\n✅ All PWA assets generated successfully!\n');
    console.log('📝 Next steps:');
    console.log('   1. Icons are in: public/icons/');
    console.log('   2. Screenshots are in: public/screenshots/');
    console.log('   3. For production, replace with your actual logo');
    console.log('   4. Run: npm run build');
    console.log('   5. Run: npm run preview (to test PWA locally)');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();
