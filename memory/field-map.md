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
| FLD-009 | SRC-002 | PAGE-003/PAGE-004 | entitlement.durationDays | 使用时长 | 本次充值或调整作用于服务期的天数 | 读取权益配置总天数；调增/调减直接加减该值，到期日同步加减相同天数，不是对剩余天数直接改值 | 正整数 + 天 | 无 | 非正整数阻止提交；调减低于合法下限时报错 | duration-days | AC-027、AC-030、AC-031 |
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
| FLD-039 | SRC-004 | PAGE-004 | adjustment.maxDecrease | 可调减上限 | 不修改冻结记录前提下允许减少的最大值 | 分钟上限=当前可用分钟；时长上限=当前配置总天数减1 | 数值 + 单位 | 天或分钟 | 无可调空间时禁用确认 | max-decrease | AC-034 |
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
