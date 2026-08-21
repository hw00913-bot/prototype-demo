#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright');

const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8783;

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
    await page.goto(`http://127.0.0.1:${PORT}/index.html`);
    await page.waitForTimeout(500);

    console.log('1. 进入系统管理 / 账号管理');
    await page.evaluate(() => window.Nav.navigateTo('sys-account', 'sys-account'));
    await page.waitForTimeout(400);

    console.log('2. 验证左侧租户列表与首条账号渲染');
    const firstUser = await page.$eval('.account-native-table tbody tr:first-child td:nth-child(3)', el => el.textContent);
    console.log(`  - 首行账号工号: "${firstUser}"`);
    if (firstUser !== 'G3123') throw new Error('首行数据不一致');

    console.log('3. 切换租户至「杭州东风南方杭锐店」');
    await page.click('.account-tenant-card:has-text("杭州东风南方杭锐店")');
    await page.waitForTimeout(300);

    console.log('4. 打开「新增账号」弹窗并验证所有截图字段规范');
    await page.click('.account-tools-bar button:has-text("+ 新建")');
    await page.waitForTimeout(300);

    const modalTitle = await page.textContent('#accountModalTitle');
    console.log(`  - 弹窗标题: "${modalTitle}"`);
    if (modalTitle !== '新增账号') throw new Error('弹窗标题应为「新增账号」');

    // 验证所属租户只读展示
    const tenantVal = await page.inputValue('#accountFormTenant');
    const isTenantDisabled = await page.isDisabled('#accountFormTenant');
    console.log(`  - 所属租户: "${tenantVal}", 禁用只读: ${isTenantDisabled}`);
    if (tenantVal !== '杭州东风南方杭锐店' || !isTenantDisabled) throw new Error('所属租户展示不正确');

    // 验证头像上传框
    const hasAvatarPlus = await page.isVisible('#accountAvatarUploader .account-avatar-plus');
    console.log(`  - 头像上传框加号: ${hasAvatarPlus}`);
    if (!hasAvatarPlus) throw new Error('头像上传框未正确展示');

    // 验证 helper 说明文案
    const pageText = await page.textContent('#accountFormModal');
    if (!pageText.includes('支持字母，符号，数字') ||
        !pageText.includes('支持汉字，字母，符号，数字') ||
        !pageText.includes('支持大小写字母，符号，数字，8~16 位')) {
      throw new Error('弹窗缺少截图指定的字段说明文案');
    }

    console.log('5. 填写表单并测试实时字数统计');
    await page.fill('#accountFormUsername', 'G6008');
    await page.fill('#accountFormNickname', '杭锐新坐席');
    await page.waitForTimeout(100);
    const nickCount = await page.textContent('#accountNicknameCount');
    console.log(`  - 昵称实时字数: ${nickCount}`);
    if (nickCount !== '5 / 20') throw new Error('昵称字数统计不正确');

    await page.fill('#accountFormPhone', '13699998888');
    await page.waitForTimeout(100);
    const phoneCount = await page.textContent('#accountPhoneCount');
    console.log(`  - 手机实时字数: ${phoneCount}`);
    if (phoneCount !== '11 / 11') throw new Error('手机字数统计不正确');

    // 密码输入与眼睛切换
    await page.fill('#accountFormPassword', 'Secret123@');
    await page.click('#accountPwdToggleBtn');
    await page.waitForTimeout(100);
    const pwdInputType = await page.getAttribute('#accountFormPassword', 'type');
    console.log(`  - 点击眼睛后密码框类型: ${pwdInputType}`);
    if (pwdInputType !== 'text') throw new Error('密码显隐切换未生效');

    // 选择角色：租户运营
    await page.click('input[name="accountFormRole"][value="租户运营"]');
    // 状态默认启用
    const isStatusEnabled = await page.isChecked('input[name="accountFormStatus"][value="启用"]');
    console.log(`  - 默认状态启用: ${isStatusEnabled}`);
    if (!isStatusEnabled) throw new Error('默认状态应为启用');

    // 提交保存
    await page.click('#accountFormModal .btn-primary:has-text("确定")');
    await page.waitForTimeout(400);

    const hasNewAccount = await page.$eval('.account-native-table', el => el.textContent.includes('杭锐新坐席'));
    console.log(`  - 新增账号在表格中渲染: ${hasNewAccount}`);
    if (!hasNewAccount) throw new Error('新增账号未展示');

    console.log('6. 测试编辑账号');
    const editBtn = await page.$('.account-native-table tbody tr:has-text("杭锐新坐席") .tenant-op-btn.blue');
    await editBtn.click();
    await page.waitForTimeout(300);

    const editModalTitle = await page.textContent('#accountModalTitle');
    const editNickVal = await page.inputValue('#accountFormNickname');
    const isOperChecked = await page.isChecked('input[name="accountFormRole"][value="租户运营"]');
    console.log(`  - 编辑弹窗标题: "${editModalTitle}", 回显昵称: "${editNickVal}", 租户运营单选: ${isOperChecked}`);
    if (editModalTitle !== '编辑账号' || editNickVal !== '杭锐新坐席' || !isOperChecked) {
      throw new Error('编辑弹窗回显不正确');
    }

    await page.fill('#accountFormNickname', '杭锐金牌运营');
    await page.click('input[name="accountFormStatus"][value="禁用"]');
    await page.click('#accountFormModal .btn-primary:has-text("确定")');
    await page.waitForTimeout(400);

    const hasUpdatedAccount = await page.$eval('.account-native-table', el => el.textContent.includes('杭锐金牌运营'));
    console.log(`  - 编辑后账号已更新: ${hasUpdatedAccount}`);
    if (!hasUpdatedAccount) throw new Error('编辑后账号未更新');

    console.log('7. 测试删除账号');
    const deleteBtn = await page.$('.account-native-table tbody tr:has-text("杭锐金牌运营") .tenant-op-btn.red');
    await deleteBtn.click();
    await page.waitForTimeout(400);

    const isDeleted = !(await page.$eval('.account-native-table', el => el.textContent.includes('杭锐金牌运营')));
    console.log(`  - 账号已被安全删除: ${isDeleted}`);
    if (!isDeleted) throw new Error('删除操作未生效');

    console.log('8. 检查控制台报错');
    console.log('Console errors:', consoleErrors);
    if (consoleErrors.length > 0) throw new Error(`控制台存在错误: ${consoleErrors.join('; ')}`);

    console.log('\n✅ 账号新增与编辑功能按截图完整修正并通过验证！\n');
  } finally {
    await browser.close();
    server.close();
  }
})();
