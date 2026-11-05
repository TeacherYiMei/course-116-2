/* =====================================================================
   共用小元件：跳脫、星星、提示、對話框、登入閘門、頁首
   ---------------------------------------------------------------------
   需要先載入 store.js。
   [116升級版] 內建 Firebase 動態載入與學習密碼 SSO 單一登入 (修正路徑版)
   ===================================================================== */
(function () {
  var UI = {};

  UI.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>'"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c];
    });
  };

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

  /* --- 🚀 Firebase 動態載入腳本 (智能路徑尋找) --- */
  function loadFirebaseScripts() {
    return new Promise((resolve) => {
      if (window.CourseDB) return resolve();
      
      // 自動從現有的 script 標籤中尋找 shared 資料夾的相對路徑
      let sharedPath = '../shared/';
      const scripts = document.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const src = scripts[i].getAttribute('src');
        if (src && src.includes('shared/store.js')) {
          sharedPath = src.replace('store.js', '');
          break;
        }
      }
      
      const configScript = document.createElement('script');
      configScript.src = sharedPath + 'firebase-config.js';
      
      configScript.onload = () => {
        const syncScript = document.createElement('script');
        syncScript.src = sharedPath + 'firebase-sync.js';
        syncScript.onload = () => resolve();
        syncScript.onerror = () => { console.error("無法載入 firebase-sync.js"); resolve(); };
        document.head.appendChild(syncScript);
      };
      configScript.onerror = () => { console.error("無法載入 firebase-config.js"); resolve(); };
      document.head.appendChild(configScript);
    });
  }

  /**
   * 登入閘門：[SSO 升級版] 加入密碼驗證與 Firebase 綁定
   */
  UI.requireLogin = async function (ready) {
    // 若已登入且 Firebase 已啟動，直接放行
    if (STORE.me() && window.CourseDB && !CourseDB.isAnonymous()) { 
      ready && ready(STORE.me()); 
      return; 
    }

    await loadFirebaseScripts();
    if(window.CourseDB) await CourseDB.ready;

    // 若本機有 STORE，且 Firebase 也登入，嘗試靜態還原
    if (STORE.me() && window.CourseDB && !CourseDB.isAnonymous()) {
      ready && ready(STORE.me());
      return;
    }

    var dlg = UI.modal(
      '<div style="text-align:center; font-size:3rem; margin-bottom:10px;">🔐</div>' +
      '<h2 class="title" style="font-size:1.4rem; text-align:center">建立或登入學習帳號</h2>' +
      '<p class="small soft mt1" style="text-align:center">為避免電腦重啟後遺失進度，請登入學習帳號。舊版從未設定密碼的學生，請由老師使用「🔑 舊帳號救援」。</p>' +
      '<form class="stack mt2" id="login-form">' +
      '<div class="grid" style="grid-template-columns:1fr 1fr;gap:.75rem">' +
      '<label class="field">班級<input name="cls" inputmode="numeric" placeholder="例：901" maxlength="3" autocomplete="off" required></label>' +
      '<label class="field">座號<input name="seat" inputmode="numeric" placeholder="例：5" maxlength="2" autocomplete="off" required></label></div>' +
      '<label class="field">姓名<input name="name" placeholder="例：王小明" maxlength="12" autocomplete="off" required></label>' +
      '<label class="field" style="margin-top:10px; color:#4f46e5;">學習密碼 (至少6碼) *<input type="password" name="pwd" placeholder="請記住自己的學習密碼，不要使用其他網站重要密碼" minlength="6" required></label>' +
      '<p id="login-err" class="small bold" style="color:var(--bad);min-height:1.2em;margin-top:10px;" aria-live="polite"></p>' +
      '<div style="display:flex; gap:10px; margin-top:15px; flex-wrap:wrap;">' +
      '<button type="submit" id="btn-link" class="btn primary big" style="flex:1; background:#4f46e5; border-color:#4f46e5; color:white;">建立 / 綁定帳號</button>' +
      '<button type="button" id="btn-login" class="btn big" style="flex:1;">已有帳號，登入</button>' +
      '</div></form>',
      { sticky: true });

    const form = dlg.el.querySelector('#login-form');
    const errEl = dlg.el.querySelector('#login-err');
    
    // 如果之前本機有紀錄，先帶入
    const me = STORE.me();
    if(me) {
      form.cls.value = me.cls || '';
      form.seat.value = me.seat || '';
      form.name.value = me.name || '';
    }

    async function handleAuth(isLogin) {
      const cls = form.cls.value.trim();
      const seat = form.seat.value.trim();
      const name = form.name.value.trim();
      const pwd = form.pwd.value.trim();

      const localErr = STORE.login(cls, seat, name);
      if (localErr) { errEl.textContent = localErr; return; }
      if (pwd.length < 6) { errEl.textContent = "密碼至少需要6個字元"; return; }

      errEl.textContent = "⏳ 連線中...";
      errEl.style.color = "#3b82f6";
      
      try {
        if (!window.CourseDB) throw new Error("Firebase 尚未載入，請確認網路連線。");
        
        if (isLogin) {
          await CourseDB.signInStudentAccount(cls, seat, pwd);
        } else {
          // 若原本未匿名登入，先強制匿名登入才能 link
          if(!CourseDB.isAnonymous() && !CourseDB.uid) {
            await window.mods?.auth?.signInAnonymously(window.auth);
          }
          await CourseDB.linkStudentAccount(cls, seat, pwd);
        }
        
        // 登入成功，將 STORE 資料上傳一次
        await STORE.syncToCloud();
        
        dlg.close(); 
        ready && ready(STORE.me());
      } catch (e) {
        errEl.style.color = "var(--bad)";
        if(e?.code === "auth/email-already-in-use" || e?.code === "auth/credential-already-in-use"){
          errEl.textContent = "此班級座號已被綁定，請按「已有帳號，登入」。";
        } else if(e?.code === "auth/invalid-credential" || e?.code === "auth/wrong-password"){
          errEl.textContent = "密碼錯誤，請重新輸入。";
        } else {
          errEl.textContent = "連線失敗: " + (e.message || "未知錯誤");
        }
      }
    }

    form.addEventListener('submit', (e) => { e.preventDefault(); handleAuth(false); });
    dlg.el.querySelector('#btn-login').addEventListener('click', (e) => { e.preventDefault(); handleAuth(true); });
  };

  UI.moduleOf = function () {
    var C = window.CONFIG; if (!C || !C.MODULES) return null;
    var seg = location.pathname.split('/'), file = seg.pop() || 'index.html', dir = seg.pop() || '';
    return C.MODULES.filter(function (m) {
      return m.href === file || m.href === dir + '/' + file || m.href.split('/')[0] === dir ||
        (m.parts || []).some(function (p) { return p.href === file; });
    })[0] || null;
  };

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

  UI.scrollToNav = function (nav) {
    if (typeof nav === 'string') nav = document.querySelector(nav);
    var ph = nav && (nav.closest('.ucards-ph') || nav);
    if (ph && ph.getBoundingClientRect().top < 0) ph.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

  UI.gridCols = function (n) { return 'lvgrid c' + (n === 4 || n === 2 ? 2 : (n === 7 || n === 8 ? 4 : (n === 10 || n === 5 ? 5 : 3))); };

  window.UI = UI;
})();
