import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const src = path.join(projectRoot, 'admin', 'index.html');
const destDir = path.join(projectRoot, 'dist', 'admin');
const dest = path.join(destDir, 'index.html');

await fs.mkdir(destDir, { recursive: true });
await fs.copyFile(src, dest);

process.stdout.write(`Copied ${src} -> ${dest}\n`);

