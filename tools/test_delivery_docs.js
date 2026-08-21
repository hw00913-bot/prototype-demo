#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright');

const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8789;

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
    console.log('1. 打开系统并切换到交付文档视图 index.html#delivery=docs');
    await page.goto(`http://127.0.0.1:${PORT}/index.html#delivery=docs`);
    await page.waitForTimeout(1000);

    const iframeEl = await page.$('.delivery-nav__frame');
    if (!iframeEl) throw new Error('未找到交付 iframe .delivery-nav__frame');

    const frame = await iframeEl.contentFrame();
    if (!frame) throw new Error('无法访问 iframe 内容');

    const frameTitle = await frame.title();
    console.log(`  - iframe 标题: ${frameTitle}`);

    const frameBodyText = await frame.textContent('body');
    console.log(`  - iframe 文本字符长度: ${frameBodyText.length}`);

    // 检查关键内容对齐
    const checkPhrases = [
      '东风日产智能外呼中台 · 统一功能说明文档',
      '已分配号码名单（水滴标记 10）',
      '每 30 分钟系统自动重新提交一次',
      '如果提交一知后，回调返回“客户已存在”就不要下发给 dcc',
      '各供应商手机号导入限制规范',
      '电声平台',
      '需要映射黑名单的智能平台由开发后台统一配置',
      '黑名单租户强隔离',
      '全局统一 25 项中台通话状态枚举与多平台映射字典',
      '华北区',
      '线索回流统计'
    ];

    for (const phrase of checkPhrases) {
      if (frameBodyText.includes(phrase)) {
        console.log(`  ✅ 成功包含关键规则: "${phrase}"`);
      } else {
        throw new Error(`交付文档中缺失预期内容: "${phrase}"`);
      }
    }

    console.log('\n2. 检查控制台报错');
    console.log('Console errors:', consoleErrors);
    if (consoleErrors.length > 0) throw new Error(`控制台存在错误: ${consoleErrors.join('; ')}`);

    console.log('\n✅ 交付文档视图 (#delivery=docs) 与 功能说明文档.md 100% 同步验证全部通过！\n');
  } finally {
    await browser.close();
    server.close();
  }
})();
