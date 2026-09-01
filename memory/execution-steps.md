# 执行步骤

> 本文件是 S6 阶段生成的执行步骤，S7 按此步骤实现。

## 步骤 01：整合Mock数据

### 需求来源
- 项目目的：整合多个接入方原型，展示智能外呼平台的完整能力
- 决策：DEC-003（基于源目录数据重新整理Mock数据）

### 目标
确保mock/data.js包含所有平台的完整数据，覆盖一知科技、中科金、电声、冰兰、厚朴、大众通信等平台。

### 文件
- mock/data.js

### 预期变更类型
- update

### 输入
- memory/project.md
- memory/business-rules.md
- memory/source-materials.md
- memory/field-map.md
- docs/decisions.md

### 工作
1. 检查当前mock/data.js的数据完整性
2. 对比源目录各原型的数据结构
3. 补充缺失的平台数据
4. 统一字段命名和格式
5. 确保所有枚举值正确

### 验收
- 所有6个平台的数据完整覆盖
- 字段命名一致，无重复定义
- 枚举值正确，状态显示正常

### 验证
- 浏览器打开页面，检查数据加载
- 检查控制台无错误
- 验证各平台数据展示正确

### 验证技能
- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`

### 标注影响
- affected-pages: scene-list, result-records, report-call, report-billing, report-clue
- annotation-required: no
- annotation-targets: None

### 依赖
- None

### 失败处理
- 如果数据缺失，需要从源目录补充
- 如果字段不一致，需要统一命名

## 步骤 02：验证外呼列表页面

### 需求来源
- 项目范围：外呼场景模块
- 核心流程：外呼任务管理

### 目标
验证外呼列表页面功能完整性，包括任务列表展示、筛选功能、详情查看。

### 文件
- js/pages/scene-list.js

### 预期变更类型
- verify-only

### 输入
- memory/project.md
- memory/field-map.md
- memory/business-rules.md

### 工作
1. 打开外呼列表页面
2. 验证任务列表数据展示
3. 测试筛选功能（按状态、平台、来源筛选）
4. 查看任务详情
5. 验证状态标签显示正确

### 验收
- 任务列表正确显示所有平台的任务
- 筛选功能正常工作
- 详情查看功能可用
- 状态标签（执行中、暂停中、已终止、未开始）显示正确

### 验证
- 浏览器打开外呼列表页面
- 检查DOM元素存在
- 测试交互功能
- 检查控制台无错误

### 验证技能
- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`

### 标注影响
- affected-pages: scene-list
- annotation-required: yes
- annotation-targets: 外呼列表 | 任务列表 | table | FLD-001, FLD-003, FLD-004, FLD-006

### 依赖
- 步骤 01（数据整合）

### 失败处理
- 如果数据不显示，检查mock/data.js
- 如果筛选不工作，检查js/common.js

## 步骤 03：验证外呼拦截页面

### 需求来源
- 项目范围：外呼场景模块
- 业务规则：黑名单管理

### 目标
验证外呼拦截（黑名单管理）功能，包括黑名单组、黑名单记录、平台同步状态。

### 文件
- js/pages/scene-block.js

### 预期变更类型
- verify-only

### 输入
- memory/project.md
- memory/field-map.md
- memory/business-rules.md

### 工作
1. 打开外呼拦截页面
2. 验证黑名单组列表
3. 查看黑名单记录详情
4. 验证平台同步状态显示

### 验收
- 黑名单组列表正确显示
- 黑名单记录详情完整
- 平台同步状态显示正确

### 验证
- 浏览器打开外呼拦截页面
- 检查DOM元素存在
- 检查控制台无错误

### 验证技能
- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`

### 标注影响
- affected-pages: scene-block
- annotation-required: yes
- annotation-targets: 外呼拦截 | 黑名单管理 | table | FLD-070, FLD-071, FLD-075

### 依赖
- 步骤 01（数据整合）

### 失败处理
- 如果数据不显示，检查mock/data.js

## 步骤 04：验证通话统计页面

### 需求来源
- 项目范围：统计分析模块
- 核心流程：统计分析

### 目标
验证通话统计数据展示，包括通话总量、接通率、通话时长等。

### 文件
- js/pages/report-call.js

### 预期变更类型
- verify-only

### 输入
- memory/project.md
- memory/field-map.md

### 工作
1. 打开通话统计页面
2. 验证统计数据展示
3. 测试筛选功能
4. 查看统计详情

### 验收
- 统计数据正确显示
- 筛选功能可用
- 详情查看功能正常

### 验证
- 浏览器打开通话统计页面
- 检查DOM元素存在
- 检查控制台无错误

### 验证技能
- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`

### 标注影响
- affected-pages: report-call
- annotation-required: yes
- annotation-targets: 通话统计 | 统计数据 | table | FLD-040, FLD-041, FLD-043, FLD-045

### 依赖
- 步骤 01（数据整合）

### 失败处理
- 如果数据不显示，检查mock/data.js

## 步骤 05：验证计费统计页面

### 需求来源
- 项目范围：统计分析模块
- 业务规则：计费管理

### 目标
验证计费统计数据展示，包括租户计费、通话费用、模型类型等。

### 文件
- js/pages/report-billing.js

### 预期变更类型
- verify-only

### 输入
- memory/project.md
- memory/field-map.md

### 工作
1. 打开计费统计页面
2. 验证计费数据展示
3. 测试详情查看功能
4. 验证计费明细展示

### 验收
- 计费数据正确显示
- 详情查看功能可用
- 计费明细展示完整

### 验证
- 浏览器打开计费统计页面
- 检查DOM元素存在
- 检查控制台无错误

### 验证技能
- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`

### 标注影响
- affected-pages: report-billing
- annotation-required: yes
- annotation-targets: 计费统计 | 计费数据 | table | FLD-055

### 依赖
- 步骤 01（数据整合）

### 失败处理
- 如果数据不显示，检查mock/data.js

## 步骤 06：验证线索统计页面

### 需求来源
- 项目范围：统计分析模块
- 业务规则：线索管理

### 目标
验证线索统计数据展示，包括NEV/ICE分类、线索详情等。

### 文件
- js/pages/report-clue.js

### 预期变更类型
- verify-only

### 输入
- memory/project.md
- memory/field-map.md

### 工作
1. 打开线索统计页面
2. 验证NEV/ICE分类展示
3. 测试筛选功能
4. 查看线索详情

### 验收
- 线索统计正确显示
- NEV/ICE分类展示正常
- 筛选功能可用

### 验证
- 浏览器打开线索统计页面
- 检查DOM元素存在
- 检查控制台无错误

### 验证技能
- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`

### 标注影响
- affected-pages: report-clue
- annotation-required: yes
- annotation-targets: 线索统计 | 线索数据 | table | FLD-040

### 依赖
- 步骤 01（数据整合）

### 失败处理
- 如果数据不显示，检查mock/data.js

## 步骤 07：验证通话记录页面

### 需求来源
- 项目范围：外呼结果模块
- 核心流程：通话记录查看

### 目标
验证通话记录查询功能，包括记录列表、筛选、详情查看。

### 文件
- js/pages/result-records.js

### 预期变更类型
- verify-only

### 输入
- memory/project.md
- memory/field-map.md

### 工作
1. 打开通话记录页面
2. 验证记录列表展示
3. 测试筛选功能
4. 查看记录详情

### 验收
- 通话记录正确显示
- 筛选功能可用
- 详情查看功能正常

### 验证
- 浏览器打开通话记录页面
- 检查DOM元素存在
- 检查控制台无错误

### 验证技能
- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`

### 标注影响
- affected-pages: result-records
- annotation-required: yes
- annotation-targets: 通话记录 | 记录列表 | table | FLD-020, FLD-025, FLD-027

### 依赖
- 步骤 01（数据整合）

### 失败处理
- 如果数据不显示，检查mock/data.js

## 步骤 08：验证线索记录页面

### 需求来源
- 项目范围：外呼结果模块
- 业务规则：线索管理

### 目标
验证线索记录查询功能，包括记录列表、筛选、详情查看。

### 文件
- js/pages/result-clue.js

### 预期变更类型
- verify-only

### 输入
- memory/project.md
- memory/field-map.md

### 工作
1. 打开线索记录页面
2. 验证记录列表展示
3. 测试筛选功能
4. 查看记录详情

### 验收
- 线索记录正确显示
- 筛选功能可用
- 详情查看功能正常

### 验证
- 浏览器打开线索记录页面
- 检查DOM元素存在
- 检查控制台无错误

### 验证技能
- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`

### 标注影响
- affected-pages: result-clue
- annotation-required: yes
- annotation-targets: 线索记录 | 记录列表 | table | FLD-020

### 依赖
- 步骤 01（数据整合）

### 失败处理
- 如果数据不显示，检查mock/data.js

## 步骤 09：验证业务场景页面

### 需求来源
- 项目范围：系统管理模块
- 业务规则：场景配置

### 目标
验证业务场景配置功能，包括场景列表、状态显示。

### 文件
- js/pages/sys-scene.js

### 预期变更类型
- verify-only

### 输入
- memory/project.md
- memory/field-map.md

### 工作
1. 打开业务场景页面
2. 验证场景列表展示
3. 验证状态显示

### 验收
- 场景列表正确显示
- 状态显示正常

### 验证
- 浏览器打开业务场景页面
- 检查DOM元素存在
- 检查控制台无错误

### 验证技能
- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`

### 标注影响
- affected-pages: sys-scene
- annotation-required: yes
- annotation-targets: 业务场景 | 场景列表 | table | FLD-006

### 依赖
- 步骤 01（数据整合）

### 失败处理
- 如果数据不显示，检查mock/data.js

## 步骤 10：验证标签管理页面

### 需求来源
- 项目范围：系统管理模块
- 业务规则：标签配置

### 目标
验证标签管理配置功能，包括标签列表、启用/禁用状态。

### 文件
- js/pages/sys-tags.js

### 预期变更类型
- verify-only

### 输入
- memory/project.md
- memory/field-map.md

### 工作
1. 打开标签管理页面
2. 验证标签列表展示
3. 验证启用/禁用状态显示

### 验收
- 标签列表正确显示
- 启用/禁用状态正常

### 验证
- 浏览器打开标签管理页面
- 检查DOM元素存在
- 检查控制台无错误

### 验证技能
- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`

### 标注影响
- affected-pages: sys-tags
- annotation-required: yes
- annotation-targets: 标签管理 | 标签列表 | table | FLD-060, FLD-062

### 依赖
- 步骤 01（数据整合）

### 失败处理
- 如果数据不显示，检查mock/data.js

## 步骤 11：验证租户管理页面

### 需求来源
- 项目范围：系统管理模块
- 业务规则：租户配置

### 目标
验证租户管理配置功能，包括租户列表、计费信息。

### 文件
- js/pages/sys-tenant.js

### 预期变更类型
- verify-only

### 输入
- memory/project.md
- memory/field-map.md

### 工作
1. 打开租户管理页面
2. 验证租户列表展示
3. 验证计费信息显示

### 验收
- 租户列表正确显示
- 计费信息完整

### 验证
- 浏览器打开租户管理页面
- 检查DOM元素存在
- 检查控制台无错误

### 验证技能
- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`

### 标注影响
- affected-pages: sys-tenant
- annotation-required: yes
- annotation-targets: 租户管理 | 租户列表 | table | FLD-050, FLD-055

### 依赖
- 步骤 01（数据整合）

### 失败处理
- 如果数据不显示，检查mock/data.js

## 步骤 12：验证导航功能

### 需求来源
- 项目范围：全局功能
- 核心流程：页面切换

### 目标
验证左侧导航菜单功能，包括展开/收起、页面切换。

### 文件
- js/nav.js
- index.html

### 预期变更类型
- verify-only

### 输入
- memory/project.md
- memory/project-structure.md

### 工作
1. 测试导航菜单展开/收起
2. 测试各页面切换
3. 验证当前页面高亮
4. 验证页面内容加载

### 验收
- 导航菜单正常工作
- 页面切换流畅
- 当前页面高亮正确
- 页面内容正确加载

### 验证
- 浏览器测试导航功能
- 检查DOM元素存在
- 检查控制台无错误

### 验证技能
- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`

### 标注影响
- affected-pages: None（全局功能）
- annotation-required: no
- annotation-targets: None

### 依赖
- None

### 失败处理
- 如果导航不工作，检查js/nav.js

## 步骤 13：验证首页展示

### 需求来源
- 项目范围：首页模块
- 核心流程：用户入口

### 目标
验证首页概览数据展示。

### 文件
- js/pages/home.js

### 预期变更类型
- verify-only

### 输入
- memory/project.md

### 工作
1. 打开首页
2. 验证概览数据展示
3. 验证快捷入口功能

### 验收
- 首页数据展示正确
- 快捷入口可用

### 验证
- 浏览器打开首页
- 检查DOM元素存在
- 检查控制台无错误

### 验证技能
- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`

### 标注影响
- affected-pages: home
- annotation-required: no
- annotation-targets: None

### 依赖
- None

### 失败处理
- 如果数据不显示，检查mock/data.js

## 步骤 14：厚朴改为按已有任务 ID 关联

### 需求来源
- SRC-011：2026-08-27 用户确认的厚朴任务关联方式变更
- 验收项：R-009 业务场景

### 目标
移除中台创建厚朴任务的交互，改为输入平台已有 `task_id`、查询校验并保存关联关系。

### 文件
- js/pages/sys-scene.js
- js/pages/scene-list.js
- assets/css/app.css
- index.html
- mock/data.js
- docs/功能说明文档.md
- docs/功能说明文档.html
- memory/business-rules.md
- memory/field-map.md
- memory/source-materials.md
- memory/acceptance-map.md
- memory/change-log.md

### 预期变更类型
- update

### 输入
- memory/business-rules.md
- memory/field-map.md
- memory/source-materials.md
- 用户确认的厚朴任务关联规则

### 工作
1. 厚朴场景配置仅保留已有任务 ID 输入与“查询并关联”动作。
2. 查询成功后只读反显任务资料，移除中台任务创建参数。
3. 任务 ID 为空、未查询、查询失败或变更后未重新查询时阻止保存。
4. 保存关联时保留业务场景 ID 与租户数据。
5. 任务详情与完整版说明文档同步展示新的关联方式。

### 验收
- 中台不展示或调用厚朴任务创建配置。
- 已有任务 ID 查询成功后完整只读反显任务资料。
- 无效或未确认的任务 ID 不能保存。
- 编辑保存不丢失场景 ID 与租户。

### 验证
- 浏览器验证成功关联、任务 ID 变更、查询失败与保存拦截路径。
- 检查旧创建字段不存在、控制台无错误、静态资源无 4xx/5xx。
- 检查 Markdown 与生成 HTML 同步。

### 验证技能
- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli`

### 标注影响
- affected-pages: sys-scene, scene-list
- annotation-required: yes
- annotation-targets: 厚朴平台配置 | 厚朴任务详情（只读） | region | FLD-006, FLD-013, FLD-014, FLD-016, FLD-017, FLD-018, FLD-019

### 依赖
- 步骤 01（数据整合）

### 失败处理
- 查询或回显失败时回到 sys-scene 关联逻辑修复。
- 资料口径冲突时以 SRC-011 为准并同步唯一说明文档。

## 步骤 15：厚朴开发评审规则补齐

### 需求来源
- SRC-012：2026-08-28 用户确认的厚朴开发评审补充规则
- 验收项：R-002 外呼列表、R-009 业务场景

### 目标
在已有 `task_id` 关联流程上补齐默认账号、唯一关联与任务状态实时读取，并明确 770–790 继续按已确认的本地映射执行。

### 文件
- mock/data.js
- js/pages/sys-scene.js
- js/pages/scene-list.js
- docs/功能说明文档.md
- docs/功能说明文档.html
- memory/business-rules.md
- memory/source-materials.md
- memory/field-map.md
- memory/acceptance-map.md
- memory/change-log.md

### 预期变更类型
- update

### 工作
1. 新增模拟的服务端默认厚朴账号与独立任务查询 Mock。
2. 查询和保存时校验同一 `task_id` 不得关联多个业务场景。
3. 打开外呼任务详情、打开已关联场景编辑页或主动查询时，重新读取并展示厚朴原始任务状态、中台映射状态与读取时间。
4. 唯一说明文档明确完整通话状态映射为中台本地业务规则。

### 验收
- 厚朴配置区显示只读的模拟默认账号。
- 未关联的有效 `task_id` 可查询并保存；已被其他场景使用的 `task_id` 被拦截。
- 编辑当前厚朴场景时可保留自身关联，并自动刷新任务状态。
- 任务详情与场景编辑均展示状态读取时间。
- Markdown 与 HTML 保持同步，不修改知识库或 GitHub。

### 验证
- JavaScript 语法、唯一说明文档同步和 final 门禁。
- 浏览器验证编辑态自动刷新、重复 ID 拦截、未关联 ID 查询与保存、任务详情实时状态。

### 验证技能
- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli`

### 标注影响
- affected-pages: sys-scene, scene-list
- annotation-required: yes
- annotation-targets: 厚朴平台配置 | 厚朴任务详情（只读） | region | FLD-006, FLD-013, FLD-014, FLD-016, FLD-017, FLD-018, FLD-019

### 依赖
- 步骤 14（厚朴按已有任务 ID 关联）

### 失败处理
- 重复 ID 未拦截或编辑自身被误拦截时，回到 sys-scene 唯一性校验逻辑修复。
- 任务状态未重新读取时，回到任务查询 Mock 与页面初始化逻辑修复。

## 步骤 16：厚朴场景模型与账号位置补齐

### 需求来源
- SRC-013：2026-08-31 用户确认的厚朴场景模型与账号位置补充
- 验收项：R-009 业务场景

### 目标
为厚朴新建业务场景补齐大模型/小模型必选项，并将模拟默认账号移动到业务信息之前。

### 文件
- mock/data.js
- js/pages/sys-scene.js
- docs/功能说明文档.md
- docs/功能说明文档.html
- memory/business-rules.md
- memory/source-materials.md
- memory/field-map.md
- memory/acceptance-map.md
- memory/change-log.md

### 预期变更类型
- update

### 工作
1. 在厚朴任务关联资料之后新增大模型/小模型单选。
2. 将厚朴默认账号调整到模型类型之后、业务信息之前只读展示。
3. 保存模型类型，并在编辑已有厚朴场景时正确回显。
4. 未选择模型类型时阻止保存。

### 验收
- 新建厚朴场景可见大模型、小模型两个选项。
- 模型类型为必填，保存后编辑可正确回显。
- 厚朴账号紧邻业务信息上方且不可编辑。
- Markdown 与生成 HTML 保持同步。

### 验证
- 浏览器验证新建厚朴场景的字段顺序、必填拦截、保存和编辑回显。
- 检查 JavaScript 语法、说明文档同步、控制台及静态资源。

### 验证技能
- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli`

### 标注影响
- affected-pages: sys-scene
- annotation-required: no
- annotation-targets: 现有“厚朴平台配置”锚点继续引用完整版说明文档

### 依赖
- 步骤 15（厚朴开发评审规则补齐）

### 失败处理
- 模型类型未保存或未回显时，回到 sys-scene 表单收集与编辑初始化逻辑修复。
- 账号位置错误时，回到厚朴平台面板的字段顺序修复。

## 步骤 17：厚朴任务详情字段收敛

### 需求来源
- SRC-014：2026-08-31 用户确认的厚朴任务详情字段收敛
- 验收项：R-002 外呼列表

### 目标
精简“外呼列表 → 查看 → 任务详情”中的厚朴详情，仅保留执行与追溯所需的 12 项核心信息，避免在详情区重复展示关联、模板、回调和状态诊断字段。

### 文件
- js/pages/scene-list.js
- mock/data.js
- index.html
- docs/功能说明文档.md
- docs/功能说明文档.html
- annotations/annotations.js
- memory/business-rules.md
- memory/source-materials.md
- memory/acceptance-map.md
- memory/annotation-prompt.md
- memory/annotation-coverage.md
- memory/change-log.md

### 预期变更类型
- update

### 工作
1. 从厚朴任务详情移除关联方式、任务类型、服务端回调、模板、任务状态、状态获取方式和状态读取时间。
2. 保留任务 ID、厚朴账号、任务名称、机器人、执行时段、并发、重呼、未呼优先、批次号、平台有效号码数、创建时间和外呼进度。
3. 清理仅服务于已删除详情行的 Mock 字段，但保留任务卡片、场景配置和全平台状态映射所需数据。
4. 让唯一说明文档、项目记忆和详情标注锚点与当前页面保持一致。

### 验收
- 厚朴任务详情准确展示 12 项核心字段。
- 7 项非必要字段不再出现在厚朴任务详情区。
- 列表卡片和详情顶部仍可展示按统一规则映射后的任务状态。
- 业务场景配置、号码模板用途与全平台状态映射不受影响。
- Markdown 与生成 HTML 保持同步。

### 验证
- JavaScript 语法、唯一说明文档同步和 S8/final 门禁。
- 浏览器验证桌面端与移动端的详情字段清单、顶部状态、控制台和静态资源。

### 验证技能
- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli`

### 标注影响
- affected-pages: scene-list
- annotation-required: yes
- annotation-targets: 厚朴任务详情（只读） | region | FLD-014, FLD-016, FLD-018, FLD-019

### 依赖
- 步骤 15（厚朴开发评审规则补齐）

### 失败处理
- 若详情仍出现被移除字段，回到 scene-list 的厚朴详情渲染逻辑修复。
- 若列表或详情顶部状态丢失，回到任务卡片状态映射逻辑复核，不恢复详情区的冗余状态行。

## 步骤 18：电声重呼配置与执行天数换算

### 需求来源
- SRC-015：2026-09-01 用户确认的电声重呼与 `days` 换算规则
- 验收项：R-009 业务场景

### 目标
收敛电声场景的重呼输入，并在模拟提交创建任务接口前换算完整的 `intervalMinutes` 和 `days`。

### 文件
- js/pages/sys-scene.js
- assets/css/app.css
- mock/data.js
- index.html
- docs/功能说明文档.md
- docs/功能说明文档.html
- memory/business-rules.md
- memory/source-materials.md
- memory/field-map.md
- memory/acceptance-map.md
- memory/change-log.md

### 预期变更类型
- update

### 工作
1. 移除电声场景中的最大执行天数输入列。
2. 将间隔分钟数多选改为统一正整数输入。
3. 按 `maxAttempts - 1` 生成重复的 `intervalMinutes` 数组。
4. 以计划开始时间为基准，结合呼叫窗口、可呼叫星期、排除日期和 `postpone` 顺延逐次模拟呼叫，换算自然日 `days`。
5. 在唯一功能说明 Markdown 的业务场景章节写入完整换算口径，并重新生成 HTML。

### 验收
- 页面不存在最大执行天数输入框。
- 最大呼叫次数与统一重呼间隔均可输入并进行范围校验。
- `intervalMinutes.length = maxAttempts - 1`，数组内每项等于统一间隔。
- `days` 按任务计划开始日期到末次计划呼叫日期的自然日包含首尾换算。
- Markdown 与生成 HTML 保持同步。

### 验证
- JavaScript 语法、静态字段检查、唯一说明文档同步和 final 门禁。
- 浏览器验证电声表单字段、跨时段顺延的 `days` 预估、提交提示、控制台和静态资源。

### 验证技能
- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli`

### 标注影响
- affected-pages: sys-scene
- annotation-required: no
- annotation-targets: 现有“电声平台配置”锚点继续指向完整版说明文档，新规则不在标注重复维护

### 依赖
- 步骤 17（当前项目基线）

### 失败处理
- 换算数组或天数错误时，回到 sys-scene 的电声排程模拟逻辑修复。
- 页面与文档口径不一致时，以 `docs/功能说明文档.md` 为唯一事实源收敛。
