const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Starting Vercel full-stack build...');

// 1. Build React frontend with Vite
console.log('📦 Building frontend...');
execSync('npm --prefix frontend run build', { stdio: 'inherit' });

// 2. Copy frontend/dist to root dist directory
const srcDist = path.join(__dirname, '../frontend/dist');
const targetDist = path.join(__dirname, '../dist');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
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

if (fs.existsSync(srcDist)) {
  copyDir(srcDist, targetDist);
  console.log('✅ Successfully copied frontend/dist to root /dist directory');
} else {
  console.error('❌ frontend/dist does not exist!');
  process.exit(1);
}
