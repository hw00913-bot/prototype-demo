/**
 * js/pages/usage.js — 当前登录租户使用情况
 * 只从登录态 currentTenantId 取数，不接受页面传入任意租户覆盖。
 */
(function () {
  'use strict';

  var lastListScrollTop = 0;
  var restoreListScroll = false;

  function getData() {
    return window.MockRechargeIteration || { tenants: [], authContexts: {}, dailyUsage: {} };
  }

  function getAuth() {
    var data = getData();
    return (data.authContexts || {})[data.activeAuthKey] || null;
  }

  function getCurrentTenant() {
    var auth = getAuth();
    if (!auth || auth.role !== 'tenant_user' || !auth.currentTenantId) return null;
    return (getData().tenants || []).find(function (tenant) { return String(tenant.id) === String(auth.currentTenantId); }) || null;
  }

  function formatMinutes(value) {
    return Number(value || 0).toLocaleString('zh-CN') + ' 分钟';
  }

  function statusMeta(status) {
    var map = {
      active: { text: '有效', cls: 'active' },
      expired: { text: '已过期', cls: 'expired' },
      not_opened: { text: '未开通', cls: 'not-opened' }
    };
    return map[status] || map.not_opened;
  }

  function formatValidity(entitlement) {
    if (!entitlement || !entitlement.effectiveAt || !entitlement.expiresAt) return '—';
    return entitlement.effectiveAt.slice(0, 10) + ' 至 ' + entitlement.expiresAt.slice(0, 10);
  }

  function renderUnauthorized() {
    return '<div class="usage-page"><div class="usage-state-card usage-unauthorized" data-anno="usage-access-denied" data-anno-page="usage" data-anno-label="使用情况权限拦截" data-anno-kind="region" data-anno-fields="FLD-004,FLD-005"><div class="usage-state-icon">🔒</div><h2>当前账号无使用情况查看权限</h2><p>超级管理员及非租户账号不展示入口，直接访问也不会返回任何租户明细。</p></div></div>';
  }

  function renderOverview(tenant) {
    var entitlement = tenant.entitlement || {};
    var pool = tenant.unifiedMinutePool || {};
    var meta = statusMeta(entitlement.status);
    return '<section class="usage-overview" data-anno="usage-current-tenant-overview" data-anno-page="usage" data-anno-label="当前租户有效期与可用分钟" data-anno-kind="region" data-anno-fields="FLD-002,FLD-004,FLD-006,FLD-007,FLD-008,FLD-021">' +
      '<div class="usage-tenant-heading"><div><span>当前登录租户</span><h1>' + tenant.name + '</h1><small>' + tenant.id + '</small></div><em class="tenant-commercial-tag ' + tenant.commercialFlag + '">' + tenant.commercialFlagLabel + '</em></div>' +
      '<div class="usage-metric-grid"><div class="usage-metric"><span>服务状态</span><strong><em class="tenant-service-status ' + meta.cls + '">' + meta.text + '</em></strong><small>' + formatValidity(entitlement) + '</small></div><div class="usage-metric primary"><span>可用分钟</span><strong>' + formatMinutes(pool.availableMinutes) + '</strong><small>统一分钟池，大/小模型共用</small></div></div>' +
    '</section>';
  }

  function renderDailyRows(tenantId) {
    var rows = (getData().dailyUsage || {})[tenantId] || [];
    if (!rows.length) {
      return '<div class="usage-inline-empty" data-anno="usage-daily-empty" data-anno-page="usage" data-anno-label="按日使用明细空状态" data-anno-kind="region" data-anno-fields="FLD-041,FLD-042"><div>暂无已结算通话分钟</div><p>有已接通通话完成结算后，将按自然日展示消耗。</p></div>';
    }
    return '<div class="usage-table-wrap"><table class="usage-table"><thead><tr><th>日期</th><th>当日消耗通话分钟</th><th>操作</th></tr></thead><tbody>' + rows.map(function (item) {
      return '<tr><td>' + item.date + '</td><td><strong>' + formatMinutes(item.dailyConsumedMinutes) + '</strong></td><td><button class="usage-detail-link" onclick="window.Pages.usage.openDailyDetail(\'' + item.date + '\')">查看任务明细</button></td></tr>';
    }).join('') + '</tbody></table></div>';
  }

  function renderTenantPage(tenant) {
    if (tenant.usageState === 'error') {
      return '<div class="usage-page"><div class="usage-page-header"><span>租户自助</span><h1>使用情况</h1></div><div class="usage-state-card" data-anno="usage-load-error" data-anno-page="usage" data-anno-label="使用情况加载失败与重试" data-anno-kind="region" data-anno-fields="FLD-004,FLD-021,FLD-041"><div class="usage-state-icon error">!</div><h2>使用情况加载失败</h2><p>当前为异常演示状态，未返回或拼接其他租户数据。</p><button class="btn btn-primary" onclick="window.Pages.usage.retry()">重新加载</button></div></div>';
    }
    var expiredNotice = tenant.usageState === 'expired'
      ? '<div class="usage-expired-notice" data-anno="usage-expired-state" data-anno-page="usage" data-anno-label="服务已过期状态" data-anno-kind="region" data-anno-fields="FLD-006,FLD-008">当前服务已过期，余额仅供查询，无法继续发起外呼。</div>'
      : '';
    return '<div class="usage-page">' +
      '<div class="usage-page-header"><span>租户自助</span><h1>使用情况</h1><p>查看当前登录租户的服务有效期、可用分钟与日消耗。</p></div>' +
      expiredNotice + renderOverview(tenant) +
      '<section class="usage-daily-card" data-anno="usage-daily-list" data-anno-page="usage" data-anno-label="按日消耗通话分钟" data-anno-kind="region" data-anno-fields="FLD-041,FLD-042"><div class="usage-section-heading"><div><h2>使用明细</h2><p>按日统计已接通并完成结算的通话分钟，未接通不计入。</p></div><span>当前租户</span></div>' + renderDailyRows(tenant.id) + '</section>' +
    '</div>';
  }

  function getDailySummary(tenantId, date) {
    return ((getData().dailyUsage || {})[tenantId] || []).find(function (item) { return item.date === date; }) || null;
  }

  function getTaskDetailState(tenantId, date) {
    return (((getData().taskUsageStates || {})[tenantId] || {})[date]) || 'loaded';
  }

  function renderTaskDetailState(tenant, date, kind, message) {
    var isError = kind === 'error';
    return '<div class="usage-page usage-task-detail-page"><div class="usage-detail-toolbar"><button class="usage-back-link" data-anno="usage-detail-state-back" data-anno-page="usage" data-anno-label="从任务状态返回按日明细" data-anno-kind="action" data-anno-fields="FLD-041" onclick="window.Pages.usage.backToDailyList()">← 返回使用情况</button></div><div class="usage-state-card" data-anno="usage-task-state" data-anno-page="usage" data-anno-label="任务分钟明细状态" data-anno-kind="region" data-anno-fields="FLD-002,FLD-004,FLD-041,FLD-043,FLD-045"><div class="usage-state-icon ' + (isError ? 'error' : '') + '">' + (isError ? '!' : '∅') + '</div><h2>' + (isError ? '任务明细加载失败' : '暂无任务分钟明细') + '</h2><p>' + message + '</p>' + (isError ? '<button class="btn btn-primary" onclick="window.Pages.usage.retryTaskDetail(\'' + date + '\')">重新加载</button>' : '') + '<small>' + tenant.name + ' · ' + date + '</small></div></div>';
  }

  function renderTaskDetailForTenant(date, requestedTenantId) {
    var auth = getAuth();
    if (!auth || auth.role !== 'tenant_user' || !auth.currentTenantId) return renderUnauthorized();
    if (requestedTenantId && String(requestedTenantId) !== String(auth.currentTenantId)) return renderUnauthorized();
    var tenant = getCurrentTenant();
    if (!tenant) return renderUnauthorized();
    var daily = getDailySummary(tenant.id, date);
    if (!daily) return renderTaskDetailState(tenant, date, 'empty', '所选日期没有当前租户的日汇总记录，未生成伪任务数据。');
    if (getTaskDetailState(tenant.id, date) === 'error') return renderTaskDetailState(tenant, date, 'error', '当前为异常演示状态，未返回或拼接其他租户任务。');
    var tasks = (((getData().taskUsage || {})[tenant.id] || {})[date]) || [];
    if (!tasks.length) return renderTaskDetailState(tenant, date, 'empty', '该日没有可展示的已结算任务记录。');
    var total = tasks.reduce(function (sum, item) { return sum + Number(item.consumedMinutes || 0); }, 0);
    var consistent = total === Number(daily.dailyConsumedMinutes || 0);
    var rows = tasks.map(function (item) {
      return '<tr><td><strong>' + item.taskId + '</strong></td><td>' + item.taskName + '</td><td><span class="usage-model-tag">' + item.modelType + '</span></td><td>' + Number(item.connectedCalls || 0).toLocaleString('zh-CN') + '</td><td>' + Number(item.unconnectedCalls || 0).toLocaleString('zh-CN') + '</td><td><strong>' + formatMinutes(item.consumedMinutes) + '</strong></td></tr>';
    }).join('');
    return '<div class="usage-page usage-task-detail-page" data-anno="usage-task-detail" data-anno-page="usage" data-anno-label="每日任务分钟消耗明细" data-anno-kind="region" data-anno-fields="FLD-002,FLD-004,FLD-041,FLD-043,FLD-044,FLD-045,FLD-046">' +
      '<div class="usage-detail-toolbar"><button class="usage-back-link" data-anno="usage-detail-back" data-anno-page="usage" data-anno-label="返回按日使用明细" data-anno-kind="action" data-anno-fields="FLD-041" onclick="window.Pages.usage.backToDailyList()">← 返回使用情况</button></div>' +
      '<div class="usage-page-header"><span>使用情况 / 任务明细</span><h1>' + date + ' 任务分钟消耗</h1><p>仅展示当前登录租户当日已结算任务。</p></div>' +
      '<div class="usage-detail-context"><div><span>当前租户</span><strong>' + tenant.name + '</strong><small>' + tenant.id + '</small></div><div><span>日期</span><strong>' + date + '</strong></div><div><span>一级日汇总</span><strong>' + formatMinutes(daily.dailyConsumedMinutes) + '</strong></div></div>' +
      (!consistent ? '<div class="usage-data-mismatch" data-anno="usage-task-mismatch" data-anno-page="usage" data-anno-label="任务合计与日汇总不一致" data-anno-kind="region" data-anno-fields="FLD-042,FLD-045,FLD-046">数据异常：任务合计 ' + formatMinutes(total) + '，与一级日汇总 ' + formatMinutes(daily.dailyConsumedMinutes) + ' 不一致。页面不会静默修正。</div>' : '') +
      '<section class="usage-daily-card usage-task-card"><div class="usage-section-heading"><div><h2>任务消耗明细</h2><p>已接通不足 1 分钟按 1 分钟计量，未接通不消耗分钟。</p></div><span>' + tasks.length + ' 个任务</span></div>' +
        '<div class="usage-table-wrap" data-anno="usage-task-table" data-anno-page="usage" data-anno-label="任务分钟消耗列表" data-anno-kind="region" data-anno-fields="FLD-043,FLD-044,FLD-045"><table class="usage-table usage-task-table"><thead><tr><th>任务 ID</th><th>任务名称</th><th>模型</th><th>已接通</th><th>未接通</th><th>消耗分钟</th></tr></thead><tbody>' + rows + '</tbody><tfoot><tr data-anno="usage-task-total" data-anno-page="usage" data-anno-label="任务分钟当日合计" data-anno-kind="status" data-anno-fields="FLD-042,FLD-045,FLD-046"><td colspan="5">当日合计 <small>' + (consistent ? '与一级日汇总一致' : '数据异常') + '</small></td><td><strong>' + formatMinutes(total) + '</strong></td></tr></tfoot></table></div>' +
      '</section></div>';
  }

  function renderForTenant(requestedTenantId) {
    var auth = getAuth();
    if (!auth || auth.role !== 'tenant_user' || !auth.currentTenantId) return renderUnauthorized();
    if (requestedTenantId && String(requestedTenantId) !== String(auth.currentTenantId)) return renderUnauthorized();
    var tenant = getCurrentTenant();
    return tenant ? renderTenantPage(tenant) : renderUnauthorized();
  }

  function render() {
    return renderForTenant();
  }

  function retry() {
    var tenant = getCurrentTenant();
    if (!tenant) return;
    tenant.usageState = 'loaded';
    if (window.Nav) window.Nav.navigateTo('usage', 'usage');
    if (window.showToast) window.showToast('使用情况已重新加载', 'success');
  }

  function openDailyDetail(date, requestedTenantId, preserveScroll) {
    var usagePage = document.querySelector('.usage-page');
    if (!preserveScroll && usagePage) lastListScrollTop = usagePage.scrollTop;
    var container = document.getElementById('page-content');
    if (!container) return;
    container.innerHTML = renderTaskDetailForTenant(date, requestedTenantId);
    var breadcrumb = document.getElementById('breadcrumb');
    if (breadcrumb) breadcrumb.innerHTML = '<span class="bc-current">使用情况 / 任务明细</span>';
  }

  function backToDailyList() {
    restoreListScroll = true;
    if (window.Nav) window.Nav.navigateTo('usage', 'usage');
  }

  function retryTaskDetail(date) {
    var tenant = getCurrentTenant();
    if (!tenant) return;
    getData().taskUsageStates = getData().taskUsageStates || {};
    getData().taskUsageStates[tenant.id] = getData().taskUsageStates[tenant.id] || {};
    getData().taskUsageStates[tenant.id][date] = 'loaded';
    openDailyDetail(date, tenant.id, true);
    if (window.showToast) window.showToast('任务明细已重新加载', 'success');
  }

  function init() {
    if (!restoreListScroll) return;
    restoreListScroll = false;
    setTimeout(function () {
      var page = document.querySelector('.usage-page');
      if (page) page.scrollTop = lastListScrollTop;
    }, 0);
  }

  window.Pages = window.Pages || {};
  window.Pages.usage = {
    render: render,
    renderForTenant: renderForTenant,
    renderTaskDetailForTenant: renderTaskDetailForTenant,
    init: init,
    retry: retry,
    openDailyDetail: openDailyDetail,
    backToDailyList: backToDailyList,
    retryTaskDetail: retryTaskDetail
  };
})();
