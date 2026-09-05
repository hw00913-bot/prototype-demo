# 当前标注覆盖 · SRC-019 / Step 19，SRC-020 / Step20维护

SRC-020 / D-019 / BR-021 / R-034：在Step20业务25项和五视图全局验证通过后，仅维护已验收的本轮正式标注26、29、31、33及现行文档版本。使用时长调减可归0，归零后服务到期并禁止新外呼；分钟余额与已有冻结结算保留。保留全部48个编号与锚点，不读取或继承历史标注。

## 当前输入与范围

仅使用本次S8证据和重新扫描的当前源码；未读取历史标注、缓存、旧提示词或旧覆盖文件。四页48个业务锚点；正式回写在S9准备完成后按SRC-019执行。

来源：SRC-001、SRC-002、SRC-003、SRC-004、SRC-005、SRC-006、SRC-007、SRC-008、SRC-009、SRC-010、SRC-011、SRC-012、SRC-013、SRC-014、SRC-015、SRC-016、SRC-017、SRC-018、SRC-019、SRC-020。
字段：FLD-001、FLD-002、FLD-003、FLD-004、FLD-005、FLD-006、FLD-007、FLD-008、FLD-009、FLD-010、FLD-011、FLD-012、FLD-013、FLD-014、FLD-015、FLD-016、FLD-017、FLD-018、FLD-019、FLD-020、FLD-021、FLD-022、FLD-023、FLD-024、FLD-025、FLD-026、FLD-027、FLD-028、FLD-029、FLD-030、FLD-031、FLD-032、FLD-033、FLD-034、FLD-035、FLD-036、FLD-037、FLD-038、FLD-039、FLD-040、FLD-041、FLD-042、FLD-043、FLD-044、FLD-045、FLD-046、FLD-047、FLD-048、FLD-049、FLD-050、FLD-051。
验收：R-001、R-002、R-003、R-004、R-005、R-006、R-007、R-008、R-009、R-010、R-011、R-012、R-013、R-014、R-015、R-016、R-017、R-018、R-019、R-020、R-021、R-022、R-023、R-024、R-025、R-026、R-027、R-028、R-029、R-030、R-031、R-032、R-033、R-034。R-015明确取消历史兼容；R-033正式回写已验收；R-034在维护后复核。

## 当前锚点覆盖

| Page | Target | 功能名称 | Kind | Field Refs | 本轮正式Annotation ID |
| --- | --- | --- | --- | --- | --- |
| index | [data-anno="usage-header-entry"] | 当前租户使用情况入口 | action | FLD-004、FLD-005 | 1 |
| home | [data-anno="home-tenant-overview"] | 当前租户套餐与统一分钟余额 | region | FLD-002、FLD-003、FLD-004、FLD-006、FLD-007、FLD-008、FLD-021、FLD-051 | 2 |
| sys-tenant | [data-anno="tenant-create-entry"] | 新建租户 | action | FLD-001、FLD-002、FLD-003 | 3 |
| sys-tenant | [data-anno="tenant-iteration-list"] | 租户标记与统一分钟池列表 | table | FLD-001、FLD-002、FLD-003、FLD-006、FLD-007、FLD-008、FLD-021、FLD-022 | 4 |
| sys-tenant | [data-anno="tenant-commercial-flag-column"] | 商用或试用标记 | field | FLD-003 | 5 |
| sys-tenant | [data-anno="recharge-load-error"] | 充值管理加载失败与重试 | region | FLD-006、FLD-021 | 6 |
| sys-tenant | [data-anno="recharge-account-overview"] | 租户服务与统一分钟池概览 | region | FLD-006、FLD-007、FLD-008、FLD-020、FLD-021、FLD-022、FLD-023 | 7 |
| sys-tenant | [data-anno="recharge-trial-entry"] | 试用套餐开通入口 | action | FLD-003、FLD-010、FLD-014、FLD-016 | 8 |
| sys-tenant | [data-anno="recharge-standard-entry"] | 标准版年包充值入口 | action | FLD-010、FLD-014、FLD-016 | 9 |
| sys-tenant | [data-anno="recharge-pack-entry"] | 话费充值包入口 | action | FLD-010、FLD-012、FLD-016 | 10 |
| sys-tenant | [data-anno="adjustment-entry"] | 手工调增调减入口 | action | FLD-035、FLD-036、FLD-037 | 11 |
| sys-tenant | [data-anno="internal-recharge-table"] | 内部充值流水 | region | FLD-024、FLD-025、FLD-026、FLD-027、FLD-028、FLD-029、FLD-030、FLD-031、FLD-032、FLD-033、FLD-034 | 12 |
| sys-tenant | [data-anno="manual-adjustment-table"] | 手工调整流水 | region | FLD-029、FLD-030、FLD-031、FLD-032、FLD-033、FLD-034、FLD-035、FLD-036、FLD-037 | 13 |
| sys-tenant | [data-anno="recharge-management-drawer"] | 租户充值管理 | region | FLD-001、FLD-002、FLD-003、FLD-006、FLD-021 | 14 |
| sys-tenant | [data-anno="billing-tenant-context"] | 充值租户上下文 | region | FLD-001、FLD-002、FLD-003 | 15 |
| sys-tenant | [data-anno="recharge-package-description"] | 标准版服务和话术规则 | region | FLD-047、FLD-048、FLD-049 | 16 |
| sys-tenant | [data-anno="recharge-product-form"] | 套餐开通与话费充值表单 | region | FLD-010、FLD-011、FLD-012、FLD-013、FLD-014、FLD-015、FLD-016、FLD-017、FLD-018、FLD-019 | 17 |
| sys-tenant | [data-anno="recharge-type-field"] | 充值类型 | region | FLD-010 | 18 |
| sys-tenant | [data-anno="recharge-price-field"] | 实际套餐价格 | region | FLD-011、FLD-028、FLD-050 | 19 |
| sys-tenant | [data-anno="recharge-quantity-field"] | 充值包数量 | region | FLD-012 | 20 |
| sys-tenant | [data-anno="recharge-duration-field"] | 实际使用时长 | region | FLD-013、FLD-014 | 21 |
| sys-tenant | [data-anno="recharge-minutes-field"] | 实际入账分钟 | region | FLD-015、FLD-016 | 22 |
| sys-tenant | [data-anno="recharge-reason-field"] | 充值偏离原因 | region | FLD-017 | 23 |
| sys-tenant | [data-anno="recharge-effect-preview"] | 充值生效预览 | region | FLD-018、FLD-019、FLD-020、FLD-021 | 24 |
| sys-tenant | [data-anno="recharge-submit-action"] | 确认充值并生成内部流水 | action | FLD-014、FLD-016、FLD-017、FLD-024 | 25 |
| sys-tenant | [data-anno="iteration-adjustment-form"] | 使用时长与可用分钟手工调整 | region | FLD-035、FLD-036、FLD-037、FLD-038、FLD-039、FLD-040 | 26 |
| sys-tenant | [data-anno="adjustment-direction-field"] | 调整方向 | region | FLD-035 | 27 |
| sys-tenant | [data-anno="adjustment-target-field"] | 调整对象 | region | FLD-036 | 28 |
| sys-tenant | [data-anno="adjustment-boundary-state"] | 调整边界与冻结保护 | region | FLD-022、FLD-039、FLD-040 | 29 |
| sys-tenant | [data-anno="adjustment-value-field"] | 手工调整值 | region | FLD-037 | 30 |
| sys-tenant | [data-anno="adjustment-result-preview"] | 手工调整前后值预览 | region | FLD-029、FLD-030 | 31 |
| sys-tenant | [data-anno="adjustment-reason-field"] | 手工调整原因 | region | FLD-038 | 32 |
| sys-tenant | [data-anno="adjustment-submit-action"] | 确认手工调整 | action | FLD-035、FLD-036、FLD-037、FLD-038、FLD-040 | 33 |
| sys-tenant | [data-anno="tenant-edit-form"] | 租户信息表单 | region | FLD-001、FLD-002、FLD-003 | 34 |
| sys-tenant | [data-anno="tenant-commercial-flag-field"] | 商用或试用标记选择 | region | FLD-003 | 35 |
| usage | [data-anno="usage-access-denied"] | 使用情况权限拦截 | region | FLD-004、FLD-005 | 36 |
| usage | [data-anno="usage-current-tenant-overview"] | 当前租户有效期与可用分钟 | region | FLD-002、FLD-004、FLD-006、FLD-007、FLD-008、FLD-021 | 37 |
| usage | [data-anno="usage-daily-empty"] | 按日使用明细空状态 | region | FLD-041、FLD-042 | 38 |
| usage | [data-anno="usage-load-error"] | 使用情况加载失败与重试 | region | FLD-004、FLD-021、FLD-041 | 39 |
| usage | [data-anno="usage-expired-state"] | 服务已过期状态 | region | FLD-006、FLD-008 | 40 |
| usage | [data-anno="usage-daily-list"] | 按日消耗通话分钟 | region | FLD-041、FLD-042 | 41 |
| usage | [data-anno="usage-detail-state-back"] | 从任务状态返回按日明细 | action | FLD-041 | 42 |
| usage | [data-anno="usage-task-state"] | 任务分钟明细状态 | region | FLD-002、FLD-004、FLD-041、FLD-043、FLD-045 | 43 |
| usage | [data-anno="usage-task-detail"] | 每日任务分钟消耗明细 | region | FLD-002、FLD-004、FLD-041、FLD-043、FLD-044、FLD-045、FLD-046 | 44 |
| usage | [data-anno="usage-detail-back"] | 返回按日使用明细 | action | FLD-041 | 45 |
| usage | [data-anno="usage-task-mismatch"] | 任务合计与日汇总不一致 | region | FLD-042、FLD-045、FLD-046 | 46 |
| usage | [data-anno="usage-task-table"] | 任务分钟消耗列表 | region | FLD-043、FLD-044、FLD-045 | 47 |
| usage | [data-anno="usage-task-total"] | 任务分钟当日合计 | status | FLD-042、FLD-045、FLD-046 | 48 |

## 验收与交互说明追溯

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


上列当前验收中的创建/标记、充值及内部流水、手工调整、使用情况与首页分别由docs/interaction.html第四章第1–6小节及对应锚点覆盖；计算与保留冻结规则见docs/计算逻辑.html现行第1–8节，权限只引用全量说明五.7，版本修正见全量v3.3及迭代v1.8。图集与关联系统只由第三章本地链接和global证据覆盖，不添加业务标注；R-015取消，无兼容锚点。

## 回写与验证说明

本轮正式回写已在S9提示词收尾后按SRC-019执行，以上1至48为当前生成的正式编号。浏览器在首页、账户下拉、租户列表/新建、三类充值、调整及流水、用量正常/空/错误/过期/拒绝/任务/对账异常状态逐项验证，48条均出现且target唯一；首页十维说明和8字段换行、红点隐藏/恢复、桌面/窄屏弹窗通过。弹窗仅标当前层，交付文档/图集隐藏业务标注。证据：/tmp/recharge-four-fixes.ux4u0X/annotations.js及截图；最终控制快照以approve-annotations结果为准。上文S7验收摘录是生成时事实，R-033的最终结果见当前memory/acceptance-map.md。

编号计划由当前锚点顺序新生成，不继承历史Annotation ID。每条含10维说明、真实sourceRefs、合同fieldRefs和逐行字段解释。S9只完成提示词与本清单，SRC-019触发的正式回写随后独立执行；运行approve-annotations成功才标记回写完成。
