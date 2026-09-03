# 标注准备覆盖清单

## Coverage

| Annotation ID / Prompt Item | Page | Target / Area | Requirement ID | Source Refs | Field Refs | Coverage Note |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | sys-scene | `[data-anno="sys-scene-dazhong-redial"]` / 大众通信重呼配置 | R-001,R-002,R-003,R-004,R-009 | SRC-001,SRC-002,SRC-003 | FLD-001,FLD-002,FLD-003,FLD-004,FLD-005,FLD-006,FLD-007,FLD-008 | 覆盖删除旧 ID、次数门禁、确认失效和任务风险。 |
| 2 | scene-list | `[data-anno="scene-list-dazhong-redial"]` / 大众通信重呼追溯 | R-005,R-006,R-009 | SRC-001,SRC-002,SRC-003 | FLD-003,FLD-004,FLD-005,FLD-006,FLD-007,FLD-008,FLD-009,FLD-010,FLD-011 | 覆盖详情无旧 ID、确认追溯和末次计算。 |
| 交互说明 | docs | `docs/interaction.html` | R-007 | SRC-001,SRC-002,SRC-003 | FLD-001 至 FLD-011 | 说明删除范围、保留流程、公式和无接口边界。 |
| 全局回归 | memory | `memory/verification-log.md` | R-008 | SRC-003 | none | 记录语法、控制台、配置、三条任务详情和文档验证。 |

## Gaps

- 无。两个核心页面均有唯一锚点，字段合同不包含已删除的定时重呼任务 ID。
