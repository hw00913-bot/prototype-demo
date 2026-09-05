# 项目结构摘要

> S5 基于磁盘真实文件结构生成。本文只描述可编辑边界，不拆分实现任务，不把 Loop 工具包或冻结需求包当作业务代码。

## 可编辑业务文件清单

| 路径 | 类型 | 责任 | 当前事实 | 可编辑原因 |
| --- | --- | --- | --- | --- |
| `index.html` | entry/layout | 顶部栏、侧边导航、页面宿主、脚本装载 | 右上角已有文档入口和用户下拉；侧栏导航写在 HTML；所有页面脚本顺序加载 | 新增“使用情况”入口、角色演示入口及新页面脚本需要在此接入 |
| `assets/css/app.css` | style | 主应用布局、页面、抽屉、弹窗和表格样式 | 当前主要业务样式集中在单文件 | 充值管理、使用情况和响应式样式可在保持现有设计语言下扩展 |
| `assets/css/global.css` | style | 通用设计规范与公共组件样式 | 已存在但 index 当前主要加载 app.css | 仅在抽取真正通用样式时修改，需说明全局影响 |
| `js/app.js` | app/global | 当前用户、顶部用户菜单、账号信息和登录演示 | `CurrentUser` 为模块内变量，未直接导出；顶部菜单函数挂到 window | 右上角使用情况、角色/当前租户 mock 和权限入口可能需要在此扩展 |
| `js/nav.js` | routing | RouteMap、页面切换、面包屑、侧栏高亮和遮罩清理 | 实际路由表硬编码于 RouteMap；`config/nav.json` 只有首页，不是现有导航的唯一事实源 | 若使用情况作为独立页面宿主渲染，需要增加页面路由或提供专用打开方式 |
| `js/common.js` | shared utility | toast、筛选、日期、Tab 等公共交互 | 通过 window 暴露公共方法 | 仅在新页面确需复用时扩展，避免放置业务数据 |
| `js/pages/sys-tenant.js` | page | 租户管理、充值管理、计费、旧外部充值单和余额调整 | 1,889 行；现有充值抽屉包含“计费明细/充值单管理/余额调整”，依赖外部单号，按金额和大小模型价格换算；已包含冻结释放函数和历史渲染 | PAGE-001~PAGE-004 的主要落点；需替换新充值路径、保留冻结闭环并修复必要兼容问题 |
| `mock/data.js` | data | 全站 mock 数据与枚举 | 现有租户、旧充值单、历史、金额调整、冻结任务、任务和通话数据集中于此 | 新增统一分钟池、内部流水、租户标记、使用情况和任务明细数据必须集中在此 |
| `config/nav.json` | config | 名义导航配置 | 当前只含首页，与 index/js/nav.js 的真实导航不一致 | 本轮若触及导航需同步更新，但不能单独依赖它驱动现有页面 |
| `config/project.json` | config | 项目标识与依赖约束 | `allowDependencies=false` | 通常只读；若新增项目级演示配置需保持无依赖约束 |
| `docs/interaction.html` | delivery doc | 统一交付视图中的交互说明 | 当前为新一轮页面壳 | S9 由标注提示词技能更新正文 |
| `flowcharts/business-process.html` | delivery diagram | 本地 HTML 业务流程图 | 当前 `data-diagram-state="empty"` 页面壳 | S7 必须基于本轮记忆生成 ready 状态、泳道、节点和边 |
| `flowcharts/sequence-interaction.html` | delivery diagram | 本地 HTML 时序交互图 | 当前 `data-diagram-state="empty"` 页面壳 | S7 必须基于本轮时序生成 ready 状态、参与者和消息 |
| `related-systems/index.html` | delivery page | 关联系统展示 | 当前 `data-related-systems-state="empty"` | 本轮 D智链为 not_required，可保持明确空态并解释无新增外部依赖 |
| `js/delivery-nav.js` | delivery shell | 五视图内部切换 | 最新运行时已同步 | 仅为保证五视图可用时修改，不承载充值业务 |
| `assets/css/delivery-diagrams.css` | delivery style | 交付图通用样式 | 最新运行时已同步 | S7 可复用，不应写充值业务状态数据 |

## 页面与入口

- `index.html`：唯一业务原型入口；包含顶部栏、静态侧栏和 `#page-content` 页面宿主。
- `index.html .right-area`：右上角“使用情况”入口的真实落点；当前只有功能说明、计算逻辑和用户下拉。
- `index.html #sub-system`：系统管理侧栏；“租户管理”通过 `sys-tenant` 进入。
- `js/nav.js RouteMap`：实际页面路由映射；页面模块以 `window.Pages[pageKey]` 注册。
- `js/pages/sys-tenant.js`：租户列表和充值管理抽屉；PAGE-001~PAGE-004 优先在该模块内复用/重构。
- `js/pages/*.js`：页面模块目录；PAGE-005/PAGE-006 如拆为独立模块，应在此创建并由 index 装载。
- `config/nav.json`：目前仅含首页，后续修改导航时需要与真实静态导航保持一致。

## 公共组件与复用边界

- `js/components/`：当前只有占位文件；只有当充值表单、状态卡片或明细表确实被多个页面复用时才新增公共组件。
- `js/common.js`：可复用 toast、Tab、日期和筛选交互；不要放租户、套餐、流水或用量原始数据。
- `assets/css/app.css`：现有 B 端页面组件样式主源；新增类名需以 `tenant-`、`recharge-`、`usage-` 等业务前缀隔离。
- `js/pages/sys-tenant.js` 中已有冻结释放与租户账单汇总函数，重构前需保留等价行为；不直接删除任务冻结生命周期。

## 数据与配置来源

- `mock/data.js`：唯一大型业务 mock 数据源。现有相关区段包括：
  - `MockTenantBillingRows`
  - `MockRechargeOrders`
  - `MockTenantAccounts`
  - `MockTenantRows`
  - `MockTenantRechargeHistory`
  - `MockTenantBalanceAdjustments`
  - `MockTenantFrozenTasks`
  - 外呼任务和通话记录数据
- 新增数据边界：统一分钟池、内部充值记录、手工调整记录、租户角色/当前租户、按日用量和任务级用量均进入 `mock/data.js`。
- `config/project.json`：项目 ID 和无依赖约束。
- `config/nav.json`：需与 `index.html` 和 `js/nav.js` 同步，当前不能假设其已驱动完整菜单。

## 现有充值实现边界

- 现有入口：系统管理 → 租户管理 → 操作列“充值管理”。
- 现有 `showBillingDrawer` 渲染三个旧 Tab，外部单号读取/确认关联集中在 `showBillingDrawer`、`readRechargeOrder`、`confirmRechargeOrder`、`activateRecharge` 等函数。
- 现有冻结闭环函数包括 `syncFrozenTaskReleases`、`releaseFrozenTask`、`releaseFrozenTasksByScene`，属于必须保留的行为。
- 现有余额调整集中在 `showAdjustmentModal`、`submitAdjustmentFromModal`、`createBalanceAdjustment`，当前为金额扣减，需要升级为双方向/双对象。
- 已知兼容缺陷涉及 `renderHistoryRows` 的历史数据渲染，S7 必须先复现再决定最小修复。
- 旧大小模型金额/单价换算函数仍存在，统一分钟池页面不得继续把两种模型余额分别展示；历史数据只读兼容。

## 标注与交互说明位置

- 源码锚点：业务页面或组件上的 `data-anno`、`data-anno-page`、`data-anno-label`、`data-anno-kind`、`data-anno-fields`。
- 标注运行时：`annotations/annotation-runtime.js` 与 `annotations/annotation.css`。
- 标注数据：`annotations/annotations.js`，本轮保持人工回写，不由 S7/S9 自动生成。
- 交互说明：`docs/interaction.html`。
- 业务流程图：`flowcharts/business-process.html`。
- 时序交互图：`flowcharts/sequence-interaction.html`。
- 关联系统展示：`related-systems/index.html`，本轮可保持明确空态。
- 统一切换：上述页面与 `index.html` 均加载 `js/delivery-nav.js`。

## 框架与工具文件

- `tools/loop_run.py`、`tools/loop_preflight.py`：工作流与预检入口，只由总控调用。
- `.clauderules`：标注运行规则。
- `CLAUDE.md`：项目协作与执行边界。
- `config/workflow.json`、`memory/stage-log.md`、`memory/final-snapshot.json`：Loop 控制状态，业务实现不得手工修改。
- `annotations/annotations.js`：本轮人工标注数据入口，S7 不写。

## 不纳入实现/交付的目录

- `tools/prototype-loop-orchestrator/`：总控工具包，禁止纳入业务修改、任务拆分和交付统计。
- `requirement-analysis/`：冻结需求分析来源，只读引用，不作为原型业务文件。
- `.loop-history/`：历史轮次归档，不读取为当前业务事实，不修改。
- `.git/`、系统缓存和临时文件：不属于原型交付。
- 未在本轮页面范围内的 `js/pages/report-*.js`、`result-*.js`、`scene-*.js`、`sys-account.js`、`sys-scene.js`、`sys-tags.js`：默认不修改，除非验证证明充值改造造成跨页回归。
