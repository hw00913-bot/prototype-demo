# 字段映射

> 本轮字段编号只覆盖大众通信重呼配置、人工确认和最后一次计划呼叫判断。

## Fields

| Field ID | Source ID | Page / Area | API / Data Field | Display Name | Business Definition | Value Logic | Display Format | Enum / Mapping | Empty / Error Rule | Annotation Point | Used In |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FLD-001 | SRC-001 | sys-scene / 大众配置 | sceneId / dazhongTaskId | 大众通信任务 ID | 中台关联的大众主外呼任务唯一标识，复用 SRC-002 的现有 UUID 关联形态 | 由操作人填写并保存到场景关联 | UUID 文本 | 无 | 为空时阻止保存 | sys-scene-dazhong-redial | 场景表单、确认失效判断 |
| FLD-002 | SRC-001 | sys-scene / 大众配置 | redialEnabled | 是否需要重呼 | 标识该场景是否要为符合条件的号码安排重呼 | 用户选择不需要或需要；不需要时隐藏后续配置 | Radio | false=不需要，true=需要 | 缺失时按不需要处理 | sys-scene-dazhong-redial | 表单分支、详情展示 |
| FLD-003 | SRC-001 | sys-scene / 大众配置 | redialMode | 重呼方式 | 说明该场景使用定时关联任务或主任务内重呼 | 需要重呼时默认 scheduled，可切换为 task | Radio + 推荐标签 | scheduled=定时重呼，task=任务重呼 | 需要重呼但值非枚举时回退 scheduled | sys-scene-dazhong-redial | 表单分支、详情展示 |
| FLD-004 | SRC-001 | sys-scene / 定时重呼 | scheduledRedialTaskId | 关联重呼任务 ID | 大众后台人工配置的定时重呼承接任务标识 | 操作人按后台实际配置手工录入，中台不调接口校验 | 文本 | 无 | 定时重呼下为空时阻止保存 | sys-scene-dazhong-redial | 定时重呼表单、任务详情 |
| FLD-005 | SRC-001 | sys-scene / 定时重呼 | scheduledRedialTimes | 计划重呼次数（不含首次） | 大众后台实际配置的最大重呼次数，用于计算最大呼叫轮次 | 用户输入大于等于 1 的整数；最大呼叫轮次 = 该值 + 1 | 正整数 | 不设未确认的平台硬上限 | 空值、小数或小于 1 时阻止保存 | sys-scene-dazhong-redial | 定时重呼表单、末次判断、任务详情 |
| FLD-006 | SRC-001 | sys-scene / 定时重呼 | scheduledConfigConfirmed | 已完成定时重呼配置 | 操作人声明已在大众后台完成所需配置 | 勾选时生成确认人和确认时间；关键字段变更时重置 | Checkbox / 状态 | false=尚未人工确认，true=已人工确认 | 定时重呼下未勾选时阻止保存 | sys-scene-dazhong-redial | 人工门禁、详情追溯 |
| FLD-007 | SRC-001 | sys-scene / 任务重呼 | taskRedialRiskAccepted | 已知悉任务重呼风险 | 操作人声明已理解主任务完成后待重呼号码可能不再触发 | 任务重呼时必须勾选；切换方式后重置 | Checkbox / 状态 | false=尚未知悉，true=已知悉 | 任务重呼下未勾选时阻止保存 | sys-scene-dazhong-redial | 风险门禁、详情展示 |
| FLD-008 | SRC-001 | sys-scene / 确认记录 | redialConfirmedBy | 确认人 | 完成定时重呼配置确认的当前操作人 | 勾选确认时由演示用户上下文写入，本轮 Mock 为“管理员” | 文本 | 无 | 未确认时显示“-” | scene-list-dazhong-redial | 任务详情追溯 |
| FLD-009 | SRC-001 | sys-scene / 确认记录 | redialConfirmedAt | 确认时间 | 完成定时重呼配置确认的操作时间 | 勾选确认时使用浏览器当前时间生成 | YYYY-MM-DD HH:mm:ss | 无 | 未确认时显示“-” | scene-list-dazhong-redial | 任务详情追溯 |
| FLD-010 | SRC-001 | scene-list / 大众任务详情 | currentCallRound | 当前呼叫轮次 | 同一号码已进入的首呼或重呼序号 | 首次呼叫为 1，每次重呼加 1；原型从 Mock 取值 | 正整数 / “第 X/Y 次” | 无 | 缺失时显示“-”，不参与末次判断 | scene-list-dazhong-redial | 任务详情、末次判断 |
| FLD-011 | SRC-001 | scene-list / 大众任务详情 | maxCallRounds | 最大呼叫轮次 | 计划中首呼与所有重呼的总轮次 | 定时重呼时等于 FLD-005 + 1；其他方式无法从本轮字段计算 | 正整数 | 无 | 无法计算时显示“-” | scene-list-dazhong-redial | 任务详情、末次判断 |
| FLD-012 | SRC-001 | scene-list / 大众任务详情 | isLastPlannedCall | 是否最后一次计划呼叫 | 表示当前呼叫轮次是否已达到计划上限 | 定时重呼且 FLD-010 >= FLD-011 时为是，否则为否 | 状态标签 | true=是，false=否 | 缺当前轮次或最大轮次时显示“无法判断” | scene-list-dazhong-redial | 任务详情、业务判断 |

## Open Field Questions

- 无。重呼次数是否含首次的口径已确认为“不含首次”；平台未给出硬上限，因此原型不编造上限。
