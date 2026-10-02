/* =====================================================================
   5016B 實驗室引擎（LABKIT）── 兩學期共用
   ---------------------------------------------------------------------
   LABKIT.mount({ sections: SECTIONS, mod: 'arduino' })
   每一節的欄位（和 course_115「單元一架構」同一組）：
     id icon badge title desc link      ← 卡片長相
     apps objectives materials           ← 生活應用、學習目標、材料
     sim(el, api) → { set(setup) }       ← 模擬器；set 讓檢核「動手驗證」時把情境設好，回傳看到的結果
     blocks [[class, 文字]] python        ← 積木 ↔ Python 對照（python 為 null 表示在模擬器裡即時顯示）
     checks [{ q, options, setup }]      ← 正確選項與解說在 private/{學期}/lab.js，只放在驗證伺服器
   ⭐ 計星（2026-09-28 起，和其他單元一樣算進平均完成度）：每一節最多 3⭐，由伺服器判斷
     · 有檢核的節：一節一局（lks → lk → lkf）；每一題都說對了才結算：一次都沒錯 3⭐、錯 1 次 2⭐、錯 2 次以上 1⭐
     · 專題節（checks 是空的，例如 S5）：模擬器呼叫 api.done({ extra: 成果卡欄位 }) → 伺服器檢查填完整（lkp）→ 3⭐
     星星只會變多：想拿更多星可以「🔁 再挑戰一次」。
   ===================================================================== */
window.LABKIT = {
  mount: function (opts) {
    var SECTIONS = opts.sections, MOD = opts.mod || 'arduino', esc = UI.esc;
  /* ================================================================
       版面與檢核流程
       ================================================================ */
    var cur = 0;
    function rec(id) { return STORE.level(MOD, id) || {}; }
    function isDone(id) { var r = rec(id); return !!(r.done || r.stars); }
    function tabs() {
      // 五節課用「課程小卡」排開（和其他單元同一套樣式，顏色是這個單元的單元色）
      var nav = document.getElementById('tabs');
      nav.className = 'ucards'; nav.style.setProperty('--n', SECTIONS.length);
      nav.innerHTML = SECTIONS.map(function (s, i) {
        var d = isDone(s.id);
        return '<button class="ucard tab' + (i === cur ? ' on' : '') + '" data-i="' + i + '" aria-pressed="' + (i === cur) + '">' +
          '<span class="no">' + (i + 1) + '</span><span class="here">目前在這裡 👇</span>' +
          '<span class="ic">' + s.icon + '</span><span class="tt">' + esc(s.title.split('：')[0]) + '</span><span class="ds">' + esc(s.badge) + ' · ' + esc(s.link) + '</span>' +
          '<span class="pg"><span>' + (rec(s.id).stars ? '⭐'.repeat(rec(s.id).stars) : d ? '✅ 完成' : '尚未完成') + '</span></span><span class="bar"><i style="width:' + Math.round((rec(s.id).stars || 0) / 3 * 100) + '%"></i></span></button>';
      }).join('');
      document.querySelectorAll('.tab').forEach(function (b) { b.onclick = function () { show(+b.dataset.i); UI.scrollToNav(nav); }; });
      UI.stickyNav(nav);   // 捲動時精簡版固定在上方
    }

    function show(i) {
      cur = i; tabs();
      var s = SECTIONS[i];
      try { history.replaceState(null, '', '#' + s.id); } catch (e) {}
      var box = document.getElementById('sec');
      box.innerHTML =
        '<article class="card pop" style="border-top:6px solid var(--unit)"><div class="row between"><div class="row"><span style="font-size:2.2rem">' + s.icon + '</span><div>' +
        '<p class="kicker">' + esc(s.badge) + ' · 連結 ' + esc(s.link) + '</p><h2 class="black" style="font-size:1.4rem">' + esc(s.title) + '</h2></div></div>' +
        (rec(s.id).stars ? '<span class="chip" style="background:var(--ok-bg);color:var(--ok)">最佳 ' + UI.stars(rec(s.id).stars) + '</span>' : '') + '</div>' +
        '<p class="mt2">' + esc(s.desc) + '</p>' +
        '<div class="grid g3 mt2 mini">' +
        '<div class="card soft-bg" style="padding:.8rem"><h3 style="font-size:1rem">🏠 生活應用</h3><ul>' + s.apps.map(li).join('') + '</ul></div>' +
        '<div class="card soft-bg" style="padding:.8rem"><h3 style="font-size:1rem">🎯 學習目標</h3><ul>' + s.objectives.map(li).join('') + '</ul></div>' +
        '<div class="card soft-bg" style="padding:.8rem"><h3 style="font-size:1rem">🧰 材料</h3><ul>' + s.materials.map(li).join('') + '</ul></div></div></article>' +
        '<article class="card"><h3 class="bold">' + (s.id === 'S5' ? '📝 專題設計單' : '🔬 模擬器') + '</h3><div class="sim mt1" id="sim"></div></article>' +
        (s.blocks ? '<article class="card"><h3 class="bold">🧩 積木 ↔ 🐍 Python</h3><div class="grid g2 mt1"><div class="blocks">' +
          s.blocks.map(function (b) { return '<span class="blk ' + b[0] + '">' + esc(b[1]) + '</span>'; }).join('') + '</div>' +
          (s.python ? '<div class="code">' + esc(s.python) + '</div>' : '<p class="small soft">Python 版本就在上面模擬器裡，黃色框是「正在執行」的那兩行。</p>') + '</div></article>' : '') +
        (s.checks.length ? '<article class="card"><h3 class="bold">✅ 檢核：先預測，再驗證</h3><p class="small soft">⭐ 每一題都說對就過關：一次都沒猜錯 3⭐、錯 1 次 2⭐、錯 2 次以上 1⭐。先動手玩模擬器、想清楚再預測！</p>' +
          '<div id="checks" class="stack mt1"></div><div id="lk-end" class="mt2" aria-live="polite"></div></article>' : '') +
        '<nav id="lab-pager" aria-label="上一節／下一節"></nav>';
      var api = { done: function (r) { project(s, r || {}); } };
      // 結尾：← 上一節／下一節 →（最後一節接回闖關地圖）
      function go(k) { return function () { show(k); UI.scrollToNav('#tabs'); }; }
      var P = SECTIONS[i - 1], N = SECTIONS[i + 1];
      UI.pager('#lab-pager',
        P ? { lbl: '← 上一節', title: P.icon + ' ' + P.title.split('：')[0], go: go(i - 1) } : null,
        N ? { lbl: '下一節 →', title: N.icon + ' ' + N.title.split('：')[0], go: go(i + 1) } : { lbl: '五節都完成了嗎？回到 →', title: '🗺️ 闖關地圖', href: opts.hub || 'hub.html' });
      var sim = s.sim(box.querySelector('#sim'), api);
      if (s.checks.length) runChecks(s, sim, api);
    }
    function li(t) { return '<li>' + esc(t) + '</li>'; }

    /* 記星＋提示（伺服器結算的結果） */
    function award(s, res, extra) {
      var saved = STORE.saveLevel(MOD, s.id, { done: true, stars: res.stars, rc: res.rc, ts: res.ts, extra: extra });
      tabs();
      UI.toast('⭐ ' + s.badge + '：' + '★'.repeat(res.stars) + (saved.improved ? '（新紀錄！）' : ''), 3500);
      return saved;
    }
    /* 專題節：成果卡的欄位送到伺服器檢查，填完整就 3⭐ */
    function project(s, r) {
      API.call('lkp', { sid: s.id, who: STORE.me(), v: r.extra || {} }).then(function (res) {
        if (!res.ok) return UI.toast('還差：' + (res.miss || []).join('、'), 3500);
        award(s, res, r.extra);
      }, function (e) { UI.toast('📴 ' + API.msg(e) + '（成果卡已產生，連上網路再按一次就會記星）', 4500); });
    }

    /* 每一題：選預測 → 按「動手驗證」（模擬器自動設定情境）→ 伺服器判斷；錯了看說明、重新預測（錯幾次會影響星數） */
    function runChecks(s, sim, api) {
      var box = document.getElementById('checks'), end = document.getElementById('lk-end'), passed = {}, run = null, opening = null, wrong = 0;
      box.innerHTML = ''; end.innerHTML = '';
      function openRun() {   // 第一次按「動手驗證」才開局（只是看看不會開）
        if (run) return Promise.resolve(run);
        if (!opening) opening = API.call('lks', { sid: s.id, who: STORE.me() }).then(function (r) { run = r.run; return run; }, function (e) { opening = null; throw e; });
        return opening;
      }
      function finish() {
        API.call('lkf', { run: run }).then(function (res) {
          var saved = award(s, res);
          end.innerHTML = '<div class="note ok pop"><b>🎉 ' + esc(s.badge) + ' 過關！</b> ' + UI.stars(res.stars) + '　' + (res.wrong ? '預測錯了 ' + res.wrong + ' 次' : '一次都沒猜錯！') +
            (saved.improved ? '　⭐ 新紀錄已儲存' : '　（最佳紀錄 ' + (rec(s.id).stars || res.stars) + ' 星，星星只會變多）') + '</div>' +
            (res.stars < 3 ? '<button class="btn sm mt1" id="lk-again">🔁 再挑戰一次（想拿 3⭐）</button>' : '');
          var ag = document.getElementById('lk-again'); if (ag) ag.onclick = function () { runChecks(s, sim, api); };
        }, function (e) { end.innerHTML = '<div class="note warn small">📴 ' + esc(API.msg(e)) + '</div>'; });
      }
      s.checks.forEach(function (c, qi) {
        var d = document.createElement('div'); d.className = 'card soft-bg'; d.style.padding = '.9rem';
        box.appendChild(d);
        function render() {
          var pick = null;
          d.innerHTML = '<p class="bold">' + (qi + 1) + '. ' + esc(c.q) + '</p><div class="grid g3 mt1">' +
            c.options.map(function (o, k) { return '<button class="pick" data-k="' + k + '">' + esc(o) + '</button>'; }).join('') + '</div>' +
            '<div class="row mt1"><button class="btn primary sm" disabled data-run>🔬 動手驗證</button><span class="tiny soft">先選一個預測，才能驗證</span></div><div data-fb class="mt1"></div>';
          d.querySelectorAll('.pick').forEach(function (b) {
            b.onclick = function () { pick = +b.dataset.k; d.querySelectorAll('.pick').forEach(function (x) { x.classList.toggle('on', x === b); }); d.querySelector('[data-run]').disabled = false; };
          });
          d.querySelector('[data-run]').onclick = function () {
            var runBtn = this, seen = sim.set(c.setup);
            document.getElementById('sim').scrollIntoView({ behavior: 'smooth', block: 'center' });
            runBtn.disabled = true;
            d.querySelectorAll('.pick').forEach(function (x) { x.disabled = true; });
            // 正確選項與解說在驗證伺服器：把學生的預測送上去對
            openRun().then(function () { return API.call('lk', { run: run, i: qi, v: String(pick) }); }).then(function (r) {
              var ok = !!r.ok, mine = d.querySelector('.pick[data-k="' + pick + '"]');
              wrong = r.wrong || 0;
              if (mine) mine.classList.add(ok ? 'right' : 'wrong');
              d.querySelector('[data-fb]').innerHTML = '<div class="note ' + (ok ? 'ok' : 'bad') + ' pop small"><b>🔬 ' + esc(seen) + '</b><br>' +
                (ok ? '✅ 你的預測正確！ ' + esc(r.why) : '❌ 和你的預測不一樣。看看模擬器的結果，想一想為什麼，再預測一次。（這一節已經錯 ' + wrong + ' 次）') + '</div>' +
                (ok ? '' : '<button class="btn sm mt1" data-again>重新預測</button>');
              if (ok) { passed[qi] = true; if (Object.keys(passed).length === s.checks.length) finish(); }
              else d.querySelector('[data-again]').onclick = render;
            }, function (e) {   // 連不上伺服器：模擬器照跑，只是沒辦法判斷預測
              d.querySelector('[data-fb]').innerHTML = '<div class="note warn pop small"><b>🔬 ' + esc(seen) + '</b><br>📴 ' + esc(API.msg(e)) + '</div><button class="btn sm mt1" data-again>重新預測</button>';
              d.querySelector('[data-again]').onclick = render;
            });
          };
        }
        render();
      });
    }

    UI.requireLogin(function () {
      var want = (location.hash || '').slice(1);
      var i = SECTIONS.findIndex(function (s) { return s.id === want; });
      show(i >= 0 ? i : 0);
    });
    return { show: show };
  },

  /**
   * 成果卡（canvas）。opts = { title, banner, boxes:[[標籤, 內容]×4], rule, lines:[三句], me }
   */
  drawCard: function (o) {
    var c = document.createElement('canvas'); c.id = 'card-canvas'; c.width = 900; c.height = 560;
    var x = c.getContext('2d'), F = '"Noto Sans TC", sans-serif', me = o.me || {};
    x.fillStyle = '#eef2ff'; x.fillRect(0, 0, 900, 560);
    x.fillStyle = '#4f46e5'; x.fillRect(0, 0, 900, 90);
    x.fillStyle = '#fff'; x.font = '900 34px ' + F; x.fillText('💡 ' + o.title, 36, 58);
    x.font = '700 16px ' + F; x.textAlign = 'right'; x.fillText(o.banner || '', 864, 56); x.textAlign = 'left';
    (o.boxes || []).slice(0, 4).forEach(function (r, i) {
      x.fillStyle = '#6366f1'; x.fillRect(36 + i * 210, 114, 196, 60); x.fillStyle = '#fff';
      x.font = '700 14px ' + F; x.fillText(r[0], 48 + i * 210, 134);
      x.font = '900 16px ' + F; x.fillText(String(r[1]).slice(0, 11), 48 + i * 210, 162);
    });
    x.fillStyle = '#0f172a'; x.fillRect(36, 200, 828, 52);
    x.fillStyle = '#fde68a'; x.font = '700 18px ui-monospace, Consolas, monospace'; x.fillText(o.rule || '', 52, 233);
    x.fillStyle = '#1e293b'; x.font = '700 21px ' + F;
    var icons = ['🎯 ', '🔧 ', '🚀 '];
    (o.lines || []).forEach(function (s, i) { x.fillText(icons[i % 3] + s, 36, 310 + i * 56); });
    x.fillStyle = '#64748b'; x.font = '700 16px ' + F;
    x.fillText('研發人員：' + me.cls + ' 班 ' + me.seat + ' 號 ' + me.name + '　·　' + new Date().toLocaleDateString('zh-TW'), 36, 520);
    return c;
  },

  /** 把成果卡放進容器並附上下載鈕 */
  showCard: function (box, canvas, me) {
    box.innerHTML = ''; box.appendChild(canvas);
    var a = document.createElement('a'); a.className = 'btn primary mt2'; a.textContent = '⬇ 下載成果卡 PNG';
    a.download = '成果發表-' + me.cls + '_' + me.seat + '_' + me.name + '.png'; a.href = canvas.toDataURL('image/png');
    box.appendChild(document.createElement('br')); box.appendChild(a);
  }
};
