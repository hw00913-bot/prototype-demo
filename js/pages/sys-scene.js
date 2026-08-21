/**
 * js/pages/sys-scene.js — 业务场景管理页
 * 以中科金接入 demo 为底座，合并一知/电声/大众/冰兰/厚朴平台差异。
 * 创建抽屉对齐 releases_demo 各平台参考源的供应商创建界面：
 *  - 一知科技：场景id + 模型类型 + 一知账号 + 默认 7 传入字段
 *  - 中科金智能：任务id + 模型类型 + 中科金账号 + 默认姓名字段
 *  - 电声：匹配机器人 + 呼叫时段/排除日期 + N天M呼 + 黑名单 + 自动启动 + 模型类型/账号
 *  - 冰兰：数据导入方式(接口传入) + 呼叫通道/线路 + 呼叫策略(机器人/优先级/时段/重拨/拦截)
 *  - 厚朴：任务名称 + 数据列模式(单条/多条) + 平台字段预填
 *  - 大众通信：任务ID(uuid) + 模型类型 + 默认账号
 */
(function () {
  'use strict';

  var SceneRows = (window.MockSceneRows || []).map(function (row) { return Object.assign({}, row); });

  /* ===== 抽屉运行态 ===== */
  var currentEditingId = null;
  var platformInputRows = [];   /* 平台默认传入字段（随平台/通道切换重建） */
  var customInputFields = [];   /* 用户添加的传入字段 { name, code, required } */
  var customExtractFields = []; /* 用户添加的提取字段 */
  var dsWindowIndex = 1;        /* 电声呼叫时段行序号 */
  var dsExcludeIndex = 1;       /* 电声排除日期行序号 */

  /* ===== 列表渲染 ===== */
  function renderSceneRowsHtml() {
    return SceneRows.map(function (row) {
      var editDisabled = row.status === 'running' ? 'class="biz-action-disabled" onclick="return false;"' : 'class="biz-action-edit" onclick="event.preventDefault();window.Pages[\'sys-scene\'].showEditModal(' + row.id + ')"';
      return '<tr>' +
        '<td>' + row.id + '</td>' +
        '<td>' + row.name + '</td>' +
        '<td>' + row.sceneId + '</td>' +
        '<td>' + row.code + '</td>' +
        '<td>' + row.category + '</td>' +
        '<td>' + (row.platform || '一知科技') + '</td>' +
        '<td>' + row.tenant + '</td>' +
        '<td>' + row.updateTime + '</td>' +
        '<td><a href="#" ' + editDisabled + '>编辑</a><a href="#" class="biz-action-delete" onclick="event.preventDefault();window.Pages[\'sys-scene\'].showDeleteConfirm(' + row.id + ')">删除</a></td>' +
        '</tr>';
    }).join('');
  }

  function refreshSceneTable() {
    var tbody = document.getElementById('bizSceneTableBody');
    if (!tbody) return;
    tbody.innerHTML = renderSceneRowsHtml();
  }

  function isRunningScene(scene) {
    return !!(scene && (scene.status === 'running' || scene.status === '进行中'));
  }

  /* ===== 删除确认 ===== */
  function showDeleteConfirm(sceneId) {
    var row = SceneRows.find(function (item) { return item.id === sceneId; });
    if (!row) return;
    if (isRunningScene(row)) {
      showToast('有进行中的任务无法删除', 'warning');
      return;
    }
    if (document.getElementById('bizDeleteSceneBackdrop')) return;
    var html = '<div class="biz-dialog-backdrop" id="bizDeleteSceneBackdrop" onclick="window.Pages[\'sys-scene\'].closeDeleteConfirm(event)">' +
      '<div class="biz-dialog" onclick="event.stopPropagation()">' +
        '<div class="biz-dialog-header"><span class="biz-dialog-title">删除确认</span><span class="biz-dialog-close" onclick="window.Pages[\'sys-scene\'].closeDeleteConfirm()">&#x2715;</span></div>' +
        '<div class="biz-dialog-body"><div style="font-size:14px;color:#333;line-height:1.7;">确认删除「' + row.name + '」吗？删除后不可恢复。</div></div>' +
        '<div class="biz-dialog-footer"><button class="btn btn-default" onclick="window.Pages[\'sys-scene\'].closeDeleteConfirm()">取消</button><button class="btn btn-primary" onclick="window.Pages[\'sys-scene\'].confirmDeleteScene(' + sceneId + ')">确认</button></div>' +
      '</div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  }

  function closeDeleteConfirm(e) {
    if (e && e.target !== e.currentTarget) return;
    var bd = document.getElementById('bizDeleteSceneBackdrop');
    if (bd) bd.remove();
  }

  function confirmDeleteScene(sceneId) {
    SceneRows = SceneRows.filter(function (item) { return item.id !== sceneId; });
    closeDeleteConfirm();
    refreshSceneTable();
    showToast('删除成功', 'success');
  }

  function platformOptions() {
    return (window.MockPlatforms || []).map(function (p) {
      return '<option value="' + p.name + '">' + p.name + '</option>';
    }).join('');
  }

  function render() {
    var tableRows = renderSceneRowsHtml();
    return '<div class="scene-list-page">' +
      '<div class="scene-page-header" style="border-bottom:none;padding-bottom:8px;">' +
        '<div class="scene-page-title-row"><span class="scene-page-title">业务场景</span></div>' +
        '<div class="scene-page-subtitle" style="margin-top:6px;">创建使用智能外呼任务的业务场景，通过分配外呼平台的通话机器人和通话通道完成创建。</div>' +
      '</div>' +
      '<div class="filter-bar" style="margin:0 20px 16px;">' +
        '<div class="filter-item"><label>场景名称：</label><input type="text" class="filter-input" placeholder="请输入" style="width:180px;"></div>' +
        '<div class="filter-item"><label>场景分类：</label><select class="filter-select" style="width:160px;"><option value="">请选择</option><option value="新线索">新线索</option><option value="冷线索">冷线索</option></select></div>' +
        '<div class="filter-item"><label>所属平台：</label><select class="filter-select" style="width:160px;"><option value="">全部</option>' + platformOptions() + '</select></div>' +
        '<div class="btn-group"><button class="btn btn-default" onclick="resetFilter(this.closest(\'.scene-list-page\'))">重置</button><button class="btn btn-primary" onclick="doQuery()">查询</button></div>' +
      '</div>' +
      '<div style="padding:0 20px;margin-bottom:12px;display:flex;justify-content:flex-end;gap:8px;align-items:center;">' +
        '<button class="btn btn-primary" data-anno="sys-scene-add-btn" data-anno-page="sys-scene" data-anno-label="新建业务场景" data-anno-kind="action" onclick="window.Pages[\'sys-scene\'].showAddModal()" style="height:34px;padding:0 16px;">+ 新建业务场景</button>' +
      '</div>' +
      '<div style="padding:0 20px 24px;"><div class="biz-scene-card" style="padding:0;overflow:hidden;">' +
        '<div class="table-container"><table class="data-table" data-anno="sys-scene-table" data-anno-page="sys-scene" data-anno-label="业务场景列表" data-anno-kind="table" data-anno-fields="FLD-006">' +
          '<thead><tr><th>序号</th><th>场景名称</th><th>场景ID</th><th>场景编码</th><th>场景分类</th><th>所属平台</th><th>可用租户</th><th>更新时间</th><th>操作</th></tr></thead>' +
          '<tbody id="bizSceneTableBody">' + tableRows + '</tbody>' +
        '</table></div>' +
      '</div></div>' +
    '</div>';
  }

  /* ===== 抽屉表单辅助 ===== */
  function getCurrentPlatform() {
    var el = document.querySelector('#bizAddSceneDrawer input[name="platform"]:checked');
    return el ? el.value : '';
  }

  function getBinglanChannel() {
    var el = document.getElementById('binglanCallChannel');
    return el ? el.value : '';
  }

  function tenantCheckboxesHtml(selected) {
    return (window.MockTenantOptions || []).map(function (t) {
      var checked = selected && selected.indexOf(t) >= 0 ? ' checked' : '';
      return '<label class="biz-checkbox"><input type="checkbox" value="' + t + '"' + checked + '><span>' + t + '</span></label>';
    }).join('');
  }

  function platformRadiosHtml(checkedPlatform) {
    return (window.MockPlatforms || []).map(function (p) {
      var checked = checkedPlatform === p.name ? ' checked' : '';
      return '<label class="biz-radio"><input type="radio" name="platform" value="' + p.name + '"' + checked + ' onchange="window.Pages[\'sys-scene\'].onPlatformChange()"><span>' + p.name + '</span></label>';
    }).join('');
  }

  function sceneTypeRadiosHtml(checkedType) {
    return (window.MockSceneTypeOptions || ['首访', '服务', '回访', '新线索', '冷线索']).map(function (t) {
      var checked = checkedType === t ? ' checked' : '';
      return '<label class="biz-radio"><input type="radio" name="sceneType" value="' + t + '"' + checked + ' onchange="window.Pages[\'sys-scene\'].onSceneTypeChange()"><span>' + t + '</span></label>';
    }).join('');
  }

  /* ===== 业务信息（场景传入/提取信息）表格 ===== */
  function resetInputFieldsForPlatform(platform) {
    platformInputRows = [];
    if (platform === '一知科技') {
      platformInputRows = (window.MockDefaultInputFields || []).map(function (f) {
        return { fieldName: f.fieldName, paramName: f.paramName, required: !!f.required, canDelete: false };
      });
    } else if (platform === '中科金智能') {
      platformInputRows = [{ fieldName: '姓名', paramName: 'name', required: true, canDelete: false }];
    } else if (platform === '冰兰' && getBinglanChannel() === 'binglan_channel') {
      platformInputRows = (window.MockBinglanInputDefaults || []).map(function (f) {
        return { fieldName: f.fieldName, paramName: f.paramName, required: !!f.required, canDelete: true, editable: true };
      });
    } else if (platform === '厚朴') {
      var fields = window.MockHoupuSceneFields || [];
      var colTypeEl = document.querySelector('input[name="houpuColumnType"]:checked');
      var colType = colTypeEl ? colTypeEl.value : 'multiple';
      if (colType === 'single') fields = fields.filter(function (f) { return f.field === 'calleeNo'; });
      platformInputRows = fields.map(function (f) {
        return { fieldName: f.label + (f.status === 'partial' ? '（待确认）' : ''), paramName: f.field, required: !!f.required, canDelete: false, actionText: '平台字段' };
      });
    }
  }

  function renderInputFieldRows() {
    var platform = getCurrentPlatform();
    var useBinglanHead = platform === '冰兰' && getBinglanChannel() === 'binglan_channel';
    var html = '';
    var idx = 0;
    platformInputRows.forEach(function (row, i) {
      idx += 1;
      var numTd = useBinglanHead ? '' : '<td>' + idx + '</td>';
      var action = '';
      if (row.editable) {
        action = '<a href="#" class="biz-action-edit" onclick="event.preventDefault();window.Pages[\'sys-scene\'].showInputFieldEditModal(' + i + ')">编辑</a>' +
          '<a href="#" class="biz-action-delete" onclick="event.preventDefault();window.Pages[\'sys-scene\'].removePlatformInputRow(' + i + ')">删除</a>';
      } else if (row.actionText) {
        action = '<span class="biz-action-disabled">' + row.actionText + '</span>';
      } else {
        action = '<span class="biz-action-disabled">删除</span>';
      }
      html += '<tr>' + numTd + '<td>' + row.fieldName + '</td><td>' + row.paramName + '</td><td>' + (row.required ? '<span class="biz-required-tag">* 是</span>' : '否') + '</td><td>' + action + '</td></tr>';
    });
    customInputFields.forEach(function (f, i) {
      idx += 1;
      var numTd = useBinglanHead ? '' : '<td>' + idx + '</td>';
      html += '<tr>' + numTd + '<td>' + f.name + '</td><td>' + f.code + '</td><td>' + (f.required ? '<span class="biz-required-tag">* 是</span>' : '否') + '</td><td><a href="#" class="biz-action-delete" onclick="event.preventDefault();window.Pages[\'sys-scene\'].removeCustomField(\'input\',' + i + ')">删除</a></td></tr>';
    });
    if (!html) {
      html = '<tr><td colspan="' + (useBinglanHead ? 4 : 5) + '"><div class="biz-empty-mini"><div class="biz-empty-icon">&#128230;</div><div class="biz-empty-text">暂无数据</div></div></td></tr>';
    }
    return html;
  }

  function renderExtractFieldRows() {
    if (!customExtractFields.length) {
      return '<tr><td colspan="5"><div class="biz-empty-mini"><div class="biz-empty-icon">&#128230;</div><div class="biz-empty-text">暂无数据</div></div></td></tr>';
    }
    return customExtractFields.map(function (f, i) {
      return '<tr><td>' + (i + 1) + '</td><td>' + f.name + '</td><td>' + f.code + '</td><td>' + (f.required ? '<span class="biz-required-tag">* 是</span>' : '否') + '</td><td><a href="#" class="biz-action-delete" onclick="event.preventDefault();window.Pages[\'sys-scene\'].removeCustomField(\'extract\',' + i + ')">删除</a></td></tr>';
    }).join('');
  }

  function refreshInputTable() {
    var table = document.getElementById('bizInputTable');
    if (!table) return;
    var platform = getCurrentPlatform();
    var useBinglanHead = platform === '冰兰' && getBinglanChannel() === 'binglan_channel';
    var thead = table.querySelector('thead tr');
    if (thead) thead.innerHTML = useBinglanHead
      ? '<th>字段名称</th><th>参数名</th><th>是否必填</th><th>操作</th>'
      : '<th>序号</th><th>字段名称</th><th>参数名</th><th>是否必填</th><th>操作</th>';
    var tbody = table.querySelector('tbody');
    if (tbody) tbody.innerHTML = renderInputFieldRows();
  }

  function refreshExtractTable() {
    var tbody = document.getElementById('bizExtractFieldTbody');
    if (tbody) tbody.innerHTML = renderExtractFieldRows();
  }

  /* ===== 冰兰：时段行 ===== */
  var TimeSlotChineseNums = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

  function getTimeSlotLabel(order) {
    if (order >= 1 && order <= TimeSlotChineseNums.length) return '时段' + TimeSlotChineseNums[order - 1] + '：';
    return '时段' + order + '：';
  }

  function renderTimeSlotRow(order) {
    return '<div class="biz-time-slot-row">' +
      '<span class="biz-slot-label">' + getTimeSlotLabel(order) + '</span>' +
      '<div class="biz-time-range">' +
        '<input type="time" class="biz-time-input">' +
        '<span class="sep">→</span>' +
        '<input type="time" class="biz-time-input">' +
        '<span class="biz-time-icon">&#9716;</span>' +
      '</div>' +
      '<span class="biz-time-action" title="保存" onclick="showToast(\'时段已保存\',\'success\')">&#10003;</span>' +
      '<span class="biz-time-action" title="删除" onclick="window.Pages[\'sys-scene\'].removeTimeSlot(this)">&#128465;</span>' +
    '</div>';
  }

  function renumberTimeSlots() {
    var rows = document.querySelectorAll('#binglanTimeSlots .biz-time-slot-row');
    Array.prototype.forEach.call(rows, function (row, index) {
      var label = row.querySelector('.biz-slot-label');
      if (label) label.textContent = getTimeSlotLabel(index + 1);
    });
  }

  function ensureTimeSlotsInit() {
    var container = document.getElementById('binglanTimeSlots');
    if (!container) return;
    if (container.querySelector('.biz-time-slot-row')) return;
    container.insertAdjacentHTML('beforeend', renderTimeSlotRow(1));
  }

  function addTimeSlot() {
    var container = document.getElementById('binglanTimeSlots');
    if (!container) return;
    var nextOrder = container.querySelectorAll('.biz-time-slot-row').length + 1;
    container.insertAdjacentHTML('beforeend', renderTimeSlotRow(nextOrder));
    renumberTimeSlots();
  }

  function removeTimeSlot(triggerEl) {
    var container = document.getElementById('binglanTimeSlots');
    var row = triggerEl && triggerEl.closest ? triggerEl.closest('.biz-time-slot-row') : null;
    if (!container || !row) return;
    if (container.querySelectorAll('.biz-time-slot-row').length <= 1) {
      showToast('至少保留一个时段', 'warning');
      return;
    }
    row.remove();
    renumberTimeSlots();
  }

  /* ===== 电声：机器人映射 ===== */
  function getDianshengLeadTypeCode(sceneTypeName) {
    var map = { '新线索': 'NEW_LEAD', '冷线索': 'COLD_LEAD' };
    return map[sceneTypeName] || '';
  }

  function getDianshengSceneRobot(sceneTypeName) {
    var mappings = window.MockDianshengRobotMappings || {};
    return mappings[getDianshengLeadTypeCode(sceneTypeName)] || null;
  }

  function onDianshengSceneTypeChange() {
    var sceneType = document.querySelector('#bizAddSceneDrawer input[name="sceneType"]:checked');
    var mapping = sceneType ? getDianshengSceneRobot(sceneType.value) : null;
    var nameEl = document.getElementById('dsMatchedRobotName');
    var codeEl = document.getElementById('dsMatchedRobotCode');
    var bindEl = document.getElementById('dsMatchedRobot');
    if (!nameEl || !codeEl || !bindEl) return;
    nameEl.textContent = mapping ? mapping.robotName : '暂未配置匹配机器人';
    codeEl.textContent = mapping ? mapping.robotCode : '请联系管理员补充场景与机器人映射';
    bindEl.classList.toggle('is-missing', !mapping);
  }

  /* ===== 电声：呼叫时段 ===== */
  function renderDianshengCallWindowRow(index) {
    var removeAction = index === 0
      ? '<span class="biz-action-disabled">删除</span>'
      : '<a href="#" class="biz-action-delete" onclick="event.preventDefault();window.Pages[\'sys-scene\'].removeDianshengCallWindow(this)">删除</a>';
    var weekdayHtml = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(function (day) {
      return '<label><input type="checkbox" class="ds-window-weekday" value="' + day + '"><span>' + day + '</span></label>';
    }).join('');
    return '<div class="ds-call-window-row">' +
      '<div class="ds-call-window-head"><span>时段' + (index + 1) + '</span>' + removeAction + '</div>' +
      '<div class="ds-week-list">' + weekdayHtml + '</div>' +
      '<div class="ds-time-editor">' +
        '<input type="time" class="ds-time-input ds-window-start">' +
        '<span class="ds-time-arrow">→</span>' +
        '<input type="time" class="ds-time-input ds-window-end">' +
      '</div>' +
    '</div>';
  }

  function addDianshengCallWindow() {
    var body = document.getElementById('dsCallWindowList');
    if (!body) return;
    body.insertAdjacentHTML('beforeend', renderDianshengCallWindowRow(dsWindowIndex++));
  }

  function removeDianshengCallWindow(el) {
    var row = el && el.closest ? el.closest('.ds-call-window-row') : null;
    if (row) row.remove();
  }

  function getDianshengCallWindows() {
    var rows = document.querySelectorAll('#dsCallWindowList .ds-call-window-row');
    return Array.prototype.map.call(rows, function (row) {
      var weekdays = Array.prototype.map.call(row.querySelectorAll('.ds-window-weekday:checked'), function (el) { return el.value; });
      var startEl = row.querySelector('.ds-window-start');
      var endEl = row.querySelector('.ds-window-end');
      return { weekdays: weekdays, beginTime: startEl ? startEl.value : '', endTime: endEl ? endEl.value : '' };
    }).filter(function (win) { return win.weekdays.length || win.beginTime || win.endTime; });
  }

  /* ===== 电声：排除日期 ===== */
  function renderDianshengExcludeDateRow(index) {
    return '<div class="ds-exclude-date-item">' +
      '<input type="date" class="biz-form-input ds-exclude-date-input" aria-label="排除日期' + (index + 1) + '">' +
      '<button type="button" class="ds-icon-action ds-exclude-date-remove" aria-label="删除排除日期" title="删除排除日期" onclick="window.Pages[\'sys-scene\'].removeDianshengExcludeDate(this)">×</button>' +
    '</div>';
  }

  function addDianshengExcludeDate() {
    var list = document.getElementById('dsExcludeDateList');
    if (list) list.insertAdjacentHTML('beforeend', renderDianshengExcludeDateRow(dsExcludeIndex++));
  }

  function removeDianshengExcludeDate(button) {
    var item = button && button.closest ? button.closest('.ds-exclude-date-item') : null;
    if (item) item.remove();
  }

  function getDianshengExcludeDates() {
    var dates = Array.prototype.map.call(document.querySelectorAll('#dsExcludeDateList .ds-exclude-date-input'), function (input) {
      return input.value;
    }).filter(Boolean);
    return dates.filter(function (date, index) { return dates.indexOf(date) === index; });
  }

  /* ===== 电声：N天M呼间隔分钟数多选 ===== */
  function renderDianshengIntervalControl() {
    var options = (window.MockDianshengIntervals || ['15', '30', '45', '60', '90', '120']).map(function (value) {
      return '<label class="ds-multi-select-option"><input type="checkbox" class="ds-redial-interval-option" value="' + value + '" onchange="window.Pages[\'sys-scene\'].updateDianshengIntervalSummary(this)"><span>' + value + ' 分钟</span></label>';
    }).join('');
    return '<div class="ds-multi-select" onclick="event.stopPropagation()">' +
      '<button type="button" class="biz-form-select ds-multi-select-trigger" onclick="window.Pages[\'sys-scene\'].toggleDianshengIntervalMenu(this)"><span class="ds-multi-select-value">请选择间隔分钟数</span><span class="ds-multi-select-arrow">▾</span></button>' +
      '<div class="ds-multi-select-menu">' + options + '</div>' +
    '</div>';
  }

  function toggleDianshengIntervalMenu(button) {
    var control = button && button.closest ? button.closest('.ds-multi-select') : null;
    if (control) control.classList.toggle('open');
  }

  function updateDianshengIntervalSummary(input) {
    var control = input && input.closest ? input.closest('.ds-multi-select') : null;
    if (!control) return;
    var values = Array.prototype.map.call(control.querySelectorAll('.ds-redial-interval-option:checked'), function (option) {
      return option.value;
    });
    var valueText = control.querySelector('.ds-multi-select-value');
    if (valueText) valueText.textContent = values.length ? values.join('、') + ' 分钟' : '请选择间隔分钟数';
  }

  function closeDianshengIntervalMenus(event) {
    if (event && event.target.closest && event.target.closest('.ds-multi-select')) return;
    Array.prototype.forEach.call(document.querySelectorAll('.ds-multi-select.open'), function (control) {
      control.classList.remove('open');
    });
  }

  function getDianshengRedialRules() {
    var row = document.querySelector('#dsRedialRulesBody .ds-redial-rule-row');
    if (!row) return { days: 1, maxAttempts: 1, intervalMinutes: [] };
    var days = row.querySelector('.ds-redial-days');
    var times = row.querySelector('.ds-redial-times');
    var intervals = row.querySelectorAll('.ds-redial-interval-option:checked');
    var intervalMinutes = Array.prototype.map.call(intervals, function (option) {
      return parseInt(option.value, 10);
    }).filter(function (value) { return value > 0; });
    return {
      days: Math.max(1, parseInt(days && days.value, 10) || 1),
      maxAttempts: Math.max(1, parseInt(times && times.value, 10) || 1),
      intervalMinutes: intervalMinutes
    };
  }

  /* ===== 电声：是否自动启动 ===== */
  function onDianshengAutoStartChange() {
    var enabledInput = document.getElementById('dsAutoStartEnabled');
    var valueText = document.getElementById('dsAutoStartValue');
    var timeWrap = document.getElementById('dsAutoStartTimeWrap');
    var enabled = !enabledInput || enabledInput.checked;
    if (valueText) valueText.textContent = enabled ? '是' : '否';
    if (timeWrap) timeWrap.classList.toggle('hidden', enabled);
  }

  function getDianshengAutoStart() {
    var enabledInput = document.getElementById('dsAutoStartEnabled');
    var timeInput = document.getElementById('dsAutoStartTime');
    var enabled = !enabledInput || enabledInput.checked;
    var autoStart = { enabled: enabled };
    if (!enabled && timeInput && timeInput.value) {
      var executeDateTime = timeInput.value.replace('T', ' ');
      autoStart.executeDateTime = executeDateTime.length === 16 ? executeDateTime + ':00' : executeDateTime;
    }
    return autoStart;
  }

  /* ===== 抽屉主体 ===== */
  function renderDrawerHtml(modalTitle, data) {
    data = data || {};
    var sceneName = data.name || '';
    var sceneCode = data.code || '';
    var description = data.desc || '';
    var platform = data.platform || '';
    var sceneType = data.category || '';
    var tenants = data.tenants || [];
    var yizhiSceneId = platform === '一知科技' ? (data.sceneId || '') : '';
    var zkjTaskId = platform === '中科金智能' ? (data.sceneId || '') : '';
    var dazhongTaskId = platform === '大众通信' ? (data.sceneId || '') : '';
    var houpuTaskName = data.taskName || 'HP-DEMO-新线索首访';

    var yizhiAccountOptions = (window.MockYizhiAccounts || []).map(function (acc) {
      return '<option value="' + acc.name + '">' + acc.name + ' (' + acc.id + ')</option>';
    }).join('');

    var dsAccountOptions = '<option value="">请选择账号</option>' + (window.MockDianshengAccounts || []).map(function (acc) {
      return '<option value="' + acc.name + '" data-model="' + acc.modelType + '">' + acc.name + '（' + acc.modelType + '）</option>';
    }).join('');

    var blacklistOptions = '<option value="">请选择黑名单分组</option>' + (window.MockSceneBlacklistGroups || []).map(function (g, i) {
      var val = i === 0 ? 'nissan_default' : 'nissan_test_drive_unsubscribe';
      return '<option value="' + val + '">' + g + '</option>';
    }).join('');

    var binglanLineOptions = '<option value="">请选择线路</option>' + (window.MockBinglanLines || []).map(function (l) {
      return '<option value="' + l.id + '">' + l.name + '（线路 id' + l.id + '）</option>';
    }).join('');

    var binglanRobotOptions = '<option value="">请选择机器人id</option>' + (window.MockBinglanRobots || []).map(function (r) {
      return '<option value="' + r.id + '">' + r.name + '（id：' + r.id + '）</option>';
    }).join('');

    var binglanWeekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(function (day) {
      return '<label class="biz-checkbox"><input type="checkbox"><span>' + day + '</span></label>';
    }).join('');

    var html =
      '<div class="biz-drawer-backdrop" id="bizAddSceneBackdrop" onclick="window.Pages[\'sys-scene\'].closeAddModal(event)">' +
        '<div class="biz-drawer" id="bizAddSceneDrawer" onclick="event.stopPropagation()">' +
          '<div class="biz-drawer-header"><span class="biz-drawer-title">' + modalTitle + '</span><span class="biz-drawer-close" onclick="window.Pages[\'sys-scene\'].closeAddModal()">&#x2715;</span></div>' +
          '<div class="biz-drawer-body">' +
            '<div class="biz-form">' +
              '<div class="biz-form-row"><label class="biz-form-label required">场景名称</label><div class="biz-form-field"><input type="text" class="biz-form-input" id="sceneNameInput" placeholder="给场景起个名字" maxlength="20" value="' + sceneName + '" oninput="window.Pages[\'sys-scene\'].updateCharCount(this,\'nameCount\',20)"><span class="biz-char-count" id="nameCount">' + sceneName.length + ' / 20</span></div></div>' +
              '<div class="biz-form-row"><label class="biz-form-label required">场景编码</label><div class="biz-form-field"><input type="text" class="biz-form-input" id="sceneCodeInput" placeholder="请输入字母、数字、符号" maxlength="20" value="' + sceneCode + '" oninput="window.Pages[\'sys-scene\'].updateCharCount(this,\'codeCount\',20)"><span class="biz-char-count" id="codeCount">' + sceneCode.length + ' / 20</span></div></div>' +
              '<div class="biz-form-row"><label class="biz-form-label">场景描述</label><div class="biz-form-field"><textarea class="biz-form-textarea" id="sceneDescTextarea" placeholder="请输入场景简要描述" rows="3">' + description + '</textarea></div></div>' +
              '<div class="biz-form-row"><label class="biz-form-label required">可用租户</label><div class="biz-form-field"><div class="biz-checkbox-group">' + tenantCheckboxesHtml(tenants) + '</div></div></div>' +
              '<div class="biz-form-row"><label class="biz-form-label required">智能平台</label><div class="biz-form-field"><div class="biz-radio-group">' + platformRadiosHtml(platform) + '</div></div></div>' +
              '<div class="biz-form-row"><label class="biz-form-label required">场景类型</label><div class="biz-form-field"><div class="biz-radio-group" id="sceneTypeGroup">' + sceneTypeRadiosHtml(sceneType) + '</div></div></div>' +

              /* 冰兰专属：数据导入方式（手动导入/接口传入） */
              '<div class="biz-form-row hidden" id="importTypeRowBinglan"><label class="biz-form-label required">数据导入方式</label><div class="biz-form-field"><div class="biz-inline-wrap"><div class="biz-radio-group">' +
                '<label class="biz-radio"><input type="radio" name="binglanImportType" value="手动导入"><span>手动导入</span></label>' +
                '<label class="biz-radio"><input type="radio" name="binglanImportType" value="接口传入"><span>接口传入</span></label>' +
              '</div><div class="biz-inline-error">请输入数据导入方式</div></div></div></div>' +

              /* 冰兰专属：呼叫通道 / 线路 */
              '<div class="biz-form-row hidden" id="callChannelRowBinglan"><label class="biz-form-label required">呼叫通道</label><div class="biz-form-field"><div class="biz-inline-wrap">' +
                '<select class="biz-form-select" id="binglanCallChannel" style="width:260px;" onchange="window.Pages[\'sys-scene\'].onBinglanCallChannelChange()"><option value="">请选择</option><option value="lianyou_vcp">联友 VCP</option><option value="binglan_channel">冰兰外呼通道</option></select>' +
                '<div class="biz-inline-error">请输入呼叫通道</div>' +
              '</div></div></div>' +
              '<div class="biz-form-row hidden" id="binglanLineRow"><label class="biz-form-label required">线路</label><div class="biz-form-field"><select class="biz-form-select" id="binglanLineSelect" style="width:260px;">' + binglanLineOptions + '</select></div></div>' +

              /* 默认数据导入方式（手动导入/自动传入） */
              '<div class="biz-form-row" id="importTypeRowDefault"><label class="biz-form-label required">数据导入方式</label><div class="biz-form-field"><div class="biz-radio-group">' +
                '<label class="biz-radio"><input type="radio" name="importType" value="手动导入"><span>手动导入</span></label>' +
                '<label class="biz-radio"><input type="radio" name="importType" value="自动传入"><span>自动传入</span></label>' +
              '</div></div></div>' +

              /* ===== 一知科技面板 ===== */
              '<div id="platformPanelYizhi" class="biz-platform-panel hidden">' +
                '<div class="biz-form-row"><label class="biz-form-label required">一知科技场景id</label><div class="biz-form-field"><input type="text" class="biz-form-input" id="yizhiSceneIdInput" placeholder="请输入一知科技平台创建的自助场景id" value="' + yizhiSceneId + '"></div></div>' +
                '<div class="biz-form-row"><label class="biz-form-label"></label><div class="biz-form-field"><div class="biz-modal-notice" style="margin:0;flex:1;"><span class="biz-notice-icon">&#x26A0;</span><div class="biz-notice-body">你需要先在一知后台创建自动任务后，将自动任务 id 复制粘贴到此处完成关联。</div></div></div></div>' +
                '<div class="biz-form-row hidden" id="modelTypeRow"><label class="biz-form-label required">模型类型</label><div class="biz-form-field"><div class="biz-radio-group">' +
                  '<label class="biz-radio"><input type="radio" name="modelType" value="小模型" onchange="window.Pages[\'sys-scene\'].onModelTypeChange()"><span>小模型</span></label>' +
                  '<label class="biz-radio"><input type="radio" name="modelType" value="大模型" onchange="window.Pages[\'sys-scene\'].onModelTypeChange()"><span>大模型</span></label>' +
                '</div></div></div>' +
                '<div class="biz-form-row hidden" id="yizhiAccountRow" style="align-items:flex-start;"><label class="biz-form-label required">选择一知账号</label><div class="biz-form-field" style="flex-direction:column;align-items:flex-start;gap:8px;">' +
                  '<select class="biz-form-select" id="yizhiAccountSelect" style="width:100%;"><option value="">请先选择模型类型</option>' + yizhiAccountOptions + '</select>' +
                  '<div class="biz-modal-notice" style="margin:0;"><span class="biz-notice-icon">&#x26A0;</span><div class="biz-notice-body">选择账号将会影响计费统计，选择前请确认该任务 id 是通过此账号创建。</div></div>' +
                '</div></div>' +
              '</div>' +

              /* ===== 中科金智能面板 ===== */
              '<div id="platformPanelZhongkejin" class="biz-platform-panel hidden">' +
                '<div class="biz-form-row"><label class="biz-form-label required">中科金任务id</label><div class="biz-form-field"><input type="text" class="biz-form-input" id="zkjTaskIdInput" placeholder="请输入中科金智能平台创建的外呼任务id" value="' + zkjTaskId + '"></div></div>' +
                '<div class="biz-form-row"><label class="biz-form-label"></label><div class="biz-form-field"><div class="biz-modal-notice" style="margin:0;flex:1;"><span class="biz-notice-icon">&#x26A0;</span><div class="biz-notice-body">你需要先在中科金后台创建自动任务后，将自动任务 id 复制粘贴到此处完成关联。</div></div></div></div>' +
                '<div class="biz-form-row hidden" id="zkjModelTypeRow"><label class="biz-form-label required">模型类型</label><div class="biz-form-field"><div class="biz-radio-group">' +
                  '<label class="biz-radio"><input type="radio" name="zkjModelType" value="小模型" onchange="window.Pages[\'sys-scene\'].onZkjModelTypeChange()"><span>小模型</span></label>' +
                  '<label class="biz-radio"><input type="radio" name="zkjModelType" value="大模型" onchange="window.Pages[\'sys-scene\'].onZkjModelTypeChange()"><span>大模型</span></label>' +
                '</div></div></div>' +
                '<div class="biz-form-row hidden" id="zkjAccountRow"><label class="biz-form-label required">选择中科金账号</label><div class="biz-form-field"><select class="biz-form-select" disabled><option>默认账号</option></select></div></div>' +
              '</div>' +

              /* ===== 电声面板 ===== */
              '<div id="platformPanelDiansheng" class="biz-platform-panel hidden">' +
                '<div class="ds-call-strategy">' +
                  '<div class="ds-call-title">呼叫任务配置</div>' +
                  '<div class="biz-form-row"><label class="biz-form-label">匹配机器人</label><div class="biz-form-field">' +
                    '<div class="ds-robot-binding" id="dsMatchedRobot"><strong id="dsMatchedRobotName">-</strong><span id="dsMatchedRobotCode">-</span></div>' +
                    '<span class="ds-robot-binding-help">由场景类型自动匹配，无需手动配置</span>' +
                  '</div></div>' +
                  '<div class="biz-form-row ds-call-time-row"><label class="biz-form-label required">呼叫时段</label><div class="biz-form-field ds-call-time-field">' +
                    '<div class="ds-call-window-list" id="dsCallWindowList">' + renderDianshengCallWindowRow(0) + '</div>' +
                    '<span class="ds-error-text">请至少配置一个完整的呼叫时段</span>' +
                    '<a href="#" class="biz-add-link" onclick="event.preventDefault();window.Pages[\'sys-scene\'].addDianshengCallWindow()">添加时段</a>' +
                  '</div></div>' +
                  '<div class="biz-form-row ds-exclude-date-row"><label class="biz-form-label ds-form-label-with-help"><span>排除日期</span><span class="ds-info-icon" tabindex="0" aria-label="查看排除日期说明" data-tooltip="用于配置节假日或禁止拨打日期，日期格式为 yyyy-MM-dd。配置仅在外呼批次启动前生效，批次执行中不支持修改。">i</span></label>' +
                    '<div class="biz-form-field ds-exclude-date-field">' +
                      '<div class="ds-exclude-date-list" id="dsExcludeDateList">' + renderDianshengExcludeDateRow(0) + '</div>' +
                      '<a href="#" class="biz-add-link" onclick="event.preventDefault();window.Pages[\'sys-scene\'].addDianshengExcludeDate()">添加日期</a>' +
                    '</div></div>' +
                  '<div class="biz-form-row ds-switch-row"><label class="biz-form-label required">自动重呼配置</label><div class="biz-form-field ds-switch-field"><span class="ds-warning">△ 按“N天M呼”配置，间隔分钟数按实际呼叫顺序填写</span></div></div>' +
                  '<div class="biz-form-row ds-redial-row"><label class="biz-form-label"></label><div class="biz-form-field ds-redial-field">' +
                    '<table class="ds-redial-table"><thead><tr><th>呼叫状态</th><th>最大执行天数</th><th>最大呼叫次数</th><th>间隔分钟数</th></tr></thead>' +
                      '<tbody id="dsRedialRulesBody"><tr class="ds-redial-rule-row">' +
                        '<td><input class="biz-form-input ds-redial-call-status" value="未接通" disabled aria-label="呼叫状态"></td>' +
                        '<td><input class="biz-form-input ds-redial-days" type="number" min="1" max="365" value="3" aria-label="最大执行天数"></td>' +
                        '<td><input class="biz-form-input ds-redial-times" type="number" min="1" max="20" value="3" aria-label="最大呼叫次数"></td>' +
                        '<td>' + renderDianshengIntervalControl() + '</td>' +
                      '</tr></tbody></table>' +
                  '</div></div>' +
                  '<div class="biz-form-row ds-switch-row"><label class="biz-form-label">黑名单拦截</label><div class="biz-form-field ds-stack-field">' +
                    '<label class="ds-switch"><input type="checkbox" id="dsBlacklistEnabled"><span></span></label>' +
                    '<select class="biz-form-select" id="dsBlacklistGroup" style="width:260px;">' + blacklistOptions + '</select>' +
                  '</div></div>' +
                  '<div class="biz-form-row ds-auto-start-row"><label class="biz-form-label required">是否自动启动</label><div class="biz-form-field ds-auto-start-field">' +
                    '<div class="ds-auto-start-control">' +
                      '<label class="ds-switch"><input type="checkbox" id="dsAutoStartEnabled" checked onchange="window.Pages[\'sys-scene\'].onDianshengAutoStartChange()"><span></span></label>' +
                      '<span class="ds-auto-start-value" id="dsAutoStartValue">是</span>' +
                    '</div>' +
                    '<div class="ds-auto-start-time hidden" id="dsAutoStartTimeWrap">' +
                      '<label class="required" for="dsAutoStartTime">执行时间</label>' +
                      '<input type="datetime-local" class="biz-form-input ds-auto-start-time-input" id="dsAutoStartTime" aria-label="自动启动执行时间">' +
                    '</div>' +
                  '</div></div>' +
                '</div>' +
                '<div class="biz-form-row" id="dsModelTypeRow"><label class="biz-form-label required">模型类型</label><div class="biz-form-field"><div class="biz-radio-group">' +
                  '<label class="biz-radio"><input type="radio" name="dsModelType" value="小模型" onchange="window.Pages[\'sys-scene\'].onDsModelTypeChange()"><span>小模型</span></label>' +
                  '<label class="biz-radio"><input type="radio" name="dsModelType" value="大模型" onchange="window.Pages[\'sys-scene\'].onDsModelTypeChange()"><span>大模型</span></label>' +
                '</div></div></div>' +
                '<div class="biz-form-row hidden" id="dsAccountRow"><label class="biz-form-label required">选择电声账号</label><div class="biz-form-field"><select class="biz-form-select" id="dsAccountSelect">' + dsAccountOptions + '</select></div></div>' +
              '</div>' +

              /* ===== 冰兰面板（呼叫策略） ===== */
              '<div id="platformPanelBinglan" class="biz-platform-panel hidden">' +
                '<div class="biz-section-title">呼叫策略</div>' +
                '<div class="biz-form-row"><label class="biz-form-label required">机器人id</label><div class="biz-form-field">' +
                  '<div id="binglanRobotIdInputWrap"><input type="text" class="biz-form-input" placeholder="请输入机器人id"></div>' +
                  '<div id="binglanRobotIdSelectWrap" class="hidden"><select class="biz-form-select" style="max-width:420px;">' + binglanRobotOptions + '</select></div>' +
                '</div></div>' +
                '<div class="biz-form-row" id="priorityRowBinglan"><label class="biz-form-label required">优先级</label><div class="biz-form-field biz-inline-field">' +
                  '<select class="biz-form-select" style="max-width:260px;"><option value="">请选择</option><option value="1">高</option><option value="2">中</option><option value="3">低</option></select>' +
                  '<span class="biz-help-icon" title="优先级说明" onclick="showToast(\'优先级说明开发中\',\'info\')">&#9432;</span>' +
                '</div></div>' +
                '<div class="biz-form-row binglan-channel-hidden-row"><label class="biz-form-label required">呼叫时段</label><div class="biz-form-field"><div class="biz-inline-wrap">' +
                  '<div class="biz-checkbox-group biz-week-group">' + binglanWeekdays + '</div>' +
                  '<div class="biz-inline-error">请输入呼叫时段</div>' +
                '</div></div></div>' +
                '<div class="biz-form-row binglan-channel-hidden-row"><label class="biz-form-label"></label><div class="biz-form-field">' +
                  '<div id="binglanTimeSlots"></div>' +
                  '<a href="#" class="biz-add-link" onclick="event.preventDefault();window.Pages[\'sys-scene\'].addTimeSlot()">添加时段</a>' +
                '</div></div>' +
                '<div class="biz-form-row binglan-channel-hidden-row"><label class="biz-form-label required">自动重拨</label><div class="biz-form-field"><div class="biz-switch-row">' +
                  '<label class="biz-switch"><input type="checkbox"><span class="biz-switch-slider"></span></label>' +
                  '<span class="biz-redial-tip"><span class="biz-redial-tip-icon">&#9888;</span>中途修改自动重拨策略后，已有的待重拨的号码将不执行重拨</span>' +
                '</div></div></div>' +
                '<div class="biz-form-row binglan-channel-hidden-row"><label class="biz-form-label"></label><div class="biz-form-field"><div class="biz-redial-table-wrap"><table class="biz-redial-table">' +
                  '<thead><tr><th>首次呼叫状态</th><th>重拨次数</th><th>重拨间隔</th><th>启用</th></tr></thead>' +
                  '<tbody><tr>' +
                    '<td>未接通</td>' +
                    '<td><select class="biz-form-select"><option value="1">1</option><option value="2" selected>2</option><option value="3">3</option></select></td>' +
                    '<td><select class="biz-form-select"><option value="15">15 分钟</option><option value="30" selected>30 分钟</option><option value="60">60 分钟</option></select></td>' +
                    '<td><label class="biz-switch"><input type="checkbox"><span class="biz-switch-slider"></span></label></td>' +
                  '</tr></tbody></table></div></div></div>' +
                '<div class="biz-form-row binglan-channel-hidden-row"><label class="biz-form-label">黑名单拦截</label><div class="biz-form-field"><label class="biz-switch"><input type="checkbox"><span class="biz-switch-slider"></span></label></div></div>' +
                '<div class="biz-form-row binglan-channel-hidden-row"><label class="biz-form-label"></label><div class="biz-form-field" style="max-width:420px;"><select class="biz-form-select"><option value="">请选择黑名单分组</option><option value="default">默认分组</option><option value="custom">自定义分组</option></select></div></div>' +
                '<div class="biz-form-row binglan-channel-hidden-row"><label class="biz-form-label">规则拦截</label><div class="biz-form-field"><label class="biz-switch"><input type="checkbox"><span class="biz-switch-slider"></span></label></div></div>' +
                '<div class="biz-form-row binglan-channel-hidden-row"><label class="biz-form-label"></label><div class="biz-form-field"><select class="biz-form-select"><option value="">选择拦截分组</option><option value="rule_default">默认规则组</option><option value="rule_custom">自定义规则组</option></select></div></div>' +
              '</div>' +

              /* ===== 厚朴面板 ===== */
              '<div id="platformPanelHoupu" class="biz-platform-panel hidden">' +
                '<div class="biz-form-row"><label class="biz-form-label required">厚朴任务名称</label><div class="biz-form-field"><input type="text" class="biz-form-input" id="houpuTaskName" value="' + houpuTaskName + '" placeholder="需与厚朴平台已创建的任务名称完全一致"></div></div>' +
                '<div class="biz-form-row"><label class="biz-form-label required">数据列模式</label><div class="biz-form-field"><div class="biz-radio-group">' +
                  '<label class="biz-radio"><input type="radio" name="houpuColumnType" value="single" onchange="window.Pages[\'sys-scene\'].onHoupuColumnTypeChange()"><span>单条</span></label>' +
                  '<label class="biz-radio"><input type="radio" name="houpuColumnType" value="multiple" checked onchange="window.Pages[\'sys-scene\'].onHoupuColumnTypeChange()"><span>多条</span></label>' +
                '</div></div></div>' +
                '<div class="biz-form-row"><label class="biz-form-label"></label><div class="biz-form-field"><div class="biz-modal-notice" style="margin:0;flex:1;"><span class="biz-notice-icon">&#x26A0;</span><div class="biz-notice-body">需先在厚朴平台创建任务，任务名称必须完全一致；单次批量追加最多 1000 条。登录令牌有效期 1 天。任务结果字段为首版参考口径，待联调确认。</div></div></div></div>' +
              '</div>' +

              /* ===== 大众通信面板 ===== */
              '<div id="platformPanelDazhong" class="biz-platform-panel hidden">' +
                '<div class="biz-form-row"><label class="biz-form-label required">大众通信任务ID</label><div class="biz-form-field"><input type="text" class="biz-form-input" id="dazhongTaskId" placeholder="请输入任务 uuid" value="' + dazhongTaskId + '"></div></div>' +
                '<div class="biz-form-row"><label class="biz-form-label"></label><div class="biz-form-field"><div class="biz-modal-notice" style="margin:0;flex:1;"><span class="biz-notice-icon">&#x26A0;</span><div class="biz-notice-body">请先在大众通信 SaaS 创建并配置任务，再将任务 ID（uuid）粘贴到此处关联。重呼、并发、呼叫时间等策略均在大众通信 SaaS 中配置。</div></div></div></div>' +
                '<div class="biz-form-row hidden" id="dzModelTypeRow"><label class="biz-form-label required">模型类型</label><div class="biz-form-field"><div class="biz-radio-group">' +
                  '<label class="biz-radio"><input type="radio" name="dzModelType" value="小模型" onchange="window.Pages[\'sys-scene\'].onDzModelTypeChange()"><span>小模型</span></label>' +
                  '<label class="biz-radio"><input type="radio" name="dzModelType" value="大模型" onchange="window.Pages[\'sys-scene\'].onDzModelTypeChange()"><span>大模型</span></label>' +
                '</div></div></div>' +
                '<div class="biz-form-row hidden" id="dzAccountRow"><label class="biz-form-label required">选择大众通信账号</label><div class="biz-form-field"><select class="biz-form-select" disabled><option>默认账号</option></select></div></div>' +
              '</div>' +

              /* ===== 业务信息 ===== */
              '<div class="biz-form-row" id="bizInfoRow" style="align-items:flex-start;margin-top:30px;">' +
                '<label class="biz-form-label required">业务信息</label>' +
                '<div class="biz-form-field" style="flex-direction:column;align-items:flex-start;gap:0;">' +
                  '<div class="biz-inner-tabs">' +
                    '<div class="biz-inner-tab active" onclick="window.Pages[\'sys-scene\'].switchBizTab(this,\'input\')"><span class="biz-required-tag">*</span> 场景传入信息</div>' +
                    '<div class="biz-inner-tab" onclick="window.Pages[\'sys-scene\'].switchBizTab(this,\'extract\')">场景提取信息</div>' +
                  '</div>' +
                  '<div class="biz-inner-panel" id="bizPanel-input">' +
                    '<table class="biz-inner-table" id="bizInputTable">' +
                      '<thead><tr><th>序号</th><th>字段名称</th><th>参数名</th><th>是否必填</th><th>操作</th></tr></thead>' +
                      '<tbody id="bizInputFieldTbody">' + renderInputFieldRows() + '</tbody>' +
                    '</table>' +
                    '<div class="biz-add-field-row" id="bizInputAddRow"><a href="#" class="biz-add-link" onclick="event.preventDefault();window.Pages[\'sys-scene\'].showFieldModal(\'场景传入信息\')">+ 添加字段</a></div>' +
                  '</div>' +
                  '<div class="biz-inner-panel" id="bizPanel-extract" style="display:none;">' +
                    '<table class="biz-inner-table">' +
                      '<thead><tr><th>序号</th><th>字段名称</th><th>参数名</th><th>是否必填</th><th>操作</th></tr></thead>' +
                      '<tbody id="bizExtractFieldTbody">' + renderExtractFieldRows() + '</tbody>' +
                    '</table>' +
                    '<div class="biz-add-field-row"><a href="#" class="biz-add-link" onclick="event.preventDefault();window.Pages[\'sys-scene\'].showFieldModal(\'场景提取信息\')">+ 添加字段</a></div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="biz-drawer-footer" id="bizModalFooter">' +
            '<button class="btn btn-default" onclick="window.Pages[\'sys-scene\'].closeAddModal()" style="height:32px;padding:0 20px;">取消</button>' +
            '<button class="btn btn-primary" id="bizSceneSubmitBtn" onclick="window.Pages[\'sys-scene\'].submitAddModal()" style="height:32px;padding:0 20px;">确定</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    return html;
  }

  function showAddModal(modalTitle) {
    modalTitle = modalTitle || '新建业务场景';
    currentEditingId = null;
    platformInputRows = [];
    customInputFields = [];
    customExtractFields = [];
    dsWindowIndex = 1;
    dsExcludeIndex = 1;
    document.body.insertAdjacentHTML('beforeend', renderDrawerHtml(modalTitle, {}));
    document.body.style.overflow = 'hidden';
    document.addEventListener('click', closeDianshengIntervalMenus);
    requestAnimationFrame(function () {
      var backdrop = document.getElementById('bizAddSceneBackdrop');
      var drawer = document.getElementById('bizAddSceneDrawer');
      if (backdrop) backdrop.classList.add('open');
      if (drawer) drawer.classList.add('open');
    });
    onPlatformChange();
  }

  function showEditModal(sceneId) {
    var row = SceneRows.find(function (item) { return item.id === sceneId; });
    if (!row) {
      showToast('未找到该场景数据', 'error');
      return;
    }
    currentEditingId = sceneId;
    platformInputRows = [];
    customInputFields = [];
    customExtractFields = [];
    dsWindowIndex = 1;
    dsExcludeIndex = 1;
    var data = Object.assign({}, row, { tenants: row.tenant ? [row.tenant] : [] });
    document.body.insertAdjacentHTML('beforeend', renderDrawerHtml('编辑业务场景', data));
    document.body.style.overflow = 'hidden';
    document.addEventListener('click', closeDianshengIntervalMenus);
    requestAnimationFrame(function () {
      var backdrop = document.getElementById('bizAddSceneBackdrop');
      var drawer = document.getElementById('bizAddSceneDrawer');
      if (backdrop) backdrop.classList.add('open');
      if (drawer) drawer.classList.add('open');
    });
    onPlatformChange();
  }

  function closeAddModal(e) {
    if (e && e.target !== e.currentTarget) return;
    var backdrop = document.getElementById('bizAddSceneBackdrop');
    var drawer = document.getElementById('bizAddSceneDrawer');
    if (!backdrop && !drawer) return;
    if (backdrop) backdrop.classList.remove('open');
    if (drawer) drawer.classList.add('closing');
    document.removeEventListener('click', closeDianshengIntervalMenus);
    setTimeout(function () {
      if (backdrop) backdrop.remove();
      document.body.style.overflow = '';
    }, 320);
  }

  function updateCharCount(input, id, limit) {
    var el = document.getElementById(id);
    if (el) el.textContent = input.value.length + ' / ' + limit;
  }

  function switchBizTab(el, tab) {
    var parent = el.closest('.biz-form-field');
    Array.prototype.forEach.call(parent.querySelectorAll('.biz-inner-tab'), function (t) { t.classList.remove('active'); });
    el.classList.add('active');
    Array.prototype.forEach.call(parent.querySelectorAll('.biz-inner-panel'), function (p) { p.style.display = 'none'; });
    var panel = parent.querySelector('#bizPanel-' + tab);
    if (panel) panel.style.display = 'block';
  }

  /* ===== 场景类型可用性（电声/冰兰仅新线索、冷线索） ===== */
  function updateSceneTypeAvailability(platformValue) {
    var restrict = platformValue === '电声' || platformValue === '冰兰';
    var inputs = document.querySelectorAll('#bizAddSceneDrawer input[name="sceneType"]');
    Array.prototype.forEach.call(inputs, function (input) {
      var allowed = !restrict || input.value === '新线索' || input.value === '冷线索';
      input.disabled = !allowed;
      var label = input.closest ? input.closest('.biz-radio') : input.parentNode;
      if (label) label.classList.toggle('disabled', !allowed);
      var text = label ? label.querySelector('span') : null;
      if (text && input.value === '首访') text.textContent = platformValue === '电声' ? '督办' : '首访';
      if (!allowed && input.checked) input.checked = false;
    });
    if (restrict && !document.querySelector('#bizAddSceneDrawer input[name="sceneType"]:checked')) {
      var newLead = document.querySelector('#bizAddSceneDrawer input[name="sceneType"][value="新线索"]');
      if (newLead) newLead.checked = true;
    }
  }

  function onSceneTypeChange() {
    if (getCurrentPlatform() === '电声') onDianshengSceneTypeChange();
  }

  /* ===== 智能平台切换 ===== */
  function onPlatformChange() {
    var platform = getCurrentPlatform();
    var ids = ['platformPanelYizhi', 'platformPanelZhongkejin', 'platformPanelDiansheng', 'platformPanelBinglan', 'platformPanelHoupu', 'platformPanelDazhong',
      'modelTypeRow', 'yizhiAccountRow', 'zkjModelTypeRow', 'zkjAccountRow', 'dsModelTypeRow', 'dsAccountRow', 'dzModelTypeRow', 'dzAccountRow'];
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });

    /* 清空各平台模型类型与账号选中 */
    ['modelType', 'zkjModelType', 'dsModelType', 'dzModelType'].forEach(function (name) {
      var checked = document.querySelector('input[name="' + name + '"]:checked');
      if (checked) checked.checked = false;
    });
    var dsAccountSelect = document.getElementById('dsAccountSelect');
    if (dsAccountSelect) dsAccountSelect.value = '';
    var yizhiAccountSelect = document.getElementById('yizhiAccountSelect');
    if (yizhiAccountSelect) yizhiAccountSelect.value = '';

    /* 冰兰专属行 vs 默认行 */
    var importRowBinglan = document.getElementById('importTypeRowBinglan');
    var importRowDefault = document.getElementById('importTypeRowDefault');
    var channelRow = document.getElementById('callChannelRowBinglan');
    var lineRow = document.getElementById('binglanLineRow');
    if (platform === '冰兰') {
      if (importRowBinglan) importRowBinglan.classList.remove('hidden');
      if (importRowDefault) importRowDefault.classList.add('hidden');
      if (channelRow) channelRow.classList.remove('hidden');
    } else {
      if (importRowBinglan) importRowBinglan.classList.add('hidden');
      if (importRowDefault) importRowDefault.classList.remove('hidden');
      if (channelRow) channelRow.classList.add('hidden');
      if (lineRow) lineRow.classList.add('hidden');
    }

    updateSceneTypeAvailability(platform);

    /* 重置业务信息字段 */
    customInputFields = [];
    customExtractFields = [];
    resetInputFieldsForPlatform(platform);
    refreshInputTable();
    refreshExtractTable();

    /* 电声提交按钮文案 */
    var submitBtn = document.getElementById('bizSceneSubmitBtn');
    if (submitBtn) submitBtn.textContent = platform === '电声' ? '确定并生成任务' : '确定';

    if (platform === '一知科技') {
      showEl('platformPanelYizhi');
      showEl('modelTypeRow');
    } else if (platform === '中科金智能') {
      showEl('platformPanelZhongkejin');
      showEl('zkjModelTypeRow');
    } else if (platform === '电声') {
      showEl('platformPanelDiansheng');
      showEl('dsModelTypeRow');
      onDianshengSceneTypeChange();
    } else if (platform === '冰兰') {
      showEl('platformPanelBinglan');
      onBinglanCallChannelChange();
      ensureTimeSlotsInit();
    } else if (platform === '厚朴') {
      showEl('platformPanelHoupu');
      onHoupuColumnTypeChange();
    } else if (platform === '大众通信') {
      showEl('platformPanelDazhong');
      showEl('dzModelTypeRow');
    }
  }

  function showEl(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
  }

  /* ===== 模型类型联动 ===== */
  function onModelTypeChange() {
    var platform = getCurrentPlatform();
    var modelType = document.querySelector('input[name="modelType"]:checked');
    var accountRow = document.getElementById('yizhiAccountRow');
    var accountSelect = document.getElementById('yizhiAccountSelect');
    if (!accountRow) return;
    if (platform === '一知科技' && modelType) {
      accountRow.classList.remove('hidden');
      if (accountSelect) {
        var options = (window.MockYizhiAccounts || []).map(function (acc) {
          return '<option value="' + acc.name + '">' + acc.name + ' (' + acc.id + ')</option>';
        }).join('');
        accountSelect.innerHTML = '<option value="">请选择一知账号</option>' + options;
        accountSelect.value = '';
      }
    } else {
      accountRow.classList.add('hidden');
    }
  }

  function onZkjModelTypeChange() {
    var modelType = document.querySelector('input[name="zkjModelType"]:checked');
    var accountRow = document.getElementById('zkjAccountRow');
    if (accountRow) accountRow.classList.toggle('hidden', !modelType);
  }

  function onDzModelTypeChange() {
    var modelType = document.querySelector('input[name="dzModelType"]:checked');
    var accountRow = document.getElementById('dzAccountRow');
    if (accountRow) accountRow.classList.toggle('hidden', !modelType);
  }

  function onDsModelTypeChange() {
    var modelType = document.querySelector('input[name="dsModelType"]:checked');
    var accountRow = document.getElementById('dsAccountRow');
    var accountSelect = document.getElementById('dsAccountSelect');
    if (!accountRow) return;
    if (modelType) {
      accountRow.classList.remove('hidden');
      if (accountSelect) {
        accountSelect.value = '';
        Array.prototype.forEach.call(accountSelect.options, function (option) {
          if (!option.value) option.hidden = false;
          else option.hidden = option.getAttribute('data-model') !== modelType.value;
        });
      }
    } else {
      accountRow.classList.add('hidden');
    }
  }

  /* ===== 冰兰：呼叫通道切换 ===== */
  function onBinglanCallChannelChange() {
    var selectEl = document.getElementById('binglanCallChannel');
    var isBinglanChannel = !!(selectEl && selectEl.value === 'binglan_channel');
    var rows = document.querySelectorAll('#bizAddSceneDrawer .binglan-channel-hidden-row');
    Array.prototype.forEach.call(rows, function (row) { row.classList.toggle('hidden', isBinglanChannel); });
    var priorityRow = document.getElementById('priorityRowBinglan');
    var lineRow = document.getElementById('binglanLineRow');
    var robotInput = document.getElementById('binglanRobotIdInputWrap');
    var robotSelect = document.getElementById('binglanRobotIdSelectWrap');
    if (isBinglanChannel) {
      if (priorityRow) priorityRow.classList.add('hidden');
      if (lineRow) lineRow.classList.remove('hidden');
      if (robotInput) robotInput.classList.add('hidden');
      if (robotSelect) robotSelect.classList.remove('hidden');
    } else {
      if (priorityRow) priorityRow.classList.remove('hidden');
      if (lineRow) lineRow.classList.add('hidden');
      if (robotInput) robotInput.classList.remove('hidden');
      if (robotSelect) robotSelect.classList.add('hidden');
    }
    resetInputFieldsForPlatform(getCurrentPlatform());
    refreshInputTable();
  }

  /* ===== 厚朴：数据列模式切换 ===== */
  function onHoupuColumnTypeChange() {
    if (getCurrentPlatform() !== '厚朴') return;
    resetInputFieldsForPlatform('厚朴');
    refreshInputTable();
  }

  /* ===== 冰兰：平台默认字段编辑/删除 ===== */
  function showInputFieldEditModal(index) {
    var row = platformInputRows[index];
    if (!row) return;
    var html = '<div class="biz-dialog-backdrop" id="bizInputFieldEditBackdrop" onclick="window.Pages[\'sys-scene\'].closeInputFieldEditModal(event)">' +
      '<div class="biz-dialog" onclick="event.stopPropagation()">' +
        '<div class="biz-dialog-header"><span class="biz-dialog-title">编辑场景信息</span><span class="biz-dialog-close" onclick="window.Pages[\'sys-scene\'].closeInputFieldEditModal()">&#x2715;</span></div>' +
        '<div class="biz-dialog-body"><div class="biz-dialog-form">' +
          '<div class="biz-dialog-row"><label class="biz-dialog-label required">字段名称</label><div class="biz-dialog-field"><input type="text" class="biz-dialog-input" id="editInputFieldName" value="' + row.fieldName + '" maxlength="50"></div></div>' +
          '<div class="biz-dialog-row"><label class="biz-dialog-label required">参数名</label><div class="biz-dialog-field"><input type="text" class="biz-dialog-input" id="editInputFieldCode" value="' + row.paramName + '" maxlength="50"></div></div>' +
          '<div class="biz-dialog-row"><label class="biz-dialog-label required">是否必填</label><div class="biz-dialog-field"><div class="biz-radio-group">' +
            '<label class="biz-radio"><input type="radio" name="editInputFieldRequired" value="1"' + (row.required ? ' checked' : '') + '><span>必填</span></label>' +
            '<label class="biz-radio"><input type="radio" name="editInputFieldRequired" value="0"' + (!row.required ? ' checked' : '') + '><span>选填</span></label>' +
          '</div></div></div>' +
        '</div>' +
        '<div class="biz-dialog-footer">' +
          '<button class="btn btn-default" onclick="window.Pages[\'sys-scene\'].closeInputFieldEditModal()" style="height:32px;padding:0 20px;">取消</button>' +
          '<button class="btn btn-primary" onclick="window.Pages[\'sys-scene\'].confirmInputFieldEdit(' + index + ')" style="height:32px;padding:0 20px;">确认</button>' +
        '</div>' +
      '</div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  }

  function closeInputFieldEditModal(e) {
    if (e && e.target !== e.currentTarget) return;
    var bd = document.getElementById('bizInputFieldEditBackdrop');
    if (bd) bd.remove();
  }

  function confirmInputFieldEdit(index) {
    var row = platformInputRows[index];
    if (!row) return;
    var nameEl = document.getElementById('editInputFieldName');
    var codeEl = document.getElementById('editInputFieldCode');
    var requiredEl = document.querySelector('input[name="editInputFieldRequired"]:checked');
    var fieldName = nameEl ? nameEl.value.trim() : '';
    var paramName = codeEl ? codeEl.value.trim() : '';
    if (!fieldName || !paramName) {
      showToast('请填写字段名称和参数名', 'warning');
      return;
    }
    row.fieldName = fieldName;
    row.paramName = paramName;
    row.required = !!(requiredEl && requiredEl.value === '1');
    closeInputFieldEditModal();
    refreshInputTable();
    showToast('更新成功', 'success');
  }

  /* ===== 冰兰：平台默认字段删除确认 ===== */
  function removePlatformInputRow(index) {
    var row = platformInputRows[index];
    if (!row) return;
    if (document.getElementById('bizInputFieldDeleteBackdrop')) return;
    var html = '<div class="biz-dialog-backdrop" id="bizInputFieldDeleteBackdrop" onclick="window.Pages[\'sys-scene\'].closeInputFieldDeleteConfirm(event)">' +
      '<div class="biz-dialog" onclick="event.stopPropagation()">' +
        '<div class="biz-dialog-header"><span class="biz-dialog-title">删除确认</span><span class="biz-dialog-close" onclick="window.Pages[\'sys-scene\'].closeInputFieldDeleteConfirm()">&#x2715;</span></div>' +
        '<div class="biz-dialog-body"><div style="font-size:14px;color:#333;line-height:1.7;">确认删除字段「' + row.fieldName + '」吗？</div></div>' +
        '<div class="biz-dialog-footer"><button class="btn btn-default" onclick="window.Pages[\'sys-scene\'].closeInputFieldDeleteConfirm()" style="height:32px;padding:0 20px;">取消</button><button class="btn btn-primary" onclick="window.Pages[\'sys-scene\'].confirmInputFieldDelete(' + index + ')" style="height:32px;padding:0 20px;">确认</button></div>' +
      '</div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  }

  function closeInputFieldDeleteConfirm(e) {
    if (e && e.target !== e.currentTarget) return;
    var bd = document.getElementById('bizInputFieldDeleteBackdrop');
    if (bd) bd.remove();
  }

  function confirmInputFieldDelete(index) {
    platformInputRows.splice(index, 1);
    closeInputFieldDeleteConfirm();
    refreshInputTable();
    showToast('删除成功', 'success');
  }

  /* ===== 自定义字段删除 ===== */
  function removeCustomField(kind, index) {
    if (kind === 'extract') {
      customExtractFields.splice(index, 1);
      refreshExtractTable();
    } else {
      customInputFields.splice(index, 1);
      refreshInputTable();
    }
    showToast('删除成功', 'success');
  }

  /* ===== 添加场景信息弹窗（小弹窗，居中） ===== */
  function showFieldModal(bizType) {
    var html = '<div class="biz-dialog-backdrop" id="bizFieldBackdrop" onclick="window.Pages[\'sys-scene\'].closeFieldModal(event)">' +
      '<div class="biz-dialog" onclick="event.stopPropagation()">' +
        '<div class="biz-dialog-header"><span class="biz-dialog-title">添加场景信息</span><span class="biz-dialog-close" onclick="window.Pages[\'sys-scene\'].closeFieldModal()">&#x2715;</span></div>' +
        '<div class="biz-dialog-body"><div class="biz-dialog-form">' +
          '<div class="biz-dialog-row"><label class="biz-dialog-label required">业务信息</label><div class="biz-dialog-field"><input type="text" class="biz-dialog-input readonly" value="' + bizType + '" readonly></div></div>' +
          '<div class="biz-dialog-row"><label class="biz-dialog-label required">字段名称</label><div class="biz-dialog-field">' +
            '<input type="text" class="biz-dialog-input" id="fieldName" placeholder="输入字段名称，支持汉字、字母、数字、符号，如&ldquo;订单号&rdquo;" maxlength="50" oninput="window.Pages[\'sys-scene\'].updateCharCount(this,\'fieldNameCount\',50)">' +
            '<span class="biz-char-count" id="fieldNameCount">0 / 50</span>' +
          '</div></div>' +
          '<div class="biz-dialog-row"><label class="biz-dialog-label required">参数名</label><div class="biz-dialog-field">' +
            '<input type="text" class="biz-dialog-input" id="fieldCode" placeholder="输入参数名称，支持字母、数字、符号，如&ldquo;id&rdquo;" maxlength="50" oninput="window.Pages[\'sys-scene\'].updateCharCount(this,\'fieldCodeCount\',50)">' +
            '<span class="biz-char-count" id="fieldCodeCount">0 / 50</span>' +
          '</div></div>' +
          '<div class="biz-dialog-row"><label class="biz-dialog-label required">是否必填</label><div class="biz-dialog-field"><div class="biz-radio-group">' +
            '<label class="biz-radio"><input type="radio" name="fieldRequired" value="1"><span>必填</span></label>' +
            '<label class="biz-radio"><input type="radio" name="fieldRequired" value="0"><span>选填</span></label>' +
          '</div></div></div>' +
        '</div></div>' +
        '<div class="biz-dialog-footer">' +
          '<button class="btn btn-default" onclick="window.Pages[\'sys-scene\'].closeFieldModal()" style="height:32px;padding:0 20px;">取消</button>' +
          '<button class="btn btn-primary" onclick="window.Pages[\'sys-scene\'].confirmAddField()" style="height:32px;padding:0 20px;">确定</button>' +
        '</div>' +
      '</div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  }

  function closeFieldModal(e) {
    if (e && e.target !== e.currentTarget) return;
    var bd = document.getElementById('bizFieldBackdrop');
    if (bd) bd.remove();
  }

  function confirmAddField() {
    var nameEl = document.getElementById('fieldName');
    var codeEl = document.getElementById('fieldCode');
    var requiredEl = document.querySelector('input[name="fieldRequired"]:checked');
    var name = nameEl ? nameEl.value.trim() : '';
    var code = codeEl ? codeEl.value.trim() : '';
    var required = !!(requiredEl && requiredEl.value === '1');
    if (!name || !code) {
      showToast('请填写字段名称和参数名', 'warning');
      return;
    }
    var extractPanel = document.getElementById('bizPanel-extract');
    var isExtract = !!(extractPanel && extractPanel.style.display !== 'none');
    if (isExtract) {
      customExtractFields.push({ name: name, code: code, required: required });
      refreshExtractTable();
    } else {
      customInputFields.push({ name: name, code: code, required: required });
      refreshInputTable();
    }
    showToast('添加成功', 'success');
    closeFieldModal();
  }

  /* ===== 提交（含各平台必填校验） ===== */
  function getTrimmedValue(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function getCheckedValues(selector) {
    return Array.prototype.map.call(document.querySelectorAll(selector), function (el) { return el.value; });
  }

  function formatNowDateTime() {
    var d = new Date();
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  function collectFormSceneRow() {
    var platform = getCurrentPlatform();
    var sceneTypeEl = document.querySelector('#bizAddSceneDrawer input[name="sceneType"]:checked');
    var tenants = getCheckedValues('#bizAddSceneDrawer input[type="checkbox"]:checked');
    var sceneIdVal = '';
    if (platform === '一知科技') sceneIdVal = getTrimmedValue('yizhiSceneIdInput');
    else if (platform === '中科金智能') sceneIdVal = getTrimmedValue('zkjTaskIdInput');
    else if (platform === '大众通信') sceneIdVal = getTrimmedValue('dazhongTaskId');
    return {
      name: getTrimmedValue('sceneNameInput'),
      code: getTrimmedValue('sceneCodeInput'),
      desc: getTrimmedValue('sceneDescTextarea'),
      platform: platform,
      category: sceneTypeEl ? sceneTypeEl.value : '',
      tenant: tenants.join('、'),
      sceneId: sceneIdVal,
      taskName: platform === '厚朴' ? getTrimmedValue('houpuTaskName') : '',
      updateTime: formatNowDateTime()
    };
  }

  function validateDrawerForm() {
    var platform = getCurrentPlatform();
    var data = collectFormSceneRow();
    var modelTypeEl;
    var accountEl;
    if (!data.name) return '请输入场景名称';
    if (!data.code) return '请输入场景编码';
    if (!getCheckedValues('#bizAddSceneDrawer input[type="checkbox"]:checked').length) return '请选择可用租户';
    if (!platform) return '请选择智能平台';
    if (!data.category) return '请选择场景类型';

    if (platform === '一知科技') {
      if (!data.sceneId) return '请输入一知科技场景id';
      modelTypeEl = document.querySelector('input[name="modelType"]:checked');
      if (!modelTypeEl) return '请选择模型类型';
      accountEl = document.getElementById('yizhiAccountSelect');
      if (!accountEl || !accountEl.value) return '请选择一知账号';
    } else if (platform === '中科金智能') {
      if (!data.sceneId) return '请输入中科金任务id';
      modelTypeEl = document.querySelector('input[name="zkjModelType"]:checked');
      if (!modelTypeEl) return '请选择模型类型';
    } else if (platform === '电声') {
      var windows = getDianshengCallWindows();
      var completeWindow = windows.some(function (win) { return win.weekdays.length && win.beginTime && win.endTime; });
      if (!completeWindow) return '请至少配置一个完整的呼叫时段';
      modelTypeEl = document.querySelector('input[name="dsModelType"]:checked');
      if (!modelTypeEl) return '请选择模型类型';
      accountEl = document.getElementById('dsAccountSelect');
      if (!accountEl || !accountEl.value) return '请选择电声账号';
    } else if (platform === '冰兰') {
      var importEl = document.querySelector('input[name="binglanImportType"]:checked');
      if (!importEl) return '请选择数据导入方式';
      var channel = getBinglanChannel();
      if (!channel) return '请选择呼叫通道';
      if (channel === 'binglan_channel') {
        var lineEl = document.getElementById('binglanLineSelect');
        if (!lineEl || !lineEl.value) return '请选择线路';
        var robotSelectWrap = document.getElementById('binglanRobotIdSelectWrap');
        var robotSelect = robotSelectWrap ? robotSelectWrap.querySelector('select') : null;
        if (!robotSelect || !robotSelect.value) return '请选择机器人id';
      } else {
        var robotInputWrap = document.getElementById('binglanRobotIdInputWrap');
        var robotInput = robotInputWrap ? robotInputWrap.querySelector('input') : null;
        if (!robotInput || !robotInput.value.trim()) return '请输入机器人id';
        var priorityRow = document.getElementById('priorityRowBinglan');
        var priorityEl = priorityRow ? priorityRow.querySelector('select') : null;
        if (!priorityEl || !priorityEl.value) return '请选择优先级';
      }
    } else if (platform === '厚朴') {
      if (!data.taskName) return '请输入厚朴任务名称';
    } else if (platform === '大众通信') {
      if (!data.sceneId) return '请输入大众通信任务ID';
      modelTypeEl = document.querySelector('input[name="dzModelType"]:checked');
      if (!modelTypeEl) return '请选择模型类型';
    }
    return '';
  }

  function submitAddModal() {
    var error = validateDrawerForm();
    if (error) {
      showToast(error, 'warning');
      return;
    }
    var data = collectFormSceneRow();
    if (currentEditingId) {
      var row = SceneRows.find(function (item) { return item.id === currentEditingId; });
      if (row) Object.assign(row, data);
      showToast('保存成功', 'success');
    } else {
      var maxId = SceneRows.reduce(function (max, item) { return Math.max(max, item.id || 0); }, 0);
      SceneRows.push(Object.assign({ id: maxId + 1 }, data));
      showToast('创建成功', 'success');
    }
    closeAddModal();
    refreshSceneTable();
  }

  function init() {}

  window.Pages = window.Pages || {};
  window.Pages['sys-scene'] = {
    render: render,
    init: init,
    showAddModal: showAddModal,
    showEditModal: showEditModal,
    closeAddModal: closeAddModal,
    submitAddModal: submitAddModal,
    showDeleteConfirm: showDeleteConfirm,
    closeDeleteConfirm: closeDeleteConfirm,
    confirmDeleteScene: confirmDeleteScene,
    updateCharCount: updateCharCount,
    switchBizTab: switchBizTab,
    showFieldModal: showFieldModal,
    closeFieldModal: closeFieldModal,
    confirmAddField: confirmAddField,
    onPlatformChange: onPlatformChange,
    onSceneTypeChange: onSceneTypeChange,
    onModelTypeChange: onModelTypeChange,
    onZkjModelTypeChange: onZkjModelTypeChange,
    onDsModelTypeChange: onDsModelTypeChange,
    onDzModelTypeChange: onDzModelTypeChange,
    onBinglanCallChannelChange: onBinglanCallChannelChange,
    onHoupuColumnTypeChange: onHoupuColumnTypeChange,
    onDianshengAutoStartChange: onDianshengAutoStartChange,
    addDianshengCallWindow: addDianshengCallWindow,
    removeDianshengCallWindow: removeDianshengCallWindow,
    addDianshengExcludeDate: addDianshengExcludeDate,
    removeDianshengExcludeDate: removeDianshengExcludeDate,
    toggleDianshengIntervalMenu: toggleDianshengIntervalMenu,
    updateDianshengIntervalSummary: updateDianshengIntervalSummary,
    addTimeSlot: addTimeSlot,
    removeTimeSlot: removeTimeSlot,
    showInputFieldEditModal: showInputFieldEditModal,
    closeInputFieldEditModal: closeInputFieldEditModal,
    confirmInputFieldEdit: confirmInputFieldEdit,
    removePlatformInputRow: removePlatformInputRow,
    closeInputFieldDeleteConfirm: closeInputFieldDeleteConfirm,
    confirmInputFieldDelete: confirmInputFieldDelete,
    removeCustomField: removeCustomField
  };
})();