---
name: memory-generator
description: PM 原型 loop 的项目记忆生成技能。Use at S3 (after the plan gate freezes the startup plan) to turn the frozen startup plan and any LLM WIKI inputs into structured project memory — project facts, business rules, source materials, field map, and open items — for downstream stages to consume read-only.
---

# 项目记忆生成

使用本技能，在 S2 计划门禁通过后，把**冻结的启动规划**（及 LLM WIKI 输入）蒸馏成结构化的项目记忆。S3 之后，下游阶段把这些记忆当作只读契约消费。

本技能**只对 S3 产物负责**：不创建项目结构、不写页面代码、不驱动其它阶段、**不调用 `loop_run.py complete`**（推进由总控负责）。

## 适用阶段

- S3 项目记忆生成

## 调用前置条件

- S1 启动规划已写入 `memory/project-startup-plan.md`。
- S2 计划门禁通过：PM 已确认、启动规划已冻结为只读、项目级 `CLAUDE.md` 已写入。

启动规划缺节或仍含占位内容时，不要生成记忆——退回让总控补 S1/S2。

## 输入

- `memory/project-startup-plan.md`（**只读溯源**，不回改）
- 项目级 `CLAUDE.md`（S2 写入的执行规则）
- 输入材料：参考项目、API 文档、截图、FLOWCHART 流程图、历史项目或口述要求
- LLM WIKI 输出：独立 LLM WIKI 的 query 结果文件（如 `outputs/*-loop-context.md` / `.json`），按资料源使用，**不把知识库复制进生成项目**

## 输出

必须生成或更新（产物清单由本技能约定，机器门禁见 `orchestrator/artifacts.yaml`，二者由 `check_workflow_sync.py` 绑定）：

- `memory/project.md` — 当前项目事实（定位、目标、用户、核心页面、核心路径、数据对象、交付方式、已确认假设）
- `memory/business-rules.md` — 业务对象定义、关键字段含义、状态枚举、权限边界、异常/空状态规则
- `memory/source-materials.md` — 输入资料的 `SRC-*` 编号记录
- `memory/field-map.md` — API/参考项目字段级事实的 `FLD-*` 编号记录
- `memory/open-items.md` — 未确认项
- `docs/decisions.md` — 关键决策记录

## LLM WIKI 输入规则

- wiki query 输出先作为 `SRC-*` 写入 `memory/source-materials.md`，在 Key Points 中保留 `wiki_ref`、`raw_ref`、`status`、`coverage` 等元数据。
- 字段、枚举、页面位置、展示规则整理进 `memory/field-map.md` 的 `FLD-*`，引用对应 `SRC-*`。
- `status=partial` 或标「待核对」的资料**不得写成已确认事实**：必须进入 `memory/open-items.md`，或等待 PM 确认后再写入当前记忆。

## 工作方式

1. 先读启动规划、CLAUDE.md 和全部输入材料（含 wiki query 输出）。
2. 区分**已确认事实**、合理假设和阻塞问题；只把已确认事实写进 `project.md` / `business-rules.md`。
3. 涉及字段、枚举、状态、详情、表格列、筛选项时，必须拆到字段级写入 `field-map.md` 的 `FLD-*`，并标来源 `SRC-*` 与 `status`。
4. 在 `project.md` 末尾给一段**记忆复核摘要**：派生了什么 vs 启动规划给定什么、哪些是 `partial`/待核对、哪些来自 wiki，便于 PM 快速复核（不自动判定，供总控请 PM 确认）。
5. 完成后不写 `complete`；把"S3 记忆已生成、待复核要点"反馈给总控，由总控推进。

## 禁止事项

- 不调用 `loop_run.py complete`（推进 = 总控职责）。
- 不创建项目结构、不写页面代码、不生成标注。
- 不回改 `memory/project-startup-plan.md`（S2 后只读）。
- 不把 `partial`/待核对资料当作已确认事实写入当前记忆。
- 不复述其它阶段的产物清单或门禁阈值。

## 专门 Agent 边界

本技能在 prototype loop 中承担 S3 项目记忆生成专门 Agent。

### 本 Agent 负责

- 将已冻结的启动规划、项目级执行规则和已确认资料整理为当前项目记忆。
- 提取业务对象、业务规则、页面事实、资料来源和字段事实。
- 维护当前项目事实、业务规则、来源记录、字段映射和未确认项。
- 每个 FLD-* 必须同时记录业务定义和取值逻辑。业务定义解释字段代表什么，取值逻辑解释字段如何直接取得、计算、映射或组合；不能只复制字段名、接口名或代码变量名。

### 本 Agent 不负责

- 不回改 `memory/project-startup-plan.md`。
- 不创建或迁移项目结构。
- 不拆分实现步骤。
- 不写页面、样式、mock 或交互代码。
- 不生成标注提示词，不写标注数据。
- 不推进阶段，不写 `config/workflow.json` 或 `memory/stage-log.md`。

### Token 加载策略

- 默认读取冻结启动规划、项目级执行规则、LLM WIKI loop-context 和用户指定资料摘要。
- 大型 API 文档、参考项目或历史项目只按缺口读取相关章节，不做默认全量读取。
- 输出当前项目记忆后，下游阶段优先消费记忆文件，不反复读取原始大资料。
