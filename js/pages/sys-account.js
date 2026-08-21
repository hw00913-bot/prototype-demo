/**
 * js/pages/sys-account.js — 系统管理 / 账号管理页面
 * 依据线上系统真实截图全功能实现：
 * - 顶部标题与描述：「账号管理 / 管理每个租户下关联的账号信息。」
 * - 左右双栏布局：
 *   - 左侧：租户卡片列表（租户名称、关联账号数徽标、描述、状态，支持点击联动高亮切换）
 *   - 右侧：账号管理面板
 *     - 顶部标准筛选栏（手机号码、角色下拉框、重置/查询）
 *     - 工具栏（+ 新建按钮、刷新、设置）
 *     - 账号数据表格（序号、账号昵称、账号、手机号码、角色、状态、更新人、更新时间、操作【编辑、删除】）
 *     - 底部分页条
 * - 弹窗系统（100% 像素级对齐截图）：
 *   - 新增账号 / 编辑账号：
 *     - 所属租户：只读输入框
 *     - 头像：80x80 虚线框 + 上传预览
 *     - 账号：支持字母/符号/数字说明
 *     - 账号昵称：带 0/20 实时字数统计与支持说明
 *     - 手机号码：带 0/11 实时字数统计
 *     - 登录密码：带 8~16 位说明与明密文小眼睛切换
 *     - 角色：单选 Radio（租户管理员 / 租户运营）
 *     - 状态：单选 Radio（禁用 / 启用）
 *     - 确定 / 取消
 */

window.Pages = window.Pages || {};
window.Pages['sys-account'] = (function () {
  'use strict';

  var selectedTenantName = '海南海粤店';
  var filterPhone = '';
  var filterRole = 'all';
  var currentEditingAccountId = null;
  var currentAvatarDataUrl = '';

  function getTenants() {
    return window.MockTenantRows || [];
  }

  function getAccounts() {
    window.MockAccountRows = window.MockAccountRows || [];
    return window.MockAccountRows;
  }

  function getTenantAccountCount(tenantName) {
    return getAccounts().filter(function (a) {
      return a.tenantName === tenantName;
    }).length;
  }

  function getFilteredAccounts() {
    var list = getAccounts().filter(function (a) {
      return a.tenantName === selectedTenantName;
    });
    if (filterPhone) {
      list = list.filter(function (a) {
        return a.phone && a.phone.indexOf(filterPhone) !== -1;
      });
    }
    if (filterRole && filterRole !== 'all') {
      list = list.filter(function (a) {
        return a.role === filterRole;
      });
    }
    return list;
  }

  function renderTenantCards() {
    var tenants = getTenants();
    if (!tenants.length) {
      return '<div class="biz-empty-mini">暂无租户</div>';
    }
    return tenants.map(function (t) {
      var count = getTenantAccountCount(t.name);
      var isActive = t.name === selectedTenantName;
      return '<div class="account-tenant-card ' + (isActive ? 'active' : '') + '" onclick="window.Pages[\'sys-account\'].selectTenant(\'' + escapeHtmlAttr(t.name) + '\')">' +
        '<div class="account-tenant-card-header">' +
          '<span class="account-tenant-name" title="' + escapeHtmlAttr(t.name) + '">' + escapeHtmlText(t.name) + '</span>' +
          '<span class="account-tenant-count">' + count + '</span>' +
        '</div>' +
        '<div class="account-tenant-desc">描述：' + (t.desc === '-' ? '' : escapeHtmlText(t.desc || '')) + '</div>' +
        '<div class="account-tenant-status">状态：' + escapeHtmlText(t.status || '启用') + '</div>' +
      '</div>';
    }).join('');
  }

  function roleTag(role) {
    var cls = 'admin';
    if (role === '租户运营' || role === '普通坐席') cls = 'agent';
    else if (role === '财务审核员') cls = 'finance';
    else if (role === '外呼专员') cls = 'call';
    return '<span class="account-role-tag ' + cls + '">' + escapeHtmlText(role) + '</span>';
  }

  function renderAccountRows() {
    var list = getFilteredAccounts();
    if (!list.length) {
      return '<tr><td colspan="9"><div class="biz-empty-mini" style="padding:28px 0;">当前租户下暂无账号数据</div></td></tr>';
    }
    return list.map(function (row, idx) {
      return '<tr>' +
        '<td>' + (idx + 1) + '</td>' +
        '<td>' + escapeHtmlText(row.nickname) + '</td>' +
        '<td>' + escapeHtmlText(row.username) + '</td>' +
        '<td>' + escapeHtmlText(row.phone) + '</td>' +
        '<td>' + roleTag(row.role) + '</td>' +
        '<td>' + escapeHtmlText(row.status) + '</td>' +
        '<td>' + escapeHtmlText(row.updater || '-') + '</td>' +
        '<td>' + escapeHtmlText(row.updateTime || '-') + '</td>' +
        '<td>' +
          '<button class="tenant-op-btn blue" onclick="window.Pages[\'sys-account\'].openEditAccountModal(' + row.id + ')">编辑</button>' +
          '<button class="tenant-op-btn red" onclick="window.Pages[\'sys-account\'].deleteAccount(' + row.id + ')">删除</button>' +
        '</td>' +
      '</tr>';
    }).join('');
  }

  function render() {
    var filtered = getFilteredAccounts();
    return '<div class="account-page">' +
      '<div class="account-header">' +
        '<div class="account-title">账号管理</div>' +
        '<div class="account-desc">管理每个租户下关联的账号信息。</div>' +
      '</div>' +
      '<div class="account-main-layout">' +
        // 左侧租户选择栏
        '<div class="account-tenant-panel" id="accountTenantPanel">' +
          renderTenantCards() +
        '</div>' +
        // 右侧账号管理区域
        '<div class="account-content-panel">' +
          // 顶部标准筛选栏
          '<div class="filter-bar">' +
            '<div class="filter-item"><label>手机号码：</label><input type="text" id="accountFilterPhone" class="filter-input" placeholder="请输入" value="' + escapeHtmlAttr(filterPhone) + '" style="width:200px;"></div>' +
            '<div class="filter-item"><label>角色：</label>' +
              '<select id="accountFilterRole" class="filter-select" style="width:160px;">' +
                '<option value="all"' + (filterRole === 'all' ? ' selected' : '') + '>请选择</option>' +
                '<option value="租户管理员"' + (filterRole === '租户管理员' ? ' selected' : '') + '>租户管理员</option>' +
                '<option value="租户运营"' + (filterRole === '租户运营' ? ' selected' : '') + '>租户运营</option>' +
                '<option value="普通坐席"' + (filterRole === '普通坐席' ? ' selected' : '') + '>普通坐席</option>' +
                '<option value="外呼专员"' + (filterRole === '外呼专员' ? ' selected' : '') + '>外呼专员</option>' +
                '<option value="财务审核员"' + (filterRole === '财务审核员' ? ' selected' : '') + '>财务审核员</option>' +
              '</select>' +
            '</div>' +
            '<div class="btn-group">' +
              '<button class="btn btn-default" onclick="window.Pages[\'sys-account\'].resetQuery()">重置</button>' +
              '<button class="btn btn-primary" onclick="window.Pages[\'sys-account\'].doQuery()">查询</button>' +
            '</div>' +
          '</div>' +
          // 数据表格卡片
          '<div class="account-table-card">' +
            '<div class="account-tools-bar">' +
              '<button class="btn btn-primary" onclick="window.Pages[\'sys-account\'].openCreateAccountModal()" style="height:32px;padding:0 14px;">+ 新建</button>' +
              '<span class="biz-icon-btn" onclick="window.Pages[\'sys-account\'].doRefresh()" title="刷新">&#x21bb;</span>' +
              '<span class="biz-icon-btn" onclick="showToast(\'设置功能开发中\',\'info\')" title="设置">&#x2699;</span>' +
            '</div>' +
            '<div style="overflow-x:auto;flex:1;">' +
              '<table class="account-native-table">' +
                '<thead><tr>' +
                  '<th>序号</th><th>账号昵称</th><th>账号</th><th>手机号码</th><th>角色</th><th>状态 ▾</th><th>更新人</th><th>更新时间</th><th>操作</th>' +
                '</tr></thead>' +
                '<tbody id="accountTableBody">' + renderAccountRows() + '</tbody>' +
              '</table>' +
            '</div>' +
            '<div class="tenant-pagination" id="accountPagination">第 1-' + filtered.length + ' 条/总共 ' + filtered.length + ' 条&nbsp;&nbsp; &lt; <span>1</span> &gt;</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function init() {}

  function selectTenant(tenantName) {
    selectedTenantName = tenantName;
    refreshView();
  }

  function doQuery() {
    var phoneInput = document.getElementById('accountFilterPhone');
    var roleSelect = document.getElementById('accountFilterRole');
    filterPhone = phoneInput ? phoneInput.value.trim() : '';
    filterRole = roleSelect ? roleSelect.value : 'all';
    refreshTable();
  }

  function resetQuery() {
    filterPhone = '';
    filterRole = 'all';
    var phoneInput = document.getElementById('accountFilterPhone');
    var roleSelect = document.getElementById('accountFilterRole');
    if (phoneInput) phoneInput.value = '';
    if (roleSelect) roleSelect.value = 'all';
    refreshTable();
  }

  function doRefresh() {
    refreshView();
    showToast('刷新成功', 'success');
  }

  function refreshView() {
    var container = document.getElementById('page-content');
    if (container) container.innerHTML = render();
  }

  function refreshTable() {
    var tbody = document.getElementById('accountTableBody');
    if (tbody) tbody.innerHTML = renderAccountRows();
    var pagination = document.getElementById('accountPagination');
    var filtered = getFilteredAccounts();
    if (pagination) pagination.innerHTML = '第 1-' + filtered.length + ' 条/总共 ' + filtered.length + ' 条&nbsp;&nbsp; &lt; <span>1</span> &gt;';
    var tenantPanel = document.getElementById('accountTenantPanel');
    if (tenantPanel) tenantPanel.innerHTML = renderTenantCards();
  }

  /* ===== 弹窗系统（100% 对齐截图） ===== */

  function openCreateAccountModal() {
    currentEditingAccountId = null;
    currentAvatarDataUrl = '';
    showAccountFormModal({
      title: '新增账号',
      tenantName: selectedTenantName,
      avatar: '',
      username: '',
      nickname: '',
      phone: '',
      password: '',
      role: '租户管理员',
      status: '启用'
    });
  }

  function openEditAccountModal(id) {
    var row = getAccounts().find(function (a) { return String(a.id) === String(id); });
    if (!row) {
      showToast('未找到该账号信息', 'error');
      return;
    }
    currentEditingAccountId = String(id);
    currentAvatarDataUrl = row.avatar || '';
    showAccountFormModal({
      title: '编辑账号',
      tenantName: row.tenantName,
      avatar: row.avatar || '',
      username: row.username,
      nickname: row.nickname,
      phone: row.phone,
      password: row.password || '',
      role: row.role || '租户管理员',
      status: row.status || '启用'
    });
  }

  function showAccountFormModal(data) {
    document.querySelectorAll('#accountFormModalBackdrop').forEach(function (el) { el.remove(); });

    var isEnabled = data.status === '启用';
    var isDisabled = data.status === '禁用';
    var isManager = data.role === '租户管理员';
    var isOperator = data.role === '租户运营' || data.role === '普通坐席' || data.role === '外呼专员';

    var avatarContent = data.avatar ?
      '<img src="' + escapeHtmlAttr(data.avatar) + '" class="account-avatar-img"><span class="account-avatar-remove" onclick="event.stopPropagation();window.Pages[\'sys-account\'].removeAvatar()">✕</span>' :
      '<span class="account-avatar-plus">+</span>';

    var nickLen = (data.nickname || '').length;
    var phoneLen = (data.phone || '').length;

    var html = '' +
      '<div class="modal-overlay" id="accountFormModalBackdrop" style="position:fixed;inset:0;z-index:5500;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);" onclick="window.Pages[\'sys-account\'].closeAccountFormModal(event)">' +
        '<div class="account-form-modal" id="accountFormModal" onclick="event.stopPropagation()">' +
          '<div class="account-form-modal-header">' +
            '<span class="account-form-modal-title" id="accountModalTitle">' + data.title + '</span>' +
            '<button class="account-form-modal-close" onclick="window.Pages[\'sys-account\'].closeAccountFormModal()">✕</button>' +
          '</div>' +
          '<div class="account-form-modal-body">' +
            // 1. 所属租户 (灰色不可编辑)
            '<div class="account-form-row">' +
              '<label class="account-form-label"><span class="required">*</span> 所属租户：</label>' +
              '<div class="account-form-control">' +
                '<input type="text" id="accountFormTenant" class="account-form-input" value="' + escapeHtmlAttr(data.tenantName) + '" disabled readonly>' +
              '</div>' +
            '</div>' +
            // 2. 头像 (80x80 虚线框)
            '<div class="account-form-row">' +
              '<label class="account-form-label"><span class="required">*</span> 头像：</label>' +
              '<div class="account-form-control">' +
                '<div class="account-avatar-uploader" id="accountAvatarUploader" onclick="window.Pages[\'sys-account\'].triggerAvatarUpload()">' +
                  avatarContent +
                '</div>' +
                '<input type="file" id="accountAvatarInput" accept="image/*" style="display:none;" onchange="window.Pages[\'sys-account\'].onAvatarSelected(event)">' +
                '<div class="account-form-error" id="accountAvatarError" style="display:none;"></div>' +
              '</div>' +
            '</div>' +
            // 3. 账号 (工号/编码)
            '<div class="account-form-row">' +
              '<label class="account-form-label"><span class="required">*</span> 账号：</label>' +
              '<div class="account-form-control">' +
                '<input type="text" id="accountFormUsername" class="account-form-input" placeholder="请输入账号" value="' + escapeHtmlAttr(data.username) + '">' +
                '<div class="account-helper-text">支持字母，符号，数字</div>' +
                '<div class="account-form-error" id="accountUsernameError" style="display:none;"></div>' +
              '</div>' +
            '</div>' +
            // 4. 账号昵称 (带 0/20 字数限制)
            '<div class="account-form-row">' +
              '<label class="account-form-label"><span class="required">*</span> 账号昵称：</label>' +
              '<div class="account-form-control">' +
                '<div class="account-input-with-count">' +
                  '<input type="text" id="accountFormNickname" placeholder="请输入账号昵称" maxlength="20" value="' + escapeHtmlAttr(data.nickname) + '" oninput="window.Pages[\'sys-account\'].onNicknameInput(event)">' +
                  '<span class="account-char-count" id="accountNicknameCount">' + nickLen + ' / 20</span>' +
                '</div>' +
                '<div class="account-helper-text">支持汉字，字母，符号，数字</div>' +
                '<div class="account-form-error" id="accountNicknameError" style="display:none;"></div>' +
              '</div>' +
            '</div>' +
            // 5. 手机号码 (带 0/11 字数限制)
            '<div class="account-form-row">' +
              '<label class="account-form-label"><span class="required">*</span> 手机号码：</label>' +
              '<div class="account-form-control">' +
                '<div class="account-input-with-count">' +
                  '<input type="text" id="accountFormPhone" placeholder="请输入手机号码" maxlength="11" value="' + escapeHtmlAttr(data.phone) + '" oninput="window.Pages[\'sys-account\'].onPhoneInput(event)">' +
                  '<span class="account-char-count" id="accountPhoneCount">' + phoneLen + ' / 11</span>' +
                '</div>' +
                '<div class="account-form-error" id="accountPhoneError" style="display:none;"></div>' +
              '</div>' +
            '</div>' +
            // 6. 登录密码 (带眼睛切换)
            '<div class="account-form-row">' +
              '<label class="account-form-label"><span class="required">*</span> 登录密码：</label>' +
              '<div class="account-form-control">' +
                '<div class="account-password-wrap">' +
                  '<input type="password" id="accountFormPassword" placeholder="............" value="' + escapeHtmlAttr(data.password) + '">' +
                  '<span class="account-pwd-toggle" id="accountPwdToggleBtn" onclick="window.Pages[\'sys-account\'].togglePasswordVisibility()" title="切换明密文">&#128065;</span>' +
                '</div>' +
                '<div class="account-helper-text">支持大小写字母，符号，数字，8~16 位</div>' +
                '<div class="account-form-error" id="accountPasswordError" style="display:none;"></div>' +
              '</div>' +
            '</div>' +
            // 7. 角色 (单选 Radio)
            '<div class="account-form-row">' +
              '<label class="account-form-label"><span class="required">*</span> 角色：</label>' +
              '<div class="account-form-control">' +
                '<div class="account-radio-group">' +
                  '<label class="account-radio-label"><input type="radio" name="accountFormRole" value="租户管理员"' + (isManager || !isOperator ? ' checked' : '') + '> 租户管理员</label>' +
                  '<label class="account-radio-label"><input type="radio" name="accountFormRole" value="租户运营"' + (isOperator && !isManager ? ' checked' : '') + '> 租户运营</label>' +
                '</div>' +
                '<div class="account-form-error" id="accountRoleError" style="display:none;"></div>' +
              '</div>' +
            '</div>' +
            // 8. 状态 (单选 Radio)
            '<div class="account-form-row">' +
              '<label class="account-form-label"><span class="required">*</span> 状态：</label>' +
              '<div class="account-form-control">' +
                '<div class="account-radio-group">' +
                  '<label class="account-radio-label"><input type="radio" name="accountFormStatus" value="禁用"' + (isDisabled ? ' checked' : '') + '> 禁用</label>' +
                  '<label class="account-radio-label"><input type="radio" name="accountFormStatus" value="启用"' + (isEnabled ? ' checked' : '') + '> 启用</label>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="account-form-modal-footer">' +
            '<button class="btn btn-default" onclick="window.Pages[\'sys-account\'].closeAccountFormModal()" style="height:32px;padding:0 16px;">取消</button>' +
            '<button class="btn btn-primary" onclick="window.Pages[\'sys-account\'].submitAccountFormModal()" style="height:32px;padding:0 16px;">确定</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.insertAdjacentHTML('beforeend', html);
    setTimeout(function () {
      var input = document.getElementById('accountFormUsername');
      if (input) input.focus();
    }, 50);
  }

  function closeAccountFormModal(e) {
    if (e && e.target !== e.currentTarget) return;
    var bd = document.getElementById('accountFormModalBackdrop');
    if (bd) bd.remove();
    currentEditingAccountId = null;
    currentAvatarDataUrl = '';
  }

  function onNicknameInput(e) {
    var val = e.target.value || '';
    var el = document.getElementById('accountNicknameCount');
    if (el) el.textContent = val.length + ' / 20';
    var err = document.getElementById('accountNicknameError');
    if (err && val) err.style.display = 'none';
  }

  function onPhoneInput(e) {
    var val = e.target.value || '';
    var el = document.getElementById('accountPhoneCount');
    if (el) el.textContent = val.length + ' / 11';
    var err = document.getElementById('accountPhoneError');
    if (err && val) err.style.display = 'none';
  }

  function togglePasswordVisibility() {
    var input = document.getElementById('accountFormPassword');
    var btn = document.getElementById('accountPwdToggleBtn');
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      if (btn) btn.innerHTML = '&#128064;'; // 睁眼
    } else {
      input.type = 'password';
      if (btn) btn.innerHTML = '&#128065;'; // 闭眼
    }
  }

  function triggerAvatarUpload() {
    var input = document.getElementById('accountAvatarInput');
    if (input) input.click();
  }

  function onAvatarSelected(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (evt) {
      currentAvatarDataUrl = evt.target.result;
      var box = document.getElementById('accountAvatarUploader');
      if (box) {
        box.innerHTML = '<img src="' + escapeHtmlAttr(currentAvatarDataUrl) + '" class="account-avatar-img"><span class="account-avatar-remove" onclick="event.stopPropagation();window.Pages[\'sys-account\'].removeAvatar()">✕</span>';
      }
      var err = document.getElementById('accountAvatarError');
      if (err) err.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  function removeAvatar() {
    currentAvatarDataUrl = '';
    var box = document.getElementById('accountAvatarUploader');
    if (box) box.innerHTML = '<span class="account-avatar-plus">+</span>';
    var input = document.getElementById('accountAvatarInput');
    if (input) input.value = '';
  }

  function submitAccountFormModal() {
    var usernameInput = document.getElementById('accountFormUsername');
    var nicknameInput = document.getElementById('accountFormNickname');
    var phoneInput = document.getElementById('accountFormPhone');
    var passwordInput = document.getElementById('accountFormPassword');
    var roleRadio = document.querySelector('input[name="accountFormRole"]:checked');
    var statusRadio = document.querySelector('input[name="accountFormStatus"]:checked');

    var nickErr = document.getElementById('accountNicknameError');
    var userErr = document.getElementById('accountUsernameError');
    var phoneErr = document.getElementById('accountPhoneError');
    var pwdErr = document.getElementById('accountPasswordError');

    var tenantName = selectedTenantName;
    var username = usernameInput ? usernameInput.value.trim() : '';
    var nickname = nicknameInput ? nicknameInput.value.trim() : '';
    var phone = phoneInput ? phoneInput.value.trim() : '';
    var password = passwordInput ? passwordInput.value.trim() : '';
    var role = roleRadio ? roleRadio.value : '租户管理员';
    var status = statusRadio ? statusRadio.value : '启用';

    if (userErr) userErr.style.display = 'none';
    if (nickErr) nickErr.style.display = 'none';
    if (phoneErr) phoneErr.style.display = 'none';
    if (pwdErr) pwdErr.style.display = 'none';

    if (!username) {
      if (userErr) { userErr.textContent = '请输入账号'; userErr.style.display = 'block'; }
      if (usernameInput) usernameInput.focus();
      return;
    }
    if (!nickname) {
      if (nickErr) { nickErr.textContent = '请输入账号昵称'; nickErr.style.display = 'block'; }
      if (nicknameInput) nicknameInput.focus();
      return;
    }
    if (!phone) {
      if (phoneErr) { phoneErr.textContent = '请输入手机号码'; phoneErr.style.display = 'block'; }
      if (phoneInput) phoneInput.focus();
      return;
    }
    if (!/^1\d{10}$/.test(phone)) {
      if (phoneErr) { phoneErr.textContent = '请输入正确的11位手机号码'; phoneErr.style.display = 'block'; }
      if (phoneInput) phoneInput.focus();
      return;
    }

    // 账号唯一性校验
    var isDuplicateUser = getAccounts().some(function (a) {
      if (currentEditingAccountId && String(a.id) === String(currentEditingAccountId)) return false;
      return a.username === username;
    });
    if (isDuplicateUser) {
      if (userErr) { userErr.textContent = '账号已存在，请重新输入'; userErr.style.display = 'block'; }
      if (usernameInput) usernameInput.focus();
      return;
    }

    var nowStr = formatCurrentDateTime();

    if (currentEditingAccountId) {
      var row = getAccounts().find(function (a) { return String(a.id) === String(currentEditingAccountId); });
      if (row) {
        row.tenantName = tenantName;
        row.avatar = currentAvatarDataUrl || row.avatar;
        row.username = username;
        row.nickname = nickname;
        row.phone = phone;
        if (password) row.password = password;
        row.role = role;
        row.status = status;
        row.updater = 'xtadmin';
        row.updateTime = nowStr;
      }
      closeAccountFormModal();
      refreshTable();
      showToast('账号信息已更新', 'success');
    } else {
      var maxId = getAccounts().reduce(function (max, a) { return Math.max(max, Number(a.id) || 0); }, 0);
      var newAccount = {
        id: maxId + 1,
        tenantName: tenantName,
        avatar: currentAvatarDataUrl,
        nickname: nickname,
        username: username,
        phone: phone,
        password: password || '123456Aa@',
        role: role,
        status: status,
        updater: 'xtadmin',
        updateTime: nowStr
      };
      getAccounts().unshift(newAccount);
      closeAccountFormModal();
      refreshTable();
      showToast('新增账号成功', 'success');
    }
  }

  function deleteAccount(id) {
    var row = getAccounts().find(function (a) { return String(a.id) === String(id); });
    if (!row) {
      showToast('未找到该账号', 'error');
      return;
    }
    if (confirm('确认删除账号【' + row.nickname + '（' + row.username + '）】？此操作不可恢复。')) {
      window.MockAccountRows = getAccounts().filter(function (a) { return String(a.id) !== String(id); });
      refreshTable();
      showToast('账号已删除', 'success');
    }
  }

  function escapeHtmlAttr(str) {
    return String(str == null ? '' : str).replace(/"/g, '&quot;');
  }

  function escapeHtmlText(str) {
    return String(str == null ? '' : str).replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

  return {
    render: render,
    init: init,
    selectTenant: selectTenant,
    doQuery: doQuery,
    resetQuery: resetQuery,
    doRefresh: doRefresh,
    openCreateAccountModal: openCreateAccountModal,
    openEditAccountModal: openEditAccountModal,
    closeAccountFormModal: closeAccountFormModal,
    onNicknameInput: onNicknameInput,
    onPhoneInput: onPhoneInput,
    togglePasswordVisibility: togglePasswordVisibility,
    triggerAvatarUpload: triggerAvatarUpload,
    onAvatarSelected: onAvatarSelected,
    removeAvatar: removeAvatar,
    submitAccountFormModal: submitAccountFormModal,
    deleteAccount: deleteAccount
  };
})();
