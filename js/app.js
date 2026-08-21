/**
 * 全局公共函数 - app.js
 */
(function() {
  'use strict';

  /* ===== 全局当前登录用户信息 ===== */
  var defaultAvatarSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='150' viewBox='0 0 120 150'><rect width='120' height='150' fill='%23c9151e'/><circle cx='60' cy='60' r='38' fill='%23e60012' stroke='%23ffd700' stroke-width='2'/><text x='60' y='66' font-size='22' text-anchor='middle' fill='%23ffd700' font-family='sans-serif' font-weight='bold'>福</text><path d='M25 118 L45 110 L75 110 L95 118 L90 128 L30 128 Z' fill='%231677ff'/><circle cx='40' cy='128' r='5' fill='%23333'/><circle cx='80' cy='128' r='5' fill='%23333'/><text x='60' y='144' font-size='8' text-anchor='middle' fill='%23fff'>东风日产</text></svg>";

  var CurrentUser = {
    avatar: defaultAvatarSvg,
    username: 'super-product',
    nickname: '产品-超管',
    phone: '15975585393',
    password: '',
    tenantRole: '超级管理组-超级管理员'
  };

  /* ===== 公共工具函数 ===== */
  function formatNumber(num) {
    return num ? num.toLocaleString() : '0';
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    var d = new Date(dateStr);
    var year = d.getFullYear();
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function formatDateTime(date) {
    var d = date || new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    var h = String(d.getHours()).padStart(2, '0');
    var min = String(d.getMinutes()).padStart(2, '0');
    var s = String(d.getSeconds()).padStart(2, '0');
    return y + '-' + m + '-' + day + ' ' + h + ':' + min + ':' + s;
  }

  /* ===== 右上角用户下拉菜单与设置功能 ===== */
  function toggleUserMenu(e) {
    if (e) e.stopPropagation();
    var menu = document.getElementById('userDropdownMenu');
    var trigger = document.getElementById('userRoleTrigger');
    if (!menu) return;
    var isOpen = menu.classList.contains('open');
    if (isOpen) {
      menu.classList.remove('open');
      if (trigger) trigger.classList.remove('active');
    } else {
      menu.classList.add('open');
      if (trigger) trigger.classList.add('active');
    }
  }

  function closeUserMenu() {
    var menu = document.getElementById('userDropdownMenu');
    var trigger = document.getElementById('userRoleTrigger');
    if (menu) menu.classList.remove('open');
    if (trigger) trigger.classList.remove('active');
  }

  /* ===== 账号信息弹窗（100% 对齐截图） ===== */
  function showAccountInfoModal() {
    closeUserMenu();
    closeAccountInfoModal();

    var nickLen = CurrentUser.nickname.length;
    var phoneLen = CurrentUser.phone.length;

    var html = '' +
      '<div class="modal-overlay" id="accountInfoModalBackdrop" style="position:fixed;inset:0;z-index:6000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);" onclick="window.closeAccountInfoModal(event)">' +
        '<div class="account-info-modal" onclick="event.stopPropagation()">' +
          '<div class="account-form-modal-header">' +
            '<span class="account-form-modal-title">账号信息</span>' +
            '<button class="account-form-modal-close" onclick="window.closeAccountInfoModal()">✕</button>' +
          '</div>' +
          '<div class="account-form-modal-body">' +
            // 1. 头像
            '<div class="account-form-row">' +
              '<label class="account-form-label"><span class="required">*</span> 头像：</label>' +
              '<div class="account-form-control">' +
                '<div class="account-info-avatar-box" id="accountInfoAvatarBox" onclick="window.triggerAccountInfoAvatar()" title="点击更换头像">' +
                  '<img src="' + CurrentUser.avatar + '" class="account-info-avatar-img" id="accountInfoAvatarImg">' +
                  '<div class="account-info-avatar-tip">更换</div>' +
                '</div>' +
                '<input type="file" id="accountInfoAvatarFile" accept="image/*" style="display:none;" onchange="window.onAccountInfoAvatarChange(event)">' +
              '</div>' +
            '</div>' +
            // 2. 账号 (只读禁用)
            '<div class="account-form-row">' +
              '<label class="account-form-label"><span class="required">*</span> 账号：</label>' +
              '<div class="account-form-control">' +
                '<input type="text" class="account-form-input" value="' + CurrentUser.username + '" disabled readonly>' +
                '<div class="account-helper-text">支持字母，符号，数字</div>' +
              '</div>' +
            '</div>' +
            // 3. 账号昵称 (可编辑 + 实时字数)
            '<div class="account-form-row">' +
              '<label class="account-form-label"><span class="required">*</span> 账号昵称：</label>' +
              '<div class="account-form-control">' +
                '<div class="account-input-with-count">' +
                  '<input type="text" id="accountInfoNicknameInput" class="account-form-input" value="' + CurrentUser.nickname + '" maxlength="20" oninput="window.onAccountInfoNicknameInput(event)">' +
                  '<span class="account-char-count" id="accountInfoNickCount">' + nickLen + ' / 20</span>' +
                '</div>' +
                '<div class="account-helper-text">支持汉字，字母，符号，数字</div>' +
                '<div class="account-form-error" id="accountInfoNickError" style="display:none;"></div>' +
              '</div>' +
            '</div>' +
            // 4. 手机号码 (只读/编辑组合)
            '<div class="account-form-row">' +
              '<label class="account-form-label"><span class="required">*</span> 手机号码：</label>' +
              '<div class="account-form-control">' +
                '<div class="account-input-with-action">' +
                  '<input type="text" id="accountInfoPhoneInput" class="account-form-input" value="' + CurrentUser.phone + '" maxlength="11" disabled oninput="window.onAccountInfoPhoneInput(event)">' +
                  '<div class="account-input-actions">' +
                    '<span class="account-input-action-count" id="accountInfoPhoneCount">' + phoneLen + ' / 11</span>' +
                    '<button class="account-input-action-btn" onclick="window.enableEditAccountPhone()" title="修改手机号码">&#x1F4DD;</button>' +
                  '</div>' +
                '</div>' +
                '<div class="account-form-error" id="accountInfoPhoneError" style="display:none;"></div>' +
              '</div>' +
            '</div>' +
            // 5. 登录密码 (只读/编辑组合)
            '<div class="account-form-row">' +
              '<label class="account-form-label"><span class="required">*</span> 登录密码：</label>' +
              '<div class="account-form-control">' +
                '<div class="account-input-with-action">' +
                  '<input type="password" id="accountInfoPwdInput" class="account-form-input" value="............" disabled>' +
                  '<div class="account-input-actions">' +
                    '<button class="account-input-action-btn" onclick="window.openChangePasswordDialog()" title="修改登录密码">&#x1F4DD;</button>' +
                  '</div>' +
                '</div>' +
                '<div class="account-helper-text">支持大小写字母，符号，数字，8~16 位</div>' +
              '</div>' +
            '</div>' +
            // 6. 租户-角色 (静态文本)
            '<div class="account-form-row">' +
              '<label class="account-form-label"><span class="required">*</span> 租户-角色：</label>' +
              '<div class="account-form-control">' +
                '<div class="account-static-text">' + CurrentUser.tenantRole + '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="account-form-modal-footer">' +
            '<button class="btn btn-default" onclick="window.closeAccountInfoModal()" style="height:32px;padding:0 16px;">取消</button>' +
            '<button class="btn btn-primary" onclick="window.submitAccountInfoModal()" style="height:32px;padding:0 16px;">确定</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.insertAdjacentHTML('beforeend', html);
    setTimeout(function() {
      var input = document.getElementById('accountInfoNicknameInput');
      if (input) input.focus();
    }, 50);
  }

  function closeAccountInfoModal(e) {
    if (e && e.target !== e.currentTarget) return;
    var bd = document.getElementById('accountInfoModalBackdrop');
    if (bd) bd.remove();
  }

  function onAccountInfoNicknameInput(e) {
    var val = e.target.value || '';
    var el = document.getElementById('accountInfoNickCount');
    if (el) el.textContent = val.length + ' / 20';
    var err = document.getElementById('accountInfoNickError');
    if (err && val) err.style.display = 'none';
  }

  function onAccountInfoPhoneInput(e) {
    var val = e.target.value || '';
    var el = document.getElementById('accountInfoPhoneCount');
    if (el) el.textContent = val.length + ' / 11';
    var err = document.getElementById('accountInfoPhoneError');
    if (err && val) err.style.display = 'none';
  }

  function triggerAccountInfoAvatar() {
    var input = document.getElementById('accountInfoAvatarFile');
    if (input) input.click();
  }

  function onAccountInfoAvatarChange(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(evt) {
      CurrentUser.avatar = evt.target.result;
      var img = document.getElementById('accountInfoAvatarImg');
      if (img) img.src = CurrentUser.avatar;
      if (window.showToast) window.showToast('头像已更新', 'success');
    };
    reader.readAsDataURL(file);
  }

  function enableEditAccountPhone() {
    var input = document.getElementById('accountInfoPhoneInput');
    if (input) {
      input.disabled = false;
      input.focus();
      if (window.showToast) window.showToast('请直接输入新手机号码', 'info');
    }
  }

  function openChangePasswordDialog() {
    var newPwd = prompt('请输入新登录密码（支持大小写字母、数字、符号，8~16位）：');
    if (newPwd === null) return;
    if (newPwd.length < 8 || newPwd.length > 16) {
      alert('密码长度必须为 8~16 位！');
      return;
    }
    CurrentUser.password = newPwd;
    if (window.showToast) window.showToast('密码修改成功', 'success');
  }

  function submitAccountInfoModal() {
    var nickInput = document.getElementById('accountInfoNicknameInput');
    var phoneInput = document.getElementById('accountInfoPhoneInput');
    var nickErr = document.getElementById('accountInfoNickError');
    var phoneErr = document.getElementById('accountInfoPhoneError');

    var newNick = nickInput ? nickInput.value.trim() : '';
    var newPhone = phoneInput ? phoneInput.value.trim() : '';

    if (!newNick) {
      if (nickErr) { nickErr.textContent = '请输入账号昵称'; nickErr.style.display = 'block'; }
      if (nickInput) nickInput.focus();
      return;
    }

    if (newPhone && !/^1\d{10}$/.test(newPhone)) {
      if (phoneErr) { phoneErr.textContent = '请输入正确的11位手机号码'; phoneErr.style.display = 'block'; }
      if (phoneInput) phoneInput.focus();
      return;
    }

    CurrentUser.nickname = newNick;
    if (newPhone) CurrentUser.phone = newPhone;

    // 同步更新顶部导航栏用户名称展示
    var headerUserName = document.querySelector('#userRoleTrigger .user-name');
    if (headerUserName) headerUserName.textContent = newNick;

    closeAccountInfoModal();
    if (window.showToast) window.showToast('账号信息修改成功', 'success');
  }

  function doLogout() {
    closeUserMenu();
    if (confirm('确认退出登录智能外呼中台？')) {
      showLoginPage();
      if (window.showToast) window.showToast('已安全退出登录', 'info');
    }
  }

  /* ===== 全屏登录页逻辑（无需校验，直接登录进入首页） ===== */
  function showLoginPage() {
    var overlay = document.getElementById('loginOverlay');
    if (overlay) {
      overlay.style.display = 'flex';
      setTimeout(drawCaptchaCanvas, 50);
    }
  }

  function hideLoginPage() {
    var overlay = document.getElementById('loginOverlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  function switchLoginTab(type) {
    var tabPwd = document.getElementById('loginTabPwd');
    var tabPhone = document.getElementById('loginTabPhone');
    var formPwd = document.getElementById('loginFormPwd');
    var formPhone = document.getElementById('loginFormPhone');

    if (type === 'pwd') {
      if (tabPwd) tabPwd.classList.add('active');
      if (tabPhone) tabPhone.classList.remove('active');
      if (formPwd) formPwd.style.display = 'block';
      if (formPhone) formPhone.style.display = 'none';
    } else {
      if (tabPwd) tabPwd.classList.remove('active');
      if (tabPhone) tabPhone.classList.add('active');
      if (formPwd) formPwd.style.display = 'none';
      if (formPhone) formPhone.style.display = 'block';
    }
  }

  function drawCaptchaCanvas() {
    var canvas = document.getElementById('loginCaptchaCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var chars = ['a', '8', 'C', 'q'];
    var colors = ['#389e0d', '#1677ff', '#722ed1', '#d4380d'];

    ctx.font = 'bold 22px "Courier New", monospace';
    for (var i = 0; i < chars.length; i++) {
      ctx.save();
      ctx.fillStyle = colors[i % colors.length];
      var x = 14 + i * 22;
      var y = 26 + (Math.random() * 4 - 2);
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.25);
      ctx.fillText(chars[i], 0, 0);
      ctx.restore();
    }

    // 绘制微干扰线条与噪点
    for (var j = 0; j < 3; j++) {
      ctx.strokeStyle = 'rgba(22,119,255,0.25)';
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
  }

  function doLoginSubmit() {
    hideLoginPage();
    if (window.Nav && window.Nav.init) {
      window.Nav.init();
    }
    if (window.showToast) {
      window.showToast('登录成功，欢迎来到智能外呼中台！', 'success');
    }
  }

  // 点击页面外部区域关闭用户菜单
  document.addEventListener('click', function(e) {
    var wrap = document.getElementById('userDropdownWrap');
    if (wrap && !wrap.contains(e.target)) {
      closeUserMenu();
    }
  });

  window.formatNumber = formatNumber;
  window.formatDate = formatDate;
  window.formatDateTime = formatDateTime;
  window.toggleUserMenu = toggleUserMenu;
  window.closeUserMenu = closeUserMenu;
  window.showAccountInfoModal = showAccountInfoModal;
  window.closeAccountInfoModal = closeAccountInfoModal;
  window.onAccountInfoNicknameInput = onAccountInfoNicknameInput;
  window.onAccountInfoPhoneInput = onAccountInfoPhoneInput;
  window.triggerAccountInfoAvatar = triggerAccountInfoAvatar;
  window.onAccountInfoAvatarChange = onAccountInfoAvatarChange;
  window.enableEditAccountPhone = enableEditAccountPhone;
  window.openChangePasswordDialog = openChangePasswordDialog;
  window.submitAccountInfoModal = submitAccountInfoModal;
  window.doLogout = doLogout;
  window.showLoginPage = showLoginPage;
  window.hideLoginPage = hideLoginPage;
  window.switchLoginTab = switchLoginTab;
  window.drawCaptchaCanvas = drawCaptchaCanvas;
  window.doLoginSubmit = doLoginSubmit;

})();

