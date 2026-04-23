const fs = require('fs');
const path = require('path');
const src = 'C:/Users/Admin/Documents/Claude/mahjong-solitaire';
const dst = 'C:/Users/Admin/AppData/Local/mahjong-dev';

function copyDir(s, d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  for (const f of fs.readdirSync(s)) {
    if (f === 'node_modules' || f === '.git') continue;
    const sp = path.join(s, f);
    const dp = path.join(d, f);
    if (fs.statSync(sp).isDirectory()) copyDir(sp, dp);
    else fs.copyFileSync(sp, dp);
  }
}

copyDir(src, dst);
console.log('Synced source files');
