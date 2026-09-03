# 手动标注提示词

> 用于 PM 将本轮已验证需求手动投喂给标注生成器。只生成本轮标注，不继承历史标注。

## 标注输入资料

- 项目目标：精简大众通信任务详情的重呼追溯区，见 `memory/project.md`。
- 验收结果：R-001 至 R-005 均通过，见 `memory/acceptance-map.md`。
- 来源：SRC-001 用户文字、SRC-002 红框截图、SRC-003 当前原型底座。
- 字段：FLD-001 重呼方式、FLD-002 计划重呼次数、FLD-003 人工配置确认、FLD-004 风险知情。
- 决策：D-002，删除确认记录、当前呼叫轮次和是否最后一次计划呼叫的详情展示。
- 页面证据：任务 17 与任务 19 的追溯区均无被删标签，锚点唯一，桌面与移动端通过。

## 可用 data-anno 锚点清单

- page: scene-list | data-anno: scene-list-dazhong-redial | selector: [data-anno="scene-list-dazhong-redial"] | label: 大众通信重呼追溯 | kind: region | fieldRefs: FLD-001,FLD-002,FLD-003,FLD-004 | file: js/pages/scene-list.js

## 手动标注提示词

请为已通过验证的静态原型生成一条面向产品经理评审的页面标注，输出完整 `window.AnnotationData`。只允许使用上方锚点清单，不得猜测、新造或扩大 selector。

输入边界：

- 只覆盖 `scene-list` 页面“大众通信重呼追溯”区域。
- 只依据 SRC-001、SRC-002、SRC-003 与 FLD-001 至 FLD-004。
- 不读取、不复用、不续写旧 `annotations/annotations.js`、浏览器缓存、历史提示词或历史标注 ID。
- 第一条且唯一一条标注使用 `id: "1"`；`target` 必须逐字等于 `[data-anno="scene-list-dazhong-redial"]`。
- `sections.functionName` 必须逐字等于“大众通信重呼追溯”。
- `sourceRefs` 必须为 `SRC-001,SRC-002,SRC-003`，`fieldRefs` 必须为 `FLD-001,FLD-002,FLD-003,FLD-004`。
- 不得在标注中出现“确认记录”“当前呼叫轮次”“是否最后一次计划呼叫”作为现存页面字段，也不得描述详情页会计算或展示末次结论。

标注 sections 必须完整包含以下 10 个维度：

1. functionName：大众通信重呼追溯。
2. functionDesc：说明该只读区域用于查看任务采用的重呼方式与必要配置摘要。
3. permissionScope：具备外呼任务查看权限的用户可查看，详情页不可修改。
4. dataSource：中台保存的大众通信场景配置与任务关联数据；大众 SaaS 不提供定时重呼任务 ID 接口。
5. valueLogic：scheduled 分支显示计划次数和人工配置确认；task 分支显示风险知情；不渲染确认明细、轮次或末次结论。
6. fieldDesc：每个字段独立一行，严格使用：
   - FLD-001 重呼方式｜定义：任务采用定时重呼或任务重呼的策略｜逻辑：读取 redialMode 并映射中文｜格式：定时重呼/任务重呼｜异常：缺失显示未配置
   - FLD-002 计划重呼次数｜定义：定时重呼计划执行的重呼次数且不含首次｜逻辑：scheduled 分支读取已保存正整数｜格式：N 次（不含首次）｜异常：无效或缺失显示横线
   - FLD-003 人工配置确认｜定义：是否声明大众后台定时重呼配置完成且次数一致｜逻辑：scheduled 分支读取确认布尔值｜格式：已确认/尚未确认｜异常：缺失按尚未确认
   - FLD-004 风险知情｜定义：是否知悉任务重呼受主任务完成态影响｜逻辑：task 分支读取风险确认布尔值｜格式：已知悉/尚未确认｜异常：缺失按尚未确认
7. interactionDesc：用户从外呼列表点击查看，切换任务详情后只读查看；模式不同自动切换摘要行。
8. judgeRule：scheduled 展示 FLD-002/FLD-003，task 展示 FLD-004；两者均展示 FLD-001。
9. exceptionRule：缺失数据按字段空值规则降级；不得用横线保留已删除三项。
10. otherDesc：配置页人工确认门禁与业务侧末次判断规则仍保留，但确认明细、轮次与结论不在任务详情展示。

如果任何来源或字段不足，输出缺口说明，不生成“待确认”占位标注，也不修改业务实现。

## 标注生成要求

- 核心验收页面 `scene-list` 至少生成一条标注，且只生成清单中的“大众通信重呼追溯”。
- 标注对象必须追溯 R-001、R-002、R-003，并由 `docs/interaction.html` 补充覆盖 R-004、R-005。
- `target`、`functionName`、`sourceRefs`、`fieldRefs` 必须与本提示词指定值完全一致。
- 字段说明必须按 FLD-001 至 FLD-004 逐行写明定义、逻辑、格式和异常。
- 缺少稳定锚点或资料时停止生成并报告缺口，不允许使用模糊 selector 或编造规则。

## 回写说明

生成结果经 PM 确认后，一次性写入本轮空的 `annotations/annotations.js`。回写后运行 `python3 tools/loop_run.py approve-annotations .`，重新校验 ID、来源、字段逐行说明、selector 与源码锚点语义合同，并刷新终态快照。
