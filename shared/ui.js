/* =====================================================================
   共用小元件 (v16.46 終極救援版：自動偵測斷線並彈出登入)
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

  function loadFirebaseScripts() {
    return new Promise((resolve) => {
      if (window.CourseDB) return resolve();
      
      let sharedPath = '../shared/';
      const scripts = document.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const src = scripts[i].getAttribute('src');
        if (src && src.includes('shared/store.js')) {
          sharedPath = src.replace(/store\.js(?:[?#].*)?$/, '');
          break;
        }
      }
      
      const configScript = document.createElement('script');
      configScript.src = sharedPath + 'firebase-config.js';
      
      configScript.onload = () => {
        const syncScript = document.createElement('script');
        syncScript.src = sharedPath + 'firebase-sync.js?v=16.58';
        syncScript.onload = () => resolve();
        syncScript.onerror = () => { console.error("無法載入 firebase-sync.js"); resolve(); };
        document.head.appendChild(syncScript);
      };
      configScript.onerror = () => { console.error("無法載入 firebase-config.js"); resolve(); };
      document.head.appendChild(configScript);
    });
  }

  UI.requireLogin = async function (ready) {
    await loadFirebaseScripts();
    if(window.CourseDB) await CourseDB.ready;
    if (!window.CourseDB || CourseDB.state === 'error' || CourseDB.state === 'disabled') {
      var detail = window.CourseDB && CourseDB.errorMessage ? '（' + CourseDB.errorMessage + '）' : '';
      UI.modal('<h2 class="title">Firebase 連線尚未就緒</h2>' +
        '<p class="small mt1">目前無法確認雲端登入狀態。請確認網路連線後重新整理，不要重新建立學生帳號，也不要清除瀏覽器資料。</p>' +
        '<p class="small mt1" style="overflow-wrap:anywhere">' + UI.esc(detail) + '</p>' +
        '<button type="button" class="btn primary mt2" id="firebase-retry">重新載入</button>', {sticky:true});
      var retry = document.getElementById('firebase-retry');
      if(retry) retry.addEventListener('click', function(){ location.reload(); });
      return;
    }

    if (STORE.me() && window.CourseDB && !CourseDB.isAnonymous() && CourseDB.matchesStudentProfile?.(STORE.me())) {
      if (window.STORE && typeof window.STORE.syncFromCloud === 'function') {
         await window.STORE.syncFromCloud();
      }
      if (window.STORE && typeof window.STORE.syncToCloud === 'function') {
         window.STORE.syncToCloud();
      }
      ready && ready(STORE.me());
      return;
    }

    var dlg = UI.modal(
      '<div style="text-align:center; font-size:3rem; margin-bottom:10px;">🔐</div>' +
      '<h2 class="title" style="font-size:1.4rem; text-align:center">建立或登入全站學習帳號</h2>' +
      '<p class="small soft mt1" style="text-align:center">請登入以自動同步各單元進度。若無密碼請請老師救援。</p>' +
      '<form class="stack mt2" id="login-form">' +
      '<div class="grid" style="grid-template-columns:1fr 1fr;gap:.75rem">' +
      '<label class="field">班級<input name="cls" inputmode="numeric" placeholder="例：901" maxlength="3" autocomplete="off" required></label>' +
      '<label class="field">座號<input name="seat" inputmode="numeric" placeholder="例：5" maxlength="2" autocomplete="off" required></label></div>' +
      '<label class="field">姓名<input name="name" placeholder="例：王小明" maxlength="12" autocomplete="off" required></label>' +
      '<label class="field" style="margin-top:10px; color:#4f46e5;">學習密碼 (至少6碼) *<input type="password" name="pwd" placeholder="請輸入學習密碼" minlength="6" required></label>' +
      '<p id="login-err" class="small bold" style="color:var(--bad);min-height:1.2em;margin-top:10px;" aria-live="polite"></p>' +
      '<div style="display:flex; gap:10px; margin-top:15px; flex-wrap:wrap;">' +
      '<button type="submit" id="btn-link" class="btn primary big" style="flex:1; background:#4f46e5; border-color:#4f46e5; color:white;">建立 / 綁定帳號</button>' +
      '<button type="button" id="btn-login" class="btn big" style="flex:1;">已有帳號，登入</button>' +
      '</div></form>',
      { sticky: true });

    const form = dlg.el.querySelector('#login-form');
    const errEl = dlg.el.querySelector('#login-err');
    
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

      // 身分先驗證，再寫入本機 profile，避免密碼錯誤時覆蓋另一位學生的身份。
      if(!/^9\d{2}$/.test(cls) || !/^\d{1,2}$/.test(seat) || Number(seat)<1 || Number(seat)>40 || !name){
        errEl.textContent = '請確認班級、座號及姓名'; return;
      }
      if (pwd.length < 6) { errEl.textContent = "密碼至少需要6個字元"; return; }

      errEl.textContent = "⏳ 連線中...";
      errEl.style.color = "#3b82f6";
      
      try {
        if (!window.CourseDB) throw new Error("Firebase 尚未載入，請確認網路連線。");
        
        if (isLogin) {
          await CourseDB.signInStudentAccount(cls, seat, pwd);
          STORE.login(cls, seat, name);
          
          if (window.STORE && typeof window.STORE.syncFromCloud === 'function') {
            await window.STORE.syncFromCloud();
          }
        } else {
          if(!CourseDB.isAnonymous() && !CourseDB.uid) {
            await window.mods?.auth?.signInAnonymously(window.auth);
          }
          await CourseDB.linkStudentAccount(cls, seat, pwd);
          STORE.login(cls, seat, name);
        }
        
        const syncResult = await STORE.syncToCloud();
        if (!syncResult || syncResult.ok !== true) {
          throw new Error('闖關紀錄尚未成功上傳 Firebase（' + (syncResult?.reason||'UNKNOWN') + '）。本機成績仍保留，請勿清除瀏覽器資料，請老師協助檢查。');
        }
        
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
        '<div style="display:flex; align-items:center; gap:10px;">' +
        '<span id="global-sync-indicator" style="cursor:pointer; font-size:12px; padding:2px 8px; border-radius:12px; font-weight:bold;">同步中...</span>' +
        '<span class="who" id="who">' + (p ? UI.esc(p.cls + ' 班 ' + p.seat + ' 號 ' + p.name) : '尚未登入') + '</span></div>';
        
      const syncInd = el.querySelector('#global-sync-indicator');
      if (syncInd) {
          syncInd.onclick = () => {
              if (window.CourseDB && CourseDB.isAnonymous()) {
                  UI.requireLogin();
              } else {
                  showSyncStatusModal();
              }
          };
      }
    }
    render();
    window.addEventListener('store:change', render);
    
    // 🔴 關鍵防呆機制：自動偵測學生是否遺失登入狀態（開新分頁時），如果遺失則強制彈出密碼框
    setTimeout(() => {
        if (STORE.me() && window.CourseDB && CourseDB.isAnonymous()) {
            UI.requireLogin();
            const syncInd = el.querySelector('#global-sync-indicator');
            if (syncInd) {
                syncInd.textContent = "⚠️ 請登入";
                syncInd.style.backgroundColor = "#fef3c7";
                syncInd.style.color = "#92400e";
            }
        }
    }, 1500);
    
    window.addEventListener('sync:status', function(e) {
        const syncInd = document.getElementById('global-sync-indicator');
        if(!syncInd) return;
        if(e.detail === 'SYNC_OK' || e.detail === 'MERGED_OK') {
            syncInd.textContent = "✅ 已同步";
            syncInd.style.backgroundColor = "#dcfce7";
            syncInd.style.color = "#166534";
        } else if (e.detail === 'SYNC_FAIL' || e.detail === 'MERGE_FAIL') {
            syncInd.textContent = "❌ 待同步（請勿清除紀錄）";
            syncInd.title = String(e.reason||"請確認登入帳號與網路連線");
            syncInd.style.backgroundColor = "#fee2e2";
            syncInd.style.color = "#991b1b";
        } else if (e.detail === 'SYNCING') {
            syncInd.textContent = "⏳ 同步中";
            syncInd.style.backgroundColor = "#e0e7ff";
            syncInd.style.color = "#3730a3";
        } else if (e.detail === 'ANONYMOUS') {
            syncInd.textContent = "⚠️ 請登入";
            syncInd.style.backgroundColor = "#fef3c7";
            syncInd.style.color = "#92400e";
            if (STORE.me() && typeof UI.requireLogin === 'function') UI.requireLogin();
        }
    });
  };

  function showSyncStatusModal() {
      if(!STORE.me()) return;
      const d = STORE.load();
      const mods = d.modules || {};
      
      const pyState = JSON.parse(localStorage.getItem('course115_v3_progress') || '{}');
      const pyStars = Object.values(pyState).reduce((a, b) => a + Number(b || 0), 0);
      
      const u1Stars = mods.unit1?.stars || mods.digital?.stars || 0;
      const u3Stars = mods.unit3?.stars || mods.platform?.stars || mods.system?.stars || 0;
      const aiotStars = mods.aiot?.stars || mods.arduino?.stars || 0;
      
      const isAnon = window.CourseDB && CourseDB.isAnonymous();
      
      const html = `
        <h2 style="font-size:1.3rem; margin-bottom:15px; font-weight:bold;">☁️ 全站同步狀態</h2>
        <div style="background:#f8fafc; padding:15px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:15px; text-align:left;">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px; border-bottom:1px solid #cbd5e1; padding-bottom:8px;">
                <b>Firebase 學習帳號</b>
                <span style="color:${isAnon ? '#991b1b' : '#166534'};">${isAnon ? '⚠️ 尚未登入' : '✅ 登入正常'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span>單元一：數位時代 (${u1Stars}⭐)</span>
                <span style="color:${isAnon ? '#991b1b' : '#166534'};">${isAnon ? '待同步' : '已同步'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span>單元二：Python (${pyStars}⭐)</span>
                <span style="color:${isAnon ? '#991b1b' : '#166534'};">${isAnon ? '待同步' : '已同步'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span>單元三：系統平臺 (${u3Stars}⭐)</span>
                <span style="color:${isAnon ? '#991b1b' : '#166534'};">${isAnon ? '待同步' : '已同步'}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
                <span>5016B 專題 (${aiotStars}⭐)</span>
                <span style="color:${isAnon ? '#991b1b' : '#166534'};">${isAnon ? '待同步' : '已同步'}</span>
            </div>
        </div>
        <p style="font-size:0.8rem; color:#64748b; margin-bottom:15px;">若顯示「待同步」，表示您尚未登入或網路斷線，請點擊下方按鈕登入上傳。</p>
        <button type="button" class="btn primary big" style="width:100%;" onclick="if(window.CourseDB && CourseDB.isAnonymous()){ UI.requireLogin(); document.querySelector('.modal').remove(); } else { window.STORE.syncToCloud(); this.textContent='⏳ 同步中...'; setTimeout(()=>this.textContent='🔄 強制上傳', 2000); }">🔄 強制登入與上傳</button>
      `;
      UI.modal(html);
  }

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
