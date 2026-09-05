# 当前标注生成说明 · SRC-019 / Step 19，SRC-020 / Step20维护

SRC-020 / D-019 / BR-021 / R-034：在Step20业务25项和五视图全局验证通过后，仅维护已验收的本轮正式标注26、29、31、33及现行文档版本。使用时长调减可归0，归零后服务到期并禁止新外呼；分钟余额与已有冻结结算保留。保留全部48个编号与锚点，不读取或继承历史标注。

## 手动标注提示词

为当前智能外呼充值迭代48个业务锚点完整生成正式标注。用户明确要求解决标注未显示（SRC-019），作为当前空骨架回写触发。只用下列当前已验证事实；不得读取历史标注、浏览器缓存、旧导出JSON或历史提示词。范围只含index、home、sys-tenant、usage，不标注docs、flowcharts、related-systems或工具包。

## 标注输入资料

- memory/project.md、memory/business-rules.md、memory/field-map.md、memory/source-materials.md、docs/decisions.md：当前事实以D-019/SRC-020及各已确认最新评审为准。
- memory/execution-steps.md、memory/change-log.md、memory/verification-log.md及当前验收：Step19正式回写已验收；Step20与当前global通过后维护同一归零规则，再复验标注。
- memory/project-startup-plan.md只读溯源；旧角色、同套餐和兼容假设已由后续评审覆盖，不复制为现行事实。本项目非新式imported模式，不伪造feature-list或基线指纹。
- 唯一权限出处docs/功能说明文档.html#sub-23；当前摘要#sub-24、docs/interaction.html v1.9及docs/计算逻辑.html v2.1。
- 当前修改：js/pages/sys-tenant.js、index.html、三份说明、当前正式标注及对应记忆；无冻结原图或菜单隔离改动。
- 来源：SRC-001、SRC-002、SRC-003、SRC-004、SRC-005、SRC-006、SRC-007、SRC-008、SRC-009、SRC-010、SRC-011、SRC-012、SRC-013、SRC-014、SRC-015、SRC-016、SRC-017、SRC-018、SRC-019、SRC-020。
- 字段：FLD-001、FLD-002、FLD-003、FLD-004、FLD-005、FLD-006、FLD-007、FLD-008、FLD-009、FLD-010、FLD-011、FLD-012、FLD-013、FLD-014、FLD-015、FLD-016、FLD-017、FLD-018、FLD-019、FLD-020、FLD-021、FLD-022、FLD-023、FLD-024、FLD-025、FLD-026、FLD-027、FLD-028、FLD-029、FLD-030、FLD-031、FLD-032、FLD-033、FLD-034、FLD-035、FLD-036、FLD-037、FLD-038、FLD-039、FLD-040、FLD-041、FLD-042、FLD-043、FLD-044、FLD-045、FLD-046、FLD-047、FLD-048、FLD-049、FLD-050、FLD-051。
- 验收：R-001、R-002、R-003、R-004、R-005、R-006、R-007、R-008、R-009、R-010、R-011、R-012、R-013、R-014、R-015、R-016、R-017、R-018、R-019、R-020、R-021、R-022、R-023、R-024、R-025、R-026、R-027、R-028、R-029、R-030、R-031、R-032、R-033、R-034。R-015按SRC-015/D-014取消；其余通过项保留原AC/SC/PAGE/ACTION追溯，不仅引用R编号。

### 当前关键事实

试用租户仅试用套餐0元/30天/500分钟；商用仅标准版5000元/365天/10000分钟和话费包1000元/包、3500分钟/包。总价≥0且最多2位小数，天数/分钟/包数正整数，偏离默认值必填原因。实际值独立保存，包数变化保留已手改值。话费包天数不超过剩余服务天数，不改原到期日或当前服务套餐，原型不实现逐包过期扣回。

渝发显示试用套餐并保留手改120天、7800可用分钟。其他管理员演示绑定渝发，只读当前授权租户首页，无创建/充值/调整或使用明细权限；超管为平台工作台且无用量明细。普通/多租户从账户下拉查看当前租户使用情况，日汇总等于任务合计，缺有效上下文时不回退其他租户。

时长调整作用于配置总天数（最低0）和原到期日，归零后服务到期并禁止新外呼，分钟余额和已有冻结结算保留；调整量仍须正整数；分钟调整作用于可用余额（最低0）且不改冻结；版本冲突刷新后再确认。可用余额已经排除冻结，不二次扣冻或按价格换算。未接通0；已接通max(1,ceil(秒/60))，先每通取整再求和。结算A'=A+E-S、F'=F-E、C'=C+S，不足补扣拒绝且保留冻结，重复回调幂等。

租户管理正式规则是超管专属，当前菜单/页面未全面隔离，必须注明演示差异。旧金额说明和原始分析图不是当前充值外部依赖。所有数据来自智能外呼中台本地Mock模拟，不宣称接通生产支付、账本、权限或接口。只写当前真实加载、空态、过期、冲突、失败和重试行为。

### 当前来源记录

# 资料记录

> 本轮资料均来自已冻结的“智能外呼中台充值功能迭代”需求包和 S2 已确认启动规划。需求、验收、验证、交互说明和标注提示词必须引用 SRC-*，不能只依赖聊天上下文。

## Sources

| Source ID | Type | Title | Received At | Key Points | Status / Coverage | Used In |
| --- | --- | --- | --- | --- | --- | --- |
| SRC-020 | User correction | 使用时长调减允许归0 | 2026-09-05 | 用户确认“改成可以归0”；纠正额外1天下限，归零后服务到期并禁止新外呼，分钟余额和既有冻结结算保留；不放宽充值输入与调整量正整数要求 | confirmed / full | STEP-20、D-019、BR-021、R-034、当前文档及标注规则维护 |
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


### 当前字段事实

# 字段映射

> 字段事实来自冻结需求包和 S2 已确认启动规划。每个字段同时记录业务定义、取值逻辑、格式、枚举、空值与错误规则，供页面、验收、验证和人工标注复用。

## Fields

| Field ID | Source ID | Page / Area | API / Data Field | Display Name | Business Definition | Value Logic | Display Format | Enum / Mapping | Empty / Error Rule | Annotation Point | Used In |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FLD-001 | SRC-005 | PAGE-001/PAGE-002 | tenant.id | 租户 ID | 充值、额度、流水和用量隔离的租户唯一标识 | 直接取当前列表行或登录态中的 tenant.id；用量页不得接受任意租户覆盖 | 文本 | 无 | 缺失时禁止进入充值或用量查询 | tenant-id | AC-023、AC-033 |
| FLD-002 | SRC-005 | PAGE-001/PAGE-002/PAGE-005 | tenant.name | 租户名称 | 供管理员和租户用户识别当前账户主体 | 由 FLD-001 关联租户资料直接取得 | 文本 | 无 | 缺失显示“未知租户”并阻止提交 | tenant-name | AC-002、AC-019 |
| FLD-003 | SRC-002 | PAGE-001/PAGE-002 | tenant.commercialFlag | 商用/试用标记 | 只用于识别租户是商用还是试用，不参与计费 | 创建或编辑时选择，列表和充值管理直接映射展示 | 标签 | commercial=商用；trial=试用 | 创建/编辑未选择时阻止保存 | tenant-commercial-flag | AC-001~AC-003 |
| FLD-004 | SRC-019 | PAGE-005/PAGE-006 | auth.currentTenantId | 当前登录租户 | 当前会话所在租户，是首页套餐和用量查询的唯一租户边界 | 首页读取登录态并校验授权租户集合；使用情况只取会话当前租户且拒绝异租户参数，不由页面指定任意租户 | 文本/标签 | 无 | 缺失或不一致时拒绝返回数据 | current-tenant | AC-023、AC-026 |
| FLD-005 | SRC-019 | Global header | auth.role | 当前账号角色 | 决定使用情况入口和管理操作是否可见 | 读取登录态；super_admin可创建、充值和调整；tenant_user看当前租户首页和用量；绑定当前租户的recharge_admin仅看该租户首页 | 标签 | super_admin=超级管理员；tenant_user=租户用户；recharge_admin=其他管理员（无充值权限） | 未知角色按无权限处理；创建、充值、调整非超管拒绝 | account-role | AC-019、AC-026 |
| FLD-006 | SRC-004 | PAGE-001/PAGE-002/PAGE-005 | entitlement.status | 服务状态 | 表示租户 AI 服务是否未开通、有效或已过期 | 根据生效时间、失效时间和当前模拟日期计算 | 状态标签 | not_opened=未开通；active=有效；expired=已过期 | 无时间数据时显示“未开通” | service-status | AC-004、AC-020 |
| FLD-007 | SRC-005 | PAGE-002/PAGE-005 | entitlement.effectiveAt | 生效时间 | 当前服务期开始生效的时间 | 首次开通取提交成功时间；已有权益直接读取 | YYYY-MM-DD HH:mm | 无 | 未开通显示“—” | effective-at | AC-004、AC-020 |
| FLD-008 | SRC-005 | PAGE-002/PAGE-005 | entitlement.expiresAt | 失效时间 | 当前服务期结束时间 | 由 FLD-007 加实际使用天数计算，已有权益直接读取 | YYYY-MM-DD HH:mm | 无 | 未开通显示“—”；过期使用警示色 | expires-at | AC-004、AC-020 |
| FLD-009 | SRC-020 | PAGE-003/PAGE-004 | entitlement.durationDays | 使用时长 | 本次充值或调整作用于服务期的天数 | 读取权益配置总天数；调减结果允许0，到期日同步加减；归零后服务到期，不动分钟或冻结 | 非负整数 + 天 | 无 | 调整量仍为正整数，调减不得超过当前总天数 | duration-days | AC-027、AC-030、AC-031 |
| FLD-010 | SRC-014 | PAGE-003 | recharge.type | 充值类型 | 区分标准版年包、话费充值包与试用专用试用套餐 | 由超级管理员单选，驱动默认价格、天数、分钟和数量字段 | 单选/标签 | standard_annual=标准版年包；call_credit_pack=话费充值包；trial_package=试用套餐（试用唯一选项）；其余两种仅商用 | 未选择或不属于当前租户类型时阻止提交；试用仅trial_package，商用仅另外两种（SRC-014） | recharge-type | AC-004、AC-008 |
| FLD-011 | SRC-003 | PAGE-003 | recharge.unitPrice | 套餐默认单价 | 商品给出的初始参考单价 | 标准版默认 5000；充值包默认 1000；试用套餐默认 0（SRC-013）；本次总价由 FLD-050 独立记录 | ¥#,##0.00 | standard_annual；call_credit_pack；trial_package | 未知类型禁止提交 | recharge-price-field | AC-005、AC-008、R-023 |
| FLD-012 | SRC-003 | PAGE-003 | recharge.packageQuantity | 充值包数量 | 本次购买的话费充值包个数 | 仅充值包模式由用户输入正整数；标准版与试用套餐固定为 1 或隐藏 | 正整数 + 包 | 无 | 非正整数阻止提交；标准版与试用套餐不展示 | package-quantity | AC-008、AC-010 |
| FLD-013 | SRC-003 | PAGE-003 | recharge.defaultDurationDays | 默认使用时长 | 商品规则提供的初始服务天数 | 标准版365；试用30；充值包为当前服务剩余天数，按剩余毫秒数除86400000向上取整 | 正整数 + 天 | 标准版=365；试用套餐=30；充值包=剩余服务天数 | 缺失时禁止生成预览 | default-duration | AC-004、AC-027 |
| FLD-014 | SRC-002 | PAGE-003 | recharge.actualDurationDays | 实际使用时长 | 本次充值写入流水的实际天数；标准版/试用套餐用于开通服务期，话费包不延长原服务期 | 初始化为默认天数，允许编辑并记录提交值；话费包不得超过剩余服务天数 | 正整数 + 天 | 无 | 非正整数阻止提交 | actual-duration | AC-027~AC-030 |
| FLD-015 | SRC-003 | PAGE-003 | recharge.defaultCreditMinutes | 默认入账分钟 | 商品规则提供的默认分钟数 | 标准版固定 10000；试用套餐固定 500（SRC-013）；充值包为 FLD-012 × 3500 | 整数 + 分钟 | 无 | 计算失败时阻止提交 | default-minutes | AC-006、AC-009 |
| FLD-016 | SRC-002 | PAGE-003 | recharge.actualCreditMinutes | 实际入账分钟数 | 充值成功后实际增加到统一分钟池的分钟数 | 初始化为 FLD-015，允许用户编辑，成功后加入 FLD-021 | 正整数 + 分钟 | 无 | 非正整数阻止提交 | actual-credit-minutes | AC-027~AC-030、AC-036 |
| FLD-017 | SRC-012 | PAGE-003 | recharge.deviationReason | 偏离默认值原因 | 解释本次价格、天数或分钟与默认值的差异 | 任一实际值与默认值不同时必填 | 多行文本 | 无 | 有偏离且为空时阻止提交；无偏离写使用默认值 | recharge-reason-field | AC-030、R-023 |
| FLD-018 | SRC-005 | PAGE-003 | recharge.previewEffectiveAt | 预计生效时间 | 提交成功后服务权益的预计生效起点 | 标准版/试用首次或过期重开取提交模拟时间；话费包预览沿用原服务生效时间，不重置为本次入账时间 | YYYY-MM-DD HH:mm | 无 | 预览不可计算时显示错误 | preview-effective-at | AC-004、AC-028 |
| FLD-019 | SRC-005 | PAGE-003 | recharge.previewExpiresAt | 预计失效时间 | 按实际使用时长计算的预计服务终点 | 标准版/试用为预计生效时间加实际天数；话费包沿用原服务到期日，不按输入天数重算 | YYYY-MM-DD HH:mm | 无 | 计算失败时不允许确认 | preview-expires-at | AC-004、AC-028 |
| FLD-020 | SRC-005 | PAGE-002/PAGE-003/PAGE-004 | minutePool.availableBefore | 调整前可用分钟 | 当前操作发生前可继续使用的统一分钟余额 | 从选中租户 MinutePool 快照直接取得 | #,##0 分钟 | 无 | 缺失时禁止充值/调整提交 | pool-before | AC-018、AC-033 |
| FLD-021 | SRC-004 | PAGE-001/PAGE-002/PAGE-003/PAGE-005 | minutePool.availableMinutes | 可用分钟数 | 当前租户统一分钟池中可继续用于外呼的余额 | 充值后=FLD-020+FLD-016；手工调整后按方向增减；任务结算后扣减实际消耗并释放剩余冻结 | #,##0 分钟 | 无 | 加载失败显示错误；不得为负数 | available-minutes | AC-018、AC-021、AC-034、AC-036 |
| FLD-022 | SRC-004 | PAGE-002 | minutePool.frozenMinutes | 冻结分钟 | 已被外呼任务预占但尚未结算或释放的分钟 | 汇总所有活跃冻结记录 | #,##0 分钟 | 无 | 无冻结显示 0；调整不得直接修改 | frozen-minutes | AC-011、AC-015、AC-034 |
| FLD-023 | SRC-004 | PAGE-002/PAGE-005 | minutePool.consumedMinutes | 已消耗分钟 | 已按接通规则结算的通讯分钟累计值 | 汇总已结算通话；单次接通不足 1 分钟按 1 分钟 | #,##0 分钟 | 无 | 无消耗显示 0 | consumed-minutes | AC-012~AC-014 |
| FLD-024 | SRC-002 | PAGE-002 | rechargeRecord.internalNo | 内部流水号 | 中台为新充值自动生成的唯一审计编号 | 成功写账时按本地规则生成，不依赖外部单号 | 文本，如 RC202609040001 | 无 | 写账失败不得生成成功编号 | internal-recharge-no | AC-016、AC-018、AC-029 |
| FLD-025 | SRC-002 | PAGE-002 | rechargeRecord.tenantId | 流水租户 | 内部充值记录所属租户 | 直接写入当前选中 FLD-001 | 文本 | 无 | 缺失时整笔写账失败 | record-tenant | AC-018 |
| FLD-026 | SRC-002 | PAGE-002 | rechargeRecord.productType | 充值类型 | 内部流水对应的商品或调整类别 | 由 FLD-010 映射；手工调整使用独立记录类型 | 标签 | 标准版年包；话费充值包；试用套餐；手工调整 | 未知值显示“未知类型” | record-type | AC-018、AC-033 |
| FLD-027 | SRC-002 | PAGE-002 | rechargeRecord.quantity | 数量 | 本次商品购买数量 | 标准版与试用套餐取 1；充值包取 FLD-012；手工调整不适用 | 正整数 | 无 | 不适用显示“—” | record-quantity | AC-018 |
| FLD-028 | SRC-012 | PAGE-002 | rechargeRecord.price | 实际充值总价 | 本次充值成功后用于审计的实际金额 | 直接保存提交的 FLD-050，另以 defaultPrice 保留默认总价 | ¥#,##0.00 | 无 | 0 元显示 ¥0.00；手工调整或字段缺失显示 — | internal-recharge-table | AC-018、R-023 |
| FLD-029 | SRC-002 | PAGE-002 | rechargeRecord.beforeValue | 调整前值 | 本次操作前目标账户字段的值 | 充值分钟取 FLD-020；时长操作取当前权益值 | 数值 + 单位 | 天或分钟 | 字段缺失显示“—” | record-before | AC-018、AC-033 |
| FLD-030 | SRC-002 | PAGE-002 | rechargeRecord.afterValue | 调整后值 | 本次操作成功后目标账户字段的值 | 根据充值或调整规则由 beforeValue 计算 | 数值 + 单位 | 天或分钟 | 失败记录显示预计值或“未生效” | record-after | AC-018、AC-033 |
| FLD-031 | SRC-002 | PAGE-002 | rechargeRecord.operatorName | 操作人 | 发起充值或手工调整的账号名称 | 从当前登录态直接写入 | 文本 | 无 | 缺失时显示账号 ID，仍需保留追溯 | record-operator | AC-018、AC-033 |
| FLD-032 | SRC-002 | PAGE-002 | rechargeRecord.operatedAt | 操作时间 | 操作提交或生效的时间戳 | 成功或失败写账时取系统模拟时间 | YYYY-MM-DD HH:mm:ss | 无 | 不允许为空 | record-time | AC-018、AC-033 |
| FLD-033 | SRC-002 | PAGE-002 | rechargeRecord.reason | 记录原因 | 偏离默认值或手工调整的审计说明 | 充值取 FLD-017；手工调整取 FLD-038；无偏离写“使用默认值” | 文本 | 无 | 需填写场景为空时阻止提交 | record-reason | AC-018、AC-030、AC-033 |
| FLD-034 | SRC-004 | PAGE-002 | rechargeRecord.status | 流水状态 | 表示内部充值或调整是否已生效 | 按编辑、校验、处理、写账结果映射 | 状态标签 | processing=处理中；effective=已生效；failed=失败 | 未知状态显示“状态异常” | record-status | AC-017、AC-018 |
| FLD-035 | SRC-005 | PAGE-004 | adjustment.direction | 调整方向 | 指定增加或减少目标账户值 | 由超级管理员必选 | 单选/标签 | increase=调增；decrease=调减 | 未选择阻止提交 | adjustment-direction | AC-031、AC-035 |
| FLD-036 | SRC-005 | PAGE-004 | adjustment.target | 调整对象 | 指定本次作用于使用时长或可用分钟 | 由超级管理员必选并决定单位和边界 | 单选/标签 | duration_days=使用时长；available_minutes=可用分钟 | 未选择阻止提交 | adjustment-target | AC-031、AC-035 |
| FLD-037 | SRC-005 | PAGE-004 | adjustment.value | 调整值 | 本次对目标字段增加或减少的绝对数值 | 用户输入正整数；根据 FLD-035 决定加减 | 正整数 + 天/分钟 | 单位随 FLD-036 | 非正整数阻止提交 | adjustment-value | AC-031、AC-035 |
| FLD-038 | SRC-005 | PAGE-004 | adjustment.reason | 调整原因 | 手工调整必须保留的审计说明 | 用户必填并写入调整流水 | 多行文本 | 无 | 为空阻止提交 | adjustment-reason | AC-033、AC-035 |
| FLD-039 | SRC-020 | PAGE-004 | adjustment.maxDecrease | 可调减上限 | 不修改冻结记录前提下允许减少的最大值 | 分钟上限=当前可用分钟；时长上限=当前配置总天数，允许调减归0 | 数值 + 单位 | 天或分钟 | 无可调空间时拒绝调减，可切换调增 | max-decrease | AC-034 |
| FLD-040 | SRC-004 | PAGE-004 | adjustment.accountVersion | 账户版本 | 用于判断预览后账户是否被并发修改 | 打开弹窗时读取，提交时与最新版本比对 | 文本/隐藏 | 无 | 不一致进入 conflict 并要求刷新 | account-version | SC-009 ALT-004 |
| FLD-041 | SRC-005 | PAGE-005 | usage.date | 日期 | 一级使用明细的自然日汇总维度 | 由已结算通话记录按当前租户和日期分组 | YYYY-MM-DD | 无 | 无记录时展示空状态 | usage-date | AC-022、AC-025 |
| FLD-042 | SRC-005 | PAGE-005 | usage.dailyConsumedMinutes | 当日消耗通话分钟 | 当前租户某日所有任务已结算通讯分钟之和 | 对同日 FLD-045 求和，未接通不计入 | #,##0 分钟 | 无 | 无数据不生成伪记录 | daily-consumed | AC-022、AC-025 |
| FLD-043 | SRC-005 | PAGE-006 | taskUsage.taskId | 任务标识 | 产生当日通话消耗的外呼任务唯一标识 | 从当前租户、选中日期的结算记录直接取得 | 文本 | 无 | 缺失时以记录 ID 兜底并标异常 | task-id | AC-025 |
| FLD-044 | SRC-005 | PAGE-006 | taskUsage.taskName | 任务名称 | 便于租户用户识别消耗来源的外呼任务名称 | 由 FLD-043 关联任务资料 | 文本 | 无 | 缺失显示“未命名任务” | task-name | AC-025 |
| FLD-045 | SRC-005 | PAGE-006 | taskUsage.consumedMinutes | 任务消耗通话分钟 | 单个任务在所选日期从统一分钟池结算的分钟 | 汇总该任务当日所有已接通通话的计量分钟 | #,##0 分钟 | 无 | 无消耗不展示任务行 | task-consumed | AC-025 |
| FLD-046 | SRC-005 | PAGE-006 | taskUsage.dailyTotal | 当日合计 | 二级任务明细的总计，用于与一级汇总核对 | 对当前列表 FLD-045 求和，必须等于 FLD-042 | #,##0 分钟 | 一致=正常；不一致=数据异常 | 不一致时显示异常提示，不静默修正 | task-daily-total | AC-025 |
| FLD-047 | SRC-003 | PAGE-003/PAGE-002 | product.serviceDescription | 套餐服务说明 | 标准版所含平台、线路、话术、流程、优化、看板和运维服务说明 | 从 SRC-003 规则文本直接展示 | 文本列表 | 无 | 缺失时不伪造服务项 | package-service-description | AC-007 |
| FLD-048 | SRC-003 | PAGE-003 | product.scriptAllowance | 场景话术数量 | 标准版包含的话术套数 | 固定为 2 套，可标注售前或售后 | 整数 + 套 | 2 | 缺失显示“以合同为准” | script-allowance | AC-007 |
| FLD-049 | SRC-003 | PAGE-003 | product.scriptChangeRule | 话术修改规则 | 展示修改幅度与新话术/免费维护关系 | 仅展示来源文本，不执行正好 50% 的自动判断 | 说明文本 | 高于 50%=新场景；低于 50%=免费维护；50%=不自动分类 | 正好 50% 时展示“请按合同口径人工确认” | script-change-rule | OI-003 |

## Open Field Questions

本轮修正新增字段：

| Field ID | Source ID | Page / Area | API / Data Field | Display Name | Business Definition | Value Logic | Display Format | Enum / Mapping | Empty / Error Rule | Annotation Point | Used In |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FLD-050 | SRC-012 | PAGE-003 | recharge.actualPrice | 实际套餐价格 | 本次提交的实际总价，不是每包单价 | 初始为默认单价乘数量；可手工编辑；包数变化保留已手改总价；以实际值记流水 | 不小于 0，最多 2 位小数，元 | 无 | 空、负数、非有限数、超出 2 位小数阻止提交；偏离缺原因阻止提交 | recharge-price-field | R-023 |
| FLD-051 | SRC-019 | home/PAGE-002 | entitlement.productType | 当前服务套餐 | 当前租户已开通的服务套餐 | 读取当前授权租户权益productType映射名称；试用开通为trial_package，标准版为standard_annual；话费包不覆盖服务套餐；渝发种子权益修正为试用，不重置已手改额度 | 文本 | standard_annual=标准版年包；trial_package=试用套餐 | 未开通显示未开通套餐；缺类型显示服务套餐；超管显示平台工作台；其他管理员缺有效租户上下文显示不可用 | home-tenant-overview | R-022、R-025 |

- OI-001：未到期续费时 FLD-007/FLD-008 的重算或顺延方式未确认，本轮不提供该交互。
- OI-002：SRC-015 取消历史兼容展示，旧外部单号不纳入本轮字段。
- OI-003：FLD-049 的正好 50% 取值映射未确认，不实现自动判定。
- OI-004：SRC-015 取消旧金额兼容；当前调整字段保留。
- OI-005：SRC-015 已关闭历史兼容范围，当前内部流水继续验证。


### 当前验收映射

# 验收映射

> 将冻结需求、原型实现步骤和可观察验证方式建立映射。S7 每步验证后更新 Status 和证据，S8 完成全局复核。

| Requirement ID | Requirement | Acceptance Criteria | Verification | Status | Decision / Reason |
| --- | --- | --- | --- | --- | --- |
| R-033 | 四项评审修正 | 渝发显示试用套餐；其他管理员只读本租户套餐；标注运行时识别首页/用量及账户锚点；计算说明统一分钟池并保留原文 | STEP-19；SRC-019；D-018；BR-020；账户/权限/计算及文档21项断言 | Pass | S7业务和运行时通过；正式48条数据按S9后回写另行验收，全部回写验证前不宣称用户四项全部完成；菜单和已编辑额度保留 |
| R-034 | 时长调减允许归零 | 最大调减量=当前总天数，结果可为0且服务过期；不清空分钟或冻结，超额/非法输入/缺原因/版本冲突不写账；文档及当前标注一致 | STEP-20；SRC-020；D-019；BR-021；/tmp/recharge-zero-days.M70AM4/check.js | Pass | 25项业务、11项规则与文档、五视图10组通过；120/30/1归零与0再调增通过，48条标注合同和当前4条规则已核对，原文档保留 |
| R-001 | 商用/试用标记 | 可创建/编辑并展示两种标记；仅改标记不影响账务 | STEP-02；AC-001~003；SRC-002；FLD-003；编辑后对比有效期和分钟池 | Pass | step-02 标记保存回显，账户值前后不变 |
| R-002 | 标准版年包 | 默认 5,000 元、365 天、10,000 分钟，服务与两套话术说明完整 | STEP-04；AC-004~007；SRC-003；FLD-011、013、015、047~049；默认值和预览检查 | Pass | step-04 默认商品、套餐说明及写账结果符合规则 |
| R-003 | 话费充值包 | 有效服务期内可购买；默认 1,000 元/包、3,500 分钟/包，数量叠加正确 | STEP-04；AC-008~010；FLD-010~016；多包、改值和过期租户检查 | Pass | step-04 两包联动 2,000 元/7,000 分钟，过期购买被拦截 |
| R-004 | 保留冻结与消耗 | 余额足够才冻结；未接通 0；接通按分钟；完成/终止幂等结算 | STEP-08；AC-011~015；BR-008~009；FLD-021~023；五类数据断言 | Pass | step-08 计费 1/2/0 分钟，完成、终止及重复回调断言通过 |
| R-005 | 内部充值记录 | 新充值生成完整内部流水，账户与记录一致 | STEP-03~04；AC-016~018；BR-006~007；FLD-024~034；提交后检查全列及前后值 | Pass | step-03/04 内部单号、实际值、原因、操作人、时间与状态齐全 |
| R-006 | 使用情况概览 | 普通租户用户从右上角进入，展示当前租户有效期、状态和可用分钟 | STEP-06；AC-019~021；FLD-004~008、021；切换角色并核对当前租户 | Pass | step-06 普通与多租户账号均只展示 currentTenantId 对应概览 |
| R-007 | 按日使用明细 | 当前租户按日展示消耗；空/异常可识别；不混入其他租户 | STEP-06；AC-022~024；FLD-041~042；日期、分钟、隔离与状态检查 | Pass | step-06 三日数据、空/过期/中断重试和跨租户拦截均通过 |
| R-008 | 任务级二级明细 | 从日明细下钻任务，任务分钟合计等于日汇总 | STEP-07；AC-025；FLD-043~046；两日 DOM 求和及 mismatch 检查 | Pass | step-07 任务合计 326/248/195 均与对应日汇总一致 |
| R-009 | 超级管理员权限 | 超管不显示或提供使用情况及明细入口 | STEP-06~07；AC-026；FLD-005；切换超管并检查入口和直达保护 | Pass | step-06/07 超管入口隐藏，直达只返回权限拦截 |
| R-010 | 充值值手工编辑 | 使用天数和入账分钟均可编辑，未改用默认值，改值以提交值生效 | STEP-04；AC-027~029；FLD-013~019；修改两字段并核对账户/流水 | Pass | step-04 年包与话费包的默认/改值路径均正确入账 |
| R-011 | 充值校验 | 天数/分钟为正整数；偏离默认值原因必填；无额外审批 | STEP-04；AC-030；FLD-014、016、017；0/负数/小数/无原因及合法值检查 | Pass | step-04 非法值和缺原因均阻止提交，合法值直接写入 |
| R-012 | 手工调整四组合 | 调增/调减均支持使用时长/可用分钟，生成完整流水 | STEP-05；AC-031~033；FLD-024~038；四组合切换与两类提交 | Pass | step-05 四组合的单位、边界和预览正确，调增/调减流水齐全 |
| R-013 | 手工调减边界 | 不修改冻结、不减为负；缺方向/对象/值/原因时阻止提交 | STEP-05；AC-034~035；FLD-022、035~040；越界、缺字段与版本冲突检查 | Pass | step-05 越界/缺字段/冲突均不写入，冻结分钟前后不变 |
| R-014 | 统一分钟池 | 标准版、话费包和手工分钟调整进入同一池，大/小模型共同消费 | STEP-01、03~08；AC-036；BR-005；FLD-020~023；跨操作核对同一池 | Pass | 各充值、调整、冻结/结算操作均使用 unifiedMinutePool |
| R-015 | 历史记录兼容（已取消） | 旧功能未上线，不实现旧单号/金额兼容 | SRC-015；D-014；STEP-14 | Descoped | 用户明确取消；当前内部流水及无外部依赖继续验收 |
| R-016 | 管理端空态与异常态 | 无记录展示空态；加载中断可重试；写账中断不生成成功记录 | STEP-03~05；BR-007；FLD-024、034；切换 mock 状态并对比记录 | Pass | step-03/04/05 空态、重试、原子写入和版本冲突状态通过 |
| R-017 | 业务流程图 | 本地 HTML 展示管理端、租户端、任务和账本泳道，包含主路径、判断和回流 | STEP-09；SRC-004/006；lane/node/edge 合同、坐标与浏览器检查 | Pass | step-09 生成 7 lane/28 node/21 edge，唯一、无重叠且列对齐 |
| R-018 | 时序交互图 | 本地 HTML 展示充值、调整、冻结和用量查询的参与者与消息顺序 | STEP-10；SRC-007；participant/message 合同与 DOM 顺序检查 | Pass | step-10 生成 5 participant/23 message，唯一且自上而下有序 |
| R-019 | 无新增外部系统依赖 | D智链读取/关联不在新流程；关联系统页为明确空态并说明 not_required | STEP-03、10；SRC-010；D-004；新表单与 related systems empty 合同检查 | Pass | 新流程无外部单号；关联系统空态无伪卡片并标记 not_required |
| R-020 | 五视图与人工标注准备 | 原型、说明、业务流程、时序、关联系统可切换；关键元素有稳定 data-anno | STEP-02~10；SRC-011；FLD-001~049；导航、锚点唯一性与字段引用检查 | Pass | 五视图资源就绪，标注合同在 S9 生成人工提示词前保持只读 |

## 规则

| Requirement ID | Requirement | Acceptance Criteria | Verification | Status | Decision / Reason |
| --- | --- | --- | --- | --- | --- |
| R-028 | 试用套餐正名与租户配置隔离 | 试用仅试用套餐，商用仅标准版/话费包；入口、单选、打开、提交同一白名单；默认与手改值生效且名称一致 | STEP-13；SRC-014；FLD-003、FLD-010、FLD-026、FLD-051；浏览器切换/直调/篡改/写账 | Pass | D-013；试用1类/商用2类、双向提交拦截、实际写账与跨页对账通过 |
| R-029 | 删除历史兼容数据 | 仅内部充值记录和手工调整流水，无兼容入口、面板或专用数据；当前写账不受影响 | STEP-14；SRC-015；D-014；浏览器双页签/空态/充值/调整 | Pass | step-14 双页签/空态正常；商用充值、手工调整与试用开通写账正确，冻结值未变 |
| R-030 | 超级管理员创建充值调整 | 超管可创建、试用/商用充值及四组合调整，操作人正确；非超管无入口且直调/切换角色后不可写账；超管无用量明细 | STEP-16；SRC-016；D-015；FLD-005、031；角色正反向测试 | Pass | step-16 三类充值/四种调整、实际操作人、角色拒绝和切换取消均通过 |
| R-031 | 非超管验证与说明同步 | 白名单直达租户账号，首页/日/任务数据一致；同步说明规则，文档入口现按R-032恢复全量 | STEP-17；SRC-017；D-016；FLD-004、005；浏览器入口与对账检查 | Pass | step-17账号及对账通过；原v1.6入口安排由SRC-018/R-032覆盖 |
| R-032 | 全量文档保留与权限差异说明 | 原23小节和历史版本保留，原入口恢复；全量v3.2、迭代v1.7注明超管专属与菜单/页面未隔离差异，本次不改权限逻辑 | STEP-18；SRC-018；D-017；BR-019；全文对照与浏览器检查 | Pass | 原23小节/15条版本保留、18个非本期小节逐字一致；原入口和全量链接可达，权限规则及演示限制分开呈现；菜单现状和现有操作校验保持 |

最新覆盖：R-026/R-027（SRC-013）替代 R-017/R-018 的重绘图方式及 R-022 的同套餐假设。

| Requirement ID | Requirement | Acceptance Criteria | Verification | Status | Decision / Reason |
| --- | --- | --- | --- | --- | --- |
| R-021 | 删除冻结结算展示区 | 充值抽屉无截图说明区，原冻结/结算行为继续有效 | STEP-11；SRC-012；页面与账本断言 | Pass | D-011 |
| R-022 | 试用租户开通套餐 | 有开通使用套餐入口，开通更新服务期与分钟，保留试用标记 | STEP-11；SRC-012；FLD-003、FLD-051；未开通试用租户操作 | Pass | 沿用已确认同套餐规则 |
| R-023 | 套餐价格手工编辑 | 总价可编辑，校验合法性与偏离原因，保存实际总价 | STEP-11；SRC-012；FLD-011、FLD-028、FLD-050；金额与数量联动 | Pass | D-011 |
| R-024 | 账户下拉使用情况 | 入口在账户下拉内，进入后关闭，超管隐藏 | STEP-11；SRC-012；FLD-004、FLD-005；菜单与权限检查 | Pass | D-011 |
| R-025 | 首页更新新版口径 | 当前套餐、有效期、统一可用分钟与充值/用量一致，切租户刷新 | STEP-11；SRC-012；FLD-004、FLD-021、FLD-051；跨页对账 | Pass | D-011 |
| R-026 | 直接复用需求分析两图 | 两图各 7 个场景、原始 SVG/原文完整复用，交付导航正常 | STEP-12；SRC-006、SRC-007、SRC-013；原图逐字比对、浏览器导航 | Pass | D-012；源SVG完全一致，桌面和窄屏正常 |
| R-027 | 独立使用套餐 | 试用租户第三种类型默认 0 元/30 天/500 分钟，均可编辑，写入独立类型并同步首页 | STEP-12；SRC-013；FLD-010~016、FLD-026、FLD-050、FLD-051；默认/改值/边界/回归 | Pass | D-012；默认与改值写账、权限、四组合调整和冻结回归通过 |

- 每个核心需求均映射到至少一个实现步骤、字段或来源。
- S7 单步通过后将对应行更新为 Pass，并写入可复现证据。
- S8 只在全部 STEP 有 pass 记录后执行全局验证。
- OI-001~OI-005 不写成生产规则；默认处理见 `memory/open-items.md`。
- 使用 `n/a`、`deferred`、`descoped`、`skipped`、`不适用`、`已取消` 或 `跳过` 时，Decision / Reason 必须记录明确范围依据。


## 可用 data-anno 锚点清单

- page: index | data-anno: usage-header-entry | selector: [data-anno="usage-header-entry"] | label: 当前租户使用情况入口 | kind: action | fieldRefs: FLD-004,FLD-005 | file: index.html:43
- page: home | data-anno: home-tenant-overview | selector: [data-anno="home-tenant-overview"] | label: 当前租户套餐与统一分钟余额 | kind: region | fieldRefs: FLD-002,FLD-003,FLD-004,FLD-006,FLD-007,FLD-008,FLD-021,FLD-051 | file: js/pages/home.js:61
- page: sys-tenant | data-anno: tenant-create-entry | selector: [data-anno="tenant-create-entry"] | label: 新建租户 | kind: action | fieldRefs: FLD-001,FLD-002,FLD-003 | file: js/pages/sys-tenant.js:1081
- page: sys-tenant | data-anno: tenant-iteration-list | selector: [data-anno="tenant-iteration-list"] | label: 租户标记与统一分钟池列表 | kind: table | fieldRefs: FLD-001,FLD-002,FLD-003,FLD-006,FLD-007,FLD-008,FLD-021,FLD-022 | file: js/pages/sys-tenant.js:1086
- page: sys-tenant | data-anno: tenant-commercial-flag-column | selector: [data-anno="tenant-commercial-flag-column"] | label: 商用或试用标记 | kind: field | fieldRefs: FLD-003 | file: js/pages/sys-tenant.js:1088
- page: sys-tenant | data-anno: recharge-load-error | selector: [data-anno="recharge-load-error"] | label: 充值管理加载失败与重试 | kind: region | fieldRefs: FLD-006,FLD-021 | file: js/pages/sys-tenant.js:1290
- page: sys-tenant | data-anno: recharge-account-overview | selector: [data-anno="recharge-account-overview"] | label: 租户服务与统一分钟池概览 | kind: region | fieldRefs: FLD-006,FLD-007,FLD-008,FLD-020,FLD-021,FLD-022,FLD-023 | file: js/pages/sys-tenant.js:1296
- page: sys-tenant | data-anno: recharge-trial-entry | selector: [data-anno="recharge-trial-entry"] | label: 试用套餐开通入口 | kind: action | fieldRefs: FLD-003,FLD-010,FLD-014,FLD-016 | file: js/pages/sys-tenant.js:1303
- page: sys-tenant | data-anno: recharge-standard-entry | selector: [data-anno="recharge-standard-entry"] | label: 标准版年包充值入口 | kind: action | fieldRefs: FLD-010,FLD-014,FLD-016 | file: js/pages/sys-tenant.js:1304
- page: sys-tenant | data-anno: recharge-pack-entry | selector: [data-anno="recharge-pack-entry"] | label: 话费充值包入口 | kind: action | fieldRefs: FLD-010,FLD-012,FLD-016 | file: js/pages/sys-tenant.js:1305
- page: sys-tenant | data-anno: adjustment-entry | selector: [data-anno="adjustment-entry"] | label: 手工调增调减入口 | kind: action | fieldRefs: FLD-035,FLD-036,FLD-037 | file: js/pages/sys-tenant.js:1306
- page: sys-tenant | data-anno: internal-recharge-table | selector: [data-anno="internal-recharge-table"] | label: 内部充值流水 | kind: region | fieldRefs: FLD-024,FLD-025,FLD-026,FLD-027,FLD-028,FLD-029,FLD-030,FLD-031,FLD-032,FLD-033,FLD-034 | file: js/pages/sys-tenant.js:1313
- page: sys-tenant | data-anno: manual-adjustment-table | selector: [data-anno="manual-adjustment-table"] | label: 手工调整流水 | kind: region | fieldRefs: FLD-029,FLD-030,FLD-031,FLD-032,FLD-033,FLD-034,FLD-035,FLD-036,FLD-037 | file: js/pages/sys-tenant.js:1318
- page: sys-tenant | data-anno: recharge-management-drawer | selector: [data-anno="recharge-management-drawer"] | label: 租户充值管理 | kind: region | fieldRefs: FLD-001,FLD-002,FLD-003,FLD-006,FLD-021 | file: js/pages/sys-tenant.js:1331
- page: sys-tenant | data-anno: billing-tenant-context | selector: [data-anno="billing-tenant-context"] | label: 充值租户上下文 | kind: region | fieldRefs: FLD-001,FLD-002,FLD-003 | file: js/pages/sys-tenant.js:1334
- page: sys-tenant | data-anno: recharge-package-description | selector: [data-anno="recharge-package-description"] | label: 标准版服务和话术规则 | kind: region | fieldRefs: FLD-047,FLD-048,FLD-049 | file: js/pages/sys-tenant.js:1416
- page: sys-tenant | data-anno: recharge-product-form | selector: [data-anno="recharge-product-form"] | label: 套餐开通与话费充值表单 | kind: region | fieldRefs: FLD-010,FLD-011,FLD-012,FLD-013,FLD-014,FLD-015,FLD-016,FLD-017,FLD-018,FLD-019 | file: js/pages/sys-tenant.js:1466
- page: sys-tenant | data-anno: recharge-type-field | selector: [data-anno="recharge-type-field"] | label: 充值类型 | kind: region | fieldRefs: FLD-010 | file: js/pages/sys-tenant.js:1470
- page: sys-tenant | data-anno: recharge-price-field | selector: [data-anno="recharge-price-field"] | label: 实际套餐价格 | kind: region | fieldRefs: FLD-011,FLD-028,FLD-050 | file: js/pages/sys-tenant.js:1476
- page: sys-tenant | data-anno: recharge-quantity-field | selector: [data-anno="recharge-quantity-field"] | label: 充值包数量 | kind: region | fieldRefs: FLD-012 | file: js/pages/sys-tenant.js:1477
- page: sys-tenant | data-anno: recharge-duration-field | selector: [data-anno="recharge-duration-field"] | label: 实际使用时长 | kind: region | fieldRefs: FLD-013,FLD-014 | file: js/pages/sys-tenant.js:1478
- page: sys-tenant | data-anno: recharge-minutes-field | selector: [data-anno="recharge-minutes-field"] | label: 实际入账分钟 | kind: region | fieldRefs: FLD-015,FLD-016 | file: js/pages/sys-tenant.js:1479
- page: sys-tenant | data-anno: recharge-reason-field | selector: [data-anno="recharge-reason-field"] | label: 充值偏离原因 | kind: region | fieldRefs: FLD-017 | file: js/pages/sys-tenant.js:1481
- page: sys-tenant | data-anno: recharge-effect-preview | selector: [data-anno="recharge-effect-preview"] | label: 充值生效预览 | kind: region | fieldRefs: FLD-018,FLD-019,FLD-020,FLD-021 | file: js/pages/sys-tenant.js:1482
- page: sys-tenant | data-anno: recharge-submit-action | selector: [data-anno="recharge-submit-action"] | label: 确认充值并生成内部流水 | kind: action | fieldRefs: FLD-014,FLD-016,FLD-017,FLD-024 | file: js/pages/sys-tenant.js:1487
- page: sys-tenant | data-anno: iteration-adjustment-form | selector: [data-anno="iteration-adjustment-form"] | label: 使用时长与可用分钟手工调整 | kind: region | fieldRefs: FLD-035,FLD-036,FLD-037,FLD-038,FLD-039,FLD-040 | file: js/pages/sys-tenant.js:1699
- page: sys-tenant | data-anno: adjustment-direction-field | selector: [data-anno="adjustment-direction-field"] | label: 调整方向 | kind: region | fieldRefs: FLD-035 | file: js/pages/sys-tenant.js:1703
- page: sys-tenant | data-anno: adjustment-target-field | selector: [data-anno="adjustment-target-field"] | label: 调整对象 | kind: region | fieldRefs: FLD-036 | file: js/pages/sys-tenant.js:1704
- page: sys-tenant | data-anno: adjustment-boundary-state | selector: [data-anno="adjustment-boundary-state"] | label: 调整边界与冻结保护 | kind: region | fieldRefs: FLD-022,FLD-039,FLD-040 | file: js/pages/sys-tenant.js:1706
- page: sys-tenant | data-anno: adjustment-value-field | selector: [data-anno="adjustment-value-field"] | label: 手工调整值 | kind: region | fieldRefs: FLD-037 | file: js/pages/sys-tenant.js:1708
- page: sys-tenant | data-anno: adjustment-result-preview | selector: [data-anno="adjustment-result-preview"] | label: 手工调整前后值预览 | kind: region | fieldRefs: FLD-029,FLD-030 | file: js/pages/sys-tenant.js:1709
- page: sys-tenant | data-anno: adjustment-reason-field | selector: [data-anno="adjustment-reason-field"] | label: 手工调整原因 | kind: region | fieldRefs: FLD-038 | file: js/pages/sys-tenant.js:1711
- page: sys-tenant | data-anno: adjustment-submit-action | selector: [data-anno="adjustment-submit-action"] | label: 确认手工调整 | kind: action | fieldRefs: FLD-035,FLD-036,FLD-037,FLD-038,FLD-040 | file: js/pages/sys-tenant.js:1715
- page: sys-tenant | data-anno: tenant-edit-form | selector: [data-anno="tenant-edit-form"] | label: 租户信息表单 | kind: region | fieldRefs: FLD-001,FLD-002,FLD-003 | file: js/pages/sys-tenant.js:2476
- page: sys-tenant | data-anno: tenant-commercial-flag-field | selector: [data-anno="tenant-commercial-flag-field"] | label: 商用或试用标记选择 | kind: region | fieldRefs: FLD-003 | file: js/pages/sys-tenant.js:2501
- page: usage | data-anno: usage-access-denied | selector: [data-anno="usage-access-denied"] | label: 使用情况权限拦截 | kind: region | fieldRefs: FLD-004,FLD-005 | file: js/pages/usage.js:45
- page: usage | data-anno: usage-current-tenant-overview | selector: [data-anno="usage-current-tenant-overview"] | label: 当前租户有效期与可用分钟 | kind: region | fieldRefs: FLD-002,FLD-004,FLD-006,FLD-007,FLD-008,FLD-021 | file: js/pages/usage.js:52
- page: usage | data-anno: usage-daily-empty | selector: [data-anno="usage-daily-empty"] | label: 按日使用明细空状态 | kind: region | fieldRefs: FLD-041,FLD-042 | file: js/pages/usage.js:61
- page: usage | data-anno: usage-load-error | selector: [data-anno="usage-load-error"] | label: 使用情况加载失败与重试 | kind: region | fieldRefs: FLD-004,FLD-021,FLD-041 | file: js/pages/usage.js:70
- page: usage | data-anno: usage-expired-state | selector: [data-anno="usage-expired-state"] | label: 服务已过期状态 | kind: region | fieldRefs: FLD-006,FLD-008 | file: js/pages/usage.js:73
- page: usage | data-anno: usage-daily-list | selector: [data-anno="usage-daily-list"] | label: 按日消耗通话分钟 | kind: region | fieldRefs: FLD-041,FLD-042 | file: js/pages/usage.js:78
- page: usage | data-anno: usage-detail-state-back | selector: [data-anno="usage-detail-state-back"] | label: 从任务状态返回按日明细 | kind: action | fieldRefs: FLD-041 | file: js/pages/usage.js:92
- page: usage | data-anno: usage-task-state | selector: [data-anno="usage-task-state"] | label: 任务分钟明细状态 | kind: region | fieldRefs: FLD-002,FLD-004,FLD-041,FLD-043,FLD-045 | file: js/pages/usage.js:92
- page: usage | data-anno: usage-task-detail | selector: [data-anno="usage-task-detail"] | label: 每日任务分钟消耗明细 | kind: region | fieldRefs: FLD-002,FLD-004,FLD-041,FLD-043,FLD-044,FLD-045,FLD-046 | file: js/pages/usage.js:111
- page: usage | data-anno: usage-detail-back | selector: [data-anno="usage-detail-back"] | label: 返回按日使用明细 | kind: action | fieldRefs: FLD-041 | file: js/pages/usage.js:112
- page: usage | data-anno: usage-task-mismatch | selector: [data-anno="usage-task-mismatch"] | label: 任务合计与日汇总不一致 | kind: region | fieldRefs: FLD-042,FLD-045,FLD-046 | file: js/pages/usage.js:115
- page: usage | data-anno: usage-task-table | selector: [data-anno="usage-task-table"] | label: 任务分钟消耗列表 | kind: region | fieldRefs: FLD-043,FLD-044,FLD-045 | file: js/pages/usage.js:117
- page: usage | data-anno: usage-task-total | selector: [data-anno="usage-task-total"] | label: 任务分钟当日合计 | kind: status | fieldRefs: FLD-042,FLD-045,FLD-046 | file: js/pages/usage.js:117

## 标注生成要求

target逐字选清单selector；page、sections.functionName、fieldRefs与源码合同一致。ID是从"1"到"48"的连续数字字符串，跨页面递增，不复用旧编号。sourceRefs仅引用上述SRC事实。

每条sections具备10个具体维度：functionName功能名称、functionDesc功能说明、permissionScope权限范围、dataSource数据来源系统、valueLogic输入到输出取值逻辑、fieldDesc逐字段说明、interactionDesc交互与页面流转、judgeRule判断、exceptionRule异常、otherDesc演示边界。不适用说明原因，资料不足报告缺口，不生成待确认/TODO占位。

fieldDesc每个字段单独一行，格式：FLD-* 字段名｜定义：...｜逻辑：...｜格式：...｜异常：...。按当前field-map逐项填写，不只列编号、字段名或代码变量。每个对象说明实际动作/规则，不将48条写成同一空泛描述。

## 回写说明

已确认正式文件为28字节空骨架。S9提示词及终检完成后，按SRC-019明确反馈一次性回写完整严格JSON赋值window.AnnotationData={...};，不读取合并旧数据。保留原运行时查看、编辑、拖拽、复制导出能力；不新增文件写回服务。检查语法、target唯一性、字段逐行、红点/弹窗/隐藏切换/SPA，随后运行approve-annotations重跑final并刷新快照；未通过前不宣称标注完成。
