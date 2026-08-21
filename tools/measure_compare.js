#!/usr/bin/env node
/* 数据概览布局尺寸对比：DEMO vs 参考源 */
const { chromium } = require('/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright');

const MEASURE = `(() => {
  const pick = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height), cs.backgroundColor, cs.padding, cs.marginBottom].join(',');
  };
  return {
    section: pick('#sceneDetailContent .overview-section'),
    block1: pick('#sceneDetailContent .overview-block'),
    grid5: pick('#sceneDetailContent .overview-grid.cols-5'),
    card1: pick('#sceneDetailContent .overview-grid.cols-5 .overview-card'),
    grid3: pick('#sceneDetailContent .overview-grid.cols-3'),
    donut: pick('#sceneDetailContent .intent-donut-chart'),
    donutPanel: pick('#sceneDetailContent .intent-donut-panel'),
    insight: pick('#sceneDetailContent .overview-insight-grid'),
    chartPanel: pick('#sceneDetailContent .overview-chart-panel'),
    durationChart: pick('#sceneDetailContent .duration-chart'),
    cardCount: document.querySelectorAll('#sceneDetailContent .overview-card').length
  };
})()`;

const T = [
  ['zkj', '/中科金接入_demo_v1.0/index.html', 13, 13],
  ['yizhi', '/一知科技接入_v1.0/index.html', 'task-003', 3],
  ['diansheng', '/电声接入_demo_v1.0/index.html', 13, 20],
  ['dazhong', '/大众通信接入_demo_v1.1/index.html', 17, 17],
  ['houpu', '/厚朴接入_demo_v1.0/index.html', 13, 24],
  ['binglan', '/冰兰接入_v1.0/index.html', 1, 22]
];

(async () => {
  const browser = await chromium.launch({
    executablePath: '/Users/huhaowen/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell'
  });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  let allOk = true;
  for (const [name, path, refId, demoId] of T) {
    await page.goto('http://localhost:8766' + encodeURI(path), { waitUntil: 'networkidle' });
    await page.evaluate(id => window.Pages['scene-list'].showDetail(id), refId);
    await page.waitForTimeout(500);
    const ref = await page.evaluate(MEASURE);
    await page.evaluate(() => { const b = document.getElementById('sceneDetailBackdrop'); if (b) b.remove(); document.body.style.overflow = ''; });
    await page.goto('http://localhost:8765/index.html', { waitUntil: 'networkidle' });
    await page.evaluate(() => window.Nav.navigateTo('scene-list', 'scene-list'));
    await page.waitForTimeout(400);
    await page.evaluate(id => window.Pages['scene-list'].showDetail(id), demoId);
    await page.waitForTimeout(500);
    const demo = await page.evaluate(MEASURE);
    await page.evaluate(() => { const b = document.getElementById('sceneDetailBackdrop'); if (b) b.remove(); document.body.style.overflow = ''; });
    const diffs = Object.keys(ref).filter(k => JSON.stringify(ref[k]) !== JSON.stringify(demo[k]));
    if (diffs.length) allOk = false;
    console.log('== ' + name + (diffs.length ? ' DIFF: ' + diffs.join(', ') : ' OK'));
    diffs.forEach(k => console.log('   ref : ' + JSON.stringify(ref[k]) + '\n   demo: ' + JSON.stringify(demo[k])));
  }
  await browser.close();
  process.exit(allOk ? 0 : 1);
})();
