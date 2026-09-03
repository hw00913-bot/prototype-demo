# 执行步骤

## 步骤 01：精简大众任务详情重呼追溯

### 需求来源
- SRC-001、SRC-002、D-002。

### 目标
打开大众通信任务详情时，重呼追溯区不再出现确认记录、当前呼叫轮次和是否最后一次计划呼叫。

### 文件
- `js/pages/scene-list.js`

### 预期变更类型
- update

### 输入
- `memory/project.md`
- `memory/business-rules.md`
- `memory/source-materials.md`
- `memory/field-map.md`
- `docs/decisions.md`

### 工作
- 删除三项详情行的拼接。
- 删除只服务于当前/最大轮次和末次状态的局部计算。
- 保留 FLD-001 至 FLD-004 的模式分支和展示规则。
- 保留 `scene-list-dazhong-redial` 最小业务锚点。

### 验收
- 定时重呼详情只展示重呼方式、计划重呼次数、人工配置确认。
- 任务重呼详情继续展示重呼方式和风险知情状态。
- 被删标签与“已到计划上限”等结论文案不在详情 DOM 中出现。

### 验证
- JS 语法检查。
- 浏览器分别打开定时重呼和任务重呼示例详情，检查 DOM、布局和 console。

### 验证技能
- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`

### 标注影响
- affected-pages: scene-list
- annotation-required: yes
- annotation-targets: scene-list | 大众通信重呼追溯 | section | FLD-001, FLD-002, FLD-003, FLD-004

### 依赖
- None

### 失败处理
- 若模式分支被破坏，回到本步骤按 field-map 恢复保留字段；若连续失败则使用 systematic-debugging。

## 步骤 02：同步功能说明口径

### 需求来源
- SRC-001、SRC-002、D-002。

### 目标
功能说明不再声称任务详情提供确认人/时间、当前轮次或末次判断。

### 文件
- `docs/功能说明文档.md`
- `docs/功能说明文档.html`

### 预期变更类型
- update

### 输入
- `memory/project.md`
- `memory/business-rules.md`
- `memory/source-materials.md`
- `memory/field-map.md`
- `docs/decisions.md`

### 工作
- 新增本轮版本记录。
- 修订大众通信任务详情说明，只描述 FLD-001 至 FLD-004。
- 删除轮次公式、末次结论和确认明细的详情展示表述。

### 验收
- Markdown 与 HTML 说明口径一致。
- 文档仍正确说明配置页人工确认门禁和计划重呼次数含义。

### 验证
- 搜索已删除详情标签和旧末次判断描述。
- 在说明文档页面检查正文可读且版本记录完整。

### 验证技能
- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`

### 标注影响
- affected-pages: interaction_docs
- annotation-required: no
- annotation-targets: none

### 依赖
- 步骤 01

### 失败处理
- 文档与实现不一致时回到本步骤，以 business-rules 和 field-map 为准修订。
