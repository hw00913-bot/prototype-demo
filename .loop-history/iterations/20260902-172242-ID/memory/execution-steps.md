# 执行步骤

## Step 01: 实现大众重呼配置与人工门禁

### Goal

在业务场景的大众通信配置区，完成是否重呼、定时/任务重呼分支、定时重呼人工配置确认和任务重呼风险知情。

### Files

- `mock/data.js`
- `js/pages/sys-scene.js`
- `assets/css/app.css`

### Expected Change

- update

### Inputs

- `memory/project.md`
- `memory/business-rules.md`
- `memory/source-materials.md`
- `memory/field-map.md`
- `docs/decisions.md`

### Work

- 为大众场景 Mock 增加 FLD-002 至 FLD-009 对应字段，不将原始数据硬编码到页面脚本。
- 在大众任务 ID（FLD-001）下新增“是否需要重呼”（FLD-002）和“重呼方式”（FLD-003），定时重呼默认并带推荐标签。
- 定时重呼分支展示平台限制说明、关联重呼任务 ID（FLD-004）、计划重呼次数（FLD-005）和人工配置确认（FLD-006）。
- 任务重呼分支展示完成态风险说明并要求 FLD-007 知情确认。
- 定时重呼确认时记录 FLD-008/FLD-009；修改 FLD-001、FLD-003、FLD-004 或 FLD-005 后清空确认记录。
- 补充 `data-anno="sys-scene-dazhong-redial"` 稳定锚点，同一元素声明 page/label/kind/fields。

### Acceptance

- 不需要重呼时隐藏方式与确认区，可保存。
- 需要重呼时默认定时重呼，且定时重呼为推荐项。
- 定时重呼缺 FLD-004、FLD-005 或 FLD-006 任一时阻止保存；FLD-005 必须是大于等于 1 的整数。
- 任务重呼未勾选 FLD-007 时阻止保存。
- 确认后可见确认人和确认时间；关键字段变更后确认立即失效。
- 一知、中科金、电声、冰兰和厚朴配置面板行为不变。

### Verification

- 运行 `node --check js/pages/sys-scene.js` 和 `node --check mock/data.js`。
- 通过浏览器打开 `sys-scene`，覆盖不重呼、定时重呼缺失项、定时重呼成功、任务重呼风险未确认/已确认和关键字段变更后失效。
- 检查 console 无阻断错误、页面资源无 404。

### Verification Skill

- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`
- Support Skill: `superpowers-pm-prototype/skills/verification-before-completion`
- Support Skill on Failure: `superpowers-pm-prototype/skills/systematic-debugging`

### Annotation Impact

- affected-pages: sys-scene
- annotation-required: yes
- annotation-targets: sys-scene | 大众通信重呼配置 | region | FLD-001,FLD-002,FLD-003,FLD-004,FLD-005,FLD-006,FLD-007,FLD-008,FLD-009

### Dependencies

- None

### Failure Handling

- 数据字段或口径冲突时回到 S3 修订字段映射；交互或校验失败时使用系统化调试定位当前步骤。

## Step 02: 展示大众重呼追溯与末次判断

### Goal

在外呼任务详情中只读展示本轮大众重呼配置，并使“第 X/Y 次”与“最后一次计划呼叫”判断可观察。

### Files

- `mock/data.js`
- `js/pages/scene-list.js`
- `assets/css/app.css`

### Expected Change

- update

### Inputs

- `memory/project.md`
- `memory/business-rules.md`
- `memory/source-materials.md`
- `memory/field-map.md`
- `docs/decisions.md`

### Work

- 为至少两条大众任务 Mock 提供可区分的定时重呼和任务重呼数据，定时重呼包含 FLD-004 至 FLD-012。
- 定时重呼详情展示关联任务 ID、计划重呼次数、人工确认状态、确认人、确认时间、第 X/Y 次和末次判断。
- 任务重呼详情展示重呼方式、已知悉风险和平台完成态限制，不虚构定时重呼次数或末次判断。
- 使用 `currentCallRound >= scheduledRedialTimes + 1` 生成 FLD-012，数据不完时显示“无法判断”。
- 补充 `data-anno="scene-list-dazhong-redial"` 锚点，保持原大众任务详情锚点语义清晰。

### Acceptance

- 定时重呼 Mock 展示“定时重呼（推荐）”、关联任务 ID、重呼次数不含首次的说明、人工确认信息和“第 3/3 次”。
- 当前轮次达到最大轮次时显示“是，最后一次计划呼叫”；未达到时显示否。
- 任务重呼 Mock 不展示虚假的定时重呼人工校验结果。
- 原大众任务名称、话术、时段、坐席数、平台原生重呼条件和进度展示保持。

### Verification

- 运行 `node --check js/pages/scene-list.js` 和 `node --check mock/data.js`。
- 通过浏览器依次打开定时重呼、任务重呼大众任务的“任务详情”页签，核对字段、分支和末次公式。
- 检查其他平台任务详情无新增大众字段，console 无阻断错误、资源无 404。

### Verification Skill

- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`
- Support Skill: `superpowers-pm-prototype/skills/verification-before-completion`
- Support Skill on Failure: `superpowers-pm-prototype/skills/systematic-debugging`

### Annotation Impact

- affected-pages: scene-list
- annotation-required: yes
- annotation-targets: scene-list | 大众通信重呼追溯 | region | FLD-003,FLD-004,FLD-005,FLD-006,FLD-007,FLD-008,FLD-009,FLD-010,FLD-011,FLD-012

### Dependencies

- Step 01

### Failure Handling

- 末次口径不一致时回到 S3 字段/规则；渲染或平台分支失败时仅修复当前大众详情步骤。

## Step 03: 同步大众重呼说明与资源版本

### Goal

将已验证的页面规则同步到完整功能说明，并使页面加载最新业务与标注资源。

### Files

- `docs/功能说明文档.md`
- `docs/功能说明文档.html`
- `index.html`

### Expected Change

- update

### Inputs

- `memory/business-rules.md`
- `memory/source-materials.md`
- `memory/field-map.md`
- `docs/decisions.md`
- Step 01/02 的已验证结果

### Work

- 新增版本记录，说明大众完成态限制、两种重呼方式、人工确认与末次判断。
- 在业务场景字段和规则章节增加 FLD-001 至 FLD-012 相关描述，强调中台无法自动校验。
- 使用现有 `tools/render_doc_html.py` 从 Markdown 同步生成 HTML，不手工维护两套不一致规则。
- 提升 `mock/data.js`、`sys-scene.js`、`scene-list.js` 和 `annotations/annotations.js` 的宿主加载版本号。

### Acceptance

- Markdown 与 HTML 均包含平台限制、定时/任务重呼、人工确认、次数不含首次和最大轮次公式。
- 文档不声称大众已提供定时重呼配置或校验接口。
- `index.html` 所有本轮修改资源的版本号已更新，无重复脚本。

### Verification

- 检查 Markdown 关键文案，运行文档生成工具，核对 HTML 存在同样的规则。
- 通过 HTTP 打开原型与完整功能说明，检查资源无 404。

### Verification Skill

- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`
- Support Skill: `superpowers-pm-prototype/skills/verification-before-completion`

### Annotation Impact

- affected-pages: None
- annotation-required: no
- annotation-targets: none

### Dependencies

- Step 01, Step 02

### Failure Handling

- 文档与页面口径不一致时优先以已确认的 `memory/business-rules.md` 与字段映射修订实现或文档。
