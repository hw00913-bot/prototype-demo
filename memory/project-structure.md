# 项目结构摘要

## 可编辑业务文件清单

| 路径 | 类型 | 责任 | 可编辑原因 |
| --- | --- | --- | --- |
| `index.html` | entry | 页面入口与资源版本 | 删除旧字段后提升资源缓存版本 |
| `js/pages/sys-scene.js` | page | 大众业务场景配置 | 删除输入、采集、校验和确认文案 |
| `js/pages/scene-list.js` | page | 大众任务详情 | 删除关联任务 ID 详情行并更新字段锚点 |
| `mock/data.js` | data | 大众场景与详情 Mock | 删除 `scheduledRedialTaskId` |
| `docs/功能说明文档.md` | documentation | 唯一功能说明内容源 | 删除旧字段、门禁和详情说明 |
| `docs/功能说明文档.html` | generated documentation | 可浏览功能说明 | 由 Markdown 重新生成 |
| `docs/interaction.html` | documentation | 本轮交互说明 | 同步删除字段和限制口径 |
| `annotations/annotations.js` | annotation data | 页面标注 | 回写当前 11 字段合同 |
| `memory/*.md` | workflow evidence | 需求、拆分、验收、验证与标注追溯 | 本轮 loop 产物 |

## 页面与入口

- `index.html`：统一入口，加载业务页面、Mock 和标注运行时。
- `config/nav.json` 与 `js/nav.js`：导航结构，本轮不修改。
- `js/pages/sys-scene.js`：系统管理-业务场景，包含 `sys-scene-dazhong-redial`。
- `js/pages/scene-list.js`：外呼场景-外呼列表及任务详情，包含 `scene-list-dazhong-redial`。

## 公共组件与复用边界

- `assets/css/app.css`：现有大众重呼样式可继续复用；删除一行字段不需要新样式。
- `js/common.js` 与其他页面：本轮不修改。
- 其他供应商平台面板和任务详情属于回归边界。

## 数据与配置来源

- `mock/data.js`：删除大众场景和任务详情中的 `scheduledRedialTaskId`，保留次数、确认记录和轮次。
- `config/project.json`：项目配置，不修改业务含义。
- `memory/source-materials.md` 与 `memory/field-map.md`：当前来源和字段合同。

## 标注与交互说明位置

- 源码锚点：`sys-scene-dazhong-redial`、`scene-list-dazhong-redial`。
- 标注运行时：`annotations/annotation-runtime.js` 与 `annotations/annotation.css`，不修改。
- 标注数据：`annotations/annotations.js`。
- 交互说明：`docs/interaction.html`。

## 生成与验证工具

- `tools/render_doc_html.py`：从 Markdown 生成并校验功能说明 HTML。
- `tools/loop_run.py`、`tools/loop_preflight.py`：阶段和最终门禁。
- 浏览器验证覆盖配置页、三类大众任务详情、说明与 marker。

## 不纳入实现/交付的目录

- `tools/prototype-loop-orchestrator/`：总控工具包，不作为业务实现范围。
- `.loop-history/`：历史迭代归档，仅作工作流留痕。
- `.git/`：版本控制元数据。
