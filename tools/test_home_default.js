#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright');

const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8784;

function createServer() {
  return http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(ROOT_DIR, reqPath);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath);
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml'
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    fs.createReadStream(filePath).pipe(res);
  });
}

(async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`Server running at http://127.0.0.1:${PORT}`);

  const browser = await chromium.launch({
    executablePath: '/Users/huhaowen/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell',
  });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  try {
    console.log('1. 直接打开 index.html');
    await page.goto(`http://127.0.0.1:${PORT}/index.html`);
    await page.waitForTimeout(500);

    console.log('2. 验证默认高亮项');
    const isHomeActive = await page.$eval('#nav-home', el => el.classList.contains('active'));
    console.log(`  - 首页 nav-home 是否 active: ${isHomeActive}`);
    if (!isHomeActive) throw new Error('首页导航未默认高亮');

    console.log('3. 验证页面内容为首页');
    const contentText = await page.$eval('#page-content', el => el.textContent);
    console.log('  - 页面内容片段:\n', contentText.slice(0, 150));
    if (!contentText.includes('用量概览') && !contentText.includes('分钟') && !contentText.includes('工作台') && !contentText.includes('智能外呼')) {
      throw new Error('页面主体内容不是首页');
    }

    console.log('4. 检查控制台报错');
    console.log('Console errors:', consoleErrors);
    if (consoleErrors.length > 0) throw new Error(`控制台存在错误: ${consoleErrors.join('; ')}`);

    console.log('\n✅ 默认打开页为首页验证通过！\n');
  } finally {
    await browser.close();
    server.close();
  }
})();
