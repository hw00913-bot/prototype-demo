#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright');

const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8787;

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

  page.on('dialog', async dialog => {
    console.log(`  - 捕获确认对话框: "${dialog.message()}"`);
    await dialog.accept();
  });

  try {
    console.log('1. 打开主界面 index.html');
    await page.goto(`http://127.0.0.1:${PORT}/index.html`);
    await page.waitForTimeout(500);

    console.log('2. 点击右上角菜单中的「退出登录」');
    await page.click('#userRoleTrigger');
    await page.waitForTimeout(100);
    await page.click('.user-dropdown-item:has-text("退出登录")');
    await page.waitForTimeout(400);

    console.log('3. 验证登录页全屏展示与元素对齐');
    const isLoginVisible = await page.isVisible('#loginOverlay');
    console.log(`  - 登录页是否全屏展示: ${isLoginVisible}`);
    if (!isLoginVisible) throw new Error('退出后未跳转至登录页面');

    const logoTitle = await page.textContent('#loginOverlay .login-top-logo-title');
    console.log(`  - 登录页 Logo 标题: "${logoTitle}"`);
    if (logoTitle !== '东风日产智能外呼') throw new Error('登录页 Logo 标题不匹配');

    const usernameVal = await page.inputValue('#loginUsername');
    console.log(`  - 登录账号预填值: "${usernameVal}"`);
    if (usernameVal !== 'super-product') throw new Error('登录账号预填不匹配');

    const hasCaptchaCanvas = await page.isVisible('#loginCaptchaCanvas');
    console.log(`  - 图形验证码 Canvas: ${hasCaptchaCanvas}`);
    if (!hasCaptchaCanvas) throw new Error('缺少图形验证码 Canvas');

    console.log('4. 测试点击「登录」直接进入首页（无需校验）');
    await page.click('#loginSubmitBtn');
    await page.waitForTimeout(500);

    const isLoginHidden = !(await page.isVisible('#loginOverlay'));
    const isHomeActive = await page.$eval('#nav-home', el => el.classList.contains('active'));
    console.log(`  - 登录页已隐藏: ${isLoginHidden}, 首页 nav-home 是否激活: ${isHomeActive}`);
    if (!isLoginHidden || !isHomeActive) throw new Error('点击登录未直接进入首页');

    console.log('5. 测试独立访问 login.html');
    await page.goto(`http://127.0.0.1:${PORT}/login.html`);
    await page.waitForTimeout(400);

    const loginHtmlTitle = await page.textContent('.login-top-logo-title');
    console.log(`  - login.html 标题: "${loginHtmlTitle}"`);
    if (loginHtmlTitle !== '东风日产智能外呼') throw new Error('login.html 标题不正确');

    await page.click('#loginSubmitBtn');
    await page.waitForTimeout(500);
    const curUrl = page.url();
    console.log(`  - 点击登录后跳转 URL: ${curUrl}`);
    if (!curUrl.includes('index.html')) throw new Error('独立登录页未跳转回 index.html');

    console.log('6. 检查控制台报错');
    console.log('Console errors:', consoleErrors);
    if (consoleErrors.length > 0) throw new Error(`控制台存在错误: ${consoleErrors.join('; ')}`);

    console.log('\n✅ 退出登录跳转登录页及免校验直接登录首页全部验证通过！\n');
  } finally {
    await browser.close();
    server.close();
  }
})();
