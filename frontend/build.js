import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- [BUILD: frontend] Compiling frontend production bundle ---');
execSync('npm run build', { cwd: __dirname, stdio: 'inherit' });

// Also mirror dist to parent ../dist if parent workspace exists
try {
  const rootDist = path.join(__dirname, '..', 'dist');
  const localDist = path.join(__dirname, 'dist');
  if (fs.existsSync(localDist) && fs.existsSync(path.join(__dirname, '..', 'package.json'))) {
    fs.cpSync(localDist, rootDist, { recursive: true, force: true });
    console.log('--- [BUILD: frontend] Mirrored dist to root directory ---');
  }
} catch (err) {
  // Ignore sync error in isolated environments
}

console.log('--- [BUILD: frontend] Completed successfully! ---');
