---
name: prototype-loop-orchestrator
description: "总控 PM 到演示原型的自动化工作流。当用户说‘开始计划项目’、‘基于底座迭代’、‘继续生成原型’，或要求把产品需求转成演示 Demo 时使用。Orchestrates requirement normalization, project decomposition, project initialization, iterative implementation, verification, and manual annotation prompt preparation."
---

# 原型循环总控

使用本技能，把产品经理需求转成已验证、带标注、可交付的静态原型项目。

本文件只定义“调用时如何调度”。运行时唯一控制源在 `orchestrator/`：

- `orchestrator/workflow.yaml`：S0-S9 阶段状态机。
- `orchestrator/artifacts.yaml`：各阶段必需文件和内容门槛。
- `orchestrator/gates.yaml`：阶段门禁、熔断和标注硬规则。
- `orchestrator/scripts/loop_run.py`：阶段推进、状态写入和阶段日志入口。
- `orchestrator/scripts/loop_preflight.py`：确定性预检脚本。

`docs/` 只用于解释控制配置，不作为运行时权威来源。

## 触发时机

当产品经理输入“开始计划项目”、提交需求、提供目的/范围/FLOWCHART 流程图/外部资料/项目历史，或表达要生成演示原型时，先调用本总控技能。

总控启动后第一步判断是否进入“项目讨论状态”。进入后必须先完成 PM Brief Intake（目的、范围、非范围、输入材料、迭代方式、标注策略、验收方向），不得直接拆分、初始化或实现。

**Intake 的具体澄清问题与启动规划契约由 S1 技能 `skill-library/superpowers-pm-prototype/skills/brainstorming` 负责**；总控只在 S0 后派发它。缺项时由该技能向 PM 追问，未把 `memory/project-startup-plan.md` 写全前不进 S2。本系统标注策略固定为**人工触发**：S9 只准备提示词，**不自动生成 `annotations/annotations.js`**。

## S0 路由协议

S0 只判断是否启动或继续 loop，不产出需求结论。

- 用户表达“开始计划项目 / 新建原型 / 基于底座迭代 / 继续生成原型”时，进入 S0。
- 目标目录不存在或没有 `config/workflow.json`：先在 loop 源仓库调用 create-project 脚手架创建最小结构，但生成项目状态仍必须从 S0 开始写日志。
- 目标目录已有 `config/workflow.json`：**在读取项目内任何工具前**，先从当前总控技能包调用 `skill-library/loop-project-scaffolder/scripts/create_project.py "目标目录" --sync-runtime`。该动作幂等刷新项目内确定性脚本、阶段技能和五视图内部切换壳，不覆盖业务文件、memory、annotations、`docs/interaction.html` 正文或已经生成的本地 HTML 图内容；它会移除已停用的 ProcessOn 聚合页和链接清单。随后再读取 `python3 tools/loop_run.py status .` 和 `python3 tools/loop_run.py dispatch .`；不能因为缓存存在跳过 S0-S3。
- 用户只是询问、审计、维护 loop 本身或修改技能库时，不进入业务项目 loop。
- 已有项目处于 none 终态且需要继续一轮迭代时，先确认 final 快照无漂移，再运行 begin-iteration 并提供本轮名称。该动作归档上一轮控制状态、重置 loop-owned 记忆和标注并回到 S0，不能用强制完成 S0 伪装新一轮。
- S0 完成后必须进入 S1 项目讨论，由 S1 澄清目的、范围、非范围、资料、迭代方式、标注策略和验收方向。

## 运行角色

你是工作流总控，只负责判断当前阶段、调用阶段能力、执行脚本入口和反馈脚本结果。

如果本总控整包被放在业务项目的 `tools/prototype-loop-orchestrator/` 中，它只是项目内总控工具包，用来让 Claude Code 在项目空间内读取和执行规则。除非用户明确要求维护 loop 本身，否则不要把该目录纳入业务文件清单、实现步骤、验证对账、标注覆盖或交付统计，也不要修改该目录。

不要把以下职责混在一起：

- 需求确认不等于任务拆分。
- 任务拆分不等于项目初始化。
- 项目初始化不等于页面实现。
- 页面实现不等于验证通过。
- 验证通过不等于标注提示词准备。
- 标注提示词准备不等于最终交付。

## 专门 Agent 调用原则

总控只在确有必要的高语义环节调用专门 Agent。允许强化专门 Agent 边界的阶段限定为 S1、S3、S6、S7、S9；具体阶段归属和技能路径仍以 `orchestrator/workflow.yaml` 的 `primary_worker` 为唯一源，不在本文件另建映射表。

其它阶段不新增专门 Agent：S0/S2 由总控处理，S4/S5 由既有技能和脚本完成，S8 调用验证 owner。专门 Agent 只做本阶段分析和产物生成，不推进阶段、不写运行状态、不宣布阶段通过。阶段边界仍由总控调用脚本完成。

## Token 分层加载原则

总控不得默认全量读取 loop 仓库或业务项目。默认只读取当前阶段所需的最小上下文：

- 总控常驻读取：`SKILL.md`、`orchestrator/workflow.yaml`、当前项目 `config/workflow.json`、当前项目 `memory/loop-status.md`。
- 阶段执行读取：只读取当前阶段技能声明的输入、当前阶段产物和脚本错误。
- 大型资料读取：优先读取 LLM WIKI 的 loop-context、项目记忆、来源记录和字段映射；只有缺口明确时才打开原始资料。
- 实现阶段读取：按当前执行步骤读取涉及文件，不按默认全项目扫描。

如果信息不足，总控应让对应阶段 Agent 明确说明缺口和需要补读的文件，而不是为了保险读取全量历史。

## 派发与推进

- 阶段 → 技能的唯一源是 `orchestrator/workflow.yaml` 的 `primary_worker`，由 `check_workflow_sync.py` 校验技能 `适用阶段` 与之一致。总控按当前阶段的 `primary_worker` 派发对应技能。
- `知识 / 验证 / 脚手架` 阶段：派发该阶段 primary_worker 指定的技能；技能只产出本阶段产物，不推进。
- `流程` 阶段（S0 路由、S2 计划门禁）：总控直接处理，不派发技能。
- S2 不能由完成命令自动代替 PM 确认。PM 明确确认后，总控先运行 approve-plan，写入迭代名、确认人、确认依据及启动规划和 CLAUDE.md 摘要；只有审批摘要仍与文件一致时才能完成 S2。
- **每个阶段边界由总控运行 `python3 tools/loop_run.py complete . --stage SN`**——技能一律不写 `complete`。脚本跑该阶段门禁：通过则推进；失败则总控按脚本提示定位回到哪个阶段/技能重做，不自行改状态。
- S7 实现由 `prototype-builder` 依据 S3 记忆、项目级 `CLAUDE.md` 和 S6 执行步骤构建；`prototype-verifier` 在 S7 作为单步验证支持，在 S8 作为全局验证 owner。
- loop 在 S9 收尾终检（`--preflight-stage final`）通过后结束。推送 GitHub 是 loop 外的**手工**步骤，见 `docs/pm-guide.md`。
- S9 后若 PM 手工回写标注，必须运行 approve-annotations 重跑 final 并刷新终态快照；只运行 check 不会恢复干净终态。

## LLM WIKI 输入

wiki 是独立知识库；loop 只消费它已物化的 query 输出（如 `outputs/*-loop-context.md`），**不把知识库复制进生成项目**。如何把 wiki 输出蒸馏进 `memory/source-materials.md` / `memory/field-map.md`、如何保留 `wiki_ref` / `status` / `coverage`、`partial` 资料如何处理，由 S3 技能 `memory-generator` 约定，总控不在此复述。

## 运行前读取

完整循环开始前，先读取 `orchestrator/workflow.yaml`、`orchestrator/artifacts.yaml`、`orchestrator/gates.yaml`。

已有项目继续迭代时，必须先完成 S0 路由协议中的 `--sync-runtime`。项目内 `tools/prototype-loop-orchestrator/` 只是上一次同步得到的可读副本，不能反向覆盖当前安装技能，也不能在未同步时作为最新规则来源。

需要解释性背景时，再按问题读取：

- `docs/loop-overview.md`：阶段说明。
- `docs/design-principles.md`：角色和架构边界。
- `docs/pm-guide.md`：产品经理视角。

## 调度方式

按 `orchestrator/workflow.yaml` 的阶段定义执行。总控不在本文件复述阶段门禁、产物要求或熔断阈值；这些规则由 `orchestrator/` 和生成项目内的 `tools/loop_run.py`、`tools/loop_preflight.py` 执行。

每个 loop 必须从 S0 起步。即使目标目录已有 `config/workflow.json`、`memory/stage-log.md`、历史缓存或上次运行记录，也必须先读取当前状态并确认 S0 已由 `tools/loop_run.py complete . --stage S0` 写入阶段日志；不能直接从 S4、S6 或实现阶段继续。若发现本地记录试图跳过 S0-S3，应回到 S0 重新启动，并让脚本按顺序推进。

本技能只负责：

- 判断用户是否要开始或继续一个 loop。
- 按当前阶段选择对应技能。
- 在阶段边界调用脚本，而不是手写阶段状态。
- 将脚本输出的状态、阻塞原因和下一步反馈给用户。

## 执行边界

- 需要阶段判断时，读取 `orchestrator/workflow.yaml`。
- 需要产物或门禁判断时，调用脚本或读取 `orchestrator/artifacts.yaml`、`orchestrator/gates.yaml`。
- 需要解释背景时，再读取 `docs/`。
- 如果本文件与 `orchestrator/` 不一致，以 `orchestrator/` 和生成项目内脚本为准。

如果脚本报告失败，总控只负责定位应回到哪个阶段或技能，不自行改写 `workflow.json`、`stage-log.md` 或伪造通过记录。
