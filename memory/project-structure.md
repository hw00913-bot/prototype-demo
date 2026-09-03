# 项目结构摘要

## 可编辑业务文件清单

| 路径 | 类型 | 责任 | 可编辑原因 |
| --- | --- | --- | --- |
| `js/pages/scene-list.js` | page | 外呼列表与任务详情渲染 | 删除大众任务详情红框三项及专用计算 |
| `docs/功能说明文档.md` | document source | 功能说明正文 | 删除详情轮次追踪和末次判断旧口径 |
| `docs/功能说明文档.html` | delivery document | 可视化功能说明 | 与 Markdown 说明同步 |
| `docs/interaction.html` | interaction document | 交互说明 | 更新详情展示字段与异常规则 |
| `annotations/annotations.js` | annotation data | 页面人工标注 | 删除确认记录、轮次和末次判断说明 |
| `memory/*.md` | loop memory | 需求、字段、拆分与验收记录 | 维护本轮可追溯交付证据 |

## 页面与入口

- `index.html`：原型统一入口。
- `config/nav.json`：主导航配置。
- `js/nav.js`：导航渲染。
- `js/pages/scene-list.js`：外呼列表和任务详情弹窗，本轮唯一业务页面代码落点。
- `flowcharts/index.html`、`js/delivery-nav.js`：说明文档与流程图的交付切换壳，仅做同步确认。

## 公共组件与复用边界

- `js/common.js`：通用帮助方法，本轮不需修改。
- `assets/css/global.css` 与 `assets/css/app.css`：全局和应用样式；删除三行后沿用现有自动布局，不预期增加样式。
- `js/pages/sys-scene.js`：场景配置页面，人工确认门禁属于保留能力，不修改。

## 数据与配置来源

- `mock/data.js`：任务和场景 Mock 数据。现有确认人、确认时间、当前轮次字段不纳入本轮展示，但不做数据层删除。
- `config/project.json`：项目元数据。
- `config/workflow.json`：loop 状态，由工具维护，业务实现不得手写。

## 标注与交互说明位置

- 源码锚点：`js/pages/scene-list.js` 中 `data-anno-id="scene-list-dazhong-redial"`。
- 标注运行时：`annotations/annotation-runtime.js` 与 `annotations/annotation.css`，不修改运行机制。
- 标注数据：`annotations/annotations.js`，本轮同步现有任务详情标注合同。
- 交互说明：`docs/interaction.html`。

## 不纳入实现/交付的目录

- `tools/prototype-loop-orchestrator/`：总控工具包，不作为业务实现范围。
- `.loop-history/`：历史迭代归档，仅作流程留痕。
- `.git/`：版本控制元数据。
- `node_modules/`、浏览器报告与缓存：由忽略规则排除。

## 拆分边界结论

- 业务实现集中在 `js/pages/scene-list.js`。
- 文档同步涉及功能说明和交互说明。
- 标注更新仅调整既有详情锚点，不新增锚点或样式。
- 配置页、Mock 数据、公共样式和其他业务页面只做回归验证。
