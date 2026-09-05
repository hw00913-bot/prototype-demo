/**
 * 首页：当前租户套餐、服务期与统一分钟池。
 * 与充值管理、使用情况共用 MockRechargeIteration，不从旧金额账本折算。
 */
(function () {
  'use strict';

  function escapeText(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function formatMinutes(value) {
    return Number(value || 0).toLocaleString('zh-CN', { maximumFractionDigits: 0 });
  }

  function render() {
    var data = window.MockRechargeIteration || {};
    var auth = window.getDemoAuth ? window.getDemoAuth() : (data.authContexts || {})[data.activeAuthKey];
    var tenantRole = auth && ['tenant_user', 'recharge_admin'].indexOf(auth.role) !== -1;
    var canViewTenant = tenantRole && auth.currentTenantId &&
      (auth.accessibleTenantIds || []).some(function (id) { return String(id) === String(auth.currentTenantId); });
    if (tenantRole && !canViewTenant) {
      return '<div class="home-page"><div class="home-header"><div class="home-title">套餐与用量</div><p class="home-tenant-name">当前租户信息暂不可用，请重新选择登录租户。</p></div></div>';
    }
    if (!canViewTenant) {
      if (!auth || auth.role !== 'super_admin') {
        return '<div class="home-page"><div class="home-header"><div class="home-title">平台工作台</div><p class="home-tenant-name">创建租户、充值和手工调增调减仅由超级管理员操作。</p></div></div>';
      }
      return '<div class="home-page"><div class="home-header"><div class="home-title">平台工作台</div><p class="home-tenant-name">在租户管理中维护租户套餐、服务有效期及充值记录。</p></div>' +
        '<div class="home-overview"><h2 class="home-overview-title">租户服务管理</h2><p class="home-description">开通套餐、购买话费充值包，或手工调整服务时长与可用分钟。</p><button class="btn btn-primary" onclick="window.Nav.navigateTo(\'sys-tenant\', \'sys-tenant\')">进入租户管理</button></div></div>';
    }
    var tenant = (data.tenants || []).find(function (item) { return String(item.id) === String(auth.currentTenantId); });
    if (!tenant) {
      return '<div class="home-page"><div class="home-header"><div class="home-title">套餐与用量</div><p class="home-tenant-name">当前租户信息暂不可用，请重新选择登录租户。</p></div></div>';
    }
    if (tenant.usageState === 'error') {
      return '<div class="home-page"><div class="home-header"><div class="home-title">套餐与用量</div><p class="home-tenant-name">' + escapeText(tenant.name) + '</p></div>' +
        '<div class="home-overview"><h2 class="home-overview-title">账户信息加载失败</h2><p class="home-description">暂时无法获取套餐与用量信息，请重试。</p><button class="btn btn-primary" onclick="window.Pages.home.retry()">重新加载</button></div></div>';
    }

    var entitlement = tenant.entitlement || {};
    var pool = tenant.unifiedMinutePool || {};
    var status = entitlement.status || 'not_opened';
    var statusText = { active: '服务有效', expired: '服务已过期', not_opened: '未开通' }[status] || '未开通';
    var product = (data.products || {})[entitlement.productType];
    var packageName = status === 'not_opened' ? '未开通套餐' : (product ? product.name : '服务套餐');
    var flag = tenant.commercialFlag === 'commercial' ? 'commercial' : 'trial';
    var validity = entitlement.effectiveAt && entitlement.expiresAt
      ? escapeText(entitlement.effectiveAt.slice(0, 10)) + '<br><span class="home-validity-separator">至 </span>' + escapeText(entitlement.expiresAt.slice(0, 10))
      : '—';
    var control = (window.MockTenantCallControlStates || []).find(function (item) { return item.tenantName === tenant.name; });
    var canCall = status === 'active' && Number(pool.availableMinutes) > 0 && (!control || control.enabled !== false);
    var callHint = status !== 'active' ? '请联系管理员开通有效套餐'
      : (Number(pool.availableMinutes) <= 0 ? '可用分钟不足，请联系管理员充值'
        : (control && control.enabled === false ? '外呼已被管理员暂停' : '服务有效且可用分钟充足'));
    return '<div class="home-page" data-current-tenant-id="' + escapeText(tenant.id) + '">' +
      '<div class="home-header"><div class="home-title">套餐与用量</div><div class="home-tenant-name">当前租户 · ' + escapeText(tenant.name) +
        ' <span class="tenant-commercial-tag ' + flag + '">' + (flag === 'commercial' ? '商用' : '试用') + '</span></div></div>' +
      '<section class="home-card-grid" data-anno="home-tenant-overview" data-anno-page="home" data-anno-label="当前租户套餐与统一分钟余额" data-anno-kind="region" data-anno-fields="FLD-002,FLD-003,FLD-004,FLD-006,FLD-007,FLD-008,FLD-021,FLD-051">' +
        '<div class="home-card"><div class="home-card-label">当前套餐</div><div class="home-card-value">' + escapeText(packageName) + '</div><p class="home-card-note">' + statusText + '</p></div>' +
        '<div class="home-card home-card-primary"><div class="home-card-label">可用分钟</div><div class="home-card-value">' + formatMinutes(pool.availableMinutes) + '<span class="home-value-unit">分钟</span></div><p class="home-card-note">统一分钟池，大/小模型共用</p></div>' +
        '<div class="home-card"><div class="home-card-label">服务有效期</div><div class="home-card-value home-validity">' + validity + '</div><p class="home-card-note">' + statusText + '</p></div>' +
        '<div class="home-card"><div class="home-card-label">呼叫状态</div><div class="home-card-value"><span class="tenant-call-status ' + (canCall ? 'tenant-call-status-ok' : 'tenant-call-status-disabled') + '">' + (canCall ? '可发起外呼' : '暂不可外呼') + '</span></div><p class="home-card-note">' + callHint + '</p></div>' +
      '</section><p class="home-description">' + (auth.role === 'tenant_user'
        ? '按日消耗和每日任务明细可在右上角账户菜单的“使用情况”中查看。'
        : '当前账号可查看本租户套餐状况，无充值及手工调增调减权限；本演示账号不提供使用情况明细入口。') + '</p></div>';
  }

  function retry() {
    var data = window.MockRechargeIteration || {};
    var auth = window.getDemoAuth && window.getDemoAuth();
    var tenant = (data.tenants || []).find(function (item) { return auth && String(item.id) === String(auth.currentTenantId); });
    if (tenant) tenant.usageState = 'loaded';
    window.Nav.navigateTo('home', 'nav-home');
  }

  window.Pages = window.Pages || {};
  window.Pages.home = { render: render, init: function () {}, retry: retry };
})();
