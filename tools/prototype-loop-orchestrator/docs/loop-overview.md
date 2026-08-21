# Loop 概览

本文面向维护者，解释 S0-S9 的意图。运行时唯一控制源是：

- `orchestrator/workflow.yaml`
- `orchestrator/artifacts.yaml`
- `orchestrator/gates.yaml`
- `orchestrator/scripts/loop_run.py`
- `orchestrator/scripts/loop_preflight.py`

本文只做说明，不作为执行规则来源。

## 核心原则

脚本控制 loop，Agent 只完成每个阶段里的生成任务。

- 阶段推进由 `loop_run.py` 完成。
- 阶段门禁由 `loop_preflight.py` 完成。
- 状态机、产物和门禁先改 `orchestrator/`。
- 技能执行规则写在各技能目录的 `SKILL.md`。
- docs 只保留人类说明。

## 阶段

```text
S0 总控启动
S1 项目讨论
S2 计划门禁
S3 项目记忆生成
S4 项目初始化
S5 项目结构读取
S6 需求实现拆分
S7 实现与单步验证循环
S8 全局验证
S9 标注提示词准备
```

能力选择不再作为独立阶段。总控根据当前阶段从 `skill-library/` 运行时选择技能包；缺失能力写入 `memory/open-items.md` 或阶段日志，不单独推进一个 stage。

所有项目必须从 S0 开始由 `tools/loop_run.py complete . --stage S0` 写入阶段日志。不得因为目标目录已有缓存、历史 `workflow.json`、旧 `stage-log.md` 或生成脚本已创建项目结构而直接跳到 S4/S6/S7。S4 预检会检查 S0-S3 的阶段日志，缺失则阻塞。

S4 在生成项目内是结构确认阶段，不负责执行创建脚本。创建、迁移、底座裁剪和工具回灌由 loop 源仓库的 `skill-library/loop-project-scaffolder/scripts/create_project.py` 完成；生成项目 runtime package 只保留 S4 规则和调度上下文。

## 运行入口

生成项目后，常见阶段检查入口如下；实际可用门禁和阶段推进规则以 `orchestrator/` 和复制到项目内的 `tools/loop_run.py` 为准：

```bash
python3 tools/loop_run.py check . --preflight-stage s4
python3 tools/loop_run.py check . --preflight-stage s6
python3 tools/loop_run.py check . --preflight-stage s7
python3 tools/loop_run.py check . --preflight-stage s8
python3 tools/loop_run.py check . --preflight-stage s9
python3 tools/loop_run.py check . --preflight-stage final
```

> `final` 是 S9 完成时的收尾终检（全量交付物可追溯性检查）；loop 无独立交付阶段，GitHub 推送是 loop 外手工步骤——这就是 `gates.yaml` 有 `final` 而 `workflow.yaml` 无 S10 的原因。

阶段完成入口示例：

```bash
python3 tools/loop_run.py complete . --stage S6 --output-artifacts "memory/task-plan.md, memory/execution-steps.md, memory/acceptance-map.md"
```

S2 的 PM 确认是独立的 approve-plan 动作，不由 complete 自动生成。已完成项目开始新一轮时使用 begin-iteration；手工回写标注后使用 approve-annotations。三者都会执行确定性状态处理，不能靠手改 workflow.json 代替。

这些示例只用于帮助维护者理解脚本入口，不替代 `orchestrator/` 中的控制配置。

## 字段级资料链路

字段级资料链路的设计意图是：如果输入包含 API 文档、字段表、参考项目数据结构或截图字段，项目应把字段事实整理到 `memory/field-map.md`，供拆分、验证和标注追溯使用。

- `memory/project-startup-plan.md` 记录 S1 启动规划，S2 后冻结为只读溯源。
- `CLAUDE.md` 记录 S2 后的项目级执行规则和记忆引用。
- `memory/project.md`、`memory/business-rules.md` 和 `docs/decisions.md` 记录 S3 后的当前项目事实。
- `memory/source-materials.md` 记录资料来源。
- `memory/stage-log.md` 记录阶段完成。
- `memory/loop-status.md` 记录面向 PM 的当前状态和下一步。
- `memory/circuit-state.json` 记录熔断状态。
- `SRC-*` 记录来源。
- `FLD-*` 记录字段事实。
- `execution-steps.md` 引用 `FLD-*`。
- `memory/annotation-prompt.md` 保存可由 PM 手动投喂给标注生成器的提示词。
- `memory/annotation-coverage.md` 记录标注提示词覆盖的页面、验收项、来源和字段。
- 如果 PM 手动生成并回写 annotations.js，approve-annotations 会重新执行交付门禁，校验 sourceRefs、锚点语义合同、fieldRefs 和逐字段定义/逻辑，并刷新终态快照。

这条链路用于避免拆分过粗、标注泛化或出现“待确认”。

## LLM WIKI 资料输入

独立 LLM WIKI 可在 S1/S3 作为资料获取来源。loop 不直接依赖 wiki 目录结构，只消费已经物化的 query 输出，并写入生成项目：

- `memory/project-startup-plan.md`：记录是否调用 wiki、查询范围和预期写入位置。
- `memory/source-materials.md`：记录 wiki 输出、原始来源、状态和覆盖范围。
- `memory/field-map.md`：记录字段、枚举、页面落点、展示规则和空值规则。
- `memory/open-items.md`：把 `partial`、待核对或范围缺口交给 PM 确认。
