import fs from 'fs';
const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
const keys = Object.keys(lock.packages || {});
const matches = keys.filter(k => k.includes('puppeteer'));
console.log('Matches:', matches);
