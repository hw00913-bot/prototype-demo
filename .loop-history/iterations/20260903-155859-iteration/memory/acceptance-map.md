# 验收映射

本轮验收以“旧 ID 全链路无残留、次数与末次判断不回退、文档和标注同步”为总原则。

| Requirement ID | Requirement | Acceptance Criteria | Verification | Status | Decision / Reason |
| --- | --- | --- | --- | --- | --- |
| R-001 | 删除配置页关联重呼任务 ID | 编辑大众场景时不存在输入行、占位文案和旧确认描述 | 浏览器 DOM 与全文搜索 | Pass | oldInputPresent=false、oldLabelPresent=false |
| R-002 | 删除旧字段数据和保存校验 | Mock、采集、保存及校验不存在 scheduledRedialTaskId；不再提示填写关联任务 ID | JS 搜索、定时重呼提交 | Pass | 业务源码和 Mock 无残留，提交不再校验旧字段 |
| R-003 | 保留计划次数人工门禁 | FLD-004 必须为大于等于 1 的整数，FLD-005 未确认时阻止保存 | 分支提交与 Toast | Pass | 修改次数后保存被人工确认门禁阻止 |
| R-004 | 保留确认失效 | 修改 FLD-001、FLD-003、FLD-004 后 FLD-005、FLD-007、FLD-008 清空 | 浏览器输入/切换检查 | Pass | 次数 2→3 后确认状态和元数据清空 |
| R-005 | 删除详情中的关联任务 ID | 定时重呼详情不展示旧 ID，任务重呼也无该行 | 三条大众任务详情 DOM | Pass | id=17/18/19 均无旧详情行 |
| R-006 | 保留末次判断 | FLD-004=2 时 FLD-010=3；FLD-009=3 判定末次，FLD-009=2 判定非末次 | id 17/18 详情检查 | Pass | 3/3 末次与 2/3 非末次均正确 |
| R-007 | 说明口径一致 | Markdown/HTML 无旧 ID 能力，保留暂无接口、人工确认、次数口径和公式 | 文档同步检查与浏览器 | Pass | v3.0 文档同步且 noInputRule=true |
| R-008 | 其他平台回归 | 全部业务 JS 语法通过，其他平台逻辑未改，关键页面无 console 错误 | 语法与浏览器回归 | Pass | 全部业务 JS 语法通过，关键页面无 error/warn |
| R-009 | 更新说明页和标注 | 两个锚点字段合同不含旧字段，Annotation 1/2 与 FLD-001 至 FLD-011 一致 | final preflight 与 marker 定位 | Pass | final preflight 通过，marker 1/2 在唯一锚点显示 |
