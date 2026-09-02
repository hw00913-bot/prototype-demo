# 项目结构摘要

> S5 依据当前磁盘中的真实文件结构生成。S6 仅在本文件列出的可编辑边界内拆分本轮实现。

## 可编辑业务文件清单

| 路径 | 类型 | 责任 | 可编辑原因 |
|---|---|---|---|
| `js/pages/sys-scene.js` | page | 业务场景列表、新建/编辑抽屉与六平台专属表单 | 本轮要增加大众通信重呼分支、校验与人工确认 |
| `js/pages/scene-list.js` | page | 外呼列表卡片、详情抽屉与大众任务详情 | 本轮要只读展示重呼方式、确认记录和末次判断 |
| `mock/data.js` | mock | 全站 Mock 数据，含 `MockSceneRows`、`MockSceneList`、`MockDazhongTaskEditDetail` | 新增字段必须与页面逻辑分离，并为详情和末次判断提供可验证数据 |
| `assets/css/app.css` | style | 底座业务页面与平台专属表单样式 | 本轮需复用现有设计并补充重呼方式、推荐标签、确认卡片和详情状态样式 |
| `index.html` | entry | 页面宿主、业务脚本和标注资源加载 | 如果业务或标注资源变更，需提升对应版本号防止缓存 |
| `docs/功能说明文档.md` | document | 完整版业务与字段唯一维护文档 | 用户要求同步说明，应记录平台限制、分支、门禁和公式 |
| `docs/功能说明文档.html` | document | 完整说明文档的浏览器交付版 | 应由 Markdown 通过现有 `tools/render_doc_html.py` 同步生成 |
| `docs/interaction.html` | document | S9 标准五章交互说明 | 本轮验证后记录大众重呼交互和演示边界 |
| `memory/change-log.md` | memory | 本轮实现变更记录 | S7 需实时记录实现与文档变更 |
| `memory/verification-log.md` | memory | 单步和全局验证证据 | S7/S8 需记录结构化 pass 证据 |
| `memory/acceptance-map.md` | memory | 需求、页面、字段、验证和标注的追溯映射 | S6 拆分和 S8 最终状态需更新 |
| `memory/annotation-prompt.md` | memory | S9 手工标注生成依据 | 用户要求本轮回写标注，必须先生成合规提示词 |
| `memory/annotation-coverage.md` | memory | 本轮标注覆盖清单 | 记录两个业务页的核心锚点覆盖 |
| `annotations/annotations.js` | annotation | 本轮手工标注数据 | 用户已明确要求修改标注；必须在 S9 提示词与锚点清单完成后回写 |

## 页面与入口

- `index.html`：原型唯一宿主入口，直接加载 `mock/data.js`、`js/pages/*.js`、标注运行时和顶部交付导航。
- `js/nav.js`：实际 RouteMap 与侧边栏导航处理；`scene-list` 对应“外呼场景 → 外呼列表”，`sys-scene` 对应“系统管理 → 业务场景”。
- `config/nav.json`：三视图导航辅助配置，当前仅含首页与流程图集，不是业务侧边栏的唯一源。
- `js/pages/sys-scene.js`：注册 `window.Pages['sys-scene']`。
- `js/pages/scene-list.js`：注册 `window.Pages['scene-list']`。

## 公共组件与复用边界

- `js/common.js`：Toast、过滤等公共能力；本轮原则上不修改。
- `assets/css/global.css`：全局布局与通用样式；本轮应优先在 `assets/css/app.css` 添加局部类，不扩大全局影响。
- `js/components/` 在当前项目中无业务组件文件；本轮功能只属于大众平台表单，不抽取全局组件。

## 数据与配置来源

- `mock/data.js`：全站 Mock 唯一大型数据源，本轮仅扩展大众相关对象。
- `config/project.json`：项目 ID、创建日期与是否允许依赖的项目配置，本轮不修改。
- `config/workflow.json`：Loop 阶段状态，只由 `tools/loop_run.py` 写入。

## 标注与交互说明位置

- 源码锚点：`js/pages/sys-scene.js` 与 `js/pages/scene-list.js` 中的 `data-anno` 及配套 `data-anno-page/label/kind/fields`。
- 标注运行时：`annotations/annotation-runtime.js` 和 `annotations/annotation.css`，本轮不修改运行时。
- 标注数据：`annotations/annotations.js`，新迭代已重置为空对象，将在 S9 按本轮锚点回写。
- 交互说明：`docs/interaction.html`，使用固定五章结构。

## 不纳入实现/交付的目录

- `tools/prototype-loop-orchestrator/`：项目内总控工具包，不作为业务实现、验证对账、标注覆盖或交付统计范围。
- `.loop-history/`：历史迭代归档，只用于回溯，本轮不读取历史标注作为新标注输入。
- `.git/`：版本控制元数据。
- `tools/loop_run.py` 与 `tools/loop_preflight.py`：确定性门禁工具，不属于业务实现。
