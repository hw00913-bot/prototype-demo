#!/usr/bin/env node
/* 验证外呼列表详情抽屉六平台对齐：数据概览分平台口径（对齐 releases_demo 六个接入原型）、任务详情 Tab、控制台错误、404。 */
const { chromium } = require('/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright');

/* 数据概览公共断言（六平台接入 demo 均为三区块） */
const OVERVIEW_COMMON = ['外呼数据', '导入客户数', '意向分类', '意向洞察', '通话时长', '客户数量（位）'];

const CASES = [
  {
    id: 13, platform: '中科金智能', profile: 'default',
    overviewExpects: ['总外呼数：2', '过滤比例：83.33%', '总接听率：0%', 'A (高意向)类客户占比', 'B (潜在)类客户占比', 'A (高意向)/B (潜在)类客户数', 'A(高意向): 1.65%', 'F(停机/空号): 4.38%', '1500', '1341'],
    noFocus: true,
    configExpects: ['A (高意向)', 'B (潜在)', 'C (一般)', 'D (忙碌/敷衍)', 'E (拒绝/无效/无应答)'],
    taskExpects: ['机器人名称', '东风日产新线索话术', '自动重拨设置', 'AI坐席数', '任务编码']
  },
  {
    id: 1, platform: '一知科技', profile: 'yizhi',
    overviewExpects: ['总外呼数：120', '过滤比例：40.00%', '75', '总接听率：63%', '65', 'A (高意向)类客户占比', 'B (意向客户)类客户数', 'A(有购车计划): 6.84%', 'J(语音助手): 3.65%', '客户关注点', '前十', '全部', '26,727', '250,000', '210,298'],
    hasFocusToggle: true,
    configExpects: ['A (高意向)', 'B (意向客户)', 'C (潜在客户)', 'D (一般意向)'],
    taskExpects: ['话术名称', '任务id', '拨打时间段', '自动重拨设置', '一知账号', '一知科技场景id']
  },
  {
    id: 17, platform: '大众通信', profile: 'dazhong',
    overviewExpects: ['总外呼数：2', 'A-高意向占比', 'B-意向客户占比', 'A-高意向 / B-意向客户合计占比', 'A-高意向数量', 'A-高意向：1.65%', 'F-号码无效：4.38%', '1500', '1341'],
    noFocus: true,
    configExpects: ['A-高意向', 'B-意向客户', 'C-潜在客户', 'D-一般意向', 'E-需再次跟进', 'F-号码无效'],
    taskExpects: ['任务名称', '华东店-冷线索跟进-大众通信', '话术名称', '拨打时间段', '自动重拨设置', '重呼条件（对话状态）']
  },
  {
    id: 20, platform: '电声', profile: 'diansheng',
    overviewExpects: ['总外呼数：2', 'A（高意向）类客户占比', 'B（中意向）类客户占比', 'A（高意向）：8.33%', 'B（中意向）：16.67%', 'C（低意向）：25%', 'D（无意向）：50%', '1500', '1341'],
    noFocus: true,
    configExpects: ['A（高意向）', 'B（中意向）', 'C（低意向）', 'D（无意向）'],
    taskExpects: ['任务编码', '东风日产新线索激活任务', '呼叫时段', '自动重呼配置', '黑名单校验配置', '自动启动配置']
  },
  {
    id: 22, platform: '冰兰', profile: 'default',
    overviewExpects: ['总外呼数：2', 'A (高意向)类客户占比', 'B (潜在)类客户占比', 'A(高意向): 1.65%', 'F(停机/空号): 4.38%', '1500', '1341'],
    noFocus: true,
    configExpects: ['A (高意向)', 'B (潜在)', 'C (一般)', 'D (忙碌/敷衍)', 'E (拒绝/无效/无应答)'],
    taskExpects: ['话术名称', '任务id', '拨打时间段', '风控策略', '自动重拨设置']
  },
  {
    id: 24, platform: '厚朴', profile: 'default',
    overviewExpects: ['总外呼数：2', 'A (高意向)类客户占比', 'B (潜在)类客户占比', 'A(高意向): 1.65%', 'F(停机/空号): 4.38%', '1500', '1341'],
    noFocus: true,
    configExpects: ['A (高意向)', 'B (潜在)', 'C (一般)', 'D (忙碌/敷衍)', 'E (拒绝/无效/无应答)'],
    taskExpects: ['厚朴任务名称', 'HP-DEMO-新线索首访', '批次追踪 requestId', '数据列模式']
  }
];

(async () => {
  const results = [];
  const consoleErrors = [];
  const badRequests = [];
  const browser = await chromium.launch({
    executablePath: '/Users/huhaowen/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell',
  });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400) badRequests.push(r.status() + ' ' + r.url()); });
  await page.goto('http://localhost:8765/index.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.Nav.navigateTo('scene-list', 'scene-list'));
  await page.waitForTimeout(800);
  for (const c of CASES) {
    try {
      await page.locator(`.scene-card[data-id="${c.id}"] .card-action-btn.primary`).first().click({ timeout: 3000 });
      await page.waitForTimeout(400);
      /* 数据概览（默认 Tab，分平台口径）断言 */
      const overviewText = await page.locator('#sceneDetailContent').innerText();
      const overviewMissing = OVERVIEW_COMMON.concat(c.overviewExpects).filter(k => !overviewText.includes(k));
      const focusWrong = c.noFocus ? overviewText.includes('客户关注点') : false;
      /* 环形图分平台类名（一知 yizhi 8 级标签定位 / 电声 diansheng 4 级渐变） */
      const donutChartClass = await page.locator('#sceneDetailContent .intent-donut-chart').first().getAttribute('class') || '';
      const donutRingClass = await page.locator('#sceneDetailContent .intent-donut-ring').first().getAttribute('class') || '';
      const donutClsMissing = (c.donutClsExpects || []).filter(k => !donutChartClass.includes(k) && !donutRingClass.includes(k));
      /* 一知：客户关注点 前十/全部 toggle 切换 */
      let focusToggleOk = null;
      if (c.hasFocusToggle) {
        await page.locator('.focus-toggle-item:not(.active)').first().click({ timeout: 3000 });
        await page.waitForTimeout(200);
        focusToggleOk = await page.locator('.focus-toggle-item.active').first().textContent() === '全部';
      }
      /* 意向配置弹窗：打开 → 展开等级1下拉 → 检查分平台选项 → 保存关闭 */
      await page.locator('.overview-config-btn').first().click({ timeout: 3000 });
      await page.waitForTimeout(300);
      await page.locator('#intentConfigBackdrop .intent-multi-select-display').first().click({ timeout: 3000 });
      await page.waitForTimeout(200);
      const configText = await page.locator('#intentConfigBackdrop').innerText();
      const configMissing = c.configExpects.filter(k => !configText.includes(k));
      await page.evaluate(() => {
        document.querySelectorAll('.intent-multi-select-dropdown').forEach(d => d.classList.remove('open'));
      });
      await page.waitForTimeout(150);
      await page.locator('#intentConfigBackdrop .intent-config-footer .btn-primary').click({ timeout: 3000 });
      await page.waitForTimeout(300);
      /* 任务详情 Tab 断言 */
      await page.locator('.scene-detail-tab:has-text("任务详情")').first().click({ timeout: 3000 });
      await page.waitForTimeout(400);
      const taskText = await page.locator('#sceneDetailContent').innerText();
      const taskMissing = c.taskExpects.filter(k => !taskText.includes(k));
      results.push({ id: c.id, platform: c.platform, overviewMissing, focusWrong, focusToggleOk, configMissing, taskMissing });
      await page.evaluate(() => {
        const b = document.getElementById('sceneDetailBackdrop');
        if (b) b.remove();
        document.body.style.overflow = '';
      });
      await page.waitForTimeout(200);
    } catch (e) {
      results.push({ id: c.id, platform: c.platform, error: String(e).slice(0, 200) });
    }
  }
  await browser.close();
  console.log(JSON.stringify({ results, consoleErrors: consoleErrors.slice(0, 10), badRequests: badRequests.slice(0, 10) }, null, 2));
  const failed = results.filter(r => (r.overviewMissing && r.overviewMissing.length) || r.focusWrong || (r.donutClsMissing && r.donutClsMissing.length) || (r.configMissing && r.configMissing.length) || (r.taskMissing && r.taskMissing.length) || r.focusToggleOk === false || r.error);
  if (failed.length || consoleErrors.length || badRequests.length) process.exit(1);
})();
