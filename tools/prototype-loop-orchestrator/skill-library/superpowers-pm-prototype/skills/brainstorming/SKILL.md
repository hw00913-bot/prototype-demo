---
name: brainstorming
description: 面向 PM 原型 loop 的需求澄清技能。Use when a product requirement needs clarification before prototype planning, including target users, scenarios, scope, pages, assumptions, and acceptance direction.
---

# 需求澄清

使用本技能把产品经理输入的原始想法、截图、FLOWCHART 流程图、参考资料或口头需求，整理成可以进入原型计划的清晰上下文。

## Loop 上下文

本技能是 `prototype-loop-orchestrator` 的一部分，由总控在指定阶段或支持场景中调用。它只处理本技能职责内的分析、验证或失败定位，不自行推进阶段，不写 `config/workflow.json`，不写 `memory/stage-log.md`，不声明阶段通过。

## 适用阶段

- S1 项目讨论

## 目标

澄清这些内容：

- 产品目标
- 目标用户
- 使用场景
- 核心页面或视图
- 核心流程
- 关键业务对象
- 必要交互
- 参考资料和视觉方向
- 不做什么
- 输入材料：参考项目、API 文档、FLOWCHART 流程图、LLM WIKI、历史项目、截图或无外部资料
- 迭代方式：新建项目或基于现有项目迭代
- 标注策略：自动生成、手动触发或本轮不处理
- 验收标准
- 未确认假设

## 输出位置

不要写入 Superpowers 默认路径。S1 只输出本项目标准启动快照：

- `memory/project-startup-plan.md`

S1 的未确认项必须写入 `memory/project-startup-plan.md` 的 `## S2 前待确认问题` 章节，不写 `memory/open-items.md`。S2 确认后由总控写入项目级 `CLAUDE.md`。S3 再把启动规划转换为 `memory/project.md`、`memory/business-rules.md`、`memory/source-materials.md`、`memory/field-map.md`、`memory/open-items.md` 和 `docs/decisions.md`。

## 工作方式

1. 先阅读已有项目文档和 memory。
2. 区分已确认事实、合理假设和阻塞问题。
3. 一次只问一个会实质影响原型方向的问题。
4. 对低风险缺口可以提出默认假设，但必须记录。
5. S1 必须先写入 `memory/project-startup-plan.md`，记录启动来源、产品形态、目的、范围、UI 风格、参考资料、LLM WIKI 调用计划、数据字段来源、整体页面结构、核心流程、验收方向、约束风险和 S2 前待确认问题。
6. 在进入 S2 前，给出简洁的原型计划摘要，并请 PM 明确确认。
7. 只有 PM 明确确认后，才允许完成 S2；S2 会冻结 `memory/project-startup-plan.md` 并要求项目级 `CLAUDE.md` 已写入。
8. S2 确认后 `memory/project-startup-plan.md` 只读；后续变更写入 `docs/decisions.md` 或 `memory/change-log.md`，不得回改启动规划。

## 门禁

以下内容不清楚时，不进入任务拆分：

- 原型目标
- 目标用户
- 核心用户流程
- 页面范围
- 非本期范围
- 输入材料
- 迭代方式
- 标注策略
- 主要业务对象
- 验收标准
- 交付方式

如果用户只说“开始计划项目”，必须先追问上述内容；不能直接生成项目记忆、拆分步骤或写页面代码。

S1 完成前，`memory/project-startup-plan.md` 不能有占位内容。S2 完成后，本文件只读，用于后续变更溯源。

## 禁止事项

- 不创建项目结构。
- 不写页面代码。
- 不生成最终标注。
- 不把未确认假设当成事实。
- 不使用 `docs/superpowers/specs/` 作为默认输出路径。

## 专门 Agent 边界

本技能在 prototype loop 中承担 S1 项目讨论专门 Agent。

### 本 Agent 负责

- 澄清项目目标、目标用户、核心场景、页面范围和非本期范围。
- 确认项目是从 0 开始还是基于底座迭代。
- 确认底座保留内容、重置内容和禁止修改内容。
- 确认 UI 风格、参考资料、LLM WIKI 调用计划、整体页面结构和验收方向。
- 将启动期已确认内容写入 `memory/project-startup-plan.md`。

### 本 Agent 不负责

- 不生成项目记忆。
- 不初始化项目结构。
- 不拆分实现步骤。
- 不写业务代码。
- 不生成标注提示词或标注数据。
- 不推进阶段，不写 `config/workflow.json` 或 `memory/stage-log.md`。

### Token 加载策略

- 优先读取 PM 当前输入、PM 提供的资料摘要和 LLM WIKI query 输出。
- 基于底座迭代时，只读取用户指定的底座说明或必要结构摘要；不默认读取底座全量源码。
- 不读取历史项目 memory 作为当前事实，除非该历史资料已经被用户指定为参考输入。

