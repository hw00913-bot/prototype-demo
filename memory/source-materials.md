# 资料记录

> 本轮资料均来自已冻结的“智能外呼中台充值功能迭代”需求包和 S2 已确认启动规划。需求、验收、验证、交互说明和标注提示词必须引用 SRC-*，不能只依赖聊天上下文。

## Sources

| Source ID | Type | Title | Received At | Key Points | Status / Coverage | Used In |
| --- | --- | --- | --- | --- | --- | --- |
| SRC-019 | User correction | 四项修正：试用套餐、管理员首页、标注及计算逻辑 | 2026-09-05 | 渝发试用首页不得显示标准版；其他管理员显示本租户套餐但无充值权限；明确解决标注未显示，作为当前空骨架完整回写触发；计算文档同步现行规则 | confirmed / full；保留SRC-018菜单演示差异 | STEP-19、D-018、BR-020、R-033、全量v3.3、迭代v1.8、计算v2.0与正式标注 |

SRC-016 指定创建租户、充值、调增调减由超级管理员操作；SRC-015 无历史兼容与 SRC-014 试用/商用互斥配置继续有效。

最新依据 SRC-013 优先于 SRC-012 及冻结包中的套餐范围；冻结包原图作为原始分析版本复用，不回写。

| Source ID | Type | Title | Received At | Key Points | Status / Coverage | Used In |
| --- | --- | --- | --- | --- | --- | --- |
| SRC-001 | Frozen package | 智能外呼中台充值功能迭代 prototype input v0.1.0 | 2026-09-04 | G1/G2/G3 已批准；36 个文件带 SHA-256；verification_status=pass | confirmed / full | 全部 S3 记忆、S6 拆分、S8 验证 |
| SRC-002 | User requirements | 用户故事原始输入与确认批次 UA-20260904-001~008 | 2026-09-04 | 充值而非重置；统一分钟池；内部流水；天数/分钟可编辑；调增调减；当前租户两级用量 | confirmed / full | project、rules、fields、acceptance |
| SRC-003 | Screenshot | AI 智能外呼套餐与话费充值包规则图 | 2026-09-04 | 标准版 5,000 元/店、年包、10,000 分钟；充值包 1,000 元/包、3,500 分钟；服务与话术说明 | confirmed except exact 50% boundary / partial | 套餐展示、默认值、OI-003 |
| SRC-004 | Structured baseline | project-facts.json 与 business-rules.json | 2026-09-04 | 角色、系统边界、产品结构、3 条业务流、14 条规则和 3 个状态模型 | confirmed / full | project、business-rules、flows |
| SRC-005 | Page plan | page-index.json 与 menu-and-page-planning-reference.md | 2026-09-04 | 6 个页面/弹窗、15 个动作、页面状态、字段、权限和验收点 | confirmed / full | field-map、task plan、acceptance map |
| SRC-006 | Business flows | business-scenario-atlas.html 与 scenarios/SC-*.json | 2026-09-04 | 7 个本期场景泳道、主路径与异常路径，几何审计 7/7 pass | confirmed / full | business-process、execution steps |
| SRC-007 | Interaction sequences | interaction-sequence-atlas.html 与 sequences/SEQ-*.json | 2026-09-04 | 7 个场景时序；充值、账本、任务、使用情况之间的交互顺序 | confirmed / full | sequence-interaction、verification |
| SRC-008 | Existing baseline | current-feature-baseline.md | 2026-09-04 | 现有租户充值入口、3 个旧 Tab、D智链依赖、大小模型分池旧口径及历史租户抽屉报错 | mixed / full baseline | compatibility、OI-005 |
| SRC-009 | Verification | verification-report.json 与 traceability.json | 2026-09-04 | 9/9 用户故事、7/7 场景时序、6/6 UI、117 条追溯关系；0 error/0 warning | verified / full | S3 复核、S8 验证 |
| SRC-010 | Interface decision | interface-index.json 与接口核验矩阵 | 2026-09-04 | D智链外部充值单读取与关联为 not_required；本期无外部接口依赖 | confirmed / full | scope、rules、related systems |
| SRC-011 | Approved startup plan | memory/project-startup-plan.md | 2026-09-04 | 基于现有底座迭代、6 个页面、默认风险处理、人工标注策略和本地交付方式 | PM approved / full | 全部下游阶段 |
| SRC-012 | User review | 用户五项评审反馈及冻结结算展示区截图 | 2026-09-05 | 删除冻结结算展示区；试用租户套餐开通；套餐价格可编辑；使用情况移入账户下拉；首页改为新版分钟池 | confirmed / full；试用沿用已确认同套餐口径 | 首页、充值、账户菜单、字段、验证、交互说明 |
| SRC-013 | User correction | 原图复用与试用租户独立使用套餐 | 2026-09-05 | 两图使用需求分析原始产出；新增使用套餐，0 元/30 天/500 分钟且可编辑 | confirmed / full；覆盖 SRC-012 同套餐假设 | 原图交付、充值、首页产品名称、规则、字段、验证 |

| SRC-017 | User request | 非超管验证账号及版本规则标注说明同步 | 2026-09-05 | 提供非超管账号验证首页和使用情况，将本次更新写入说明文档版本说明，并同步规则与标注说明 | confirmed / full；正式红点重建另行确认 | STEP-17、D-016、R-031、验证入口及说明 |

## 资料使用约束

| Source ID | Type | Title | Received At | Key Points | Status / Coverage | Used In |
| --- | --- | --- | --- | --- | --- | --- |
| SRC-018 | User correction and original document | 保留全量说明与租户管理权限演示差异 | 2026-09-05 | 用户确认不改当前菜单权限逻辑，须注明超管专属及原型限制；原全量Markdown与HTML未删除，五.7是原有权限唯一维护出处，恢复原入口并增量补记本轮规则 | confirmed / full | STEP-18、D-017、BR-019、R-032、全量说明v3.2与迭代说明v1.7 |

| Source ID | Type | Title | Received At | Key Points | Status / Coverage | Used In |
| --- | --- | --- | --- | --- | --- | --- |
| SRC-014 | User correction | 试用套餐正名与按租户类型显示配置 | 2026-09-05 | 试用租户仅试用套餐；商用租户显示商用配置；“使用”纠正为“试用” | confirmed / full | 租户充值入口、类型、校验、首页名称、说明及验收 |
| SRC-015 | User review | 取消历史兼容数据功能 | 2026-09-05 | 旧功能未发布到生产环境，无历史兼容及迁移需求 | confirmed / full | STEP-14、D-014、R-029、充值管理与说明 |
| SRC-016 | User correction | 管理操作归属超级管理员 | 2026-09-05 | 创建租户、充值、手工调增调减统一由超级管理员执行；超管不查看使用明细的规则不变 | confirmed / full | STEP-16、D-015、R-030、角色校验和操作人 |

- SRC-012 是 2026-09-05 的原型评审修正，涉及范围内优先于冻结启动快照，冻结快照保持原文。

- 冻结需求包是来源基线，不在原型 Loop 内回写。
- SRC-003 的“正好 50%”存在歧义，只能进入 OI-003；页面可展示规则说明但不得实现判定。
- SRC-008 只描述底座现状，凡与 SRC-001~007 的新需求冲突，以冻结新需求为准。
- SRC-015 取消历史兼容及迁移，覆盖原只读兼容假设；当前内部充值、调整、冻结结算保留。
- 本轮未调用 LLM WIKI，没有 wiki_ref、raw_ref 或 partial wiki 资料。
