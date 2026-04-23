const fs = require('fs');
const target = 'C:\\Users\\Admin\\AppData\\Local\\mahjong-dev';
const link = 'C:\\Users\\Admin\\Documents\\Claude\\mahjong-dev';

try { fs.unlinkSync(link); } catch(e) {}
try { fs.rmdirSync(link); } catch(e) {}

fs.symlinkSync(target, link, 'junction');
console.log('Junction created:', link, '->', target);
