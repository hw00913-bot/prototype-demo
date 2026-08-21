(function () {
  'use strict';

  var visible = true;
  var activePopup = null;
  var currentAnno = null;
  var dragState = null;
  var markerDragState = null;
  var observer = null;

  var sectionFields = [
    ['functionName', '功能名称'],
    ['functionDesc', '功能说明'],
    ['permissionScope', '权限范围'],
    ['dataSource', '数据来源'],
    ['valueLogic', '取值逻辑'],
    ['fieldDesc', '字段说明'],
    ['interactionDesc', '交互说明'],
    ['judgeRule', '判断规则'],
    ['exceptionRule', '异常规则'],
    ['otherDesc', '其他说明']
  ];

  function getConfig() {
    return window.AnnotationConfig || {};
  }

  function getPageKey() {
    var cfg = getConfig();
    if (typeof cfg.page === 'function') return cfg.page();
    if (cfg.page) return cfg.page;
    var active = document.querySelector('.nav-sub-item.active');
    return active && active.id ? active.id : 'index';
  }

  function getRawAnnotations() {
    var cfg = getConfig();
    var page = getPageKey();
    if (cfg.dataKey && Array.isArray(window[cfg.dataKey])) {
      return window[cfg.dataKey].filter(function (item) { return item.page === page; });
    }
    if (window.AnnotationData && Array.isArray(window.AnnotationData[page])) {
      return window.AnnotationData[page];
    }
    return [];
  }

  function storageKey() {
    var cfg = getConfig();
    var projectId = cfg.projectId || window.location.pathname || 'default-project';
    var dataVersion = cfg.dataVersion || '1';
    return ['prototype_annotations', projectId, dataVersion, getPageKey()].join('_');
  }

  function loadCached() {
    try {
      var raw = window.localStorage.getItem(storageKey());
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  function saveCached(items) {
    try {
      window.localStorage.setItem(storageKey(), JSON.stringify(items));
    } catch (err) {
      showToast('保存到浏览器缓存失败');
    }
  }

  function getAnnotations() {
    var source = getRawAnnotations();
    if (!source.length) return [];
    var cached = loadCached();
    var cachedMap = {};
    cached.forEach(function (item) {
      if (item && item.id != null) cachedMap[item.id] = item;
    });
    return source.map(function (item) {
      var cachedItem = cachedMap[item.id];
      if (item.revision && (!cachedItem || cachedItem.revision !== item.revision)) {
        return clone(item);
      }
      return clone(cachedItem || item);
    }).sort(function (a, b) {
      return Number(a.id) - Number(b.id);
    });
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value || {}));
  }

  function ensureToggle() {
    var buttons = document.querySelectorAll('#anno-toggle-btn');
    buttons.forEach(function (btn, index) {
      if (index > 0) btn.remove();
    });
    var btn = document.getElementById('anno-toggle-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'anno-toggle-btn';
      btn.type = 'button';
      btn.title = '显示/隐藏标注';
      btn.textContent = '●';
      btn.addEventListener('click', function () {
        visible = !visible;
        btn.classList.toggle('anno-hidden', !visible);
        closePopup();
        render();
      });
      document.body.appendChild(btn);
    }
    placeToggle(btn);
  }

  function placeToggle(btn) {
    var topBar = document.querySelector('.top-bar');
    var sideMenu = document.querySelector('.side-menu, .sidebar, .nav-panel');
    var top = topBar ? topBar.getBoundingClientRect().bottom + 12 : 16;
    var left = sideMenu ? sideMenu.getBoundingClientRect().right + 16 : 16;
    btn.style.top = Math.max(16, top) + 'px';
    btn.style.left = Math.max(16, left) + 'px';
  }

  function ensureOverlay() {
    var overlay = document.getElementById('anno-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'anno-overlay';
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  function render() {
    ensureToggle();
    var overlay = ensureOverlay();
    overlay.innerHTML = '';
    if (!visible) return;
    getAnnotations().forEach(function (anno, index) {
      var target = resolveTarget(anno.target);
      if (!target) return;
      var marker = document.createElement('button');
      marker.type = 'button';
      marker.className = 'anno-marker';
      marker.textContent = anno.id || String(index + 1);
      marker.title = anno.title || '';
      marker.addEventListener('click', function (event) {
        if (marker._dragged) { marker._dragged = false; return; }
        event.stopPropagation();
        openPopup(anno, marker);
      });
      marker.addEventListener('mousedown', function (event) {
        if (event.button !== 0) return;
        var startX = event.clientX;
        var startY = event.clientY;
        var origLeft = marker.offsetLeft;
        var origTop = marker.offsetTop;
        marker._dragged = false;
        markerDragState = { marker: marker, anno: anno, target: target, startX: startX, startY: startY, origLeft: origLeft, origTop: origTop };
        event.preventDefault();
        event.stopPropagation();
      });
      overlay.appendChild(marker);
      positionMarker(marker, target, anno.position);
    });
  }

  function resolveTarget(selector) {
    if (!selector) return null;
    try {
      var nodes = document.querySelectorAll(selector);
      return nodes.length === 1 ? nodes[0] : null;
    } catch (err) {
      return null;
    }
  }

  function positionMarker(marker, target, position) {
    var rect = target.getBoundingClientRect();
    var pos = position || {};
    var placement = pos.placement || 'top-right';
    var x = rect.right;
    var y = rect.top;
    if (placement.indexOf('left') >= 0) x = rect.left;
    if (placement.indexOf('bottom') >= 0) y = rect.bottom;
    if (placement.indexOf('center') >= 0) y = rect.top + rect.height / 2;
    marker.style.left = Math.round(x + Number(pos.offsetX || 0) - 10) + 'px';
    marker.style.top = Math.round(y + Number(pos.offsetY || 0) - 10) + 'px';
  }

  function openPopup(anno, marker) {
    closePopup();
    currentAnno = clone(anno);
    currentAnno.desc = currentAnno.desc || generateDesc(currentAnno.sections);
    activePopup = document.createElement('div');
    activePopup.className = 'anno-popup';
    activePopup.innerHTML = buildViewHTML(currentAnno);
    document.body.appendChild(activePopup);
    positionPopup(activePopup, marker);
    bindViewEvents();
    bindDrag();
  }

  function positionPopup(popup, marker) {
    var rect = marker.getBoundingClientRect();
    var popupWidth = popup.offsetWidth;
    var popupHeight = popup.offsetHeight;
    var left = rect.right + 12;
    var top = rect.top;
    if (left + popupWidth > window.innerWidth - 16) {
      left = rect.left - popupWidth - 12;
    }
    left = Math.max(16, Math.min(left, window.innerWidth - popupWidth - 16));
    top = Math.max(16, Math.min(top, window.innerHeight - popupHeight - 16));
    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
  }

  function fitPopupToViewport(popup) {
    if (!popup) return;
    var rect = popup.getBoundingClientRect();
    var left = Math.max(16, Math.min(rect.left, window.innerWidth - rect.width - 16));
    var top = Math.max(16, Math.min(rect.top, window.innerHeight - rect.height - 16));
    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
  }

  function buildViewHTML(anno) {
    return ''
      + '<div class="anno-popup-header">'
      + '  <div class="anno-popup-title">' + escapeHTML(anno.title || '未命名标注') + '</div>'
      + '  <button class="anno-popup-close" type="button" title="关闭">&times;</button>'
      + '</div>'
      + '<div class="anno-popup-body"><div class="anno-popup-desc">' + (anno.desc || generateDesc(anno.sections)) + '</div></div>'
      + '<div class="anno-popup-footer">'
      + '  <button class="anno-btn anno-copy" type="button">复制数据</button>'
      + '  <button class="anno-btn anno-btn-primary anno-edit" type="button">编辑</button>'
      + '</div>';
  }

  function buildEditHTML(anno) {
    var sections = anno.sections || {};
    var fields = sectionFields.map(function (field) {
      return ''
        + '<div class="anno-edit-field">'
        + '  <label class="anno-edit-label">' + field[1] + '</label>'
        + '  <textarea class="anno-edit-textarea" data-section="' + field[0] + '">' + escapeHTML(sections[field[0]] || '') + '</textarea>'
        + '</div>';
    }).join('');
    return ''
      + '<div class="anno-popup-header">'
      + '  <div class="anno-popup-title">编辑标注</div>'
      + '  <button class="anno-popup-close" type="button" title="关闭">&times;</button>'
      + '</div>'
      + '<div class="anno-popup-body">'
      + '  <div class="anno-edit-field">'
      + '    <label class="anno-edit-label">标注标题</label>'
      + '    <input class="anno-edit-input" id="anno-edit-title" value="' + escapeHTML(anno.title || '') + '">'
      + '  </div>'
      + fields
      + '</div>'
      + '<div class="anno-popup-footer">'
      + '  <button class="anno-btn anno-cancel" type="button">取消</button>'
      + '  <button class="anno-btn anno-copy" type="button">复制数据</button>'
      + '  <button class="anno-btn anno-btn-primary anno-save" type="button">保存</button>'
      + '</div>';
  }

  function bindViewEvents() {
    activePopup.querySelector('.anno-popup-close').addEventListener('click', closePopup);
    activePopup.querySelector('.anno-copy').addEventListener('click', copyCurrent);
    activePopup.querySelector('.anno-edit').addEventListener('click', function () {
      activePopup.innerHTML = buildEditHTML(currentAnno);
      bindEditEvents();
      bindDrag();
      fitPopupToViewport(activePopup);
    });
  }

  function bindEditEvents() {
    activePopup.querySelector('.anno-popup-close').addEventListener('click', closePopup);
    activePopup.querySelector('.anno-cancel').addEventListener('click', function () {
      activePopup.innerHTML = buildViewHTML(currentAnno);
      bindViewEvents();
      bindDrag();
      fitPopupToViewport(activePopup);
    });
    activePopup.querySelector('.anno-copy').addEventListener('click', copyCurrent);
    activePopup.querySelector('.anno-save').addEventListener('click', saveEdit);
  }

  function saveEdit() {
    currentAnno.title = activePopup.querySelector('#anno-edit-title').value.trim();
    currentAnno.sections = {};
    activePopup.querySelectorAll('[data-section]').forEach(function (field) {
      currentAnno.sections[field.getAttribute('data-section')] = field.value.trim();
    });
    sectionFields.forEach(function (field) {
      if (!(field[0] in currentAnno.sections)) currentAnno.sections[field[0]] = '';
    });
    currentAnno.desc = generateDesc(currentAnno.sections);
    var items = getAnnotations();
    var found = false;
    items = items.map(function (item) {
      if (item.id === currentAnno.id) {
        found = true;
        return clone(currentAnno);
      }
      return item;
    });
    if (!found) items.push(clone(currentAnno));
    saveCached(items);
    // 写回文件
    var cfg = getConfig();
    if (cfg.enableFileWriteback && cfg.saveEndpoint) {
      writebackToFile([currentAnno]);
    }
    activePopup.innerHTML = buildViewHTML(currentAnno);
    bindViewEvents();
    bindDrag();
    fitPopupToViewport(activePopup);
  }

  function copyCurrent() {
    if (!currentAnno) return;
    copyText(JSON.stringify(currentAnno, null, 2));
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { showToast('数据已复制'); });
      return;
    }
    var input = document.createElement('textarea');
    input.value = text;
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
    showToast('数据已复制');
  }

  function bindDrag() {
    var header = activePopup.querySelector('.anno-popup-header');
    header.addEventListener('mousedown', function (event) {
      if (event.target.closest('button')) return;
      var rect = activePopup.getBoundingClientRect();
      dragState = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      event.preventDefault();
    });
  }

  function closePopup() {
    if (activePopup) activePopup.remove();
    activePopup = null;
    currentAnno = null;
    dragState = null;
  }

  function generateDesc(sections) {
    var data = sections || {};
    return sectionFields.map(function (field, index) {
      return (index + 1) + '. ' + field[1] + '：' + escapeHTML(data[field[0]] || '待确认');
    }).join('<br>');
  }

  function escapeHTML(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function writebackToFile(items) {
    var cfg = getConfig();
    if (!cfg.saveEndpoint) return;
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', cfg.saveEndpoint);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onload = function () {
        if (xhr.status === 200) {
          showToast('已保存并写回文件');
        } else {
          showToast('已保存到缓存（文件写回失败）');
        }
      };
      xhr.onerror = function () {
        showToast('已保存到缓存（写回服务未启动）');
      };
      xhr.send(JSON.stringify({ items: items }));
    } catch (err) {
      showToast('已保存到缓存');
    }
  }

  function saveMarkerPosition(anno) {
    var items = getAnnotations();
    var found = false;
    items = items.map(function (item) {
      if (item.id === anno.id) { found = true; item.position = clone(anno.position); }
      return item;
    });
    if (!found) {
      var copy = clone(anno);
      items.push(copy);
    }
    saveCached(items);
  }

  function showToast(text) {
    var old = document.querySelector('.anno-toast');
    if (old) old.remove();
    var toast = document.createElement('div');
    toast.className = 'anno-toast';
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 1800);
  }

  document.addEventListener('mousemove', function (event) {
    // 标注点拖拽
    if (markerDragState) {
      var dx = event.clientX - markerDragState.startX;
      var dy = event.clientY - markerDragState.startY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        markerDragState.marker._dragged = true;
      }
      markerDragState.marker.style.left = Math.round(markerDragState.origLeft + dx) + 'px';
      markerDragState.marker.style.top = Math.round(markerDragState.origTop + dy) + 'px';
      return;
    }
    // 弹窗拖拽
    if (!dragState || !activePopup) return;
    var x = Math.max(8, Math.min(event.clientX - dragState.x, window.innerWidth - activePopup.offsetWidth - 8));
    var y = Math.max(8, Math.min(event.clientY - dragState.y, window.innerHeight - activePopup.offsetHeight - 8));
    activePopup.style.left = x + 'px';
    activePopup.style.top = y + 'px';
  });

  document.addEventListener('mouseup', function () {
    // 标注点拖拽结束：计算偏移并保存
    if (markerDragState) {
      var state = markerDragState;
      markerDragState = null;
      var m = state.marker;
      var target = state.target;
      var anno = state.anno;
      var targetRect = target.getBoundingClientRect();
      // 标注点中心 = left/top + 10（marker 20×20）
      var cx = parseInt(m.style.left, 10) + 10;
      var cy = parseInt(m.style.top, 10) + 10;
      var pos = anno.position || {};
      // 根据标注点中心相对 target 的位置推断 placement
      var hSide = cx < targetRect.left + targetRect.width / 2 ? 'left' : 'right';
      var vSide = cy < targetRect.top + targetRect.height / 2 ? 'top' : 'bottom';
      pos.placement = vSide + '-' + hSide;
      // offset 相对 placement 对应的参照边，与 positionMarker 保持一致
      var refX = hSide === 'left' ? targetRect.left : targetRect.right;
      var refY = vSide === 'top' ? targetRect.top : targetRect.bottom;
      pos.offsetX = Math.round(cx - refX);
      pos.offsetY = Math.round(cy - refY);
      anno.position = pos;
      // 用新 position 重新定位
      positionMarker(m, target, pos);
      saveMarkerPosition(anno);
      return;
    }
    dragState = null;
    fitPopupToViewport(activePopup);
  });

  window.addEventListener('resize', function () {
    render();
    fitPopupToViewport(activePopup);
  });
  window.addEventListener('scroll', render, true);

  function observeChanges() {
    var root = document.body;
    observer = new MutationObserver(function (mutations) {
      var shouldRender = mutations.some(function (mutation) {
        var target = mutation.target;
        if (target && target.closest && target.closest('#anno-overlay, #anno-toggle-btn, .anno-popup, .anno-toast')) {
          return false;
        }
        return true;
      });
      if (!shouldRender) return;
      window.clearTimeout(observer._timer);
      observer._timer = window.setTimeout(render, 120);
    });
    observer.observe(root, { childList: true, subtree: true });
  }

  function init() {
    try {
      ensureToggle();
      ensureOverlay();
      render();
      observeChanges();
    } catch (err) {
      console.warn('[AnnotationRuntime] init failed:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.AnnotationRuntime = {
    refresh: render,
    getPageKey: getPageKey,
    getAnnotations: getAnnotations,
    close: closePopup
  };
})();
