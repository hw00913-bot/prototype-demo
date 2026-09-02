# 手动标注提示词

## 标注输入资料

- SRC-001：PM 明确确认大众 SaaS 不提供定时重呼任务 ID，要求删除相关功能。
- SRC-002：用户截图红框定位“关联重呼任务 ID”整行。
- SRC-003：当前静态原型，保留次数、人工确认、任务重呼和末次判断。
- 字段合同：FLD-001、FLD-002、FLD-003、FLD-004、FLD-005、FLD-006、FLD-007、FLD-008、FLD-009、FLD-010、FLD-011。

## 可用 data-anno 锚点清单

- page: sys-scene | data-anno: sys-scene-dazhong-redial | selector: [data-anno="sys-scene-dazhong-redial"] | label: 大众通信重呼配置 | kind: region | fieldRefs: FLD-001,FLD-002,FLD-003,FLD-004,FLD-005,FLD-006,FLD-007,FLD-008 | file: js/pages/sys-scene.js
- page: scene-list | data-anno: scene-list-dazhong-redial | selector: [data-anno="scene-list-dazhong-redial"] | label: 大众通信重呼追溯 | kind: region | fieldRefs: FLD-003,FLD-004,FLD-005,FLD-006,FLD-007,FLD-008,FLD-009,FLD-010,FLD-011 | file: js/pages/scene-list.js

## 手动标注提示词

请基于已通过全局验证的当前静态原型，生成两条面向产品经理评审的页面标注。只使用上方锚点、SRC-001 至 SRC-003 和 FLD-001 至 FLD-011，不读取或复用任何历史标注。

必须说明的核心事实：

- 大众通信 SaaS 不提供定时重呼任务 ID；页面已删除该输入、校验和详情字段，中台不保存隐藏字段。
- 定时重呼保留计划重呼次数和人工配置确认，次数不含首次。
- 最大呼叫轮次 = 计划重呼次数 + 1；当前轮次大于等于最大轮次时为最后一次计划呼叫。
- 主任务 UUID、重呼方式或计划次数变化时，原人工确认、确认人和确认时间失效。
- 任务重呼保留完成态风险知情确认，不套用定时重呼次数公式。

每条标注必须包含 sections 的十个维度：functionName、functionDesc、permissionScope、dataSource、valueLogic、fieldDesc、interactionDesc、judgeRule、exceptionRule、otherDesc。functionName 必须逐字等于锚点 label，fieldRefs 必须与锚点合同完全一致。

fieldDesc 每个字段独立一行，格式必须为：FLD-* 字段名｜定义：业务含义｜逻辑：取值或计算逻辑｜格式：展示格式｜异常：空值或异常规则。

标注 ID 必须是全局连续字符串：配置标注 id "1"，详情标注 id "2"。target 必须逐字使用锚点清单中的 selector。每条标注引用 sourceRefs: ["SRC-001","SRC-002","SRC-003"]。资料不足时输出缺口，不生成占位标注。

## 标注生成要求

- Annotation 1 覆盖 R-001 至 R-004，字段 FLD-001 至 FLD-008。
- Annotation 2 覆盖 R-005、R-006，字段 FLD-003 至 FLD-011。
- R-007、R-008 由交互说明和验证记录追溯；R-009 由两条标注共同覆盖。
- 不对其他平台、普通文本或装饰元素生成标注。
- 不把已删除的定时重呼任务 ID 写入 fieldRefs 或 fieldDesc。

## 回写说明

PM 要求同步更新标注，因此在确认 `annotations/annotations.js` 为本轮空骨架后，一次性写入两条完整 AnnotationData。回写后执行 JS 语法、selector 唯一性、字段逐行解释、页面 marker 和 final 门禁校验；终态后运行 `python3 tools/loop_run.py approve-annotations .` 刷新交付快照。
