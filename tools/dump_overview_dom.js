#!/usr/bin/env node
/* 提取两边数据概览 DOM 结构 + 关键计算样式，输出文本用于 diff */
const { chromium } = require('/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/Users/huhaowen/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell',
  });

  async function dump(url, isRef) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    if (!isRef) await page.evaluate(() => window.Nav.navigateTo('scene-list', 'scene-list'));
    await page.waitForTimeout(600);
    await page.locator('.scene-card .card-action-btn.primary').first().click({ timeout: 5000 });
    await page.waitForTimeout(800);

    const data = await page.evaluate(() => {
      const content = document.getElementById('sceneDetailContent');
      const norm = (html) => html
        .replace(/ id="(intentSelectText|intentSelectCount|intentDropdown)_\d+"/g, '')
        .replace(/\s+/g, ' ')
        .replace(/data-level="\d+"/g, 'data-level="N"');
      const styles = {};
      const sels = [
        '.overview-section', '.overview-block', '.overview-block-body',
        '.overview-grid.cols-5', '.overview-grid.cols-3', '.overview-card', '.overview-card-title', '.overview-card-value',
        '.intent-donut-panel', '.intent-donut-chart', '.intent-donut-ring', '.intent-donut-label',
        '.overview-insight-grid', '.overview-chart-panel.focus-panel', '.overview-chart-panel.duration-panel',
        '.focus-list', '.focus-row', '.focus-track', '.duration-chart', '.duration-bar-item', '.duration-y-axis',
        '.intent-config-backdrop'
      ];
      sels.forEach(sel => {
        const el = document.querySelector(sel);
        if (!el) { styles[sel] = 'MISSING'; return; }
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        const keep = ['display', 'gridTemplateColumns', 'flexDirection', 'position', 'width', 'height', 'minWidth', 'gap', 'padding', 'margin', 'fontSize', 'color', 'backgroundColor', 'borderRadius', 'top', 'left', 'bottom', 'right'];
        const o = { rect: { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) } };
        keep.forEach(k => { o[k] = cs[k]; });
        styles[sel] = o;
      });
      /* 计数 */
      const counts = {
        overviewCard: document.querySelectorAll('#sceneDetailContent .overview-card').length,
        donutLabels: document.querySelectorAll('#sceneDetailContent .intent-donut-label').length,
        focusRows: document.querySelectorAll('#sceneDetailContent .focus-row').length,
        durationBars: document.querySelectorAll('#sceneDetailContent .duration-bar-item').length,
        yAxisSpans: document.querySelectorAll('#sceneDetailContent .duration-y-axis span').length,
      };
      return { html: norm(content.innerHTML), counts, styles };
    });
    await page.close();
    return data;
  }

  const ref = await dump('http://localhost:8767/index.html', true);
  const cur = await dump('http://localhost:8765/index.html', false);
  require('fs').writeFileSync('/tmp/ref_dom.json', JSON.stringify(ref, null, 2));
  require('fs').writeFileSync('/tmp/cur_dom.json', JSON.stringify(cur, null, 2));
  console.log('ref counts:', JSON.stringify(ref.counts));
  console.log('cur counts:', JSON.stringify(cur.counts));
  await browser.close();
})();
