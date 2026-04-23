const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\Admin\\AppData\\Local\\mahjong-dev\\node_modules';
const dst = 'C:\\Users\\Admin\\Documents\\Claude\\mahjong-solitaire\\node_modules';

function copyDir(s, d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  const entries = fs.readdirSync(s, { withFileTypes: true });
  for (const entry of entries) {
    const sp = path.join(s, entry.name);
    const dp = path.join(d, entry.name);
    if (entry.isDirectory()) {
      copyDir(sp, dp);
    } else if (entry.isSymbolicLink()) {
      // skip symlinks
    } else {
      fs.copyFileSync(sp, dp);
    }
  }
}

console.log('Copying node_modules... this may take a minute');
copyDir(src, dst);
console.log('Done');
