# 手动标注提示词

> S9 生成。用于 PM 在全局验证通过后，手动复制到标注生成器或对话窗口生成评审标注。不要把本文件当成已经回写的标注数据。

## 标注输入资料

- 项目目标：见 `memory/project.md`
- 启动规划：见 `memory/project-startup-plan.md`（只读溯源）
- 当前项目事实：见 `memory/project.md`、`memory/business-rules.md`、`docs/decisions.md`
- 验收映射：见 `memory/acceptance-map.md`
- 变更记录：见 `memory/change-log.md`
- 验证记录：见 `memory/verification-log.md`
- 资料来源：见 `memory/source-materials.md`
- 字段映射：见 `memory/field-map.md`

## 标注输入资料编号清单

- 来源编号：SRC-001（一知科技接入_v1.0）、SRC-002（中科金接入_demo_v1.0）、SRC-003（电声接入_demo_v1.0）、SRC-004（冰兰接入_v1.0）、SRC-005（厚朴接入_demo_v1.0）、SRC-006（大众通信接入_demo_v1.1）、SRC-007（意向标签管理_demo_v1.0）、SRC-008（智能外呼中台_demo_v1.0）、SRC-009（充值方案_demo_v1.0）、SRC-010（线索报表_v1.0）。
- 字段编号：FLD-001、FLD-002、FLD-003、FLD-004、FLD-005、FLD-006、FLD-007、FLD-008、FLD-009、FLD-010、FLD-011、FLD-012、FLD-013、FLD-014、FLD-015（外呼任务字段）；FLD-020、FLD-021、FLD-022、FLD-023、FLD-024、FLD-025、FLD-026、FLD-027、FLD-028、FLD-029、FLD-030、FLD-031、FLD-032、FLD-033、FLD-034、FLD-035、FLD-036（通话记录字段）；FLD-040、FLD-041、FLD-042、FLD-043、FLD-044、FLD-045（统计报表字段）；FLD-050、FLD-051、FLD-052、FLD-053、FLD-054、FLD-055（租户管理字段）；FLD-060、FLD-061、FLD-062、FLD-063（标签管理字段）；FLD-070、FLD-071、FLD-072、FLD-073、FLD-074、FLD-075（黑名单字段）。

## 可用 data-anno 锚点清单

> 标注生成器只能使用本清单里的 selector，不能猜测或新造 target。以下清单逐字来自当前源码锚点。

- page: home | data-anno: home-usage-cards | selector: [data-anno="home-usage-cards"] | label: 用量余额 | kind: region | fieldRefs: none | file: js/pages/home.js
- page: scene-list | data-anno: scene-list-grid | selector: [data-anno="scene-list-grid"] | label: 外呼任务列表 | kind: region | fieldRefs: FLD-001,FLD-003,FLD-004,FLD-006 | file: js/pages/scene-list.js
- page: scene-list | data-anno: scene-list-dazhong-readonly | selector: [data-anno="scene-list-dazhong-readonly"] | label: 大众通信任务详情（只读） | kind: region | fieldRefs: FLD-014,FLD-015 | file: js/pages/scene-list.js
- page: scene-list | data-anno: houpu-task-detail | selector: [data-anno="houpu-task-detail"] | label: 厚朴任务详情（只读） | kind: region | fieldRefs: FLD-013,FLD-014 | file: js/pages/scene-list.js
- page: scene-list | data-anno: houpu-token-expired | selector: [data-anno="houpu-token-expired"] | label: 模拟令牌失效按钮 | kind: action | fieldRefs: none | file: js/pages/scene-list.js
- page: scene-block | data-anno: block-table | selector: [data-anno="block-table"] | label: 黑名单号码列表 | kind: table | fieldRefs: FLD-070,FLD-071,FLD-075 | file: js/pages/scene-block.js
- page: report-call | data-anno: report-call-table | selector: [data-anno="report-call-table"] | label: 通话统计列表 | kind: table | fieldRefs: FLD-040,FLD-041,FLD-043,FLD-045 | file: js/pages/report-call.js
- page: report-billing | data-anno: report-billing-table | selector: [data-anno="report-billing-table"] | label: 计费统计列表 | kind: table | fieldRefs: FLD-055 | file: js/pages/report-billing.js
- page: report-clue | data-anno: report-clue-table | selector: [data-anno="report-clue-table"] | label: 线索统计列表 | kind: table | fieldRefs: FLD-040 | file: js/pages/report-clue.js
- page: result-records | data-anno: result-records-table | selector: [data-anno="result-records-table"] | label: 通话记录列表 | kind: table | fieldRefs: FLD-020,FLD-025,FLD-027 | file: js/pages/result-records.js
- page: result-clue | data-anno: result-clue-table | selector: [data-anno="result-clue-table"] | label: 线索记录列表 | kind: table | fieldRefs: FLD-020 | file: js/pages/result-clue.js
- page: sys-scene | data-anno: sys-scene-add-btn | selector: [data-anno="sys-scene-add-btn"] | label: 新建业务场景 | kind: action | fieldRefs: none | file: js/pages/sys-scene.js
- page: sys-scene | data-anno: sys-scene-table | selector: [data-anno="sys-scene-table"] | label: 业务场景列表 | kind: table | fieldRefs: FLD-006 | file: js/pages/sys-scene.js
- page: sys-tags | data-anno: sys-tags-table | selector: [data-anno="sys-tags-table"] | label: 中台标签列表 | kind: table | fieldRefs: FLD-060,FLD-062 | file: js/pages/sys-tags.js
- page: sys-tenant | data-anno: sys-tenant-table | selector: [data-anno="sys-tenant-table"] | label: 租户列表 | kind: table | fieldRefs: FLD-050,FLD-055 | file: js/pages/sys-tenant.js

## 手动标注提示词

请基于已通过全局验证的静态原型，生成面向产品经理评审的页面标注。标注必须覆盖本轮核心页面、验收项、资料来源和字段事实。

输入边界：

- 只基于本提示词列出的本轮页面、验收项、SRC-* 来源、FLD-* 字段和 `## 可用 data-anno 锚点清单` 生成标注。
- 不复用、续写或补全任何历史标注，不沿用旧项目的标注 ID、页面说明、来源引用或字段引用。
- 标注对象只从本轮 `acceptance-map.md` 和 `field-map.md` 明确涉及的列表页、详情页、操作按钮、弹窗、表单输入项、状态标签、数据图表、筛选与页签中选择；不得扩展到范围外页面，也不得对无业务含义的普通文本或装饰元素生成标注。
- 如果输入资料不足，输出缺口说明，不生成"待确认"占位标注。

## 标注生成要求

请基于已通过全局验证的静态原型，生成面向产品经理评审的页面标注。标注必须覆盖本轮核心页面、验收项、资料来源和字段事实。

输入边界：

- 只基于本提示词列出的本轮页面、验收项、SRC-* 来源、FLD-* 字段和 `## 可用 data-anno 锚点清单` 生成标注。
- 不复用、续写或补全任何历史标注，不沿用旧项目的标注 ID、页面说明、来源引用或字段引用。
- 标注对象只从本轮 `acceptance-map.md` 和 `field-map.md` 明确涉及的列表页、详情页、操作按钮、弹窗、表单输入项、状态标签、数据图表、筛选与页签中选择；不得扩展到范围外页面，也不得对无业务含义的普通文本或装饰元素生成标注。
- 如果输入资料不足，输出缺口说明，不生成"待确认"占位标注。

标注 ID 规则：

- 所有标注按当前文件全局顺序编号：第一条 `id: "1"`，第二条 `id: "2"`，直到 `id: "N"`；跨页面继续递增。
- `id` 必须是连续的十进制数字字符串，不能使用 `001`、`anno-1`、`page-001` 或 slug。

锚点与字段一致性规则：

- 每条标注的 `target` 必须逐字匹配 `## 可用 data-anno 锚点清单` 中的 selector。
- 每条标注的 `sections.functionName` 必须与锚点清单中对应的 `label` 一致。
- 每条标注的 `fieldRefs` 必须与锚点清单中对应的 `fieldRefs` 一致；`fieldRefs` 为 `none` 时不得伪造字段引用。
- 每条标注应包含 `sourceRefs`，引用 `memory/source-materials.md` 中真实存在的 SRC-* 编号。

每条标注按以下 10 个维度生成对应内容；维度不适用于当前对象时写明原因，不得为填满字段而编造规则：

1. 功能名称 (functionName)：显示功能的具体名称，与锚点 label 一致，不可含糊。
2. 功能说明 (functionDesc)：主要说明功能的使用场景和目的。
3. 权限范围 (permissionScope)：说明哪些角色有权使用此功能或查看此数据（如：仅管理员，或全部用户可见）。
4. 数据来源 (dataSource)：说明数据来源于哪个系统或接口。如果依赖数据流入，必须写清楚具体的数据来源系统名称。
5. 取值逻辑 (valueLogic)：如果涉及数据取值，说明输入数据到输出数据的完整流向及计算转换逻辑。
6. 字段说明 (fieldDesc)：每个字段单独一行，固定使用 `FLD-* 字段名｜定义：...｜逻辑：...｜格式：...｜异常：...`；不能只罗列字段名或把多个字段挤在同一行。
7. 交互说明 (interactionDesc)：描述用户操作此元素时的触发动作及对应的页面响应反馈与页面流转。
8. 判断规则 (judgeRule)：规定满足什么业务前提条件才能执行该操作，或相关的状态分支判断规则。
9. 异常规则 (exceptionRule)：描述在数据为空、断网、接口失败、格式校验错误等异常情况下的系统处理逻辑。
10. 其他说明 (otherDesc)：其他需要特别提示 PM、开发或测试关注的已知限制、决策点或技术细节。

覆盖要求：

- 本轮 11 个核心页面（home、scene-list、scene-block、report-call、report-billing、report-clue、result-records、result-clue、sys-scene、sys-tags、sys-tenant）每页至少一条标注。
- 本轮验收映射中标记为通过（pass）的核心验收点必须能追溯到标注或交互说明。
- 不把 `tools/prototype-loop-orchestrator/`、`docs/`、`flowcharts/` 纳入标注范围。

## 回写说明

- 本提示词只用于生成标注，第一版不强制自动写入 `annotations/annotations.js`。
- 如果 PM 手动生成并要求回写，由 Agent 将结果合并到 `annotations/annotations.js`，`target` 逐字匹配本清单 selector。
- 回写后 `annotations/annotations.js` 必须以 `window.AnnotationData = { ... }` 形式承载标注，`id` 从 "1" 开始连续编号。
- 回写完成后同步更新 `memory/annotation-coverage.md` 的覆盖清单与缺口说明。
