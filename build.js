const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const isFrontendDir = fs.existsSync(path.join(__dirname, 'src')) && fs.existsSync(path.join(__dirname, 'vite.config.ts'));
const frontendDir = isFrontendDir ? __dirname : path.join(__dirname, 'frontend');
const rootDir = isFrontendDir ? path.join(__dirname, '..') : __dirname;

console.log(`--- [BUILD] Running build from ${__dirname} (target frontend: ${frontendDir}) ---`);

if (!fs.existsSync(path.join(frontendDir, 'node_modules'))) {
  console.log('--- [BUILD] Installing frontend dependencies ---');
  execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });
}

console.log('--- [BUILD] Compiling frontend production bundle ---');
execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

console.log('--- [BUILD] Syncing dist directories ---');
const frontendDist = path.join(frontendDir, 'dist');
const targetRootDist = path.join(rootDir, 'dist');

if (fs.existsSync(frontendDist)) {
  try {
    fs.cpSync(frontendDist, targetRootDist, { recursive: true, force: true });
    console.log(`--- [BUILD] Synced to ${targetRootDist} ---`);
  } catch (e) {
    console.log('--- [BUILD] Root dist sync note:', e.message);
  }
}

console.log('--- [BUILD] Build & sync completed successfully! ---');

