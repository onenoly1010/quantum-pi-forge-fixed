#!/usr/bin/env node

/**
 * Static build for local / GitHub Pages / Cloudflare-style static hosting.
 * Output: out/ (Vercel Build Output API and .vercel/ paths intentionally removed)
 * Production canon site: https://quantumpiforge.com (onenoly1010/Quantum-pi-forge)
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const outputDir = path.join(rootDir, 'out');

// Files to copy from root to out/
const staticFiles = [
  'index.html',
  'ceremonial_interface.html',
  'resonance_dashboard.html',
  'spectral_command_shell.html',
  'pi-forge-integration.js'
];

// Directories to copy from root to out/
const staticDirs = [
  'frontend'
];

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function copyFile(src) {
  const srcPath = path.join(rootDir, src);
  const destPath = path.join(outputDir, path.basename(src));

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✓ Copied ${src}`);
  } else {
    console.warn(`⚠ File not found: ${src}`);
  }
}

function build() {
  console.log('Building static assets (no Vercel; output → out/)...\n');

  // Remove legacy Vercel output if present
  const legacyVercel = path.join(rootDir, '.vercel');
  if (fs.existsSync(legacyVercel)) {
    fs.rmSync(legacyVercel, { recursive: true, force: true });
    console.log('✓ Removed legacy .vercel/ directory\n');
  }

  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('✓ Created out/ directory\n');

  console.log('Copying static files:');
  for (const file of staticFiles) {
    copyFile(file);
  }
  console.log('');

  console.log('Copying static directories:');
  for (const dir of staticDirs) {
    const srcPath = path.join(rootDir, dir);
    const destPath = path.join(outputDir, dir);

    if (fs.existsSync(srcPath)) {
      const stats = fs.statSync(srcPath);
      if (stats.isDirectory()) {
        copyDir(srcPath, destPath);
        console.log(`✓ Copied ${dir}/`);
      } else {
        console.warn(`⚠ ${dir} is not a directory, skipping`);
      }
    } else {
      console.warn(`⚠ Directory not found: ${dir}`);
    }
  }

  // Simple SPA-friendly _redirects for Cloudflare Pages / static hosts
  fs.writeFileSync(
    path.join(outputDir, '_redirects'),
    '/*    /index.html   200\n'
  );
  console.log('✓ Wrote out/_redirects\n');

  console.log('✅ Build completed successfully!');
  console.log(`📁 Output directory: ${outputDir}\n`);
  console.log('Note: Production public site is Cloudflare (quantumpiforge.com / Quantum-pi-forge).');
  console.log('      This repo no longer requires Vercel.\n');
}

try {
  build();
  process.exit(0);
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}
