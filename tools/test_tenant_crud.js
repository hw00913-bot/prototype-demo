#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright');

const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8780;

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

  // 自动接收 confirm
  page.on('dialog', async dialog => {
    console.log(`  - 捕获确认对话框: "${dialog.message()}"`);
    await dialog.accept();
  });

  try {
    await page.goto(`http://127.0.0.1:${PORT}/index.html`);
    await page.waitForTimeout(500);

    console.log('1. 进入租户管理页面');
    await page.evaluate(() => window.Nav.navigateTo('sys-tenant', 'sys-tenant'));
    await page.waitForTimeout(400);

    console.log('2. 打开新建租户弹窗');
    await page.click('.tenant-list-tools button:has-text("+ 新建")');
    await page.waitForTimeout(300);

    const isCreateModalVisible = await page.isVisible('#tenantFormModal');
    const modalTitle = await page.textContent('#tenantFormModalTitle');
    console.log(`  - 弹窗是否可见: ${isCreateModalVisible}, 标题: "${modalTitle}"`);
    if (!isCreateModalVisible || modalTitle !== '新建租户') throw new Error('新建租户弹窗未正确打开');

    console.log('3. 测试空值提交与错误提示');
    await page.click('#tenantFormModal .btn-primary:has-text("确定")');
    await page.waitForTimeout(200);
    const errorText = await page.textContent('#tenantNameError');
    console.log(`  - 空值错误提示: "${errorText}"`);
    if (!errorText.includes('请输入租户名称')) throw new Error('未弹出必填校验提示');

    console.log('4. 填写新建租户表单并提交');
    await page.fill('#tenantFormNameInput', '深圳东风南方体验店');
    await page.waitForTimeout(100);
    const nameCount = await page.textContent('#tenantNameCount');
    console.log(`  - 租户名称实时字数: ${nameCount}`);

    // 选择门店类型
    await page.click('input[name="tenantFormType"][value="门店"]');
    await page.fill('#tenantFormDescInput', '自动化测试新增门店租户');
    await page.waitForTimeout(100);
    const descCount = await page.textContent('#tenantDescCount');
    console.log(`  - 描述实时字数: ${descCount}`);

    // 确认新建
    await page.click('#tenantFormModal .btn-primary:has-text("确定")');
    await page.waitForTimeout(400);

    const hasNewRow = await page.$eval('.tenant-native-table', el => el.textContent.includes('深圳东风南方体验店'));
    console.log(`  - 新增租户在表格中呈现: ${hasNewRow}`);
    if (!hasNewRow) throw new Error('新增租户未在表格中展示');

    console.log('5. 测试编辑该租户');
    const editBtn = await page.$('.tenant-native-table tbody tr:has-text("深圳东风南方体验店") .tenant-op-btn.blue');
    await editBtn.click();
    await page.waitForTimeout(300);

    const editModalTitle = await page.textContent('#tenantFormModalTitle');
    const editNameVal = await page.inputValue('#tenantFormNameInput');
    const isStoreChecked = await page.isChecked('input[name="tenantFormType"][value="门店"]');
    console.log(`  - 编辑弹窗标题: "${editModalTitle}", 回显名称: "${editNameVal}", 门店单选: ${isStoreChecked}`);
    if (editModalTitle !== '编辑租户' || editNameVal !== '深圳东风南方体验店' || !isStoreChecked) {
      throw new Error('编辑租户回显数据不正确');
    }

    // 修改为旗舰店并改为禁用
    await page.fill('#tenantFormNameInput', '深圳东风南方旗舰店');
    await page.click('input[name="tenantFormStatus"][value="禁用"]');
    await page.click('#tenantFormModal .btn-primary:has-text("确定")');
    await page.waitForTimeout(400);

    const hasUpdatedRow = await page.$eval('.tenant-native-table', el => el.textContent.includes('深圳东风南方旗舰店'));
    console.log(`  - 编辑后租户更新成功: ${hasUpdatedRow}`);
    if (!hasUpdatedRow) throw new Error('编辑后租户名称未更新');

    console.log('6. 测试删除该租户');
    const deleteBtn = await page.$('.tenant-native-table tbody tr:has-text("深圳东风南方旗舰店") .tenant-op-btn.red');
    await deleteBtn.click();
    await page.waitForTimeout(400);

    const isDeleted = !(await page.$eval('.tenant-native-table', el => el.textContent.includes('深圳东风南方旗舰店')));
    console.log(`  - 租户已被安全删除: ${isDeleted}`);
    if (!isDeleted) throw new Error('删除操作未生效');

    console.log('7. 检查控制台报错');
    console.log('Console errors:', consoleErrors);
    if (consoleErrors.length > 0) throw new Error(`控制台存在错误: ${consoleErrors.join('; ')}`);

    console.log('\n✅ 租户新增和编辑功能全部验证通过！\n');
  } finally {
    await browser.close();
    server.close();
  }
})();
