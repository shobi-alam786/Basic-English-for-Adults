#!/usr/bin/env node
// generate_icons.js — Run this on your machine: node generate_icons.js
// Requires: npm install sharp
// Creates all icon sizes needed for PWA + Android

const fs   = require('fs');
const path = require('path');

// We'll generate icons programmatically using SVG → PNG via sharp
// If sharp is unavailable, fallback SVG icons are written instead.

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const OUT   = path.join(__dirname, 'icons');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// SVG icon template — book emoji style, navy + gold
function makeSVG(size) {
  const pad  = Math.round(size * 0.1);
  const r    = Math.round(size * 0.18);
  const fs_  = Math.round(size * 0.44);  // font size for emoji
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#1A1A2E"/>
  <text x="50%" y="54%" font-size="${fs_}" text-anchor="middle" dominant-baseline="middle" font-family="serif">📖</text>
  <rect x="${pad}" y="${size - pad * 2.2}" width="${size - pad*2}" height="${Math.round(size*0.08)}" rx="${Math.round(size*0.04)}" fill="#C9A84C"/>
</svg>`;
}

let usedSharp = false;
try {
  const sharp = require('sharp');
  usedSharp = true;
  Promise.all(
    SIZES.map(s => {
      const svg = Buffer.from(makeSVG(s));
      const out = path.join(OUT, `icon-${s}.png`);
      return sharp(svg).png().toFile(out).then(() => console.log(`✓ icon-${s}.png`));
    })
  ).then(() => console.log('\nAll icons generated with sharp!'));
} catch(e) {
  // Fallback: write SVGs (rename .svg → host as-is or convert manually)
  console.log('sharp not found — writing SVG icons instead (convert to PNG before deploying)');
  SIZES.forEach(s => {
    const out = path.join(OUT, `icon-${s}.svg`);
    fs.writeFileSync(out, makeSVG(s));
    console.log(`✓ icon-${s}.svg`);
  });
  // Also write a PNG-compatible notice
  fs.writeFileSync(path.join(OUT, 'README.txt'),
    'Convert each .svg to .png (same name) before deploying.\n' +
    'Online tool: https://svgtopng.com or use ImageMagick:\n' +
    '  for f in *.svg; do convert "$f" "${f%.svg}.png"; done\n'
  );
}
