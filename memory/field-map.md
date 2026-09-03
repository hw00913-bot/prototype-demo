# 字段映射

> 将 API 文档、参考项目、截图和口述需求中的字段事实整理为 `FLD-*`。执行步骤、验收、验证和标注应引用这些字段编号，避免只停留在来源级 `SRC-*`。

## 使用规则

- 每个字段使用稳定编号：`FLD-001`、`FLD-002`。
- `Source ID` 必须引用 `memory/source-materials.md` 中的 `SRC-*`。
- 如果没有 API 或字段级资料，必须写明 `No field-level source` 和原因。
- 涉及页面展示、筛选、表单、详情、状态、枚举、空值和异常展示的字段，都必须记录。
- Business Definition 必须解释字段在业务中的含义，不能只重复字段中文名。
- Value Logic 必须解释字段如何取得、计算、映射或组合；直接透传时也要写明来源字段。

## Fields

| Field ID | Source ID | Page / Area | API / Data Field | Display Name | Business Definition | Value Logic | Display Format | Enum / Mapping | Empty / Error Rule | Annotation Point | Used In |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FLD-001 | SRC-003 | scene-list / 大众任务详情 | redialMode | 重呼方式 | 大众任务采用定时重呼或任务重呼的策略 | 直接读取任务或关联场景保存的模式枚举 | 中文文本 | scheduled=定时重呼；task=任务重呼 | 缺失显示未配置 | scene-list-dazhong-redial | 详情摘要 |
| FLD-002 | SRC-001 | scene-list / 大众任务详情 | scheduledRedialTimes | 计划重呼次数 | 定时重呼计划执行的重呼次数，不包含首次呼叫 | 直接读取已保存的正整数，不再用于详情页轮次或末次计算 | N 次（不含首次） | 正整数 | 无效或缺失显示横线 | scene-list-dazhong-redial | 定时重呼详情摘要 |
| FLD-003 | SRC-003 | scene-list / 大众任务详情 | scheduledConfigConfirmed | 人工配置确认 | 是否声明大众后台定时重呼配置完成且次数一致 | 直接读取确认布尔值 | 状态标签 | true=已确认；false=尚未确认 | 缺失按尚未确认 | scene-list-dazhong-redial | 定时重呼详情摘要 |
| FLD-004 | SRC-003 | scene-list / 大众任务详情 | taskRiskConfirmed | 风险知情 | 是否已知悉任务重呼受主任务完成态影响 | 仅在任务重呼分支读取确认布尔值 | 状态标签 | true=已知悉；false=尚未确认 | 缺失按尚未确认 | scene-list-dazhong-redial | 任务重呼详情摘要 |

## Open Field Questions

- 无。确认人、确认时间、当前轮次与末次结论已按 SRC-001/SRC-002 从本轮详情展示合同中移除。
