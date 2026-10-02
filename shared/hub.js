/* =====================================================================
   闖關地圖引擎（兩學期共用）
   ---------------------------------------------------------------------
   內容全部來自 config.js 的 MODULES／RANKS，這支只管「怎麼畫」。
   稱號看「平均完成度」：每個計星單元各自的完成 %，再取平均（單元星數不同也一樣公平）。
   📅 本週任務：config.js 的 TERM_START（第 1 週星期一）＋ WEEKS（每週要完成的關卡）算出現在第幾週
   🏅 成就徽章：從學習紀錄算出來；拿到過就一直保留（存在這位學生的暫存區）
   需要：config.js、store.js、ui.js
   ===================================================================== */
(function () {
  var C = window.CONFIG, esc = UI.esc;

  // 一個單元可以包好幾個部分（parts，例如單元六：資料偵探＋試算表＋密碼特務），進度就把各部分加起來
  function pythonJourneyProgress() {
    try {
      var s = JSON.parse(localStorage.getItem('course115_v3_progress') || '{}');
      var need = {p1:2,p2:3,p3:3,p4:2,p5:3,p6:2,p7:2,p8:3,p9:3,p10:3};
      var stars = 0, done = 0;
      Object.keys(need).forEach(function (id) {
        var n = Math.max(0, Math.min(need[id], +(s[id] || 0)));
        stars += n;
        if (n >= need[id]) done++;
      });
      return { stars: stars, done: done, state: s, need: need };
    } catch (e) { return { stars:0, done:0, state:{}, need:{} }; }
  }
  function modStars(m) {
    if (m.id === 'python') return Math.max(STORE.moduleStars('python'), pythonJourneyProgress().stars);
    return m.parts ? m.parts.reduce(function (a, p) { return a + STORE.partStars(p); }, 0) : STORE.moduleStars(m.id);
  }
  function modDone(m) {
    if (m.id === 'python') return Math.max(STORE.moduleDone('python'), pythonJourneyProgress().done);
    return m.parts ? m.parts.reduce(function (a, p) { return a + STORE.partDone(p); }, 0) : STORE.moduleDone(m.id);
  }

  // 平均完成度：每個計星單元各自算完成 %，再平均（每個單元份量一樣；maxStars 是 0 的不算。5016B 從 2026-09-28 起計星，也算進來）
  function pctOf(m) { return m.maxStars ? Math.min(1, modStars(m) / m.maxStars) : 0; }
  function avgPct(mods) {
    var S = mods.filter(function (m) { return m.maxStars && !m.soon; });
    return S.length ? Math.floor(S.reduce(function (a, m) { return a + pctOf(m); }, 0) / S.length * 100) : 0;
  }

  /* ── 📅 本週任務 ─────────────────────────── */
  // 關卡 id → 存在哪個模組（有 parts 的單元，進度存在各部分自己的 id 或 mod）
  function modOfLevel(id) {
    for (var i = 0; i < C.MODULES.length; i++) {
      var m = C.MODULES[i];
      if (m.parts) for (var j = 0; j < m.parts.length; j++) if (m.parts[j].levels.indexOf(id) >= 0) return m.parts[j].mod || m.parts[j].id;
      if (!m.parts && m.levels.indexOf(id) >= 0) return m.id;
    }
    return null;
  }
  function recOf(id) {
    var m = modOfLevel(id);
    if (!m) return null;
    if (m === 'python' && /^P\d+$/.test(id)) {
      var pj = pythonJourneyProgress(), key = id.toLowerCase(), n = +(pj.state[key] || 0), max = pj.need[key] || 0;
      var legacy = STORE.level('python', id);
      if (legacy && +(legacy.stars || 0) > n) return legacy;
      return n ? { stars:n, done:max>0 && n>=max } : legacy;
    }
    return STORE.level(m, id);
  }
  function passed(id) { var r = recOf(id); return !!(r && ((r.stars || 0) > 0 || r.done)); }
  function today() {   // ?today=2028-03-01 可以預覽某一天（老師備課、測試用）
    var q = (location.search.match(/[?&]today=(\d{4}-\d{2}-\d{2})/) || [])[1];
    return q ? new Date(q + 'T12:00:00') : new Date();
  }
  function weekNo() {
    if (!C.TERM_START) return null;
    var d0 = new Date(C.TERM_START + 'T00:00:00');
    return Math.floor((today() - d0) / 864e5 / 7) + 1;
  }
  function weekInfo() {
    var W = C.WEEKS || []; if (!W.length) return null;
    var n = weekNo(); if (n == null) return null;
    var cur = null;
    for (var i = 0; i < W.length; i++) if (n >= W[i].w) cur = W[i];
    var before = n < W[0].w, after = n > W[W.length - 1].w + 1;
    if (before) cur = W[0];
    return { n: n, cur: cur, before: before, after: after, todo: cur.levels.filter(function (id) { return !passed(id); }) };
  }
  function weekCard() {
    var w = weekInfo(); if (!w) return '';
    var cur = w.cur;
    if (w.after) {   // 學期末：列出整學期還沒完成的
      var left = [].concat.apply([], (C.WEEKS || []).map(function (x) { return x.levels; })).filter(function (id) { return !passed(id); });
      return '<section class="card mt3 wk" aria-label="本週任務"><h2 class="black" style="font-size:1.1rem">📅 學期尾聲</h2>' +
        (left.length ? '<p class="small mt1">還沒完成：' + left.map(function (id) { return '<span class="chip">' + esc(id) + '</span>'; }).join(' ') + '</p>' : '<p class="small mt1">🎉 這學期的任務全部完成！</p>') + '</section>';
    }
    var doneN = cur.levels.length - w.todo.length, pct = Math.round(doneN / cur.levels.length * 100);
    return '<section class="card mt3 wk" aria-label="本週任務"><div class="row between"><h2 class="black" style="font-size:1.1rem">📅 ' + (w.before ? '開學預告 · 第 1 週' : '第 ' + w.n + ' 週 · 本週任務') + '</h2>' +
      '<span class="chip">' + (w.todo.length ? '完成 ' + doneN + ' / ' + cur.levels.length : '✅ 本週完成！') + '</span></div>' +
      '<p class="small bold mt1">' + esc(cur.t) + '</p>' +
      '<div class="wk-list mt1">' + cur.levels.map(function (id) {
        var r = recOf(id), ok = passed(id);
        return '<span class="wk-i' + (ok ? ' ok' : '') + '">' + (ok ? '✅' : '⬜') + ' ' + esc(id) + (r && r.stars ? ' <small>' + '⭐'.repeat(r.stars) + '</small>' : '') + '</span>';
      }).join('') + '</div>' +
      '<div class="bar mt1"><i style="width:' + pct + '%"></i></div>' +
      (cur.href && w.todo.length ? '<p class="small mt1"><a class="bold" href="' + esc(cur.href) + '">前往本週任務 →</a></p>' : '') + '</section>';
  }

  /* ── 🏅 成就徽章 ─────────────────────────── */
  function allRecs() {
    var out = [];
    C.MODULES.forEach(function (m) {
      (m.parts || [m]).forEach(function (p) {
        p.levels.forEach(function (id) { var r = STORE.level(p.mod || p.id, id); if (r) out.push({ id: id, r: r, star: !!m.maxStars }); });
      });
    });
    return out;
  }
  var BADGES = [
    { id: 'first', ic: '🌱', t: '起步', need: '拿到第一顆星', ok: function (R) { return R.some(function (x) { return (x.r.stars || 0) >= 1; }); } },
    { id: 'three', ic: '⭐', t: '三星初體驗', need: '任一關拿到 3⭐', ok: function (R) { return R.some(function (x) { return x.r.stars >= 3; }); } },
    { id: 'combo', ic: '🔥', t: '手感發燙', need: '一次挑戰連對 8 題', ok: function (R) { return R.some(function (x) { return x.r.extra && x.r.extra.maxCombo >= 8; }); } },
    { id: 'lab', ic: '🧪', t: '實驗家', need: '10 關達到 2⭐（過了操作階）', ok: function (R) { return R.filter(function (x) { return x.r.stars >= 2; }).length >= 10; } },
    { id: 'hard', ic: '🏆', t: '挑戰王', need: '10 關拿到 3⭐', ok: function (R) { return R.filter(function (x) { return x.r.stars >= 3; }).length >= 10; } },
    { id: 'week', ic: '📅', t: '準時完成', need: '把本週任務全部完成', ok: function () { var w = weekInfo(); return !!(w && !w.before && !w.after && !w.todo.length); } },
    { id: 'unit', ic: '🏅', t: '單元制霸', need: '任一單元拿滿星星', ok: function () { return C.MODULES.some(function (m) { return m.maxStars && modStars(m) >= m.maxStars; }); } },
    { id: 'maker', ic: '🛠️', t: '動手做', need: '完成一個實作步驟（廣告工作站、5016B 專題）', ok: function (R) { return R.some(function (x) { return x.r.done; }); } },
    { id: 'all', ic: '🎓', t: '全部制霸', need: '所有計星單元都拿滿', ok: function () { var S = C.MODULES.filter(function (m) { return m.maxStars; }); return S.length && S.every(function (m) { return modStars(m) >= m.maxStars; }); } }
  ];
  function badges() {
    var R = allRecs(), had = (STORE.draft('badges') || '').split(',').filter(Boolean), got = had.slice(), fresh = [];
    BADGES.forEach(function (b) { if (got.indexOf(b.id) < 0 && b.ok(R)) { got.push(b.id); fresh.push(b); } });
    if (fresh.length) STORE.draft('badges', got.join(','));
    return { got: got, fresh: fresh };
  }
  function badgeCard(B) {
    return '<section class="card mt3" aria-label="成就徽章"><div class="row between"><h2 class="black" style="font-size:1.1rem">🏅 成就徽章</h2><span class="chip">' + B.got.length + ' / ' + BADGES.length + '</span></div>' +
      '<div class="bdg-list mt1">' + BADGES.map(function (b) {
        var on = B.got.indexOf(b.id) >= 0;
        return '<div class="bdg' + (on ? ' on' : '') + '" title="' + esc(b.need) + '"><span class="bdg-ic" aria-hidden="true">' + (on ? b.ic : '🔒') + '</span><b>' + esc(b.t) + '</b><small>' + esc(b.need) + '</small></div>';
      }).join('') + '</div></section>';
  }

  function rankOf(total) {
    var r = C.RANKS || [[0, '']], cur = r[0], next = null;
    for (var i = 0; i < r.length; i++) {
      if (total >= r[i][0]) { cur = r[i]; next = r[i + 1] || null; }
    }
    return { cur: cur, next: next };
  }

  function render() {
    var root = document.getElementById('hub');
    var p = STORE.me();
    var mods = C.MODULES;
    var total = 0, max = 0;
    mods.forEach(function (m) { total += modStars(m); max += m.maxStars; });
    var avg = avgPct(mods), rk = rankOf(avg);
    var toNext = rk.next ? (rk.next[0] - avg) : 0;
    var nextMod = mods.filter(function (m) { return !m.soon && modDone(m) < m.levels.length; })[0];

    var head =
      '<section class="card pop" style="padding:1.5rem"><div class="tape"></div>' +
      '<div class="row between">' +
      '<div><p class="kicker">' + esc(C.SCHOOL) + ' · ' + esc(SEMESTER.name(C.TERM)) + '（' + esc(C.TERM) + '）</p>' +
      '<h1 class="title">資訊科技闖關地圖</h1>' +
      (p ? '<p class="soft bold mt1">' + esc(p.name) + '，歡迎回來！</p>' : '') + '</div>' +
      '<div class="center" style="min-width:12rem">' +
      '<div class="black" style="font-size:1.35rem">' + esc(rk.cur[1]) + '</div>' +
      '<div class="small soft bold">平均完成度 <span class="black" id="avg-pct" style="color:var(--star-ink);font-size:1.2rem">' + avg + '%</span></div>' +
      '<div class="bar mt1"><i style="width:' + avg + '%"></i></div>' +
      '<div class="tiny soft mt1">⭐ 總星數 ' + total + ' / ' + max + ' · ' + (rk.next ? '平均再 ' + toNext + '% 升級為 ' + esc(rk.next[1]) : '已達最高稱號！') + '</div>' +
      '<div class="tiny faint">每個單元各算完成 %，再取平均</div>' +
      '</div></div>' +
      (nextMod ? '<div class="note mt2 small"><b>下一步建議：</b>單元' + esc(nextMod.no) + '「' + esc(nextMod.title) + '」—— <a href="' + esc(nextMod.href) + '" class="bold">前往 →</a></div>' : '<div class="note ok mt2 small"><b>全部完成！</b>去 5016B 做一個自己的專題吧。</div>') +
      openAllBanner() + backupNote(total) +
      '</section>';

    var cards = mods.map(function (m, i) {
      var s = modStars(m), d = modDone(m), n = m.levels.length;
      var pct = m.maxStars ? Math.round(s / m.maxStars * 100) : Math.round(d / n * 100);
      var status = m.soon ? '🚧 規劃中' : (d >= n ? '✅ 完成' : (d > 0 ? '進行中' : '尚未開始'));
      var tag = m.soon ? 'div' : 'a';
      return '<' + tag + ' class="card pop" ' + (m.soon ? 'aria-disabled="true"' : 'href="' + esc(m.href) + '"') + ' style="' + (m.soon ? 'opacity:.7;' : '') + 'text-decoration:none;animation-delay:' + (i * 60) + 'ms;border-top:6px solid var(--' + m.color + ')">' +
        '<div class="row between"><span class="chip" style="background:var(--' + m.color + '-bg);border-color:transparent;color:var(--' + m.color + ')">' +
        (m.no === '＋' ? '延伸挑戰' : '單元' + esc(m.no)) + ' · ' + esc(m.chapter) + '</span><span class="tiny bold soft">' + status + '</span></div>' +
        '<div class="row mt2" style="align-items:flex-start;flex-wrap:nowrap"><div style="font-size:2.4rem;line-height:1">' + m.icon + '</div>' +
        '<div><h2 style="font-size:1.25rem" class="black">' + esc(m.title) + '</h2><p class="small soft bold">' + esc(m.sub) + '</p></div></div>' +
        '<p class="small mt1">' + esc(m.desc) + '</p>' +
        '<div class="mt2 row between small bold">' +
        (m.maxStars ? '<span>⭐ ' + s + ' / ' + m.maxStars + ' · <span class="upct">' + pct + '%</span></span>' : '<span>不計星 · 記錄完成</span>') +
        '<span class="soft">' + d + ' / ' + n + (m.id === 'arduino' ? ' 節' : ' 關') + '</span></div>' +
        '<div class="bar mt1"><i style="width:' + pct + '%;' + (m.maxStars ? '' : 'background:var(--u4)') + '"></i></div>' +
        '</' + tag + '>';
    }).join('');

    var foot =
      '<section class="mt3 row small soft" style="justify-content:center">' +
      '<button class="btn sm" id="btn-export">⬇ 下載我的進度</button>' +
      '<label class="btn sm" style="cursor:pointer">⬆ 匯入進度<input type="file" id="file-import" accept=".json" hidden></label>' +
      '<button class="btn sm" id="btn-logout">換人登入</button>' +
      (C.REVIEW_PAGE ? '<a class="btn sm" href="' + esc(C.REVIEW_PAGE) + '">🎓 會考前總複習</a>' : '') +
      (C.CHALLENGE_PAGE ? '<a class="btn sm" href="' + esc(C.CHALLENGE_PAGE) + '">🏁 課堂挑戰（老師投影）</a>' : '') + '</section>' +
      '<p class="tiny faint center mt2">目前為本機版：進度只存在這台電腦的瀏覽器。換電腦前請先「下載我的進度」。</p>';

    var B = badges();
    root.innerHTML = head + weekCard() + '<section class="grid g2 mt3">' + cards + '</section>' + badgeCard(B) + '<div id="learncard"></div>' + foot;
    if (window.LEARNCARD) LEARNCARD.mount('#learncard');
    B.fresh.forEach(function (b, k) { setTimeout(function () { UI.toast('🏅 獲得徽章：' + b.ic + ' ' + b.t + '！'); }, 400 + k * 1800); });

    root.querySelector('#btn-logout').onclick = function () {
      if (confirm('確定要登出嗎？（進度不會被刪除）')) { STORE.logout(); UI.requireLogin(render); }
    };
    root.querySelector('#btn-export').onclick = exportNow;
    var e2 = root.querySelector('#btn-export2'); if (e2) e2.onclick = exportNow;
    root.querySelector('#file-import').onchange = function (e) {
      var f = e.target.files[0]; if (!f) return;
      f.text().then(function (t) {
        var err = STORE.importJSON(t);
        UI.toast(err || '進度已匯入！');
      });
    };
  }

  /* 💾 進度下載提醒：本機版的進度只在這台電腦，有進度卻超過 7 天沒下載就提醒 */
  function backupNote(total) {
    var anyDone = total > 0 || C.MODULES.some(function (m) { return modDone(m) > 0; });
    if (!anyDone) return '';
    var last = +(STORE.draft('lastExport') || 0), days = last ? Math.floor((Date.now() - last) / 864e5) : null;
    if (days != null && days < 7) return '';
    return '<div class="note warn mt2 small" id="backup-note">💾 ' + (days == null ? '你還沒下載過進度。' : '上次下載進度是 ' + days + ' 天前。') +
      '進度只存在這台電腦的瀏覽器，換電腦、清除瀏覽紀錄就會不見 —— <button type="button" class="btn sm" id="btn-export2">⬇ 現在下載</button></div>';
  }
  function exportNow() {
    var me = STORE.me(); if (!me) return;
    var blob = new Blob([STORE.exportJSON()], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '進度-' + C.TERM + '-' + me.cls + '_' + me.seat + '_' + me.name + '.json';
    document.body.appendChild(a); a.click(); a.remove();   // 放進頁面再點，檔名才會生效
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    STORE.draft('lastExport', String(Date.now()));
    var n = document.getElementById('backup-note'); if (n) n.remove();
  }

  function openAllBanner() {
    if (!window.HUB || !HUB.openAll()) return '';
    return '<div class="note warn mt2 small"><b>備課模式：</b>「依序開放」已暫時關閉，到 ' + esc(C.OPEN_ALL_UNTIL) + ' 自動恢復。</div>';
  }

  window.HUB = {
    render: render,
    weekInfo: weekInfo, BADGES: BADGES,
    /** 依序開放的總開關（有到期日） */
    openAll: function () {
      if (!C.OPEN_ALL_UNITS) return false;
      var today = new Date().toISOString().slice(0, 10);
      return !C.OPEN_ALL_UNTIL || today <= C.OPEN_ALL_UNTIL;
    }
  };

  window.addEventListener('store:change', function () { if (document.getElementById('hub') && STORE.me()) render(); });
})();
