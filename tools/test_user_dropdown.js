#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright');

const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8786;

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
    console.log('1. 打开首页');
    await page.goto(`http://127.0.0.1:${PORT}/index.html`);
    await page.waitForTimeout(500);

    console.log('2. 点击右上角「产品-超管」展开下拉菜单');
    await page.click('#userRoleTrigger');
    await page.waitForTimeout(200);

    console.log('3. 点击「账号信息」打开截图一致的详情弹窗');
    await page.click('.user-dropdown-item:has-text("账号信息")');
    await page.waitForTimeout(300);

    const isInfoModalOpen = await page.isVisible('#accountInfoModalBackdrop');
    console.log(`  - 账号信息弹窗是否可见: ${isInfoModalOpen}`);
    if (!isInfoModalOpen) throw new Error('账号信息弹窗未弹出');

    // 验证头像框
    const hasAvatar = await page.isVisible('#accountInfoAvatarBox');
    console.log(`  - 头像展示框: ${hasAvatar}`);
    if (!hasAvatar) throw new Error('缺少头像展示框');

    // 验证所有字段文本与输入框值
    const usernameVal = await page.inputValue('.account-form-row:has-text("账号：") input');
    const phoneVal = await page.inputValue('#accountInfoPhoneInput');
    const modalText = await page.textContent('.account-info-modal');
    console.log(`  - 账号值: "${usernameVal}", 手机值: "${phoneVal}"`);
    if (usernameVal !== 'super-product' ||
        phoneVal !== '15975585393' ||
        !modalText.includes('支持字母，符号，数字') ||
        !modalText.includes('支持汉字，字母，符号，数字') ||
        !modalText.includes('11 / 11') ||
        !modalText.includes('超级管理组-超级管理员')) {
      throw new Error('弹窗字段与截图不匹配');
    }

    console.log('4. 测试修改账号昵称并确定保存');
    await page.fill('#accountInfoNicknameInput', '智能外呼专家');
    await page.waitForTimeout(100);
    const countText = await page.textContent('#accountInfoNickCount');
    console.log(`  - 实时字数: ${countText}`);
    if (countText !== '6 / 20') throw new Error('字数统计不正确');

    await page.click('.account-info-modal .btn-primary:has-text("确定")');
    await page.waitForTimeout(300);

    const headerUserName = await page.textContent('#userRoleTrigger .user-name');
    console.log(`  - 顶部导航栏用户名称同步更新为: "${headerUserName}"`);
    if (headerUserName !== '智能外呼专家') throw new Error('顶部导航栏名称未同步更新');

    console.log('5. 检查控制台报错');
    console.log('Console errors:', consoleErrors);
    if (consoleErrors.length > 0) throw new Error(`控制台存在错误: ${consoleErrors.join('; ')}`);

    console.log('\n✅ 账号信息页面按截图完善并验证全部通过！\n');
  } finally {
    await browser.close();
    server.close();
  }
})();
