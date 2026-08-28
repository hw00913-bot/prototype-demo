# 资料来源记录

> 本文件记录输入资料的 `SRC-*` 编号，用于追溯字段和业务规则来源。

## 资料来源列表

| SRC-ID | 资料名称 | 类型 | 位置 | 状态 | 说明 |
|--------|----------|------|------|------|------|
| SRC-001 | 一知科技接入_v1.0 | 参考项目 | demo_AI_call/releases_demo/一知科技接入_v1.0/ | partial | 包含report-call, result-records, scene-list, sys-scene页面 |
| SRC-002 | 中科金接入_demo_v1.0 | 参考项目 | demo_AI_call/releases_demo/中科金接入_demo_v1.0/ | partial | 包含完整功能模块 |
| SRC-003 | 电声接入_demo_v1.0 | 参考项目 | demo_AI_call/releases_demo/电声接入_demo_v1.0/ | partial | 包含report-billing, report-call, result-clue, result-records, scene-block, scene-list, sys-scene, sys-tags, sys-tenant页面 |
| SRC-004 | 冰兰接入_v1.0 | 参考项目 | demo_AI_call/releases_demo/冰兰接入_v1.0/ | partial | 包含基础功能模块 |
| SRC-005 | 全平台统一状态映射与厚朴 OpenAPI v2 | LLM Wiki 当前知识 | `01_WIKI_LLM/wiki/概念对齐/厚朴任务.md`、`通话状态码.md`、`外呼任务状态.md` | current | 当前任务/通话状态映射及厚朴接入口径；旧 `厚朴接入_demo_v1.0` 仅作历史视觉参考，不得作为接口或状态事实源 |
| SRC-006 | 大众通信接入_demo_v1.1 | 参考项目 | demo_AI_call/releases_demo/大众通信接入_demo_v1.1/ | partial | 包含report-billing, report-call, result-clue, result-records, scene-list, sys-scene, sys-tags, sys-tenant页面 |
| SRC-007 | 意向标签管理_demo_v1.0 | 参考项目 | demo_AI_call/releases_demo/意向标签管理_demo_v1.0/ | partial | 标签管理功能 |
| SRC-008 | 智能外呼中台_demo_v1.0 | 参考项目 | demo_AI_call/releases_demo/智能外呼中台_demo_v1.0/ | partial | 基础中台功能 |
| SRC-009 | 充值方案_demo_v1.0 | 参考项目 | demo_AI_call/releases_demo/充值方案_demo_v1.0/ | partial | 计费和充值功能 |
| SRC-010 | 线索报表_v1.0 | 参考项目 | demo_AI_call/releases_demo/线索报表_v1.0/ | partial | 线索统计功能 |
| SRC-011 | 厚朴任务关联方式变更 | 用户确认的产品规则 | 当前需求（2026-08-27） | current | 厚朴不再由中台调用创建接口；直接输入平台已有 `task_id`，查询成功后保存场景关联。该规则优先于 SRC-005 中旧的任务创建口径 |
| SRC-012 | 厚朴开发评审补充规则 | 用户确认的产品规则 | 当前需求（2026-08-28） | current | 厚朴使用模拟的服务端默认账号；同一 `task_id` 不得关联多个业务场景；打开任务页或主动查询时实时读取厚朴任务状态；770–790 按已确认的中台本地映射规则执行 |

## 资料使用说明

- SRC-011 是厚朴任务关联方式的最新口径；SRC-012 补充默认账号、唯一关联、实时状态与本地映射规则。与 SRC-005 冲突时以 SRC-011、SRC-012 为准
- 除 SRC-005、SRC-011 外，参考项目均为部分使用（partial）；SRC-005 使用知识库当前版本（current）
- 资料中的JS文件作为功能参考，用于整合到当前项目
- Mock数据基于各资料中的数据重新整理

## 待核对内容

1. 各平台新增原始状态值是否需要扩充中台枚举
2. 厚朴联调环境的机器人、模板、默认账号和回调真实字段差异
3. 页面功能完整性
