/* =====================================================================
   🏁 課堂挑戰模式（老師投影、小組搶答）
   ---------------------------------------------------------------------
   題目來自驗證伺服器的 🎲 出題器（server/60_gen_net.js、61_gen_cipher.js）：每題當場隨機產生、由伺服器判斷，
   網頁只拿到題目，投影畫面按 F12 也看不到答案。（課堂挑戰不扣心、不記星；要連網路）
   流程：設定組數、題目範圍 → 投影題目、倒數計時 → 哪一組舉手，老師點那一組、輸入（或點選）他們的答案 →
        答對 +10（剩一半以上時間再 +5 搶快）；答錯這一組這題不能再答，換別組 → 下一題 → 最後排名。
   分數存在這台電腦的瀏覽器（重新整理不會不見），按「結束」才清除。
   用法：CHALLENGE.mount('#app', { topics: [{ id, name, icon, gens: [{ gen, rd }] }] })
   需要：ui.js、api.js、cardgame.js（答題工具）
   ===================================================================== */
(function () {
  var esc = UI.esc, KEY = 'c116-challenge-' + ((window.CONFIG && CONFIG.TERM) || '');
  function norm(s) { return String(s).replace(/[！-～]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); }).replace(/\s+/g, '').toUpperCase(); }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function save(st) { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* 沒有儲存空間也能玩 */ } }
  function clear() { try { localStorage.removeItem(KEY); } catch (e) { /* 忽略 */ } }
  var COLORS = ['#1d4ed8', '#b91c1c', '#047857', '#7e22ce', '#b45309', '#0f766e', '#be123c', '#4338ca'];

  function mount(sel, opts) {
    var app = document.querySelector(sel), T = opts.topics, st = null, cur = null, timer = null, run = null;
    /* 伺服器上的「課堂挑戰局」：不扣心、不記星，只負責出題和判斷 */
    function ensureRun() {
      if (run) return Promise.resolve(run);
      return API.call('start', { free: true, mod: 'challenge' }).then(function (r) { run = r.run; return run; });
    }
    function offline(e) {
      clearInterval(timer);
      app.innerHTML = '<section class="card"><div class="note bad">⚠️ ' + esc(API.msg(e)) + '</div><p class="small soft mt1">課堂挑戰的題目由驗證伺服器出題、判斷，要連上網路才能玩。</p><div class="row mt2"><button type="button" class="btn" id="ch-back">← 回到設定</button></div></section>';
      app.querySelector('#ch-back').onclick = setup;
    }

    /* ── 設定 ── */
    function setup() {
      var old = load();
      app.innerHTML = '<section class="card ch-setup">' +
        '<h2 class="black">🏁 課堂挑戰：小組搶答</h2><p class="small soft mt1">老師投影這一頁。題目每次隨機產生；哪一組先舉手，就點那一組、幫他們輸入答案。</p>' +
        (old && old.q < old.total ? '<div class="note mt2 small">上一場還沒結束（第 ' + (old.q + 1) + ' / ' + old.total + ' 題）。<button type="button" class="btn sm" id="ch-resume">▶ 繼續上一場</button></div>' : '') +
        '<div class="ch-grid mt2"><div><b class="small">① 幾組？</b><div class="row mt1" style="gap:.3rem">' + [2, 3, 4, 5, 6, 7, 8].map(function (n) { return '<button type="button" class="btn sm ch-n' + (n === 6 ? ' on' : '') + '" data-n="' + n + '">' + n + ' 組</button>'; }).join('') + '</div>' +
        '<div id="ch-names" class="ch-names mt1"></div></div>' +
        '<div><b class="small">② 題目範圍</b><div class="stack mt1">' + T.map(function (t, i) { return '<label class="ch-topic"><input type="checkbox" value="' + i + '" checked> ' + t.icon + ' ' + esc(t.name) + ' <small class="soft">（' + t.gens.length + ' 種題型）</small></label>'; }).join('') + '</div>' +
        '<b class="small mt2" style="display:block">③ 題數／每題秒數／難度</b><div class="row mt1" style="gap:.4rem">' +
        '<select class="input" id="ch-total" aria-label="題數" style="width:auto;margin:0">' + [5, 8, 10, 15].map(function (n) { return '<option' + (n === 10 ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select> 題' +
        '<select class="input" id="ch-sec" aria-label="每題秒數" style="width:auto;margin:0">' + [30, 45, 60, 90, 120].map(function (n) { return '<option' + (n === 60 ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select> 秒' +
        '<select class="input" id="ch-hard" aria-label="難度" style="width:auto;margin:0"><option value="0">一般</option><option value="1">挑戰（較難）</option></select></div></div></div>' +
        '<div class="row mt2"><button type="button" class="btn go" id="ch-start">🚀 開始</button></div></section>';
      var n = 6;
      function names() { var box = app.querySelector('#ch-names'), prev = [].map.call(box.querySelectorAll('input'), function (x) { return x.value; }); box.innerHTML = ''; for (var i = 0; i < n; i++) box.insertAdjacentHTML('beforeend', '<input class="input" style="border-color:' + COLORS[i] + '" aria-label="第 ' + (i + 1) + ' 組名稱" value="' + esc(prev[i] || '第 ' + (i + 1) + ' 組') + '">'); }
      names();
      app.querySelectorAll('.ch-n').forEach(function (b) { b.onclick = function () { n = +b.dataset.n; app.querySelectorAll('.ch-n').forEach(function (x) { x.classList.toggle('on', x === b); }); names(); }; });
      var r = app.querySelector('#ch-resume'); if (r) r.onclick = function () { st = old; next(true); };
      app.querySelector('#ch-start').onclick = function () {
        var tp = [].map.call(app.querySelectorAll('.ch-topic input:checked'), function (x) { return +x.value; });
        if (!tp.length) return UI.toast('至少選一個題目範圍');
        st = { teams: [].map.call(app.querySelectorAll('#ch-names input'), function (x, i) { return { name: x.value.trim() || '第 ' + (i + 1) + ' 組', score: 0 }; }),
          topics: tp, total: +app.querySelector('#ch-total').value, sec: +app.querySelector('#ch-sec').value, hard: app.querySelector('#ch-hard').value === '1', q: 0 };
        save(st); next(true);
      };
    }

    /* ── 出一題（請伺服器出；只要能投影作答的題型：打字、選擇） ── */
    function make(guard) {
      guard = guard || 0;
      var t = T[st.topics[Math.floor(Math.random() * st.topics.length)]], g = t.gens[Math.floor(Math.random() * t.gens.length)];
      var rd = g.rd || {}, hard = st.hard && g.hardOk !== false;
      return ensureRun().then(function () {
        return API.call('gen', { run: run, gen: g.gen, hard: hard, tool: rd.tool || g.tool || null, one: true, kinds: ['input', 'choice'] });
      }).then(function (r) { return { it: r.qs[0], topic: t, tool: rd.tool || g.tool }; }, function (e) {
        if (e.err === 'run-expired') { run = null; }
        if ((e.err === 'no-item' || e.err === 'no-gen' || e.err === 'run-expired') && guard < 20) return make(guard + 1);
        throw e;
      });
    }
    function next(first) {
      clearInterval(timer);
      if (!first) { st.q++; save(st); }
      if (st.q >= st.total) return end();
      app.innerHTML = board() + '<section class="card ch-q mt2 center"><p class="soft bold">🎲 出題中…</p></section>';
      make().then(function (c) {
        cur = c; cur.locked = {}; cur.left = st.sec; cur.done = false; cur.pick = null;
        draw(); tick();
      }, offline);
    }
    function tick() {
      clearInterval(timer);
      timer = setInterval(function () {
        if (cur.done || cur.pause) return;
        cur.left--; var b = app.querySelector('#ch-time'); if (b) { b.style.width = Math.max(0, cur.left / st.sec * 100) + '%'; app.querySelector('#ch-sec-n').textContent = Math.max(0, cur.left); }
        if (cur.left <= 0) { clearInterval(timer); app.querySelector('#ch-sec-n').textContent = '時間到！'; }
      }, 1000);
    }
    function board() {
      var mx = Math.max.apply(null, st.teams.map(function (t) { return t.score; }));
      return '<div class="ch-board">' + st.teams.map(function (t, i) {
        return '<button type="button" class="ch-team' + (cur && cur.pick === i ? ' on' : '') + (cur && cur.locked[i] ? ' locked' : '') + '" data-i="' + i + '" style="--c:' + COLORS[i] + '"' + (cur && (cur.locked[i] || cur.done) ? ' disabled' : '') + '>' +
          '<span class="ch-key">' + (i + 1) + '</span><b>' + esc(t.name) + '</b><span class="ch-score">' + t.score + (t.score === mx && mx > 0 ? ' 👑' : '') + '</span>' + (cur && cur.locked[i] ? '<small>這題答錯了</small>' : '') + '</button>';
      }).join('') + '</div>';
    }
    function draw() {
      var it = cur.it, kind = it.kind || 'input';
      app.innerHTML = board() +
        '<section class="card ch-q mt2"><div class="row between"><span class="chip">' + cur.topic.icon + ' ' + esc(cur.topic.name) + '</span><span class="bold">第 ' + (st.q + 1) + ' / ' + st.total + ' 題</span></div>' +
        '<div class="bar mt1 ch-bar"><i id="ch-time" style="width:' + (cur.left / st.sec * 100) + '%"></i></div><div class="tiny bold soft mt1">⏱️ <span id="ch-sec-n">' + cur.left + '</span> 秒　<button type="button" class="btn sm" id="ch-pause">' + (cur.pause ? '▶ 繼續' : '⏸ 暫停') + '</button></div>' +
        '<div class="ch-card mt2"><div class="ch-ic">' + (it.icon || '❓') + '</div><div class="ch-t' + (it.mono === false ? '' : ' mono') + '">' + esc(it.t) + '</div>' + (it.sub ? '<div class="ch-sub">' + esc(it.sub) + '</div>' : '') + (it.html ? '<div class="mt1">' + it.html + '</div>' : '') + '</div>' +
        (cur.tool || it.tool ? '<div id="tool" class="mt2"></div>' : '') +
        '<div id="ch-ans" class="mt2"></div><div id="fb" class="mt2" aria-live="polite"></div>' +
        '<div class="row mt2" style="gap:.4rem"><button type="button" class="btn sm" id="ch-hint">💡 提示</button><button type="button" class="btn sm" id="ch-skip">⏭ 跳過這題</button><button type="button" class="btn sm" id="ch-end">🏁 結束</button></div></section>';
      var tool = it.tool || cur.tool; if (tool && CARDGAME.tools[tool]) CARDGAME.tools[tool](app.querySelector('#tool'), it);
      app.querySelectorAll('.ch-team').forEach(function (b) { b.onclick = function () { choose(+b.dataset.i); }; });
      app.querySelector('#ch-pause').onclick = function () { cur.pause = !cur.pause; this.textContent = cur.pause ? '▶ 繼續' : '⏸ 暫停'; };
      app.querySelector('#ch-hint').onclick = function () { var h = it.hint; app.querySelector('#fb').innerHTML = '<div class="note small">💡 ' + esc(h || '這題沒有提示') + '</div>'; };
      app.querySelector('#ch-skip').onclick = function () { next(); };
      app.querySelector('#ch-end').onclick = function () { if (confirm('結束這一場，看排名？')) end(); };
      if (cur.pick != null) answerBox();
    }
    function choose(i) {
      if (cur.done || cur.locked[i]) return;
      cur.pick = i; cur.pause = true;
      app.querySelectorAll('.ch-team').forEach(function (b) { b.classList.toggle('on', +b.dataset.i === i); });
      app.querySelector('#ch-pause').textContent = '▶ 繼續';
      answerBox();
    }
    function answerBox() {
      var it = cur.it, kind = it.kind || 'input', i = cur.pick, box = app.querySelector('#ch-ans'), val = null, sending = false;
      box.innerHTML = '<div class="ch-answer" style="--c:' + COLORS[i] + '"><b>' + esc(st.teams[i].name) + ' 的答案：</b>' +
        (kind === 'choice' ? '<div class="buckets mt1">' + it.options.map(function (o) { return '<button type="button" class="pick bucket ch-o" data-v="' + esc(o.id) + '">' + (o.icon ? '<span class="ic">' + o.icon + '</span>' : '') + '<span>' + esc(o.label) + '</span></button>'; }).join('') + '</div>'
          : '<input class="input mt1" id="ch-in" autocomplete="off" placeholder="' + esc(it.ph || '輸入答案') + '" aria-label="答案">') +
        '<div class="row mt1"><button type="button" class="btn go" id="ch-judge">⚖️ 判定</button></div></div>';
      box.querySelectorAll('.ch-o').forEach(function (b) { b.onclick = function () { val = b.dataset.v; box.querySelectorAll('.ch-o').forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
      var inp = box.querySelector('#ch-in'); if (inp) { inp.focus(); inp.onkeydown = function (e) { if (e.key === 'Enter') judge(); }; }
      box.querySelector('#ch-judge').onclick = judge;
      function judge() {
        var v = kind === 'choice' ? val : norm(inp.value);
        if (v == null || v === '') return UI.toast('先輸入（或選好）答案');
        if (sending) return; sending = true;
        API.call('gq', { run: run, q: it.q, v: v }).then(function (r) { sending = false; show(!!r.ok, r.why); }, function (e) { sending = false; if (e.err === 'too-many') return show(false); offline(e); });
      }
      function show(ok, why) {
        var fb = app.querySelector('#fb');
        if (ok) {
          var bonus = cur.left >= st.sec / 2 ? 5 : 0;
          st.teams[i].score += 10 + bonus; cur.done = true; save(st);
          app.querySelector('.ch-board').outerHTML = board();
          box.innerHTML = '';
          fb.innerHTML = '<div class="note ok pop ch-big">🎉 ' + esc(st.teams[i].name) + ' 答對！＋10' + (bonus ? '（搶快 ＋5）' : '') + '<br><span class="small">' + esc(why || '') + '</span></div><div class="row mt2"><button type="button" class="btn primary" id="ch-next">' + (st.q + 1 < st.total ? '下一題 →' : '看排名 🏆') + '</button></div>';
          app.querySelector('#ch-next').onclick = function () { next(); }; app.querySelector('#ch-next').focus();
          app.querySelectorAll('.ch-team').forEach(function (b) { b.disabled = true; });
        } else {
          cur.locked[i] = true; cur.pick = null; cur.pause = false;
          app.querySelector('.ch-board').outerHTML = board();
          app.querySelectorAll('.ch-team').forEach(function (b) { b.onclick = function () { choose(+b.dataset.i); }; });
          app.querySelector('#ch-pause').textContent = '⏸ 暫停';
          box.innerHTML = '';
          var left = st.teams.filter(function (_, k) { return !cur.locked[k]; }).length;
          fb.innerHTML = '<div class="note bad pop">❌ ' + esc(st.teams[i].name) + ' 答錯了！' + (left ? '其他組可以搶答。' : '大家都答錯了，按「💡 提示」一起想想，或跳過。') + '</div>';
        }
      }
    }
    function end() {
      clearInterval(timer);
      var rank = st.teams.map(function (t, i) { return { t: t, i: i }; }).sort(function (a, b) { return b.t.score - a.t.score; });
      var M = ['🥇', '🥈', '🥉'];
      app.innerHTML = '<section class="card center ch-end"><h2 class="black" style="font-size:1.8rem">🏆 最終排名</h2><ol class="ch-rank mt2">' + rank.map(function (x, k) {
        var place = rank.findIndex(function (y) { return y.t.score === x.t.score; });
        return '<li style="--c:' + COLORS[x.i] + '"><span class="ch-medal">' + (M[place] || (place + 1)) + '</span><b>' + esc(x.t.name) + '</b><span class="ch-score">' + x.t.score + ' 分</span></li>';
      }).join('') + '</ol><div class="row mt2" style="justify-content:center"><button type="button" class="btn go" id="ch-again">🔁 再來一場</button></div></section>';
      clear();
      app.querySelector('#ch-again').onclick = setup;
    }
    // 鍵盤：1～8 選組、Esc 暫停
    document.addEventListener('keydown', function (e) {
      if (!cur || cur.done || /INPUT|SELECT|TEXTAREA/.test((e.target || {}).tagName)) return;
      var n = +e.key; if (n >= 1 && n <= st.teams.length) choose(n - 1);
    });
    setup();
  }
  window.CHALLENGE = { mount: mount };
})();
