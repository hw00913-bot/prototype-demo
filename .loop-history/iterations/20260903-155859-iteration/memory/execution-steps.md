# 执行步骤

## 步骤 01：删除关联重呼任务 ID 全链路

### 需求来源
- SRC-001、SRC-002、D-002。

### 目标
配置页和任务详情不再出现关联重呼任务 ID，定时重呼仍可凭计划次数和人工确认保存并判断末次。

### 文件
- `js/pages/sys-scene.js`
- `js/pages/scene-list.js`
- `mock/data.js`
- `index.html`

### 预期变更类型
- update

### 输入
- `memory/project.md`
- `memory/business-rules.md`
- `memory/source-materials.md`
- `memory/field-map.md`
- `docs/decisions.md`

### 工作
- 删除 `scheduledRedialTaskId` 的 Mock、表单输入、采集、保存和必填校验。
- 把定时重呼提示和人工确认文案改为只描述后台配置与计划次数。
- 删除详情中的关联任务 ID 行，保留 FLD-003 至 FLD-011 的追溯。
- 更新两个源码锚点的 `data-anno-fields` 合同。
- 提升 JS、Mock 与标注资源缓存版本。

### 验收
- 大众编辑页不存在“关联重呼任务 ID”。
- 定时重呼只要求 FLD-004 计划次数和 FLD-005 人工确认。
- 修改 FLD-001、FLD-003 或 FLD-004 后确认失效。
- 任务详情不存在旧 ID，3/3 与 2/3 末次计算保持正确。
- 任务重呼仍只展示 FLD-006 风险确认。

### 验证
- `node --check` 校验两个页面 JS 和 Mock。
- 浏览器检查配置保存门禁、确认失效、三条大众任务详情和控制台。
- 全项目搜索 `scheduledRedialTaskId` 与旧中文字段。

### 验证技能
- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`

### 标注影响
- affected-pages: sys-scene, scene-list
- annotation-required: yes
- annotation-targets: sys-scene | 大众通信重呼配置 | region | FLD-001,FLD-002,FLD-003,FLD-004,FLD-005,FLD-006,FLD-007,FLD-008；scene-list | 大众通信重呼追溯 | region | FLD-003,FLD-004,FLD-005,FLD-006,FLD-007,FLD-008,FLD-009,FLD-010,FLD-011

### 依赖
- None

### 失败处理
- 若仍有字段残留，回到本步骤逐一删除；若删除影响次数或末次公式，按 business-rules 修复。

## 步骤 02：同步说明文档

### 需求来源
- SRC-001、SRC-003、D-002。

### 目标
Markdown 与 HTML 说明不再描述关联任务 ID，完整保留无接口边界、人工确认和次数公式。

### 文件
- `docs/功能说明文档.md`
- `docs/功能说明文档.html`
- `index.html`

### 预期变更类型
- update

### 输入
- `memory/business-rules.md`
- `memory/field-map.md`
- `docs/decisions.md`

### 工作
- 升级文档版本并删除关联任务 ID 的修订记录、页面说明、规则和功能明细。
- 把确认文案统一为“计划重呼次数与实际配置一致”。
- 重新生成 HTML 并提升文档资源版本。

### 验收
- Markdown/HTML 不再包含关联重呼任务 ID 产品能力。
- 文档仍明确暂无接口、中台只记录人工确认、次数不含首次和最大轮次公式。

### 验证
- `python3 tools/render_doc_html.py --check`。
- 浏览器打开功能说明，检查新版口径和 console。

### 验证技能
- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`

### 标注影响
- affected-pages: None
- annotation-required: no
- annotation-targets: None

### 依赖
- step-01

### 失败处理
- 文档与实现不一致时回到本步骤，以 field-map 和 business-rules 为准修订。
