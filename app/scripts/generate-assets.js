/**
 * Asset Generator for LegalSahay
 *
 * Run this script to generate placeholder app icons and splash screens.
 * Requirements: npm install sharp (run in app/ directory)
 *
 * Usage: node scripts/generate-assets.js
 *
 * For production, replace these with professionally designed assets.
 */

const fs = require('fs');
const path = require('path');

// Create assets directory
const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Try to use sharp if available, otherwise create minimal valid PNGs
try {
  const sharp = require('sharp');

  // Generate icon (1024x1024)
  const iconSvg = `
    <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="1024" rx="180" fill="#1a237e"/>
      <text x="512" y="420" font-family="Arial, sans-serif" font-size="280" font-weight="bold" fill="#ffffff" text-anchor="middle">L</text>
      <text x="512" y="700" font-family="Arial, sans-serif" font-size="120" font-weight="600" fill="#ff8f00" text-anchor="middle">SAHAY</text>
    </svg>`;

  sharp(Buffer.from(iconSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon.png'))
    .then(() => console.log('✓ icon.png created (1024x1024)'));

  // Generate adaptive icon foreground (1024x1024)
  const adaptiveSvg = `
    <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="1024" fill="#1a237e"/>
      <text x="512" y="420" font-family="Arial, sans-serif" font-size="320" font-weight="bold" fill="#ffffff" text-anchor="middle">L</text>
      <text x="512" y="720" font-family="Arial, sans-serif" font-size="130" font-weight="600" fill="#ff8f00" text-anchor="middle">SAHAY</text>
    </svg>`;

  sharp(Buffer.from(adaptiveSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'adaptive-icon.png'))
    .then(() => console.log('✓ adaptive-icon.png created (1024x1024)'));

  // Generate splash (1284x2778 - iPhone 14 Pro Max size, good for all)
  const splashSvg = `
    <svg width="1284" height="2778" xmlns="http://www.w3.org/2000/svg">
      <rect width="1284" height="2778" fill="#1a237e"/>
      <text x="642" y="1200" font-family="Arial, sans-serif" font-size="200" font-weight="bold" fill="#ffffff" text-anchor="middle">Legal</text>
      <text x="642" y="1450" font-family="Arial, sans-serif" font-size="200" font-weight="bold" fill="#ff8f00" text-anchor="middle">Sahay</text>
      <text x="642" y="1650" font-family="Arial, sans-serif" font-size="60" fill="rgba(255,255,255,0.7)" text-anchor="middle">AI-Powered Legal Assistant for India</text>
    </svg>`;

  sharp(Buffer.from(splashSvg))
    .resize(1284, 2778)
    .png()
    .toFile(path.join(assetsDir, 'splash.png'))
    .then(() => console.log('✓ splash.png created (1284x2778)'));

  // Generate favicon for web (48x48)
  sharp(Buffer.from(iconSvg))
    .resize(48, 48)
    .png()
    .toFile(path.join(assetsDir, 'favicon.png'))
    .then(() => console.log('✓ favicon.png created (48x48)'));

} catch (e) {
  console.log('sharp not installed. Installing...');
  console.log('Run: npm install --save-dev sharp');
  console.log('Then run this script again: node scripts/generate-assets.js');
  process.exit(1);
}
