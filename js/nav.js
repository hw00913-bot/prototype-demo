/**
 * js/nav.js — 统一导航路由 + 面包屑 + 菜单交互
 * 以中科金接入 demo 为底座，合并各版本菜单。
 */
(function () {
  'use strict';

  var RouteMap = {
    'nav-home':     { page: 'home', bc: [] },
    'nav-scene':    { page: null, bc: [] },
    'scene-list':   { page: 'scene-list', bc: [{ label: '外呼场景', link: 'nav-scene' }, '外呼列表'] },
    'scene-block':  { page: 'scene-block', bc: [{ label: '外呼场景', link: 'nav-scene' }, '外呼拦截'] },
    'nav-report':   { page: null, bc: [] },
    'report-call':  { page: 'report-call', bc: [{ label: '统计分析', link: 'nav-report' }, '通话统计'] },
    'report-billing': { page: 'report-billing', bc: [{ label: '统计分析', link: 'nav-report' }, '计费统计'] },
    'report-clue':  { page: 'report-clue', bc: [{ label: '统计分析', link: 'nav-report' }, '线索统计'] },
    'nav-result':   { page: null, bc: [] },
    'result-records': { page: 'result-records', bc: [{ label: '外呼结果', link: 'nav-result' }, '通话记录'] },
    'result-clue':  { page: 'result-clue', bc: [{ label: '外呼结果', link: 'nav-result' }, '线索记录'] },
    'nav-system':   { page: null, bc: [] },
    'sys-account':  { page: 'sys-account', bc: [{ label: '系统管理', link: 'nav-system' }, '账号管理'] },
    'sys-tenant':   { page: 'sys-tenant', bc: [{ label: '系统管理', link: 'nav-system' }, '租户管理'] },
    'sys-channel':  { page: 'sys-channel', bc: [{ label: '系统管理', link: 'nav-system' }, '通道管理'] },
    'sys-scene':    { page: 'sys-scene', bc: [{ label: '系统管理', link: 'nav-system' }, '业务场景'] },
    'sys-tags':     { page: 'sys-tags', bc: [{ label: '系统管理', link: 'nav-system' }, '标签管理'] }
  };

  var PlaceholderNames = {
    'sys-account': '账号管理',
    'sys-channel': '通道管理'
  };

  /* 未实现模块占位 */
  Object.keys(PlaceholderNames).forEach(function (key) {
    window.Pages = window.Pages || {};
    if (!window.Pages[key]) {
      window.Pages[key] = {
        render: function () {
          return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;color:#999;">' +
            '<div style="font-size:48px;opacity:.5">🚧</div>' +
            '<div style="font-size:16px;font-weight:500">「' + PlaceholderNames[key] + '」功能正在开发中</div>' +
            '<div style="font-size:13px;color:#bbb">请查看已完成的「外呼列表」等模块</div>' +
            '</div>';
        },
        init: function () {}
      };
    }
  });

  function closeOpenOverlays() {
    // 清理所有已挂载的遮罩/抽屉/弹窗，避免跨页面残留
    var selectors = [
      '.scene-detail-backdrop', '.import-modal-backdrop', '.billing-detail-backdrop',
      '.billing-call-backdrop', '.biz-drawer-backdrop', '.biz-dialog-backdrop',
      '.record-detail-backdrop', '.scene-more-menu', '.block-modal-mask',
      '.intent-config-backdrop', '#clueDetailBackdrop', '#clueTagBackdrop',
      '#singleDetailBackdrop', '#clueReportDetailBackdrop'
    ];
    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) { el.remove(); });
    });
    document.body.style.overflow = '';
  }

  function navigateTo(pageKey, navId) {
    var module = window.Pages[pageKey];
    var container = document.getElementById('page-content');
    if (!container) return;
    closeOpenOverlays();

    if (module && module.render) {
      container.innerHTML = module.render();
      if (module.init) setTimeout(function () { module.init(); }, 0);
    } else {
      container.innerHTML = '<div style="padding:40px;color:#999;text-align:center">页面加载失败: ' + pageKey + '</div>';
    }

    updateBreadcrumb(navId);
    highlightNav(navId);
  }

  function updateBreadcrumb(navId) {
    var route = RouteMap[navId];
    var bcEl = document.getElementById('breadcrumb');
    if (!bcEl || !route) return;

    var items = [];
    route.bc.forEach(function (item, idx) {
      if (idx > 0) items.push('<span class="bc-sep">/</span>');
      if (typeof item === 'string') {
        items.push('<span class="bc-current">' + item + '</span>');
      } else {
        items.push('<span class="bc-link" onclick="window.Nav.navigateTo(\'' + RouteMap[item.link].page + '\',\'' + item.link + '\')">' + item.label + '</span>');
      }
    });

    bcEl.innerHTML = items.join('') || '<span class="bc-current">首页</span>';
  }

  function highlightNav(navId) {
    if (!navId) return;
    document.querySelectorAll('.nav-sub-item').forEach(function (item) { item.classList.remove('active'); });
    document.querySelectorAll('.nav-item').forEach(function (item) { item.classList.remove('active', 'active-parent'); });

    if (navId === 'nav-home') {
      var home = document.getElementById('nav-home');
      if (home) home.classList.add('active');
      return;
    }
    var subItem = document.getElementById(navId);
    if (subItem) {
      subItem.classList.add('active');
      var sub = subItem.closest('.nav-sub');
      if (sub) {
        var parentId = sub.id.replace('sub-', 'nav-');
        var parent = document.getElementById(parentId);
        if (parent) parent.classList.add('active-parent');
      }
    }
  }

  function toggleMenu(el, key) {
    var sub = document.getElementById('sub-' + key);
    if (!sub) return;
    var isOpen = sub.classList.contains('open');

    document.querySelectorAll('.nav-sub').forEach(function (s) {
      if (s !== sub) {
        s.classList.remove('open');
        var parentId = s.id.replace('sub-', 'nav-');
        var p = document.getElementById(parentId);
        if (p) p.classList.remove('open', 'active-parent');
      }
    });

    if (isOpen) {
      sub.classList.remove('open');
      el.classList.remove('open', 'active-parent');
    } else {
      sub.classList.add('open');
      el.classList.add('open', 'active-parent');
    }
  }

  function setActive(el) {
    document.querySelectorAll('.nav-item').forEach(function (i) { i.classList.remove('active', 'active-parent', 'open'); });
    document.querySelectorAll('.nav-sub-item').forEach(function (i) { i.classList.remove('active'); });
    document.querySelectorAll('.nav-sub').forEach(function (s) { s.classList.remove('open'); });
    el.classList.add('active');
    navigateTo('home', 'nav-home');
    if (window.showToast) showToast('欢迎来到智能外呼中台！', 'success');
  }

  function selectSubMenu(el, menuName) {
    document.querySelectorAll('.nav-sub-item').forEach(function (item) { item.classList.remove('active'); });
    document.querySelectorAll('.nav-item').forEach(function (item) { item.classList.remove('active', 'active-parent'); });

    el.classList.add('active');
    var sub = el.closest('.nav-sub');
    if (sub) {
      var parentId = sub.id.replace('sub-', 'nav-');
      var parent = document.getElementById(parentId);
      if (parent) parent.classList.add('active-parent');
    }

    var navId = el.id || findNavIdByText(menuName);
    if (navId && RouteMap[navId]) {
      navigateTo(RouteMap[navId].page, navId);
    } else {
      showToast('「' + menuName + '」功能正在开发中', 'info');
    }
  }

  function findNavIdByText(text) {
    var map = {
      '外呼列表': 'scene-list', '外呼拦截': 'scene-block',
      '通话统计': 'report-call', '计费统计': 'report-billing', '线索统计': 'report-clue',
      '通话记录': 'result-records', '线索记录': 'result-clue',
      '账号管理': 'sys-account', '租户管理': 'sys-tenant',
      '通道管理': 'sys-channel', '业务场景': 'sys-scene', '标签管理': 'sys-tags'
    };
    return map[text];
  }

  function init() {
    // 默认高亮首页并进入首页
    var navHome = document.getElementById('nav-home');
    if (navHome) {
      document.querySelectorAll('.nav-item').forEach(function (i) { i.classList.remove('active', 'active-parent', 'open'); });
      document.querySelectorAll('.nav-sub-item').forEach(function (i) { i.classList.remove('active'); });
      document.querySelectorAll('.nav-sub').forEach(function (s) { s.classList.remove('open'); });
      navHome.classList.add('active');
    }
    navigateTo('home', 'nav-home');
  }

  window.Nav = {
    navigateTo: navigateTo,
    toggleMenu: toggleMenu,
    setActive: setActive,
    selectSubMenu: selectSubMenu,
    init: init
  };

  document.addEventListener('DOMContentLoaded', init);
})();
