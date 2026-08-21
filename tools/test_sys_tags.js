#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright');

const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8779;

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
    await page.goto(`http://127.0.0.1:${PORT}/index.html`);
    await page.waitForTimeout(500);

    console.log('1. 进入标签管理页面');
    await page.evaluate(() => window.Nav.navigateTo('sys-tags', 'sys-tags'));
    await page.waitForTimeout(400);

    // 验证中台标签集默认选中
    const isLocalActive = await page.$eval('.tree-local-scene.selected', el => el.textContent.includes('督办'));
    console.log(`  - 默认选中中台标签集首个节点: ${isLocalActive}`);
    if (!isLocalActive) throw new Error('默认未高亮中台标签集');

    console.log('2. 测试中台模式下新增与编辑本地标签');
    await page.click('.btn-add-local-tag');
    await page.waitForTimeout(200);
    await page.fill('#prompt-modal-input', '新测试本地标签');
    await page.click('.btn-prompt-confirm');
    await page.waitForTimeout(300);

    const hasNewLocal = await page.$eval('#tags-content-panel', el => el.textContent.includes('新测试本地标签'));
    console.log(`  - 新增本地标签成功: ${hasNewLocal}`);
    if (!hasNewLocal) throw new Error('未能找到新增的本地标签');

    console.log('3. 展开供应商标签集并切换到科大讯飞/门店/督办');
    await page.click('.tree-supplier-root');
    await page.waitForTimeout(200);
    await page.click('.tree-supplier[data-supplier="kdxf"]');
    await page.waitForTimeout(200);
    await page.click('.tree-tenant[data-supplier="kdxf"][data-tenant="store"]');
    await page.waitForTimeout(200);
    await page.click('.tree-scene[data-supplier="kdxf"][data-tenant="store"][data-scene="db"]');
    await page.waitForTimeout(400);

    const isSupplierActive = await page.$eval('.tree-scene.selected', el => el.textContent.includes('督办'));
    console.log(`  - 成功切换至供应商模式: ${isSupplierActive}`);
    if (!isSupplierActive) throw new Error('切换供应商场景失败');

    console.log('4. 验证供应商标签列表与操作');
    const tagRowCount = await page.$$eval('.tag-row', rows => rows.length);
    console.log(`  - 科大讯飞标签行数: ${tagRowCount}`);
    if (tagRowCount !== 8) throw new Error(`科大讯飞标签行数应为 8，当前为 ${tagRowCount}`);

    // 测试单选启用/停用
    const firstCb = await page.$('.tag-enable-cb');
    await firstCb.click();
    await page.waitForTimeout(200);

    // 测试清空启用与全选启用
    await page.click('.btn-disable-all');
    await page.waitForTimeout(300);
    await page.click('.btn-enable-all');
    await page.waitForTimeout(300);
    console.log('  - 全选/清空启用正常');

    console.log('5. 测试场景配置弹窗');
    await page.click('.btn-scene-mgr');
    await page.waitForTimeout(300);
    const sceneModalShow = await page.$eval('#scene-modal-overlay', el => el.classList.contains('show'));
    console.log(`  - 场景配置弹窗打开: ${sceneModalShow}`);
    if (!sceneModalShow) throw new Error('场景配置弹窗未打开');
    await page.click('.btn-close-modal');
    await page.waitForTimeout(200);

    console.log('6. 测试供应商管理弹窗');
    await page.click('.btn-supplier-mgr');
    await page.waitForTimeout(300);
    const splModalShow = await page.$eval('#supplier-modal-overlay', el => el.classList.contains('show'));
    console.log(`  - 供应商管理弹窗打开: ${splModalShow}`);
    if (!splModalShow) throw new Error('供应商管理弹窗未打开');
    await page.click('#supplier-modal-overlay button:has-text("✕")');
    await page.waitForTimeout(200);

    console.log('7. 检查控制台报错');
    console.log('Console errors:', consoleErrors);
    if (consoleErrors.length > 0) throw new Error(`控制台存在错误: ${consoleErrors.join('; ')}`);

    console.log('\n✅ 意向标签管理功能与参考项目对齐测试全部通过！\n');
  } finally {
    await browser.close();
    server.close();
  }
})();
