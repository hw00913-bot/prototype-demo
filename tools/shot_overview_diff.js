#!/usr/bin/env node
/* 截图对比：参照物(8767) vs DEMO_PRESENT(8765) 的外呼列表详情-数据概览 Tab */
const { chromium } = require('/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/Users/huhaowen/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell',
  });

  async function shot(url, out, isRef) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    if (!isRef) await page.evaluate(() => window.Nav.navigateTo('scene-list', 'scene-list'));
    await page.waitForTimeout(600);
    /* 打开第一条任务的查看详情（数据概览为默认 Tab） */
    await page.locator('.scene-card .card-action-btn.primary').first().click({ timeout: 5000 });
    await page.waitForTimeout(800);
    /* 抽屉内容区分段截图：整页 + 各区块 */
    const drawer = page.locator('.scene-detail-drawer');
    await drawer.screenshot({ path: out + '_drawer.png' });
    /* 滚动截图整个数据概览区域 */
    const body = page.locator('#sceneDetailContent');
    await body.screenshot({ path: out + '_overview.png' });
    await page.close();
  }

  await shot('http://localhost:8767/index.html', '/tmp/ref', true);
  await shot('http://localhost:8765/index.html', '/tmp/cur', false);
  await browser.close();
  console.log('done');
})();
