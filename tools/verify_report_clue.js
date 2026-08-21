#!/usr/bin/env node
/* 验证线索统计（report-clue.js）对齐：三大主 Tab、二级子 Tab、14 列表头、数据行、标签组件、多选下拉、导出 loading 及控制台 0 错误 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright');

const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8769;

// 简单静态服务器
function createServer() {
  const server = http.createServer((req, res) => {
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
      '.png': 'image/png',
      '.svg': 'image/svg+xml'
    };
    
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    fs.createReadStream(filePath).pipe(res);
  });
  return server;
}

(async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`Server started on http://127.0.0.1:${PORT}`);

  const consoleErrors = [];
  const badRequests = [];

  const browser = await chromium.launch({
    executablePath: '/Users/huhaowen/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell',
  });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('response', resp => {
    if (resp.status() >= 400) {
      badRequests.push(`${resp.status()} ${resp.url()}`);
    }
  });

  try {
    await page.goto(`http://127.0.0.1:${PORT}/index.html`);
    await page.waitForTimeout(600);

    // 导航至线索统计页面
    await page.evaluate(() => {
      if (window.Nav && window.Nav.navigateTo) {
        window.Nav.navigateTo('report-clue', 'nav-report-clue');
      } else if (window.navigateTo) {
        window.navigateTo('report-clue', 'nav-report-clue');
      }
    });
    await page.waitForTimeout(600);

    console.log('=== 1. 验证三大主 Tab 结构 ===');
    const tabs = await page.$$eval('.tab-bar .tab-item', items => items.map(el => el.textContent.trim()));
    console.log('主 Tab 列表:', tabs);
    if (!tabs.includes('外呼线索统计') || !tabs.includes('外呼线索明细') || !tabs.includes('线索回流统计')) {
      throw new Error(`主 Tab 不完整: ${JSON.stringify(tabs)}`);
    }

    console.log('=== 2. 验证【外呼线索统计】面板 ===');
    const annoExists = await page.$eval('[data-anno="report-clue-table"]', el => !!el).catch(() => false);
    if (!annoExists) throw new Error('缺少 [data-anno="report-clue-table"] 锚点');

    const statThs = await page.$$eval('#manual-nev thead th', ths => ths.map(t => t.textContent.trim()));
    console.log('外呼线索统计表头列数:', statThs.length, statThs);
    if (statThs.length !== 14) throw new Error(`外呼线索统计表头应为 14 列，实际为 ${statThs.length} 列`);
    if (!statThs.includes('A (高意向)客户数') || !statThs.includes('E (拒绝/无效/无应答)客户数')) {
      throw new Error('外呼线索统计表头意向字段缺失');
    }

    const nevStatRows = await page.$$eval('#manual-nev tbody tr', trs => trs.length);
    console.log('NEV 统计数据行数:', nevStatRows);
    if (nevStatRows !== 5) throw new Error(`NEV 统计数据行应为 5 条，实际为 ${nevStatRows}`);

    // 切换到 ICE 子 Tab
    await page.click('#tab-manual .sub-tab-item:nth-child(2)');
    await page.waitForTimeout(200);
    const iceStatRows = await page.$$eval('#manual-ice tbody tr', trs => trs.length);
    console.log('ICE 统计数据行数:', iceStatRows);
    if (iceStatRows !== 5) throw new Error(`ICE 统计数据行应为 5 条，实际为 ${iceStatRows}`);

    console.log('=== 3. 验证【外呼线索明细】面板 ===');
    // 切换到第二主 Tab
    await page.click('.tab-bar .tab-item:nth-child(2)');
    await page.waitForTimeout(300);

    const detailThs = await page.$$eval('#ai-nev thead th', ths => ths.map(t => t.textContent.trim()));
    console.log('外呼线索明细表头列数:', detailThs.length, detailThs);
    if (detailThs.length !== 14) throw new Error(`外呼线索明细表头应为 14 列，实际为 ${detailThs.length} 列`);
    if (!detailThs.includes('意向级别（外呼中台）') || !detailThs.includes('意向级别（业务系统）')) {
      throw new Error('外呼线索明细表头双意向级别字段缺失');
    }

    const nevDetailRows = await page.$$eval('#ai-nev tbody tr', trs => trs.length);
    console.log('NEV 明细数据行数:', nevDetailRows);
    if (nevDetailRows !== 5) throw new Error(`NEV 明细数据行应为 5 条，实际为 ${nevDetailRows}`);

    const tagsCount = await page.$$eval('#ai-nev .tag', tags => tags.length);
    console.log('NEV 明细彩色标签数:', tagsCount);
    if (tagsCount < 10) throw new Error(`彩色标签数量异常: ${tagsCount}`);

    // 测试多选下拉框
    console.log('测试意向多选下拉框交互...');
    await page.click('#ai-nev .multi-select-display');
    await page.waitForTimeout(200);
    const isDropdownOpen = await page.$eval('#ai-nev .multi-select-dropdown', d => d.classList.contains('open'));
    if (!isDropdownOpen) throw new Error('多选下拉框点击未展开');

    // 切换 ICE 明细
    await page.click('#tab-ai .sub-tab-item:nth-child(2)');
    await page.waitForTimeout(200);
    const iceDetailRows = await page.$$eval('#ai-ice tbody tr', trs => trs.length);
    console.log('ICE 明细数据行数:', iceDetailRows);
    if (iceDetailRows !== 5) throw new Error(`ICE 明细数据行应为 5 条，实际为 ${iceDetailRows}`);

    console.log('=== 4. 验证【线索回流统计】面板 ===');
    // 切换到第三主 Tab
    await page.click('.tab-bar .tab-item:nth-child(3)');
    await page.waitForTimeout(300);

    const tipExists = await page.$eval('.clue-tip-bar', el => el.textContent.includes('统计业务系统传入后')).catch(() => false);
    if (!tipExists) throw new Error('线索回流统计提示条缺失');

    const returnThs = await page.$$eval('#tab-return thead th', ths => ths.map(t => t.textContent.trim()));
    console.log('线索回流统计表头列数:', returnThs.length, returnThs);
    if (returnThs.length !== 6) throw new Error(`线索回流统计表头应为 6 列，实际为 ${returnThs.length} 列`);

    const returnRows = await page.$$eval('#tab-return tbody tr', trs => trs.length);
    console.log('线索回流数据行数:', returnRows);
    if (returnRows !== 5) throw new Error(`线索回流数据行应为 5 条，实际为 ${returnRows}`);

    console.log('=== 5. 验证导出按钮 loading 交互 ===');
    // 切回第一 Tab 并激活 NEV 子 Tab
    await page.click('.tab-bar .tab-item:nth-child(1)');
    await page.waitForTimeout(200);
    await page.click('#tab-manual .sub-tab-item:nth-child(1)');
    await page.waitForTimeout(200);
    await page.click('#manual-nev .btn-success');
    await page.waitForTimeout(300);
    const isExportLoading = await page.$eval('#manual-nev .btn-success', btn => btn.classList.contains('loading') && btn.disabled);
    console.log('导出按钮进入 loading 状态:', isExportLoading);
    if (!isExportLoading) throw new Error('导出按钮点击未进入 loading 状态');

    console.log('=== 6. 验证顶栏干净（无多余 page-header 顶行）与真实分页交互 ===');
    const headerExists = await page.$eval('.clue-report-page .page-header', el => !!el).catch(() => false);
    console.log('是否存在多余 page-header:', headerExists);
    if (headerExists) throw new Error('不应存在 .page-header 多余顶行');

    // 测试分页点击切页
    console.log('测试分页点击页码 2...');
    await page.click('#manual-nev .page-btn:has-text("2")');
    await page.waitForTimeout(200);
    const activePage = await page.$eval('#manual-nev .page-btn.active', btn => btn.textContent.trim());
    console.log('当前激活页码:', activePage);
    if (activePage !== '2') throw new Error(`分页切换失败，当前页码应为 2，实际为 ${activePage}`);

    // 切回第 1 页
    await page.click('#manual-nev .page-btn:has-text("1")');
    await page.waitForTimeout(200);

    console.log('=== 7. 验证控制台与网络请求 ===');
    console.log('Console Errors:', consoleErrors);
    console.log('Bad Requests:', badRequests);
    if (consoleErrors.length > 0) throw new Error(`控制台存在错误: ${consoleErrors.join('; ')}`);
    if (badRequests.length > 0) throw new Error(`存在异常网络请求: ${badRequests.join('; ')}`);

    console.log('\n✅ 所有线索统计对齐与布局断言全部通过！\n');
  } finally {
    await browser.close();
    server.close();
  }
})();
