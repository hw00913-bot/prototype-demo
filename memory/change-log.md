# 项目变更记录

## 2026-09-02

- 创建项目基础框架。

### Step 01：删除关联重呼任务 ID 全链路

- `mock/data.js`：删除大众场景与两条定时重呼任务详情的 `scheduledRedialTaskId`。
- `js/pages/sys-scene.js`：删除关联任务 ID 输入、预填、采集和必填校验；提示与确认文案只保留后台配置和计划次数。
- `js/pages/scene-list.js`：删除定时重呼详情中的关联任务 ID 行，保留确认与轮次判断。
- `index.html`：提升 Mock 和两个页面脚本的缓存版本。
- 标注影响：两个稳定锚点字段合同缩减为 FLD-001 至 FLD-011，不含已删除字段。

### Step 02：同步功能说明

- `docs/功能说明文档.md`：升级至 v3.0，删除旧输入、保存门禁和详情字段口径，明确大众 SaaS 不提供该 ID。
- `docs/功能说明文档.html`：从 Markdown 重新生成并通过同步检查。

### S9：同步交互说明与标注

- `memory/annotation-prompt.md`、`memory/annotation-coverage.md`：登记两个新字段合同和 R-001 至 R-009 覆盖关系。
- `docs/interaction.html`：说明已删除定时重呼任务 ID，保留次数、确认和末次公式。
- `annotations/annotations.js`：回写 Annotation 1/2，字段合同缩减为 FLD-001 至 FLD-011。
- `index.html`：提升标注缓存版本，确保加载本轮数据。
