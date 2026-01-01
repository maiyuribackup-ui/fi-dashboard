// Post-build script: Create a redirect at repo root for Hostinger
// This allows Hostinger to serve from / and redirect to /dist/

import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Create redirect HTML
const redirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Financial Freedom Dashboard</title>
  <meta http-equiv="refresh" content="0;url=/dist/" />
  <script>window.location.replace('/dist/');</script>
</head>
<body>
  <p>Redirecting to <a href="/dist/">dashboard</a>...</p>
</body>
</html>`;

// Write to repo root (will be served by Hostinger)
const redirectPath = join(rootDir, 'redirect.html');
writeFileSync(redirectPath, redirectHtml);
console.log('✅ Created redirect.html for Hostinger');

// Read dist/index.html and verify it was built
try {
  const distIndex = readFileSync(join(rootDir, 'dist', 'index.html'), 'utf-8');
  console.log('✅ dist/index.html exists with', distIndex.length, 'bytes');
} catch (e) {
  console.error('❌ dist/index.html not found - build may have failed');
  process.exit(1);
}
