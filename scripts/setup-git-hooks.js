const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const githooksDir = path.join(rootDir, '.githooks');
const gitHooksTargetDir = path.join(rootDir, '.git', 'hooks');

try {
  // 1. Configure git to use .githooks directory
  execSync('git config core.hooksPath .githooks', { stdio: 'ignore' });
  console.log('[hooks] Configured git core.hooksPath to .githooks');
} catch {
  // Git might not be available or in a non-git environment
}

try {
  // 2. Also sync to .git/hooks as a fallback
  const prePushSource = path.join(githooksDir, 'pre-push');
  if (fs.existsSync(gitHooksTargetDir) && fs.existsSync(prePushSource)) {
    const prePushDest = path.join(gitHooksTargetDir, 'pre-push');
    fs.copyFileSync(prePushSource, prePushDest);
    try {
      fs.chmodSync(prePushDest, 0o755);
    } catch {}
    console.log('[hooks] Fallback pre-push hook copied to .git/hooks/pre-push');
  }
} catch {
  // Ignore filesystem errors in fallback copy
}
