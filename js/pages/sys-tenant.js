/**
 * js/pages/sys-tenant.js — 租户管理页
 * 基于原租户管理页迭代充值方案：
 * - 租户列表展示商用/试用标记、服务状态、有效期和租户级统一分钟池
 * - 操作列包含：充值管理、管理呼叫、编辑、删除
 * - 充值管理抽屉（三 Tab：计费明细、充值单管理、余额调整）
 * - 充值单关联（支持付费单读取校验反显、试用单按月换算、二次确认关联、历史记录逐单生效确认时长/余额）
 * - 余额调整 Tab（手工扣减弹窗、调整流水）
 * - 计费配置弹窗（大/小模型默认单价及启用/停用）
 * - 导出租户计费汇总 CSV（实时汇总大/小模型可用分钟、充值、扣费、冻结等）
 * - 顶部筛选栏统一复用全局标准 .filter-bar 组件规范
 */
(function () {
  'use strict';

  var StatusMeta = {
    '已支付': { cls: 'tenant-status-paid', text: '已支付' },
    '未支付': { cls: 'tenant-status-pending', text: '未支付' },
    '查询失败': { cls: 'tenant-status-error', text: '查询失败' },
    '不存在': { cls: 'tenant-status-invalid', text: '不存在' },
    '已取消': { cls: 'tenant-status-cancelled', text: '已取消' }
  };

  function getTenantRows() {
    return window.MockTenantRows || [];
  }

  function canManageTenantBilling() {
    var auth = window.getDemoAuth && window.getDemoAuth();
    return !!(auth && auth.role === 'super_admin');
  }

  function requireTenantBillingPermission() {
    if (canManageTenantBilling()) return true;
    showToast('仅超级管理员可创建租户、充值或手工调增调减', 'warning');
    return false;
  }

  function onAuthChanged() {
    closeRechargeForm();
    closeIterationAdjustmentForm();
    closeTenantFormModal();
    closeAdjustmentModal();
    closeActivationDurationModal();
    var drawer = document.getElementById('tenantBillingBackdrop');
    if (drawer) drawer.remove();
  }

  function getRechargeIteration() {
    window.MockRechargeIteration = window.MockRechargeIteration || { tenants: [] };
    window.MockRechargeIteration.tenants = window.MockRechargeIteration.tenants || [];
    return window.MockRechargeIteration;
  }

  function getTenantIterationProfile(tenantRef, createIfMissing) {
    var tenantId = typeof tenantRef === 'object' ? tenantRef.tenantId : '';
    var tenantName = typeof tenantRef === 'object' ? tenantRef.name : tenantRef;
    var profiles = getRechargeIteration().tenants;
    var profile = profiles.find(function (item) {
      return (tenantId && String(item.id) === String(tenantId)) ||
        normalizeTenantName(item.name) === normalizeTenantName(tenantName);
    });
    if (profile || !createIfMissing) return profile || null;
    profile = {
      id: String(tenantId || ('tenant-' + Date.now())),
      name: tenantName || '未知租户',
      type: tenantRef && tenantRef.type || '门店',
      commercialFlag: 'trial',
      commercialFlagLabel: '试用',
      entitlement: { status: 'not_opened', effectiveAt: '', expiresAt: '', durationDays: 0 },
      unifiedMinutePool: { availableMinutes: 0, frozenMinutes: 0, consumedMinutes: 0, accountVersion: 'NEW-001' },
      usageState: 'empty'
    };
    profiles.push(profile);
    return profile;
  }

  function serviceStatusMeta(status) {
    var map = {
      not_opened: { text: '未开通', cls: 'not-opened' },
      active: { text: '有效', cls: 'active' },
      expired: { text: '已过期', cls: 'expired' }
    };
    return map[status] || map.not_opened;
  }

  function iterationValidity(profile) {
    var entitlement = profile && profile.entitlement || {};
    if (!entitlement.effectiveAt || !entitlement.expiresAt) return '—';
    return entitlement.effectiveAt.slice(0, 10) + ' 至 ' + entitlement.expiresAt.slice(0, 10);
  }

  function formatWholeMinutes(value) {
    return Number(value || 0).toLocaleString('zh-CN') + ' 分钟';
  }

  function getUnifiedMinuteProfile(tenantId) {
    return (getRechargeIteration().tenants || []).find(function (item) { return String(item.id) === String(tenantId); }) || null;
  }

  function calculateBilledMinutes(callResults) {
    return (callResults || []).reduce(function (sum, call) {
      if (!call || !call.connected) return sum;
      return sum + Math.max(1, Math.ceil(Number(call.durationSeconds || 0) / 60));
    }, 0);
  }

  function canStartUnifiedTask(tenantId, estimatedMinutes) {
    var profile = getUnifiedMinuteProfile(tenantId);
    var estimate = Number(estimatedMinutes || 0);
    var active = !!(profile && profile.entitlement && profile.entitlement.status === 'active');
    var available = Number(profile && profile.unifiedMinutePool && profile.unifiedMinutePool.availableMinutes || 0);
    return {
      allowed: active && Number.isFinite(estimate) && estimate > 0 && available >= estimate,
      availableMinutes: available,
      estimatedMinutes: estimate,
      reason: !active ? 'service_inactive' : (available < estimate ? 'insufficient_minutes' : '')
    };
  }

  function startUnifiedTask(data) {
    var check = canStartUnifiedTask(data && data.tenantId, data && data.estimatedMinutes);
    if (!check.allowed) return check;
    var profile = getUnifiedMinuteProfile(data.tenantId);
    var existing = (getRechargeIteration().freezeLedger || []).find(function (item) { return item.taskId === data.taskId; });
    if (existing) return Object.assign({}, check, { allowed: false, reason: 'duplicate_task' });
    profile.unifiedMinutePool.availableMinutes -= check.estimatedMinutes;
    profile.unifiedMinutePool.frozenMinutes += check.estimatedMinutes;
    var record = {
      taskId: data.taskId,
      tenantId: data.tenantId,
      sceneName: data.sceneName || '未命名任务',
      estimatedMinutes: check.estimatedMinutes,
      actualConsumedMinutes: 0,
      releasedMinutes: 0,
      status: 'frozen',
      taskStatus: 'running'
    };
    getRechargeIteration().freezeLedger.push(record);
    return Object.assign({}, check, { task: record });
  }

  function settleUnifiedTask(taskId, callResults, taskStatus) {
    var task = (getRechargeIteration().freezeLedger || []).find(function (item) { return item.taskId === taskId; });
    if (!task) return { changed: false, reason: 'task_not_found' };
    if (task.status !== 'frozen') return { changed: false, reason: 'already_released', task: task };
    var profile = getUnifiedMinuteProfile(task.tenantId);
    if (!profile) return { changed: false, reason: 'tenant_not_found' };
    var estimated = Number(task.estimatedMinutes || 0);
    var actual = taskStatus === 'terminated' ? 0 : calculateBilledMinutes(callResults);
    if (actual > estimated + Number(profile.unifiedMinutePool.availableMinutes || 0)) {
      return { changed: false, reason: 'insufficient_minutes_for_settlement', actualConsumedMinutes: actual };
    }
    profile.unifiedMinutePool.frozenMinutes = Math.max(0, Number(profile.unifiedMinutePool.frozenMinutes || 0) - estimated);
    profile.unifiedMinutePool.availableMinutes = Number(profile.unifiedMinutePool.availableMinutes || 0) + estimated - actual;
    profile.unifiedMinutePool.consumedMinutes = Number(profile.unifiedMinutePool.consumedMinutes || 0) + actual;
    task.actualConsumedMinutes = actual;
    task.releasedMinutes = Math.max(0, estimated - actual);
    task.taskStatus = taskStatus || 'completed';
    task.status = task.taskStatus === 'terminated' ? 'released' : 'settled';
    task.settledAt = getRechargeIteration().simulatedNow;
    return { changed: true, task: task, availableMinutes: profile.unifiedMinutePool.availableMinutes, frozenMinutes: profile.unifiedMinutePool.frozenMinutes, consumedMinutes: profile.unifiedMinutePool.consumedMinutes };
  }

  function releaseUnifiedTask(taskId, reason) {
    var task = (getRechargeIteration().freezeLedger || []).find(function (item) { return item.taskId === taskId; });
    if (!task) return { changed: false, reason: 'task_not_found' };
    if (task.status !== 'frozen') return { changed: false, reason: 'already_released', task: task };
    var profile = getUnifiedMinuteProfile(task.tenantId);
    if (!profile) return { changed: false, reason: 'tenant_not_found' };
    var estimated = Number(task.estimatedMinutes || 0);
    profile.unifiedMinutePool.frozenMinutes = Math.max(0, Number(profile.unifiedMinutePool.frozenMinutes || 0) - estimated);
    profile.unifiedMinutePool.availableMinutes = Number(profile.unifiedMinutePool.availableMinutes || 0) + estimated;
    task.actualConsumedMinutes = 0;
    task.releasedMinutes = estimated;
    task.taskStatus = 'terminated';
    task.status = 'released';
    task.releaseReason = reason || '任务终止';
    task.settledAt = getRechargeIteration().simulatedNow;
    return { changed: true, task: task, availableMinutes: profile.unifiedMinutePool.availableMinutes, frozenMinutes: profile.unifiedMinutePool.frozenMinutes };
  }

  function syncUnifiedFrozenTaskReleases() {
    return (getRechargeIteration().freezeLedger || []).reduce(function (count, task) {
      if (task.status !== 'frozen') return count;
      if (task.taskStatus === 'terminated') return releaseUnifiedTask(task.taskId, '任务终止').changed ? count + 1 : count;
      if (task.taskStatus === 'completed') return settleUnifiedTask(task.taskId, task.callResults || [], 'completed').changed ? count + 1 : count;
      return count;
    }, 0);
  }

  function getBillingRows() {
    window.MockTenantBillingRows = window.MockTenantBillingRows || [];
    return window.MockTenantBillingRows;
  }

  function getOrders() {
    return window.MockRechargeOrders || [];
  }

  function statusTag(status) {
    var meta = StatusMeta[status] || StatusMeta['查询失败'];
    return '<span class="tenant-status ' + meta.cls + '">' + meta.text + '</span>';
  }

  function historyPaymentTag(item) {
    return item.orderType === '试用单'
      ? '<span class="tenant-status tenant-status-paid">无需支付</span>'
      : statusTag(item.status);
  }

  function getHistoryRows() {
    window.MockTenantRechargeHistory = window.MockTenantRechargeHistory || [];
    return window.MockTenantRechargeHistory;
  }

  function getFrozenTasks() {
    return window.MockTenantFrozenTasks || [];
  }

  function getBalanceAdjustments() {
    window.MockTenantBalanceAdjustments = window.MockTenantBalanceAdjustments || [];
    return window.MockTenantBalanceAdjustments;
  }

  function getPriceRules() {
    return window.MockTenantPriceRules || [];
  }

  function getCallControlStates() {
    window.MockTenantCallControlStates = window.MockTenantCallControlStates || [];
    return window.MockTenantCallControlStates;
  }

  function canGenerateValidity(row) {
    return row.rechargeStatus === '已支付' && (row.billingType === '仅坐席费' || row.billingType === '坐席费+通话费');
  }

  function canAddCallBalance(row) {
    return row.rechargeStatus === '已支付' && (row.billingType === '仅通话费' || row.billingType === '坐席费+通话费');
  }

  function isRechargeActivated(row) {
    return !!(row && (row.activated === true || row.validityActivated === true));
  }

  function canActivateRecharge(row) {
    return row && row.status === '已支付' && !isRechargeActivated(row);
  }

  function packageDays(packageName) {
    var map = { '半年套餐': 183, '全年套餐': 365 };
    return map[packageName] || 0;
  }

  function formatBalance(value) {
    return '¥' + Number(value || 0).toFixed(2);
  }

  function formatMinutes(value) {
    return Number(value || 0).toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' 分钟';
  }

  function formatUnitPrice(value) {
    return '¥' + Number(value || 0).toFixed(2) + '/分钟';
  }

  function adjustmentTypeText(type) {
    return type === 'MANUAL_DEDUCT' ? '手工扣减' : type;
  }

  function addDays(dateStr, days) {
    var date = new Date(dateStr.replace(/-/g, '/'));
    date.setDate(date.getDate() + Number(days || 0) - 1);
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function formatLocalDate(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function formatLocalDateTime(date) {
    var hours = String(date.getHours()).padStart(2, '0');
    var minutes = String(date.getMinutes()).padStart(2, '0');
    var seconds = String(date.getSeconds()).padStart(2, '0');
    return formatLocalDate(date) + ' ' + hours + ':' + minutes + ':' + seconds;
  }

  function currentBizDate() {
    return formatLocalDate(new Date());
  }

  function isFrozenExpired(createdAt) {
    if (!createdAt) return true;
    var created = new Date(createdAt.replace(/-/g, '/'));
    if (Number.isNaN(created.getTime())) return true;
    var hoursDiff = (new Date() - created) / (1000 * 60 * 60);
    return hoursDiff >= 24;
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

  function syncFrozenTaskReleases() {
    var releasedAt = formatLocalDateTime(new Date());
    var legacyReleased = getFrozenTasks().reduce(function (released, task) {
      var reason = getFrozenReleaseReason(task);
      return releaseFrozenTask(task, reason, releasedAt) ? released + 1 : released;
    }, 0);
    return legacyReleased + syncUnifiedFrozenTaskReleases();
  }

  function releaseFrozenTasksByScene(sceneName, taskStatus) {
    var releasedAt = formatLocalDateTime(new Date());
    var releasedCount = 0;
    var releasedAmount = 0;
    var releasedMinutes = 0;

    getFrozenTasks().forEach(function (task) {
      if (task.sceneName !== sceneName || task.status !== '冻结中') return;
      task.taskStatus = taskStatus;
      var reason = getFrozenReleaseReason(task);
      if (!releaseFrozenTask(task, reason, releasedAt)) return;
      releasedCount += 1;
      releasedAmount += Number(task.frozenMinutes || 0) * Number(task.unitPriceSnapshot || 0);
    });

    (getRechargeIteration().freezeLedger || []).forEach(function (task) {
      if (task.sceneName !== sceneName || task.status !== 'frozen') return;
      var result;
      if (taskStatus === '已完成' || taskStatus === 'completed') {
        result = settleUnifiedTask(task.taskId, task.callResults || [], 'completed');
      } else if (taskStatus === '已终止' || taskStatus === 'terminated') {
        result = releaseUnifiedTask(task.taskId, '任务终止');
      }
      if (!result || !result.changed) return;
      releasedCount += 1;
      releasedMinutes += Number(result.task.releasedMinutes || 0);
    });

    return { releasedCount: releasedCount, releasedAmount: releasedAmount, releasedMinutes: releasedMinutes };
  }

  function latestValidTo(tenantName) {
    var validDates = getHistoryRows()
      .filter(function (item) {
        return item.status === '已支付' &&
          isRechargeActivated(item) &&
          normalizeTenantName(item.tenantName) === normalizeTenantName(tenantName) &&
          item.validTo &&
          item.validTo !== '-';
      })
      .map(function (item) { return item.validTo; })
      .sort();
    return validDates.sort().pop() || '';
  }

  function getTenantPriceConfigs(tenantName, modelType) {
    return getPriceRules()
      .filter(function (item) {
        return normalizeTenantName(item.tenantName) === normalizeTenantName(tenantName) &&
          (!modelType || item.modelType === modelType) &&
          item.pricingScope === 'MODEL_DEFAULT' &&
          !item.providerCode &&
          item.status === '启用';
      })
      .sort(function (a, b) {
        return a.modelType === b.modelType ? 0 : (a.modelType === '大模型' ? -1 : 1);
      });
  }

  function resolveTenantUnitPrice(tenantName, modelType, providerCode) {
    var rules = getPriceRules().filter(function (item) {
      return normalizeTenantName(item.tenantName) === normalizeTenantName(tenantName) &&
        item.modelType === modelType &&
        item.status === '启用';
    });
    var providerRule = providerCode
      ? rules.find(function (item) { return item.pricingScope === 'PROVIDER_OVERRIDE' && item.providerCode === providerCode; })
      : null;
    return providerRule || rules.find(function (item) { return item.pricingScope === 'MODEL_DEFAULT' && !item.providerCode; }) || null;
  }

  function getTenantAllPriceConfigs(tenantName) {
    return getPriceRules()
      .filter(function (item) {
        return normalizeTenantName(item.tenantName) === normalizeTenantName(tenantName) &&
          item.pricingScope === 'MODEL_DEFAULT' &&
          !item.providerCode;
      })
      .sort(function (a, b) {
        return a.modelType === b.modelType ? 0 : (a.modelType === '大模型' ? -1 : 1);
      });
  }

  function amountToMinutes(amount, unitPrice) {
    var price = Number(unitPrice || 0);
    return price > 0 ? Number(amount || 0) / price : 0;
  }

  function formatMinuteRange(configs, amount) {
    var values = configs
      .map(function (item) { return amountToMinutes(amount, item.unitPrice); })
      .filter(function (value) { return Number.isFinite(value); });
    if (!values.length) return '未配置';
    var min = Math.min.apply(null, values);
    var max = Math.max.apply(null, values);
    if (Math.abs(max - min) < 0.005) return formatMinutes(min);
    return formatMinutes(min).replace(' 分钟', '') + ' ~ ' + formatMinutes(max);
  }

  function getTenantBaseRow(tenantName) {
    return getTenantRows().find(function (item) {
      return normalizeTenantName(item.name) === normalizeTenantName(tenantName);
    });
  }

  function getTenantBillingSummary(tenantName) {
    syncFrozenTaskReleases();
    var tenant = getTenantBaseRow(tenantName);

    var priceConfigs = getTenantAllPriceConfigs(tenantName);
    var largeConfigs = priceConfigs.filter(function (item) { return item.modelType === '大模型' && item.status === '启用'; });
    var smallConfigs = priceConfigs.filter(function (item) { return item.modelType === '小模型' && item.status === '启用'; });
    var paidRows = getHistoryRows().filter(function (item) {
      return item.status === '已支付' &&
        normalizeTenantName(item.tenantName) === normalizeTenantName(tenantName);
    });
    var activatedRows = paidRows.filter(isRechargeActivated);
    var validityRow = activatedRows
      .filter(function (item) { return item.validFrom && item.validFrom !== '-' && item.validTo && item.validTo !== '-'; })
      .sort(function (a, b) { return String(b.validTo).localeCompare(String(a.validTo)); })[0];
    var pendingRow = paidRows.find(function (item) { return !isRechargeActivated(item); });
    var pendingValidityRow = paidRows.find(function (item) {
      return !isRechargeActivated(item) &&
        canGenerateValidity({
          rechargeStatus: item.status,
          billingType: item.billingType
        });
    });
    var totalRechargeAmount = activatedRows.reduce(function (sum, item) {
      return sum + (canAddCallBalance({
        rechargeStatus: item.status,
        billingType: item.billingType
      }) ? Number(item.rechargeAmount || 0) : 0);
    }, 0);
    var adjustments = getBalanceAdjustments().filter(function (item) {
      return item.status === '已生效' &&
        normalizeTenantName(item.tenantName) === normalizeTenantName(tenantName);
    });
    var adjustmentOutAmount = adjustments
      .filter(function (item) { return item.direction === 'OUT'; })
      .reduce(function (sum, item) { return sum + Number(item.amount || 0); }, 0);
    var consumedAmount = Number(tenant && tenant.consumedAmount || 0);
    var totalDeductionAmount = adjustmentOutAmount + consumedAmount;
    var balanceAmount = totalRechargeAmount - adjustmentOutAmount - consumedAmount;
    var frozenTasks = getFrozenTasks().filter(function (item) {
      return item.status === '冻结中' &&
        normalizeTenantName(item.tenantName) === normalizeTenantName(tenantName);
    });
    var totalFrozenAmount = frozenTasks.reduce(function (sum, item) {
      return sum + Number(item.frozenMinutes || 0) * Number(item.unitPriceSnapshot || 0);
    }, 0);
    var availableAmount = Math.max(balanceAmount - totalFrozenAmount, 0);
    var displayBalanceAmount = Math.max(balanceAmount, 0);
    var hasFrozenShortfall = totalFrozenAmount > 0 && balanceAmount < totalFrozenAmount;
    var pricingRows = priceConfigs.map(function (config) {
      var modelTasks = frozenTasks.filter(function (item) { return item.modelType === config.modelType; });
      var frozenMinutes = modelTasks.reduce(function (sum, item) { return sum + Number(item.frozenMinutes || 0); }, 0);
      var frozenAmount = modelTasks.reduce(function (sum, item) {
        return sum + Number(item.frozenMinutes || 0) * Number(item.unitPriceSnapshot || 0);
      }, 0);
      return {
        modelType: config.modelType,
        pricingScope: config.pricingScope,
        unitPrice: Number(config.unitPrice || 0),
        status: config.status,
        frozenMinutes: frozenMinutes,
        frozenAmount: frozenAmount,
        balanceMinutes: amountToMinutes(displayBalanceAmount, config.unitPrice),
        availableMinutes: amountToMinutes(availableAmount, config.unitPrice)
      };
    });
    var hasAvailableMinutes = availableAmount > 0 && (largeConfigs.length > 0 || smallConfigs.length > 0);
    var baseCanCall = !!validityRow && validityRow.validFrom <= currentBizDate() &&
      validityRow.validTo >= currentBizDate() && hasAvailableMinutes;
    var controlState = getCallControlStates().find(function (item) { return normalizeTenantName(item.tenantName) === normalizeTenantName(tenantName); });
    var manualEnabled = controlState ? controlState.enabled : true;
    var canCall = baseCanCall && manualEnabled;

    return {
      validity: validityRow ? (validityRow.validFrom + ' ~ ' + validityRow.validTo)
        : (pendingValidityRow ? '待生效' : '未生成'),
      totalRechargeAmount: totalRechargeAmount,
      adjustmentOutAmount: adjustmentOutAmount,
      consumedAmount: consumedAmount,
      totalDeductionAmount: totalDeductionAmount,
      pricingRows: pricingRows,
      largeBalanceRange: formatMinuteRange(largeConfigs, displayBalanceAmount),
      largeAvailableRange: formatMinuteRange(largeConfigs, availableAmount),
      smallBalanceRange: formatMinuteRange(smallConfigs, displayBalanceAmount),
      smallAvailableRange: formatMinuteRange(smallConfigs, availableAmount),
      balanceAmount: balanceAmount,
      totalFrozenAmount: totalFrozenAmount,
      availableAmount: availableAmount,
      hasFrozenShortfall: hasFrozenShortfall,
      canCall: canCall,
      callStatus: canCall ? '可发起' : '不可发起',
      callStatusCls: canCall ? 'tenant-call-status-ok' : 'tenant-call-status-disabled',
      callManageEnabled: baseCanCall,
      callManageText: manualEnabled ? '停用呼叫' : '启用呼叫',
      hasPendingRecharge: !!pendingRow
    };
  }

  function applyOrderToRow(row, order) {
    row.rechargeNo = order.no;
    row.storeCode = order.storeCode || '-';
    row.storeName = order.storeName || '-';
    row.rechargeStatus = order.status;
    row.billingType = order.billingType;
    row.seatFeePackage = order.seatFeePackage || '-';
    row.periodDays = packageDays(order.seatFeePackage) || order.periodDays || 0;
    row.rechargeAmount = canAddCallBalance(row) ? order.rechargeAmount || 0 : 0;
    row.localAddedAt = row.localAddedAt || formatLocalDateTime(new Date());
    row.validFrom = '-';
    row.validTo = '-';
    row.enabled = false;
    row.activated = false;
    row.validityActivated = false;
  }

  function activateRecharge(rechargeNo) {
    if (!requireTenantBillingPermission()) return;
    var historyRow = getHistoryRows().find(function (item) { return item.rechargeNo === rechargeNo; });
    if (!historyRow) {
      showToast('未找到关联充值单', 'error');
      return;
    }
    if (!canActivateRecharge(historyRow)) {
      showToast(isRechargeActivated(historyRow) ? '该充值单已生效' : '充值单未支付，无法生效', 'warning');
      return;
    }

    var changesValidity = canGenerateValidity({
      rechargeStatus: historyRow.status,
      billingType: historyRow.billingType
    });
    var changesBalance = canAddCallBalance({
      rechargeStatus: historyRow.status,
      billingType: historyRow.billingType
    });

    if (changesValidity || changesBalance) {
      showActivationDurationModal(historyRow);
      return;
    }
    finalizeRechargeActivation(historyRow);
  }

  function getActivationValidity(historyRow, durationDays) {
    var tenantName = historyRow.tenantName;
    var baseDate = latestValidTo(tenantName);
    var addedAt = String(historyRow.bindTime || currentBizDate()).slice(0, 10);
    var validFrom = baseDate && baseDate >= addedAt ? addDays(baseDate, 2) : addedAt;
    return {
      baseDate: baseDate || '-',
      validFrom: validFrom,
      validTo: addDays(validFrom, durationDays)
    };
  }

  function finalizeRechargeActivation(historyRow, durationDays, balanceAmount) {
    var tenantName = historyRow.tenantName;
    var changesValidity = canGenerateValidity({
      rechargeStatus: historyRow.status,
      billingType: historyRow.billingType
    });
    var changesBalance = canAddCallBalance({
      rechargeStatus: historyRow.status,
      billingType: historyRow.billingType
    });
    if (changesValidity) {
      var validity = getActivationValidity(historyRow, durationDays);
      historyRow.periodDays = durationDays;
      historyRow.validFrom = validity.validFrom;
      historyRow.validTo = validity.validTo;
    } else {
      historyRow.validFrom = '-';
      historyRow.validTo = '-';
    }
    if (changesBalance && balanceAmount !== undefined) {
      historyRow.rechargeAmount = balanceAmount;
    }
    historyRow.activated = true;
    historyRow.validityActivated = true;
    historyRow.activatedAt = formatLocalDateTime(new Date());

    var billingRow = findBillingByTenant(tenantName);
    if (billingRow && billingRow.rechargeNo === historyRow.rechargeNo) {
      billingRow.validFrom = historyRow.validFrom;
      billingRow.validTo = historyRow.validTo;
      billingRow.enabled = true;
      billingRow.activated = true;
      billingRow.validityActivated = true;
    }

    var container = document.getElementById('page-content');
    if (container) container.innerHTML = render();
    updateDrawerFieldsAfterActivation(tenantName);
    var historyBody = document.getElementById('tenantHistoryBody');
    if (historyBody) historyBody.innerHTML = renderHistoryRows(tenantName);
    var currentOrderNo = document.getElementById('tenantRechargeNo') ? document.getElementById('tenantRechargeNo').value : '';
    if (currentOrderNo) renderCheckedOrder(getOrders().find(function (item) { return item.no === currentOrderNo; }) || null);
    var resultText = changesValidity && changesBalance
      ? '有效期和余额已更新'
      : (changesValidity ? '有效期已更新' : '余额已更新');
    showToast('充值单已生效，' + resultText, 'success');
  }

  function showActivationDurationModal(historyRow) {
    closeActivationDurationModal();
    var changesValidity = canGenerateValidity({
      rechargeStatus: historyRow.status,
      billingType: historyRow.billingType
    });
    var changesBalance = canAddCallBalance({
      rechargeStatus: historyRow.status,
      billingType: historyRow.billingType
    });
    var summary = getTenantBillingSummary(historyRow.tenantName);
    var defaultDays = packageDays(historyRow.seatFeePackage) || Number(historyRow.periodDays || 0);
    var validity = changesValidity ? getActivationValidity(historyRow, defaultDays) : null;
    var defaultBalanceAmount = Number(historyRow.rechargeAmount || 0);
    var title = changesValidity && changesBalance
      ? '确认添加有效时长和余额'
      : (changesValidity ? '确认添加有效时长' : '确认添加通话余额');
    var validityHtml = changesValidity ? '' +
      '<div class="tenant-activation-duration-summary">' +
        '<div><span>当前有效期至</span><strong>' + validity.baseDate + '</strong></div>' +
        '<div><span>新增有效期起始</span><strong id="tenantActivationValidFrom">' + validity.validFrom + '</strong></div>' +
        '<div><span>预计有效期至</span><strong id="tenantActivationValidTo">' + validity.validTo + '</strong></div>' +
      '</div>' +
      '<div class="tenant-adjustment-field tenant-activation-duration-field">' +
        '<label>添加有效时长</label>' +
        '<div class="tenant-duration-input-wrap">' +
          '<input id="tenantActivationDurationDays" type="number" min="1" step="1" value="' + defaultDays + '" oninput="window.Pages[\'sys-tenant\'].updateActivationDurationPreview()">' +
          '<span>日</span>' +
        '</div>' +
      '</div>' : '';
    var balanceAfter = summary.balanceAmount + defaultBalanceAmount;
    var availableAfter = Math.max(balanceAfter - summary.totalFrozenAmount, 0);
    var balanceHtml = changesBalance ? '' +
      '<div class="tenant-activation-duration-summary tenant-activation-balance-summary">' +
        '<div><span>当前资金余额</span><strong>' + formatBalance(summary.balanceAmount) + '</strong></div>' +
        '<div><span>当前冻结总和</span><strong>' + formatBalance(summary.totalFrozenAmount) + '</strong></div>' +
        '<div><span>预计可用余额</span><strong id="tenantActivationAvailableAfter">' + formatBalance(availableAfter) + '</strong></div>' +
      '</div>' +
      '<div class="tenant-adjustment-field tenant-activation-balance-field">' +
        '<label>添加通话余额</label>' +
        '<div class="tenant-duration-input-wrap">' +
          '<input id="tenantActivationBalanceAmount" type="number" min="0.01" step="0.01" value="' + defaultBalanceAmount.toFixed(2) + '" oninput="window.Pages[\'sys-tenant\'].updateActivationDurationPreview()">' +
          '<span>元</span>' +
        '</div>' +
        '<div class="tenant-activation-balance-after">生效后资金余额：<strong id="tenantActivationBalanceAfter">' + formatBalance(balanceAfter) + '</strong></div>' +
      '</div>' : '';
    var noticeText = changesValidity && changesBalance
      ? '系统已按套餐反显默认时长，并按充值单反显通话余额。确认前可调整天数和添加余额，确认后同时更新租户有效期和资金余额。'
      : (changesValidity
        ? '系统已按套餐反显默认时长，可在生效前调整。确认后将按调整后的天数顺延租户有效期。'
        : '系统已按充值单反显添加余额，可在生效前调整。确认后将按调整后的金额计入租户统一资金账户。');
    var html = '' +
      '<div class="tenant-pricing-modal-backdrop" id="tenantActivationDurationBackdrop" onclick="window.Pages[\'sys-tenant\'].closeActivationDurationModal(event)">' +
        '<div class="tenant-pricing-modal tenant-activation-duration-modal" id="tenantActivationDurationModal" data-recharge-no="' + historyRow.rechargeNo + '" onclick="event.stopPropagation()">' +
          '<div class="tenant-pricing-modal-header">' +
            '<div>' +
              '<div class="tenant-pricing-modal-title">' + title + '</div>' +
              '<div class="tenant-pricing-modal-subtitle">' + historyRow.rechargeNo + ' · ' + historyRow.billingType + '</div>' +
            '</div>' +
            '<button class="tenant-pricing-modal-close" onclick="window.Pages[\'sys-tenant\'].closeActivationDurationModal()">&#x2715;</button>' +
          '</div>' +
          '<div class="tenant-pricing-modal-body">' +
            validityHtml +
            balanceHtml +
            '<div class="biz-modal-notice tenant-pricing-config-notice">' +
              '<span class="biz-notice-icon">&#x26A0;</span>' +
              '<div class="biz-notice-body">' + noticeText + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="tenant-pricing-modal-footer">' +
            '<button class="btn btn-default" onclick="window.Pages[\'sys-tenant\'].closeActivationDurationModal()">取消</button>' +
            '<button class="btn btn-primary" onclick="window.Pages[\'sys-tenant\'].confirmActivationDuration()">确认生效</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.insertAdjacentHTML('beforeend', html);
  }

  function closeActivationDurationModal(e) {
    if (e && e.target !== e.currentTarget) return;
    var bd = document.getElementById('tenantActivationDurationBackdrop');
    if (bd) bd.remove();
  }

  function updateActivationDurationPreview() {
    var modal = document.getElementById('tenantActivationDurationModal');
    if (!modal) return;
    var historyRow = getHistoryRows().find(function (item) { return item.rechargeNo === modal.dataset.rechargeNo; });
    if (!historyRow) return;
    var durationInput = document.getElementById('tenantActivationDurationDays');
    var durationDays = Number(durationInput && durationInput.value);
    var validTo = document.getElementById('tenantActivationValidTo');
    if (validTo) {
      validTo.textContent = Number.isInteger(durationDays) && durationDays > 0
        ? getActivationValidity(historyRow, durationDays).validTo
        : '-';
    }

    var balanceInput = document.getElementById('tenantActivationBalanceAmount');
    var balanceAfterText = document.getElementById('tenantActivationBalanceAfter');
    var availableAfterText = document.getElementById('tenantActivationAvailableAfter');
    if (balanceInput && balanceAfterText && availableAfterText) {
      var balanceAmount = Number(balanceInput.value);
      var summary = getTenantBillingSummary(historyRow.tenantName);
      if (Number.isFinite(balanceAmount) && balanceAmount > 0) {
        var balanceAfter = summary.balanceAmount + balanceAmount;
        balanceAfterText.textContent = formatBalance(balanceAfter);
        availableAfterText.textContent = formatBalance(Math.max(balanceAfter - summary.totalFrozenAmount, 0));
      } else {
        balanceAfterText.textContent = '-';
        availableAfterText.textContent = '-';
      }
    }
  }

  function confirmActivationDuration() {
    if (!requireTenantBillingPermission()) return;
    var modal = document.getElementById('tenantActivationDurationModal');
    if (!modal) return;
    var historyRow = getHistoryRows().find(function (item) { return item.rechargeNo === modal.dataset.rechargeNo; });
    var durationInput = document.getElementById('tenantActivationDurationDays');
    var balanceInput = document.getElementById('tenantActivationBalanceAmount');
    var durationDays = Number(durationInput && durationInput.value);
    var balanceAmount = Number(balanceInput && balanceInput.value);
    if (!historyRow || !canActivateRecharge(historyRow)) {
      closeActivationDurationModal();
      showToast('充值单状态已变化，请刷新后重试', 'warning');
      return;
    }
    if (durationInput && (!Number.isInteger(durationDays) || durationDays <= 0)) {
      durationInput.focus();
      showToast('添加有效时长必须为大于 0 的整数', 'warning');
      return;
    }
    if (balanceInput && (!Number.isFinite(balanceAmount) || balanceAmount <= 0)) {
      balanceInput.focus();
      showToast('添加通话余额必须大于 0', 'warning');
      return;
    }
    closeActivationDurationModal();
    finalizeRechargeActivation(
      historyRow,
      durationInput ? durationDays : undefined,
      balanceInput ? balanceAmount : undefined
    );
  }

  function updateDrawerFieldsAfterActivation(tenantName) {
    var summary = getTenantBillingSummary(tenantName);
    var validityInput = document.getElementById('tenantValidity');
    if (validityInput) validityInput.value = summary.validity;
    var totalRechargeInput = document.getElementById('tenantTotalRecharge');
    if (totalRechargeInput) totalRechargeInput.value = formatBalance(summary.totalRechargeAmount);
    var availableBalanceInput = document.getElementById('tenantAvailableBalance');
    if (availableBalanceInput) availableBalanceInput.value = summary.availableAmount;
    var pricingBody = document.getElementById('tenantPricingBody');
    if (pricingBody) pricingBody.innerHTML = renderPricingRows(tenantName);
    var callStatusInput = document.getElementById('tenantCallStatus');
    if (callStatusInput) callStatusInput.value = summary.callStatus;
    var riskNotice = document.getElementById('tenantBalanceRiskNotice');
    if (riskNotice) riskNotice.innerHTML = renderBalanceRisk(summary);
    var adjustmentBody = document.getElementById('tenantAdjustmentBody');
    if (adjustmentBody) adjustmentBody.innerHTML = renderAdjustmentRows(tenantName);
    var historyBody = document.getElementById('tenantHistoryBody');
    if (historyBody) historyBody.innerHTML = renderHistoryRows(tenantName);
  }

  function findBillingByTenant(tenantName) {
    return getBillingRows().find(function (row) { return row.tenantName === tenantName || normalizeTenantName(row.tenantName) === normalizeTenantName(tenantName); });
  }

  function normalizeTenantName(name) {
    return String(name || '').replace(/东风南方|东南方|南方/g, '').trim();
  }

  function buildBillingSeed(tenantName) {
    return {
      id: Date.now(),
      tenantName: tenantName,
      billingType: '仅坐席费',
      rechargeNo: '',
      rechargeStatus: '未支付',
      seatFeePackage: '-',
      localAddedAt: formatLocalDateTime(new Date()),
      periodDays: 0,
      rechargeAmount: 0,
      validFrom: '-',
      validTo: '-',
      enabled: false,
      validityActivated: false
    };
  }

  function renderRows() {
    return getTenantRows().map(function (row, idx) {
      var profile = getTenantIterationProfile(row, true);
      var entitlement = profile.entitlement || {};
      var minutePool = profile.unifiedMinutePool || {};
      var serviceMeta = serviceStatusMeta(entitlement.status);
      var flagText = profile.commercialFlag === 'commercial' ? '商用' : '试用';
      return '' +
        '<tr>' +
          '<td>' + row.no + '</td>' +
          '<td>' + row.name + '</td>' +
          '<td><span class="tenant-commercial-tag ' + profile.commercialFlag + '">' + flagText + '</span></td>' +
          '<td><span class="tenant-service-status ' + serviceMeta.cls + '">' + serviceMeta.text + '</span></td>' +
          '<td>' + iterationValidity(profile) + '</td>' +
          '<td class="tenant-minute-value"><strong>' + formatWholeMinutes(minutePool.availableMinutes) + '</strong></td>' +
          '<td class="tenant-minute-value">' + formatWholeMinutes(minutePool.frozenMinutes) + '</td>' +
          '<td>' + row.type + '</td>' +
          '<td>' + row.tenantId + '</td>' +
          '<td>' + row.desc + '</td>' +
          '<td>' + row.status + '</td>' +
          '<td>' + row.updater + '</td>' +
          '<td>' + row.updateTime + '</td>' +
          '<td>' +
            (canManageTenantBilling() ? '<button class="tenant-op-btn primary" onclick="window.Pages[\'sys-tenant\'].showBillingDrawer(\'' + row.name + '\')">充值管理</button>' : '') +
            '<button class="tenant-op-btn blue" onclick="window.Pages[\'sys-tenant\'].openEditTenantModal(\'' + row.tenantId + '\')">编辑</button>' +
            '<button class="tenant-op-btn red" onclick="window.Pages[\'sys-tenant\'].deleteTenant(\'' + row.tenantId + '\')">删除</button>' +
          '</td>' +
        '</tr>';
    }).join('');
  }

  function formatExportNumber(value) {
    return Number(value || 0).toFixed(2);
  }

  function getExportAvailableMinutes(summary, modelType) {
    var pricing = summary.pricingRows.find(function (item) { return item.modelType === modelType && item.status === '启用'; });
    return pricing ? formatExportNumber(pricing.availableMinutes) : '未配置';
  }

  function escapeCsvCell(value) {
    return '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"';
  }

  function exportTenantBilling() {
    var headers = [
      '租户名称', '租户ID', '租户类型', '历史充值总额（元）', '扣费总额（元）', '冻结总和（元）', '可用余额（元）', '大模型可用分钟数', '小模型可用分钟数', '有效期', '呼叫控制状态'
    ];
    var rowsData = getTenantRows().map(function (tenant) {
      var summary = getTenantBillingSummary(tenant.name);
      return [
        tenant.name,
        tenant.tenantId,
        tenant.type,
        formatExportNumber(summary.totalRechargeAmount),
        formatExportNumber(summary.totalDeductionAmount),
        formatExportNumber(summary.totalFrozenAmount),
        formatExportNumber(summary.availableAmount),
        getExportAvailableMinutes(summary, '大模型'),
        getExportAvailableMinutes(summary, '小模型'),
        summary.validity,
        summary.callStatus
      ];
    });
    var csvContent = [headers].concat(rowsData)
      .map(function (row) { return row.map(escapeCsvCell).join(','); })
      .join('\n');
    var blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    var downloadUrl = URL.createObjectURL(blob);
    link.href = downloadUrl;
    link.download = '租户计费汇总_' + formatLocalDate(new Date()) + '.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
    showToast('导出成功，共 ' + rowsData.length + ' 条租户数据', 'success');
  }

  function renderPricingRows(tenantName) {
    var rows = getTenantBillingSummary(tenantName).pricingRows;
    if (!rows.length) {
      return '<tr><td colspan="7"><div class="tenant-history-empty">暂无计费配置</div></td></tr>';
    }
    return rows.map(function (item) {
      return '<tr>' +
        '<td><span class="tenant-model-tag ' + (item.modelType === '大模型' ? 'large' : 'small') + '">' + item.modelType + '</span></td>' +
        '<td>' + formatUnitPrice(item.unitPrice) + '</td>' +
        '<td>' + formatMinutes(item.frozenMinutes) + '</td>' +
        '<td>' + formatBalance(item.frozenAmount) + '</td>' +
        '<td>' + formatMinutes(item.balanceMinutes) + '</td>' +
        '<td><strong>' + formatMinutes(item.availableMinutes) + '</strong></td>' +
        '<td><span class="tenant-price-status ' + (item.status === '停用' ? 'disabled' : '') + '">' + item.status + '</span></td>' +
        '</tr>';
    }).join('');
  }

  function renderBalanceRisk(summary) {
    if (!summary.hasFrozenShortfall) return '';
    return '<div class="tenant-balance-risk">' +
      '<strong>当前无新增冻结额度</strong>' +
      '<span>当前资金余额 ' + formatBalance(summary.balanceAmount) + '，有效冻结金额 ' + formatBalance(summary.totalFrozenAmount) + '，可用金额按 0 计算。任务完成、终止或冻结超过 24 小时后将自动释放占用；后续导入按本次预计冻结金额单独校验。</span>' +
      '</div>';
  }

  function getImportCapacity(data) {
    var tenantName = data && data.tenantName || '';
    var modelType = data && data.modelType || '';
    var providerCode = data && data.providerCode || '';
    var estimatedMinutesPerPhone = Number(data && data.estimatedMinutesPerPhone || 0);
    var summary = getTenantBillingSummary(tenantName);
    var priceRule = resolveTenantUnitPrice(tenantName, modelType, providerCode);
    var unitPrice = Number(priceRule && priceRule.unitPrice || 0);
    var freezeAmountPerPhone = estimatedMinutesPerPhone * unitPrice;
    var maxImportCount = freezeAmountPerPhone > 0
      ? Math.floor(summary.availableAmount / freezeAmountPerPhone)
      : 0;

    return {
      tenantName: tenantName,
      modelType: modelType,
      providerCode: providerCode,
      estimatedMinutesPerPhone: estimatedMinutesPerPhone,
      unitPrice: unitPrice,
      pricingScope: priceRule ? priceRule.pricingScope : '',
      availableAmount: summary.availableAmount,
      freezeAmountPerPhone: freezeAmountPerPhone,
      maxImportCount: maxImportCount,
      validity: summary.validity,
      canCall: summary.canCall,
      priceConfigured: unitPrice > 0
    };
  }

  function createImportFreeze(data) {
    var capacity = getImportCapacity(data);
    var phoneCount = Math.floor(Number(data && data.phoneCount || 0));
    var requiredFreezeAmount = phoneCount * capacity.freezeAmountPerPhone;
    var allowed = phoneCount > 0 &&
      capacity.priceConfigured &&
      capacity.canCall &&
      requiredFreezeAmount <= capacity.availableAmount;

    if (!allowed) {
      return Object.assign({}, capacity, { phoneCount: phoneCount, requiredFreezeAmount: requiredFreezeAmount, allowed: false });
    }

    var now = new Date();
    getFrozenTasks().push({
      id: Date.now(),
      tenantName: capacity.tenantName,
      modelType: capacity.modelType,
      vendorCode: capacity.providerCode,
      vendorName: data.vendorName || capacity.providerCode || '-',
      taskNo: 'CALL' + formatLocalDate(now).replace(/-/g, '') + String(Date.now()).slice(-5),
      sceneName: data.sceneName || '-',
      frozenMinutes: phoneCount * capacity.estimatedMinutesPerPhone,
      unitPriceSnapshot: capacity.unitPrice,
      taskStatus: '待执行',
      status: '冻结中',
      createdAt: formatLocalDateTime(now),
      releasedAt: '',
      releaseReason: ''
    });

    return Object.assign({}, capacity, { phoneCount: phoneCount, requiredFreezeAmount: requiredFreezeAmount, allowed: true });
  }

  function renderAdjustmentRows(tenantName) {
    var rows = getBalanceAdjustments()
      .filter(function (item) { return normalizeTenantName(item.tenantName) === normalizeTenantName(tenantName); })
      .sort(function (a, b) { return String(b.effectiveAt).localeCompare(String(a.effectiveAt)); });
    if (!rows.length) {
      return '<tr><td colspan="8"><div class="tenant-history-empty">暂无余额调整记录</div></td></tr>';
    }
    return rows.map(function (item, index) {
      return '<tr>' +
        '<td>' + (index + 1) + '</td>' +
        '<td>' + item.adjustmentNo + '</td>' +
        '<td>' + adjustmentTypeText(item.type) + '</td>' +
        '<td><span class="tenant-adjustment-direction out">调减</span></td>' +
        '<td>' + formatBalance(item.amount) + '</td>' +
        '<td>' + (item.reason || '-') + '</td>' +
        '<td>' + item.operator + '</td>' +
        '<td>' + item.effectiveAt + '</td>' +
        '</tr>';
    }).join('');
  }

  function renderHistoryRows(tenantName) {
    var normalizedName = normalizeTenantName(tenantName);
    var rows = getHistoryRows().filter(function (item) {
      return item.status === '已支付' &&
        normalizeTenantName(item.tenantName) === normalizedName;
    });
    if (!rows.length) {
      return '<tr><td colspan="15"><div class="tenant-history-empty">暂无历史关联充值单记录</div></td></tr>';
    }

    var activateAnnoAdded = false;
    return rows.map(function (item, index) {
      var activated = isRechargeActivated(item);
      var validity = item.validFrom && item.validFrom !== '-' && item.validTo && item.validTo !== '-'
        ? item.validFrom + ' ~ ' + item.validTo
        : '-';
      var order = getOrders().find(function (orderItem) { return orderItem.no === item.rechargeNo; });
      var storeCode = item.storeCode || (order && order.storeCode) || '-';
      var storeName = item.storeName || (order && order.storeName) || '-';
      var operation = !activated
        ? '<button class="tenant-history-activate-btn" onclick="window.Pages[\'sys-tenant\'].activateRecharge(\'' + item.rechargeNo + '\')">生效</button>'
        : '<span class="tenant-muted">已生效</span>';
      return '<tr>' +
        '<td>' + (index + 1) + '</td>' +
        '<td>' + item.rechargeNo + '</td>' +
        '<td>' + (item.orderType || '付费单') + '</td>' +
        '<td>' + storeCode + '</td>' +
        '<td>' + storeName + '</td>' +
        '<td>' + historyPaymentTag(item) + '</td>' +
        '<td><span class="tenant-activation-status ' + (activated ? 'active' : 'pending') + '">' + (activated ? '已生效' : '待生效') + '</span></td>' +
        '<td>' + item.billingType + '</td>' +
        '<td>' + (item.seatFeePackage || '-') + '</td>' +
        '<td>' + (item.periodDays || 0) + ' 天</td>' +
        '<td>' + formatBalance(item.rechargeAmount) + '</td>' +
        '<td>' + validity + '</td>' +
        '<td>' + item.operator + '</td>' +
        '<td>' + item.bindTime + '</td>' +
        '<td>' + operation + '</td>' +
        '</tr>';
    }).join('');
  }

  function render() {
    return '<div class="scene-list-page tenant-page">' +
      '<div class="tenant-list-content">' +
        '<div class="tenant-list-header">' +
          '<div class="tenant-list-title"><span>租户管理</span></div>' +
          '<div class="tenant-list-desc">管理每个租户的信息。</div>' +
        '</div>' +
        '<div class="filter-bar" style="margin-bottom:16px;">' +
          '<div class="filter-item"><label>租户名称：</label><input type="text" class="filter-input" placeholder="请输入" style="width:210px;"></div>' +
          '<div class="btn-group"><button class="btn btn-default" onclick="resetFilter(this.closest(\'.tenant-page\'))">重置</button><button class="btn btn-primary" onclick="doQuery()">查询</button></div>' +
        '</div>' +
        '<div class="tenant-list-card">' +
          '<div class="tenant-list-tools">' +
            '<button class="btn btn-default" onclick="window.Pages[\'sys-tenant\'].exportTenantBilling()" style="height:34px;padding:0 16px;">导出</button>' +
            (canManageTenantBilling() ? '<button class="btn btn-primary" data-anno="tenant-create-entry" data-anno-page="sys-tenant" data-anno-label="新建租户" data-anno-kind="action" data-anno-fields="FLD-001,FLD-002,FLD-003" onclick="window.Pages[\'sys-tenant\'].openCreateTenantModal()" style="height:34px;padding:0 16px;">+ 新建</button>' : '') +
            '<span class="biz-icon-btn" onclick="doRefresh()" title="刷新">&#x21bb;</span>' +
            '<span class="biz-icon-btn" onclick="showToast(\'设置功能开发中\',\'info\')" title="设置">&#x2699;</span>' +
          '</div>' +
          '<div class="table-container">' +
            '<table class="data-table tenant-native-table" data-anno="tenant-iteration-list" data-anno-page="sys-tenant" data-anno-label="租户标记与统一分钟池列表" data-anno-kind="table" data-anno-fields="FLD-001,FLD-002,FLD-003,FLD-006,FLD-007,FLD-008,FLD-021,FLD-022">' +
              '<thead><tr>' +
                '<th>序号</th><th>租户名称</th><th data-anno="tenant-commercial-flag-column" data-anno-page="sys-tenant" data-anno-label="商用或试用标记" data-anno-kind="field" data-anno-fields="FLD-003">商用/试用</th><th>服务状态</th><th>有效期</th><th>可用分钟</th><th>冻结分钟</th><th>租户类型</th><th>租户 id</th><th>描述</th><th>状态</th><th>更新人</th><th>更新时间</th><th>操作</th>' +
              '</tr></thead>' +
              '<tbody>' + renderRows() + '</tbody>' +
            '</table>' +
          '</div>' +
          '<div class="tenant-pagination">第 1-' + getTenantRows().length + ' 条/总共 ' + getTenantRows().length + ' 条&nbsp;&nbsp; &lt; <span>1</span> &gt;</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function init() {}

  function toggleFrozenTooltip(event) {
    event.stopPropagation();
    var wrap = event.currentTarget.closest('.tenant-th-help');
    if (!wrap) return;
    var isOpen = wrap.classList.contains('open');
    document.querySelectorAll('.tenant-th-help.open').forEach(function (item) { item.classList.remove('open'); });
    if (!isOpen) wrap.classList.add('open');
  }

  function toggleCallControl(tenantName) {
    var summary = getTenantBillingSummary(tenantName);
    if (!summary.callManageEnabled) {
      showToast('当前租户已过期或可用分钟数为0，不能手动开启呼叫', 'warning');
      return;
    }

    var rows = getCallControlStates();
    var state = rows.find(function (item) { return normalizeTenantName(item.tenantName) === normalizeTenantName(tenantName); });
    if (!state) {
      state = { tenantName: tenantName, enabled: true };
      rows.push(state);
    }
    state.enabled = !state.enabled;
    var container = document.getElementById('page-content');
    if (container) container.innerHTML = render();
    showToast(state.enabled ? '已启用呼叫控制状态' : '已停用呼叫控制状态', 'success');
  }

  function renderPricingConfigEditRows(tenantName) {
    var configs = getTenantAllPriceConfigs(tenantName);
    if (!configs.length) {
      return '<tr><td colspan="4"><div class="tenant-history-empty">暂无计费配置</div></td></tr>';
    }
    return configs.map(function (item) {
      return '<tr class="tenant-pricing-edit-row" data-model-type="' + item.modelType + '">' +
        '<td><span class="tenant-model-tag ' + (item.modelType === '大模型' ? 'large' : 'small') + '">' + item.modelType + '</span></td>' +
        '<td>' +
          '<div class="tenant-price-input-wrap">' +
            '<span>¥</span>' +
            '<input class="tenant-price-input" type="number" min="0.01" step="0.01" value="' + Number(item.unitPrice || 0).toFixed(2) + '">' +
            '<span>/分钟</span>' +
          '</div>' +
        '</td>' +
        '<td>' +
          '<select class="tenant-price-status-select">' +
            '<option value="启用"' + (item.status === '启用' ? ' selected' : '') + '>启用</option>' +
            '<option value="停用"' + (item.status === '停用' ? ' selected' : '') + '>停用</option>' +
          '</select>' +
        '</td>' +
        '<td class="tenant-config-effect">当前作为该模型默认价，未来可被供应商专属价覆盖</td>' +
        '</tr>';
    }).join('');
  }

  function showPricingConfigModal(tenantName) {
    closePricingConfigModal();
    var html = '' +
      '<div class="tenant-pricing-modal-backdrop" id="tenantPricingConfigBackdrop" onclick="window.Pages[\'sys-tenant\'].closePricingConfigModal(event)">' +
        '<div class="tenant-pricing-modal" id="tenantPricingConfigModal" data-anno-page="sys-tenant" data-anno-label="租户计费配置" data-anno-kind="region" data-anno-fields="FLD-050,FLD-055" data-tenant-name="' + tenantName + '" onclick="event.stopPropagation()">' +
          '<div class="tenant-pricing-modal-header">' +
            '<div>' +
              '<div class="tenant-pricing-modal-title">计费配置</div>' +
              '<div class="tenant-pricing-modal-subtitle">' + tenantName + '</div>' +
            '</div>' +
            '<button class="tenant-pricing-modal-close" onclick="window.Pages[\'sys-tenant\'].closePricingConfigModal()">&#x2715;</button>' +
          '</div>' +
          '<div class="tenant-pricing-modal-body">' +
            '<div class="biz-modal-notice tenant-pricing-config-notice">' +
              '<span class="biz-notice-icon">&#x26A0;</span>' +
              '<div class="biz-notice-body">当前版本只配置大模型和小模型默认单价。供应商作为未来扩展维度暂不参与配置；价格调整不追溯已冻结任务。</div>' +
            '</div>' +
            '<div class="tenant-pricing-table-wrap">' +
              '<table class="tenant-pricing-table tenant-pricing-edit-table">' +
                '<thead><tr><th>模型</th><th>通话单价</th><th>状态</th><th>生效规则</th></tr></thead>' +
                '<tbody>' + renderPricingConfigEditRows(tenantName) + '</tbody>' +
              '</table>' +
            '</div>' +
          '</div>' +
          '<div class="tenant-pricing-modal-footer">' +
            '<button class="btn btn-default" onclick="window.Pages[\'sys-tenant\'].closePricingConfigModal()">取消</button>' +
            '<button class="btn btn-primary" onclick="window.Pages[\'sys-tenant\'].savePricingConfig()">保存配置</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.insertAdjacentHTML('beforeend', html);
  }

  function closePricingConfigModal(e) {
    if (e && e.target !== e.currentTarget) return;
    var bd = document.getElementById('tenantPricingConfigBackdrop');
    if (bd) bd.remove();
  }

  function savePricingConfig() {
    var modal = document.getElementById('tenantPricingConfigModal');
    if (!modal) return;
    var tenantName = modal.dataset.tenantName;
    var rows = Array.from(modal.querySelectorAll('.tenant-pricing-edit-row'));
    var updates = [];

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var input = row.querySelector('.tenant-price-input');
      var statusSelect = row.querySelector('.tenant-price-status-select');
      var unitPrice = Number(input && input.value);
      if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        if (input) input.focus();
        showToast('通话单价必须大于 0', 'warning');
        return;
      }
      updates.push({
        modelType: row.dataset.modelType,
        unitPrice: unitPrice,
        status: statusSelect ? statusSelect.value : '启用'
      });
    }

    updates.forEach(function (update) {
      var config = getPriceRules().find(function (item) {
        return normalizeTenantName(item.tenantName) === normalizeTenantName(tenantName) &&
          item.modelType === update.modelType &&
          item.pricingScope === 'MODEL_DEFAULT' &&
          !item.providerCode;
      });
      if (!config) return;
      config.unitPrice = update.unitPrice;
      config.status = update.status;
    });

    var container = document.getElementById('page-content');
    if (container) container.innerHTML = render();
    closePricingConfigModal();
    showToast('计费配置已保存', 'success');
  }

  function rechargeStatusTag(status) {
    var textMap = { processing: '处理中', effective: '已生效', failed: '失败' };
    return '<span class="tenant-record-status ' + status + '">' + (textMap[status] || '状态异常') + '</span>';
  }

  function formatRecordMoney(value) {
    return value == null ? '—' : '¥' + Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function renderInternalRechargeRows(profile) {
    var records = (getRechargeIteration().rechargeRecords || []).filter(function (item) { return String(item.tenantId) === String(profile.id); });
    if (!records.length) return '<tr><td colspan="12"><div class="tenant-record-empty">暂无内部充值记录</div></td></tr>';
    return records.map(function (item) {
      return '<tr>' +
        '<td><strong>' + item.internalNo + '</strong></td>' +
        '<td>' + item.productName + '</td>' +
        '<td>' + item.quantity + '</td>' +
        '<td>' + formatRecordMoney(item.price) + '</td>' +
        '<td>' + item.actualDurationDays + ' 天</td>' +
        '<td>' + formatWholeMinutes(item.actualCreditMinutes) + '</td>' +
        '<td>' + Number(item.beforeValue).toLocaleString('zh-CN') + ' → ' + Number(item.afterValue).toLocaleString('zh-CN') + ' ' + item.valueUnit + '</td>' +
        '<td>' + item.operatorName + '</td>' +
        '<td>' + item.operatedAt + '</td>' +
        '<td class="tenant-record-reason">' + (item.reason || '使用默认值') + '</td>' +
        '<td>' + rechargeStatusTag(item.status) + '</td>' +
      '</tr>';
    }).join('');
  }

  function renderIterationAdjustmentRows(profile) {
    var records = (getRechargeIteration().adjustmentRecords || []).filter(function (item) { return String(item.tenantId) === String(profile.id); });
    if (!records.length) return '<tr><td colspan="10"><div class="tenant-record-empty">暂无手工调整流水</div></td></tr>';
    return records.map(function (item) {
      var directionText = item.direction === 'increase' ? '调增' : '调减';
      var targetText = item.target === 'duration_days' ? '使用时长' : '可用分钟';
      return '<tr>' +
        '<td><strong>' + item.adjustmentNo + '</strong></td>' +
        '<td><span class="tenant-adjust-direction ' + item.direction + '">' + directionText + '</span></td>' +
        '<td>' + targetText + '</td>' +
        '<td>' + Number(item.value).toLocaleString('zh-CN') + ' ' + item.valueUnit + '</td>' +
        '<td>' + Number(item.beforeValue).toLocaleString('zh-CN') + ' → ' + Number(item.afterValue).toLocaleString('zh-CN') + ' ' + item.valueUnit + '</td>' +
        '<td>' + item.reason + '</td>' +
        '<td>' + item.operatorName + '</td>' +
        '<td>' + item.operatedAt + '</td>' +
        '<td>' + rechargeStatusTag(item.status) + '</td>' +
      '</tr>';
    }).join('');
  }

  function renderRechargeDrawerContent(profile) {
    var entitlement = profile.entitlement || {};
    var pool = profile.unifiedMinutePool || {};
    var serviceMeta = serviceStatusMeta(entitlement.status);
    if (profile.rechargeState === 'error') {
      return '<div class="tenant-recharge-error" data-anno="recharge-load-error" data-anno-page="sys-tenant" data-anno-label="充值管理加载失败与重试" data-anno-kind="region" data-anno-fields="FLD-006,FLD-021">' +
        '<div class="tenant-state-icon">!</div><strong>充值账户加载失败</strong><p>当前为异常演示状态，未覆盖或伪造账户数据。</p>' +
        '<button class="btn btn-primary" onclick="window.Pages[\'sys-tenant\'].retryRechargeOverview(\'' + profile.id + '\')">重新加载</button>' +
      '</div>';
    }
    return '' +
      '<div class="tenant-account-overview" data-anno="recharge-account-overview" data-anno-page="sys-tenant" data-anno-label="租户服务与统一分钟池概览" data-anno-kind="region" data-anno-fields="FLD-006,FLD-007,FLD-008,FLD-020,FLD-021,FLD-022,FLD-023">' +
        '<div class="tenant-account-card service"><span>服务状态</span><strong><em class="tenant-service-status ' + serviceMeta.cls + '">' + serviceMeta.text + '</em></strong><small>' + iterationValidity(profile) + '</small></div>' +
        '<div class="tenant-account-card primary"><span>可用分钟</span><strong>' + formatWholeMinutes(pool.availableMinutes) + '</strong><small>大/小模型共用</small></div>' +
        '<div class="tenant-account-card"><span>冻结分钟</span><strong>' + formatWholeMinutes(pool.frozenMinutes) + '</strong><small>任务预占，不可手工扣减</small></div>' +
        '<div class="tenant-account-card"><span>累计消耗</span><strong>' + formatWholeMinutes(pool.consumedMinutes) + '</strong><small>仅统计已接通结算</small></div>' +
      '</div>' +
      '<div class="tenant-recharge-actions">' +
        (rechargeTypesForProfile(profile).includes('trial_package') ? '<button class="btn btn-primary" data-anno="recharge-trial-entry" data-anno-page="sys-tenant" data-anno-label="试用套餐开通入口" data-anno-kind="action" data-anno-fields="FLD-003,FLD-010,FLD-014,FLD-016" onclick="window.Pages[\'sys-tenant\'].openRechargeForm(\'trial_package\')">+ 开通试用套餐</button>' : '') +
        (rechargeTypesForProfile(profile).includes('standard_annual') ? '<button class="btn btn-primary" data-anno="recharge-standard-entry" data-anno-page="sys-tenant" data-anno-label="标准版年包充值入口" data-anno-kind="action" data-anno-fields="FLD-010,FLD-014,FLD-016" onclick="window.Pages[\'sys-tenant\'].openRechargeForm(\'standard_annual\')">+ 标准版开通</button>' : '') +
        (rechargeTypesForProfile(profile).includes('call_credit_pack') ? '<button class="btn btn-default" data-anno="recharge-pack-entry" data-anno-page="sys-tenant" data-anno-label="话费充值包入口" data-anno-kind="action" data-anno-fields="FLD-010,FLD-012,FLD-016" onclick="window.Pages[\'sys-tenant\'].openRechargeForm(\'call_credit_pack\')">+ 话费充值包</button>' : '') +
        '<button class="btn btn-default" data-anno="adjustment-entry" data-anno-page="sys-tenant" data-anno-label="手工调增调减入口" data-anno-kind="action" data-anno-fields="FLD-035,FLD-036,FLD-037" onclick="window.Pages[\'sys-tenant\'].openIterationAdjustmentForm()">手工调整</button>' +
      '</div>' +
      '<div class="tenant-billing-tabs" role="tablist">' +
        '<button class="tenant-billing-tab active" role="tab" data-tab="internal" onclick="window.Pages[\'sys-tenant\'].switchBillingTab(\'internal\')">内部充值记录</button>' +
        '<button class="tenant-billing-tab" role="tab" data-tab="adjustment" onclick="window.Pages[\'sys-tenant\'].switchBillingTab(\'adjustment\')">手工调整流水</button>' +
      '</div>' +
      '<div class="tenant-billing-tab-panel active" data-panel="internal" role="tabpanel">' +
        '<div class="tenant-record-table-wrap" data-anno="internal-recharge-table" data-anno-page="sys-tenant" data-anno-label="内部充值流水" data-anno-kind="region" data-anno-fields="FLD-024,FLD-025,FLD-026,FLD-027,FLD-028,FLD-029,FLD-030,FLD-031,FLD-032,FLD-033,FLD-034">' +
          '<table class="tenant-record-table"><thead><tr><th>内部流水号</th><th>充值类型</th><th>数量</th><th>价格</th><th>实际时长</th><th>入账分钟</th><th>调整前后</th><th>操作人</th><th>操作时间</th><th>原因</th><th>状态</th></tr></thead><tbody>' + renderInternalRechargeRows(profile) + '</tbody></table>' +
        '</div>' +
      '</div>' +
      '<div class="tenant-billing-tab-panel" data-panel="adjustment" role="tabpanel">' +
        '<div class="tenant-record-table-wrap" data-anno="manual-adjustment-table" data-anno-page="sys-tenant" data-anno-label="手工调整流水" data-anno-kind="region" data-anno-fields="FLD-029,FLD-030,FLD-031,FLD-032,FLD-033,FLD-034,FLD-035,FLD-036,FLD-037">' +
          '<table class="tenant-record-table"><thead><tr><th>调整单号</th><th>方向</th><th>对象</th><th>调整值</th><th>调整前后</th><th>原因</th><th>操作人</th><th>生效时间</th><th>状态</th></tr></thead><tbody>' + renderIterationAdjustmentRows(profile) + '</tbody></table>' +
        '</div>' +
      '</div>';
  }

  function showBillingDrawer(tenantName) {
    if (!requireTenantBillingPermission()) return;
    var tenantBase = getTenantRows().find(function (item) { return normalizeTenantName(item.name) === normalizeTenantName(tenantName); });
    var profile = getTenantIterationProfile(tenantBase || tenantName, true);
    var flagText = profile.commercialFlag === 'commercial' ? '商用' : '试用';
    var html = '' +
      '<div class="biz-drawer-backdrop" id="tenantBillingBackdrop" onclick="window.Pages[\'sys-tenant\'].closeBillingDrawer(event)">' +
        '<div class="biz-drawer tenant-drawer tenant-recharge-drawer" id="tenantBillingDrawer" data-anno="recharge-management-drawer" data-anno-page="sys-tenant" data-anno-label="租户充值管理" data-anno-kind="region" data-anno-fields="FLD-001,FLD-002,FLD-003,FLD-006,FLD-021" onclick="event.stopPropagation()" data-tenant-id="' + profile.id + '">' +
          '<div class="biz-drawer-header"><div><span class="biz-drawer-title">充值管理</span><span class="tenant-drawer-subtitle">新充值由系统生成内部流水，不依赖外部充值单号</span></div><span class="biz-drawer-close" onclick="window.Pages[\'sys-tenant\'].closeBillingDrawer()">&#x2715;</span></div>' +
          '<div class="biz-drawer-body">' +
            '<div class="tenant-iteration-context" data-anno="billing-tenant-context" data-anno-page="sys-tenant" data-anno-label="充值租户上下文" data-anno-kind="region" data-anno-fields="FLD-001,FLD-002,FLD-003">' +
              '<div><span>租户名称</span><strong>' + profile.name + '</strong></div><div><span>租户 ID</span><strong>' + profile.id + '</strong></div><div><span>租户标记</span><strong><em class="tenant-commercial-tag ' + profile.commercialFlag + '">' + flagText + '</em></strong></div>' +
            '</div>' +
            renderRechargeDrawerContent(profile) +
          '</div>' +
          '<div class="biz-drawer-footer"><button class="btn btn-default" onclick="window.Pages[\'sys-tenant\'].closeBillingDrawer()">关闭</button></div>' +
        '</div>' +
      '</div>';
    document.body.insertAdjacentHTML('beforeend', html);
    requestAnimationFrame(function () {
      var backdrop = document.getElementById('tenantBillingBackdrop');
      var drawer = document.getElementById('tenantBillingDrawer');
      if (backdrop) backdrop.classList.add('open');
      if (drawer) drawer.classList.add('open');
    });
  }

  function retryRechargeOverview(tenantId) {
    var profile = (getRechargeIteration().tenants || []).find(function (item) { return String(item.id) === String(tenantId); });
    if (!profile) return;
    profile.rechargeState = 'loaded';
    var backdrop = document.getElementById('tenantBillingBackdrop');
    if (backdrop) backdrop.remove();
    showBillingDrawer(profile.name);
    showToast('充值账户已重新加载', 'success');
  }

  function parseIterationDate(value) {
    return new Date(String(value || '').replace(/-/g, '/'));
  }

  function remainingServiceDays(profile) {
    var now = parseIterationDate(getRechargeIteration().simulatedNow);
    var expires = parseIterationDate(profile.entitlement && profile.entitlement.expiresAt);
    if (!Number.isFinite(now.getTime()) || !Number.isFinite(expires.getTime()) || expires <= now) return 0;
    return Math.max(1, Math.ceil((expires - now) / 86400000));
  }

  function rechargeDefaults(profile, productType, quantity) {
    var products = getRechargeIteration().products || {};
    if (productType === 'call_credit_pack') {
      var pack = products.call_credit_pack || {};
      var packQuantity = Math.max(1, Number(quantity || 1));
      return {
        price: Number(pack.unitPrice || 1000) * packQuantity,
        unitPrice: Number(pack.unitPrice || 1000),
        quantity: packQuantity,
        durationDays: remainingServiceDays(profile),
        creditMinutes: Number(pack.defaultCreditMinutesPerPack || 3500) * packQuantity
      };
    }
    var standard = products[productType] || {};
    return {
      price: Number(standard.unitPrice),
      unitPrice: Number(standard.unitPrice),
      quantity: 1,
      durationDays: Number(standard.defaultDurationDays),
      creditMinutes: Number(standard.defaultCreditMinutes)
    };
  }

  function addIterationDays(dateValue, days) {
    var date = parseIterationDate(dateValue);
    date.setDate(date.getDate() + Number(days || 0));
    return formatLocalDateTime(date);
  }

  function getRechargeFormProfile() {
    var modal = document.getElementById('rechargeFormModal');
    var tenantId = modal && modal.dataset.tenantId;
    return (getRechargeIteration().tenants || []).find(function (item) { return String(item.id) === String(tenantId); }) || null;
  }

  function renderProductDescription(productType) {
    var products = getRechargeIteration().products || {};
    if (productType === 'trial_package') {
      return '<div class="recharge-product-note"><strong>试用套餐规则</strong><p>' + products.trial_package.usageRule + '</p></div>';
    }
    if (productType === 'call_credit_pack') {
      return '<div class="recharge-product-note"><strong>话费充值包规则</strong><p>' + products.call_credit_pack.usageRule + '</p></div>';
    }
    var product = products.standard_annual || {};
    return '<div class="recharge-product-note" data-anno="recharge-package-description" data-anno-page="sys-tenant" data-anno-label="标准版服务和话术规则" data-anno-kind="region" data-anno-fields="FLD-047,FLD-048,FLD-049">' +
      '<strong>标准版服务内容</strong><p>' + (product.serviceItems || []).join('、') + '。</p>' +
      '<p>包含 ' + product.scriptAllowance + ' 套场景话术；' + product.scriptChangeRule + '</p>' +
    '</div>';
  }

  function rechargeTypesForProfile(profile) {
    if (profile && profile.commercialFlag === 'trial') return ['trial_package'];
    if (profile && profile.commercialFlag === 'commercial') return ['standard_annual', 'call_credit_pack'];
    return [];
  }

  function rechargeTypeMismatchMessage(profile) {
    if (profile && profile.commercialFlag === 'trial') return '试用租户仅可选择试用套餐';
    if (profile && profile.commercialFlag === 'commercial') return '商用租户仅可选择标准版年包或话费充值包';
    return '租户类型无效，请核对租户配置后重试';
  }

  function openRechargeForm(productType) {
    if (!requireTenantBillingPermission()) return;
    closeRechargeForm();
    var drawer = document.getElementById('tenantBillingDrawer');
    var tenantId = drawer && drawer.dataset.tenantId;
    var profile = (getRechargeIteration().tenants || []).find(function (item) { return String(item.id) === String(tenantId); });
    if (!profile) {
      showToast('未找到当前租户账户', 'error');
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(getRechargeIteration().products, productType)) {
      showToast('请选择有效的充值类型', 'error');
      return;
    }
    if (!rechargeTypesForProfile(profile).includes(productType)) {
      showToast(rechargeTypeMismatchMessage(profile), 'error');
      return;
    }
    var isPack = productType === 'call_credit_pack';
    var defaults = rechargeDefaults(profile, productType, 1);
    var entitlement = profile.entitlement || {};
    var now = parseIterationDate(getRechargeIteration().simulatedNow);
    var expires = parseIterationDate(entitlement.expiresAt);
    var standardBlocked = !isPack && entitlement.status === 'active' && Number.isFinite(expires.getTime()) && expires > now;
    var packBlocked = isPack && entitlement.status !== 'active';
    var blockedText = standardBlocked
      ? ('当前服务套餐已开通且尚未到期。' + (profile.commercialFlag === 'commercial' ? '可购买话费充值包增加分钟。' : '如需调整时长或分钟，可使用手工调整。'))
      : (packBlocked ? '话费充值包仅能在服务有效期内购买，当前租户不可生效。' : '');
    var effectiveAt = isPack ? entitlement.effectiveAt : getRechargeIteration().simulatedNow;
    var expiresAt = isPack ? entitlement.expiresAt : addIterationDays(effectiveAt, defaults.durationDays);
    var html = '' +
      '<div class="modal-overlay recharge-form-backdrop" id="rechargeFormBackdrop" onclick="window.Pages[\'sys-tenant\'].closeRechargeForm(event)">' +
        '<div class="recharge-form-modal" id="rechargeFormModal" data-tenant-id="' + profile.id + '" data-anno="recharge-product-form" data-anno-page="sys-tenant" data-anno-label="套餐开通与话费充值表单" data-anno-kind="region" data-anno-fields="FLD-010,FLD-011,FLD-012,FLD-013,FLD-014,FLD-015,FLD-016,FLD-017,FLD-018,FLD-019" onclick="event.stopPropagation()">' +
          '<div class="tenant-form-modal-header"><div><div class="tenant-form-modal-title">新增充值</div><div class="recharge-form-subtitle">' + profile.name + ' · ' + profile.id + '</div></div><button class="tenant-form-modal-close" onclick="window.Pages[\'sys-tenant\'].closeRechargeForm()">✕</button></div>' +
          '<div class="recharge-form-body">' +
            (blockedText ? '<div class="recharge-blocked-notice">' + blockedText + '</div>' : '') +
            '<div class="recharge-field" data-anno="recharge-type-field" data-anno-page="sys-tenant" data-anno-label="充值类型" data-anno-kind="region" data-anno-fields="FLD-010"><label>充值类型</label><div class="tenant-radio-group">' +
              rechargeTypesForProfile(profile).map(function (type) {
                return '<label class="tenant-radio-label"><input type="radio" name="rechargeProductType" value="' + type + '"' + (productType === type ? ' checked' : '') + ' onchange="window.Pages[\'sys-tenant\'].openRechargeForm(this.value)"> ' + getRechargeIteration().products[type].name + '</label>';
              }).join('') +
            '</div></div>' +
            '<div class="recharge-form-grid">' +
              '<div class="recharge-field" data-anno="recharge-price-field" data-anno-page="sys-tenant" data-anno-label="实际套餐价格" data-anno-kind="region" data-anno-fields="FLD-011,FLD-028,FLD-050"><label for="rechargePrice">套餐价格（本次总价）</label><div class="recharge-input-unit"><input id="rechargePrice" type="number" min="0" step="0.01" value="' + defaults.price.toFixed(2) + '" data-default-price="' + defaults.price + '" oninput="window.Pages[\'sys-tenant\'].updateRechargePreview(false)"><span>元</span></div><small>默认总价 <b id="rechargeDefaultPrice">' + formatRecordMoney(defaults.price) + '</b>，可手工编辑</small></div>' +
              '<div class="recharge-field" id="rechargeQuantityField" data-anno="recharge-quantity-field" data-anno-page="sys-tenant" data-anno-label="充值包数量" data-anno-kind="region" data-anno-fields="FLD-012" style="display:' + (isPack ? 'block' : 'none') + '"><label>购买数量</label><div class="recharge-input-unit"><input id="rechargeQuantity" type="number" min="1" step="1" value="1" oninput="window.Pages[\'sys-tenant\'].updateRechargePreview(true)"><span>包</span></div><small>每包默认 3,500 分钟</small></div>' +
              '<div class="recharge-field" data-anno="recharge-duration-field" data-anno-page="sys-tenant" data-anno-label="实际使用时长" data-anno-kind="region" data-anno-fields="FLD-013,FLD-014"><label>实际使用时长</label><div class="recharge-input-unit"><input id="rechargeActualDays" type="number" min="1" step="1" value="' + defaults.durationDays + '" oninput="window.Pages[\'sys-tenant\'].updateRechargePreview(false)"><span>天</span></div><small>默认值：<b id="rechargeDefaultDays">' + defaults.durationDays + '</b> 天，可手工编辑</small></div>' +
              '<div class="recharge-field" data-anno="recharge-minutes-field" data-anno-page="sys-tenant" data-anno-label="实际入账分钟" data-anno-kind="region" data-anno-fields="FLD-015,FLD-016"><label>实际入账分钟</label><div class="recharge-input-unit"><input id="rechargeActualMinutes" type="number" min="1" step="1" value="' + defaults.creditMinutes + '" oninput="window.Pages[\'sys-tenant\'].updateRechargePreview(false)"><span>分钟</span></div><small>默认值：<b id="rechargeDefaultMinutes">' + defaults.creditMinutes + '</b> 分钟，可手工编辑</small></div>' +
            '</div>' +
            '<div class="recharge-field" data-anno="recharge-reason-field" data-anno-page="sys-tenant" data-anno-label="充值偏离原因" data-anno-kind="region" data-anno-fields="FLD-017"><label>调整原因 <em id="rechargeReasonRequired" class="recharge-required-mark"></em></label><textarea id="rechargeDeviationReason" rows="3" placeholder="实际价格、天数或分钟偏离默认值时必填" oninput="window.Pages[\'sys-tenant\'].updateRechargePreview(false)"></textarea></div>' +
            '<div class="recharge-preview" data-anno="recharge-effect-preview" data-anno-page="sys-tenant" data-anno-label="充值生效预览" data-anno-kind="region" data-anno-fields="FLD-018,FLD-019,FLD-020,FLD-021"><div><span>预计生效</span><strong id="rechargePreviewEffective">' + (effectiveAt || '—') + '</strong></div><div><span>预计失效</span><strong id="rechargePreviewExpires">' + (expiresAt || '—') + '</strong></div><div><span>分钟变化</span><strong id="rechargePreviewMinutes">' + formatWholeMinutes(profile.unifiedMinutePool.availableMinutes) + ' → ' + formatWholeMinutes(profile.unifiedMinutePool.availableMinutes + defaults.creditMinutes) + '</strong></div></div>' +
            renderProductDescription(productType) +
            '<div class="recharge-validation" id="rechargeValidation" aria-live="polite"></div>' +
            '<div class="recharge-write-failure" id="rechargeWriteFailure" style="display:none;"><strong>写账失败，账户未发生变化</strong><span>请保留当前输入后重试。</span><button class="btn btn-default" onclick="window.Pages[\'sys-tenant\'].retryRechargeWrite()">重试写账</button></div>' +
          '</div>' +
          '<div class="tenant-form-modal-footer recharge-form-footer"><button class="recharge-demo-fail" onclick="window.Pages[\'sys-tenant\'].simulateRechargeWriteFailure()"' + (blockedText ? ' disabled' : '') + '>演示写账失败</button><span class="recharge-footer-spacer"></span><button class="btn btn-default" onclick="window.Pages[\'sys-tenant\'].closeRechargeForm()">取消</button><button class="btn btn-primary" id="rechargeSubmitButton" data-anno="recharge-submit-action" data-anno-page="sys-tenant" data-anno-label="确认充值并生成内部流水" data-anno-kind="action" data-anno-fields="FLD-014,FLD-016,FLD-017,FLD-024" onclick="window.Pages[\'sys-tenant\'].submitRechargeForm()"' + (blockedText ? ' disabled' : '') + '>确认充值</button></div>' +
        '</div>' +
      '</div>';
    document.body.insertAdjacentHTML('beforeend', html);
    updateRechargePreview(false);
  }

  function closeRechargeForm(event) {
    if (event && event.target !== event.currentTarget) return;
    var backdrop = document.getElementById('rechargeFormBackdrop');
    if (backdrop) backdrop.remove();
  }

  function updateRechargePreview(quantityChanged) {
    var profile = getRechargeFormProfile();
    if (!profile) return;
    var typeInput = document.querySelector('input[name="rechargeProductType"]:checked');
    var productType = typeInput ? typeInput.value : 'standard_annual';
    var quantityInput = document.getElementById('rechargeQuantity');
    var quantity = productType === 'call_credit_pack' ? Number(quantityInput && quantityInput.value || 0) : 1;
    var oldDefaultMinutes = Number(document.getElementById('rechargeDefaultMinutes') && document.getElementById('rechargeDefaultMinutes').textContent || 0);
    var defaults = rechargeDefaults(profile, productType, quantity || 1);
    var actualMinutesInput = document.getElementById('rechargeActualMinutes');
    if (quantityChanged && actualMinutesInput && Number(actualMinutesInput.value) === oldDefaultMinutes) actualMinutesInput.value = defaults.creditMinutes;
    var defaultMinutes = document.getElementById('rechargeDefaultMinutes');
    if (defaultMinutes) defaultMinutes.textContent = defaults.creditMinutes;
    var price = document.getElementById('rechargePrice');
    if (price) {
      if (quantityChanged && Number(price.value) === Number(price.dataset.defaultPrice)) price.value = defaults.price.toFixed(2);
      price.dataset.defaultPrice = defaults.price;
    }
    var defaultPrice = document.getElementById('rechargeDefaultPrice');
    if (defaultPrice) defaultPrice.textContent = formatRecordMoney(defaults.price);
    var actualDays = Number(document.getElementById('rechargeActualDays') && document.getElementById('rechargeActualDays').value || 0);
    var actualMinutes = Number(actualMinutesInput && actualMinutesInput.value || 0);
    var defaultDays = Number(document.getElementById('rechargeDefaultDays') && document.getElementById('rechargeDefaultDays').textContent || 0);
    var deviated = actualDays !== defaultDays || actualMinutes !== defaults.creditMinutes || Number(price && price.value) !== defaults.price;
    var required = document.getElementById('rechargeReasonRequired');
    if (required) required.textContent = deviated ? '必填' : '选填';
    var entitlement = profile.entitlement || {};
    var effectiveAt = productType === 'call_credit_pack' ? entitlement.effectiveAt : getRechargeIteration().simulatedNow;
    var expiresAt = productType === 'call_credit_pack' ? entitlement.expiresAt : (actualDays > 0 ? addIterationDays(effectiveAt, actualDays) : '—');
    var effectiveEl = document.getElementById('rechargePreviewEffective');
    var expiresEl = document.getElementById('rechargePreviewExpires');
    var minutesEl = document.getElementById('rechargePreviewMinutes');
    if (effectiveEl) effectiveEl.textContent = effectiveAt || '—';
    if (expiresEl) expiresEl.textContent = expiresAt || '—';
    if (minutesEl) minutesEl.textContent = formatWholeMinutes(profile.unifiedMinutePool.availableMinutes) + ' → ' + formatWholeMinutes(profile.unifiedMinutePool.availableMinutes + (Number.isFinite(actualMinutes) ? actualMinutes : 0));
  }

  function isPositiveInteger(value) {
    return Number.isInteger(value) && value > 0;
  }

  function collectRechargeFormData() {
    var profile = getRechargeFormProfile();
    var typeInput = document.querySelector('input[name="rechargeProductType"]:checked');
    var productType = typeInput ? typeInput.value : 'standard_annual';
    var quantity = productType === 'call_credit_pack' ? Number(document.getElementById('rechargeQuantity').value) : 1;
    var defaults = rechargeDefaults(profile, productType, quantity || 1);
    return {
      profile: profile,
      productType: productType,
      quantity: quantity,
      defaults: defaults,
      actualDurationDays: Number(document.getElementById('rechargeActualDays').value),
      actualCreditMinutes: Number(document.getElementById('rechargeActualMinutes').value),
      actualPrice: Number(document.getElementById('rechargePrice').value),
      priceText: document.getElementById('rechargePrice').value.trim(),
      reason: document.getElementById('rechargeDeviationReason').value.trim()
    };
  }

  function validateRechargeForm(data) {
    var errors = [];
    if (!Object.prototype.hasOwnProperty.call(getRechargeIteration().products, data.productType)) errors.push('请选择有效的充值类型');
    if (!rechargeTypesForProfile(data.profile).includes(data.productType)) errors.push(rechargeTypeMismatchMessage(data.profile));
    if (!isPositiveInteger(data.quantity)) errors.push('购买数量必须为大于 0 的整数');
    if (!isPositiveInteger(data.actualDurationDays)) errors.push('实际使用时长必须为大于 0 的整数');
    if (!isPositiveInteger(data.actualCreditMinutes)) errors.push('实际入账分钟必须为大于 0 的整数');
    if (!/^\d+(\.\d{1,2})?$/.test(data.priceText) || !Number.isFinite(data.actualPrice) || data.actualPrice < 0) errors.push('套餐价格须为不小于 0 的金额，最多保留两位小数');
    var deviated = data.actualDurationDays !== data.defaults.durationDays || data.actualCreditMinutes !== data.defaults.creditMinutes || data.actualPrice !== data.defaults.price;
    if (deviated && !data.reason) errors.push('实际值偏离默认值时必须填写调整原因');
    if (data.productType === 'call_credit_pack') {
      if (!data.profile || data.profile.entitlement.status !== 'active') errors.push('话费充值包仅能在服务有效期内购买');
      if (data.actualDurationDays > remainingServiceDays(data.profile)) errors.push('充值包使用时长不能超过当前服务剩余天数');
    }
    if (data.productType !== 'call_credit_pack' && data.profile && data.profile.entitlement.status === 'active' && remainingServiceDays(data.profile) > 0) errors.push('当前服务套餐已生效，请勿重复开通');
    return errors;
  }

  function showRechargeValidation(errors) {
    var container = document.getElementById('rechargeValidation');
    if (!container) return;
    container.innerHTML = errors.length ? '<strong>请检查以下内容：</strong><ul><li>' + errors.join('</li><li>') + '</li></ul>' : '';
    container.classList.toggle('visible', errors.length > 0);
  }

  function nextInternalRechargeNo() {
    var datePart = getRechargeIteration().simulatedNow.slice(0, 10).replace(/-/g, '');
    var sequence = (getRechargeIteration().rechargeRecords || []).length + 1;
    return 'RC' + datePart + String(sequence).padStart(4, '0');
  }

  function executeRechargeWrite(data) {
    if (!requireTenantBillingPermission()) return null;
    var profile = data.profile;
    var pool = profile.unifiedMinutePool;
    var beforeValue = Number(pool.availableMinutes || 0);
    var afterValue = beforeValue + data.actualCreditMinutes;
    var now = getRechargeIteration().simulatedNow;
    if (data.productType === 'standard_annual' || data.productType === 'trial_package') {
      profile.entitlement.productType = data.productType;
      profile.entitlement.status = 'active';
      profile.entitlement.effectiveAt = now;
      profile.entitlement.expiresAt = addIterationDays(now, data.actualDurationDays);
      profile.entitlement.durationDays = data.actualDurationDays;
      if (profile.usageState === 'expired') profile.usageState = 'loaded';
    }
    pool.availableMinutes = afterValue;
    pool.accountVersion = profile.id.slice(-4) + '-MP-' + String(Date.now()).slice(-6);
    var product = getRechargeIteration().products[data.productType];
    var record = {
      internalNo: nextInternalRechargeNo(), tenantId: profile.id, tenantName: profile.name,
      productType: data.productType, productName: product.name, quantity: data.quantity,
      price: data.actualPrice, defaultPrice: data.defaults.price, actualDurationDays: data.actualDurationDays,
      actualCreditMinutes: data.actualCreditMinutes, beforeValue: beforeValue, afterValue: afterValue,
      valueUnit: '分钟', operatorName: window.getDemoAuth().displayName,
      operatedAt: now, reason: data.reason || '使用默认值', status: 'effective'
    };
    getRechargeIteration().rechargeRecords.unshift(record);
    return record;
  }

  function submitRechargeForm() {
    if (!requireTenantBillingPermission()) return;
    var data = collectRechargeFormData();
    var errors = validateRechargeForm(data);
    showRechargeValidation(errors);
    if (errors.length) {
      showToast(errors[0], 'warning');
      return;
    }
    if (getRechargeIteration().demoStates.failNextRecharge) {
      getRechargeIteration().demoStates.failNextRecharge = false;
      var failure = document.getElementById('rechargeWriteFailure');
      if (failure) failure.style.display = 'flex';
      showToast('写账失败，账户未发生变化', 'error');
      return;
    }
    var button = document.getElementById('rechargeSubmitButton');
    if (button) { button.disabled = true; button.textContent = '处理中…'; }
    var submittedModal = document.getElementById('rechargeFormModal');
    setTimeout(function () {
      if (document.getElementById('rechargeFormModal') !== submittedModal || !requireTenantBillingPermission()) return;
      var record = executeRechargeWrite(data);
      if (!record) return;
      closeRechargeForm();
      var backdrop = document.getElementById('tenantBillingBackdrop');
      if (backdrop) backdrop.remove();
      showBillingDrawer(data.profile.name);
      refreshTenantTable();
      showToast('充值已生效，内部流水 ' + record.internalNo, 'success');
    }, 360);
  }

  function simulateRechargeWriteFailure() {
    if (!requireTenantBillingPermission()) return;
    getRechargeIteration().demoStates.failNextRecharge = true;
    submitRechargeForm();
  }

  function retryRechargeWrite() {
    var failure = document.getElementById('rechargeWriteFailure');
    if (failure) failure.style.display = 'none';
    submitRechargeForm();
  }

  function adjustmentCurrentValue(profile, target) {
    if (target === 'duration_days') return Number(profile.entitlement && profile.entitlement.durationDays || 0);
    return Number(profile.unifiedMinutePool && profile.unifiedMinutePool.availableMinutes || 0);
  }

  function adjustmentUnit(target) {
    return target === 'duration_days' ? '天' : '分钟';
  }

  function adjustmentMaxDecrease(profile, target) {
    var current = adjustmentCurrentValue(profile, target);
    return target === 'duration_days' ? Math.max(0, current - 1) : current;
  }

  function getIterationAdjustmentProfile() {
    var modal = document.getElementById('iterationAdjustmentModal');
    var tenantId = modal && modal.dataset.tenantId;
    return (getRechargeIteration().tenants || []).find(function (item) { return String(item.id) === String(tenantId); }) || null;
  }

  function openIterationAdjustmentForm() {
    if (!requireTenantBillingPermission()) return;
    closeIterationAdjustmentForm();
    var drawer = document.getElementById('tenantBillingDrawer');
    var tenantId = drawer && drawer.dataset.tenantId;
    var profile = (getRechargeIteration().tenants || []).find(function (item) { return String(item.id) === String(tenantId); });
    if (!profile) {
      showToast('未找到当前租户账户', 'error');
      return;
    }
    var current = adjustmentCurrentValue(profile, 'available_minutes');
    var maxDecrease = adjustmentMaxDecrease(profile, 'available_minutes');
    var html = '' +
      '<div class="modal-overlay adjustment-form-backdrop" id="iterationAdjustmentBackdrop" onclick="window.Pages[\'sys-tenant\'].closeIterationAdjustmentForm(event)">' +
        '<div class="iteration-adjustment-modal" id="iterationAdjustmentModal" data-tenant-id="' + profile.id + '" data-account-version="' + profile.unifiedMinutePool.accountVersion + '" data-anno="iteration-adjustment-form" data-anno-page="sys-tenant" data-anno-label="使用时长与可用分钟手工调整" data-anno-kind="region" data-anno-fields="FLD-035,FLD-036,FLD-037,FLD-038,FLD-039,FLD-040" onclick="event.stopPropagation()">' +
          '<div class="tenant-form-modal-header"><div><div class="tenant-form-modal-title">手工调整</div><div class="recharge-form-subtitle">' + profile.name + ' · 账户版本 ' + profile.unifiedMinutePool.accountVersion + '</div></div><button class="tenant-form-modal-close" onclick="window.Pages[\'sys-tenant\'].closeIterationAdjustmentForm()">✕</button></div>' +
          '<div class="recharge-form-body">' +
            '<div class="adjustment-choice-grid">' +
              '<div class="recharge-field" data-anno="adjustment-direction-field" data-anno-page="sys-tenant" data-anno-label="调整方向" data-anno-kind="region" data-anno-fields="FLD-035"><label>调整方向</label><div class="tenant-radio-group"><label class="tenant-radio-label"><input type="radio" name="iterationAdjustmentDirection" value="increase" checked onchange="window.Pages[\'sys-tenant\'].updateIterationAdjustmentPreview()"> 调增</label><label class="tenant-radio-label"><input type="radio" name="iterationAdjustmentDirection" value="decrease" onchange="window.Pages[\'sys-tenant\'].updateIterationAdjustmentPreview()"> 调减</label></div></div>' +
              '<div class="recharge-field" data-anno="adjustment-target-field" data-anno-page="sys-tenant" data-anno-label="调整对象" data-anno-kind="region" data-anno-fields="FLD-036"><label>调整对象</label><div class="tenant-radio-group"><label class="tenant-radio-label"><input type="radio" name="iterationAdjustmentTarget" value="available_minutes" checked onchange="window.Pages[\'sys-tenant\'].updateIterationAdjustmentPreview()"> 可用分钟</label><label class="tenant-radio-label"><input type="radio" name="iterationAdjustmentTarget" value="duration_days" onchange="window.Pages[\'sys-tenant\'].updateIterationAdjustmentPreview()"> 使用时长</label></div></div>' +
            '</div>' +
            '<div class="adjustment-account-snapshot" data-anno="adjustment-boundary-state" data-anno-page="sys-tenant" data-anno-label="调整边界与冻结保护" data-anno-kind="region" data-anno-fields="FLD-022,FLD-039,FLD-040"><div><span>当前值</span><strong id="adjustmentCurrentValue">' + formatWholeMinutes(current) + '</strong></div><div><span>最多可调减</span><strong id="adjustmentMaxDecrease">' + formatWholeMinutes(maxDecrease) + '</strong></div><div><span>冻结分钟</span><strong>' + formatWholeMinutes(profile.unifiedMinutePool.frozenMinutes) + '</strong><small>调整不会修改</small></div></div>' +
            '<div class="adjustment-input-grid">' +
              '<div class="recharge-field" data-anno="adjustment-value-field" data-anno-page="sys-tenant" data-anno-label="手工调整值" data-anno-kind="region" data-anno-fields="FLD-037"><label>调整值</label><div class="recharge-input-unit"><input id="iterationAdjustmentValue" type="number" min="1" step="1" placeholder="请输入大于 0 的整数" oninput="window.Pages[\'sys-tenant\'].updateIterationAdjustmentPreview()"><span id="iterationAdjustmentUnit">分钟</span></div></div>' +
              '<div class="recharge-field" data-anno="adjustment-result-preview" data-anno-page="sys-tenant" data-anno-label="手工调整前后值预览" data-anno-kind="region" data-anno-fields="FLD-029,FLD-030"><label>结果预览</label><div class="recharge-readonly" id="iterationAdjustmentPreview">' + formatWholeMinutes(current) + ' → —</div></div>' +
            '</div>' +
            '<div class="recharge-field" data-anno="adjustment-reason-field" data-anno-page="sys-tenant" data-anno-label="手工调整原因" data-anno-kind="region" data-anno-fields="FLD-038"><label>调整原因 <em class="recharge-required-mark">必填</em></label><textarea id="iterationAdjustmentReason" rows="3" placeholder="请填写本次调整的业务原因"></textarea></div>' +
            '<div class="recharge-validation" id="iterationAdjustmentValidation" aria-live="polite"></div>' +
            '<div class="adjustment-conflict" id="iterationAdjustmentConflict" style="display:none;"><strong>账户版本已变化</strong><span id="iterationAdjustmentConflictText">已刷新当前值，请重新确认。</span></div>' +
          '</div>' +
          '<div class="tenant-form-modal-footer recharge-form-footer"><button class="recharge-demo-fail" onclick="window.Pages[\'sys-tenant\'].simulateAdjustmentConflict()">演示版本冲突</button><span class="recharge-footer-spacer"></span><button class="btn btn-default" onclick="window.Pages[\'sys-tenant\'].closeIterationAdjustmentForm()">取消</button><button class="btn btn-primary" data-anno="adjustment-submit-action" data-anno-page="sys-tenant" data-anno-label="确认手工调整" data-anno-kind="action" data-anno-fields="FLD-035,FLD-036,FLD-037,FLD-038,FLD-040" onclick="window.Pages[\'sys-tenant\'].submitIterationAdjustment()">确认调整</button></div>' +
        '</div>' +
      '</div>';
    document.body.insertAdjacentHTML('beforeend', html);
    updateIterationAdjustmentPreview();
  }

  function closeIterationAdjustmentForm(event) {
    if (event && event.target !== event.currentTarget) return;
    var backdrop = document.getElementById('iterationAdjustmentBackdrop');
    if (backdrop) backdrop.remove();
  }

  function getSelectedAdjustmentValue(name) {
    var input = document.querySelector('input[name="' + name + '"]:checked');
    return input ? input.value : '';
  }

  function updateIterationAdjustmentPreview() {
    var profile = getIterationAdjustmentProfile();
    if (!profile) return;
    var direction = getSelectedAdjustmentValue('iterationAdjustmentDirection') || 'increase';
    var target = getSelectedAdjustmentValue('iterationAdjustmentTarget') || 'available_minutes';
    var value = Number(document.getElementById('iterationAdjustmentValue') && document.getElementById('iterationAdjustmentValue').value || 0);
    var current = adjustmentCurrentValue(profile, target);
    var maxDecrease = adjustmentMaxDecrease(profile, target);
    var unit = adjustmentUnit(target);
    var after = direction === 'decrease' ? current - value : current + value;
    var currentEl = document.getElementById('adjustmentCurrentValue');
    var maxEl = document.getElementById('adjustmentMaxDecrease');
    var unitEl = document.getElementById('iterationAdjustmentUnit');
    var previewEl = document.getElementById('iterationAdjustmentPreview');
    if (currentEl) currentEl.textContent = Number(current).toLocaleString('zh-CN') + ' ' + unit;
    if (maxEl) maxEl.textContent = Number(maxDecrease).toLocaleString('zh-CN') + ' ' + unit;
    if (unitEl) unitEl.textContent = unit;
    if (previewEl) previewEl.textContent = Number(current).toLocaleString('zh-CN') + ' ' + unit + ' → ' + (isPositiveInteger(value) ? Number(after).toLocaleString('zh-CN') + ' ' + unit : '—');
  }

  function collectIterationAdjustment() {
    var profile = getIterationAdjustmentProfile();
    var direction = getSelectedAdjustmentValue('iterationAdjustmentDirection');
    var target = getSelectedAdjustmentValue('iterationAdjustmentTarget');
    var valueInput = document.getElementById('iterationAdjustmentValue');
    var reasonInput = document.getElementById('iterationAdjustmentReason');
    return {
      profile: profile,
      direction: direction,
      target: target,
      value: Number(valueInput && valueInput.value || 0),
      reason: String(reasonInput && reasonInput.value || '').trim()
    };
  }

  function validateIterationAdjustment(data) {
    var errors = [];
    if (!data.direction) errors.push('请选择调整方向');
    if (!data.target) errors.push('请选择调整对象');
    if (!isPositiveInteger(data.value)) errors.push('调整值必须为大于 0 的整数');
    if (!data.reason) errors.push('请填写调整原因');
    if (data.profile && data.direction === 'decrease' && isPositiveInteger(data.value) && data.value > adjustmentMaxDecrease(data.profile, data.target)) {
      errors.push('调减值超过当前最大可调减范围');
    }
    return errors;
  }

  function showIterationAdjustmentValidation(errors) {
    var container = document.getElementById('iterationAdjustmentValidation');
    if (!container) return;
    container.innerHTML = errors.length ? '<strong>请检查以下内容：</strong><ul><li>' + errors.join('</li><li>') + '</li></ul>' : '';
    container.classList.toggle('visible', errors.length > 0);
  }

  function nextAdjustmentNo() {
    var datePart = getRechargeIteration().simulatedNow.slice(0, 10).replace(/-/g, '');
    return 'ADJ' + datePart + String((getRechargeIteration().adjustmentRecords || []).length + 1).padStart(4, '0');
  }

  function submitIterationAdjustment() {
    if (!requireTenantBillingPermission()) return;
    var data = collectIterationAdjustment();
    var errors = validateIterationAdjustment(data);
    showIterationAdjustmentValidation(errors);
    if (errors.length) {
      showToast(errors[0], 'warning');
      return;
    }
    var modal = document.getElementById('iterationAdjustmentModal');
    var openedVersion = modal && modal.dataset.accountVersion;
    var latestVersion = data.profile.unifiedMinutePool.accountVersion;
    if (openedVersion !== latestVersion) {
      if (modal) modal.dataset.accountVersion = latestVersion;
      var conflict = document.getElementById('iterationAdjustmentConflict');
      var conflictText = document.getElementById('iterationAdjustmentConflictText');
      if (conflict) conflict.style.display = 'flex';
      if (conflictText) conflictText.textContent = '账户版本已从 ' + openedVersion + ' 更新为 ' + latestVersion + '，当前值已刷新，请再次点击确认。';
      updateIterationAdjustmentPreview();
      showToast('账户数据已变化，请按刷新后的值重新确认', 'warning');
      return;
    }
    var profile = data.profile;
    var before = adjustmentCurrentValue(profile, data.target);
    var after = data.direction === 'decrease' ? before - data.value : before + data.value;
    var frozenBefore = Number(profile.unifiedMinutePool.frozenMinutes || 0);
    if (data.target === 'available_minutes') {
      profile.unifiedMinutePool.availableMinutes = after;
    } else {
      profile.entitlement.durationDays = after;
      profile.entitlement.expiresAt = addIterationDays(profile.entitlement.expiresAt || getRechargeIteration().simulatedNow, data.direction === 'decrease' ? -data.value : data.value);
    }
    profile.unifiedMinutePool.accountVersion = profile.id.slice(-4) + '-MP-' + String(Date.now()).slice(-6);
    var unit = adjustmentUnit(data.target);
    var record = {
      adjustmentNo: nextAdjustmentNo(), tenantId: profile.id, tenantName: profile.name,
      direction: data.direction, target: data.target, value: data.value,
      beforeValue: before, afterValue: after, valueUnit: unit, reason: data.reason,
      operatorName: window.getDemoAuth().displayName,
      operatedAt: getRechargeIteration().simulatedNow,
      accountVersion: profile.unifiedMinutePool.accountVersion,
      frozenMinutesBefore: frozenBefore, frozenMinutesAfter: profile.unifiedMinutePool.frozenMinutes,
      status: 'effective'
    };
    getRechargeIteration().adjustmentRecords.unshift(record);
    closeIterationAdjustmentForm();
    var backdrop = document.getElementById('tenantBillingBackdrop');
    if (backdrop) backdrop.remove();
    showBillingDrawer(profile.name);
    refreshTenantTable();
    showToast('手工调整已生效，流水 ' + record.adjustmentNo, 'success');
  }

  function simulateAdjustmentConflict() {
    if (!requireTenantBillingPermission()) return;
    var profile = getIterationAdjustmentProfile();
    if (!profile) return;
    profile.unifiedMinutePool.accountVersion = profile.unifiedMinutePool.accountVersion + '-NEW';
    submitIterationAdjustment();
  }

  function showLegacyBillingDrawer(tenantName) {
    var existed = findBillingByTenant(tenantName);
    var row = existed || buildBillingSeed(tenantName);
    var tenantLocked = tenantName || row.tenantName;
    var summary = getTenantBillingSummary(tenantLocked);
    var tenantBase = getTenantRows().find(function (item) { return normalizeTenantName(item.name) === normalizeTenantName(tenantLocked); });
    var iterationProfile = getTenantIterationProfile(tenantBase || tenantLocked, true);
    var iterationFlagText = iterationProfile.commercialFlag === 'commercial' ? '商用' : '试用';
    var html = '' +
      '<div class="biz-drawer-backdrop" id="tenantBillingBackdrop" onclick="window.Pages[\'sys-tenant\'].closeBillingDrawer(event)">' +
        '<div class="biz-drawer tenant-drawer" id="tenantBillingDrawer" data-anno-page="sys-tenant" data-anno-label="租户充值与余额管理" data-anno-kind="region" data-anno-fields="FLD-050,FLD-055" onclick="event.stopPropagation()" data-row-id="' + row.id + '" data-new="' + (existed ? '0' : '1') + '">' +
          '<div class="biz-drawer-header">' +
            '<span class="biz-drawer-title">充值管理</span>' +
            '<span class="biz-drawer-close" onclick="window.Pages[\'sys-tenant\'].closeBillingDrawer()">&#x2715;</span>' +
          '</div>' +
          '<div class="biz-drawer-body">' +
            '<div class="tenant-iteration-context">' +
              '<div><span>租户名称</span><strong>' + tenantLocked + '</strong></div>' +
              '<div><span>租户 ID</span><strong>' + iterationProfile.id + '</strong></div>' +
              '<div><span>租户标记</span><strong><em class="tenant-commercial-tag ' + iterationProfile.commercialFlag + '">' + iterationFlagText + '</em></strong></div>' +
            '</div>' +
            '<div class="tenant-drawer-section">' +
              '<div class="tenant-section-title">租户信息</div>' +
              '<div class="biz-form-row">' +
                '<label class="biz-form-label required">租户</label>' +
                '<div class="biz-form-field"><input class="biz-form-input readonly" id="tenantName" value="' + tenantLocked + '" readonly></div>' +
              '</div>' +
              '<div class="biz-form-row">' +
                '<label class="biz-form-label">有效期</label>' +
                '<div class="biz-form-field"><input class="biz-form-input readonly" id="tenantValidity" value="' + summary.validity + '" readonly></div>' +
              '</div>' +
              '<div class="biz-form-row">' +
                '<label class="biz-form-label">历史充值总额</label>' +
                '<div class="biz-form-field"><input class="biz-form-input readonly" id="tenantTotalRecharge" value="' + formatBalance(summary.totalRechargeAmount) + '" readonly></div>' +
              '</div>' +
              '<input type="hidden" id="tenantAvailableBalance" value="' + summary.availableAmount + '">' +
              '<div class="biz-form-row">' +
                '<label class="biz-form-label">呼叫控制状态</label>' +
                '<div class="biz-form-field"><input class="biz-form-input readonly" id="tenantCallStatus" value="' + summary.callStatus + '" readonly></div>' +
              '</div>' +
            '</div>' +
            '<div class="tenant-billing-tabs" role="tablist">' +
              '<button class="tenant-billing-tab active" role="tab" data-tab="pricing" onclick="window.Pages[\'sys-tenant\'].switchBillingTab(\'pricing\')">计费明细</button>' +
              '<button class="tenant-billing-tab" role="tab" data-tab="recharge" onclick="window.Pages[\'sys-tenant\'].switchBillingTab(\'recharge\')">充值单管理</button>' +
              '<button class="tenant-billing-tab" role="tab" data-tab="adjustment" onclick="window.Pages[\'sys-tenant\'].switchBillingTab(\'adjustment\')">余额调整</button>' +
            '</div>' +
            '<div class="tenant-billing-tab-panel active" data-panel="pricing" role="tabpanel">' +
              '<div class="tenant-drawer-section tenant-tab-section">' +
                '<div class="biz-modal-notice tenant-notice tenant-pricing-notice">' +
                  '<span class="biz-notice-icon">&#x26A0;</span>' +
                  '<div class="biz-notice-body">大模型和小模型余额均由同一资金余额按模型默认单价换算，两类分钟数是不同计价视图，不可相加。</div>' +
                '</div>' +
                '<div id="tenantBalanceRiskNotice">' + renderBalanceRisk(summary) + '</div>' +
                '<div class="tenant-pricing-table-wrap">' +
                  '<table class="tenant-pricing-table">' +
                    '<thead><tr><th>模型</th><th>模型默认单价</th><th>冻结分钟数</th><th>冻结金额</th><th>通话余额</th><th>可用分钟数</th><th>状态</th></tr></thead>' +
                    '<tbody id="tenantPricingBody">' + renderPricingRows(tenantLocked) + '</tbody>' +
                  '</table>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="tenant-billing-tab-panel" data-panel="recharge" role="tabpanel">' +
              '<div class="tenant-drawer-section">' +
                '<div class="tenant-section-title">关联充值单</div>' +
                '<div class="biz-form-row">' +
                  '<label class="biz-form-label required">关联类型</label>' +
                  '<div class="biz-form-field">' +
                    '<div class="biz-radio-group tenant-association-type">' +
                      '<label class="biz-radio"><input type="radio" name="tenantRechargeAssociationType" value="PAID" checked onchange="window.Pages[\'sys-tenant\'].switchRechargeAssociationType(this.value)"><span>付费单</span></label>' +
                      '<label class="biz-radio"><input type="radio" name="tenantRechargeAssociationType" value="TRIAL" onchange="window.Pages[\'sys-tenant\'].switchRechargeAssociationType(this.value)"><span>试用单</span></label>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
                '<div id="tenantPaidRechargeFields">' +
                  '<div class="biz-form-row">' +
                    '<label class="biz-form-label required">充值单号</label>' +
                    '<div class="biz-form-field">' +
                      '<div class="tenant-recharge-check">' +
                        '<input class="biz-form-input" id="tenantRechargeNo" value="' + (row.rechargeNo || '') + '" placeholder="请输入充值单号" oninput="window.Pages[\'sys-tenant\'].previewRechargeOrder()">' +
                        '<button class="btn btn-primary" onclick="window.Pages[\'sys-tenant\'].readRechargeOrder()" style="height:36px;padding:0 14px;">读取</button>' +
                      '</div>' +
                    '</div>' +
                  '</div>' +
                  '<div class="tenant-order-preview" id="tenantOrderPreview"></div>' +
                  '<div class="biz-modal-notice tenant-notice">' +
                    '<span class="biz-notice-icon">&#x26A0;</span>' +
                    '<div class="biz-notice-body">充值金额进入统一资金账户。大模型和小模型余额按各自默认单价换算，分钟数不可相加。</div>' +
                  '</div>' +
                '</div>' +
                '<div id="tenantTrialRechargeFields" class="tenant-trial-form" style="display:none;">' +
                  '<div class="biz-form-row">' +
                    '<label class="biz-form-label">有效时间</label>' +
                    '<div class="biz-form-field">' +
                      '<select class="biz-form-select" id="tenantTrialValidityMonths">' +
                        '<option value="">请选择</option><option value="1">1 个月</option><option value="2">2 个月</option><option value="3">3 个月</option>' +
                      '</select>' +
                    '</div>' +
                  '</div>' +
                  '<div class="biz-form-row">' +
                    '<label class="biz-form-label">通话费用</label>' +
                    '<div class="biz-form-field"><input class="biz-form-input" id="tenantTrialCallFee" type="number" min="0.01" step="0.01" placeholder="请输入通话费用（元）"></div>' +
                  '</div>' +
                  '<div class="tenant-recharge-confirm">' +
                    '<span>确认后生成待生效的试用单记录</span>' +
                    '<button class="btn btn-primary" onclick="window.Pages[\'sys-tenant\'].confirmTrialOrder()">确认关联</button>' +
                  '</div>' +
                  '<div class="biz-modal-notice tenant-notice">' +
                    '<span class="biz-notice-icon">&#x26A0;</span>' +
                    '<div class="biz-notice-body">有效时间与通话费用至少填写一项；试用有效时间按每月 30 日换算，生效时可再次调整时长，通话费用在生效后计入资金余额。</div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<div class="tenant-drawer-section tenant-tab-section">' +
                '<div class="tenant-section-title">历史关联充值单</div>' +
                '<div class="tenant-history-table-wrap">' +
                  '<table class="tenant-history-table">' +
                    '<thead><tr><th>序号</th><th>充值单号</th><th>关联类型</th><th>门店编码</th><th>门店名称</th><th>支付状态</th><th>生效状态</th><th>计费类型</th><th>坐席费套餐</th><th>周期</th><th>充值金额</th><th>有效期</th><th>操作人</th><th>关联时间</th><th>操作</th></tr></thead>' +
                    '<tbody id="tenantHistoryBody">' + renderHistoryRows(tenantLocked) + '</tbody>' +
                  '</table>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="tenant-billing-tab-panel" data-panel="adjustment" role="tabpanel">' +
              '<div class="tenant-drawer-section tenant-tab-section tenant-adjustment-section">' +
                '<div class="tenant-list-tools" style="margin-bottom:12px;">' +
                  '<button class="btn btn-primary" onclick="window.Pages[\'sys-tenant\'].showAdjustmentModal()" style="height:34px;padding:0 16px;">+ 手工调整</button>' +
                '</div>' +
                '<div class="tenant-history-table-wrap tenant-adjustment-table-wrap">' +
                  '<table class="tenant-history-table tenant-adjustment-table">' +
                    '<thead><tr><th>序号</th><th>调整单号</th><th>调整类型</th><th>方向</th><th>金额</th><th>原因</th><th>操作人</th><th>生效时间</th></tr></thead>' +
                    '<tbody id="tenantAdjustmentBody">' + renderAdjustmentRows(tenantLocked) + '</tbody>' +
                  '</table>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="biz-drawer-footer">' +
            '<button class="btn btn-default" onclick="window.Pages[\'sys-tenant\'].closeBillingDrawer()" style="height:32px;padding:0 20px;">关闭</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.insertAdjacentHTML('beforeend', html);
    requestAnimationFrame(function () {
      var bd = document.getElementById('tenantBillingBackdrop');
      var dr = document.getElementById('tenantBillingDrawer');
      if (bd) bd.classList.add('open');
      if (dr) dr.classList.add('open');
      renderCheckedOrder(row.rechargeNo ? getOrders().find(function (item) { return item.no === row.rechargeNo; }) : null);
    });
  }

  function closeBillingDrawer(e) {
    if (e && e.target !== e.currentTarget) return;
    var backdrop = document.getElementById('tenantBillingBackdrop');
    var drawer = document.getElementById('tenantBillingDrawer');
    if (!backdrop || !drawer) return;
    drawer.classList.add('closing');
    backdrop.classList.remove('open');
    setTimeout(function () { backdrop.remove(); }, 280);
  }

  function switchBillingTab(tabName) {
    var drawer = document.getElementById('tenantBillingDrawer');
    if (!drawer) return;
    var hasTab = Array.from(drawer.querySelectorAll('.tenant-billing-tab')).some(function (tab) { return tab.dataset.tab === tabName; });
    if (!hasTab) return;
    drawer.querySelectorAll('.tenant-billing-tab').forEach(function (tab) {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    drawer.querySelectorAll('.tenant-billing-tab-panel').forEach(function (panel) {
      panel.classList.toggle('active', panel.dataset.panel === tabName);
    });
  }

  function switchRechargeAssociationType(type) {
    var paidPanel = document.getElementById('tenantPaidRechargeFields');
    var trialPanel = document.getElementById('tenantTrialRechargeFields');
    var isTrial = type === 'TRIAL';
    if (paidPanel) paidPanel.style.display = isTrial ? 'none' : 'block';
    if (trialPanel) trialPanel.style.display = isTrial ? 'block' : 'none';
  }

  function getTenantStoreInfo(tenantName) {
    var order = getOrders().find(function (item) {
      return normalizeTenantName(item.tenantName) === normalizeTenantName(tenantName);
    });
    var tenant = getTenantRows().find(function (item) {
      return normalizeTenantName(item.name) === normalizeTenantName(tenantName);
    });
    return {
      storeCode: (order && order.storeCode) || (tenant && tenant.tenantId) || '-',
      storeName: (order && order.storeName) || tenantName || '-'
    };
  }

  function confirmTrialOrder() {
    if (!requireTenantBillingPermission()) return;
    var tenantInput = document.getElementById('tenantName');
    var tenantName = tenantInput ? tenantInput.value : '';
    var monthsSelect = document.getElementById('tenantTrialValidityMonths');
    var months = Number(monthsSelect ? monthsSelect.value : 0);
    var callFeeInput = document.getElementById('tenantTrialCallFee');
    var callFee = Number(callFeeInput ? callFeeInput.value : 0);

    var hasValidity = [1, 2, 3].indexOf(months) > -1;
    var hasCallFee = Number.isFinite(callFee) && callFee > 0;

    if (!hasValidity && !hasCallFee) {
      showToast('有效时间和通话费用至少填写一项', 'warning');
      return;
    }

    var billingType, seatFeePackage, trialMonths, periodDays, rechargeAmount;
    if (hasValidity && hasCallFee) {
      billingType = '坐席费+通话费';
      seatFeePackage = '试用' + months + '个月';
      trialMonths = months;
      periodDays = months * 30;
      rechargeAmount = callFee;
    } else if (hasValidity) {
      billingType = '仅坐席费';
      seatFeePackage = '试用' + months + '个月';
      trialMonths = months;
      periodDays = months * 30;
      rechargeAmount = 0;
    } else {
      billingType = '仅通话费';
      seatFeePackage = '-';
      trialMonths = 0;
      periodDays = 0;
      rechargeAmount = callFee;
    }

    var now = new Date();
    var store = getTenantStoreInfo(tenantName);
    var rechargeNo = 'TRY' + formatLocalDate(now).replace(/-/g, '') + String(now.getTime()).slice(-6);
    getHistoryRows().unshift({
      id: now.getTime(),
      orderType: '试用单',
      tenantName: tenantName,
      rechargeNo: rechargeNo,
      storeCode: store.storeCode,
      storeName: store.storeName,
      status: '已支付',
      billingType: billingType,
      seatFeePackage: seatFeePackage,
      trialMonths: trialMonths,
      periodDays: periodDays,
      rechargeAmount: rechargeAmount,
      validFrom: '-',
      validTo: '-',
      validityActivated: false,
      activated: false,
      operator: 'xtadmin',
      bindTime: formatLocalDateTime(now)
    });

    if (callFeeInput) callFeeInput.value = '';
    if (monthsSelect) monthsSelect.value = '';
    var historyBody = document.getElementById('tenantHistoryBody');
    if (historyBody) historyBody.innerHTML = renderHistoryRows(tenantName);
    updateDrawerFieldsAfterActivation(tenantName);
    showToast('试用单已关联，请在历史记录中点击”生效”', 'success');
  }

  function renderCheckedOrder(order) {
    var drawer = document.getElementById('tenantBillingDrawer');
    if (drawer) {
      drawer._checkedOrder = order || null;
    }
    var noInput = document.getElementById('tenantRechargeNo');
    var no = noInput ? noInput.value : '';
    var box = document.getElementById('tenantOrderPreview');
    if (!box) return;
    if (!order) {
      box.innerHTML = no
        ? '<div class="tenant-empty-preview">充值单号已变更，请重新读取</div>'
        : '<div class="tenant-empty-preview">请输入充值单号并点击“读取”</div>';
      return;
    }
    var preview = buildSubmitPreview(order);
    var tenantInput = document.getElementById('tenantName');
    var billingTenantName = tenantInput ? tenantInput.value : '';
    var historyRow = getHistoryRows().find(function (item) {
      return item.rechargeNo === order.no &&
        normalizeTenantName(item.tenantName) === normalizeTenantName(billingTenantName);
    });
    var isSubmitted = !!historyRow;
    var validityDisplay = preview.validity;
    if (isSubmitted && historyRow.validFrom && historyRow.validFrom !== '-' && historyRow.validTo && historyRow.validTo !== '-') {
      validityDisplay = historyRow.validFrom + ' ~ ' + historyRow.validTo;
    } else if (isSubmitted && !isRechargeActivated(historyRow) && canGenerateValidity({
      rechargeStatus: historyRow.status,
      billingType: historyRow.billingType
    })) {
      validityDisplay = '待生效';
    }
    var tenantName = billingTenantName;
    var largeConfigs = getTenantPriceConfigs(tenantName, '大模型');
    var smallConfigs = getTenantPriceConfigs(tenantName, '小模型');
    var rechargeAmount = order.status === '已支付' ? order.rechargeAmount : 0;
    var tenantMatched = normalizeTenantName(order.tenantName) === normalizeTenantName(tenantName);
    var duplicated = getHistoryRows().some(function (item) { return item.rechargeNo === order.no; });
    var canConfirm = order.status === '已支付' && tenantMatched && !duplicated;
    var confirmText = duplicated
      ? '该充值单已关联'
      : (!tenantMatched ? '门店与当前租户不匹配' : (order.status === '已支付' ? '请核对门店信息后确认关联' : ('当前状态为' + order.status + '，不可关联')));
    box.innerHTML = '' +
      '<div class="tenant-preview-grid">' +
        '<div><span>充值单状态</span>' + statusTag(order.status) + '</div>' +
        '<div><span>门店编码</span><strong>' + (order.storeCode || '-') + '</strong></div>' +
        '<div><span>门店名称</span><strong>' + (order.storeName || '-') + '</strong></div>' +
        '<div><span>计费类型</span><strong>' + order.billingType + '</strong></div>' +
        '<div><span>坐席费套餐</span><strong>' + (order.seatFeePackage || '-') + '</strong></div>' +
        '<div><span>充值金额</span><strong>' + formatBalance(rechargeAmount) + (isSubmitted && !isRechargeActivated(historyRow) ? '（待生效）' : '') + '</strong></div>' +
        '<div><span>大模型等价分钟数</span><strong>' + formatMinuteRange(largeConfigs, rechargeAmount) + '</strong></div>' +
        '<div><span>小模型等价分钟数</span><strong>' + formatMinuteRange(smallConfigs, rechargeAmount) + '</strong></div>' +
      '</div>' +
      '<div class="tenant-recharge-confirm ' + (canConfirm ? '' : 'disabled') + '">' +
        '<span>' + confirmText + '</span>' +
        '<button class="btn btn-primary" ' + (canConfirm ? '' : 'disabled') + ' onclick="window.Pages[\'sys-tenant\'].confirmRechargeOrder()">确认关联</button>' +
      '</div>';
  }

  function previewRechargeOrder() {
    renderCheckedOrder(null);
  }

  function buildSubmitPreview(order) {
    var tenantInput = document.getElementById('tenantName');
    var tenantName = tenantInput ? tenantInput.value : '';
    if (order.status !== '已支付' || !(order.billingType === '仅坐席费' || order.billingType === '坐席费+通话费')) {
      return { validity: '-' };
    }
    var now = currentBizDate();
    var baseDate = latestValidTo(tenantName);
    var validFrom = baseDate && baseDate >= now ? addDays(baseDate, 2) : now;
    var days = packageDays(order.seatFeePackage) || order.periodDays || 0;
    return { validity: validFrom + ' ~ ' + addDays(validFrom, days) };
  }

  function readRechargeOrder() {
    var noInput = document.getElementById('tenantRechargeNo');
    var no = noInput ? noInput.value.trim() : '';
    if (!no) {
      showToast('请输入充值单号', 'warning');
      renderCheckedOrder(null);
      return;
    }

    var order = getOrders().find(function (item) { return item.no === no; }) || {
      no: no,
      tenantName: (document.getElementById('tenantName') ? document.getElementById('tenantName').value : ''),
      status: '不存在',
      storeCode: '-',
      storeName: '-',
      periodDays: 0,
      billingType: '仅坐席费',
      seatFeePackage: '-',
      rechargeAmount: 0
    };
    renderCheckedOrder(order);

    var drawer = document.getElementById('tenantBillingDrawer');
    if (!drawer) return;
    if (order.status !== '已支付') {
      showToast('充值单读取完成，当前状态：' + order.status, 'warning');
      return;
    }
    var tenantInput = document.getElementById('tenantName');
    var tenantName = tenantInput ? tenantInput.value : '';
    if (normalizeTenantName(order.tenantName) !== normalizeTenantName(tenantName)) {
      showToast('充值单门店与当前租户不匹配，请核对后重试', 'warning');
      return;
    }
    if (getHistoryRows().some(function (item) { return item.rechargeNo === order.no; })) {
      showToast('该充值单号已关联，请勿重复关联', 'warning');
      return;
    }
    showToast('充值单读取成功，请核对门店信息后确认关联', 'success');
  }

  function confirmRechargeOrder() {
    if (!requireTenantBillingPermission()) return;
    var drawer = document.getElementById('tenantBillingDrawer');
    if (!drawer) return;
    var order = drawer._checkedOrder;
    var noInput = document.getElementById('tenantRechargeNo');
    var no = noInput ? noInput.value.trim() : '';
    if (!order || order.no !== no) {
      showToast('请先读取当前充值单号', 'warning');
      renderCheckedOrder(null);
      return;
    }
    if (order.status !== '已支付') {
      showToast('当前充值单状态为' + order.status + '，不能关联', 'warning');
      return;
    }
    var tenantInput = document.getElementById('tenantName');
    var tenantName = tenantInput ? tenantInput.value : '';
    if (normalizeTenantName(order.tenantName) !== normalizeTenantName(tenantName)) {
      showToast('充值单门店与当前租户不匹配，不能关联', 'warning');
      return;
    }
    if (getHistoryRows().some(function (item) { return item.rechargeNo === order.no; })) {
      showToast('该充值单号已关联，请勿重复关联', 'warning');
      renderCheckedOrder(order);
      return;
    }

    var rowId = Number(drawer.dataset.rowId);
    var isNew = drawer.dataset.new === '1';
    var row = isNew ? { id: rowId } : getBillingRows().find(function (item) { return item.id === rowId; });
    row.tenantName = tenantName || row.tenantName;
    row.localAddedAt = formatLocalDateTime(new Date());

    applyOrderToRow(row, order);
    if (isNew) getBillingRows().push(row);

    if (row.rechargeStatus === '已支付') {
      getHistoryRows().unshift({
        id: Date.now(),
        orderType: '付费单',
        tenantName: row.tenantName,
        rechargeNo: row.rechargeNo,
        storeCode: row.storeCode,
        storeName: row.storeName,
        status: row.rechargeStatus,
        billingType: row.billingType,
        seatFeePackage: row.seatFeePackage,
        periodDays: row.periodDays,
        rechargeAmount: row.rechargeAmount,
        validFrom: row.validFrom,
        validTo: row.validTo,
        validityActivated: row.validityActivated,
        activated: false,
        operator: 'xtadmin',
        bindTime: row.localAddedAt
      });
    }

    var historyBody = document.getElementById('tenantHistoryBody');
    if (historyBody) historyBody.innerHTML = renderHistoryRows(row.tenantName);
    updateDrawerFieldsAfterActivation(row.tenantName);
    renderCheckedOrder(order);
    showToast('充值单已关联，请在历史记录中点击“生效”后更新有效期和余额', 'success');
  }

  function createBalanceAdjustment(data) {
    var now = new Date();
    getBalanceAdjustments().unshift({
      id: Date.now(),
      adjustmentNo: 'ADJ' + formatLocalDate(now).replace(/-/g, '') + String(Date.now()).slice(-5),
      tenantName: data.tenantName,
      type: 'MANUAL_DEDUCT',
      direction: 'OUT',
      amount: data.amount,
      reason: data.reason,
      operator: 'xtadmin',
      status: '已生效',
      effectiveAt: formatLocalDateTime(now)
    });
  }

  function refreshAfterBalanceAdjustment(tenantName, successText) {
    updateDrawerFieldsAfterActivation(tenantName);
    var container = document.getElementById('page-content');
    if (container) container.innerHTML = render();
    var updatedSummary = getTenantBillingSummary(tenantName);
    showToast(
      updatedSummary.availableAmount <= 0
        ? (successText + '，当前已无新增冻结额度')
        : successText,
      updatedSummary.availableAmount <= 0 ? 'warning' : 'success'
    );
  }

  function showAdjustmentModal() {
    if (!requireTenantBillingPermission()) return;
    closeAdjustmentModal();
    var tenantInput = document.getElementById('tenantName');
    var tenantName = tenantInput ? tenantInput.value : '';
    var summary = getTenantBillingSummary(tenantName);
    var html = '' +
      '<div class="tenant-pricing-modal-backdrop" id="tenantAdjustmentBackdrop" onclick="window.Pages[\'sys-tenant\'].closeAdjustmentModal(event)">' +
        '<div class="tenant-pricing-modal tenant-refund-modal" id="tenantAdjustmentModal" onclick="event.stopPropagation()">' +
          '<div class="tenant-pricing-modal-header">' +
            '<div>' +
              '<div class="tenant-pricing-modal-title">手工调整</div>' +
              '<div class="tenant-pricing-modal-subtitle">' + tenantName + '</div>' +
            '</div>' +
            '<button class="tenant-pricing-modal-close" onclick="window.Pages[\'sys-tenant\'].closeAdjustmentModal()">&#x2715;</button>' +
          '</div>' +
          '<div class="tenant-pricing-modal-body">' +
            '<div class="tenant-refund-summary">' +
              '<div><span>当前资金余额</span><strong>' + formatBalance(summary.balanceAmount) + '</strong></div>' +
            '</div>' +
            '<div class="biz-modal-notice tenant-pricing-config-notice">' +
              '<span class="biz-notice-icon">&#x26A0;</span>' +
              '<div class="biz-notice-body">手工扣减金额不能超过当前资金余额，不占用冻结金额。</div>' +
            '</div>' +
            '<div class="tenant-refund-form">' +
              '<div class="tenant-adjustment-field">' +
                '<label>金额</label>' +
                '<input id="tenantAdjustmentModalAmount" type="number" min="0.01" step="0.01" placeholder="请输入金额">' +
              '</div>' +
              '<div class="tenant-adjustment-field">' +
                '<label>原因</label>' +
                '<input id="tenantAdjustmentModalReason" type="text" maxlength="100" placeholder="请输入原因">' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="tenant-pricing-modal-footer">' +
            '<button class="btn btn-default" onclick="window.Pages[\'sys-tenant\'].closeAdjustmentModal()">取消</button>' +
            '<button class="btn btn-primary" onclick="window.Pages[\'sys-tenant\'].submitAdjustmentFromModal()">确认调整</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.insertAdjacentHTML('beforeend', html);
  }

  function closeAdjustmentModal(e) {
    if (e && e.target !== e.currentTarget) return;
    var bd = document.getElementById('tenantAdjustmentBackdrop');
    if (bd) bd.remove();
  }

  function submitAdjustmentFromModal() {
    if (!requireTenantBillingPermission()) return;
    var tenantInput = document.getElementById('tenantName');
    var tenantName = tenantInput ? tenantInput.value : '';
    var amountInput = document.getElementById('tenantAdjustmentModalAmount');
    var amount = Number(amountInput && amountInput.value);
    var reasonInput = document.getElementById('tenantAdjustmentModalReason');
    var reason = String(reasonInput && reasonInput.value || '').trim();
    var summary = getTenantBillingSummary(tenantName);

    if (!Number.isFinite(amount) || amount <= 0) {
      if (amountInput) amountInput.focus();
      showToast('金额必须大于 0', 'warning');
      return;
    }
    if (!reason) {
      if (reasonInput) reasonInput.focus();
      showToast('请输入原因', 'warning');
      return;
    }
    if (amount > summary.balanceAmount) {
      showToast('金额不能超过当前资金余额 ' + formatBalance(summary.balanceAmount), 'warning');
      return;
    }

    createBalanceAdjustment({ tenantName: tenantName, amount: amount, reason: reason });
    closeAdjustmentModal();
    refreshAfterBalanceAdjustment(tenantName, '手工扣减已生效');
  }

  /* ===== 新建 / 编辑租户功能 ===== */
  var currentEditingTenantId = null;

  function openCreateTenantModal() {
    if (!requireTenantBillingPermission()) return;
    currentEditingTenantId = null;
    showTenantFormModal({
      title: '新建租户',
      name: '',
      type: '总部',
      commercialFlag: 'trial',
      desc: '',
      status: '启用'
    });
  }

  function openEditTenantModal(tenantId) {
    var row = getTenantRows().find(function (r) { return String(r.tenantId) === String(tenantId); });
    if (!row) {
      showToast('未找到该租户数据', 'error');
      return;
    }
    currentEditingTenantId = String(tenantId);
    var profile = getTenantIterationProfile(row, true);
    showTenantFormModal({
      title: '编辑租户',
      name: row.name,
      type: row.type || '总部',
      commercialFlag: profile.commercialFlag || 'trial',
      desc: row.desc === '-' ? '' : (row.desc || ''),
      status: row.status || '启用'
    });
  }

  function escapeHtmlAttr(str) {
    return String(str == null ? '' : str).replace(/"/g, '&quot;');
  }

  function escapeHtmlText(str) {
    return String(str == null ? '' : str).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function showTenantFormModal(data) {
    var editingId = currentEditingTenantId;
    closeTenantFormModal();
    currentEditingTenantId = editingId;
    var nameLength = (data.name || '').length;
    var descLength = (data.desc || '').length;
    var isHq = data.type === '总部';
    var isStore = data.type === '门店';
    var isCommercial = data.commercialFlag === 'commercial';
    var isTrial = !isCommercial;
    var isEnabled = data.status === '启用';
    var isDisabled = data.status === '禁用';

    var html = '' +
      '<div class="modal-overlay" id="tenantFormModalBackdrop" style="position:fixed;inset:0;z-index:5500;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);" onclick="window.Pages[\'sys-tenant\'].closeTenantFormModal(event)">' +
        '<div class="tenant-form-modal" id="tenantFormModal" data-anno="tenant-edit-form" data-anno-page="sys-tenant" data-anno-label="租户信息表单" data-anno-kind="region" data-anno-fields="FLD-001,FLD-002,FLD-003" onclick="event.stopPropagation()">' +
          '<div class="tenant-form-modal-header">' +
            '<span class="tenant-form-modal-title" id="tenantFormModalTitle">' + data.title + '</span>' +
            '<button class="tenant-form-modal-close" onclick="window.Pages[\'sys-tenant\'].closeTenantFormModal()">✕</button>' +
          '</div>' +
          '<div class="tenant-form-modal-body">' +
            '<div class="tenant-form-row">' +
              '<label class="tenant-form-label"><span class="tenant-required">*</span> 租户名称：</label>' +
              '<div class="tenant-form-control">' +
                '<div class="tenant-input-with-count">' +
                  '<input type="text" id="tenantFormNameInput" placeholder="请输入租户名称" maxlength="50" value="' + escapeHtmlAttr(data.name) + '" oninput="window.Pages[\'sys-tenant\'].onNameInput(this)">' +
                  '<span class="tenant-char-count" id="tenantNameCount">' + nameLength + ' / 50</span>' +
                '</div>' +
                '<div class="tenant-form-error" id="tenantNameError" style="display:none;"></div>' +
              '</div>' +
            '</div>' +
            '<div class="tenant-form-row">' +
              '<label class="tenant-form-label">租户类型：</label>' +
              '<div class="tenant-form-control">' +
                '<div class="tenant-radio-group">' +
                  '<label class="tenant-radio-label"><input type="radio" name="tenantFormType" value="总部"' + (isHq ? ' checked' : '') + '> 总部</label>' +
                  '<label class="tenant-radio-label"><input type="radio" name="tenantFormType" value="门店"' + (isStore ? ' checked' : '') + '> 门店</label>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="tenant-form-row" data-anno="tenant-commercial-flag-field" data-anno-page="sys-tenant" data-anno-label="商用或试用标记选择" data-anno-kind="region" data-anno-fields="FLD-003">' +
              '<label class="tenant-form-label"><span class="tenant-required">*</span> 商用/试用：</label>' +
              '<div class="tenant-form-control">' +
                '<div class="tenant-radio-group">' +
                  '<label class="tenant-radio-label"><input type="radio" name="tenantCommercialFlag" value="commercial"' + (isCommercial ? ' checked' : '') + '> 商用</label>' +
                  '<label class="tenant-radio-label"><input type="radio" name="tenantCommercialFlag" value="trial"' + (isTrial ? ' checked' : '') + '> 试用</label>' +
                '</div>' +
                '<div class="tenant-form-hint">该标记仅用于展示，不改变有效期、分钟余额、冻结或消耗规则。</div>' +
              '</div>' +
            '</div>' +
            '<div class="tenant-form-row">' +
              '<label class="tenant-form-label">描述：</label>' +
              '<div class="tenant-form-control">' +
                '<div class="tenant-textarea-with-count">' +
                  '<textarea id="tenantFormDescInput" placeholder="" maxlength="50" oninput="window.Pages[\'sys-tenant\'].onDescInput(this)">' + escapeHtmlText(data.desc) + '</textarea>' +
                  '<span class="tenant-char-count" id="tenantDescCount">' + descLength + ' / 50</span>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="tenant-form-row">' +
              '<label class="tenant-form-label">状态：</label>' +
              '<div class="tenant-form-control">' +
                '<div class="tenant-radio-group">' +
                  '<label class="tenant-radio-label"><input type="radio" name="tenantFormStatus" value="禁用"' + (isDisabled ? ' checked' : '') + '> 禁用</label>' +
                  '<label class="tenant-radio-label"><input type="radio" name="tenantFormStatus" value="启用"' + (isEnabled ? ' checked' : '') + '> 启用</label>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="tenant-form-modal-footer">' +
            '<button class="btn btn-default" onclick="window.Pages[\'sys-tenant\'].closeTenantFormModal()" style="height:32px;padding:0 16px;">取消</button>' +
            '<button class="btn btn-primary" onclick="window.Pages[\'sys-tenant\'].submitTenantFormModal()" style="height:32px;padding:0 16px;">确定</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.insertAdjacentHTML('beforeend', html);
    setTimeout(function() {
      var input = document.getElementById('tenantFormNameInput');
      if (input) input.focus();
    }, 50);
  }

  function closeTenantFormModal(e) {
    if (e && e.target !== e.currentTarget) return;
    var bd = document.getElementById('tenantFormModalBackdrop');
    if (bd) bd.remove();
    currentEditingTenantId = null;
  }

  function onNameInput(input) {
    var countEl = document.getElementById('tenantNameCount');
    var errEl = document.getElementById('tenantNameError');
    if (countEl) countEl.textContent = (input.value || '').length + ' / 50';
    if (errEl && input.value.trim()) errEl.style.display = 'none';
  }

  function onDescInput(textarea) {
    var countEl = document.getElementById('tenantDescCount');
    if (countEl) countEl.textContent = (textarea.value || '').length + ' / 50';
  }

  function formatCurrentDateTime() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var date = String(d.getDate()).padStart(2, '0');
    var h = String(d.getHours()).padStart(2, '0');
    var min = String(d.getMinutes()).padStart(2, '0');
    var s = String(d.getSeconds()).padStart(2, '0');
    return y + '-' + m + '-' + date + ' ' + h + ':' + min + ':' + s;
  }

  function refreshTenantTable() {
    var tbody = document.querySelector('.tenant-native-table tbody');
    if (tbody) tbody.innerHTML = renderRows();
    var pagination = document.querySelector('.tenant-pagination');
    if (pagination) pagination.innerHTML = '第 1-' + getTenantRows().length + ' 条/总共 ' + getTenantRows().length + ' 条&nbsp;&nbsp; &lt; <span>1</span> &gt;';
  }

  function submitTenantFormModal() {
    if (!currentEditingTenantId && !requireTenantBillingPermission()) return;
    var nameInput = document.getElementById('tenantFormNameInput');
    var errEl = document.getElementById('tenantNameError');
    var descInput = document.getElementById('tenantFormDescInput');
    var typeRadio = document.querySelector('input[name="tenantFormType"]:checked');
    var commercialFlagRadio = document.querySelector('input[name="tenantCommercialFlag"]:checked');
    var statusRadio = document.querySelector('input[name="tenantFormStatus"]:checked');

    var name = nameInput ? nameInput.value.trim() : '';
    var type = typeRadio ? typeRadio.value : '总部';
    var commercialFlag = commercialFlagRadio ? commercialFlagRadio.value : 'trial';
    var desc = descInput ? descInput.value.trim() : '';
    var status = statusRadio ? statusRadio.value : '启用';

    if (!name) {
      if (errEl) {
        errEl.textContent = '请输入租户名称';
        errEl.style.display = 'block';
      }
      if (nameInput) nameInput.focus();
      return;
    }

    // 唯一性校验
    var isDuplicate = getTenantRows().some(function(r) {
      if (currentEditingTenantId && String(r.tenantId) === currentEditingTenantId) return false;
      return r.name === name;
    });
    if (isDuplicate) {
      if (errEl) {
        errEl.textContent = '租户名称已存在，请重新输入';
        errEl.style.display = 'block';
      }
      if (nameInput) nameInput.focus();
      return;
    }

    var nowStr = formatCurrentDateTime();

    if (currentEditingTenantId) {
      // 编辑
      var row = getTenantRows().find(function (r) { return String(r.tenantId) === currentEditingTenantId; });
      if (row) {
        var oldName = row.name;
        var iterationProfile = getTenantIterationProfile(row, true);
        row.name = name;
        row.type = type;
        row.desc = desc || '-';
        row.status = status;
        row.updater = 'xtadmin';
        row.updateTime = nowStr;
        iterationProfile.name = name;
        iterationProfile.type = type;
        iterationProfile.commercialFlag = commercialFlag;
        iterationProfile.commercialFlagLabel = commercialFlag === 'commercial' ? '商用' : '试用';

        if (oldName !== name) {
          getPriceRules().forEach(function(p) {
            if (p.tenantName === oldName) p.tenantName = name;
          });
          getHistoryRows().forEach(function(h) {
            if (h.tenantName === oldName) h.tenantName = name;
          });
        }
      }
      closeTenantFormModal();
      refreshTenantTable();
      showToast('租户信息已更新', 'success');
    } else {
      // 新建
      var maxNo = getTenantRows().reduce(function(max, r) { return Math.max(max, Number(r.no) || 0); }, 0);
      var newTenantId = '20' + Date.now().toString().slice(-8) + Math.floor(1000 + Math.random() * 9000);
      var newRow = {
        no: maxNo + 1,
        name: name,
        consumedAmount: 0,
        type: type,
        tenantId: newTenantId,
        desc: desc || '-',
        status: status,
        updater: window.getDemoAuth().displayName,
        updateTime: nowStr
      };
      getTenantRows().unshift(newRow);
      var newProfile = getTenantIterationProfile(newRow, true);
      newProfile.commercialFlag = commercialFlag;
      newProfile.commercialFlagLabel = commercialFlag === 'commercial' ? '商用' : '试用';

      // 默认价格规则
      var rules = getPriceRules();
      if (!rules.some(function(r) { return r.tenantName === name && r.modelType === '大模型'; })) {
        rules.push({ tenantName: name, modelType: '大模型', providerCode: null, pricingScope: 'MODEL_DEFAULT', unitPrice: 0.40, status: '启用' });
      }
      if (!rules.some(function(r) { return r.tenantName === name && r.modelType === '小模型'; })) {
        rules.push({ tenantName: name, modelType: '小模型', providerCode: null, pricingScope: 'MODEL_DEFAULT', unitPrice: 0.26, status: '启用' });
      }

      closeTenantFormModal();
      refreshTenantTable();
      showToast('新建租户成功', 'success');
    }
  }

  function deleteTenant(tenantId) {
    var row = getTenantRows().find(function (r) { return String(r.tenantId) === String(tenantId); });
    if (!row) {
      showToast('未找到该租户', 'error');
      return;
    }
    if (row.name === '超级管理组') {
      showToast('系统默认组别不可删除', 'warning');
      return;
    }
    if (confirm('确认删除租户【' + row.name + '】？此操作不可恢复。')) {
      window.MockTenantRows = getTenantRows().filter(function(r) { return String(r.tenantId) !== String(tenantId); });
      refreshTenantTable();
      showToast('租户已删除', 'success');
    }
  }

  window.Pages = window.Pages || {};
  window.Pages['sys-tenant'] = {
    onAuthChanged: onAuthChanged,
    render: render,
    init: init,
    showBillingDrawer: showBillingDrawer,
    retryRechargeOverview: retryRechargeOverview,
    openRechargeForm: openRechargeForm,
    closeRechargeForm: closeRechargeForm,
    updateRechargePreview: updateRechargePreview,
    submitRechargeForm: submitRechargeForm,
    simulateRechargeWriteFailure: simulateRechargeWriteFailure,
    retryRechargeWrite: retryRechargeWrite,
    openIterationAdjustmentForm: openIterationAdjustmentForm,
    closeIterationAdjustmentForm: closeIterationAdjustmentForm,
    updateIterationAdjustmentPreview: updateIterationAdjustmentPreview,
    submitIterationAdjustment: submitIterationAdjustment,
    simulateAdjustmentConflict: simulateAdjustmentConflict,
    closeBillingDrawer: closeBillingDrawer,
    switchBillingTab: switchBillingTab,
    exportTenantBilling: exportTenantBilling,
    switchRechargeAssociationType: switchRechargeAssociationType,
    previewRechargeOrder: previewRechargeOrder,
    readRechargeOrder: readRechargeOrder,
    confirmRechargeOrder: confirmRechargeOrder,
    confirmTrialOrder: confirmTrialOrder,
    showAdjustmentModal: showAdjustmentModal,
    closeAdjustmentModal: closeAdjustmentModal,
    submitAdjustmentFromModal: submitAdjustmentFromModal,
    activateRecharge: activateRecharge,
    closeActivationDurationModal: closeActivationDurationModal,
    updateActivationDurationPreview: updateActivationDurationPreview,
    confirmActivationDuration: confirmActivationDuration,
    toggleFrozenTooltip: toggleFrozenTooltip,
    toggleCallControl: toggleCallControl,
    getImportCapacity: getImportCapacity,
    createImportFreeze: createImportFreeze,
    calculateBilledMinutes: calculateBilledMinutes,
    canStartUnifiedTask: canStartUnifiedTask,
    startUnifiedTask: startUnifiedTask,
    settleUnifiedTask: settleUnifiedTask,
    releaseUnifiedTask: releaseUnifiedTask,
    syncUnifiedFrozenTaskReleases: syncUnifiedFrozenTaskReleases,
    syncFrozenTaskReleases: syncFrozenTaskReleases,
    releaseFrozenTasksByScene: releaseFrozenTasksByScene,
    showPricingConfigModal: showPricingConfigModal,
    closePricingConfigModal: closePricingConfigModal,
    savePricingConfig: savePricingConfig,
    openCreateTenantModal: openCreateTenantModal,
    openEditTenantModal: openEditTenantModal,
    closeTenantFormModal: closeTenantFormModal,
    submitTenantFormModal: submitTenantFormModal,
    onNameInput: onNameInput,
    onDescInput: onDescInput,
    deleteTenant: deleteTenant
  };

  document.addEventListener('click', function () {
    document.querySelectorAll('.tenant-th-help.open').forEach(function (item) { item.classList.remove('open'); });
  });
})();
