# 标注准备覆盖清单

> 记录本轮手动标注提示词如何覆盖核心页面、验收项、资料来源和字段事实。S9 不强制自动写入 `annotations/annotations.js`；如果 PM 手动生成并回写标注，本文件再补充 Annotation ID。

## Coverage

| Annotation ID / Prompt Item | Page | Target / Area | Requirement ID | Source Refs | Field Refs | Coverage Note |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | sys-scene | `[data-anno="sys-scene-dazhong-redial"]` / 大众通信重呼配置 | R-001,R-002,R-003,R-004,R-005,R-010 | SRC-001,SRC-002,SRC-003 | FLD-001,FLD-002,FLD-003,FLD-004,FLD-005,FLD-006,FLD-007,FLD-008,FLD-009 | 覆盖两种方式、默认推荐、定时人工门禁、任务风险门禁和关键字段变更后的确认失效，并完成配置锚点标注。 |
| 2 | scene-list | `[data-anno="scene-list-dazhong-redial"]` / 大众通信重呼追溯 | R-006,R-007,R-008,R-010 | SRC-001,SRC-002,SRC-003 | FLD-003,FLD-004,FLD-005,FLD-006,FLD-007,FLD-008,FLD-009,FLD-010,FLD-011,FLD-012 | 覆盖人工配置追溯、当前/最大轮次、末次判断、任务重呼不展示虚假定时数据，并完成详情锚点标注。 |
| 全局回归记录 | 全站 | `memory/verification-log.md` / S8 global | R-009 | SRC-002,SRC-003 | none | 记录全部业务 JavaScript 语法、关键页面控制台、锚点唯一性、桌面无横向溢出和其他平台回归边界。 |

## Gaps

- 无。本轮两处变更均有唯一稳定锚点、来源引用、字段合同和浏览器验证证据。
