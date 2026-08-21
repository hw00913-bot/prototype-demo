#!/usr/bin/env node
/* 数据概览视觉+DOM 对比：DEMO_PRESENT vs 六平台参考源（截图 + 结构序列化） */
const { chromium } = require('/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright');
const fs = require('fs');

const OUT = '/tmp/overview_compare';
const REF_BASE = 'http://localhost:8766';
const DEMO_URL = 'http://localhost:8765/index.html';

const TARGETS = [
  { name: 'zkj',      refPath: '/中科金接入_demo_v1.0/index.html',  refId: 13, demoId: 13 },
  { name: 'yizhi',    refPath: '/一知科技接入_v1.0/index.html',     refId: 'task-003', demoId: 3 },
  { name: 'diansheng',refPath: '/电声接入_demo_v1.0/index.html',     refId: 13, demoId: 20 },
  { name: 'dazhong',  refPath: '/大众通信接入_demo_v1.1/index.html', refId: 17, demoId: 17 },
  { name: 'houpu',    refPath: '/厚朴接入_demo_v1.0/index.html',     refId: 13, demoId: 24 },
  { name: 'binglan',  refPath: '/冰兰接入_v1.0/index.html',          refId: 1,  demoId: 22 }
];

const SERIALIZE = `(() => {
  function ser(el) {
    if (!el || el.nodeType !== 1) return null;
    var cls = (typeof el.className === 'string' ? el.className : '').trim();
    var kids = Array.prototype.map.call(el.children, ser).filter(Boolean);
    var own = '';
    if (!el.children.length) own = (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 80);
    return { tag: el.tagName.toLowerCase(), cls: cls, text: own, kids: kids };
  }
  var root = document.querySelector('#sceneDetailContent .overview-section');
  if (!root) return null;
  var lines = [];
  (function walk(n, d) {
    lines.push(d + n.tag + (n.cls ? '.' + n.cls.split(/\\s+/).join('.') : '') + (n.text ? ' | ' + n.text : ''));
    n.kids.forEach(function (k) { walk(k, d + '  '); });
  })(ser(root), '');
  return lines.join('\\n');
})()`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: '/Users/huhaowen/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell'
  });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const report = {};

  for (const t of TARGETS) {
    const entry = { ref: {}, demo: {} };
    /* ---- 参考源 ---- */
    try {
      await page.goto(REF_BASE + encodeURI(t.refPath), { waitUntil: 'networkidle' });
      await page.evaluate((id) => window.Pages['scene-list'].showDetail(id), t.refId);
      await page.waitForTimeout(600);
      const drawer = page.locator('.scene-detail-drawer');
      await drawer.screenshot({ path: `${OUT}/${t.name}_ref.png` });
      entry.ref.structure = await page.evaluate(SERIALIZE);
    } catch (e) { entry.ref.error = String(e).slice(0, 300); }

    /* ---- DEMO ---- */
    try {
      await page.goto(DEMO_URL, { waitUntil: 'networkidle' });
      await page.evaluate(() => window.Nav.navigateTo('scene-list', 'scene-list'));
      await page.waitForTimeout(600);
      await page.evaluate((id) => window.Pages['scene-list'].showDetail(id), t.demoId);
      await page.waitForTimeout(600);
      const drawer = page.locator('.scene-detail-drawer');
      await drawer.screenshot({ path: `${OUT}/${t.name}_demo.png` });
      entry.demo.structure = await page.evaluate(SERIALIZE);
    } catch (e) { entry.demo.error = String(e).slice(0, 300); }

    report[t.name] = entry;
  }

  await browser.close();
  fs.writeFileSync(`${OUT}/structures.json`, JSON.stringify(report, null, 2));
  console.log('done. screenshots + structures at ' + OUT);
})();
