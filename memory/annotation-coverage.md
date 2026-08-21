# 标注准备覆盖清单

> 记录本轮手动标注提示词如何覆盖核心页面、验收项、资料来源和字段事实。S9 不强制自动写入 `annotations/annotations.js`；如果 PM 手动生成并回写标注，本文件再补充 Annotation ID。

## Coverage

本轮采用手动触发标注策略：S9 只准备 `memory/annotation-prompt.md` 提示词与源码 `data-anno` 锚点清单，由 PM 手动投喂标注生成器，暂不回写 `annotations/annotations.js`。

### 页面覆盖

| Annotation ID / Prompt Item | Page | Target / Area | Requirement ID | Source Refs | Field Refs | Coverage Note |
| --- | --- | --- | --- | --- | --- | --- |
| home-usage-cards | home | [data-anno="home-usage-cards"] | R-013 | SRC-009 | none | 首页用量余额区域，展示大/小模型可用分钟数、有效期、呼叫控制状态 |
| scene-list-grid | scene-list | [data-anno="scene-list-grid"] | R-002 | SRC-001,SRC-002,SRC-003,SRC-004,SRC-005,SRC-006 | FLD-001,FLD-003,FLD-004,FLD-006 | 外呼任务卡片网格，六平台任务列表与状态标签 |
| block-table | scene-block | [data-anno="block-table"] | R-003 | SRC-003 | FLD-070,FLD-071,FLD-075 | 黑名单号码列表，含添加类型/来源/有效期/平台同步 |
| report-call-table | report-call | [data-anno="report-call-table"] | R-004 | SRC-001,SRC-002,SRC-003,SRC-005 | FLD-040,FLD-041,FLD-043,FLD-045 | 通话统计表格，拨打/接通/未接通/接通率/触达率/时长 |
| report-billing-table | report-billing | [data-anno="report-billing-table"] | R-005 | SRC-003,SRC-005,SRC-006,SRC-009 | FLD-055 | 计费统计表格，租户计费时长与模型类型 |
| report-clue-table | report-clue | [data-anno="report-clue-table"] | R-006 | SRC-010 | FLD-040 | 线索统计 NEV/ICE 表格，导入/外呼/接通/下发与意向分级 |
| result-records-table | result-records | [data-anno="result-records-table"] | R-007 | SRC-001,SRC-002,SRC-006 | FLD-020,FLD-025,FLD-027 | 通话记录表格，通话状态/智能平台/意向标签 |
| result-clue-table | result-clue | [data-anno="result-clue-table"] | R-008 | SRC-001,SRC-004 | FLD-020 | 线索记录表格，回访次数/最后通话状态/意向级别 |
| sys-scene-add-btn | sys-scene | [data-anno="sys-scene-add-btn"] | R-009 | SRC-001,SRC-002,SRC-003,SRC-005,SRC-006 | none | 新建业务场景入口，打开平台差异化配置抽屉 |
| sys-scene-table | sys-scene | [data-anno="sys-scene-table"] | R-009 | SRC-001,SRC-002,SRC-003,SRC-005,SRC-006 | FLD-006 | 业务场景列表，场景编码/分类/所属平台 |
| sys-tags-table | sys-tags | [data-anno="sys-tags-table"] | R-010 | SRC-007,SRC-003,SRC-006 | FLD-060,FLD-062 | 中台标签列表，标签名称/状态/排序 |
| sys-tenant-table | sys-tenant | [data-anno="sys-tenant-table"] | R-011 | SRC-002,SRC-009 | FLD-050,FLD-055 | 租户列表，有效期/余额/冻结/呼叫控制/租户类型 |

### 来源覆盖

本轮标注引用来源编号：SRC-001、SRC-002、SRC-003、SRC-004、SRC-005、SRC-006、SRC-007、SRC-008、SRC-009、SRC-010。其中 SRC-008（智能外呼中台_demo_v1.0）仅作为底座参考，不单独产生页面标注。

### 字段覆盖

本轮标注引用字段编号：FLD-001、FLD-002、FLD-003、FLD-004、FLD-005、FLD-006、FLD-007、FLD-008、FLD-009、FLD-010、FLD-011、FLD-012、FLD-013、FLD-014、FLD-015、FLD-020、FLD-021、FLD-022、FLD-023、FLD-024、FLD-025、FLD-026、FLD-027、FLD-028、FLD-029、FLD-030、FLD-031、FLD-032、FLD-033、FLD-034、FLD-035、FLD-036、FLD-040、FLD-041、FLD-042、FLD-043、FLD-044、FLD-045、FLD-050、FLD-051、FLD-052、FLD-053、FLD-054、FLD-055、FLD-060、FLD-061、FLD-062、FLD-063、FLD-070、FLD-071、FLD-072、FLD-073、FLD-074、FLD-075。

### 需求覆盖

本轮验收映射需求编号：R-001、R-002、R-003、R-004、R-005、R-006、R-007、R-008、R-009、R-010、R-011、R-012、R-013。

## Gaps

- 各页详情抽屉/弹窗（如外呼任务详情、通话详情、计费详情）暂未单独挂锚点，当前标注以列表主区域为主。
- 本期不自动回写 `annotations/annotations.js`；待 PM 手动生成标注后，再回写并补充 Annotation ID。
