---
name: prototype-verifier
description: PM 原型 loop 的验证协调技能。Use after each implementation step and after all steps complete, to run step-level or global prototype verification with browser checks, completion gates, failure classification, and verification logs.
---

# 原型验证协调器

使用本技能，在 S7 作为单步验证支持，在 S8 作为全局验证 owner。

本技能在 S7 支持模式下拥有 `memory/verification-log.md` 和 `memory/circuit-state.json` 的写入职责；`prototype-builder` 不直接写这两个验证/熔断文件。

本技能是验证判断和日志记录 owner，不替代具体浏览器工具。需要页面、DOM、交互、资源或截图证据时，应调用工具型 support skill `playwright-cli` 采集证据；`playwright-cli` 不写验证结论、不写 `verification-log.md`。需要完成前门禁时，应调用 `superpowers-pm-prototype/skills/verification-before-completion`。验证失败且原因不清时，应调用 `superpowers-pm-prototype/skills/systematic-debugging`。

## 适用阶段

- S8 全局验证

## 支持调用阶段

- S7 实现与单步验证循环（由 `prototype-builder` 在每个步骤完成后调用 step 单步验证模式）

## 模式

### step 单步验证

调用时机：每个 `memory/execution-steps.md` 步骤实现完成后立即调用。

调用前必须确认 `python3 tools/loop_run.py check . --preflight-stage s7` 已通过。

输入：

- 当前步骤 ID 和名称
- 当前步骤目标
- 当前步骤修改文件
- 当前步骤验收标准
- 当前步骤声明的验证方式
- 当前步骤声明的验证技能
- 当前步骤连续失败次数
- `memory/circuit-state.json`

必须检查：

- 步骤声明文件已按预期修改。
- 当前步骤声明文件不包含 `tools/prototype-loop-orchestrator/`，除非任务明确是维护 loop 本身。
- 当前步骤验收标准逐项有结果。
- 当前步骤要求的页面可以打开。
- 当前步骤相关 DOM、数据或交互状态符合预期。
- 当前步骤相关资源没有阻塞性 404。
- 当前步骤没有新增阻塞性 console error。
- `memory/change-log.md` 已记录本步骤变更。
- 验证证据来自当前项目本地页面或当前项目文件。
- 验证失败时已更新 `memory/circuit-state.json` 中对应 step/checkpoint 的连续失败次数。
- 验证通过时已重置 `memory/circuit-state.json` 中对应 step/checkpoint 的连续失败次数。

输出：

- 追加 `memory/verification-log.md`
- 更新 `memory/circuit-state.json`
- 所有执行步骤验证通过后，把"单步验证全部通过"反馈给总控，由总控完成 S7 推进（技能不写 `complete`）
- 必要时更新 `memory/open-items.md`

单步验证日志必须包含：

- 步骤 ID
- 验证时间
- 验证范围：step 或 global
- 本地 URL 或文件路径
- 调用的验证技能或工具
- 浏览器证据来源（如使用 `playwright-cli`，记录 url、viewport、action、observed、console、network）
- 验证命令或检查动作
- 通过项
- 失败项
- 连续失败次数
- 证据摘要
- 结论：pass 或 fail

门禁：

- `fail` 时不能进入下一步骤。
- 没有验证日志时视为未验证。
- 只有外部文档、第三方网站或无关浏览器日志时，视为未验证。
- 验证失败但原因不明时，调用 `systematic-debugging` 定位失败类型。
- 同一检查点连续失败达到控制层熔断阈值时，必须生成错误状态转储并暂停自动重试。
- 熔断判断必须读取 `memory/circuit-state.json`，不能只依赖当前对话上下文。

错误状态转储必须包含：

- 当前步骤 ID
- 失败检查点
- 最近修改文件
- 最近错误信息
- 已尝试修复摘要
- 建议回流阶段

### global 全局验证

调用时机：所有执行步骤都已完成并通过单步验证后。

调用前必须运行 `python3 tools/loop_run.py check . --preflight-stage s8`；不通过时，先补齐验证日志、变更记录或追溯关系，不能开始全局验证。

输入：

- `memory/execution-steps.md`
- `memory/acceptance-map.md`
- `memory/verification-log.md`
- `memory/circuit-state.json`
- 项目入口页面
- 核心导航和核心用户路径

必须检查：

- 所有步骤都有单步验证 pass 记录。
- 验证日志中不得出现未定义在 `memory/execution-steps.md` 的步骤 ID。
- `Failed` 非空时，不能写 `Result: pass`。
- 入口页面加载成功。
- 本地资源没有阻塞性 404。
- JavaScript 没有阻塞性语法或运行错误。
- 核心导航可用。
- “原型页面 / 说明文档 / 业务流程图 / 时序交互图 / 关联系统展示”五个交付视图在桌面端和移动端可见，并在当前页面内切换；切换后外层页面不跳转，hash 与选中项一致，嵌入页不重复生成顶部导航。
- 业务流程图直接加载 `flowcharts/business-process.html`，至少包含角色泳道、两个业务节点和一条流转关系；时序交互图直接加载 `flowcharts/sequence-interaction.html`，至少包含两个参与者和一条消息，并与项目记忆和核心用户路径一致。
- 关联系统展示直接加载 `related-systems/index.html`；有关联系统时逐项展示其角色和关系，没有关联系统时允许明确空态。三类页面均不得依赖 ProcessOn 或远程 iframe。
- 核心用户路径可走通。
- 核心数据渲染符合验收标准。
- `memory/execution-steps.md`、`memory/change-log.md` 和实际修改文件一致，或差异已解释。
- 对账时默认排除 `tools/prototype-loop-orchestrator/`；该目录只作为项目内总控工具包记录存在，不计入业务交付差异。
- 桌面端和移动端布局可接受。
- 标注运行时兼容，且不会破坏页面交互。

输出：

- 追加 `memory/verification-log.md`
- 更新 `memory/acceptance-map.md`（按全局验收结果标记验收项状态）
- 全局验证通过后，把"全局验证通过"反馈给总控，由总控完成 S8 推进（技能不写 `complete`）
- 输出全局验证摘要

门禁：

- 全局验证失败时，不能进入 S9 标注提示词准备。
- 全局验证未通过时，不能进入 S9 标注提示词准备；通过后把结果反馈给总控，由总控推进（技能不写 `complete`）。
- 如果失败可定位到具体步骤，回到 S7 修复该步骤。
- 如果失败来自拆分遗漏或验收错误，回到 S6 修订拆分。

## 禁止事项

- 不用“看起来没问题”替代检查结果。
- 不用旧验证结果证明当前修改。
- 不用外部文档页面或无关浏览器日志证明当前项目通过。
- 不在单步验证失败时继续下一步骤。
- 不在全局验证失败时生成最终标注。
- 不在同一检查点连续失败 3 次后继续自动重试。
- 不把项目内总控工具包当成业务原型交付内容验证。
- 不把熔断计数只保存在对话上下文里。
