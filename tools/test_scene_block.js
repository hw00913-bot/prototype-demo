#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright');

const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8788;

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
    console.log('1. 打开系统并导航至外呼拦截页面');
    await page.goto(`http://127.0.0.1:${PORT}/index.html`);
    await page.waitForTimeout(500);

    // 展开外呼场景并点击外呼拦截
    await page.click('#nav-scene');
    await page.waitForTimeout(200);
    await page.click('#scene-block');
    await page.waitForTimeout(500);

    console.log('2. 点击列表首行「详情」操作');
    await page.click('.block-table tbody tr:first-child a:has-text("详情")');
    await page.waitForTimeout(400);

    const isModalVisible = await page.isVisible('.block-modal');
    console.log(`  - 详情弹窗是否可见: ${isModalVisible}`);
    if (!isModalVisible) throw new Error('黑名单号码详情弹窗未打开');

    const modalText = await page.textContent('.block-info-grid');
    console.log('  - 弹窗黑名单信息字段文本:\n', modalText.replace(/\s+/g, ' '));

    // 验证包含必要字段
    if (!modalText.includes('用户号码') || !modalText.includes('所属分组') || !modalText.includes('添加类型') || !modalText.includes('添加原因') || !modalText.includes('添加人') || !modalText.includes('添加时间') || !modalText.includes('有效期')) {
      throw new Error('缺少必要黑名单信息字段');
    }

    // 验证严格不包含「客户名称」与「来源」
    if (modalText.includes('客户名称') || modalText.includes('来源')) {
      throw new Error('弹窗中仍然包含「客户名称」或「来源」字段');
    }
    console.log('  - 验证通过：「客户名称」与「来源」字段已成功移除！');

    console.log('3. 点击关闭按钮');
    await page.click('.block-modal .btn:has-text("关闭")');
    await page.waitForTimeout(200);

    console.log('4. 检查控制台报错');
    console.log('Console errors:', consoleErrors);
    if (consoleErrors.length > 0) throw new Error(`控制台存在错误: ${consoleErrors.join('; ')}`);

    console.log('\n✅ 黑名单号码详情弹窗字段精简验证全部通过！\n');
  } finally {
    await browser.close();
    server.close();
  }
})();
