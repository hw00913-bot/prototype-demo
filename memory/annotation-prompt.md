# 手动标注提示词（S9 重生成版）

> 生成日期：2026-08-21。本文是本轮标注的生成依据；经用户明确要求，55 条新标注已回写至 `annotations/annotations.js`。禁止引用历史标注。

## 目标与颗粒度

- 面向产品、研发、测试联合评审，解释当前静态原型中已实现的业务规则、数据口径、平台差异、关键交互和异常处理。
- 本轮按“筛选/页签 → 核心数据区 → 关键动作 → 详情或配置层”拆分，共 55 个唯一锚点。每个锚点生成且只生成 1 条标注，不得把同页多个锚点合并成一条大而泛的页面说明。
- 普通标题、装饰文本、分页按钮、刷新图标等无独立业务含义的元素不生成标注。
- 动态弹窗或抽屉锚点在相应操作触发后出现；标注运行时会在 DOM 变化后重新定位。

## 标注输入资料

- 当前项目事实：`memory/project.md`、`memory/business-rules.md`、`docs/decisions.md`。
- 功能说明唯一事实源：`docs/功能说明文档.md`；`docs/功能说明文档.html` 仅由该 Markdown 生成，不作为独立输入。
- 当前验收：`memory/acceptance-map.md`；执行与变更：`memory/execution-steps.md`、`memory/change-log.md`、`memory/verification-log.md`。
- 资料来源：`memory/source-materials.md`；字段事实：`memory/field-map.md`。
- 来源编号：SRC-001 一知科技、SRC-002 中科金、SRC-003 电声、SRC-004 冰兰、SRC-005 厚朴、SRC-006 大众通信、SRC-007 意向标签管理、SRC-008 智能外呼中台底座、SRC-009 充值方案、SRC-010 线索报表。
- 仅允许使用下方源码锚点及其声明的 `fieldRefs`。资料不足时写入缺口说明，不得编造接口、权限、字段或业务规则。

## 可用 data-anno 锚点清单

> 以下 `page`、`label`、`kind`、`fieldRefs` 均逐字来自当前源码同一元素。

- page: home | data-anno: home-usage-cards | selector: [data-anno="home-usage-cards"] | label: 用量余额 | kind: region | fieldRefs: none | file: js/pages/home.js
- page: scene-list | data-anno: scene-list-filters | selector: [data-anno="scene-list-filters"] | label: 外呼任务筛选 | kind: region | fieldRefs: FLD-003,FLD-004,FLD-006 | file: js/pages/scene-list.js
- page: scene-list | data-anno: scene-list-grid | selector: [data-anno="scene-list-grid"] | label: 外呼任务列表 | kind: region | fieldRefs: FLD-001,FLD-003,FLD-004,FLD-006,FLD-007,FLD-008,FLD-009 | file: js/pages/scene-list.js
- page: scene-list | data-anno: scene-list-dazhong-readonly | selector: [data-anno="scene-list-dazhong-readonly"] | label: 大众通信任务详情（只读） | kind: region | fieldRefs: FLD-014,FLD-015 | file: js/pages/scene-list.js
- page: scene-list | data-anno: houpu-task-detail | selector: [data-anno="houpu-task-detail"] | label: 厚朴任务详情（只读） | kind: region | fieldRefs: FLD-013,FLD-014 | file: js/pages/scene-list.js
- page: scene-list | data-anno: houpu-token-expired | selector: [data-anno="houpu-token-expired"] | label: 模拟令牌失效按钮 | kind: action | fieldRefs: none | file: js/pages/scene-list.js
- page: scene-list | data-anno: scene-task-detail | selector: [data-anno="scene-task-detail"] | label: 外呼任务详情 | kind: region | fieldRefs: FLD-001,FLD-002,FLD-003,FLD-004,FLD-005,FLD-006,FLD-007,FLD-008,FLD-009,FLD-010,FLD-011,FLD-012,FLD-013,FLD-014,FLD-015 | file: js/pages/scene-list.js
- page: scene-block | data-anno: block-group-list | selector: [data-anno="block-group-list"] | label: 黑名单分组 | kind: region | fieldRefs: FLD-070 | file: js/pages/scene-block.js
- page: scene-block | data-anno: block-filters | selector: [data-anno="block-filters"] | label: 黑名单筛选 | kind: region | fieldRefs: FLD-071,FLD-073,FLD-074 | file: js/pages/scene-block.js
- page: scene-block | data-anno: block-management-actions | selector: [data-anno="block-management-actions"] | label: 黑名单维护操作 | kind: region | fieldRefs: none | file: js/pages/scene-block.js
- page: scene-block | data-anno: block-table | selector: [data-anno="block-table"] | label: 黑名单号码列表 | kind: table | fieldRefs: FLD-070,FLD-071,FLD-072,FLD-073,FLD-074,FLD-075 | file: js/pages/scene-block.js
- page: report-call | data-anno: report-call-table | selector: [data-anno="report-call-table"] | label: 通话统计列表 | kind: table | fieldRefs: FLD-006,FLD-040,FLD-041,FLD-042,FLD-043,FLD-044,FLD-045 | file: js/pages/report-call.js
- page: report-call | data-anno: report-call-tabs | selector: [data-anno="report-call-tabs"] | label: 通话统计口径切换 | kind: region | fieldRefs: none | file: js/pages/report-call.js
- page: report-call | data-anno: report-call-filters | selector: [data-anno="report-call-filters"] | label: 通话统计筛选 | kind: region | fieldRefs: FLD-006,FLD-040 | file: js/pages/report-call.js
- page: report-billing | data-anno: report-billing-rule | selector: [data-anno="report-billing-rule"] | label: 计费口径 | kind: region | fieldRefs: none | file: js/pages/report-billing.js
- page: report-billing | data-anno: report-billing-filters | selector: [data-anno="report-billing-filters"] | label: 计费统计筛选 | kind: region | fieldRefs: FLD-006,FLD-050,FLD-055 | file: js/pages/report-billing.js
- page: report-billing | data-anno: report-billing-table | selector: [data-anno="report-billing-table"] | label: 计费统计列表 | kind: table | fieldRefs: FLD-006,FLD-050,FLD-055 | file: js/pages/report-billing.js
- page: report-billing | data-anno: report-billing-detail | selector: [data-anno="report-billing-detail"] | label: 计费明细 | kind: region | fieldRefs: FLD-006,FLD-050,FLD-055 | file: js/pages/report-billing.js
- page: report-clue | data-anno: report-clue-vehicle-tabs | selector: [data-anno="report-clue-vehicle-tabs"] | label: NEV/ICE 线索切换 | kind: region | fieldRefs: none | file: js/pages/report-clue.js
- page: report-clue | data-anno: report-clue-stat-filters | selector: [data-anno="report-clue-stat-filters"] | label: 线索统计筛选 | kind: region | fieldRefs: FLD-040 | file: js/pages/report-clue.js
- page: report-clue | data-anno: report-clue-table | selector: [data-anno="report-clue-table"] | label: 线索统计列表 | kind: table | fieldRefs: FLD-040,FLD-041,FLD-043,FLD-045 | file: js/pages/report-clue.js
- page: report-clue | data-anno: report-clue-detail-filters | selector: [data-anno="report-clue-detail-filters"] | label: 线索明细筛选 | kind: region | fieldRefs: FLD-020,FLD-021,FLD-024,FLD-025,FLD-031 | file: js/pages/report-clue.js
- page: report-clue | data-anno: report-clue-detail-table | selector: [data-anno="report-clue-detail-table"] | label: 外呼线索明细 | kind: table | fieldRefs: FLD-020,FLD-021,FLD-023,FLD-024,FLD-025,FLD-031 | file: js/pages/report-clue.js
- page: report-clue | data-anno: report-clue-return-filters | selector: [data-anno="report-clue-return-filters"] | label: 线索回流筛选 | kind: region | fieldRefs: FLD-024,FLD-040 | file: js/pages/report-clue.js
- page: report-clue | data-anno: report-clue-return-table | selector: [data-anno="report-clue-return-table"] | label: 线索回流统计 | kind: table | fieldRefs: FLD-024,FLD-040 | file: js/pages/report-clue.js
- page: report-clue | data-anno: report-clue-main-tabs | selector: [data-anno="report-clue-main-tabs"] | label: 线索报表类型切换 | kind: region | fieldRefs: none | file: js/pages/report-clue.js
- page: result-records | data-anno: result-records-detail | selector: [data-anno="result-records-detail"] | label: 通话详情 | kind: region | fieldRefs: FLD-020,FLD-021,FLD-022,FLD-023,FLD-024,FLD-025,FLD-026,FLD-027,FLD-028,FLD-029,FLD-030,FLD-031,FLD-032,FLD-033,FLD-034,FLD-035,FLD-036 | file: js/pages/result-records.js
- page: result-records | data-anno: result-records-filters | selector: [data-anno="result-records-filters"] | label: 通话记录筛选 | kind: region | fieldRefs: FLD-020,FLD-021,FLD-022,FLD-024,FLD-025,FLD-027 | file: js/pages/result-records.js
- page: result-records | data-anno: result-records-table | selector: [data-anno="result-records-table"] | label: 通话记录列表 | kind: table | fieldRefs: FLD-020,FLD-021,FLD-022,FLD-023,FLD-024,FLD-025,FLD-027 | file: js/pages/result-records.js
- page: result-clue | data-anno: result-clue-customer-tags | selector: [data-anno="result-clue-customer-tags"] | label: 客户详细标签 | kind: region | fieldRefs: FLD-031,FLD-036 | file: js/pages/result-clue.js
- page: result-clue | data-anno: result-clue-revisit-detail | selector: [data-anno="result-clue-revisit-detail"] | label: 线索多次回访详情 | kind: region | fieldRefs: FLD-020,FLD-021,FLD-025,FLD-026,FLD-031 | file: js/pages/result-clue.js
- page: result-clue | data-anno: result-clue-filters | selector: [data-anno="result-clue-filters"] | label: 线索记录筛选 | kind: region | fieldRefs: FLD-020,FLD-024,FLD-025,FLD-027,FLD-031 | file: js/pages/result-clue.js
- page: result-clue | data-anno: result-clue-table | selector: [data-anno="result-clue-table"] | label: 线索记录列表 | kind: table | fieldRefs: FLD-020,FLD-021,FLD-024,FLD-025,FLD-027,FLD-031 | file: js/pages/result-clue.js
- page: sys-scene | data-anno: sys-scene-filters | selector: [data-anno="sys-scene-filters"] | label: 业务场景筛选 | kind: region | fieldRefs: FLD-003,FLD-006,FLD-013 | file: js/pages/sys-scene.js
- page: sys-scene | data-anno: sys-scene-add-btn | selector: [data-anno="sys-scene-add-btn"] | label: 新建业务场景 | kind: action | fieldRefs: none | file: js/pages/sys-scene.js
- page: sys-scene | data-anno: sys-scene-table | selector: [data-anno="sys-scene-table"] | label: 业务场景列表 | kind: table | fieldRefs: FLD-006 | file: js/pages/sys-scene.js
- page: sys-scene | data-anno: sys-scene-form | selector: [data-anno="sys-scene-form"] | label: 业务场景配置表单 | kind: region | fieldRefs: FLD-003,FLD-006,FLD-013 | file: js/pages/sys-scene.js
- page: sys-scene | data-anno: sys-scene-platform-selector | selector: [data-anno="sys-scene-platform-selector"] | label: 智能平台选择 | kind: region | fieldRefs: FLD-006 | file: js/pages/sys-scene.js
- page: sys-scene | data-anno: sys-scene-yizhi-config | selector: [data-anno="sys-scene-yizhi-config"] | label: 一知科技平台配置 | kind: region | fieldRefs: FLD-006,FLD-014 | file: js/pages/sys-scene.js
- page: sys-scene | data-anno: sys-scene-zhongkejin-config | selector: [data-anno="sys-scene-zhongkejin-config"] | label: 中科金平台配置 | kind: region | fieldRefs: FLD-006,FLD-013 | file: js/pages/sys-scene.js
- page: sys-scene | data-anno: sys-scene-diansheng-config | selector: [data-anno="sys-scene-diansheng-config"] | label: 电声平台配置 | kind: region | fieldRefs: FLD-006,FLD-015 | file: js/pages/sys-scene.js
- page: sys-scene | data-anno: sys-scene-binglan-config | selector: [data-anno="sys-scene-binglan-config"] | label: 冰兰平台配置 | kind: region | fieldRefs: FLD-006,FLD-014,FLD-015 | file: js/pages/sys-scene.js
- page: sys-scene | data-anno: sys-scene-houpu-config | selector: [data-anno="sys-scene-houpu-config"] | label: 厚朴平台配置 | kind: region | fieldRefs: FLD-006,FLD-013 | file: js/pages/sys-scene.js
- page: sys-scene | data-anno: sys-scene-dazhong-config | selector: [data-anno="sys-scene-dazhong-config"] | label: 大众通信平台配置 | kind: region | fieldRefs: FLD-002,FLD-006,FLD-012 | file: js/pages/sys-scene.js
- page: sys-tags | data-anno: sys-tags-scene-management | selector: [data-anno="sys-tags-scene-management"] | label: 标签场景配置 | kind: action | fieldRefs: none | file: js/pages/sys-tags.js
- page: sys-tags | data-anno: sys-tags-supplier-management | selector: [data-anno="sys-tags-supplier-management"] | label: 标签供应商管理 | kind: action | fieldRefs: none | file: js/pages/sys-tags.js
- page: sys-tags | data-anno: sys-tags-config-tree | selector: [data-anno="sys-tags-config-tree"] | label: 标签配置树 | kind: region | fieldRefs: FLD-060,FLD-061,FLD-062 | file: js/pages/sys-tags.js
- page: sys-tags | data-anno: sys-tags-supplier-map | selector: [data-anno="sys-tags-supplier-map"] | label: 供应商标签映射 | kind: table | fieldRefs: FLD-060,FLD-061,FLD-062,FLD-063 | file: js/pages/sys-tags.js
- page: sys-tags | data-anno: sys-tags-table | selector: [data-anno="sys-tags-table"] | label: 中台标签列表 | kind: table | fieldRefs: FLD-060,FLD-061,FLD-062,FLD-063 | file: js/pages/sys-tags.js
- page: sys-tenant | data-anno: sys-tenant-filters | selector: [data-anno="sys-tenant-filters"] | label: 租户筛选 | kind: region | fieldRefs: FLD-050 | file: js/pages/sys-tenant.js
- page: sys-tenant | data-anno: sys-tenant-create | selector: [data-anno="sys-tenant-create"] | label: 新建租户 | kind: action | fieldRefs: FLD-050,FLD-051,FLD-052,FLD-053,FLD-054,FLD-055 | file: js/pages/sys-tenant.js
- page: sys-tenant | data-anno: sys-tenant-table | selector: [data-anno="sys-tenant-table"] | label: 租户列表 | kind: table | fieldRefs: FLD-050,FLD-051,FLD-052,FLD-053,FLD-054,FLD-055 | file: js/pages/sys-tenant.js
- page: sys-tenant | data-anno: sys-tenant-pricing | selector: [data-anno="sys-tenant-pricing"] | label: 租户计费配置 | kind: region | fieldRefs: FLD-050,FLD-055 | file: js/pages/sys-tenant.js
- page: sys-tenant | data-anno: sys-tenant-billing | selector: [data-anno="sys-tenant-billing"] | label: 租户充值与余额管理 | kind: region | fieldRefs: FLD-050,FLD-055 | file: js/pages/sys-tenant.js
- page: sys-tenant | data-anno: sys-tenant-form | selector: [data-anno="sys-tenant-form"] | label: 租户信息表单 | kind: region | fieldRefs: FLD-050,FLD-051,FLD-052,FLD-053,FLD-054,FLD-055 | file: js/pages/sys-tenant.js

## 页面级编写蓝图

| 页面 | Requirement | Source Refs | 标注重点 |
| --- | --- | --- | --- |
| home | R-013 | SRC-009 | 说明大/小模型余额、有效期、呼叫控制的展示目的；不要虚构实时接口。 |
| scene-list | R-002 | SRC-001~SRC-006 | 分开说明筛选条件、卡片数量口径、统一详情字段、厚朴令牌异常和大众只读差异。 |
| scene-block | R-003 | SRC-003 | 分开说明分组、筛选、增删导入动作、电声平台同步设置、号码级字段与同步状态；当前不得扩展为冰兰、一知或科大讯飞黑名单同步。 |
| report-call | R-004 | SRC-001、SRC-002、SRC-003、SRC-005、SRC-006 | 明确外呼/客户统计口径切换、平台筛选严格匹配、接通率和触达率计算。 |
| report-billing | R-005 | SRC-003、SRC-005、SRC-006、SRC-009 | 单独标注“接通才计费、向上取整到分钟”，再说明筛选、汇总与明细。 |
| report-clue | R-006 | SRC-010 | 主 Tab、NEV/ICE 子 Tab、汇总、明细、回流三类数据分别解释，强调 A~E 意向分级。 |
| result-records | R-007 | SRC-001、SRC-002、SRC-003、SRC-005、SRC-006 | 筛选、列表、详情分开；详情解释录音/转写/摘要和大众查询未返回状态。 |
| result-clue | R-008 | SRC-003、SRC-004、SRC-006 | 筛选、列表、客户标签、回访详情分开；说明多平台、回访次数和意向标签。 |
| sys-scene | R-009 | SRC-001、SRC-002、SRC-003、SRC-005、SRC-006 | 通用表单与六个平台配置必须各自独立标注，突出平台互斥和字段差异。 |
| sys-tags | R-010 | SRC-007、SRC-003、SRC-006 | 说明配置树层级、中台标签、供应商标签映射、排序和启停的联动限制。 |
| sys-tenant | R-011 | SRC-002、SRC-009 | 筛选、新建、列表、计费配置、充值/余额、租户表单分别说明。 |

## 手动标注提示词

请严格依据本文件的源码锚点、页面级编写蓝图和质量门禁，生成 55 条面向产品、研发、测试联合评审的细粒度标注。禁止读取或续写任何历史标注。

## 标注生成要求

请输出可直接回写为 `window.AnnotationData = { ... }` 的 JavaScript 对象。页面 key 使用锚点清单中的 `page`，同页数组按锚点清单顺序排列。

每条标注必须包含：

1. `id`：全局连续十进制数字字符串，从 `"1"` 到 `"55"`，不得使用补零或 slug。
2. `target`：逐字复制锚点清单中的 selector。
3. `title`：与锚点 `label` 一致。
4. `sourceRefs`：仅使用页面蓝图和资料来源中真实存在的 SRC-*。
5. `fieldRefs`：逐字复制锚点清单中的 `fieldRefs`；`none` 时输出空数组，不得补造字段。
6. `sections`：必须包含下列 10 个键，且内容针对当前锚点，不得复制同页其他标注的泛化描述。

十个维度：

- `functionName`：必须与锚点 `label` 完全一致。
- `functionDesc`：说明该元素在具体业务流程中的目的，至少包含对象、场景和结果。
- `permissionScope`：只能写当前资料能确认的范围；权限未定义时明确写“当前原型未定义角色权限，仅演示可见”，不得猜管理员/运营角色。
- `dataSource`：写明 SRC-*、当前 Mock 数据对象或用户输入来源；不能写不存在的真实接口名。
- `valueLogic`：写输入 → 过滤/映射/聚合/计算 → 展示结果；规则型标注明确公式或取整方式。
- `fieldDesc`：每个 FLD-* 单独一行，固定格式为 `FLD-* 字段名｜定义：...｜逻辑：...｜格式：...｜异常：...`；无字段时写“该锚点不直接承载字段，原因：...”。
- `interactionDesc`：写清触发方式、页面反馈、数据或视图变化、关闭/返回方式；动态层还需写清如何打开。
- `judgeRule`：写状态分支、必填条件、互斥条件、计算分母为 0 等实际判断；纯展示项写明无需判断。
- `exceptionRule`：至少覆盖与该锚点相关的空数据、格式错误、无匹配、外部平台未返回或操作失败之一；不得统一套用“请稍后重试”。
- `otherDesc`：写演示边界、平台差异或测试关注点；无额外事项时明确写“无”。

## 质量门禁

- 总数必须恰好 55 条，11 个核心页面均有标注；每个 selector 恰好使用一次。
- `functionName`、`title`、`target`、`fieldRefs` 与源码清单逐字一致。
- 不复用旧标注 ID、旧标题或旧内容；不读取 `annotations/annotations.js` 作为输入。
- 不给 `docs/`、`flowcharts/`、导航装饰或普通文本添加标注。
- 通话统计必须明确：接通率 = 接通总数 / 拨打总次数；分母为 0 显示 0%。触达率按当前页面名单口径说明。
- 计费必须明确：客户接通才计费，按分钟收费，不满 1 分钟按 1 分钟计；原型只演示分钟数，不虚构金额。
- 六个平台配置必须分别说明，不得合并成“选择不同平台展示不同配置”一句话。
- 外呼拦截的远端黑名单同步当前仅支持电声；标注不得写成泛化的“多平台/各平台同步”。
- 标签映射必须区分供应商原生标签与中台标准标签；租户资金必须区分计费配置、充值关联、余额调整。

## 回写说明

- 本轮已根据用户要求完成回写；后续修改仍须以本文件锚点清单为准，不得续写历史标注。
- 回写后应清理浏览器本地标注缓存或提升 `AnnotationConfig.dataVersion`，再逐页检查 marker 数量、动态弹层定位和内容换行。
- 回写完成后重新核对 `memory/annotation-coverage.md`，并执行最终验证门禁。
