# 字段映射

> 本轮字段合同不包含“大众定时重呼任务 ID”；该字段已确认不存在。

## Fields

| Field ID | Source ID | Page / Area | API / Data Field | Display Name | Business Definition | Value Logic | Display Format | Enum / Mapping | Empty / Error Rule | Annotation Point | Used In |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FLD-001 | SRC-003 | sys-scene / 大众配置 | sceneId / dazhongTaskId | 大众通信任务 ID | 中台关联的大众主外呼任务唯一标识，不是定时重呼任务 ID | 操作人填写并保存到场景 | UUID 文本 | 无 | 为空时阻止保存 | sys-scene-dazhong-redial | 场景表单、确认失效 |
| FLD-002 | SRC-001 | sys-scene / 大众配置 | redialEnabled | 是否需要重呼 | 标识场景是否安排符合条件号码再次呼叫 | 不需要时隐藏后续配置 | Radio | false=不需要，true=需要 | 缺失时按不需要处理 | sys-scene-dazhong-redial | 表单分支 |
| FLD-003 | SRC-001 | sys-scene / 大众配置 | redialMode | 重呼方式 | 选择定时重呼或主任务内重呼 | 需要重呼时默认 scheduled | Radio + 推荐标签 | scheduled=定时重呼，task=任务重呼 | 非枚举时回退 scheduled | sys-scene-dazhong-redial | 表单、详情 |
| FLD-004 | SRC-001 | sys-scene / 定时重呼 | scheduledRedialTimes | 计划重呼次数 | 大众后台实际配置的最大重呼次数，不含首次 | 输入大于等于 1 的整数；最大轮次为该值加一 | 正整数 | 不设无依据上限 | 空值、小数或小于 1 时阻止保存 | sys-scene-dazhong-redial | 表单、详情、末次判断 |
| FLD-005 | SRC-001 | sys-scene / 定时重呼 | scheduledConfigConfirmed | 已完成定时重呼配置 | 操作人声明已完成后台配置且计划次数一致 | 勾选时生成确认人和确认时间；关键字段变化时重置 | Checkbox / 状态 | false=尚未确认，true=已确认 | 定时重呼下未勾选时阻止保存 | sys-scene-dazhong-redial | 人工门禁、详情 |
| FLD-006 | SRC-001 | sys-scene / 任务重呼 | taskRedialRiskAccepted | 已知悉任务重呼风险 | 操作人声明已理解主任务完成后待重呼可能中断 | 任务重呼时必须勾选 | Checkbox / 状态 | false=尚未知悉，true=已知悉 | 未勾选时阻止保存 | sys-scene-dazhong-redial | 风险门禁、详情 |
| FLD-007 | SRC-001 | sys-scene / 确认记录 | redialConfirmedBy | 确认人 | 完成人工配置确认的操作人 | 勾选确认时写入演示用户“管理员” | 文本 | 无 | 未确认时显示横线 | scene-list-dazhong-redial | 详情追溯 |
| FLD-008 | SRC-001 | sys-scene / 确认记录 | redialConfirmedAt | 确认时间 | 完成人工配置确认的操作时间 | 勾选确认时使用浏览器当前时间 | YYYY-MM-DD HH:mm:ss | 无 | 未确认时显示横线 | scene-list-dazhong-redial | 详情追溯 |
| FLD-009 | SRC-003 | scene-list / 大众任务详情 | currentCallRound | 当前呼叫轮次 | 同一号码已进入的首呼或重呼序号 | 首次为 1，每次重呼递增；原型从 Mock 取值 | 正整数 / 第 X/Y 次 | 无 | 缺失时不参与末次判断 | scene-list-dazhong-redial | 详情、末次判断 |
| FLD-010 | SRC-001 | scene-list / 大众任务详情 | maxCallRounds | 最大呼叫轮次 | 首呼与所有计划重呼的总轮次 | 等于 FLD-004 + 1 | 正整数 | 无 | 无法计算时显示横线 | scene-list-dazhong-redial | 详情、末次判断 |
| FLD-011 | SRC-001 | scene-list / 大众任务详情 | isLastPlannedCall | 是否最后一次计划呼叫 | 当前轮次是否达到计划上限 | FLD-009 >= FLD-010 时为是 | 状态标签 | true=是，false=否 | 缺轮次或最大值时显示无法判断 | scene-list-dazhong-redial | 详情、业务判断 |

## Removed Field

- 大众定时重呼任务 ID / `scheduledRedialTaskId`：根据 SRC-001 确认删除，不再进入 UI、Mock、校验、详情、说明或标注。

## Open Field Questions

- 无。
