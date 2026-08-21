# 标注准备覆盖清单（S9 重生成版）

> 本轮从 15 个粗粒度锚点扩展到 55 个唯一业务锚点，并已按用户要求完整回写至 `annotations/annotations.js`。

## 页面与锚点覆盖

| # | Page | Target | Requirement | Source Refs | Field Refs | Coverage Note |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | home | `[data-anno="home-usage-cards"]` | R-013 | SRC-009 | none | 大/小模型余额、有效期与呼叫控制概览 |
| 2 | scene-list | `[data-anno="scene-list-filters"]` | R-002 | SRC-001~SRC-006 | FLD-003,004,006 | 名称、状态、平台筛选 |
| 3 | scene-list | `[data-anno="scene-list-grid"]` | R-002 | SRC-001~SRC-006 | FLD-001,003,004,006,007,008,009 | 六平台任务卡片与数量口径 |
| 4 | scene-list | `[data-anno="scene-list-dazhong-readonly"]` | R-002 | SRC-006 | FLD-014,015 | 大众任务只读差异 |
| 5 | scene-list | `[data-anno="houpu-task-detail"]` | R-002 | SRC-005 | FLD-013,014 | 厚朴任务只读差异 |
| 6 | scene-list | `[data-anno="houpu-token-expired"]` | R-002 | SRC-005 | none | 厚朴令牌失效演示 |
| 7 | scene-list | `[data-anno="scene-task-detail"]` | R-002 | SRC-001~SRC-006 | FLD-001~015 | 统一任务详情抽屉与平台字段 |
| 8 | scene-block | `[data-anno="block-group-list"]` | R-003 | SRC-003 | FLD-070 | 黑名单分组选择 |
| 9 | scene-block | `[data-anno="block-filters"]` | R-003 | SRC-003 | FLD-071,073,074 | 号码记录筛选 |
| 10 | scene-block | `[data-anno="block-management-actions"]` | R-003 | SRC-003 | none | 新增、导入、导出与同步配置 |
| 11 | scene-block | `[data-anno="block-table"]` | R-003 | SRC-003 | FLD-070~075 | 号码、原因、来源、有效期、同步状态 |
| 12 | report-call | `[data-anno="report-call-table"]` | R-004 | SRC-001,002,003,005,006 | FLD-006,040~045 | 呼叫量、接通量、未接通量、时长与比率 |
| 13 | report-call | `[data-anno="report-call-tabs"]` | R-004 | SRC-001,002,003,005,006 | none | 外呼/客户统计口径切换 |
| 14 | report-call | `[data-anno="report-call-filters"]` | R-004 | SRC-001,002,003,005,006 | FLD-006,040 | 日期、场景、平台筛选 |
| 15 | report-billing | `[data-anno="report-billing-rule"]` | R-005 | SRC-009 | none | 接通计费与分钟向上取整规则 |
| 16 | report-billing | `[data-anno="report-billing-filters"]` | R-005 | SRC-003,005,006,009 | FLD-006,050,055 | 日期、租户、平台筛选 |
| 17 | report-billing | `[data-anno="report-billing-table"]` | R-005 | SRC-003,005,006,009 | FLD-006,050,055 | 六平台租户计费汇总 |
| 18 | report-billing | `[data-anno="report-billing-detail"]` | R-005 | SRC-003,005,006,009 | FLD-006,050,055 | 计费明细弹窗 |
| 19 | report-clue | `[data-anno="report-clue-vehicle-tabs"]` | R-006 | SRC-010 | none | NEV/ICE 子类切换 |
| 20 | report-clue | `[data-anno="report-clue-stat-filters"]` | R-006 | SRC-010 | FLD-040 | 汇总日期与业务类型筛选 |
| 21 | report-clue | `[data-anno="report-clue-table"]` | R-006 | SRC-010 | FLD-040,041,043,045 | 线索导入、外呼、接通、下发与意向分级 |
| 22 | report-clue | `[data-anno="report-clue-detail-filters"]` | R-006 | SRC-010 | FLD-020,021,024,025,031 | 明细时间、场景、意向、门店筛选 |
| 23 | report-clue | `[data-anno="report-clue-detail-table"]` | R-006 | SRC-010 | FLD-020,021,023,024,025,031 | 线索级通话与意向明细 |
| 24 | report-clue | `[data-anno="report-clue-return-filters"]` | R-006 | SRC-010 | FLD-024,040 | 回流日期与场景筛选 |
| 25 | report-clue | `[data-anno="report-clue-return-table"]` | R-006 | SRC-010 | FLD-024,040 | 传入、提交外呼、回流统计 |
| 26 | report-clue | `[data-anno="report-clue-main-tabs"]` | R-006 | SRC-010 | none | 汇总、明细、回流主类切换 |
| 27 | result-records | `[data-anno="result-records-detail"]` | R-007 | SRC-001,002,003,005,006 | FLD-020~036 | 录音、转写、摘要、平台扩展字段 |
| 28 | result-records | `[data-anno="result-records-filters"]` | R-007 | SRC-001,002,003,005,006 | FLD-020,021,022,024,025,027 | 电话、时间、场景、状态、平台筛选 |
| 29 | result-records | `[data-anno="result-records-table"]` | R-007 | SRC-001,002,003,005,006 | FLD-020~025,027 | 通话记录主列表 |
| 30 | result-clue | `[data-anno="result-clue-customer-tags"]` | R-008 | SRC-003,004,006 | FLD-031,036 | AI/百炼客户标签详情 |
| 31 | result-clue | `[data-anno="result-clue-revisit-detail"]` | R-008 | SRC-003,004,006 | FLD-020,021,025,026,031 | 多次回访时间线与结果 |
| 32 | result-clue | `[data-anno="result-clue-filters"]` | R-008 | SRC-003,004,006 | FLD-020,024,025,027,031 | 电话、状态、场景、意向筛选 |
| 33 | result-clue | `[data-anno="result-clue-table"]` | R-008 | SRC-003,004,006 | FLD-020,021,024,025,027,031 | 六平台线索记录主列表 |
| 34 | sys-scene | `[data-anno="sys-scene-filters"]` | R-009 | SRC-001,002,003,005,006 | FLD-003,006,013 | 场景名称、分类、平台筛选 |
| 35 | sys-scene | `[data-anno="sys-scene-add-btn"]` | R-009 | SRC-001,002,003,005,006 | none | 新建场景入口 |
| 36 | sys-scene | `[data-anno="sys-scene-table"]` | R-009 | SRC-001,002,003,005,006 | FLD-006 | 场景与所属平台列表 |
| 37 | sys-scene | `[data-anno="sys-scene-form"]` | R-009 | SRC-001,002,003,005,006 | FLD-003,006,013 | 通用场景配置与校验 |
| 38 | sys-scene | `[data-anno="sys-scene-platform-selector"]` | R-009 | SRC-001,002,003,005,006 | FLD-006 | 平台互斥选择与面板联动 |
| 39 | sys-scene | `[data-anno="sys-scene-yizhi-config"]` | R-009 | SRC-001 | FLD-006,014 | 一知场景 ID、模型与账号关联 |
| 40 | sys-scene | `[data-anno="sys-scene-zhongkejin-config"]` | R-009 | SRC-002 | FLD-006,013 | 中科金任务 ID 与模型配置 |
| 41 | sys-scene | `[data-anno="sys-scene-diansheng-config"]` | R-009 | SRC-003 | FLD-006,015 | 电声呼叫时段、重呼、黑名单与启动策略 |
| 42 | sys-scene | `[data-anno="sys-scene-binglan-config"]` | R-009 | SRC-004 | FLD-006,014,015 | 冰兰通道、机器人、时段与拦截策略 |
| 43 | sys-scene | `[data-anno="sys-scene-houpu-config"]` | R-009 | SRC-005 | FLD-006,013 | 厚朴任务名称、数据列模式与批量限制 |
| 44 | sys-scene | `[data-anno="sys-scene-dazhong-config"]` | R-009 | SRC-006 | FLD-002,006,012 | 大众 UUID 关联与 SaaS 侧策略边界 |
| 45 | sys-tags | `[data-anno="sys-tags-scene-management"]` | R-010 | SRC-007 | none | 标签适用场景维护入口 |
| 46 | sys-tags | `[data-anno="sys-tags-supplier-management"]` | R-010 | SRC-007,003,006 | none | 标签供应商维护入口 |
| 47 | sys-tags | `[data-anno="sys-tags-config-tree"]` | R-010 | SRC-007 | FLD-060,061,062 | 中台/供应商、租户类型、场景层级 |
| 48 | sys-tags | `[data-anno="sys-tags-supplier-map"]` | R-010 | SRC-007,003,006 | FLD-060~063 | 供应商标签启用与中台映射 |
| 49 | sys-tags | `[data-anno="sys-tags-table"]` | R-010 | SRC-007 | FLD-060~063 | 中台标准标签与排序 |
| 50 | sys-tenant | `[data-anno="sys-tenant-filters"]` | R-011 | SRC-002,009 | FLD-050 | 租户名称筛选 |
| 51 | sys-tenant | `[data-anno="sys-tenant-create"]` | R-011 | SRC-002 | FLD-050~055 | 新建租户入口与字段范围 |
| 52 | sys-tenant | `[data-anno="sys-tenant-table"]` | R-011 | SRC-002,009 | FLD-050~055 | 租户、余额、有效期、状态、类型 |
| 53 | sys-tenant | `[data-anno="sys-tenant-pricing"]` | R-011 | SRC-009 | FLD-050,055 | 大/小模型计费配置 |
| 54 | sys-tenant | `[data-anno="sys-tenant-billing"]` | R-011 | SRC-009 | FLD-050,055 | 充值关联、生效、余额调整与冻结 |
| 55 | sys-tenant | `[data-anno="sys-tenant-form"]` | R-011 | SRC-002 | FLD-050~055 | 租户新增/编辑表单与校验 |

## 需求覆盖

- R-001 数据整合：通过 scene-list、report-call、report-billing、result-records、result-clue、sys-scene 的平台维度锚点交叉覆盖。
- R-002~R-011：均有对应页面的筛选、核心数据和关键操作/详情锚点。
- R-012 导航功能：属于全局框架能力，不对导航装饰生成页面标注；在 `docs/interaction.html` 的主流程和异常说明中覆盖。
- R-013 首页展示：由 `home-usage-cards` 覆盖。

## 来源与字段覆盖

- 来源覆盖：SRC-001、SRC-002、SRC-003、SRC-004、SRC-005、SRC-006、SRC-007、SRC-008、SRC-009、SRC-010 均在本轮页面说明或交互说明中可追溯；SRC-008 仅作为底座来源写入交互文档，不强行挂到业务锚点。
- 字段覆盖：FLD-001、FLD-002、FLD-003、FLD-004、FLD-005、FLD-006、FLD-007、FLD-008、FLD-009、FLD-010、FLD-011、FLD-012、FLD-013、FLD-014、FLD-015、FLD-020、FLD-021、FLD-022、FLD-023、FLD-024、FLD-025、FLD-026、FLD-027、FLD-028、FLD-029、FLD-030、FLD-031、FLD-032、FLD-033、FLD-034、FLD-035、FLD-036、FLD-040、FLD-041、FLD-042、FLD-043、FLD-044、FLD-045、FLD-050、FLD-051、FLD-052、FLD-053、FLD-054、FLD-055、FLD-060、FLD-061、FLD-062、FLD-063、FLD-070、FLD-071、FLD-072、FLD-073、FLD-074、FLD-075 均由至少一个源码锚点承载。

## Gaps

- `flowcharts/processon-links.txt` 没有有效链接，因此交互文档明确写“本期未提供”，不伪造 ProcessOn 地址。
- 当前验收资料未定义角色权限矩阵；标注必须写明“当前原型未定义角色权限，仅演示可见”，不能推断管理员或运营权限。
- 55 条标注已回写并完成逐页定位验证；动态弹层标注需先打开对应弹窗或抽屉后显示。
