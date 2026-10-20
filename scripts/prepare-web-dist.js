const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');

if (fs.existsSync(distDir)) {
  // Disable Jekyll processing so directories starting with an underscore (like _expo) are served
  fs.writeFileSync(path.join(distDir, '.nojekyll'), '');

  // Prevent git from ignoring static export assets
  fs.writeFileSync(path.join(distDir, '.gitignore'), '');

  // Provide fallback SPA routing for GitHub Pages
  const indexPath = path.join(distDir, 'index.html');
  const notFoundPath = path.join(distDir, '404.html');
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, notFoundPath);
  }
}
