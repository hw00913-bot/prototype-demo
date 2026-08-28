# 项目变更记录

## 2026-08-28（厚朴开发评审规则补齐）

- 确认厚朴继续按平台已有 `task_id` 关联，不调用任务创建接口；770–790 继续使用已确认的中台本地映射。
- 新增模拟的服务端默认厚朴账号与独立任务查询 Mock，凭据和令牌仍不进入浏览器。
- 新增同一 `task_id` 只能关联一个业务场景的查询与保存双重校验，编辑当前场景时保留原关联。
- 外呼任务列表加载、厚朴任务详情打开、场景编辑页打开和主动查询时，均重新读取任务状态；页面展示原始状态、中台映射状态和读取时间。
- 唯一说明文档升级为 v2.5，明确完整厚朴通话状态表属于项目确认的中台本地业务映射。本轮不交接知识库，不提交 GitHub。

## 2026-08-27（厚朴改为按已有任务 ID 关联）

- 业务场景的厚朴专属配置移除任务创建参数，改为输入平台已有 `task_id` 后“查询并关联”。
- 查询成功后只读反显任务名称、机器人、任务类型、执行时段、并发、重呼、未呼优先、号码模板及服务端回调配置状态；任务 ID 改动后需重新查询。
- 保存场景仅保存任务关联快照；任务不存在、未查询或任务 ID 与查询结果不一致时阻止保存。
- 厚朴任务详情补充“按已有任务 ID 关联（中台不创建任务）”，并同步唯一说明文档、业务规则、字段映射与来源记录。
- 标注 ID 5/43 同步引用最新关联出处；窄屏下任务 ID 与查询按钮改为上下布局，只读任务资料适配两列流式展示。

## 2026-08-24（手动导入显示前置条件）

- 在功能说明文档“呼叫名单与手动导入”章节明确：仅当外呼任务关联业务场景的“数据导入方式”为“手动导入”时显示入口。
- 业务场景配置为“自动传入”或“接口传入”时隐藏入口；未读取到场景配置时按不显示处理。
- 本次仅更新产品说明及其生成 HTML，不修改现有原型业务代码。

## 2026-08-24（权限说明单一出处）

- 将三角色权限表从功能章节收敛到 `docs/功能说明文档.md` 的“五. 其他说明 → 6. 统一角色权限说明”，作为权限口径的唯一维护出处。
- 账号、租户、业务场景、标签及多租户隔离等功能章节改为引用统一权限章节，不再重复角色权限全文。
- `memory/business-rules.md`、标注提示词和覆盖说明改为只引用统一权限章节；55 条正式标注的 `permissionScope` 同步改为固定出处说明。
- 标注缓存版本提升至 `dataVersion=6`、资源版本 `v=8`，避免浏览器继续展示历史权限文案。

## 2026-08-21（移除 interaction 兼容文件）

- 按用户明确要求删除 `docs/interaction.html`，不再为 Loop 兼容额外生成或维护第二份 HTML。
- `tools/render_doc_html.py` 现在只从唯一 Markdown 生成 `docs/功能说明文档.html`；`--check` 也只校验这一组源与产物。
- 首页顶栏、交付导航、计算逻辑返回入口和 `config/workflow.json` 全部直接指向完整版 HTML。
- 项目级 `tools/loop_preflight.py` 与 `tools/loop_run.py` 已改为以完整版 HTML 执行文档结构、交付导航和最终门禁校验。
- `config/workflow.json` 增加单一文档模式声明：一个 Markdown 源、一个 HTML 产物、无兼容别名。

## 2026-08-21（完整版说明文档唯一事实源）

- 按用户明确决策，将 `docs/功能说明文档.md` 固定为说明内容的唯一事实源。
- 重构 `tools/render_doc_html.py`：一次读取 Markdown，同时生成完整版 `docs/功能说明文档.html` 和 Loop 兼容入口 `docs/interaction.html`。
- 新增 `python3 tools/render_doc_html.py --check` 同步门禁；任一生成文件与 Markdown 不一致时返回失败。
- `docs/interaction.html` 不再维护独立业务内容，只保留自动生成的 S9 固定外壳并立即跳转完整版。
- 删除依赖本机 Playwright 绝对路径的 `tools/test_delivery_docs.js`，其同步职责由生成脚本内置检查取代。

## 2026-08-21（说明文档入口统一）

- 首页顶栏直接打开完整版 `docs/功能说明文档.html`；交付导航保留 Loop 固定内部路径 `docs/interaction.html`，该路径会立即跳转至完整版。
- 三类交付视图现在实际展示同一份完整版说明文档；`docs/interaction.html` 仅作为 Loop/S9 兼容入口与内部交互产物保留。

## 2026-08-21（完善版说明文档误删恢复）

- 纠正清理范围判断：`docs/功能说明文档.html` 与对应 Markdown 是内容更完整的产品说明，不属于可删除冗余。
- 从清理前提交完整恢复 `docs/功能说明文档.html`、`docs/功能说明文档.md`、`tools/render_doc_html.py` 和 `tools/test_delivery_docs.js`。
- 首页“功能说明文档”入口恢复指向完善版 HTML；`docs/interaction.html` 继续保留为 Loop/S9 交互说明，不再视为前者的完整替代品。
- 恢复操作未回滚页面修复、55 条标注、六平台数据覆盖和其他已确认的缓存/一次性脚本清理。

## 2026-08-21（项目冗余内容清理）

- 清除 `.playwright-cli/` 浏览器截图/快照缓存与 Python `__pycache__` 编译缓存。
- 删除无运行入口且与 `index.html` 内置登录层重复的独立 `login.html`。
- 曾误将 `docs/功能说明文档.md` 判定为可由 `docs/interaction.html` 取代；现已恢复完善版 Markdown/HTML 及其维护链路，线上演示地址同时保留在 `config/project.json`。
- 删除 13 个依赖本机绝对路径、固定端口或旧参考项目的一次性浏览器对比/验证脚本；历史验证结论仍保留在 `memory/verification-log.md`。
- 删除非空目录中的无意义 `.gitkeep`，并修正 `memory/project-structure.md` 中已经过期的页面数量和账号管理说明。
- `CLAUDE.md` 属于已冻结的 PM 审批基线，未修改；其中过期的运行提示为保证审批哈希与最终门禁有效而保留。
- 为计算逻辑页补充空 favicon 声明，消除浏览器自动请求 `/favicon.ico` 产生的无意义 404。
- 保留 Loop 总控工具包、项目记忆、流程图空配置、全局样式基线及交付说明；这些内容均有门禁、配置或交付用途。

## 2026-08-21（功能与交互说明文档收敛）

- 确认 `docs/interaction.html` 是 Loop/S9、交付导航和最终门禁共同指定的正式说明文档。
- 首页“功能说明文档”入口统一指向 `docs/interaction.html`，与交付导航保持一致。
- 移除并行维护的旧版 `docs/功能说明文档.html`，以及会从旧 Markdown 重建并覆盖说明页的过期生成、验证脚本。
- 旧版 Markdown 保留为历史资料，不再作为页面入口或 HTML 生成源；其中已有改动未被覆盖。
- 未把旧文档中缺乏当前原型、验收映射或资料来源支撑的登录、权限、生产接口描述并入正式说明。

## 2026-08-21（S9 标注内容重生成）

### 锚点颗粒度

- 将 11 个核心页面的源码业务锚点从 15 个扩展为 55 个，按筛选/页签、核心数据区、关键动作、详情或配置层拆分。
- 业务场景新增通用表单、平台选择器以及一知、中科金、电声、冰兰、厚朴、大众通信 6 个独立平台配置锚点。
- 补齐通话/计费/线索报表的筛选、口径、汇总、明细、回流锚点，以及标签映射、租户计费与余额管理锚点。

### S9 产物

- 重写 `memory/annotation-prompt.md`：包含 55 条源码一致锚点、逐页编写蓝图、10 维内容要求和质量门禁。
- 重写 `memory/annotation-coverage.md`：逐锚点记录页面、需求、来源、字段和覆盖目的。
- 重写 `docs/interaction.html`：保留固定五章结构，限定为当前 11 个核心页面与可追溯规则。
- 先将历史 `annotations/annotations.js` 重置为空对象；随后根据用户明确要求生成并回写 55 条全新标注，未复用历史内容。

### 验证

- 55 个源码锚点全局唯一，提示词清单 55 条且与源码逐项对应。
- `python3 tools/loop_run.py check . --preflight-stage s9` 与 `--preflight-stage final` 均 PASS。
- 浏览器验证 11 个页面和业务场景动态抽屉；交互文档五章、15 张表正常渲染；控制台 0 错误，网络 0 个 4xx/5xx。

## 2026-08-21（六平台线索与统计覆盖修复）

### 数据层 `mock/data.js`

- 线索记录从一知/冰兰扩展到六平台 12 条数据；补充中科金、电声、厚朴、大众通信记录。
- 大众通信保留 A-高意向、E-需再次跟进、F-号码无效和未评级等平台口径；电声补充两次回访记录。
- 通话统计补齐 `platformName` 并新增 2 条大众通信统计，合计 16 条、六平台覆盖。
- 计费统计扩展为 8 条，增加平台、计费类型以及六平台的日明细和通话计费明细。

### 页面层

- `js/pages/result-clue.js`：场景、状态、意向筛选改为从六平台数据动态生成；列表新增智能平台列；筛选后的详情索引修正；客户标签和回访详情按平台数据展示。
- `js/pages/report-call.js`：列表新增智能平台列，平台筛选改为严格匹配，外呼统计和客户统计均展示平台。
- `js/pages/report-billing.js`：列表新增智能平台、计费类型列和平台筛选；详情弹窗展示平台。

### 挂起项

- 通道管理占位、线索记录移动端横向溢出按用户要求保持不动，已记录到 `memory/open-items.md`。

### 验证

- 4 个修改脚本 `node --check` 全部通过。
- 浏览器验证：线索记录 12 条/六平台，电声 2 次回访，大众通信标签含 A 级与任务 UUID；通话统计 16 条/六平台，大众通信筛选 2 条；计费统计 8 条/六平台，大众通信筛选 3 条且详情含平台。
- 控制台 0 错误，网络 0 个 404。

## 2026-08-20（第三轮：业务场景创建抽屉对齐六平台参考源）

### 数据层 `mock/data.js`

- 新增抽屉 Mock 15 组：`MockSceneRows`(12 行业务场景列表)、`MockTenantOptions`、`MockSceneTypeOptions`、`MockImportTypeOptions`/`MockBinglanImportTypeOptions`、`MockDefaultInputFields`(一知 7 默认字段)、`MockYizhiAccounts`、`MockBinglanLines`/`MockBinglanRobots`/`MockBinglanInputDefaults`、`MockHoupuSceneFields`、`MockDianshengRobotMappings`(场景类型→机器人)、`MockDianshengAccounts`、`MockDianshengIntervals`、`MockSceneBlacklistGroups`。

### 页面层 `js/pages/sys-scene.js`（1243 行重写）

- 创建/编辑抽屉对齐六平台参考源：公共区（名称/编码计数、描述、租户多选、平台六选一、场景类型按平台禁用、数据导入方式默认版）。
- 一知：场景id+提示条+模型类型→一知账号（计费提示），默认 7 传入字段。
- 中科金：任务id+提示条+模型类型→默认账号，默认「姓名」字段。
- 电声：匹配机器人（类型自动映射）、呼叫时段多行、排除日期（tooltip）、N天M呼（间隔分钟多选）、黑名单拦截、自动启动（关→执行时间）、模型类型/账号按模型过滤、提交按钮「确定并生成任务」。
- 冰兰：导入方式（手动/接口）、呼叫通道双形态（联友VCP→机器人输入+优先级+策略区；冰兰通道→线路+机器人下拉）、周呼叫日+多时段（增删重编号）、自动重拨表格、黑名单/规则拦截；传入字段 4 列表头且可编辑/删除（确认弹窗）。
- 厚朴：任务名称预填+数据列模式（单条/多条切换字段表）+提示条。
- 大众：任务ID(uuid)+提示条+模型类型→默认账号。
- 业务信息双 Tab+添加字段弹窗（对齐中科金参考源）；提交分平台必填校验，成功写回列表行。

### 样式层 `assets/css/app.css`

- 追加冰兰扩展（biz-section-title/biz-radio.disabled/biz-time-slot-row/biz-redial-table 等，源自冰兰接入_v1.0）与电声扩展（ds-call-strategy/ds-multi-select/ds-redial-table/ds-switch 等，源自电声接入_demo_v1.0）。

### 验证

- node --check（sys-scene.js/data.js）全过。
- playwright 浏览器验证：六平台面板显隐联动、一知默认 7 字段+账号 5 项、电声机器人映射（冷线索→robot_ds_nissan_002）+场景类型禁用（首访/服务/回访）、冰兰通道切换（5→4 列表头、7 可编辑行）、厚朴单条/多条字段切换（1/7 行）、空表单提交拦截、完整建行（12→13 行）、字段编辑/删除确认弹窗——全部通过。
- 控制台 0 错误、网络无 404；`python3 tools/loop_run.py check . --preflight-stage final` PASS。

## 2026-08-19

- 创建项目基础框架。

### step-01：整合 Mock 数据

- 复核 `mock/data.js` 覆盖六个接入平台（一知科技、中科金智能、电声、冰兰、厚朴、大众通信）。
- 数据对象完整：`MockSceneList`(25)、`MockCallRecordRows`(29)、`MockCallStatsRows`(14)、`MockTenantRows`(5)、`MockLocalTagSets`(4)、`MockBlockGroups`(3)、`MockSceneRows`(12)。
- 字段命名一致，枚举值对齐 `memory/business-rules.md`。

### step-02：验证外呼列表页面

- 验证 `js/pages/scene-list.js` 外呼列表卡片网格、筛选（场景名称/状态/平台）、详情抽屉三 Tab（数据概览/呼叫名单/任务详情）与大众通信任务详情渲染。
- 确认六平台任务卡片与状态标签（进行中/用户暂停/已终止/未开始）显示正确。

### step-03：验证外呼拦截页面

- 验证 `js/pages/scene-block.js` 黑名单分组列表、号码表格、平台同步状态、号码详情弹窗、平台同步设置弹窗。

### step-04：验证通话统计页面

- 验证 `js/pages/report-call.js` 通话统计表格（拨打总次数/接通总数/未接通/接通率/触达率/累计通话时长）与筛选（呼叫时间/场景名称/智能平台）。

### step-05：验证计费统计页面

- 验证 `js/pages/report-billing.js` 租户计费统计表格（计费日期/租户名称/计费时长）与详情弹窗。

### step-06：验证线索统计页面

- 验证 `js/pages/report-clue.js` NEV/ICE 线索统计、回流统计与「查看」详情弹窗。

### step-07：验证通话记录页面

- 验证 `js/pages/result-records.js` 通话记录表格（用户号码/通话状态/智能平台/意向标签等）与详情弹窗。

### step-08：验证线索记录页面

- 验证 `js/pages/result-clue.js` 线索记录表格（回访次数/最后通话状态/意向级别/客户详细标签/场景名称）。

### step-09：验证业务场景页面

- 验证 `js/pages/sys-scene.js` 业务场景列表、筛选（场景名称/场景分类/所属平台）与「新建业务场景」入口。

### step-10：验证标签管理页面

- 验证 `js/pages/sys-tags.js` 供应商管理配置树、中台标签集（新增/编辑/删除/排序/启用状态）与供应商标签池映射。

### step-11：验证租户管理页面

- 验证 `js/pages/sys-tenant.js` 租户表格（有效期/话费余额/冻结金额/可用余额/呼叫控制/租户类型/状态）与分页。

### step-12：验证导航功能

- 验证 `js/nav.js` 左侧菜单展开/收起、子菜单选择、页面切换、面包屑与当前页高亮。

### step-13：验证首页展示

- 验证 `js/pages/home.js` 用量余额卡片（大/小模型可用分钟数/有效期/呼叫控制状态）与平台概览统计卡片。

### S8 全局验证修正

- 为 `docs/interaction.html` 补充 `link rel="icon" href="data:,"`，消除 favicon.ico 404，与 flowcharts/index.html 保持一致。

### S9 前置：核心页面补 data-anno 锚点（S7 回流）

- 为 11 个核心页面补齐 12 个 `data-anno` 锚点（含 data-anno-page/label/kind/fields），供 S9 标注清单引用：`scene-list-grid`、`block-table`、`report-call-table`、`report-billing-table`、`report-clue-table`、`result-records-table`、`result-clue-table`、`sys-scene-add-btn`、`sys-scene-table`、`sys-tags-table`、`sys-tenant-table`、`home-overview`。
- 将 `annotations/annotations.js` 重置为手动回写占位 `window.AnnotationData = {};`，清除上一轮 DeepSeek 历史标注（其引用锚点与当前源码不一致）。

### 逐页对照参考源修复（HANDOFF 待办 1/2/3）

**数据层 `mock/data.js`：**

- 大众任务条目补 `task_type: 7`（id 17/18/19）；`MockDazhongTaskEditDetail` 三条 `new_task_extra` 补 `destination_extension_list` 时段。
- `DazhongSceneCodeByScene` 恢复参考版编码（`AI-DZ-HD-COLD`/`AI-DZ-NJ-SERVICE`/`AI-DZ-SZ-NEW`）。
- 大众通话记录 13 条 status 从中文恢复为数字枚举（0-12），首条补 `recordingUrl`；添加 forEach 兜底补 `callid`/`submitTime`/`callbackReceivedAt`/`taskUuid`/`sceneCode`。
- 新增 `MockDazhongCallDetailByRecordId`（3 条大众详情：recordid/detailFetchedAt/duration/billDuration/recordingDuration/componet/records/bailianSummary/bailianTagName）及二级 forEach 兜底。
- `MockBillingCallDetail` 从 3+3 条恢复为 5+6 条完整通话计费明细。
- 新增 `MockAssignedData`（按场景 id 17/18 索引的已分配名单）和 `MockImportHistory`（导入历史）。

**页面层：**

- `js/pages/result-records.js`（12 项）：恢复参考版 `DazhongStatusLabels`（数字枚举 1 呼叫成功/2 运营商拦截/4 无应答/8 占线/9 呼入限制/11 黑名单/12 用户屏蔽）；resolveStatus 仅对大众数字枚举映射；回调落库规则（大众必须 callid 存在才展示）；大众详情链路按 callid 取 `MockDazhongCallDetailByRecordId`；详细信息面板大众 13 字段/非大众中科金式 7 字段；新增「关联任务 ID」列 + 排序；筛选补关联任务 ID 与 29 项状态枚举；对话文本大众动态生成；录音播放器按 recordingDuration 实现；补 escapeHtml/cleanTranscriptText。
- `js/pages/scene-list.js`（10 项）：DazhongStatusLabels 对齐；redial_conditions 数组/对象两形态归一化（id 19 字符串枚举正确显示中文）；任务详情补起止时间/弹性坐席/重呼总开关；呼叫时段按 work_hour 自身 wday 渲染；outboundCircleType 分支恢复；意向洞察大众数值改参考版；已分配子 Tab 动态取数；通话记录弹窗二级详情；手动导入完整实现（validatePhone/parseCSVText/downloadTemplate/exportImportResult）；补 window.Pages 注册。
- `js/pages/report-billing.js`：分页组件恢复（renderPagination + billingPagination + updateTable 同步）；详情弹窗设置按钮补回；计费规则备注去掉大众 SaaS 后缀；aria-label 补齐；移除错误的 data-anno-fields="FLD-055" 引用。
- `js/pages/sys-tenant.js`（P0 口径统一）：getTenantBillingSummary 重写为参考版算法（仅已激活充值单 − adjustmentOutAmount − consumedAmount + Math.max 下限）；实现 syncFrozenTaskReleases 同款函数；currentBizDate 返回真实今天；packageDays 半年 183 天；pendingRow 检测 bug（rechargeStatus→status）；isFrozenExpired 补 NaN 保护；抽屉改用 formatMinuteRange。渝兴 balance=¥3,880.00、燃油车=¥1,000,001,719.00，与 home.js 完全一致。
- `docs/计算逻辑.html`：从充值方案 demo 拷贝（554 行），跳转按钮加 `data-delivery-switch="prototype"`，尾部加载 `../js/delivery-nav.js`。
- `index.html`：顶栏 right-area 新增「📐 计算逻辑」入口（新窗口打开 docs/计算逻辑.html）；四个改动页面脚本版本号 v=1→v=2 防缓存。

**验证：**

- `node --check` 18 个 JS 文件全部通过。
- 浏览器验证（playwright-cli @ http://127.0.0.1:8080）：通话记录大众状态正确映射（呼叫成功/拒接/占线/等待呼叫/运营商拦截）、详情弹层 13 字段完整（会话 id 2059190973162029091/场景编码 AI-DZ-HD-COLD/通话标签）；外呼列表 id 19 重呼条件显示「外呼失败、暂不方便、稍后重呼、无法接通」；租户管理渝兴 ¥3880.00/燃油车 ¥1000001719.00 与 home 分钟数换算一致；计费统计分页组件与详情弹窗设置按钮恢复；计算逻辑入口 200 可达；控制台 0 错误、无 404。
- `python3 tools/loop_run.py check . --preflight-stage final` PASS。

## 2026-08-21（外呼拦截对接范围校正）

- 将完整版功能说明文档中“外呼拦截”的对接系统范围从“电声、冰兰、一知、科大讯飞”收敛为当前原型实际实现的“电声”，并将项目范围、逻辑流程、数据来源、前端同步设置、移除规则与状态枚举统一为电声口径。
- 以 `docs/功能说明文档.md` 为唯一事实源重新生成 `docs/功能说明文档.html`，不增加兼容入口或额外维护文件。
- 同步更新 `memory/annotation-prompt.md`、`memory/annotation-coverage.md` 和标注 10/11，明确外呼拦截仅使用 SRC-003 电声来源，不再使用“多平台/各平台同步”泛化描述。
- 提升标注数据版本与静态资源版本，避免浏览器本地缓存覆盖新标注。

### 第四轮：外呼列表详情抽屉对齐六平台参考源（2026-08-20）

**数据层 `mock/data.js`：**

- 新增/补全六平台任务详情 Mock：`MockZkjTaskDetail`（4 条，taskCode/robotId/outbound*/recall*/aiSeats* 全字段）、`MockDazhongTaskEditDetail`（3 条，2.0 编辑接口字段 + new_task_extra）、`MockYizhiTaskDetail`（一知场景id/账号/模型类型）、`MockDianshengTaskDetail`（callTimeWindow/nDayMCallPolicy/blacklistCheck/autoStart/leadTypeRobotMapping）、`MockBinglanTaskDetail`（风控策略/重拨条件组）。
- `MockSceneList` 电声条目补 strategyCode/robotName/batchCount，大众条目补 uuid/line/maximumcall/billingType，厚朴条目补 taskName/requestId/createdAt/connected/columnType。

**页面层 `js/pages/scene-list.js`：**

- 详情抽屉三 Tab（数据概览/呼叫名单/任务详情）重构，任务详情按平台分发到 renderZkj/Yizhi/Dazhong/Diansheng/Houpu/Binglan 六个渲染函数，字段与文案对齐各参考源。
- 中科金：重呼模式分支（1=策略组 JSON 解析、2=状态+次数+间隔）、RecallStatusLabels 13 状态码中文映射、启动方式（手动/定时）、周循环+多时段。
- 大众：redial_conditions 数组/对象两形态归一化、da_status 数字+字符串枚举中文映射、拨打时间段（周几汇总+逐条 wday+起止日期弱化色）、AI坐席数（limit/maximumcall/弹性）。
- 电声：呼叫时段（时段N+排除日期+超出时段策略）、N天M呼（最大天数/次数/逐次间隔分钟）、黑名单/自动启动配置、机器人名称静态映射兜底。
- 一知：一知科技场景id/模型类型/一知账号三字段补齐。
- 冰兰：风控策略（自定义+黑名单）、多条件组重拨。
- 厚朴：批次追踪 requestId、数据列模式、接口约束、口径说明、模拟令牌失效按钮。
- 意向洞察环形图按平台差异化（大众 6 级/电声 4 级专属配色/一知 8 级含 H、J）；头部启/停按钮分平台显隐（中科金/大众/电声无，冰兰=终止任务）。

**样式层 `assets/css/app.css`：**

- 追加大众/电声/一知扩展样式：.task-detail-muted、.intent-donut-ring.diansheng（conic-gradient 4 段）、.intent-donut-label.label-g/label-h（一知 8 标签布局）。

**标注层：**

- `js/pages/scene-list.js`：houpu-task-detail/houpu-token-expired 锚点补全 data-anno-page/label/kind/fields；dazhong-readonly 移除不存在的 FLD-016。
- `memory/annotation-prompt.md`：补 3 条 scene-list 锚点清单行（12→15 个）。

**验证：**

- `node --check` scene-list.js/data.js 全过。
- 新增 `tools/verify_detail_drawer.js`（playwright）：六平台（id 13/1/17/20/22/24）任务详情 Tab 关键字段断言全过、控制台 0 错误、无 404。
- `python3 tools/loop_run.py check . --preflight-stage final` PASS。
- HANDOFF.md 增补第四轮修复记录，一句话总结同步更新。

### 第六轮：数据概览残余差异收口（2026-08-20）

用户复查反馈数据概览仍与参照物对不上，逐平台对照 releases_demo 六个接入原型源码与 CSS 后收口：

**数据层 `mock/data.js`：**

- `MockYizhiTaskStats` 任务 4 avgDuration 60秒→72秒（对齐一知参考源 NEV培育场景 stats）、任务 6 55秒→65秒（对齐参考源按 sceneName 取 stats[0] 口径）。

**页面层 `js/pages/scene-list.js`：**

- `renderInsightBlock` 一知画像时给 `.intent-donut-chart` 追加 `yizhi` 修饰类（配合 CSS 覆盖 a~f 标签专属坐标/配色）。

**样式层 `assets/css/app.css`：**

- 新增 `.intent-donut-chart.yizhi .intent-donut-label.label-a~f` 六条覆盖规则（一知 8 级环形图标签坐标与中科金 6 级版不同）。

**验证层 `tools/verify_detail_drawer.js`：**

- 修复意向配置断言假通过：多选下拉默认收起导致 innerText 取不到选项，改为先展开等级1下拉再断言、读完收起再保存（避免弹层遮挡按钮）。
- 新增环形图分平台类名断言：一知 `intent-donut-chart yizhi`/`intent-donut-ring yizhi`、电声 `intent-donut-ring diansheng`。

**验证：**

- `node --check` 全过；六平台（id 13/1/17/20/22/24）overview/config/task/donutCls 断言全空、控制台 0 错误、无 404；临时脚本比对一知 8 标签 computed top/left/color 与参考源逐项一致；`loop_run.py check --preflight-stage final` PASS。

### 第七轮：线索统计对齐参考源（2026-08-20）

**数据层 `mock/data.js`：**

- 补全 `MockClueStatNEV`（5 条完整聚合统计记录，含 A~E 意向客户数、导入/外呼/接通/下发量、接通率、平均时长）。
- 补全 `MockClueStatICE`（5 条完整聚合统计记录）。
- 补全 `MockClueDetailNEV`（5 条完整明细记录，含线索编码、呼叫场景、脱敏手机号 138****8888、门店编码/名称、呼叫时间、通话状态彩色标签、中台/业务系统双维度意向级别彩色标签、下发门店）。
- 补全 `MockClueDetailICE`（5 条完整明细记录）。
- 补全 `MockClueReturn`（5 条完整线索回流记录，2015-10-06 ~ 2015-10-10，含线索传入/提交外呼/线索回流数）。
- 新增 `MockStoreHierarchy`（华东/华南/华北三级大区小区门店数据），支持级联与模糊搜索。

**页面层 `js/pages/report-clue.js`：**

- 重构为对齐 `releases_demo/线索报表_v1.0` 的三大主 Tab：【外呼线索统计】（#tab-manual）、【外呼线索明细】（#tab-ai）、【线索回流统计】（#tab-return）。
- 外呼线索统计与外呼线索明细均支持【总部 NEV 线索】与【总部 ICE 线索】二级子 Tab 切换。
- 外呼线索统计大表对齐 14 列表头，保留 `data-anno="report-clue-table"` 标注锚点。
- 外呼线索明细大表对齐 14 列表头，支持彩色状态标签与意向标签渲染。
- 筛选区完整实现：日期范围（过去 7 天默认初始化）、场景下拉、意向级别多选下拉（全部/A~E 互斥与多选文案回写）、业务类型下拉、门店模糊搜索。
- 线索回流统计对齐顶部业务说明提示栏、6 列表头及绿色高亮回流数。
- 完整实现异步导出模拟（2.5s loading 旋转图标 + 全局 Toast 提示）。
- 完整支持分页栏（共 5 条数据、页码切换、跳页输入）。

**样式层 `assets/css/app.css`：**

- 补充线索报表业务提示条样式 `.clue-tip-bar`、导出按钮 loading 动画 `.btn.loading .loading-icon`、宽表格横向滚动容器 `.report-clue-scroll`、`.report-clue-detail-scroll` 及多选下拉宽度适配。

**验证与测试：**

- `node --check` 全过（所有 JS 文件语法合规）。
- 新增 `tools/verify_report_clue.js`（playwright）：验证三大主 Tab、二级 NEV/ICE 子 Tab、14 列表头、数据行、意向多选下拉、回流统计 6 列表头、导出 loading 动画与 Toast 提示，控制台 0 错误、无 404 全过。
- `python3 tools/loop_run.py check . --preflight-stage final` PASS。

## 2026-08-21（三角色权限范围对齐）

- 明确三类角色：超级管理员拥有全部权限；租户管理员拥有本租户全部权限；租户运营仅可处理本租户外呼场景、统计报表、通话记录和线索记录，并可维护本人账号信息。
- 在唯一事实源 `docs/功能说明文档.md` 补充全局权限矩阵，并细化账号、租户、业务场景和标签管理的角色边界。
- 同步更新项目权限规则、标注提示词、标注覆盖说明和 55 条现有标注的 `permissionScope`；租户运营明确不可处理账号、租户、线路和标签等系统管理功能。
- 根据复核结论，将线索记录纳入租户运营可处理的本租户业务范围。
- 提升标注数据与静态资源版本，避免浏览器继续读取旧权限说明缓存。

## 2026-08-26（厚朴 OpenAPI v2 与统一状态映射）

- 通过 `coding-mcp-bridge` 在项目白名单内调用 TRAE 后端处理厚朴接入相关页面；仅合规、限定范围的产物回写当前项目，越界或不完整产物均被隔离丢弃。
- 外呼任务统一为中台 13 项状态，补齐大众通信、中科金、一知科技、冰兰、电声、厚朴六个平台的本地映射；未知原始值显示“未映射”，不回退“未启动”。
- 厚朴场景配置升级为 OpenAPI v2：任务创建后回填 `task_id`，机器人与号码模板由平台同步，支持流式/当日任务、执行时段、并发、重呼、未呼优先及模板动态字段；OAuth2、真实回调地址和来源校验仅在服务端维护。
- 厚朴手动导入改为 `outnum` 规则：Excel/CSV/TXT、首行表头、首列号码、建议单批不少于 200、单文件最多 150,000 个号码、每任务最多 50,000 批；展示平台返回的 `batch_id` 与有效号码数。
- 厚朴 770–790 共 21 个原始通话状态码映射至 DCC 25 项标准状态，同时保留原始状态码、原始描述、任务/批次/通话标识、意向和标签用于追溯。
- 通话记录列表与详情统一执行手机号中间四位脱敏；底层 Mock 值仅用于筛选和演示数据关联。
- 完整版说明文档升级至 v2.2，并同步业务规则、字段表、资料清单、交接说明、55 条标注及标注覆盖表；权限、状态与接口规则仅引用说明文档统一章节。
- 提升本轮页面脚本、Mock 数据和标注资源版本，避免交付环境继续命中旧缓存。

## 2026-08-26（恢复全平台通话状态统一映射）

- 修复厚朴接入改造时误将原“DCC 25 项 ↔ 外部平台状态”主表收窄为 DCC 清单加厚朴附表的问题。
- 依据当前知识库 `概念对齐/通话状态码.md` 恢复一知、科大、中科金、电声、大众通信映射，并将已确认的厚朴 770–790 归并结果加入同一主表。
- 冰兰 20 项 `missedCallReason` 作为平台补充事实保留；缺少权威映射的原因不擅自归并。
- 通话记录筛选恢复知识库定义的 25 项 DCC 状态，大众通信 0–12 原始码同步归并为中台状态；更新说明文档、业务规则、字段表、交接说明及标注引用。
