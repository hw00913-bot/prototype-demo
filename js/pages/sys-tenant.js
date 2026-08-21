/**
 * js/pages/sys-tenant.js — 租户管理页
 * 100% 对齐参考项目（releases_demo/充值方案_demo_v1.0）：
 * - 租户列表完整列（序号、租户名称、有效期、计费配置、大/小模型可用分钟数、呼叫控制状态、租户类型、租户id、描述、状态、更新人、更新时间、操作）
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
    return getFrozenTasks().reduce(function (released, task) {
      var reason = getFrozenReleaseReason(task);
      return releaseFrozenTask(task, reason, releasedAt) ? released + 1 : released;
    }, 0);
  }

  function releaseFrozenTasksByScene(sceneName, taskStatus) {
    var releasedAt = formatLocalDateTime(new Date());
    var releasedCount = 0;
    var releasedAmount = 0;

    getFrozenTasks().forEach(function (task) {
      if (task.sceneName !== sceneName || task.status !== '冻结中') return;
      task.taskStatus = taskStatus;
      var reason = getFrozenReleaseReason(task);
      if (!releaseFrozenTask(task, reason, releasedAt)) return;
      releasedCount += 1;
      releasedAmount += Number(task.frozenMinutes || 0) * Number(task.unitPriceSnapshot || 0);
    });

    return { releasedCount: releasedCount, releasedAmount: releasedAmount };
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
      var summary = getTenantBillingSummary(row.name);
      return '' +
        '<tr>' +
          '<td>' + row.no + '</td>' +
          '<td>' + row.name + '</td>' +
          '<td>' + summary.validity + '</td>' +
          '<td>' +
            '<button class="tenant-billing-config-btn" onclick="window.Pages[\'sys-tenant\'].showPricingConfigModal(\'' + row.name + '\')">计费配置</button>' +
          '</td>' +
          '<td class="tenant-minute-range">' + summary.largeAvailableRange + '</td>' +
          '<td class="tenant-minute-range">' + summary.smallAvailableRange + '</td>' +
          '<td><span class="tenant-call-status ' + summary.callStatusCls + '">' + summary.callStatus + '</span></td>' +
          '<td>' + row.type + '</td>' +
          '<td>' + row.tenantId + '</td>' +
          '<td>' + row.desc + '</td>' +
          '<td>' + row.status + '</td>' +
          '<td>' + row.updater + '</td>' +
          '<td>' + row.updateTime + '</td>' +
          '<td>' +
            '<button class="tenant-op-btn primary" onclick="window.Pages[\'sys-tenant\'].showBillingDrawer(\'' + row.name + '\')">充值管理</button>' +
            '<button class="tenant-op-btn control ' + (summary.callManageEnabled ? '' : 'disabled') + '" ' + (summary.callManageEnabled ? '' : 'disabled') + ' onclick="window.Pages[\'sys-tenant\'].toggleCallControl(\'' + row.name + '\')">' + (summary.callManageEnabled ? summary.callManageText : '管理呼叫') + '</button>' +
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
        '<div class="filter-bar" data-anno="sys-tenant-filters" data-anno-page="sys-tenant" data-anno-label="租户筛选" data-anno-kind="region" data-anno-fields="FLD-050" style="margin-bottom:16px;">' +
          '<div class="filter-item"><label>租户名称：</label><input type="text" class="filter-input" placeholder="请输入" style="width:210px;"></div>' +
          '<div class="btn-group"><button class="btn btn-default" onclick="resetFilter(this.closest(\'.tenant-page\'))">重置</button><button class="btn btn-primary" onclick="doQuery()">查询</button></div>' +
        '</div>' +
        '<div class="tenant-list-card">' +
          '<div class="tenant-list-tools">' +
            '<button class="btn btn-default" onclick="window.Pages[\'sys-tenant\'].exportTenantBilling()" style="height:34px;padding:0 16px;">导出</button>' +
            '<button class="btn btn-primary" data-anno="sys-tenant-create" data-anno-page="sys-tenant" data-anno-label="新建租户" data-anno-kind="action" data-anno-fields="FLD-050,FLD-051,FLD-052,FLD-053,FLD-054,FLD-055" onclick="window.Pages[\'sys-tenant\'].openCreateTenantModal()" style="height:34px;padding:0 16px;">+ 新建</button>' +
            '<span class="biz-icon-btn" onclick="doRefresh()" title="刷新">&#x21bb;</span>' +
            '<span class="biz-icon-btn" onclick="showToast(\'设置功能开发中\',\'info\')" title="设置">&#x2699;</span>' +
          '</div>' +
          '<div class="table-container">' +
            '<table class="data-table tenant-native-table" data-anno="sys-tenant-table" data-anno-page="sys-tenant" data-anno-label="租户列表" data-anno-kind="table" data-anno-fields="FLD-050,FLD-051,FLD-052,FLD-053,FLD-054,FLD-055">' +
              '<thead><tr>' +
                '<th>序号</th><th>租户名称</th><th>有效期</th><th>计费配置</th><th>大模型可用分钟数</th><th>小模型可用分钟数</th><th>呼叫控制状态</th><th>租户类型</th><th>租户 id</th><th>描述</th><th>状态</th><th>更新人</th><th>更新时间</th><th>操作</th>' +
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
        '<div class="tenant-pricing-modal" id="tenantPricingConfigModal" data-anno="sys-tenant-pricing" data-anno-page="sys-tenant" data-anno-label="租户计费配置" data-anno-kind="region" data-anno-fields="FLD-050,FLD-055" data-tenant-name="' + tenantName + '" onclick="event.stopPropagation()">' +
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

  function showBillingDrawer(tenantName) {
    var existed = findBillingByTenant(tenantName);
    var row = existed || buildBillingSeed(tenantName);
    var tenantLocked = tenantName || row.tenantName;
    var summary = getTenantBillingSummary(tenantLocked);
    var html = '' +
      '<div class="biz-drawer-backdrop" id="tenantBillingBackdrop" onclick="window.Pages[\'sys-tenant\'].closeBillingDrawer(event)">' +
        '<div class="biz-drawer tenant-drawer" id="tenantBillingDrawer" data-anno="sys-tenant-billing" data-anno-page="sys-tenant" data-anno-label="租户充值与余额管理" data-anno-kind="region" data-anno-fields="FLD-050,FLD-055" onclick="event.stopPropagation()" data-row-id="' + row.id + '" data-new="' + (existed ? '0' : '1') + '">' +
          '<div class="biz-drawer-header">' +
            '<span class="biz-drawer-title">充值管理</span>' +
            '<span class="biz-drawer-close" onclick="window.Pages[\'sys-tenant\'].closeBillingDrawer()">&#x2715;</span>' +
          '</div>' +
          '<div class="biz-drawer-body">' +
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
    currentEditingTenantId = null;
    showTenantFormModal({
      title: '新建租户',
      name: '',
      type: '总部',
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
    showTenantFormModal({
      title: '编辑租户',
      name: row.name,
      type: row.type || '总部',
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
    closeTenantFormModal();
    var nameLength = (data.name || '').length;
    var descLength = (data.desc || '').length;
    var isHq = data.type === '总部';
    var isStore = data.type === '门店';
    var isEnabled = data.status === '启用';
    var isDisabled = data.status === '禁用';

    var html = '' +
      '<div class="modal-overlay" id="tenantFormModalBackdrop" style="position:fixed;inset:0;z-index:5500;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);" onclick="window.Pages[\'sys-tenant\'].closeTenantFormModal(event)">' +
        '<div class="tenant-form-modal" id="tenantFormModal" data-anno="sys-tenant-form" data-anno-page="sys-tenant" data-anno-label="租户信息表单" data-anno-kind="region" data-anno-fields="FLD-050,FLD-051,FLD-052,FLD-053,FLD-054,FLD-055" onclick="event.stopPropagation()">' +
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
    var nameInput = document.getElementById('tenantFormNameInput');
    var errEl = document.getElementById('tenantNameError');
    var descInput = document.getElementById('tenantFormDescInput');
    var typeRadio = document.querySelector('input[name="tenantFormType"]:checked');
    var statusRadio = document.querySelector('input[name="tenantFormStatus"]:checked');

    var name = nameInput ? nameInput.value.trim() : '';
    var type = typeRadio ? typeRadio.value : '总部';
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
        row.name = name;
        row.type = type;
        row.desc = desc || '-';
        row.status = status;
        row.updater = 'xtadmin';
        row.updateTime = nowStr;

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
        updater: 'xtadmin',
        updateTime: nowStr
      };
      getTenantRows().unshift(newRow);

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
    render: render,
    init: init,
    showBillingDrawer: showBillingDrawer,
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
