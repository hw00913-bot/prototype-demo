# 项目交接文档

> 本文档用于交接给 trae（或其他 AI 编程工具）继续修改本原型。请先完整阅读本文档再动手。

## 一、项目概述

- **项目名**：智能外呼统一中台（静态 HTML 原型，无构建步骤）
- **位置**：`/Users/huhaowen/Documents/33-智能外呼/DEMO_PRESENT`
- **入口**：`index.html`
- **目标**：整合 10 个接入方独立 demo，形成六平台（一知科技、中科金智能、电声、冰兰、厚朴、大众通信）统一工作台原型，面向技术团队展示产品能力与接入流程。
- **技术栈**：纯原生 HTML/CSS/JS，无框架、无 npm、无构建。数据用全局 `var` 挂在 `window` 上，页面通过 `window.Pages['页面key'] = { render, init }` 注册。

## 二、参考源目录（重要）

整合的 10 个参考 demo 在：

```
/Users/huhaowen/Documents/33-智能外呼/demo_AI_call/releases_demo/
├── 一知科技接入_v1.0/
├── 中科金接入_demo_v1.0/
├── 电声接入_demo_v1.0/
├── 冰兰接入_v1.0/
├── 厚朴任务 ID 关联（2026-08-27 用户确认；中台不再调用创建接口）
├── 大众通信接入_demo_v1.1/
├── 意向标签管理_demo_v1.0/
├── 智能外呼中台_demo_v1.0/
├── 充值方案_demo_v1.0/
└── 线索报表_v1.0/
```

**修改任何页面功能前，必须对照对应参考 demo 的同名页面/数据，确保字段、枚举、计算逻辑一致。** 这是本项目当前最大的坑（见「五、已修复的问题」）。

## 三、运行与验证

```bash
# 启动（必须用 HTTP 服务器，不能双击 index.html，因为导航靠 fetch nav.json）
cd /Users/huhaowen/Documents/33-智能外呼/DEMO_PRESENT
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
```

```bash
# JS 语法校验
find . -path './tools/prototype-loop-orchestrator' -prune -o -name '*.js' -print -exec node --check {} \;
```

```bash
# 阶段预检（本 loop 已全部完成，可作回归用）
python3 tools/loop_run.py check . --preflight-stage final
```

## 四、目录结构

```
index.html                 # 入口：侧边栏导航 + 页面容器 + 脚本加载
js/
  nav.js                   # 路由 + 面包屑 + 菜单交互（RouteMap）
  app.js                   # 应用主逻辑
  common.js                # 公共工具（Toast、筛选、Tab 等）
  delivery-nav.js          # 交付视图顶栏（原型/说明文档/流程图集 三视图切换）
  pages/                   # 11 个页面，每个页面是 IIFE，注册 window.Pages['key']
    home.js                # 首页用量余额 ← 充值方案
    scene-list.js          # 外呼列表（六平台卡片网格 + 详情抽屉三 Tab）
    scene-block.js         # 外呼拦截（黑名单）← 电声
    report-call.js         # 通话统计
    report-billing.js      # 计费统计
    report-clue.js         # 线索统计 ← 线索报表
    result-records.js      # 通话记录
    result-clue.js         # 线索记录 ← 冰兰
    sys-scene.js           # 业务场景（六平台）
    sys-tags.js            # 标签管理 ← 意向标签/大众/电声
    sys-tenant.js          # 租户管理 ← 充值方案/中科金
mock/
  data.js                  # 所有 Mock 数据（安全规则：数据严禁硬编码进 js/pages/）
config/
  nav.json                 # 顶部交付导航配置
  project.json             # 项目信息
  workflow.json            # loop 阶段状态（当前 stage: none，全部完成）
docs/
  interaction.html         # 功能说明文档（五章结构）
flowcharts/
  index.html               # 流程图集
annotations/
  annotations.js           # 标注数据（当前为回写占位 window.AnnotationData = {};）
  annotation-runtime.js    # 标注运行时
memory/                    # 项目记忆（project/business-rules/field-map/source-materials/open-items 等）
tools/
  loop_run.py              # loop 阶段推进 CLI（preflight/complete）
  loop_preflight.py        # 预检门禁逻辑
tools/prototype-loop-orchestrator/  # 总控工具包，【禁止修改】，不属于业务
```

## 五、已修复的问题

### 第一轮：首页用量余额字段命名错乱（已修复）

根因：整合时字段名被改错，导致首页算出 0：
- `rechargeAmount` 被改成 `callBalance`
- `frozenMinutes`/`unitPriceSnapshot` 被改成 `frozenAmount`/`unitPrice`
- 租户缺 `consumedAmount`
- 充值历史、冻结任务、单价规则等记录被精简

修复内容：
1. `mock/data.js`：对齐充值方案 demo，恢复 `rechargeAmount`、`consumedAmount`、`frozenMinutes`+`unitPriceSnapshot`、`activated`，补齐充值历史(15条)、冻结任务(6条)、单价规则(10条)、充值单(15条)、供应商目录 `MockBillingVendors`。
2. `js/pages/home.js`：重写 `getHomeSummary` 用正确字段，`data-anno="home-usage-cards"`，移除此前多加的「平台概览」区块。
3. `js/pages/sys-tenant.js`：同步 `callBalance→rechargeAmount`、`frozenAmount→frozenMinutes*unitPriceSnapshot`。
4. 同步更新 `memory/annotation-prompt.md`、`memory/annotation-coverage.md` 首页锚点。

修复后首页正确显示：大模型 9,238.10 分钟 / 小模型 13,857.14 分钟 / 有效期 2026-06-12 ~ 2027-06-11 / 可发起。

### 第二轮：逐页对照参考源修复（已修复，2026-08-19，详见 memory/change-log.md）

**数据层 `mock/data.js`：**
- 大众任务补 `task_type: 7`、`destination_extension_list` 时段；`DazhongSceneCodeByScene` 恢复参考版编码（AI-DZ-HD-COLD 等）。
- 大众通话记录 status 恢复数字枚举（0-12）+ forEach 兜底补 `callid`/`taskUuid`/`sceneCode` 等；新增 `MockDazhongCallDetailByRecordId`（3 条大众详情）。
- `MockBillingCallDetail` 恢复 5+6 条；新增 `MockAssignedData`、`MockImportHistory`。

**页面层：**
- `result-records.js`（12 项）：大众 0–12 原始码按统一主表归并为 DCC 25 项状态、回调落库规则（callid 必须存在）、大众详情按 callid 下钻、详细信息面板大众 13 字段、新增「关联任务 ID」列、五维筛选、大众对话文本动态生成、录音播放器按 recordingDuration。
- `scene-list.js`（10 项）：redial_conditions 两形态归一化（id 19 正确显示中文枚举）、任务详情补字段、呼叫时段按 wday 渲染、已分配子 Tab 动态取数、手动导入完整实现。
- `report-billing.js`：分页组件恢复、详情弹窗设置按钮补回、计费规则备注去掉大众 SaaS 后缀。
- `sys-tenant.js`（P0 口径）：getTenantBillingSummary 重写为参考版算法（仅已激活充值单 − adjustmentOutAmount − consumedAmount + Math.max 下限）+ syncFrozenTaskReleases + 多个 bug 修复。**渝兴 ¥3,880.00 / 燃油车 ¥1,000,001,719.00，与 home.js 完全一致**。
- `docs/计算逻辑.html`：从充值方案 demo 拷贝并适配 delivery-nav；`index.html` 顶栏新增「📐 计算逻辑」入口。

**验证**：node --check 全过；浏览器验证（状态映射/重呼条件/余额口径/分页/入口 200）全过；控制台 0 错误无 404；`loop_run.py check --preflight-stage final` PASS。

### 第三轮：业务场景创建抽屉对齐六平台参考源（已修复，2026-08-20）

重写 `js/pages/sys-scene.js` 的「新建/编辑业务场景」抽屉，对齐 `releases_demo` 六个供应商原型的创建界面：

- **公共区**：场景名称/编码（20 字计数）、场景描述、可用租户多选、智能平台六选一、场景类型（电声/冰兰仅新线索+冷线索，其余禁用）、数据导入方式（默认版手动导入/自动传入）。
- **一知科技**：场景id + 提示条 + 模型类型（小/大）→ 选择一知账号（含计费提示）；传入信息默认 7 字段不可删。
- **中科金智能**：任务id + 提示条 + 模型类型 → 账号（默认）；传入信息默认「姓名」字段。
- **电声**：匹配机器人（场景类型自动映射 robotCode）+ 呼叫时段多行（周几+起止时间，可增删）+ 排除日期（含 tooltip）+ N天M呼（间隔分钟多选下拉）+ 黑名单拦截 + 自动启动开关（关→执行时间）+ 模型类型/电声账号（按模型过滤）；提交按钮变「确定并生成任务」。
- **冰兰**：数据导入方式（手动导入/接口传入）+ 呼叫通道（联友 VCP → 机器人id 输入+优先级+呼叫策略；冰兰外呼通道 → 线路+机器人id 下拉）；策略区：周呼叫日、多时段（可增删重编号）、自动重拨开关+重拨表格、黑名单/规则拦截；传入字段表格切 4 列（无序号）且可编辑/删除（含确认弹窗）。
- **厚朴**：输入平台已有 `task_id` 并“查询并关联”；场景必须选择大模型或小模型，原型使用模拟的服务端默认账号并在业务信息之前只读展示；同一 `task_id` 全局只允许关联一个业务场景。成功后只读反显任务名称、`bot_id`、`streaming/same_day`、执行时段、并发、重呼、未呼优先、号码模板、实时原始任务状态和中台映射状态。中台不调用厚朴任务创建接口；OAuth2 与真实回调地址仅在服务端维护。
- **大众通信**：任务ID(uuid) + 提示条 + 模型类型 → 默认账号。
- **业务信息**：场景传入/提取信息双 Tab + 添加字段弹窗（对齐中科金参考源）；提交含分平台必填校验，成功后写回列表。

配套：`mock/data.js` 提供抽屉 Mock（MockSceneRows/MockSceneTypeOptions/MockDefaultInputFields/MockYizhiAccounts/MockBinglan*/MockHoupuBots/MockHoupuTemplates/MockDiansheng* 等）；厚朴机器人和模板仅作为任务查询结果的只读快照，模板字段只维护一份。

**验证**：node --check 全过；playwright 逐平台切换联动（面板显隐/账号过滤/机器人映射/通道切换/字段联动/提交校验与建行）全过；控制台 0 错误无 404；`loop_run.py check --preflight-stage final` PASS。

### 第四轮：外呼列表详情抽屉对齐六平台参考源（已修复，2026-08-20）

重写 `js/pages/scene-list.js` 的「查看外呼」抽屉（三 Tab：数据概览/呼叫名单/任务详情），任务详情 Tab 按平台差异化渲染，对齐 `releases_demo` 六个供应商原型：

- **中科金智能**：创建日期、机器人名称（名称+ID）、任务编码、启动方式（手动/定时+时间）、拨打时段（周循环+多时段）、AI坐席数（含弹性坐席开关）、自动重拨设置（重呼模式 1=策略组/2=状态+次数+间隔，含状态码中文映射）、外呼进度。
- **一知科技**：创建日期、话术名称、任务id、任务描述、启动方式、拨打时间段、自动重拨设置（条件组）、外呼进度、一知科技场景id、模型类型、一知账号。
- **大众通信**（2.0 编辑接口字段）：任务名称、话术名称、任务 ID(uuid)、任务描述、拨打时间段（周几汇总+每条 work_hour 自身 wday+起止日期弱化色）、AI坐席数（limit/maximumcall/弹性坐席）、自动重拨设置（开关/首次外呼优先/间隔/次数/挂断原因+对话状态双维条件，da_status 数字与字符串枚举归一化中文映射）。
- **电声**：任务编码、任务名称、机器人名称（映射表兜底）、场景类型、呼叫时段（时段N：周几+起止、排除日期、超出时段跳过/顺延）、自动重呼配置（N天M呼：最大天数/次数/逐次间隔）、黑名单校验配置（分组编码）、自动启动配置、备注、创建/更新时间。
- **冰兰**：创建日期、话术名称、任务id、任务描述、启动方式、拨打时间段、风控策略（自定义策略+账号黑名单）、自动重拨设置（多条件组：间隔/次数/条件）。
- **厚朴**：任务详情仅展示 `task_id`、默认账号、任务名称、机器人、执行时段、并发、重呼、未呼优先、`batch_id`、有效号码数、创建时间和外呼进度；不重复展示关联方式、任务类型、服务端回调、模板、任务状态、状态获取方式和状态读取时间。任务状态仍用于列表卡片及详情顶部状态，浏览器端令牌演示保持删除。
- **数据概览 Tab 意向洞察环形图按平台差异化**：大众通信 6 级（A-高意向~F-号码无效）、电声 4 级（A高/B中/C低/D无意向，专属配色）、一知科技 8 级（含 H 已买车/J 语音助手）、默认 6 级。
- **头部启/停按钮**：中科金/大众/电声不显示（对齐参考源），冰兰显示「终止任务」，其余显示「启/停任务」。

配套：`mock/data.js` 维护六平台任务详情数据；`memory/annotation-prompt.md` 保留大众只读与厚朴 v2 详情锚点，历史 `houpu-token-expired` 已移除；厚朴字段使用 FLD-016~019，通话原始追溯使用 FLD-037~039。

通话状态唯一事实位于 `docs/功能说明文档.md`“五. 其他说明 → 2”：DCC 25 项主表同时覆盖一知、科大、中科金、电声、大众通信和厚朴；厚朴 770–790 归并为项目确认的中台本地业务映射，冰兰 20 项未接通原因作为平台补充事实，不在页面标注中重复维护。

**验证**：`node --check` 全过；`tools/verify_detail_drawer.js`（playwright）六平台任务详情 Tab 关键字段断言全过、控制台 0 错误、无 404；`loop_run.py check --preflight-stage final` PASS。

### 第五轮：数据概览 Tab 对齐六平台参考源（已修复，2026-08-20）

原实现只有「外呼数据（5 卡片）+ 意向洞察环形图」两区块，与参考源三区块结构不一致。重写 `js/pages/scene-list.js` 的 `renderDataOverview`，对齐六平台参考源（六平台参考源的数据概览均为三区块：外呼数据 → 意向分类 → 意向洞察）：

- **区块一：外呼数据**（5 卡片 + ⓘ tooltip）。一知科技动态计算（imported=assigned、called、answered、filtered=max(imported−called,0)、过滤率 2 位小数、接听率取整、平均时长）；中科金/电声/冰兰/厚朴/大众对齐参考源写死口径（6/1/总外呼数2/5/83.33%/0/0%秒）。
- **区块二：意向分类**（2 行 × 3 列 6 卡片 + ⚙配置按钮，全新增）。卡片标题按平台四套格式：大众「A-高意向占比 / A-高意向 / B-意向客户合计占比 / X数量」；电声全角「A（高意向）类客户占比」；一知「A (高意向)类客户占比」且数值动态（intentionStats a/b ÷ called）；基线（中科金/冰兰/厚朴）「A (高意向)类客户占比」写死 0。
- **意向数据设置弹窗**（全新增）：三等级多选下拉（最多 3 项）+ 取消/保存 + 保存后按当前平台格式回写卡片标题。意向等级配置与标签选项按平台四套：基线 5 项（A-E）、一知 4 项、电声 4 项全角、大众 6 项（A-高意向~F-号码无效）。
- **区块三：意向洞察**：环形图平台差异保留；新增通话时长柱状图（6 档 + y 轴 + 网格线，baseline 180~28/y 轴 1500，一知 210,298~6,654/y 轴 250,000，相差 3 个数量级）；一知独有「客户关注点」条形图面板（Top10 + 前十/全部切换），双面板并排，其余平台单面板。

配套：`mock/data.js` 新增 `MockDataOverview`（baselineStats/intentLevels 四套/intentTagOptions 四套/focusPoints/durationDist 两套）和 `MockYizhiTaskStats`（12 条一知任务 answeredCount/avgDurationSec/intentionStats）；`assets/css/app.css` 补一知 focus-toggle/focus-item 系列样式。

**验证**：`node --check` 全过；`tools/verify_detail_drawer.js` 扩展数据概览断言（三区块、平台差异标题、一知双面板/25 万 y 轴、中科金 1500 y 轴、意向配置弹窗四套选项）六平台全过、控制台 0 错误、无 404；`loop_run.py check --preflight-stage final` PASS。

### 第六轮：数据概览残余差异收口（已修复，2026-08-20）

用户复查反馈「数据概览仍与参照物对不上」，逐平台对照 `releases_demo` 六个接入原型源码与 CSS 后收口三处残余差异：

- **一知环形图标签 a~f 坐标/配色错误**：此前沿用中科金六级坐标，一知参考源 8 级版有专属坐标（a=26px/434px/#3b39f5、b=64px/490px/#645ff3、c=104px/522px/#6560f7、d=176px/566px/#756ff2、e=bottom 42px、f=top 60px）。修复：`renderInsightBlock` 给 `.intent-donut-chart` 追加 `yizhi` 修饰类，`app.css` 新增 `.intent-donut-chart.yizhi .intent-donut-label.label-a~f` 覆盖规则。
- **一知任务级平均通话时长偏差**：`MockYizhiTaskStats` 任务 4 由 60秒→72秒（对齐参考源 NEV培育场景 stats）、任务 6 由 55秒→65秒（对齐参考源按 sceneName 取 stats[0] 的口径）。
- **验证脚本意向配置断言失效**：多选下拉默认收起，`innerText` 取不到选项文本（此前 A/B 项靠等级行显示文本「假通过」）。修复：脚本先点击展开等级1下拉再断言，读完收起下拉再点保存（避免弹层遮挡）；同时补环形图分平台类名断言（一知 `intent-donut-chart yizhi`/`intent-donut-ring yizhi`、电声 `intent-donut-ring diansheng`）。

另核对确认无需改动：六平台意向配置选项与初始等级（基线5项/电声4项全角/大众6项/一知4项）、外呼数据写死口径、通话时长 y 轴（1500 vs 250,000 千分位）、电声/大众 donut 文案与渐变、冰兰洞察区布局（无 grid 包裹但视觉等价）均与各参考源一致。

**验证**：`node --check` 全过；`tools/verify_detail_drawer.js` 六平台全过（含新类名断言，configMissing 全空）；临时脚本比对一知 8 标签 computed top/left/color 与参考源逐项一致（ALL LABELS MATCH）；`loop_run.py check --preflight-stage final` PASS。

### 第七轮：线索统计对齐参考源（已修复，2026-08-20）

重写 `js/pages/report-clue.js` 及对应数据与样式，完整对齐 `releases_demo/线索报表_v1.0` 原型：

- **三大主 Tab 架构**：【外呼线索统计】（#tab-manual）、【外呼线索明细】（#tab-ai）、【线索回流统计】（#tab-return）。
- **二级子 Tab 架构**：外呼线索统计与外呼线索明细均支持【总部 NEV 线索】与【总部 ICE 线索】二级子 Tab 切换。
- **外呼线索统计大表**：对齐 14 列表头（序号、导入日期、业务类型、导入线索量、外呼客户量、AI 外呼已接通量、已下发线索数、AI 接通率、平均通话时长、A~E 意向客户数），保留 `data-anno="report-clue-table"` 标注锚点。
- **外呼线索明细大表**：对齐 14 列表头（序号、导入时间、线索编码、呼叫任务场景名称、业务类型、手机号脱敏 138****8888、门店编码/名称、呼叫时间、通话状态彩色标签、通话时长、意向级别中台、意向级别业务系统、下发门店）。
- **高级筛选栏**：导入时间/呼叫时间（`date`/`datetime-local` 默认过去 7 天初始化）、意向级别多选下拉（支持全部与 A~E 互斥联动及回写）、业务类型下拉、门店模糊搜索与级联架构。
- **线索回流统计**：对齐顶部业务说明提示栏、6 列表头（含排序图标 `⇅`）及回流数绿色高亮。
- **交互与微动画**：完整实现异步导出模拟（2.5s loading 旋转动画 + Toast 提示）、重置与查询、分页栏（共 5 条、页码、跳页）。

配套：`mock/data.js` 补齐 `MockClueStatNEV` (5条)、`MockClueStatICE` (5条)、`MockClueDetailNEV` (5条)、`MockClueDetailICE` (5条)、`MockClueReturn` (5条)、`MockStoreHierarchy`（大区小区门店层级）；`assets/css/app.css` 追加 `.clue-tip-bar`、`.btn.loading .loading-icon`、`.report-clue-scroll` 等扩展样式。

**验证**：`node --check` 全过；`tools/verify_report_clue.js`（playwright）验证三大主 Tab、二级 NEV/ICE 子 Tab、14 列表头、数据行、意向多选下拉、回流 6 列表头、导出 loading 全过、控制台 0 错误、无 404；`loop_run.py check --preflight-stage final` PASS。

## 六、下一步：剩余页面对齐任务（交接给下一个 agent）

> 本章是接下来「页面对齐」工作的完整任务清单与工作方法。接手后请先通读本文档第一~五、七节，再按 6.1 的方法开工。

### 6.1 工作方法（先读这段，七轮修复沉淀的经验）

1. **对齐口径**：一切以 `releases_demo` 对应参考源为准——字段名、枚举值、文案（含全角/半角、空格）、数字、图表数据与坐标、布局结构、交互行为。参考源映射见 `memory/source-materials.md`（SRC-001~010）。
2. **标准流程**：读参考源同名页面源码与 CSS → 对比本项目实现找差异 → 改三处：`mock/data.js`（数据）、`js/pages/xxx.js`（渲染）、`assets/css/app.css`（样式）→ 验证 → 更新 `memory/change-log.md` 与本文件追加新轮次记录。
3. **分平台差异用 profile key 分发**：参考 `js/pages/scene-list.js` 的 `getOverviewProfileKey()` 模式（平台 → 画像 key → 分发数据/渲染函数），严禁全站套用单一平台的口径。
4. **已踩过的坑**（务必避开）：
   - `innerText` 断言下拉/折叠菜单时必须先展开（`display:none` 的内容 `innerText` 取不到，会产生「假通过」）；
   - 环形图/图表的标签定位、配色各平台可能不同，要对齐 computed style（top/left/color），不能只对文案；
   - Mock 数据严禁硬编码进 `js/pages/`（预检会拦）；
   - 页面 JS 一律 ES5（`var`/`function`，禁 `let`/`const`/箭头函数/模板字符串）；`tools/` 下 node 脚本可用新语法。
5. **验证三件套**（每轮改完必跑）：
   ```bash
   # ① 语法
   node --check js/pages/改的文件.js
   # ② 浏览器断言（服务须先起在 8765 端口：python3 -m http.server 8765）
   node tools/verify_detail_drawer.js   # 现有六平台详情抽屉断言，新页面建议仿照它新增 tools/verify_*.js
   # ③ 回归预检
   python3 tools/loop_run.py check . --preflight-stage final
   ```
   playwright 从全局路径引入：`require('/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright')`，headless 内核用 `/Users/huhaowen/Library/Caches/ms-playwright/chromium_headless_shell-1228/...`（见现有脚本写法）。
6. **对照参考源的导航差异**：本项目用 `window.Nav.navigateTo(pageKey, navId)`；各参考源用全局函数 `navigateTo(pageKey, navId)`。写脚本同时打开两边对比时注意区分。

### 6.2 待对齐页面清单（按优先级，逐个完成）

参考源页面文件分布（已核实）：

| 页面 | 参考源（`releases_demo/` 下相对路径） | 现状 | 对齐要点 |
|------|------|------|------|
| ① `sys-tenant.js` 租户管理 | `充值方案_demo_v1.0/js/pages/sys-tenant.js`（1713 行完整版）；辅助对照中科金/厚朴/大众/电声同名页 | 仅做了 P0 余额口径统一，结构是精简版 | 14 列表头；三 Tab 抽屉（充值单/余额调整/计费配置）；余额调整 Tab；计费配置弹窗；导出 CSV；getImportCapacity API |
| ② `report-call.js` 通话统计 | 一知/中科金/电声/冰兰/厚朴/大众/意向标签管理均有 `js/pages/report-call.js` | 从未逐平台对照 | 先跑通各平台参考页确认口径是否一致；统计卡片、图表、筛选项、明细表按平台差异分发 |
| ③ `result-clue.js` 线索记录 | 冰兰/电声/大众/意向标签管理的 `js/pages/result-clue.js` | 从未对照 | 列表列、筛选、详情弹层；冰兰为主参考源，其余平台核对差异 |
| ④ `scene-block.js` 外呼拦截 | `电声接入_demo_v1.0/js/pages/scene-block.js` | 从未对照 | 黑名单/拦截规则列表与操作 |
| ⑤ `sys-tags.js` 标签管理 | `意向标签管理_demo_v1.0/js/pages/sys-tags.js`（主）+ 电声/大众同名页 | 从未对照 | 标签分组、层级、操作 |
| ⑥ `docs/interaction.html` 文档 | — | 可选 | 第 119 行「计费统计」仍写「大众通信实际账单以 SaaS 为准」，而 `report-billing.js` 已去掉该后缀，可同步更新 |

### 6.3 已完成对齐的模块（勿重复劳动）

| 模块 | 完成轮次 | 备注 |
|------|------|------|
| `home.js` 首页用量余额 | 第一轮 | 对齐充值方案 demo，字段 rechargeAmount/consumedAmount 等 |
| `result-records.js` 通话记录 | 第二轮 | 大众数字枚举/详情下钻/五维筛选等 12 项 |
| `report-billing.js` 计费统计 | 第二轮 | 分页组件、详情弹窗、大众 SaaS 后缀移除 |
| `sys-tenant.js` P0 口径 | 第二轮 | 余额算法与 home.js 一致（渝兴 ¥3,880.00） |
| `sys-scene.js` 业务场景创建抽屉 | 第三轮 | 六平台专属面板全对齐 |
| `scene-list.js` 详情抽屉·任务详情 Tab | 第四轮 | 六平台差异渲染 |
| `scene-list.js` 详情抽屉·数据概览 Tab | 第五、六轮 | 三区块/意向配置/环形图标签坐标/通话时长，一知 8 标签 computed style 与参考源逐项一致 |
| `scene-list.js` 外呼列表卡片/筛选 | 第二轮 | 重呼条件归一化、已分配子 Tab、手动导入 |
| `report-clue.js` 线索统计 | 第七轮 | 三大主 Tab、二级 NEV/ICE 子 Tab、14 列表头统计与明细表、多选下拉、回流统计、2.5s 导出 loading 全对齐 |

### 6.4 交接检查点（每完成一个页面）

- [ ] 与参考源逐字段核对（含全角/半角标点、空格）
- [ ] `mock/data.js` 无新增硬编码到 pages 的数据
- [ ] `node --check` 通过
- [ ] 新增/更新 `tools/verify_*.js` 断言通过、控制台 0 错误、无 404
- [ ] `python3 tools/loop_run.py check . --preflight-stage final` PASS
- [ ] `memory/change-log.md` 追加记录、本文件追加轮次说明并在 6.2 表中勾销

## 七、关键约定与坑

1. **数据与逻辑分离**：所有 Mock 数据必须放 `mock/data.js`，严禁在 `js/pages/` 内硬编码数据表。
2. **页面注册方式**：每个页面是 IIFE，末尾 `window.Pages['key'] = { render, init, ... }`。导航切换靠 `nav.js` 的 `RouteMap` + `navigateTo(pageKey, navId)`。
3. **交付视图**：`index.html`、`docs/interaction.html`、`flowcharts/index.html` 都必须加载 `js/delivery-nav.js`，实现「原型页面/说明文档/流程图集」三视图在当前页内切换，不能改回整页跳转。
4. **标注系统**：页面用 `data-anno` 锚点（含 `data-anno-page`/`data-anno-label`/`data-anno-kind`/`data-anno-fields`），锚点值必须全局唯一。当前有 15 个锚点（清单见 `memory/annotation-prompt.md`）。`annotations/annotations.js` 是空占位，标注由 PM 手动回写。
5. **`tools/prototype-loop-orchestrator/` 是总控工具包**，禁止作为业务文件修改。
6. **`memory/project-startup-plan.md` 只读**（S2 冻结），不得回改。
7. **字段命名以参考源为准**：不要自行「简化」或「重命名」参考 demo 的字段名。整合时保留参考源的字段名和枚举值。
8. **改完必跑**：`node --check`（语法）+ 浏览器验证 + `python3 tools/loop_run.py check . --preflight-stage final`（若后续还走 loop 流程）。
9. **校验命令别用 `cat`/`head`/`tail`** 去读大文件，用 Read/Grep 工具。

## 八、项目记忆文件速查

| 文件 | 用途 |
|------|------|
| `memory/project.md` | 项目定位、核心页面、数据对象 |
| `memory/business-rules.md` | 平台枚举、状态枚举、计费类型、异常规则 |
| `memory/source-materials.md` | SRC-001~010 参考资料来源 |
| `memory/field-map.md` | FLD-* 字段映射（含 Annotation Point 锚点） |
| `memory/open-items.md` | 待确认问题、风险项 |
| `memory/change-log.md` | 变更记录 |
| `memory/acceptance-map.md` | 验收映射 R-001~R-013 |

## 九、一句话总结

项目已完成 loop S0-S9 全部阶段，静态原型可用。七轮修复后，首页/通话记录/计费统计/业务场景创建抽屉/外呼列表（卡片+详情三 Tab 含数据概览）/线索统计（三大主 Tab+二级 NEV/ICE 子 Tab+14 列表头+多选下拉+回流统计+导出动画）均已对齐 `releases_demo` 各参考源。**剩余工作见「六、下一步」：6 个待对齐页面（sys-tenant P1-P3 结构、report-call、result-clue、scene-block、sys-tags、interaction 文档），接手 agent 按 6.1 工作方法 + 6.2 清单顺序执行，每页过 6.4 检查点。**
