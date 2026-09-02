# 资料记录

> 本轮只读取用户明确指定的当前底座和对话中已确认的业务规则；无 LLM WIKI 输入。

## 使用规则

- 需求、字段、验收、交互说明和标注必须引用下表的 `SRC-*`。
- 参考底座只用于确定现有页面和实现边界，不得覆盖 PM 在 SRC-001 中确认的新规则。

## Sources

| Source ID | Type | Title | Received At | Key Points | Status / Coverage | Used In |
| --- | --- | --- | --- | --- | --- | --- |
| SRC-001 | PM 口述需求 | 大众通信重呼方式与人工确认规则 | 2026-09-02 | 无待呼号码时任务会完成，完成后任务内待重呼不再触发；支持定时重呼/任务重呼选择；定时重呼由人工配置且无对应接口；填写实际计划重呼次数，用于判断最后一次计划呼叫；用户明确要求修改原型、说明和标注。 | current / full | 全部本轮产物 |
| SRC-002 | 当前底座 | 智能外呼统一中台静态原型 | 2026-09-02 | 保留 `sys-scene` 大众任务 UUID 关联、`scene-list` 大众任务详情、`MockSceneRows`、`MockSceneList`、`MockDazhongTaskEditDetail` 与现有 B 端样式。 | current / scoped | 页面实现与回归验证 |
| SRC-003 | 现有业务文档 | `docs/功能说明文档.md` 与 `HANDOFF.md` | 2026-09-02 | 记录大众现有任务内重呼字段、详情展示和平台已有接入边界；本轮需用 SRC-001 的新决策更新该口径。 | current / scoped | 说明文档与历史兼容 |

## LLM WIKI

- 本轮未调用 LLM WIKI，不存在 wiki_ref、raw_ref 或 partial 输入。
