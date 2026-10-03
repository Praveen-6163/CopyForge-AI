const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('--- [BUILD] Installing frontend dependencies ---');
execSync('npm install', { cwd: path.join(__dirname, 'frontend'), stdio: 'inherit' });

console.log('--- [BUILD] Compiling frontend production bundle ---');
execSync('npm run build', { cwd: path.join(__dirname, 'frontend'), stdio: 'inherit' });

console.log('--- [BUILD] Syncing dist directory to root ---');
fs.cpSync(path.join(__dirname, 'frontend', 'dist'), path.join(__dirname, 'dist'), { recursive: true, force: true });

console.log('--- [BUILD] Build & sync completed successfully! ---');
