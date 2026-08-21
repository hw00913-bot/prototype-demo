# 项目记忆 — 智能外呼平台整合

> 本文件是 S3 阶段生成的当前项目事实，后续阶段只读消费。如需变更，写入 `docs/decisions.md` 或 `memory/change-log.md`。
> 当前迭代：智能外呼平台整合

## 项目定位

- 项目名称：智能外呼统一中台
- 项目类型：B2B 智能外呼平台产品演示原型
- 载体形态：静态 HTML 原型（无构建步骤）
- 入口文件：`index.html`
- 运行方式：本地 HTTP 服务器（`python3 -m http.server 8080`）

## 产品目标

- 实现目的：整合多个接入方原型，展示智能外呼平台的完整能力
- 评审对象：技术团队，用于了解产品功能和接入流程
- 验证假设：整合后的原型能清晰展示各平台能力差异和共性

## 目标用户

- 主要角色：技术团队
- 使用场景：了解产品功能和接入流程
- 核心需求：查看多平台数据展示、筛选查询、统计分析

## 核心页面列表

| 页面ID | 文件名 | 功能模块 | 职责 |
|--------|--------|----------|------|
| home | home.js | 首页 | 展示概览数据和快捷入口 |
| scene-list | scene-list.js | 外呼场景 | 外呼任务列表、筛选、详情 |
| scene-block | scene-block.js | 外呼场景 | 外呼拦截（黑名单管理） |
| report-call | report-call.js | 统计分析 | 通话统计数据展示 |
| report-billing | report-billing.js | 统计分析 | 计费统计数据展示 |
| report-clue | report-clue.js | 统计分析 | 线索统计数据展示 |
| result-records | result-records.js | 外呼结果 | 通话记录查询 |
| result-clue | result-clue.js | 外呼结果 | 线索记录查询 |
| sys-scene | sys-scene.js | 系统管理 | 业务场景配置 |
| sys-tags | sys-tags.js | 系统管理 | 标签管理配置 |
| sys-tenant | sys-tenant.js | 系统管理 | 租户管理配置 |

## 核心用户路径

1. 用户入口：首页展示概览数据
2. 主流程：外呼列表 → 外呼任务详情 → 通话记录 → 线索记录 → 统计报表
3. 关键状态：任务状态（进行中/暂停/已终止）、通话状态（已接通/未接通/占线等）
4. 异常状态：数据为空时的友好提示

## 主要数据对象

- 外呼任务（MockSceneList）
- 通话记录（MockCallRecordRows）
- 通话统计（MockCallStatsRows）
- 计费统计（MockBillingStatsRows）
- 线索统计（MockClueStatNEV/ICE）
- 租户管理（MockTenantRows）
- 标签管理（MockTagSuppliers/LocalTagSets）
- 业务场景（MockSceneRows）
- 黑名单（MockBlockGroups/Rows）

## 交付方式

- 交付物：静态HTML原型项目
- 部署方式：本地HTTP服务器访问
- 标注策略：手动触发（S9准备标注提示词）

## 已确认假设

1. 所有页面功能保持现有实现，仅增强数据完整性
2. Mock数据基于源目录数据重新整理，确保覆盖所有平台
3. UI风格保留当前目录的设计

## 记忆复核摘要

- 派生内容：从启动规划和现有代码分析得出
- 启动规划给定：项目目的、目标用户、页面范围、整合策略
- 待核对内容：各平台字段命名一致性（partial）
- 无LLM WIKI输入
