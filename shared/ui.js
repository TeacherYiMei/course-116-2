/* =====================================================================
   共用小元件：跳脫、星星、提示、對話框、登入閘門、頁首
   ---------------------------------------------------------------------
   需要先載入 store.js。
   ===================================================================== */
(function () {
  var UI = {};

  UI.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>'"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c];
    });
  };

  /** ★★☆ */
  UI.stars = function (n, max) {
    max = max == null ? 3 : max; n = Math.max(0, Math.min(max, n || 0));
    var s = '';
    for (var i = 0; i < max; i++) s += i < n ? '★' : '<span class="off">★</span>';
    return '<span class="stars" aria-label="' + n + ' 顆星，共 ' + max + ' 顆">' + s + '</span>';
  };

  UI.hearts = function (n, max) {
    var s = '';
    for (var i = 0; i < max; i++) s += i < n ? '❤️' : '🤍';
    return '<span class="hearts" aria-label="剩下 ' + n + ' 顆愛心">' + s + '</span>';
  };

  var toastEl = null, toastTimer = null;
  UI.toast = function (msg, ms) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.setAttribute('role', 'status');
      toastEl.style.cssText = 'position:fixed;left:50%;bottom:1.5rem;transform:translateX(-50%);background:#1e293b;color:#fff;font-weight:800;padding:.7rem 1.2rem;border-radius:999px;box-shadow:0 10px 25px rgba(0,0,0,.25);z-index:2000;max-width:90vw;text-align:center;transition:opacity .2s';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg; toastEl.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.style.opacity = '0'; }, ms || 2200);
  };

  /** 開一個對話框，回傳關閉函式。html 內有 [data-close] 的按鈕會關閉它 */
  UI.modal = function (html, opts) {
    opts = opts || {};
    var m = document.createElement('div');
    m.className = 'modal';
    m.innerHTML = '<div class="card pop" role="dialog" aria-modal="true">' + html + '</div>';
    document.body.appendChild(m);
    function close() { if (m.parentNode) m.parentNode.removeChild(m); }
    m.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) close();
      else if (e.target === m && !opts.sticky) close();
    });
    var f = m.querySelector('input,button'); if (f) setTimeout(function () { f.focus(); }, 30);
    return { el: m, close: close };
  };

  /**
   * 登入閘門：沒登入就跳出「班級／座號／姓名」，登入後才呼叫 ready()。
   * ⚠️ 日後接學校 Google 帳號時，這一段換成 Google 登入按鈕即可。
   */
  UI.requireLogin = function (ready) {
    if (STORE.me()) { ready && ready(STORE.me()); return; }
    var dlg = UI.modal(
      '<p class="kicker">登入</p><h2 class="title" style="font-size:1.4rem">先告訴我你是誰</h2>' +
      '<p class="small soft mt1">進度會記在這台電腦的瀏覽器裡。</p>' +
      '<form class="stack mt2" id="login-form">' +
      '<div class="grid" style="grid-template-columns:1fr 1fr;gap:.75rem">' +
      '<label class="field">班級<input name="cls" inputmode="numeric" placeholder="901" maxlength="3" autocomplete="off"></label>' +
      '<label class="field">座號<input name="seat" inputmode="numeric" placeholder="5" maxlength="2" autocomplete="off"></label></div>' +
      '<label class="field">姓名<input name="name" placeholder="王小明" maxlength="12" autocomplete="off"></label>' +
      '<p id="login-err" class="small bold" style="color:var(--bad);min-height:1.2em" aria-live="polite"></p>' +
      '<button class="btn primary big" style="width:100%">開始闖關 →</button></form>',
      { sticky: true });
    dlg.el.querySelector('#login-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target;
      var err = STORE.login(f.cls.value, f.seat.value, f.name.value);
      if (err) { dlg.el.querySelector('#login-err').textContent = err; return; }
      dlg.close(); ready && ready(STORE.me());
    });
  };

  /** 頁首：返回基地＋學生名牌。放在 <header id="topbar"> 裡 */
  /** 這一頁屬於哪個單元？依 config.js 的 MODULES 比對網址（單元的 href、parts 的 href、或所在資料夾） */
  UI.moduleOf = function () {
    var C = window.CONFIG; if (!C || !C.MODULES) return null;
    var seg = location.pathname.split('/'), file = seg.pop() || 'index.html', dir = seg.pop() || '';
    return C.MODULES.filter(function (m) {
      return m.href === file || m.href === dir + '/' + file || m.href.split('/')[0] === dir ||
        (m.parts || []).some(function (p) { return p.href === file; });
    })[0] || null;
  };
  /** 套用單元色：把 --unit 系列指到這個單元的 --uN（見 theme.css 與 docs/04_設計系統.md） */
  UI.useUnitColor = function (c) {
    if (!c) return;
    var r = document.documentElement.style;
    ['', '-bg', '-soft', '-line'].forEach(function (k) { r.setProperty('--unit' + k, 'var(--' + c + k + ')'); });
    document.documentElement.setAttribute('data-unit', c);
  };

  UI.topbar = function (el, opts) {
    opts = opts || {};
    if (typeof el === 'string') el = document.querySelector(el);
    if (!el) return;
    var mod = UI.moduleOf();
    UI.useUnitColor(opts.unit || (mod && mod.color));
    var hub = opts.hub || 'hub.html';
    function render() {
      var p = STORE.me();
      el.className = 'topbar';
      el.innerHTML =
        (opts.noBack ? '' : '<a class="back" href="' + hub + '">' + UI.esc(opts.backLabel || '← 闖關地圖') + '</a>') +
        (opts.title ? '<div><p class="kicker">' + UI.esc(opts.kicker || '') + '</p><h1 class="title">' + UI.esc(opts.title) + '</h1></div>' : '') +
        '<span class="who" id="who">' + (p ? UI.esc(p.cls + ' 班 ' + p.seat + ' 號 ' + p.name) : '尚未登入') + '</span>';
    }
    render();
    window.addEventListener('store:change', render);
  };

  /** 課程小卡捲出畫面後，改成精簡版固定在畫面上方（隨時可以切換）。狀態放在外層，小卡重畫也不會掉 */
  UI.stickyNav = function (nav) {
    if (typeof nav === 'string') nav = document.querySelector(nav);
    if (!nav || nav.parentNode.classList.contains('ucards-ph')) return;
    var ph = document.createElement('div'); ph.className = 'ucards-ph';
    nav.parentNode.insertBefore(ph, nav); ph.appendChild(nav);
    var stuck = false, ticking = false;
    function check() {
      ticking = false;
      if (!stuck && ph.getBoundingClientRect().bottom < 0) { ph.style.height = ph.offsetHeight + 'px'; ph.classList.add('stuck'); stuck = true; }
      else if (stuck && ph.getBoundingClientRect().bottom >= 0) { ph.classList.remove('stuck'); ph.style.height = ''; stuck = false; }
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(check); } }, { passive: true });
    check();
  };
  /** 切換到別的部分後，如果課程小卡已經捲上去了，捲回內容開頭 */
  UI.scrollToNav = function (nav) {
    if (typeof nav === 'string') nav = document.querySelector(nav);
    var ph = nav && (nav.closest('.ucards-ph') || nav);
    if (ph && ph.getBoundingClientRect().top < 0) ph.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  /** 上一個／下一個：每一課、每一部分、每一關的結尾都用這一組。item = { lbl, title, href } 或 { lbl, title, go: function }（可加 id、locked） */
  UI.pager = function (el, prev, next) {
    if (typeof el === 'string') el = document.querySelector(el);
    if (!el) return;
    el.className = 'pager';
    function btn(it, cls) {
      if (!it) return '';
      var inner = '<span class="lbl">' + UI.esc(it.lbl) + '</span><span class="ttl">' + UI.esc(it.title) + '</span>';
      var attr = ' class="pg-btn ' + cls + (it.locked ? ' locked' : '') + '"' + (it.id ? ' id="' + UI.esc(it.id) + '"' : '');
      return it.href ? '<a' + attr + ' href="' + UI.esc(it.href) + '">' + inner + '</a>' : '<button type="button"' + attr + '>' + inner + '</button>';
    }
    el.innerHTML = btn(prev, 'prev') + btn(next, 'next');
    [['prev', prev], ['next', next]].forEach(function (x) {
      var b = el.querySelector('.' + x[0]); if (b && x[1] && x[1].go) b.onclick = x[1].go;
    });
  };

  /** 關卡卡片的欄數：避免最後一排只剩一張（4 張 → 2×2；7、8 張 → 每排 4 張；其他 3 欄） */
  UI.gridCols = function (n) { return 'lvgrid c' + (n === 4 || n === 2 ? 2 : (n === 7 || n === 8 ? 4 : (n === 10 || n === 5 ? 5 : 3))); };

  window.UI = UI;
})();
