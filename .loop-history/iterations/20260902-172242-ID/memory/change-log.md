# 项目变更记录

## 2026-09-02

- 创建项目基础框架。

### Step 01：大众重呼配置与人工门禁

- `mock/data.js`：大众业务场景补充重呼开关、定时重呼方式、关联任务 ID、计划重呼次数、人工确认人与时间。
- `js/pages/sys-scene.js`：大众平台配置新增是否重呼、定时重呼/任务重呼卡片、推荐标签、平台限制说明、人工确认追溯和分支保存校验；主任务 ID、关联任务 ID、重呼次数或方式变更时清空原确认。
- `assets/css/app.css`：补充大众重呼方式、人工确认卡片和窄屏单列样式。
- 标注影响：新增 `sys-scene-dazhong-redial` 锚点，引用 FLD-001 至 FLD-009。

### Step 02：任务详情与末次呼叫追溯

- `mock/data.js`：三条大众通信任务分别补充定时重呼末次、定时重呼非末次、任务重呼三类演示数据。
- `js/pages/scene-list.js`：任务详情新增重呼方式、关联任务、人工确认记录、当前/最大呼叫轮次和末次判断；最大呼叫轮次按“计划重呼次数 + 1”计算。
- `assets/css/app.css`：新增确认、末次、仍有重呼和无法判断四类追溯状态样式。
- 标注影响：新增 `scene-list-dazhong-redial` 锚点，引用 FLD-003 至 FLD-012。

### Step 03：说明文档与资源版本

- `docs/功能说明文档.md`：升级到 v2.9，补充大众平台完成态限制、两种重呼方式、人工确认门禁、确认失效规则、次数口径和末次公式。
- `docs/功能说明文档.html`：由唯一 Markdown 内容源重新生成并通过同步校验。
- `index.html`：提升样式、Mock、场景配置、任务详情和标注资源版本，避免浏览器继续命中旧缓存。

### S9：说明页与标注回写

- `memory/annotation-prompt.md`：登记两个稳定锚点的 page、selector、label、kind、字段合同和 SRC-001 至 SRC-003 输入边界。
- `memory/annotation-coverage.md`：建立 Annotation 1/2 与 R-001 至 R-010、FLD-001 至 FLD-012 的覆盖关系。
- `docs/interaction.html`：按标准文档模板补充配置流程、详情追溯、功能明细和“无接口、只记录人工确认”的限制。
- `annotations/annotations.js`：一次性回写本轮两条完整标注，ID 全局连续为 1、2，每条包含十段说明和逐字段解释。
- `index.html`：标注数据缓存版本提升到 15、资源版本提升到 18，确保浏览器加载本轮回写结果。
