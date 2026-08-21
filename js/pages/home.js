/**
 * js/pages/home.js — 首页用量余额
 * 合并充值方案 home 与中科金首页，展示统一工作台入口与用量概览。
 */
(function () {
  'use strict';

  var DEFAULT_TENANT = '重庆东风南方渝兴';

  function normalizeTenantName(name) {
    return String(name || '').replace(/东风南方|东南方|南方/g, '').trim();
  }

  function formatMinutes(value) {
    return Number(value || 0).toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' 分钟';
  }

  function formatLocalDate(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function currentBizDate() { return formatLocalDate(new Date()); }

  function amountToMinutes(amount, unitPrice) {
    var price = Number(unitPrice || 0);
    return price > 0 ? Number(amount || 0) / price : 0;
  }

  function isRechargeActivated(row) {
    return !!(row && (row.activated === true || row.validityActivated === true));
  }

  function canAddCallBalance(row) {
    return row.rechargeStatus === '已支付' && (row.billingType === '仅通话费' || row.billingType === '坐席费+通话费');
  }

  function isFrozenExpired(createdAt) {
    if (!createdAt) return true;
    var created = new Date(createdAt.replace(/-/g, '/'));
    if (Number.isNaN(created.getTime())) return true;
    return ((new Date() - created) / (1000 * 60 * 60)) >= 24;
  }

  function getFrozenReleaseReason(task) {
    if (!task || task.status !== '冻结中') return '';
    if (task.taskStatus === '已完成') return '任务已完成';
    if (task.taskStatus === '已终止') return '任务已终止';
    if (isFrozenExpired(task.createdAt)) return '冻结超过24小时';
    return '';
  }

  function releaseFrozenTask(task, reason, releasedAt) {
    if (!task || task.status !== '冻结中' || !reason) return false;
    task.status = '已释放';
    task.releasedAt = releasedAt || formatLocalDateTime(new Date());
    task.releaseReason = reason;
    return true;
  }

  function formatLocalDateTime(date) {
    var h = String(date.getHours()).padStart(2, '0');
    var m = String(date.getMinutes()).padStart(2, '0');
    var s = String(date.getSeconds()).padStart(2, '0');
    return formatLocalDate(date) + ' ' + h + ':' + m + ':' + s;
  }

  function syncFrozenTaskReleases() {
    var releasedAt = formatLocalDateTime(new Date());
    var tasks = window.MockTenantFrozenTasks || [];
    return tasks.reduce(function (released, task) {
      var reason = getFrozenReleaseReason(task);
      return releaseFrozenTask(task, reason, releasedAt) ? released + 1 : released;
    }, 0);
  }

  /* ---- data accessors ---- */

  function getTenantRows() { return window.MockTenantRows || []; }
  function getPriceRules() { return window.MockTenantPriceRules || []; }
  function getHistoryRows() {
    window.MockTenantRechargeHistory = window.MockTenantRechargeHistory || [];
    return window.MockTenantRechargeHistory;
  }
  function getFrozenTasks() { return window.MockTenantFrozenTasks || []; }
  function getBalanceAdjustments() {
    window.MockTenantBalanceAdjustments = window.MockTenantBalanceAdjustments || [];
    return window.MockTenantBalanceAdjustments;
  }
  function getCallControlStates() {
    window.MockTenantCallControlStates = window.MockTenantCallControlStates || [];
    return window.MockTenantCallControlStates;
  }

  /* ---- billing summary ---- */

  function getHomeSummary(tenantName) {
    syncFrozenTaskReleases();

    var priceConfigs = getPriceRules().filter(function (item) {
      return normalizeTenantName(item.tenantName) === normalizeTenantName(tenantName) &&
        item.pricingScope === 'MODEL_DEFAULT' && !item.providerCode && item.status === '启用';
    });

    var largeConfig = priceConfigs.filter(function (item) { return item.modelType === '大模型'; });
    var smallConfig = priceConfigs.filter(function (item) { return item.modelType === '小模型'; });

    var paidRows = getHistoryRows().filter(function (item) {
      return item.status === '已支付' && normalizeTenantName(item.tenantName) === normalizeTenantName(tenantName);
    });
    var activatedRows = paidRows.filter(isRechargeActivated);

    var totalRechargeAmount = activatedRows.reduce(function (sum, item) {
      return sum + (canAddCallBalance({ rechargeStatus: item.status, billingType: item.billingType })
        ? Number(item.rechargeAmount || 0) : 0);
    }, 0);

    var adjustments = getBalanceAdjustments().filter(function (item) {
      return item.status === '已生效' && normalizeTenantName(item.tenantName) === normalizeTenantName(tenantName);
    });
    var adjustmentOutAmount = adjustments
      .filter(function (item) { return item.direction === 'OUT'; })
      .reduce(function (sum, item) { return sum + Number(item.amount || 0); }, 0);

    var tenant = getTenantRows().find(function (item) {
      return normalizeTenantName(item.name) === normalizeTenantName(tenantName);
    });
    var consumedAmount = Number(tenant && tenant.consumedAmount || 0);
    var balanceAmount = totalRechargeAmount - adjustmentOutAmount - consumedAmount;

    var frozenTasks = getFrozenTasks().filter(function (item) {
      return item.status === '冻结中' && normalizeTenantName(item.tenantName) === normalizeTenantName(tenantName);
    });
    var totalFrozenAmount = frozenTasks.reduce(function (sum, item) {
      return sum + Number(item.frozenMinutes || 0) * Number(item.unitPriceSnapshot || 0);
    }, 0);

    var availableAmount = Math.max(balanceAmount - totalFrozenAmount, 0);

    var largeUnitPrice = largeConfig.length > 0 ? Number(largeConfig[0].unitPrice || 0) : 0;
    var smallUnitPrice = smallConfig.length > 0 ? Number(smallConfig[0].unitPrice || 0) : 0;
    var largeAvailableMinutes = amountToMinutes(availableAmount, largeUnitPrice);
    var smallAvailableMinutes = amountToMinutes(availableAmount, smallUnitPrice);

    var validityRow = activatedRows
      .filter(function (item) { return item.validFrom && item.validFrom !== '-' && item.validTo && item.validTo !== '-'; })
      .sort(function (a, b) { return String(b.validTo).localeCompare(String(a.validTo)); })[0];

    var hasAvailableMinutes = availableAmount > 0 && (largeConfig.length > 0 || smallConfig.length > 0);
    var baseCanCall = !!validityRow && validityRow.validFrom <= currentBizDate() &&
      validityRow.validTo >= currentBizDate() && hasAvailableMinutes;
    var controlState = getCallControlStates().find(function (item) {
      return normalizeTenantName(item.tenantName) === normalizeTenantName(tenantName);
    });
    var manualEnabled = controlState ? controlState.enabled : true;
    var canCall = baseCanCall && manualEnabled;

    return {
      tenantName: tenantName,
      largeAvailableMinutes: largeAvailableMinutes,
      smallAvailableMinutes: smallAvailableMinutes,
      largeUnitPrice: largeUnitPrice,
      smallUnitPrice: smallUnitPrice,
      validity: validityRow ? validityRow.validFrom + ' ~ ' + validityRow.validTo : '未生成',
      canCall: canCall,
      callStatus: canCall ? '可发起' : '不可发起',
      callStatusCls: canCall ? 'tenant-call-status-ok' : 'tenant-call-status-disabled'
    };
  }

  /* ---- render ---- */

  function render() {
    var summary = getHomeSummary(DEFAULT_TENANT);
    return '' +
      '<div class="home-page">' +
        '<div class="home-header">' +
          '<div class="home-title">用量余额</div>' +
          '<div class="home-tenant-name">' + DEFAULT_TENANT + '</div>' +
        '</div>' +
        '<div class="home-card-grid" data-anno="home-usage-cards" data-anno-page="home" data-anno-label="用量余额" data-anno-kind="region">' +
          '<div class="home-card">' +
            '<div class="home-card-label">大模型可用分钟数</div>' +
            '<div class="home-card-value">' + formatMinutes(summary.largeAvailableMinutes) + '</div>' +
          '</div>' +
          '<div class="home-card">' +
            '<div class="home-card-label">小模型可用分钟数</div>' +
            '<div class="home-card-value">' + formatMinutes(summary.smallAvailableMinutes) + '</div>' +
          '</div>' +
          '<div class="home-card">' +
            '<div class="home-card-label">有效期</div>' +
            '<div class="home-card-value">' + summary.validity + '</div>' +
          '</div>' +
          '<div class="home-card">' +
            '<div class="home-card-label">呼叫控制状态</div>' +
            '<div class="home-card-value">' +
              '<span class="tenant-call-status ' + summary.callStatusCls + '">' + summary.callStatus + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function init() {}

  window.Pages = window.Pages || {};
  window.Pages['home'] = { render: render, init: init };
})();
