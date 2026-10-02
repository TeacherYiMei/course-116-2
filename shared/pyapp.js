/* =====================================================================
   Python 闖關頁（PYAPP）── 兩學期共用
   ---------------------------------------------------------------------
   PYAPP.mount({ root:'#pyapp', levels: PY_LEVELS, mod:'python',
                 title, kicker, subtitle, finale, ref })
   ref：語法小抄的網址（例如 'pyref.html'），有給就在頁首、每一關、「我的程式」旁顯示「📚」按鈕，
        按了在這一頁開浮動視窗（shared/refpanel.js，頁面要先載入它），一邊看語法一邊寫程式
   引擎：pyrunner.js（執行、評分、錯誤翻譯）；關卡內容：各學期 content/*.js
   依序開放：上一關 ≥ 2⭐ 才開下一關（HUB.openAll() 可暫時全開）
   ===================================================================== */
window.PYAPP = { mount: function (opts) {
  var L = opts.levels, esc = UI.esc, MOD = opts.mod || 'python';
  var root = typeof opts.root === 'string' ? document.querySelector(opts.root) : opts.root;
  root.innerHTML = '<div class="row between" style="margin-top:-.5rem;margin-bottom:1rem">\n    <p class="small soft bold">' + esc(opts.subtitle || '') + '</p>\n    <span class="row" style="gap:.5rem">' + (opts.ref ? '<a class="btn sm" id="ref-link" data-refp="all" href="' + opts.ref + '" target="_blank" rel="noopener">📚 語法小抄</a>' : '') + '<span id="engine" class="engine">⏳ Python 引擎載入中…</span></span>\n  </div>\n\n  <div class="py-grid">\n    <aside class="card" style="padding:.8rem">\n      <p class="kicker" style="margin:.2rem .2rem .6rem">任務清單 · 2⭐ 開下一關</p>\n      <div class="lv-prog"><span>進度</span><span id="lv-got"></span></div><div class="lv-bar"><i id="lv-bar"></i></div>\n      <nav id="lv-list" class="lv-list" aria-label="關卡"></nav>\n      <p class="tiny soft mt2" style="padding:0 .2rem">1⭐ 至少過一組測資<br>2⭐ 全部測資都過<br>3⭐ 再加上程式結構要求</p>\n    </aside>\n\n    <section id="stage" class="stack"></section>\n  </div>\n';
  var cur = null;                 // 目前關卡
  var session = { inputs: [], seed: 116 };
  var running = false;

  UI.topbar('#topbar', { title: opts.title, kicker: opts.kicker });

  /* ── 引擎 ─────────────────────────────────────── */
  var eng = document.getElementById('engine');
  PYRUN.onStatus(function (s, info) {
    if (s === 'loading') { eng.className = 'engine'; eng.textContent = '⏳ Python 引擎載入中…（第一次約 10 秒）'; }
    if (s === 'ready') { eng.className = 'engine ok'; eng.textContent = '✅ Python ' + info + ' 就緒'; setBusy(false); }
    if (s === 'fail') { eng.className = 'engine bad'; eng.textContent = '❌ 引擎載入失敗：請檢查網路後重新整理'; }
  });
  PYRUN.init(CONFIG.PYODIDE_URL).catch(function () {});

  /* ── 📚 語法小抄：同一頁的浮動視窗（shared/refpanel.js）── */
  if (opts.ref && window.REFPANEL) REFPANEL.bind(root, { url: opts.ref, title: '📚 語法小抄' });
  function refFollow(id) { if (opts.ref && window.REFPANEL) REFPANEL.follow(id); }

  /* ── 關卡解鎖 ─────────────────────────────────── */
  function stars(id) { var r = STORE.level(MOD, id); return r ? (r.stars || 0) : 0; }
  function unlocked(i) { return i === 0 || HUB.openAll() || stars(L[i - 1].id) >= 2; }

  function renderList() {
    document.getElementById('lv-list').innerHTML = L.map(function (lv, i) {
      var ok = unlocked(i);
      var on = cur && cur.id === lv.id;
      return '<button class="lv' + (on ? ' on' : '') + (ok ? '' : ' lock') + (stars(lv.id) >= 2 ? ' done' : '') + '" data-i="' + i + '"' + (ok ? '' : ' aria-disabled="true"') + (on ? ' aria-current="step"' : '') + '>' +
        '<span class="no">' + (i + 1) + '</span><span class="ic">' + (ok ? lv.icon : '🔒') + '</span><span class="bd"><span class="tt">' + esc(lv.title) + '</span>' +
        '<span class="st">' + UI.stars(stars(lv.id)) + '</span></span></button>';
    }).join('');
    // 清單上方的進度條（和課程小卡一樣：星數／滿分）
    var got = L.reduce(function (a, lv) { return a + stars(lv.id); }, 0), max = L.length * 3;
    document.getElementById('lv-got').textContent = got + ' / ' + max + ' ⭐';
    document.getElementById('lv-bar').style.width = Math.round(got / max * 100) + '%';
  }
  document.getElementById('lv-list').addEventListener('click', function (e) {
    var b = e.target.closest('.lv'); if (!b) return;
    var i = +b.dataset.i;
    if (!unlocked(i)) { UI.toast('先在上一關拿到 2 顆星，這一關才會開放'); return; }
    open(i);
  });

  /* ── 關卡畫面 ─────────────────────────────────── */
  function open(i) {
    cur = L[i];
    session = { inputs: [], seed: Math.floor(Math.random() * 1e6) };
    try { history.replaceState(null, '', '#' + cur.id); } catch (e) {}
    renderList();
    refFollow(cur.id);
    var lv = cur, best = STORE.level(MOD, lv.id);
    var draft = STORE.draft(MOD + '-' + lv.id);
    var st = document.getElementById('stage');
    st.innerHTML =
      '<article class="card pop"><div class="tape"></div>' +
      '<div class="row between"><div class="row"><span style="font-size:2.2rem">' + lv.icon + '</span><div>' +
      '<p class="kicker">任務 ' + (i + 1) + ' / ' + L.length + ' · ' + esc(lv.book) + '</p>' +
      '<h2 class="black" style="font-size:1.5rem">' + esc(lv.title) + '</h2>' + (window.K12 ? K12.chips(lv.id) : '') + '</div></div>' +
      '<div class="center"><span class="chip" style="background:var(--unit-bg);border-color:transparent;color:var(--ink)">' + esc(lv.concept) + '</span>' +
      '<div class="mt1" id="lv-best">' + UI.stars(best ? best.stars : 0) + '</div></div></div>' +
      '<p class="mt2">' + lv.story + '</p>' +
      '<div class="grid g2 mt2"><div><h3 class="bold small soft">📋 任務說明</h3><ol class="small" style="margin:.4rem 0 0;padding-left:1.3rem">' +
      lv.task.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ol></div>' +
      '<div><h3 class="bold small soft">🖥️ 執行起來像這樣</h3><div class="sample mt1">' + sampleHTML(lv.sample) + '</div>' +
      (lv.sample.inputs.length ? '<p class="tiny soft mt1"><span class="io-in">黃色</span>是使用者打的字</p>' : '') + '</div></div>' +
      '<details class="mt2"><summary class="bold small" style="cursor:pointer">🐱 和 Scratch 積木對照</summary>' +
      '<div class="scroll-x mt1"><table class="t map-t"><tr><th>Scratch 積木</th><th>Python</th></tr>' +
      lv.scratch.map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td></tr>'; }).join('') + '</table></div></details>' +
      '<div class="row mt2"><button class="btn sm" id="btn-hint">💡 提示（0 / ' + lv.hn + '）</button>' +
      (opts.ref ? '<a class="btn sm" id="btn-ref" data-refp="' + lv.id + '" href="' + opts.ref + '#' + lv.id + '" target="_blank" rel="noopener">📚 這關用到的語法</a>' : '') + '</div><div id="hints" class="stack mt1"></div>' +
      '</article>' +

      '<article class="card">' +
      '<div class="row between"><h3 class="bold">✏️ 我的程式</h3><span class="row" style="gap:.5rem"><span class="tiny soft">Tab 縮排 4 格 · Ctrl＋Enter 試跑</span>' +
      (opts.ref ? '<a class="btn sm" id="btn-ref2" data-refp="' + lv.id + '" href="' + opts.ref + '#' + lv.id + '" target="_blank" rel="noopener">📚 不知道怎麼寫？查語法</a>' : '') + '</span></div>' +
      '<div class="ed mt1"><div class="gut" id="gut">1</div><textarea id="code" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Python 程式碼"></textarea></div>' +
      '<p id="fw" class="small bold mt1" style="color:var(--warn);min-height:1.3em" aria-live="polite"></p>' +
      '<div class="row"><button class="btn primary" id="btn-run" disabled>▶ 試跑</button>' +
      '<button class="btn go" id="btn-grade" disabled>✅ 送出評分</button>' +
      '<button class="btn sm" id="btn-reset" style="margin-left:auto">↺ 回到範本</button></div>' +
      '</article>' +

      '<article class="card"><div class="row between"><h3 class="bold">🖥️ 執行結果</h3><span id="run-note" class="tiny soft"></span></div>' +
      '<div id="console" class="console mt1" aria-live="polite">按「▶ 試跑」看看你的程式會做什麼。</div>' +
      '<div id="err" class="mt1"></div></article>' +

      '<article class="card hidden" id="result"></article>';

    var ta = document.getElementById('code');
    ta.value = draft != null ? draft : lv.starter;
    bindEditor(ta);
    document.getElementById('btn-run').onclick = function () { tryRun(true); };
    document.getElementById('btn-grade').onclick = grade;
    document.getElementById('btn-reset').onclick = function () {
      if (confirm('要把程式換回範本嗎？（目前寫的會不見）')) { ta.value = lv.starter; onEdit(); }
    };
    var shown = 0, nHint = lv.hn || 0, hb = document.getElementById('btn-hint'), asking = false;
    if (!nHint) hb.disabled = true;
    hb.onclick = function () {   // 提示在伺服器：按一次拿一則（最後幾則常常很接近答案，所以不放在網頁裡）
      if (shown >= nHint || asking) return;
      asking = true;
      API.call('hint', { kind: 'py', lv: lv.id, i: shown }).then(function (r) {
        asking = false;
        var d = document.createElement('div'); d.className = 'hint small pop';
        d.innerHTML = '<b>提示 ' + (shown + 1) + '：</b>' + esc(r.hint);
        document.getElementById('hints').appendChild(d);
        shown++; hb.textContent = '💡 提示（' + shown + ' / ' + nHint + '）';
        if (shown >= nHint) hb.disabled = true;
      }, function (e) { asking = false; UI.toast(API.msg(e)); });
    };
    PYRUN.ready().then(function () { setBusy(false); }, function () {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function sampleHTML(s) {
    // 把範例輸出裡的使用者輸入標黃：依序在「提示字：」後面找輸入值
    var html = esc(s.output), k = 0;
    s.inputs.forEach(function (v) {
      var at = html.indexOf(esc(v), k);
      if (at >= 0) { html = html.slice(0, at) + '<span class="io-in">' + esc(v) + '</span>' + html.slice(at + esc(v).length); k = at + 30; }
    });
    return html;
  }

  /* ── 編輯器 ───────────────────────────────────── */
  var saveTimer = null, errLine = null;
  function bindEditor(ta) {
    ta.addEventListener('input', onEdit);
    ta.addEventListener('scroll', function () { document.getElementById('gut').scrollTop = ta.scrollTop; });
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); tryRun(true); return; }
      var s = ta.selectionStart, en = ta.selectionEnd, v = ta.value;
      if (e.key === 'Tab') {
        e.preventDefault();
        var ls = v.lastIndexOf('\n', s - 1) + 1;
        if (e.shiftKey) {
          var m = /^ {1,4}/.exec(v.slice(ls));
          if (m) { ta.value = v.slice(0, ls) + v.slice(ls + m[0].length); ta.selectionStart = ta.selectionEnd = Math.max(ls, s - m[0].length); }
        } else {
          ta.value = v.slice(0, s) + '    ' + v.slice(en); ta.selectionStart = ta.selectionEnd = s + 4;
        }
        onEdit();
      } else if (e.key === 'Enter') {
        // 自動縮排：延續上一行；冒號結尾再多 4 格
        var lineStart = v.lastIndexOf('\n', s - 1) + 1, line = v.slice(lineStart, s);
        var ind = (/^ */.exec(line) || [''])[0];
        if (/:\s*$/.test(line)) ind += '    ';
        e.preventDefault();
        ta.value = v.slice(0, s) + '\n' + ind + v.slice(en);
        ta.selectionStart = ta.selectionEnd = s + 1 + ind.length;
        onEdit();
      }
    });
    onEdit(true);
  }
  function onEdit(first) {
    var ta = document.getElementById('code'); if (!ta) return;
    if (first !== true) errLine = null;
    drawGutter();
    var fw = PYRUN.fullwidthOutsideStrings(ta.value);
    document.getElementById('fw').textContent = fw.length ? '⚠️ 第 ' + fw[0].line + ' 行有全形符號「' + fw[0].ch + '」—— 程式符號要用半形' : '';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { STORE.draft(MOD + '-' + cur.id, ta.value); }, 400);
  }
  function drawGutter() {
    var ta = document.getElementById('code'), n = ta.value.split('\n').length, s = [];
    for (var i = 1; i <= n; i++) s.push(i === errLine ? '<b>' + i + '</b>' : i);
    var g = document.getElementById('gut'); g.innerHTML = s.join('\n'); g.scrollTop = ta.scrollTop;
  }

  function setBusy(b) {
    running = b;
    ['btn-run', 'btn-grade'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.disabled = b || !(eng.className.indexOf('ok') >= 0);
    });
  }

  /* ── 試跑（重播法：需要輸入時停下來，問完再從頭跑一次）── */
  function tryRun(fresh) {
    if (running) return;
    var code = document.getElementById('code').value;
    if (fresh) session.inputs = [];
    setBusy(true);
    document.getElementById('run-note').textContent = '執行中…';
    PYRUN.run(code, session.inputs, { seed: session.seed }).then(function (r) {
      setBusy(false);
      document.getElementById('run-note').textContent = r.need ? '程式在等你輸入 ↓' : '執行完畢';
      renderConsole(r, !r.need);
      showError(r.error, code);
    });
  }

  function renderConsole(r, animate) {
    var box = document.getElementById('console');
    var evs = r.events || [];
    var hasSleep = animate && evs.some(function (e) { return e[0] === 'sleep'; });
    function html(list) {
      return list.map(function (ev) {
        if (ev[0] === 'out') return esc(ev[1]);
        if (ev[0] === 'prompt') return '<span class="io-prompt">' + esc(ev[1]) + '</span>';
        if (ev[0] === 'in') return '<span class="io-in">' + esc(ev[1]) + '</span>\n';
        return '';
      }).join('');
    }
    function tail() {
      if (r.need) {
        box.insertAdjacentHTML('beforeend', '<input id="stdin" aria-label="輸入" placeholder="在這裡輸入，按 Enter">');
        var inp = document.getElementById('stdin'); inp.focus();
        inp.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { session.inputs.push(inp.value); tryRun(false); }
        });
      } else if (!evs.length && !r.error) box.innerHTML = '<span style="color:#94a3b8">（程式執行完了，但沒有顯示任何東西）</span>';
    }
    if (!hasSleep) { box.innerHTML = html(evs); tail(); return; }
    // time.sleep 的動畫：每遇到一次 sleep 停 0.4 秒
    box.innerHTML = '';
    var k = 0;
    (function step() {
      var chunk = [];
      while (k < evs.length && evs[k][0] !== 'sleep') chunk.push(evs[k++]);
      box.insertAdjacentHTML('beforeend', html(chunk));
      if (k < evs.length) { k++; setTimeout(step, 400); } else tail();
    })();
  }

  function showError(err, code) {
    var box = document.getElementById('err');
    var ex = PYRUN.explain(err, code);
    errLine = ex && ex.line ? ex.line : null;
    drawGutter();
    box.innerHTML = ex ? errorHTML(ex) : '';
  }

  /* 錯誤說明：你的程式（標出問題）→ 可以改成（標出改了哪裡）→ 範例對照 → 為什麼 → 原始訊息 */
  function errorHTML(ex) {
    var h = '<div class="note bad pop errbox"><b>' + esc(ex.title) + '</b>';
    if (ex.yours != null && ex.yours.trim()) {
      var y = ex.yours, f = ex.fixed, yHTML, fHTML = '';
      if (f != null) {
        var p = 0; while (p < y.length && p < f.length && y[p] === f[p]) p++;
        var q = 0; while (q < y.length - p && q < f.length - p && y[y.length - 1 - q] === f[f.length - 1 - q]) q++;
        var del = y.slice(p, y.length - q), add = f.slice(p, f.length - q);
        yHTML = esc(y.slice(0, p)) + (del ? '<mark class="del">' + esc(del) + '</mark>' : '<span class="caret">‸</span>') + esc(y.slice(y.length - q));
        fHTML = esc(f.slice(0, p)) + '<mark class="add">' + esc(add) + '</mark>' + esc(f.slice(f.length - q));
      } else if (ex.mark) {
        yHTML = esc(y.slice(0, ex.mark[0])) + '<mark class="del">' + esc(y.slice(ex.mark[0], ex.mark[1]) || ' ') + '</mark>' + esc(y.slice(ex.mark[1]));
      } else yHTML = esc(y);
      h += '<div class="errrow mt1"><div class="lbl">你的程式（第 ' + ex.line + ' 行）</div><pre class="ecode ebad"><span class="ln">' + ex.line + '</span>' + yHTML + '</pre></div>';
      if (fHTML) h += '<div class="errrow"><div class="lbl">✅ 可以改成</div><pre class="ecode egood"><span class="ln">' + ex.line + '</span>' + fHTML + '</pre></div>';
    }
    h += '<p class="small mt1">💡 ' + esc(ex.tip) + '</p>';
    if (ex.bad && ex.good) {
      h += '<div class="grid g2 mt1 errex"><div><div class="lbl">❌ 常見的錯誤寫法</div><pre class="ecode ebad">' + esc(ex.bad) + '</pre></div>' +
        '<div><div class="lbl">✅ 正確的寫法</div><pre class="ecode egood">' + esc(ex.good) + '</pre></div></div>';
    }
    h += '<details class="tiny soft mt1"><summary>Python 的原始訊息（英文）</summary><code>' + esc(ex.raw) + '</code></details></div>';
    return h;
  }

  /* ── 評分 ─────────────────────────────────────── */
  function grade() {
    if (running) return;
    var code = document.getElementById('code').value, lv = cur;
    if (code.trim() === lv.starter.trim()) { UI.toast('先寫一點程式再送出吧！'); return; }
    setBusy(true);
    var res = document.getElementById('result');
    res.classList.remove('hidden');
    res.innerHTML = '<p class="bold">⏳ 評分中…（' + lv.tests.length + ' 組測資）</p>';
    PYRUN.grade(lv, code, { mod: MOD }).then(function (g) {
      setBusy(false);
      var before = stars(lv.id);
      var saved = g.offline ? { improved: false } : STORE.saveLevel(MOD, lv.id, { stars: g.stars, score: g.score, code: code, rc: g.rc, ts: g.ts });
      renderList();
      var lb = document.getElementById('lv-best'); if (lb) lb.innerHTML = UI.stars(stars(lv.id));
      var idx = L.indexOf(lv);
      var openedNext = before < 2 && g.stars >= 2 && idx < L.length - 1;
      var firstErr = g.tests.filter(function (t) { return t.error; })[0];
      if (firstErr) showError(firstErr.error, code); else showError(null, code);

      var rows = g.tests.map(function (t, i) {
        var tt = t.test, why = '';
        if (!t.pass) {
          if (t.error) why = PYRUN.explain(t.error, code).title;
          else why = t.msg || (tt.hidden ? '再想想特殊情況' : '輸出和預期不一樣');
        }
        var inp = tt.hidden ? '🔒 隱藏' : ((tt.inputs || []).length ? tt.inputs.map(esc).join('、') : '（沒有輸入）');
        var out = tt.hidden || !t.run.events ? '' : '<details class="tiny"><summary>看你的輸出</summary><div class="sample mt1">' + esc(PYRUN.transcript(t.run.events)) + '</div></details>';
        return '<tr><td>' + (i + 1) + '. ' + esc(tt.name) + '</td><td>' + inp + '</td><td>' +
          (t.pass == null ? '<span class="soft">📴 沒有判斷</span>' : t.pass ? '<span class="ok-c">✔ 通過</span>' : '<span class="bad-c">✘</span> <span class="small">' + esc(why) + '</span>') + out + '</td></tr>';
      }).join('');
      var reqs = g.reqs.map(function (r) {
        return '<li>' + (r.ok ? '<span class="ok-c">✔</span> ' : '<span class="bad-c">✘</span> ') + esc(r.req.msg) + '</li>';
      }).join('');
      var msg = g.offline ? '📴 練習模式：連不上驗證伺服器，只跑了公開的範例測資給你看輸出，沒有判斷、不記星。連上網路再送出一次。' :
                g.stars === 3 ? '🎉 完美！程式正確、結構也漂亮。' :
                g.stars === 2 ? '👍 測資全部通過！再符合下面的結構要求就能拿到 3 星。' :
                g.stars === 1 ? '💪 快成功了！看看哪幾組沒過。' : '🧐 還沒有任何一組通過，先按「試跑」找出問題。';
      res.innerHTML =
        '<div class="row between"><div><p class="kicker">評分結果</p><div class="res-star">' + UI.stars(g.stars) + '</div>' +
        '<p class="bold">' + msg + '</p></div><div class="center"><div class="black" style="font-size:2rem">' + g.passed + ' / ' + g.total + '</div><div class="tiny soft bold">組測資通過</div></div></div>' +
        (saved.improved ? '<p class="note ok small mt1">⭐ 新紀錄已儲存！</p>' : (before ? '<p class="tiny soft mt1">最佳紀錄仍是 ' + before + ' 星（星星只會變多）</p>' : '')) +
        '<div class="scroll-x mt2"><table class="t"><tr><th>測資</th><th>輸入</th><th>結果</th></tr>' + rows + '</table></div>' +
        (reqs ? '<h4 class="bold small mt2">🏗️ 程式結構要求（3 星條件）</h4><ul class="small" style="margin:.3rem 0 0;padding-left:1.2rem;list-style:none">' + reqs + '</ul>' : '') +
        (g.stars >= 2 && lv.bonus ? '<div class="note mt2 small"><b>🧗 延伸挑戰（不計星）：</b>' + esc(lv.bonus) + '</div>' : '') +
        (g.stars >= 2 && idx === L.length - 1 ? '<div class="note ok mt2"><b>🏆 你打倒魔王了！</b> ' + esc(opts.finale || '全部完成，回闖關地圖看看你的稱號吧。') + '</div>' : '') +
        '<nav id="res-pager"></nav>';
      // 結尾：← 上一關／下一關 →（全站同一組樣式；下一關要這一關 2⭐ 才開）
      var P = L[idx - 1], N = L[idx + 1];
      UI.pager('#res-pager', P ? { lbl: '← 上一關', title: P.icon + ' ' + P.title, go: function () { open(idx - 1); } } : null,
        !N ? null : (openedNext || g.stars >= 2 || unlocked(idx + 1)) ? { id: 'btn-next', lbl: openedNext ? '🔓 下一關已開放 →' : '下一關 →', title: N.icon + ' ' + N.title, go: function () { open(idx + 1); } }
          : { id: 'btn-next', locked: true, lbl: '🔒 下一關', title: '這一關拿到 2⭐ 才開放', go: function () { UI.toast('這一關拿到 2 顆星，下一關才會開放'); } });
      res.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (saved.improved) UI.toast('⭐ ' + lv.title + '：' + '★'.repeat(g.stars));
    }, function (e) { setBusy(false); res.innerHTML = '<div class="note bad">⚠️ ' + esc(API.msg(e)) + '</div>'; });
  }

  /* ── 進場 ─────────────────────────────────────── */
  UI.requireLogin(function () {
    var want = (location.hash || '').slice(1), start = 0;
    L.forEach(function (lv, i) { if (unlocked(i)) start = i; });                 // 預設：最新開放的那一關
    var hi = L.findIndex(function (lv) { return lv.id === want; });
    if (hi >= 0 && unlocked(hi)) start = hi;
    renderList(); open(start);
  });
  window.addEventListener('store:change', renderList);
} };
