# 字段映射

> 本文件记录API/参考项目字段级事实的 `FLD-*` 编号，包含业务定义和取值逻辑。

本文件定义了智能外呼平台所有数据字段的业务含义、取值逻辑和显示格式。每个字段都有唯一的FLD编号，便于追溯和引用。

## 字段说明

字段映射用于统一各平台的数据字段命名和定义，确保数据展示的一致性。业务定义描述字段代表什么，取值逻辑描述字段如何直接取得、计算、映射或组合。

## 外呼任务字段

外呼任务是平台的核心业务对象，包含任务的基本信息、执行状态和配置参数。

| Field ID | Source ID | Page Area | Data Field | Display Name | Business Definition | Value Logic | Display Format | Annotation Point | Used In |
|----------|-----------|-----------|------------|--------------|---------------------|-------------|----------------|------------------|---------|
| FLD-001 | SRC-001 | 外呼列表 | id | 任务ID | 任务的唯一数字标识符，用于区分不同外呼任务 | 数据库自增生成，不可重复 | 数字 | [data-anno="task-id"] | scene-list.js |
| FLD-002 | SRC-006 | 外呼列表 | uuid | 任务UUID | 任务的全局唯一标识符，用于跨系统同步 | UUID v4格式生成，32位十六进制字符串 | UUID字符串 | [data-anno="task-uuid"] | scene-list.js |
| FLD-003 | SRC-001 | 外呼列表 | name | 任务名称 | 外呼任务的描述性名称，包含区域和业务类型信息 | 由运营人员手动输入，格式：区域-业务-平台 | 文本 | [data-anno="task-name"] | scene-list.js |
| FLD-004 | SRC-008 | 外呼列表 | taskStatusCode + 平台原始状态 | 中台任务状态 | 六个平台任务状态映射后的 `TaskExecuteStatus` | 先读中台 code，否则按平台原始字段映射；未知显示“未映射” | 13 项状态标签 | [data-anno="task-status"] | scene-list.js |
| FLD-005 | SRC-001 | 外呼列表 | source | 数据来源 | 外呼名单的导入方式 | 手动导入或接口传入两种方式 | 文本 | [data-anno="task-source"] | scene-list.js |
| FLD-006 | SRC-001 | 外呼列表 | platform | 接入平台 | 外呼任务使用的接入平台 | 根据任务配置选择对应平台 | 平台名称 | [data-anno="task-platform"] | scene-list.js |
| FLD-007 | SRC-001 | 外呼列表 | assigned | 已分配数量 | 已分配给外呼任务的名单总数 | 系统自动计算，不可手动修改 | 数字 | [data-anno="task-assigned"] | scene-list.js |
| FLD-008 | SRC-001 | 外呼列表 | pending | 待处理数量 | 尚未外呼的名单数量 | 等于已分配数量减去已呼叫数量 | 数字 | [data-anno="task-pending"] | scene-list.js |
| FLD-009 | SRC-001 | 外呼列表 | called | 已呼叫数量 | 已完成外呼的名单数量 | 系统自动统计，实时更新 | 数字 | [data-anno="task-called"] | scene-list.js |
| FLD-010 | SRC-006 | 外呼列表 | line | 线路标识 | 外呼使用的通信线路编号 | 大众通信平台特有的线路标识 | 文本 | [data-anno="task-line"] | scene-list.js |
| FLD-011 | SRC-006 | 外呼列表 | maximumcall | 最大呼叫数 | 单次任务允许的最大外呼数量 | 由运营人员配置，防止过度外呼 | 数字 | [data-anno="task-maxcall"] | scene-list.js |
| FLD-012 | SRC-006 | 外呼列表 | billingType | 计费类型 | 外呼任务的计费方式 | 根据平台配置选择计费类型 | 文本 | [data-anno="task-billing"] | scene-list.js |
| FLD-013 | SRC-002 | 外呼列表 | taskType | 任务类型 | 外呼任务的业务类型分类 | 根据业务场景选择任务类型 | 文本 | [data-anno="task-type"] | scene-list.js |
| FLD-014 | SRC-002 | 外呼列表 | robotName | 机器人名称 | 外呼使用的AI机器人名称 | 根据任务配置选择机器人 | 文本 | [data-anno="task-robot"] | scene-list.js |
| FLD-015 | SRC-003 | 外呼列表 | strategyCode | 策略编码 | 外呼策略的唯一编码 | 由系统自动生成 | 文本 | [data-anno="task-strategy"] | scene-list.js |
| FLD-016 | SRC-012 | 厚朴任务关联 | task_id | 厚朴任务ID | 厚朴平台已有任务的唯一标识 | 使用服务端默认账号查询校验；查询成功才可保存；同一 ID 仅允许关联一个场景，ID 变更后必须重新查询 | 文本 | [data-anno="houpu-task-detail"] | scene-list.js, sys-scene.js |
| FLD-017 | SRC-011 | 厚朴任务关联 | botId / templateId | 机器人与号码模板 | 已关联厚朴任务返回的机器人和号码字段模板快照 | 根据任务查询结果只读反显；模板 `fields` 仅用于解释号码导入列，不在中台编辑 | 文本/只读动态字段表 | [data-anno="sys-scene-houpu-config"] | sys-scene.js |
| FLD-018 | SRC-005 | 厚朴导入 | batchId | 批次ID | 厚朴号码导入接口返回的批次标识 | 导入成功后保存并用于回调关联与幂等去重 | 文本 | [data-anno="houpu-task-detail"] | scene-list.js |
| FLD-019 | SRC-005 | 厚朴导入 | validNumberCount | 有效号码数 | 厚朴平台实际接收的有效号码数量 | 以平台返回值为准，不使用原始文件行数替代 | 整数 | [data-anno="houpu-task-detail"] | scene-list.js |

## 通话记录字段

通话记录记录每次外呼的详细信息，包括通话状态、内容摘要和分析结果。

| Field ID | Source ID | Page Area | Data Field | Display Name | Business Definition | Value Logic | Display Format | Annotation Point | Used In |
|----------|-----------|-----------|------------|--------------|---------------------|-------------|----------------|------------------|---------|
| FLD-020 | SRC-001 | 通话记录 | phone | 客户电话 | 外呼目标客户的电话号码 | 从名单中读取，部分脱敏显示 | 脱敏电话 | [data-anno="call-phone"] | result-records.js |
| FLD-021 | SRC-001 | 通话记录 | startTime | 通话开始时间 | 外呼开始的时间戳 | 系统自动记录，精确到秒 | 日期时间 | [data-anno="call-start"] | result-records.js |
| FLD-022 | SRC-001 | 通话记录 | endTime | 通话结束时间 | 外呼结束的时间戳 | 系统自动记录，精确到秒 | 日期时间 | [data-anno="call-end"] | result-records.js |
| FLD-023 | SRC-001 | 通话记录 | duration | 通话时长 | 通话持续的时间长度 | 等于结束时间减去开始时间 | 时间 | [data-anno="call-duration"] | result-records.js |
| FLD-024 | SRC-001 | 通话记录 | sceneName | 场景名称 | 外呼任务所属的业务场景 | 关联任务名称 | 文本 | [data-anno="call-scene"] | result-records.js |
| FLD-025 | SRC-005 | 通话记录 | status | DCC 通话状态 | 平台原始通话结果映射后的中台标准状态 | 按《功能说明文档》全平台统一映射表归并后展示和筛选 | 状态标签 | [data-anno="call-status"] | result-records.js |
| FLD-026 | SRC-001 | 通话记录 | summary | 通话摘要 | 通话内容的简要总结 | AI系统自动生成或人工填写 | 文本 | [data-anno="call-summary"] | result-records.js |
| FLD-027 | SRC-001 | 通话记录 | platform | 接入平台 | 外呼使用的接入平台 | 关联任务配置 | 平台名称 | [data-anno="call-platform"] | result-records.js |
| FLD-028 | SRC-001 | 通话记录 | lastNode | 最后节点 | 对话流程的最后一个节点 | AI对话系统自动记录 | 文本 | [data-anno="call-node"] | result-records.js |
| FLD-029 | SRC-001 | 通话记录 | sessionId | 会话ID | 本次通话的唯一会话标识 | 系统自动生成 | 文本 | [data-anno="call-session"] | result-records.js |
| FLD-030 | SRC-001 | 通话记录 | callerNumber | 主叫号码 | 外呼使用的主叫号码 | 根据任务配置选择 | 电话 | [data-anno="call-caller"] | result-records.js |
| FLD-031 | SRC-001 | 通话记录 | aiTagName | AI标签名 | AI系统对客户的意向判断标签 | 根据通话内容自动分析 | 标签 | [data-anno="call-aitag"] | result-records.js |
| FLD-032 | SRC-001 | 通话记录 | callerLocation | 主叫位置 | 主叫号码的归属地信息 | 根据号码查询归属地 | 地址 | [data-anno="call-callerloc"] | result-records.js |
| FLD-033 | SRC-001 | 通话记录 | calleeLocation | 被叫位置 | 被叫号码的归属地信息 | 根据号码查询归属地 | 地址 | [data-anno="call-calleeloc"] | result-records.js |
| FLD-034 | SRC-006 | 通话记录 | callid | 呼叫ID | 本次呼叫的唯一标识 | 大众通信平台返回 | 文本 | [data-anno="call-callid"] | result-records.js |
| FLD-035 | SRC-006 | 通话记录 | bailianSummary | 百炼摘要 | 百炼智能体生成的通话摘要 | AI系统自动生成 | 文本 | [data-anno="call-bailian"] | result-records.js |
| FLD-036 | SRC-006 | 通话记录 | bailianTagName | 百炼标签名 | 百炼智能体生成的意向标签 | AI系统自动分析 | 标签 | [data-anno="call-bailiantag"] | result-records.js |
| FLD-037 | SRC-005 | 厚朴通话详情 | rawStatusCode | 厚朴原始状态码 | 厚朴回调的 770–790 原始码 | 原样保存并按说明文档映射为 FLD-025 | 整数 | [data-anno="result-records-detail"] | result-records.js |
| FLD-038 | SRC-005 | 厚朴通话详情 | rawStatusName | 厚朴原始状态描述 | 原始码对应的平台描述 | 与原始码一起保留，不被本地状态覆盖 | 文本 | [data-anno="result-records-detail"] | result-records.js |
| FLD-039 | SRC-005 | 厚朴通话详情 | taskId / batchId / callId | 厚朴追溯标识 | 任务、批次和单次呼叫的关联标识 | 有值时展示；服务端回调用于幂等去重 | 文本 | [data-anno="result-records-detail"] | result-records.js |

## 统计报表字段

统计报表字段用于展示外呼任务的执行效果和业务数据。

| Field ID | Source ID | Page Area | Data Field | Display Name | Business Definition | Value Logic | Display Format | Annotation Point | Used In |
|----------|-----------|-----------|------------|--------------|---------------------|-------------|----------------|------------------|---------|
| FLD-040 | SRC-001 | 通话统计 | date | 统计日期 | 统计数据对应的日期 | 按天聚合统计 | 日期 | [data-anno="stat-date"] | report-call.js |
| FLD-041 | SRC-001 | 通话统计 | dialTotal | 总呼叫数 | 当日发起的外呼总数 | 系统自动统计 | 数字 | [data-anno="stat-dial"] | report-call.js |
| FLD-042 | SRC-001 | 通话统计 | rosterTotal | 名单总数 | 当日外呼的名单总数 | 等于已分配数量 | 数字 | [data-anno="stat-roster"] | report-call.js |
| FLD-043 | SRC-001 | 通话统计 | connectedTotal | 接通总数 | 通话成功的数量 | 系统自动统计 | 数字 | [data-anno="stat-connected"] | report-call.js |
| FLD-044 | SRC-001 | 通话统计 | missedTotal | 未接通总数 | 通话失败的数量 | 系统自动统计 | 数字 | [data-anno="stat-missed"] | report-call.js |
| FLD-045 | SRC-001 | 通话统计 | duration | 通话总时长 | 所有通话的总时长 | 系统自动累加 | 时间 | [data-anno="stat-duration"] | report-call.js |

## 租户管理字段

租户管理字段用于管理平台的租户信息和配置。

| Field ID | Source ID | Page Area | Data Field | Display Name | Business Definition | Value Logic | Display Format | Annotation Point | Used In |
|----------|-----------|-----------|------------|--------------|---------------------|-------------|----------------|------------------|---------|
| FLD-050 | SRC-002 | 租户管理 | tenantName | 租户名称 | 租户的公司或组织名称 | 由管理员手动输入 | 文本 | [data-anno="tenant-name"] | sys-tenant.js |
| FLD-051 | SRC-002 | 租户管理 | tenantId | 租户ID | 租户的唯一标识符 | 系统自动生成 | 文本 | [data-anno="tenant-id"] | sys-tenant.js |
| FLD-052 | SRC-002 | 租户管理 | type | 租户类型 | 租户的组织类型 | 门店或总部两种类型 | 文本 | [data-anno="tenant-type"] | sys-tenant.js |
| FLD-053 | SRC-002 | 租户管理 | status | 租户状态 | 租户的启用状态 | 管理员可切换 | 状态标签 | [data-anno="tenant-status"] | sys-tenant.js |
| FLD-054 | SRC-002 | 租户管理 | accountName | 账号名称 | 租户关联的账号名称 | 关联账号系统 | 文本 | [data-anno="tenant-account"] | sys-tenant.js |
| FLD-055 | SRC-002 | 租户管理 | modelType | 模型类型 | 使用的AI模型类型 | 大模型或小模型 | 文本 | [data-anno="tenant-model"] | sys-tenant.js |

## 标签管理字段

标签管理字段用于管理平台的标签体系。

| Field ID | Source ID | Page Area | Data Field | Display Name | Business Definition | Value Logic | Display Format | Annotation Point | Used In |
|----------|-----------|-----------|------------|--------------|---------------------|-------------|----------------|------------------|---------|
| FLD-060 | SRC-003 | 标签管理 | code | 标签编码 | 标签的唯一编码 | 系统自动生成 | 文本 | [data-anno="tag-code"] | sys-tags.js |
| FLD-061 | SRC-003 | 标签管理 | name | 标签名称 | 标签的显示名称 | 管理员手动输入 | 文本 | [data-anno="tag-name"] | sys-tags.js |
| FLD-062 | SRC-003 | 标签管理 | enabled | 是否启用 | 标签的启用状态 | 管理员可切换 | 状态标签 | [data-anno="tag-enabled"] | sys-tags.js |
| FLD-063 | SRC-003 | 标签管理 | sort | 排序序号 | 标签的显示排序 | 管理员手动设置 | 数字 | [data-anno="tag-sort"] | sys-tags.js |

## 黑名单字段

黑名单字段用于管理外呼拦截规则。

| Field ID | Source ID | Page Area | Data Field | Display Name | Business Definition | Value Logic | Display Format | Annotation Point | Used In |
|----------|-----------|-----------|------------|--------------|---------------------|-------------|----------------|------------------|---------|
| FLD-070 | SRC-003 | 外呼拦截 | groupId | 黑名单组ID | 黑名单分组的唯一标识 | 系统自动生成 | 文本 | [data-anno="block-group"] | scene-block.js |
| FLD-071 | SRC-003 | 外呼拦截 | addType | 添加类型 | 黑名单添加的原因类型 | 拒绝、意向保护或其他 | 文本 | [data-anno="block-addtype"] | scene-block.js |
| FLD-072 | SRC-003 | 外呼拦截 | reason | 添加原因 | 加入黑名单的具体原因 | 管理员手动输入 | 文本 | [data-anno="block-reason"] | scene-block.js |
| FLD-073 | SRC-003 | 外呼拦截 | source | 数据来源 | 黑名单数据的导入方式 | 手工新增、批量导入或接口同步 | 文本 | [data-anno="block-source"] | scene-block.js |
| FLD-074 | SRC-003 | 外呼拦截 | effective | 有效期 | 黑名单的生效时间范围 | 永久或指定天数 | 文本 | [data-anno="block-effective"] | scene-block.js |
| FLD-075 | SRC-003 | 外呼拦截 | platformSync | 平台同步状态 | 黑名单与外部平台的同步状态 | 已同步或同步失败 | 状态 | [data-anno="block-sync"] | scene-block.js |
