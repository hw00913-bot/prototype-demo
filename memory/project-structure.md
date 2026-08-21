# 项目结构摘要

> S5 阶段读取真实文件结构后填写本文件。S6 拆分以此为可编辑边界，不得把总控工具包（tools/prototype-loop-orchestrator）纳入业务实现范围。

## 可编辑业务文件清单

| 路径 | 类型 | 责任 | 可编辑原因 |
|---|---|---|---|
| index.html | entry | 页面入口 | 原型入口页面，包含导航和页面容器 |
| js/app.js | logic | 应用主逻辑 | 页面初始化和路由控制 |
| js/common.js | logic | 公共工具函数 | 提供Toast、筛选、Tab切换等公共功能 |
| js/nav.js | logic | 导航逻辑 | 左侧菜单导航控制 |
| js/pages/home.js | page | 首页 | 首页概览数据展示 |
| js/pages/scene-list.js | page | 外呼列表 | 外呼任务列表、筛选、详情 |
| js/pages/scene-block.js | page | 外呼拦截 | 黑名单管理 |
| js/pages/report-call.js | page | 通话统计 | 通话统计数据展示 |
| js/pages/report-billing.js | page | 计费统计 | 计费统计数据展示 |
| js/pages/report-clue.js | page | 线索统计 | 线索统计数据展示 |
| js/pages/result-records.js | page | 通话记录 | 通话记录查询 |
| js/pages/result-clue.js | page | 线索记录 | 线索记录查询 |
| js/pages/sys-scene.js | page | 业务场景 | 业务场景配置 |
| js/pages/sys-tags.js | page | 标签管理 | 标签管理配置 |
| js/pages/sys-tenant.js | page | 租户管理 | 租户管理配置 |
| mock/data.js | data | Mock数据 | 所有Mock数据源 |
| config/nav.json | config | 导航配置 | 导航菜单配置 |
| config/project.json | config | 项目配置 | 项目基本信息 |
| assets/css/global.css | style | 全局样式 | 全局CSS样式 |
| assets/css/app.css | style | 应用样式 | 应用CSS样式 |
| annotations/annotation-runtime.js | annotation | 标注运行时 | 标注系统运行时 |
| annotations/annotation.css | annotation | 标注样式 | 标注系统样式 |
| annotations/annotations.js | annotation | 标注数据 | 标注数据定义 |

## 页面与入口

- 入口页面：`index.html`
- 页面路由/导航：左侧边栏导航，点击切换右侧内容区域
- 页面实现文件：`js/pages/*.js`（11个页面文件）

## 页面路由结构

```
首页 (home.js)
├── 外呼场景
│   ├── 外呼列表 (scene-list.js)
│   └── 外呼拦截 (scene-block.js)
├── 统计分析
│   ├── 通话统计 (report-call.js)
│   ├── 计费统计 (report-billing.js)
│   └── 线索统计 (report-clue.js)
├── 外呼结果
│   ├── 通话记录 (result-records.js)
│   └── 线索记录 (result-clue.js)
└── 系统管理
    ├── 账号管理 (无对应JS文件)
    ├── 租户管理 (sys-tenant.js)
    ├── 通道管理 (无对应JS文件)
    ├── 业务场景 (sys-scene.js)
    └── 标签管理 (sys-tags.js)
```

## 公共组件与复用边界

- `js/common.js`：公共工具函数，包括Toast、筛选、Tab切换、级联菜单等
- `js/components/`：公共组件目录（当前为空，可扩展）

## 数据与配置来源

- Mock 数据位置：`mock/data.js`
- 配置文件位置：`config/nav.json`、`config/project.json`、`config/workflow.json`

## 标注与交互说明位置

- 源码锚点位置：业务页面中的 `data-anno` 属性
- 标注运行时位置：`annotations/`
- 交互说明位置：`docs/interaction.html`

## 不纳入实现/交付的目录

- `tools/prototype-loop-orchestrator/`：项目内总控工具包，不作为业务实现、验证对账、标注覆盖或交付统计范围。
- `.playwright-cli/`：Playwright测试配置，不纳入业务实现。
