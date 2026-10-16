const fs = require('fs');
const path = require('path');

const targetFile = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-css-interop',
  'dist',
  'runtime',
  'wrap-jsx.js'
);

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  if (content.includes('return jsx.call(jsx, type, props, ...rest);')) {
    content = content.replace(
      'return jsx.call(jsx, type, props, ...rest);',
      'const fn = jsx || require("react/jsx-dev-runtime").jsxDEV || require("react/jsx-runtime").jsx;\n        return fn.call(fn, type, props, ...rest);'
    );
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('[patch] react-native-css-interop wrap-jsx.js patched for React 19 compatibility.');
  }
}
