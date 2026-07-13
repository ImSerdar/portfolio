import puppeteer from 'puppeteer';
import { spawn } from 'child_process';

(async () => {
  console.log('Starting dev server...');
  const devServer = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'dev', '--', '--host', '127.0.0.1'], { cwd: 'C:/Serdar/portfolio', shell: true });
  
  devServer.stdout.on('data', (data) => {
    console.log(`DEV SERVER: ${data}`);
  });
  
  // Wait 5 seconds for server to boot
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('Starting puppeteer...');
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`BROWSER CONSOLE: ${msg.type()} - ${msg.text()}`);
  });
  page.on('pageerror', err => {
    console.error(`BROWSER ERROR: ${err.toString()}`);
  });
  
  console.log('Navigating to localhost:5173...');
  try {
    await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0', timeout: 15000 });
    console.log('Page loaded.');
  } catch (err) {
    console.error('Error loading page:', err);
  }
  
  await browser.close();
  devServer.kill();
  process.exit(0);
})();
