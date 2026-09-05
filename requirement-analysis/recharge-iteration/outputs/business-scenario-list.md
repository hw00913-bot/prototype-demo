# 业务场景清单

> 项目：智能外呼中台充值功能迭代  
> 生成时间：2026-09-04T18:30:43+08:00  
> 本文档由结构化事实源自动汇编。

| ID | 业务场景 | 优先级 | 范围 | 状态 | 用户故事 | UI 承载 |
|---|---|---|---|---|---|---|
| SC-001 | 维护租户商用/试用标记 | P0 | in_scope | confirmed | US-001 | required |
| SC-002 | 为租户开通标准版年包 | P0 | in_scope | confirmed | US-002、US-004、US-006、US-008 | required |
| SC-003 | 在服务期内购买话费充值包 | P0 | in_scope | confirmed | US-003、US-004、US-006、US-008 | required |
| SC-004 | 冻结、释放并结算通讯额度 | P0 | in_scope | confirmed | US-004、US-005 | not_required |
| SC-005 | 充值管理员查看套餐、额度与内部充值记录 | P1 | in_scope | confirmed | US-001、US-002、US-003、US-004、US-005、US-006、US-008、US-009 | required |
| SC-006 | 读取并关联外部充值单 | P0 | out_of_scope | excluded_by_requirement | US-006 | not_required |
| SC-007 | 按商用/试用实施差异化计费 | P1 | out_of_scope | excluded_by_requirement | US-001 | not_required |
| SC-008 | 租户用户从右上角查看当前租户用量及按日/任务明细 | P0 | in_scope | confirmed | US-004、US-007 | required |
| SC-009 | 充值管理员手工调增或调减租户使用时长/可用分钟数 | P0 | in_scope | confirmed | US-004、US-005、US-009 | required |

## 汇总

- 场景总数：9
- 本期场景：7
- 非本期场景：2
