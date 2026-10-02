/* =====================================================================
   互動體驗遊戲引擎（CARDGAME）── 單元三、單元五、單元六共用
   ---------------------------------------------------------------------
   CARDGAME.mount({ app: '#app', levels: [...], mod: 'platform', blurb: '…' })

   🔐 答案只在驗證伺服器（Google Apps Script，見 server/ 與 shared/api.js）：
      網頁只有題目；學生每按一次，就把「選了什麼」送上去，伺服器判斷對錯、扣 ❤️、最後發星星（附簽章收據）。
      所以 F12、改程式、Tampermonkey 腳本都拿不到答案，也沒辦法自己加星。
      連不上伺服器 → 練習模式：可以看題目、作答，但不判斷、不記星（🎲 出題器和 🧪 實驗站要連線）。

   回合種類（內容寫在 private/{學期}/content/*.js，tools/build.mjs 產生不含答案的公開版）
     sort   一張一張出卡，選它屬於哪一類（buckets）
     order  依規則排出順序（點選的先後）
     build  每個欄位挑一個零件，組出符合需求的東西
     type   自己打出答案（比對前全形轉半形、去空白、不分大小寫）；可以帶 tool（caesar／vigenere／binary／abc／tally）
     gen    🎲 伺服器隨機出題（每位學生、每一次都不一樣）；題型 it.kind：input／choice／order／slots／bits
     lab    🧪 視覺化實驗站（CARDGAME.labs[名稱](el, api)）：伺服器產生情境、判斷結果
   opts.sequential：上一關 ≥ 2⭐ 才開下一關（HUB.openAll() 備課模式可暫時全開）
   關卡有 custom:true（例如總複習）→ 用回合上的 src／gen／lab 組一局（伺服器會檢查每一項都是真的）

   兩種計星方式：
     · 一般關卡（lv.rounds）：3 顆 ❤️，答錯扣一顆；過關時剩幾顆 ❤️ 就拿幾顆 ⭐
     · ⭐ 三星三階（lv.stages：[基礎, 操作, 挑戰]）：每一階各有 3 顆 ❤️，過了第幾階就拿幾顆 ⭐
   防亂猜與強化：
     · 🧊 冷靜一下：連續答錯 2 次，或答錯時作答不到 1.5 秒 → 暫停 5 秒看概念重點；離開畫面秒數重算
     · 💡 分層提示：同一題錯第 1 次給方向，第 2 次給步驟（都由伺服器給）；📖 小卡隨時可以叫出來
     · 🩹 修復站：❤️ 用完先針對卡住的那一回合練習（不扣心、先給提示），才能重新挑戰
     · 三星三階：選項 ≤ 3 個的題目答錯就「換一題」（不能翻牌猜）；追問「為什麼」
   ===================================================================== */
window.CARDGAME = window.CARDGAME || {};
CARDGAME.mount = function (opts) {
  var L = opts.levels, esc = UI.esc, MOD = opts.mod, HEARTS = 3;
  var app = typeof opts.app === 'string' ? document.querySelector(opts.app) : opts.app;
  var G = null;   // 遊戲狀態

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function range(n) { var o = []; for (var i = 0; i < n; i++) o.push(i); return o; }
  function best(id) { var r = STORE.level(MOD, id); return r ? (r.stars || 0) : 0; }
  function open(i) { return !opts.sequential || i === 0 || best(L[i - 1].id) >= 2 || !!(window.HUB && HUB.openAll && HUB.openAll()); }
  function norm(s) { return String(s).replace(/[！-～]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); }).replace(/\s+/g, '').toUpperCase(); }

  /* ── 呼叫伺服器（同一時間只送一個；失敗時顯示原因） ── */
  var busy = false;
  function lock(b) { busy = b; app.classList.toggle('busy', b); }
  function call(a, data) {
    lock(true);
    var body = { run: G && G.run }; for (var k in data || {}) body[k] = data[k];
    return API.call(a, body).then(function (res) { lock(false); return res; }, function (e) { lock(false); throw e; });
  }
  function trouble(e, fb) {   // 伺服器回錯誤：❤️ 用完 → 結束；局過期 → 回小卡；其他 → 顯示原因
    fb = fb || document.getElementById('fb');
    if (e && e.err === 'dead') return outOfHearts(fb, 'button.pick, #tf button, #lab button');
    var again = e && (e.err === 'run-expired' || e.err === 'done');
    if (fb) fb.innerHTML = '<div class="note bad pop">⚠️ ' + esc(API.msg(e)) + '</div>' + (again ? '<div class="row mt2"><button class="btn primary" id="rs">重新開始這一關</button></div>' : '');
    if (again) { var g = G; document.getElementById('rs').onclick = function () { start(g.i, g.st); }; }
  }

  /* ── 關卡選單 ─────────────────────────────── */
  function menu() {
    G = null;
    var cb = document.getElementById('cool-box'); if (cb) cb.remove(); app.inert = false;
    var total = L.reduce(function (s, lv) { return s + best(lv.id); }, 0);
    app.innerHTML =
      '<section class="card pop"><div class="tape"></div><div class="row between"><div>' +
      '<p class="kicker">' + L.length + ' 個互動體驗關卡 · ' + (opts.sequential ? '依序開放（上一關 2⭐ 開下一關）' : '自由挑戰順序') + '</p><h2 class="black" style="font-size:1.35rem">' + esc(opts.headline || '先讀「概念小卡」，再用遊戲證明你懂了') + '</h2>' +
      '<p class="small soft mt1">' + (L.some(function (lv) { return lv.stages; }) ? '每關三階：📘 基礎 ⭐ → 🛠️ 操作 ⭐⭐ → 🏆 挑戰 ⭐⭐⭐。過了第幾階就拿幾顆星；🎲 題目每次都不一樣。' : '每關 3 顆 ❤️，答錯扣一顆；過關時剩幾顆 ❤️ 就拿幾顆 ⭐。可以一直重玩刷新紀錄。') + '</p></div>' +
      '<div class="center"><div class="black" style="font-size:1.8rem;color:var(--star-ink)">' + total + ' / ' + (L.length * 3) + '</div><div class="tiny soft bold">⭐ 總星數</div></div></div></section>' +
      '<div id="net-state"></div>' +
      '<section class="grid ' + UI.gridCols(L.length) + ' mt3">' + L.map(function (lv, i) {
        if (!open(i)) return '<button class="card lvcard locked" data-i="' + i + '" disabled aria-disabled="true"><div class="row between"><span style="font-size:2rem">🔒</span>' + UI.stars(0) + '</div>' +
          '<h3 class="black mt1">第 ' + (i + 1) + ' 關　' + esc(lv.title) + '</h3><p class="tiny soft bold mt1">上一關拿到 2 顆星就會開放</p></button>';
        return '<button class="card lvcard pop" data-i="' + i + '" style="animation-delay:' + (i * 40) + 'ms">' +
          '<div class="row between"><span style="font-size:2rem">' + lv.icon + '</span>' + UI.stars(best(lv.id)) + '</div>' +
          '<h3 class="black mt1">第 ' + (i + 1) + ' 關　' + esc(lv.title) + '</h3>' +
          '<p class="tiny soft bold mt1">' + esc(lv.book) + '</p></button>';
      }).join('') + '</section>';
    app.querySelectorAll('.lvcard:not(.locked)').forEach(function (b) { b.onclick = function () { learn(+b.dataset.i); }; });
    netState();
  }
  function netState() {   // 連不上伺服器時，在選單上方說明「練習模式」
    API.ready().then(function (on) {
      var box = document.getElementById('net-state'); if (!box) return;
      box.innerHTML = on ? '' : '<div class="note warn mt2 small">📴 <b>練習模式</b>：連不上驗證伺服器（可能沒網路）。可以看題目、練習作答，但<b>不判斷對錯、不記星</b>；🎲 出題器和 🧪 實驗站要連線才能玩。</div>';
    });
  }

  /* ── 概念小卡 ─────────────────────────────── */
  function learn(i) {
    var lv = L[i];
    try { history.replaceState(null, '', '#' + lv.id); } catch (e) {}
    app.innerHTML =
      '<section class="card pop"><div class="tape"></div>' +
      '<p class="kicker">第 ' + (i + 1) + ' 關 · ' + esc(lv.book) + '</p>' +
      '<h2 class="black" style="font-size:1.6rem">' + lv.icon + ' ' + esc(lv.title) + '</h2>' +
      (window.K12 ? K12.chips(lv.id) : '') +
      '<div class="note mt2 learn"><b>📖 概念小卡</b><div class="mt1">' + lv.learn + '</div></div>' +
      (lv.stages ? stageCards(lv) +
        '<div class="row mt2"><button class="btn" id="back">← 關卡選單</button></div></section>'
      : '<p class="small soft mt2">共 ' + lv.rounds.length + ' 回合 · 最佳紀錄 ' + UI.stars(best(lv.id)) + '</p>' +
      '<div class="row mt2"><button class="btn go big" id="go">開始挑戰 ▶</button><button class="btn" id="back">← 關卡選單</button></div></section>');
    if (lv.stages) {
      app.querySelectorAll('.stage:not([disabled])').forEach(function (b) { b.onclick = function () { start(i, +b.dataset.s); }; });
      var go = app.querySelector('.stage.next') || app.querySelector('.stage:not([disabled])');
      if (go) { go.id = 'go'; }
      document.getElementById('back').onclick = menu;
      if (go) go.focus();
      return;
    }
    document.getElementById('go').onclick = function () { start(i); };
    document.getElementById('back').onclick = menu;
    document.getElementById('go').focus();
  }

  /* ⭐ 三星三階：三張階段卡（過了上一階才開下一階） */
  var STAGE = [{ n: '基礎', ic: '📘', d: '觀念題，題庫隨機抽' }, { n: '操作', ic: '🛠️', d: '動手做，🎲 每次參數不同' }, { n: '挑戰', ic: '🏆', d: '🎲 更難的隨機題' }];
  function stageOpen(lv, s) { return s === 0 || best(lv.id) >= s || !!(window.HUB && HUB.openAll && HUB.openAll()); }
  function stageCards(lv) {
    var b = best(lv.id);
    return '<p class="small bold mt2">⭐ 三星三階：過了第幾階就拿幾顆星（每一階 3 顆 ❤️）</p><div class="stages mt1">' + lv.stages.map(function (st, s) {
      var ok = stageOpen(lv, s), done = b > s, nx = ok && !done && (s === 0 || b >= s);
      return '<button class="stage' + (done ? ' done' : '') + (nx ? ' next' : '') + '" data-s="' + s + '"' + (ok ? '' : ' disabled') + '>' +
        '<span class="st-stars">' + '⭐'.repeat(s + 1) + '</span><span class="st-n">' + (ok ? STAGE[s].ic : '🔒') + ' 第 ' + (s + 1) + ' 階　' + STAGE[s].n + '</span>' +
        '<span class="st-d">' + UI.esc(st.goal || STAGE[s].d) + '</span>' +
        '<span class="st-s">' + (done ? '✅ 已通過' : ok ? '▶ 開始' : '過了第 ' + s + ' 階才開放') + '</span></button>';
    }).join('') + '</div>';
  }

  /* ── 遊戲流程 ─────────────────────────────── */
  /* focus：修復站要練的回合（第幾回合）；沒有就是正式挑戰 */
  function start(i, s, focus) {
    var lv = L[i], st = lv.stages ? (s || 0) : null, all = lv.stages ? lv.stages[st].rounds : lv.rounds, practice = focus != null;
    G = { i: i, lv: lv, st: st, rounds: practice ? [all[focus]] : all, r: 0, hearts: HEARTS, right: 0, total: 0, combo: 0, maxCombo: 0, practice: practice };
    var g = G;
    app.innerHTML = '<section class="card center"><p class="soft bold">⏳ 準備題目中…</p></section>';
    API.ready().then(function (on) {
      if (G !== g) return;
      if (!on) { g.offline = true; g.sizes = g.rounds.map(offlineSize); count(); return round(); }
      var req = { mod: MOD, lv: lv.id, st: st, who: STORE.me(), practice: practice };
      if (lv.custom) req.comp = g.rounds.map(function (rd) {
        return rd.src ? { src: rd.src, pick: practice ? 2 : rd.pick } : rd.type === 'gen' ? { gen: rd.gen, hard: !!rd.hard, tool: rd.tool || null } : { lab: rd.lab, hard: !!rd.hard };
      });
      else if (practice) req.focus = focus;
      call('start', req).then(function (res) {
        if (G !== g) return;
        g.run = res.run; g.hearts = res.hearts; g.sizes = res.sizes; count(); round();
      }, function (e) {
        if (G !== g) return;
        if (e.err === 'offline') { g.offline = true; g.sizes = g.rounds.map(offlineSize); count(); return round(); }
        app.innerHTML = '<section class="card"><div id="fb"></div><div class="row mt2"><button class="btn" id="back">← 回到概念小卡</button></div></section>';
        trouble(e); document.getElementById('back').onclick = function () { learn(i); };
      });
    });
  }
  function offlineSize(rd) {
    if (rd.type === 'sort') return Math.min(rd.pick || rd.items.length, rd.items.length);
    if (rd.type === 'order' || rd.type === 'type') return rd.items.length;
    if (rd.type === 'build') return rd.customers.length;
    return rd.n || 1;
  }
  /* 題號是「整個關卡（這一階）」連續算的：第 1～10 題，不會每一回合又從 1 開始 */
  function count() { G.base = 0; G.qk = 0; G.qtotal = G.sizes.reduce(function (a, n) { return a + n; }, 0); }
  function cnt(k) { G.qk = k; return '（第 ' + (G.base + k + 1) + ' / ' + G.qtotal + ' 題）'; }

  function hud() {
    var lv = G.lv;
    G.qt = Date.now();   // 這一題開始的時間（答太快的判斷用）
    return '<div class="hud"><button class="btn sm" id="quit">✕ 離開</button>' +
      '<b>' + lv.icon + ' ' + esc(lv.title) + '</b>' +
      (G.offline ? '<span class="chip">📴 練習模式 · 不判斷、不記星</span>' : '') +
      (G.practice ? '<span class="chip repair-chip">🩹 修復站 · 不扣心</span>' : (G.st != null ? '<span class="chip stage-chip">' + '⭐'.repeat(G.st + 1) + ' ' + STAGE[G.st].n + '</span>' : '') +
      '<span class="chip qprog" title="這一關的進度"><span class="qbar"><i style="width:' + Math.round((G.base + (G.qk || 0)) / Math.max(1, G.qtotal) * 100) + '%"></i></span>' + (G.base + (G.qk || 0)) + ' / ' + G.qtotal + ' 題</span>') +
      '<button class="btn sm" id="peek" type="button">📖 小卡</button>' +
      '<span style="margin-left:auto" class="combo">' + (G.combo >= 2 ? '🔥 連對 ' + G.combo : '') + '</span>' + (G.practice || G.offline ? '' : UI.hearts(G.hearts, HEARTS)) + '</div>';
  }
  function bindQuit() {
    var q = document.getElementById('quit'); if (q) q.onclick = function () { if (confirm('離開這一關？這次的進度不會保留。')) menu(); };
    var p = document.getElementById('peek'); if (p) p.onclick = peek;
  }
  /* 📖 小卡：不離開關卡，直接看概念小卡 */
  function peek() {
    var o = document.createElement('div'); o.className = 'cg-over'; o.id = 'peek-box';
    o.innerHTML = '<div class="card pop cg-box" role="dialog" aria-label="概念小卡"><div class="row between"><b>📖 ' + esc(G.lv.title) + '・概念小卡</b><button class="btn sm" id="peek-x" type="button">關閉 ✕</button></div>' +
      '<div class="note mt1 learn">' + G.lv.learn + '</div></div>';
    document.body.appendChild(o);
    function close() { o.remove(); }
    o.onclick = function (e) { if (e.target === o) close(); };
    document.getElementById('peek-x').onclick = close;
    document.getElementById('peek-x').focus();
  }

  /* 🧊 冷靜一下：暫停 5 秒看重點；離開畫面（切分頁、切視窗、縮小）秒數重算 */
  var COOL = 5;
  function cooldown(reason) {
    if (document.getElementById('cool-box')) return;
    var o = document.createElement('div'); o.className = 'cg-over'; o.id = 'cool-box';
    var tip = G.lv.learn.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    o.innerHTML = '<div class="card pop cg-box center" role="alertdialog" aria-label="冷靜一下"><p style="font-size:2.4rem">🧊</p><h3 class="black">冷靜一下</h3>' +
      '<p class="small mt1">' + (reason === 'fast' ? '答得太快又答錯了 —— 先看清楚題目再作答。' : '連續答錯了 —— 用猜的過不了關，先看一下重點。') + '</p>' +
      '<div class="note small mt2" style="text-align:left">📖 ' + esc(tip.length > 220 ? tip.slice(0, 220) + '…' : tip) + '</div>' +
      '<div class="cool-n black mt2" id="cool-n">' + COOL + '</div><p class="tiny soft" id="cool-msg">看著這個畫面，秒數倒數完才能繼續（離開畫面會重算）</p>' +
      '<button class="btn go mt1" id="cool-ok" type="button" disabled>我準備好了</button></div>';
    document.body.appendChild(o);
    app.inert = true;
    var left = COOL, away = false, msg = document.getElementById('cool-msg'), n = document.getElementById('cool-n');
    function reset(why) { left = COOL; n.textContent = left; msg.textContent = why; msg.className = 'tiny bold mt1'; msg.style.color = 'var(--bad)'; }
    function onBlur() { away = true; reset('⚠️ 你離開了畫面，秒數重算！'); }
    function onFocus() { away = false; }
    function onVis() { if (document.hidden) onBlur(); else onFocus(); }
    window.addEventListener('blur', onBlur); window.addEventListener('focus', onFocus); document.addEventListener('visibilitychange', onVis);
    var tm = setInterval(function () {
      if (away || document.hidden) return;
      left--; n.textContent = Math.max(0, left);
      if (left <= 0) {
        clearInterval(tm);
        window.removeEventListener('blur', onBlur); window.removeEventListener('focus', onFocus); document.removeEventListener('visibilitychange', onVis);
        var ok = document.getElementById('cool-ok'); ok.disabled = false; ok.focus();
        ok.onclick = function () { o.remove(); app.inert = false; if (G) G.streak = 0; };
      }
    }, 1000);
  }

  function round() {
    var rd = G.rounds[G.r];
    if (rd.type === 'sort') playSort(rd);
    else if (rd.type === 'order') playOrder(rd);
    else if (rd.type === 'build') playBuild(rd);
    else if (rd.type === 'type') playType(rd);
    else if (rd.type === 'gen') playGen(rd);
    else if (rd.type === 'lab') playLab(rd);
  }
  /* 練習模式（離線）：出題器、實驗站要伺服器才能玩 */
  function needNet(rd) {
    app.innerHTML = '<section class="card">' + hud() + '<p class="small soft bold mt2">' + (rd.type === 'gen' ? '🎲 ' : '🧪 ') + esc(rd.prompt || '') + '</p>' +
      '<div class="note warn mt2">📴 這一回合是' + (rd.type === 'gen' ? '「🎲 隨機出題」' : '「🧪 實驗站」') + '，題目由伺服器產生，要連上網路才能玩。</div>' +
      '<div class="row mt2"><button class="btn primary" id="nx">跳過這回合 →</button></div></section>';
    bindQuit(); document.getElementById('nx').onclick = nextRound; document.getElementById('nx').focus();
  }
  /* 練習模式（離線）：作答後不判斷，直接下一題 */
  function offlineNote(fb, last, next) {
    fb.innerHTML = '<div class="note pop">📴 已作答（練習模式不判斷對錯）。連上網路再挑戰，才會判斷、記星。</div><div class="row mt2"><button class="btn primary" id="nx">' + (last ? '完成這回合 →' : '下一題 →') + '</button></div>';
    var nx = document.getElementById('nx'); nx.focus(); nx.onclick = next;
  }

  /* 伺服器回來的結果：更新 ❤️、連對、冷靜一下；回傳 false 表示 ❤️ 用完了 */
  function hit(res) {
    var ok = !!res.ok, fast = Date.now() - (G.qt || 0) < 1500;
    if (res.hearts != null) G.hearts = res.hearts;
    if (G.practice) return true;   // 修復站不扣心
    G.total++;
    if (ok) { G.right++; G.combo++; G.maxCombo = Math.max(G.maxCombo, G.combo); G.streak = 0; }
    else {
      G.combo = 0; G.streak = (G.streak || 0) + 1;
      if (!res.dead && (G.streak >= 2 || fast)) { var why = G.streak >= 2 ? 'streak' : 'fast', g0 = G; setTimeout(function () { if (G && G === g0) cooldown(why); }, 60); }
    }
    return !res.dead;
  }
  var swapStage = function () { return G.st != null && !G.practice; };   // 三星三階才「答錯換一題」
  function hintHTML(res) { return res.hint ? '<br>' + (res.deep ? '🔍 ' : '💡 ') + esc(res.hint) : ''; }

  /* lab：🧪 視覺化實驗站 ── 伺服器產生情境（api.pub），學生動手做，api.send(操作) 送上去判斷。
     api.send 回傳 Promise(伺服器的結果)：{ ok, partial, why, hint, act, warn, out, data, reset… } */
  function playLab(rd) {
    if (G.offline) return needNet(rd);
    var make = CARDGAME.labs && CARDGAME.labs[rd.lab], n = G.sizes[G.r], k = 0;
    if (!make) { app.innerHTML = '<section class="card"><p class="note bad">找不到實驗站：' + esc(rd.lab) + '</p></section>'; return; }
    function one() {
      var done = false, tries = 0;
      G.qk = k;
      app.innerHTML = '<section class="card">' + hud() +
        '<p class="small soft bold mt2">🧪 ' + esc(rd.prompt) + cnt(k) + '</p>' +
        '<div id="lab" class="lab mt1"><p class="soft small">⏳ 準備實驗站…</p></div><div class="fb mt2" id="fb" aria-live="polite"></div></section>';
      bindQuit();
      var el = document.getElementById('lab'), fb = document.getElementById('fb');
      call('lab', { r: G.r }).then(function (res) {
        el.innerHTML = '';
        make(el, { hard: !!rd.hard, practice: !!G.practice, pub: res.pub,
          say: function (html) { fb.innerHTML = html; },
          send: function (v) {
            if (done || busy) return Promise.resolve(null);
            return call('lq', { l: res.l, v: v }).then(function (r) {
              if (r.act) { if (r.warn) fb.innerHTML = '<div class="note warn small">' + esc(r.warn) + '</div>'; return r; }
              if (r.ok && r.partial) { if (r.say) fb.innerHTML = '<div class="note ok small">' + esc(r.say) + '</div>'; else fb.innerHTML = ''; return r; }
              var alive = hit(r); refreshHud();
              if (r.ok) {
                done = true; el.classList.add('lab-done');
                fb.innerHTML = '<div class="note ok pop"><b>✅ 成功！</b> ' + esc(r.why || '') + '</div>' +
                  '<div class="row mt2"><button class="btn primary" id="nx">' + (k + 1 < n ? '下一題 →' : '完成這回合 →') + '</button></div>';
                var nx = document.getElementById('nx'); nx.focus();
                nx.onclick = function () { k++; if (k < n) one(); else nextRound(); };
                return r;
              }
              if (!alive) { done = true; el.classList.add('lab-done'); outOfHearts(fb, '#lab button'); return r; }
              tries++;
              fb.innerHTML = '<div class="note bad pop">❌ ' + esc(r.why || '還不對') + hintHTML(r) +
                (tries >= 2 ? '<br><span class="tiny">還是卡住？按上面的「📖 小卡」回去看重點。</span>' : '') + '</div>';
              return r;
            }, function (e) { trouble(e, fb); return null; });
          }
        });
      }, function (e) { trouble(e, fb); });
    }
    one();
  }

  function nextRound() {
    G.base += G.sizes[G.r]; G.qk = 0;
    G.r++;
    if (G.r >= G.rounds.length) finish();
    else { var nx = G.rounds[G.r]; UI.toast('✅ 這一組完成！接下來換一種題目：' + (nx.prompt || nx.title || ''), 2600); round(); }
  }

  function outOfHearts(fb, disableSel) {
    G.deadR = G.r;   // 修復站要練的就是這一回合
    app.querySelectorAll(disableSel).forEach(function (x) { x.disabled = true; });
    fb.innerHTML = '<div class="note bad pop"><b>💔 愛心用完了</b> 回去看看概念小卡，再挑戰一次。</div><div class="row mt2"><button class="btn primary" id="nx">看結果</button></div>';
    document.getElementById('nx').onclick = gameOver;
  }
  function refreshHud() { var h = document.querySelector('.hud'); if (h) { h.outerHTML = hud(); bindQuit(); } }

  /* sort：一張一張出卡（送出的是「第幾張卡」和「選的類別」，伺服器對答案） */
  function playSort(rd) {
    var all = rd.ordered ? range(rd.items.length) : shuffle(range(rd.items.length)), need = G.sizes[G.r], items = all.slice(0, need), used = items.slice();
    var k = 0;
    function card() {
      var idx = items[k], it = rd.items[idx];
      G.qk = k;
      app.innerHTML = '<section class="card">' + hud() +
        '<p class="small soft bold mt2">' + esc(rd.prompt) + cnt(k) + '</p>' +
        (it.scene ? '<p class="scene mt1">' + esc(it.scene) + '</p>' : '') +
        '<div class="qcard mt1 pop"><div class="big">' + it.icon + '</div><div class="txt">' + esc(it.t) + '</div></div>' +
        '<div class="buckets mt2">' + rd.buckets.map(function (b) {
          return '<button class="pick bucket" data-b="' + b.id + '"><span class="ic">' + b.icon + '</span><span>' + esc(b.label) + '</span></button>';
        }).join('') + '</div><div class="fb mt2" id="fb" aria-live="polite"></div></section>';
      bindQuit();
      function nextCard() { k++; if (k < items.length) card(); else nextRound(); }
      app.querySelectorAll('.bucket').forEach(function (btn) {
        btn.onclick = function () {
          if (busy || btn.disabled) return;
          var fb = document.getElementById('fb');
          if (G.offline) { app.querySelectorAll('.bucket').forEach(function (x) { x.disabled = true; }); btn.classList.add('on'); return offlineNote(fb, k + 1 >= items.length, nextCard); }
          call('ans', { r: G.r, i: idx, v: btn.dataset.b }).then(function (r) {
            var alive = hit(r);
            refreshHud(); fb = document.getElementById('fb');
            if (r.ok) {
              app.querySelectorAll('.bucket').forEach(function (x) { x.disabled = true; });
              btn.classList.add('right');
              fb.innerHTML = '<div class="note ok pop"><b>✅ 答對了！</b> ' + esc(r.why || '') + '</div>' +
                '<div class="row mt2"><button class="btn primary" id="nx">' + (k + 1 < items.length ? '下一張 →' : '完成這回合 →') + '</button></div>';
              var nx = document.getElementById('nx'); nx.focus(); nx.onclick = nextCard;
            } else {
              btn.classList.add('wrong'); btn.disabled = true;
              if (!alive) return outOfHearts(fb, '.bucket');
              var lab = rd.buckets.filter(function (b) { return b.id === btn.dataset.b; })[0];
              if (swapStage() && rd.buckets.length <= 3) {   // 選項少：答錯就換一張，不能翻牌猜
                app.querySelectorAll('.bucket').forEach(function (x) { x.disabled = true; });
                fb.innerHTML = '<div class="note bad pop">❌ 不是「' + esc(lab.label) + '」。選項少的題目答錯就換一張新卡片 —— 用猜的過不了關。</div><div class="row mt2"><button class="btn" id="swap">換一張 →</button></div>';
                document.getElementById('swap').onclick = function () {
                  var fresh = all.filter(function (x) { return used.indexOf(x) < 0; });
                  if (fresh.length) { items[k] = fresh[0]; used.push(fresh[0]); }
                  card();
                };
                return;
              }
              fb.innerHTML = '<div class="note bad pop">❌ 不是「' + esc(lab.label) + '」—— 再想想，換一個答案。</div>';
            }
          }, function (e) { trouble(e, fb); });
        };
      });
    }
    card();
  }

  /* order：依序點選（送出「第幾個位置」和「點的是哪一個」） */
  function playOrder(rd) {
    var shown = shuffle(rd.items), got = 0, n = rd.items.length;
    G.qk = 0;
    app.innerHTML = '<section class="card">' + hud() +
      '<p class="bold mt2">🔢 ' + esc(rd.prompt) + ' <span class="small soft">' + cnt(0) + '</span></p><p class="tiny soft">' + esc(rd.hint || '依序點選：先點排第一的。') + '</p>' +
      '<div class="order-grid mt2">' + shown.map(function (x) {
        return '<button class="pick order-btn" data-t="' + esc(x.t) + '"><div style="font-size:2rem">' + x.icon + '</div><div>' + esc(x.t) + '</div></button>';
      }).join('') + '</div><div class="fb mt2" id="fb" aria-live="polite"></div></section>';
    bindQuit();
    function mark(btn) { btn.classList.add('right'); btn.insertAdjacentHTML('afterbegin', '<span class="n">' + (got + 1) + '</span>'); got++; }
    app.querySelectorAll('.order-btn').forEach(function (btn) {
      btn.onclick = function () {
        if (busy || btn.classList.contains('right')) return;
        var fb = document.getElementById('fb');
        if (G.offline) { mark(btn); if (got === n) offlineNote(fb, true, nextRound); return; }
        call('ans', { r: G.r, i: got, v: btn.dataset.t }).then(function (r) {
          var alive = hit(r);
          refreshHud(); fb = document.getElementById('fb');
          if (r.ok) {
            mark(btn);
            if (got === n) {
              fb.innerHTML = '<div class="note ok pop"><b>✅ 順序正確！</b> ' + esc(r.why || '') + '</div><div class="row mt2"><button class="btn primary" id="nx">下一回合 →</button></div>';
              document.getElementById('nx').onclick = nextRound; document.getElementById('nx').focus();
            } else fb.innerHTML = '';
          } else {
            btn.classList.remove('wrong'); void btn.offsetWidth; btn.classList.add('wrong');
            setTimeout(function () { btn.classList.remove('wrong'); }, 400);
            if (!alive) return outOfHearts(fb, '.order-btn');
            fb.innerHTML = '<div class="note bad pop">❌ 第 ' + (got + 1) + ' 個不是「' + esc(btn.dataset.t) + '」，再想想概念小卡裡的比喻。</div>';
          }
        }, function (e) { trouble(e, fb); });
      };
    });
  }

  /* build：挑零件組出符合需求的東西（客人的規則在伺服器，送出的是選了哪些零件） */
  function playBuild(rd) {
    var c = 0;
    function customer() {
      var cu = rd.customers[c], chosen = {};
      G.qk = c;
      app.innerHTML = '<section class="card">' + hud() +
        '<p class="small soft bold mt2">' + esc(rd.title || '接單組裝') + cnt(c) + '</p>' +
        '<div class="note mt1 pop"><b style="font-size:1.1rem">' + esc(cu.who) + '</b><p class="mt1">' + cu.need + '</p></div>' +
        rd.slots.map(function (s) {
          return '<div class="slot"><b>' + esc(s.label) + '</b><div class="opts">' + s.options.map(function (o) {
            return '<button class="pick opt" data-s="' + s.id + '" data-o="' + o.id + '">' + esc(o.label) + (o.price ? '<div class="price">$' + o.price.toLocaleString() + '</div>' : '') + '</button>';
          }).join('') + '</div></div>';
        }).join('') +
        (rd.base ? '<p class="mt2 row between"><span class="small soft">含基本配備 $' + rd.base.price.toLocaleString() + '</span><span class="total" id="total"></span></p>' : '') +
        '<div class="row mt2"><button class="btn go big" id="submit">📦 交件</button></div><div class="fb mt2" id="fb" aria-live="polite"></div></section>';
      bindQuit();
      function price() {
        var p = rd.base ? rd.base.price : 0;
        rd.slots.forEach(function (s) { var o = chosen[s.id]; if (o && o.price) p += o.price; });
        return p;
      }
      function drawTotal() { var t = document.getElementById('total'); if (t) t.textContent = '合計 $' + price().toLocaleString(); }
      drawTotal();
      app.querySelectorAll('.opt').forEach(function (b) {
        b.onclick = function () {
          var s = rd.slots.filter(function (x) { return x.id === b.dataset.s; })[0];
          chosen[s.id] = s.options.filter(function (o) { return o.id === b.dataset.o; })[0];
          app.querySelectorAll('.opt[data-s="' + s.id + '"]').forEach(function (x) { x.classList.toggle('on', x === b); });
          drawTotal();
        };
      });
      function nextCu() { c++; if (c < rd.customers.length) customer(); else nextRound(); }
      document.getElementById('submit').onclick = function () {
        var fb = document.getElementById('fb');
        if (busy) return;
        var missing = rd.slots.filter(function (s) { return !chosen[s.id]; });
        if (missing.length) { fb.innerHTML = '<div class="note warn">還沒選：' + missing.map(function (s) { return esc(s.label); }).join('、') + '</div>'; return; }
        var key = rd.slots.map(function (s) { return chosen[s.id].id; }).join('|');
        if (G.offline) { app.querySelectorAll('.opt,#submit').forEach(function (x) { x.disabled = true; }); return offlineNote(fb, c + 1 >= rd.customers.length, nextCu); }
        call('ans', { r: G.r, i: c, v: key }).then(function (r) {
          var alive = hit(r);
          refreshHud(); fb = document.getElementById('fb');
          if (r.ok) {
            app.querySelectorAll('.opt,#submit').forEach(function (x) { x.disabled = true; });
            fb.innerHTML = '<div class="note ok pop"><b>✅ 客人很滿意！</b> ' + esc(r.good || '') + '</div><div class="row mt2"><button class="btn primary" id="nx">' + (c + 1 < rd.customers.length ? '下一位客人 →' : '完成這回合 →') + '</button></div>';
            var nx = document.getElementById('nx'); nx.focus(); nx.onclick = nextCu;
          } else {
            if (!alive) return outOfHearts(fb, '.opt,#submit');
            fb.innerHTML = '<div class="note bad pop"><b>❌ 退貨！</b><ul style="margin:.3rem 0 0;padding-left:1.2rem">' + (r.msgs || ['這個組合不符合客人的需求。']).map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul></div>' +
              '<p class="small soft mt1">改一改零件，再交件一次。</p>';
          }
        }, function (e) { trouble(e, fb); });
      };
    }
    customer();
  }

  /* type：自己打答案（可附工具） */
  function playType(rd) {
    var qs = rd.shuffle ? shuffle(range(rd.items.length)) : range(rd.items.length), k = 0;
    function q() {
      var idx = qs[k], it = rd.items[idx];
      G.qk = k;
      app.innerHTML = '<section class="card">' + hud() +
        '<p class="small soft bold mt2">' + esc(rd.prompt) + cnt(k) + '</p>' +
        '<div class="qcard mt1 pop"><div class="big">' + (it.icon || '✏️') + '</div><div class="txt">' + esc(it.t) + '</div>' +
        (it.sub ? '<div class="small soft bold mt1">' + esc(it.sub) + '</div>' : '') + '</div>' +
        (rd.tool ? '<div class="mt2" id="tool"></div>' : '') +
        '<form class="row mt2" id="tf"><input class="input" id="ans" autocomplete="off" style="flex:1;min-width:10rem;margin:0" placeholder="' + esc(it.ph || '輸入答案') + '" aria-label="答案">' +
        '<button class="btn go">確定</button></form><div class="fb mt2" id="fb" aria-live="polite"></div></section>';
      bindQuit();
      if (rd.tool && CARDGAME.tools[rd.tool]) CARDGAME.tools[rd.tool](document.getElementById('tool'), it);
      var inp = document.getElementById('ans'); inp.focus();
      function nextQ() { k++; if (k < qs.length) q(); else nextRound(); }
      document.getElementById('tf').onsubmit = function (e) {
        e.preventDefault();
        var v = norm(inp.value), fb = document.getElementById('fb'); if (!v || busy) return;
        if (G.offline) { inp.disabled = true; document.querySelector('#tf button').disabled = true; return offlineNote(fb, k + 1 >= qs.length, nextQ); }
        call('ans', { r: G.r, i: idx, v: v }).then(function (r) {
          var alive = hit(r);
          refreshHud(); fb = document.getElementById('fb');
          if (r.ok) {
            inp.disabled = true; document.querySelector('#tf button').disabled = true;
            fb.innerHTML = '<div class="note ok pop"><b>✅ 答對了！</b> ' + esc(r.why || '') + '</div>' +
              '<div class="row mt2"><button class="btn primary" id="nx">' + (k + 1 < qs.length ? '下一題 →' : '完成這回合 →') + '</button></div>';
            var nx = document.getElementById('nx'); nx.focus(); nx.onclick = nextQ;
          } else if (!alive) {
            inp.disabled = true; outOfHearts(fb, '#tf button');
          } else {
            inp.select();
            fb.innerHTML = '<div class="note bad pop">❌ 不對喔，再試一次。' + (it.hint ? ' 💡 ' + esc(it.hint) : '') + '</div>';
          }
        }, function (e) { trouble(e, fb); });
      };
    }
    q();
  }

  /* gen：🎲 伺服器隨機出題。網頁只拿到題目（沒有 check／答案）；答錯扣心、伺服器給分層提示；答對才看到解說 */
  function playGen(rd) {
    if (G.offline) return needNet(rd);
    var qs = null, k = 0, n = G.sizes[G.r];
    app.innerHTML = '<section class="card">' + hud() + '<p class="soft bold mt2">🎲 出題中…</p><div class="fb" id="fb"></div></section>';
    call('gen', { r: G.r }).then(function (res) { qs = res.qs; n = qs.length; q(); }, function (e) { trouble(e); });
    function q() {
      var it = qs[k], tool = it.tool || rd.tool, kind = it.kind || 'input', val = null, tries = 0;
      G.qk = k;
      app.innerHTML = '<section class="card">' + hud() +
        '<p class="small soft bold mt2">🎲 ' + esc(it.prompt || rd.prompt) + cnt(k) + '</p>' +
        '<div class="qcard mt1 pop"><div class="big">' + (it.icon || '✏️') + '</div><div class="txt' + (it.mono === false ? '' : ' mono') + '">' + esc(it.t) + '</div>' +
        (it.sub ? '<div class="small soft bold mt1">' + esc(it.sub) + '</div>' : '') + (it.html ? '<div class="mt1">' + it.html + '</div>' : '') + '</div>' +
        (it.hint ? '<div class="note small mt2">💡 提示：' + esc(it.hint) + '</div>' : '') +   // 修復站：伺服器一開始就給提示
        (tool ? '<div class="mt2" id="tool"></div>' : '') + body(it, kind) +
        '<div class="fb mt2" id="fb" aria-live="polite"></div></section>';
      bindQuit();
      if (tool && CARDGAME.tools[tool]) CARDGAME.tools[tool](document.getElementById('tool'), it);
      var form = document.getElementById('tf');
      wire(it, kind, function (v) { val = v; });
      form.onsubmit = function (e) {
        e.preventDefault();
        if (busy) return;
        var v = kind === 'input' ? norm(document.getElementById('ans').value) : val;
        if (v == null || v === '' || (kind === 'order' && v.length < (it.need || it.items.length)) || (kind === 'slots' && v.indexOf(null) >= 0)) {
          return UI.toast(kind === 'order' ? '先把每一個都依序點完' : kind === 'slots' ? '每一格都要選' : '先作答再按確定');
        }
        var fb = document.getElementById('fb');
        call('gq', { q: it.q, v: v }).then(function (r) {
          if (r.ok && r.follow) { G.qt = Date.now(); return follow(it, r.follow, form, fb); }   // 答對了還要追問理由（先不算分）
          var alive = hit(r);
          refreshHud(); fb = document.getElementById('fb');
          if (r.ok) return good(r, form, fb);
          if (!alive) return outOfHearts(fb, '#tf button, #tf input, #tf select');
          tries++;
          if (kind === 'choice' && swapStage()) return swap(fb, '❌ 不對。選擇題答錯就換一題新的 —— 用猜的過不了關。');
          fb.innerHTML = '<div class="note bad pop">❌ 不對喔，再試一次。' + (r.hint ? ' ' + (r.deep ? '🔍 ' : '💡 ') + esc(r.hint) : '') +
            (tries >= 2 ? '<br><span class="tiny">還是卡住？按上面的「📖 小卡」回去看重點。</span>' : '') + '</div>';
          if (kind === 'input') document.getElementById('ans').select();
          if (kind === 'order') { var rs = document.getElementById('reset'); if (rs) rs.click(); }
        }, function (e) { trouble(e, fb); });
      };
    }
    function good(r, form, fb) {
      form.querySelectorAll('input,button,select').forEach(function (x) { x.disabled = true; });
      fb.innerHTML = '<div class="note ok pop"><b>✅ 答對了！</b> ' + esc(r.why || '') + '</div>' +
        '<div class="row mt2"><button class="btn primary" id="nx">' + (k + 1 < n ? '下一題 →' : '完成這回合 →') + '</button></div>';
      var nx = document.getElementById('nx'); nx.focus();
      nx.onclick = function () { k++; if (k < n) q(); else nextRound(); };
    }
    function swap(fb, msg) {
      app.querySelectorAll('#tf button, #tf input, #tf select, .gfol').forEach(function (x) { x.disabled = true; });
      fb.innerHTML = '<div class="note bad pop">' + esc(msg) + '</div><div class="row mt2"><button class="btn" id="swap">換一題 →</button></div>';
      document.getElementById('swap').onclick = function () {
        var qc = app.querySelector('.qcard'); if (qc) qc.remove();   // 舊題目先拿掉，等伺服器出新題
        this.disabled = true;
        call('gen', { r: G.r, one: true }).then(function (res) { qs[k] = res.qs[0]; q(); }, function (e) { trouble(e, fb); });
      };
    }
    /* 追問「為什麼」：選對了還要說得出理由，才算真的懂 */
    function follow(it, f, form, fb) {
      form.querySelectorAll('input,button,select').forEach(function (x) { x.disabled = true; });
      fb.innerHTML = '<div class="note ok pop"><b>✅ 對了！</b> 再追問一題：<b>' + esc(f.q) + '</b></div><div class="buckets mt1">' +
        f.options.map(function (o) { return '<button type="button" class="pick bucket gfol" data-v="' + esc(o.id) + '">' + esc(o.label) + '</button>'; }).join('') + '</div><div id="fb2" class="mt1"></div>';
      app.querySelectorAll('.gfol').forEach(function (b) {
        b.onclick = function () {
          if (busy) return;
          call('gq', { q: it.q, f: b.dataset.v }).then(function (r) {
            var alive = hit(r), fb2 = document.getElementById('fb2');
            refreshHud();
            if (r.ok) { b.classList.add('right'); app.querySelectorAll('.gfol').forEach(function (x) { x.disabled = true; }); fb2.innerHTML = ''; return good(r, form, fb2); }
            b.classList.add('wrong');
            if (!alive) return outOfHearts(fb2, '.gfol');
            swap(fb2, '❌ 答案對，但理由不對 —— 可能是猜的。換一題新的。');
          }, function (e) { trouble(e, document.getElementById('fb2')); });
        };
      });
    }
    /* 各種動手題型的畫面 */
    function body(it, kind) {
      var go = '<button class="btn go">確定</button>';
      if (kind === 'choice') return '<form id="tf" class="mt2"><div class="buckets">' + it.options.map(function (o) {
        return '<button type="button" class="pick bucket gopt" data-v="' + esc(o.id) + '">' + (o.icon ? '<span class="ic">' + o.icon + '</span>' : '') + '<span>' + esc(o.label) + '</span></button>'; }).join('') +
        '</div><div class="row mt2">' + go + '<span class="tiny soft">先選一個，再按確定</span></div></form>';
      if (kind === 'order') return '<form id="tf" class="mt2"><p class="tiny soft bold">依序點下去（點錯可以按「重排」）</p><div class="gorder mt1">' + it.items.map(function (x, i) {
        return '<button type="button" class="pick gitem" data-i="' + i + '">' + (x.icon ? '<div style="font-size:1.6rem">' + x.icon + '</div>' : '') + '<div class="bold">' + esc(x.t) + '</div></button>'; }).join('') +
        '</div><div class="gseq mt2" id="seq"><span class="tiny soft">還沒點</span></div><div class="row mt2">' + go + '<button type="button" class="btn sm" id="reset">↺ 重排</button></div></form>';
      if (kind === 'slots') return '<form id="tf" class="mt2"><div class="gslots">' + it.parts.map(function (p, i) {
        return '<label class="gslot"><span class="bold mono">' + esc(p.t) + '</span>' + (p.sub ? '<span class="tiny soft">' + esc(p.sub) + '</span>' : '') +
          '<select class="input" data-i="' + i + '"><option value="">— 選一個 —</option>' + (p.options || it.options).map(function (o) { return '<option value="' + esc(o.id) + '">' + esc(o.label) + '</option>'; }).join('') + '</select></label>'; }).join('') +
        '</div><div class="row mt2">' + go + '</div></form>';
      if (kind === 'bits') return '<form id="tf" class="mt2"><div class="gbits" id="gbits"></div><div class="row mt2">' + go + '</div></form>';
      return '<form class="row mt2" id="tf"><input class="input" id="ans" autocomplete="off" style="flex:1;min-width:10rem;margin:0" placeholder="' + esc(it.ph || '輸入答案') + '" aria-label="答案">' + go + '</form>';
    }
    function wire(it, kind, set) {
      if (kind === 'input') { document.getElementById('ans').focus(); return; }
      if (kind === 'choice') app.querySelectorAll('.gopt').forEach(function (b) {
        b.onclick = function () { app.querySelectorAll('.gopt').forEach(function (x) { x.classList.toggle('on', x === b); }); set(b.dataset.v); };
      });
      if (kind === 'order') {   // 送出的是「畫面上第幾個」的順序，伺服器自己對照
        var seq = [];
        function show() {
          document.getElementById('seq').innerHTML = seq.length ? seq.map(function (i, n) { return '<span class="chip">' + (n + 1) + '. ' + esc(it.items[i].t) + '</span>'; }).join(' → ') : '<span class="tiny soft">還沒點</span>';
          app.querySelectorAll('.gitem').forEach(function (b) { var n = seq.indexOf(+b.dataset.i); b.classList.toggle('on', n >= 0); b.disabled = n >= 0; });
          set(seq.slice());
        }
        app.querySelectorAll('.gitem').forEach(function (b) { b.onclick = function () { seq.push(+b.dataset.i); show(); }; });
        document.getElementById('reset').onclick = function () { seq = []; show(); };
        show();
      }
      if (kind === 'slots') {
        var picks = it.parts.map(function () { return null; });
        app.querySelectorAll('.gslot select').forEach(function (sel) { sel.onchange = function () { picks[+sel.dataset.i] = sel.value || null; set(picks.slice()); }; });
        set(picks.slice());
      }
      if (kind === 'bits') {
        var n = it.n || 8, bits = []; for (var j = 0; j < n; j++) bits.push(0);
        function drawBits() {
          var sum = bits.reduce(function (a, b, j) { return a + b * Math.pow(2, n - 1 - j); }, 0);
          document.getElementById('gbits').innerHTML = '<div class="row" style="flex-wrap:nowrap;overflow-x:auto">' + bits.map(function (b, j) {
            return '<button type="button" class="pick mono gbit' + (b ? ' on' : '') + '" data-j="' + j + '"><div class="tiny soft">' + Math.pow(2, n - 1 - j) + '</div><div class="black" style="font-size:1.25rem">' + b + '</div></button>'; }).join('') +
            (it.showSum === false ? '' : '<span class="bold mono" style="margin-left:.5rem">＝ ' + sum + '</span>') + '</div>';
          app.querySelectorAll('.gbit').forEach(function (b) { b.onclick = function () { bits[+b.dataset.j] ^= 1; drawBits(); }; });
          set(bits.join(''));
        }
        drawBits();
      }
    }
  }

  /* ── 結束：請伺服器結算（每一回合都做完才給星，附簽章收據） ── */
  function finish() {
    if (G.offline) return offlineDone();
    var g = G;
    app.innerHTML = '<section class="card center"><p class="soft bold">⏳ 結算中…</p><div id="fb"></div></section>';
    call('fin', {}).then(function (res) {
      if (G !== g) return;
      if (g.practice) return repairDone();
      if (g.st != null) return finishStage(res);
      finishLevel(res);
    }, function (e) { trouble(e); });
  }
  function offlineDone() {
    var i = G.i, s = G.st;
    app.innerHTML = '<section class="card pop center"><p style="font-size:3rem">📴</p><h2 class="black">練習完成</h2>' +
      '<p class="soft mt1">練習模式不判斷對錯、不記星。連上網路後再挑戰一次，就會判斷、記星。</p>' +
      '<div class="row mt3" style="justify-content:center"><button class="btn go" id="again">🔁 再挑戰一次</button><button class="btn" id="back">← 關卡選單</button></div></section>';
    document.getElementById('again').onclick = function () { API.retry(); start(i, s); };
    document.getElementById('back').onclick = menu;
  }
  function finishLevel(res) {
    var stars = res.stars, lv = G.lv, i = G.i;
    var r = STORE.saveLevel(MOD, lv.id, { stars: stars, rc: res.rc, ts: res.ts, score: Math.round(G.right / Math.max(1, G.total) * 100), extra: { maxCombo: G.maxCombo } });
    app.innerHTML = '<section class="card pop center"><div class="tape"></div><p class="kicker">過關！</p>' +
      '<h2 class="black" style="font-size:1.6rem">' + lv.icon + ' ' + esc(lv.title) + '</h2>' +
      '<div class="end-star mt1">' + UI.stars(stars) + '</div>' +
      '<p class="bold">答對 ' + G.right + ' / ' + G.total + ' · 最高連對 ' + G.maxCombo + '</p>' +
      (r.improved ? '<p class="note ok small mt2" style="display:inline-block">⭐ 新紀錄已儲存！</p>' : '<p class="small soft mt1">最佳紀錄：' + UI.stars(best(lv.id)) + '</p>') +
      '<div class="row mt3" style="justify-content:center"><button class="btn" id="again">🔁 再玩一次</button></div>' +
      '<nav id="end-pager"></nav></section>';
    document.getElementById('again').onclick = function () { start(i); };
    endPager(i);
    if (r.improved) UI.toast('⭐ ' + lv.title + '：' + '★'.repeat(stars));
  }
  function endPager(i) {   // 結尾：← 關卡選單／下一關 →（和全站的「上一課／下一課」同一組樣式）
    var N = L[i + 1];
    UI.pager('#end-pager', { id: 'menu', lbl: '← 回到', title: '關卡選單', go: menu },
      !N ? null : open(i + 1) ? { id: 'next', lbl: '下一關 →', title: N.icon + ' ' + N.title, go: function () { learn(i + 1); } }
        : { id: 'next', locked: true, lbl: '🔒 下一關', title: '這一關拿到 2⭐ 才開放', go: function () { UI.toast('這一關拿到 2 顆星，下一關才會開放'); } });
  }

  /* 三星三階：過了這一階 → 星數＝第幾階 */
  function finishStage(res) {
    var lv = G.lv, i = G.i, s = G.st, stars = res.stars, more = s + 1 < lv.stages.length;
    var r = STORE.saveLevel(MOD, lv.id, { stars: stars, rc: res.rc, ts: res.ts, score: Math.round(G.right / Math.max(1, G.total) * 100) });
    app.innerHTML = '<section class="card pop center"><div class="tape"></div><p class="kicker">第 ' + (s + 1) + ' 階 · ' + STAGE[s].n + ' 通過！</p>' +
      '<h2 class="black" style="font-size:1.6rem">' + lv.icon + ' ' + esc(lv.title) + '</h2>' +
      '<div class="end-star mt1">' + UI.stars(stars) + '</div>' +
      '<p class="bold">答對 ' + G.right + ' / ' + G.total + ' · 剩 ' + G.hearts + ' 顆 ❤️</p>' +
      (r.improved ? '<p class="note ok small mt2" style="display:inline-block">⭐ 新紀錄已儲存！</p>' : '<p class="small soft mt1">最佳紀錄：' + UI.stars(best(lv.id)) + '</p>') +
      (more ? '<div class="row mt3" style="justify-content:center"><button class="btn go big" id="up">挑戰第 ' + (s + 2) + ' 階：' + STAGE[s + 1].ic + ' ' + STAGE[s + 1].n + ' ▶</button><button class="btn" id="again">🔁 這一階再玩一次</button></div>'
        : '<p class="note ok small mt2" style="display:inline-block">🏆 三階全部通過！想刷新紀錄或練習，可以再挑戰一次（題目會不一樣）。</p><div class="row mt2" style="justify-content:center"><button class="btn" id="again">🔁 再挑戰一次</button></div>') +
      '<nav id="end-pager"></nav></section>';
    document.getElementById('again').onclick = function () { start(i, s); };
    var up = document.getElementById('up'); if (up) { up.onclick = function () { start(i, s + 1); }; up.focus(); }
    endPager(i);
    if (r.improved) UI.toast('⭐ ' + lv.title + '：' + '★'.repeat(stars));
  }

  /* 🩹 修復站：❤️ 用完後，針對卡住的那一回合先練習（不扣心、先給提示），才能重新挑戰 */
  function gameOver() {
    var i = G.i, s = G.st, focus = G.deadR != null ? G.deadR : G.r, rd = G.rounds[focus];
    var canDrill = rd && (rd.type === 'gen' || rd.type === 'sort' || rd.type === 'lab');
    app.innerHTML = '<section class="card pop center"><p style="font-size:3rem">💔</p><h2 class="black">' + (s != null ? '第 ' + (s + 1) + ' 階的' : '') + '愛心用完了</h2>' +
      '<p class="soft mt1">先到 <b>🩹 修復站</b> 把卡住的地方補起來，再重新挑戰（題目會換一組；已經拿到的星星不會不見）。</p>' +
      '<div class="note mt2" style="text-align:left">🩹 卡住的回合：<b>' + esc(rd ? (rd.prompt || rd.title || '這一回合') : '這一回合') + '</b><br>' +
      (canDrill ? (rd.type === 'lab' ? '在實驗站再做 1 次：不扣心、先給提示。' : '練 2 題：不扣心、題目上方先給提示，答完看解說。') : '先把概念小卡讀一遍（看著畫面 10 秒）。') + '</div>' +
      '<div class="row mt3" style="justify-content:center"><button class="btn go big" id="repair-go">🩹 進入修復站</button></div></section>';
    var go = document.getElementById('repair-go'); go.focus();
    go.onclick = function () { if (!canDrill) return readCard(); start(i, s, focus); };
  }
  function readCard() {
    var lv = G.lv;
    app.innerHTML = '<section class="card pop"><p class="kicker">🩹 修復站 · 讀概念小卡</p><h2 class="black" style="font-size:1.4rem">' + lv.icon + ' ' + esc(lv.title) + '</h2>' +
      '<div class="note mt2 learn">' + lv.learn + '</div><p class="small bold mt2" id="read-msg">看著這個畫面 <span id="read-n">10</span> 秒（離開畫面會重算）</p>' +
      '<div class="row mt1"><button class="btn go" id="read-ok" disabled>讀完了</button></div></section>';
    var left = 10, away = false, n = document.getElementById('read-n');
    function onBlur() { away = true; left = 10; n.textContent = left; document.getElementById('read-msg').style.color = 'var(--bad)'; }
    function onFocus() { away = false; }
    function onVis() { if (document.hidden) onBlur(); else onFocus(); }
    window.addEventListener('blur', onBlur); window.addEventListener('focus', onFocus); document.addEventListener('visibilitychange', onVis);
    var tm = setInterval(function () {
      if (!document.getElementById('read-n')) { clearInterval(tm); return; }
      if (away || document.hidden) return;
      left--; n.textContent = Math.max(0, left);
      if (left <= 0) {
        clearInterval(tm); window.removeEventListener('blur', onBlur); window.removeEventListener('focus', onFocus); document.removeEventListener('visibilitychange', onVis);
        var b = document.getElementById('read-ok'); b.disabled = false; b.focus(); b.onclick = repairDone;
      }
    }, 1000);
  }
  function repairDone() {
    var i = G.i, s = G.st;
    app.innerHTML = '<section class="card pop center"><p style="font-size:3rem">🩹</p><h2 class="black">修復完成！</h2>' +
      '<p class="soft mt1">觀念補起來了，重新挑戰吧（題目會換一組）。</p><nav id="end-pager"></nav></section>';
    UI.pager('#end-pager', { id: 'menu', lbl: '← 回到', title: '概念小卡', go: function () { learn(i); } },
      { id: 'retry', lbl: '重新挑戰 →', title: s != null ? STAGE[s].ic + ' 第 ' + (s + 1) + ' 階　' + STAGE[s].n : '📖 ' + L[i].title, go: function () { start(i, s); } });
    document.getElementById('retry').focus();
  }
  UI.requireLogin(function () {
    var want = (location.hash || '').slice(1);
    var i = L.findIndex(function (lv) { return lv.id === want; });
    if (i >= 0 && open(i)) learn(i); else menu();
  });
  return { menu: menu, learn: learn };
};

/* ── 答題工具 ─────────────────────────────── */
CARDGAME.tools = {   // 答題工具：畫在題目下面，幫學生算（不含答案）
  /* 凱薩轉盤：外圈明文、內圈密文，可以自己轉 */
  caesar: function (el, it) {
    var A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', shift = it.toolShift != null ? it.toolShift : 0;
    function draw() {
      el.innerHTML = '<div class="card soft-bg" style="padding:.8rem"><div class="row between"><b class="small">🎡 凱薩轉盤（上排明文 → 下排密文）</b>' +
        '<span class="row"><button type="button" class="btn sm" data-d="-1">◀</button><span class="bold mono">位移 ' + shift + '</span><button type="button" class="btn sm" data-d="1">▶</button></span></div>' +
        '<div class="scroll-x mt1"><table class="t mono" style="text-align:center;min-width:40rem"><tr>' + A.split('').map(function (c) { return '<td style="text-align:center;padding:.25rem">' + c + '</td>'; }).join('') + '</tr><tr>' +
        A.split('').map(function (c, i) { return '<td style="text-align:center;padding:.25rem;color:var(--unit);font-weight:900">' + A[(i + shift + 26) % 26] + '</td>'; }).join('') + '</tr></table></div></div>';
      el.querySelectorAll('[data-d]').forEach(function (b) { b.onclick = function () { shift = (shift + (+b.dataset.d) + 26) % 26; draw(); }; });
    }
    draw();
  },
  /* 維吉尼亞：列出每個位置的金鑰，並附一小張密碼表 */
  vigenere: function (el) {
    var A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    el.innerHTML = '<details class="card soft-bg" style="padding:.8rem"><summary class="bold small" style="cursor:pointer">📜 維吉尼亞密碼表（點開）</summary><div class="scroll-x mt1"><table class="t mono" style="min-width:44rem;font-size:.78rem"><tr><th>金鑰</th>' +
      A.split('').map(function (c) { return '<th style="text-align:center;padding:.15rem">' + c + '</th>'; }).join('') + '</tr>' +
      A.split('').map(function (_, r) { return '<tr><th>' + r + '</th>' + A.split('').map(function (c, i) { return '<td style="text-align:center;padding:.15rem">' + A[(i + r) % 26] + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</table></div></details>';
  },
  /* 位元權值表：8 個位元，點一下切換 0／1 */
  binary: function (el) {
    var bits = [0, 0, 0, 0, 0, 0, 0, 0], W = [128, 64, 32, 16, 8, 4, 2, 1];
    function draw() {
      var sum = bits.reduce(function (s, b, i) { return s + b * W[i]; }, 0);
      el.innerHTML = '<div class="card soft-bg" style="padding:.8rem"><b class="small">🔢 位元計算機（點格子切換 0／1）</b><div class="row mt1" style="flex-wrap:nowrap;overflow-x:auto">' +
        bits.map(function (b, i) { return '<button type="button" class="pick mono" data-i="' + i + '" style="text-align:center;min-width:3rem;padding:.4rem"><div class="tiny soft">' + W[i] + '</div><div class="black" style="font-size:1.2rem">' + b + '</div></button>'; }).join('') +
        '<span class="bold mono" style="margin-left:.5rem">＝ ' + sum + '</span></div></div>';
      el.querySelectorAll('[data-i]').forEach(function (b) { b.onclick = function () { bits[+b.dataset.i] ^= 1; draw(); }; });
    }
    draw();
  }
};
(function () {
  var A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  /* 字母編號表 */
  CARDGAME.tools.abc = function (el) {
    el.innerHTML = '<div class="card soft-bg" style="padding:.8rem"><b class="small">🔤 字母編號表</b><div class="scroll-x mt1"><table class="t mono" style="min-width:40rem"><tr>' +
      A.split('').map(function (c) { return '<td style="text-align:center;padding:.25rem">' + c + '</td>'; }).join('') + '</tr><tr>' +
      A.split('').map(function (c, i) { return '<td style="text-align:center;padding:.25rem;color:var(--unit);font-weight:900">' + i + '</td>'; }).join('') + '</tr></table></div></div>';
  };
  /* 計數表：點一下作答格子做記號，自動算有幾格被點 */
  CARDGAME.tools.tally = function (el, it) {
    var d = it.data, on = {};
    function draw() {
      var n = Object.keys(on).length;
      el.innerHTML = '<div class="card soft-bg" style="padding:.8rem"><div class="row between"><b class="small">📋 全班作答（點一下做記號）</b><span class="chip">已點 ' + n + ' 格</span></div>' +
        '<div class="row mt1" style="gap:.35rem">' + d.ans.map(function (a, i) {
          return '<button type="button" class="pick mono" data-i="' + i + '" style="min-width:3.2rem;padding:.35rem;text-align:center' + (on[i] ? ';border-color:var(--ok);background:var(--ok-bg)' : '') + '">' +
            '<div class="tiny soft">' + (i + 1) + ' 號</div><div class="black">' + a + (on[i] ? ' ✔' : '') + '</div></button>';
        }).join('') + '</div><div class="row mt1"><button type="button" class="btn sm" id="tally-clear">清除記號</button></div></div>';
      el.querySelectorAll('[data-i]').forEach(function (b) { b.onclick = function () { var i = +b.dataset.i; if (on[i]) delete on[i]; else on[i] = 1; draw(); }; });
      el.querySelector('#tally-clear').onclick = function () { on = {}; draw(); };
    }
    draw();
  };
})();
