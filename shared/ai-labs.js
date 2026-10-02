/* =====================================================================
   🧪 AI 前導關・視覺化實驗站（CARDGAME.labs）── A1～A6 三星三階的「操作」「挑戰」
   ---------------------------------------------------------------------
   blackBox（A1 規則機器 vs 會學習的機器）、trainer（A2 挑資料訓練 AI、代表性偏見）、
   robotAlgo（A3 死板的機器人：步驟要明確、順序要正確；挑戰要優化）、nextWord（A4 預測下一個詞）、
   promptLab（A5 好好問、檢查 AI 的草稿）、fakeSpot（A6 找出 AI 生成圖片的破綻）
   ⭐ 情境由伺服器產生（server/44_labs_ai.js），也由伺服器判斷對錯；這裡只畫畫面、把學生的操作送上去（api.send）。
     黑盒子的機器藏在伺服器：每一次「測試」「教它」都問伺服器。
   ===================================================================== */
(function () {
  function esc(s) { return UI.esc(s); }
  function tip(api, t) { return api.practice ? '<div class="note small mt1">💡 提示：' + esc(t) + '</div>' : ''; }
  function warn(api, t) { api.say('<div class="note warn small">' + esc(t) + '</div>'); }
  var L = {};

  /* 🤖 黑盒子實驗室（A1）：三台水果辨識機，哪一台會「學習」？ */
  L.blackBox = function (el, api) {
    var P = api.pub, fruits = P.fruits, n = P.n, log = [], cls = {}, sel = 0, fsel = null, busy = false;
    for (var q = 0; q < n; q++) log.push([]);
    var KIND = P.hard ? [['rule', '⚙️ 固定規則'], ['learn', '🧠 會學習（AI）'], ['rand', '🎲 亂猜']] : [['rule', '⚙️ 固定規則（不是 AI）'], ['learn', '🧠 會學習（AI）']];
    el.dataset.lab = 'blackBox'; el.dataset.n = n; el.dataset.fruits = fruits.map(function (f) { return f.n; }).join(',');
    el.innerHTML = '<div class="bb"><p class="small">這裡有 ' + n + ' 台水果辨識機，外表一模一樣。做實驗找出<b>哪一台會學習</b>：先「🔍 測試」看它怎麼答，再「📚 教它」正確答案，然後再測一次。</p>' +
      '<div class="note small">✅ 過關條件：① 每一台都判斷出是哪一種機器 ② 把<b>會學習的機器</b>教到 ' + fruits.map(function (f) { return f.e; }).join('') + ' 全部認得。</div>' +
      tip(api, '教完再測一次：答案「因為你教了它」而變對的，就是會學習的機器。' + (P.hard ? '沒教它答案也一直變的，是亂猜。' : '')) +
      '<div class="bb-tabs" id="bb-tabs"></div><div class="bb-body" id="bb-body"></div>' +
      '<div class="row mt2"><button type="button" class="btn go" id="bb-ok">✅ 確認</button></div></div>';
    function tabs() {
      var h = ''; for (var i = 0; i < n; i++) h += '<button type="button" class="bb-tab' + (i === sel ? ' on' : '') + '" data-i="' + i + '">🤖 機器 ' + 'ABCD'[i] + (cls[i] ? '<small>' + KIND.filter(function (k) { return k[0] === cls[i]; })[0][1] + '</small>' : '') + '</button>';
      el.querySelector('#bb-tabs').innerHTML = h;
      el.querySelectorAll('.bb-tab').forEach(function (b) { b.onclick = function () { sel = +b.dataset.i; fsel = null; tabs(); body(); }; });
    }
    function body() {
      var i = sel;
      el.querySelector('#bb-body').innerHTML = '<div class="row" style="gap:.35rem">' + fruits.map(function (f, k) { return '<button type="button" class="btn bb-f' + (fsel === k ? ' on' : '') + '" data-k="' + k + '" aria-label="' + esc(f.n) + '">' + f.e + '</button>'; }).join('') + '</div>' +
        '<div class="row mt1" style="gap:.4rem"><button type="button" class="btn sm" id="bb-test">🔍 測試這個水果</button><button type="button" class="btn sm" id="bb-teach">📚 教它「這是' + (fsel != null ? esc(fruits[fsel].n) : '…') + '」</button></div>' +
        '<ol class="bb-log small mono">' + (log[i].length ? log[i].slice(-8).map(function (x) { return '<li>' + x + '</li>'; }).join('') : '<li class="soft">（還沒做實驗）</li>') + '</ol>' +
        '<div class="row mt1" style="gap:.35rem"><b class="small">我判斷機器 ' + 'ABCD'[i] + ' 是：</b>' + KIND.map(function (k) { return '<button type="button" class="btn sm bb-k' + (cls[i] === k[0] ? ' on' : '') + '" data-k="' + k[0] + '">' + k[1] + '</button>'; }).join('') + '</div>';
      el.querySelectorAll('.bb-f').forEach(function (b) { b.onclick = function () { fsel = +b.dataset.k; body(); }; });
      function act(op) {
        if (fsel == null) return warn(api, '先點一個水果');
        if (busy) return;
        busy = true;
        var f = fruits[fsel], mi = i;
        api.send({ op: op, i: mi, k: fsel }).then(function (r) {
          busy = false;
          if (!r || !r.act) return;
          log[mi].push(op === 'test' ? '🔍 ' + f.e + ' → 「' + esc(r.out) + '」' + (r.out === f.n ? ' ✔' : '') : '📚 教它：' + f.e + ' 是「' + esc(f.n) + '」');
          if (sel === mi) body();
        });
      }
      el.querySelector('#bb-test').onclick = function () { act('test'); };
      el.querySelector('#bb-teach').onclick = function () { act('teach'); };
      el.querySelectorAll('.bb-k').forEach(function (b) { b.onclick = function () { cls[i] = b.dataset.k; tabs(); body(); }; });
    }
    tabs(); body();
    el.querySelector('#bb-ok').onclick = function () {
      for (var i = 0; i < n; i++) if (!cls[i]) return warn(api, '機器 ' + 'ABCD'[i] + ' 還沒判斷');
      api.send({ op: 'judge', cls: cls });
    };
  };

  /* 🐱🐶 AI 訓練師（A2）：從題庫挑資料放進資料集，AI 用「最像的例子」預測（1-NN） */
  function nn(set, p) { var b = null, bd = 1e9; set.forEach(function (q) { var d = (q.ear - p.ear) * (q.ear - p.ear) + (q.size - p.size) * (q.size - p.size); if (d < bd) { bd = d; b = q; } }); return b ? b.a : null; }
  L.trainer = function (el, api) {
    var P = api.pub, pool = P.pool, tests = P.tests, max = P.max, chosen = {}, pred = null;
    el.dataset.lab = 'trainer'; el.dataset.pool = JSON.stringify(pool); el.dataset.tests = JSON.stringify(tests); el.dataset.max = max;
    var X = function (v) { return 20 + v * 26; }, Y = function (v) { return 270 - v * 26; };
    el.innerHTML = '<div class="tr"><p class="small">你是 AI 訓練師！右邊題庫有 ' + pool.length + ' 張已標好答案的動物照片（用「耳朵多尖」「體型多大」兩個特徵畫在圖上）。<b>最多挑 ' + max + ' 張</b>放進資料集，AI 會用「資料集裡最像的那一張」來猜 ❓ 是什麼。</p>' +
      tip(api, api.hard ? '看看 ❓ 分布在哪裡：每一群 ❓ 附近，資料集裡都要有牠的代表。' : '貓和狗都要放；挑靠近 ❓ 的例子最有用。') +
      '<div class="tr-grid"><svg viewBox="0 0 290 290" class="tr-svg" id="tr-svg" role="img" aria-label="特徵分布圖"></svg><div><div class="tr-pool" id="tr-pool"></div>' +
      '<div class="row mt1"><span class="chip" id="tr-n"></span><button type="button" class="btn sm" id="tr-run">🧠 訓練並預測</button></div><div id="tr-res" class="small mt1"></div></div></div>' +
      '<div class="row mt2"><button type="button" class="btn go" id="tr-ok">✅ 確認</button></div></div>';
    function draw() {
      var s = '<line x1="20" y1="270" x2="285" y2="270" stroke="#94a3b8"/><line x1="20" y1="5" x2="20" y2="270" stroke="#94a3b8"/><text x="150" y="287" font-size="11" text-anchor="middle" fill="#475569">耳朵越尖 →</text><text x="10" y="140" font-size="11" fill="#475569" transform="rotate(-90 10 140)" text-anchor="middle">體型越大 →</text>';
      pool.forEach(function (p, k) { s += '<text x="' + X(p.ear) + '" y="' + Y(p.size) + '" font-size="' + (chosen[k] ? 20 : 14) + '" text-anchor="middle" dominant-baseline="middle" opacity="' + (chosen[k] ? 1 : .45) + '">' + (p.a === 'cat' ? '🐱' : '🐶') + '</text>' + (chosen[k] ? '<circle cx="' + X(p.ear) + '" cy="' + Y(p.size) + '" r="13" fill="none" stroke="#1d4ed8" stroke-width="2"/>' : ''); });
      tests.forEach(function (p, k) { s += '<text x="' + X(p.ear) + '" y="' + Y(p.size) + '" font-size="16" text-anchor="middle" dominant-baseline="middle">' + (pred ? (pred[k] === 'cat' ? '🐱' : '🐶') : '❓') + '</text><text x="' + (X(p.ear) + 11) + '" y="' + (Y(p.size) - 9) + '" font-size="10" font-weight="900" fill="#b45309">' + (k + 1) + '</text>'; });
      el.querySelector('#tr-svg').innerHTML = s;
      el.querySelector('#tr-pool').innerHTML = pool.map(function (p, k) { return '<button type="button" class="tr-p' + (chosen[k] ? ' on' : '') + '" data-k="' + k + '">' + (p.a === 'cat' ? '🐱 貓' : '🐶 狗') + '<small>耳 ' + p.ear + '・體型 ' + p.size + (p.big ? '・緬因貓' : '') + '</small></button>'; }).join('');
      el.querySelector('#tr-n').textContent = '資料集 ' + Object.keys(chosen).length + '／' + max + ' 張';
      el.querySelectorAll('.tr-p').forEach(function (b) { b.onclick = function () { var k = +b.dataset.k; if (chosen[k]) delete chosen[k]; else { if (Object.keys(chosen).length >= max) return warn(api, '最多 ' + max + ' 張，先拿掉一張'); chosen[k] = 1; } pred = null; el.querySelector('#tr-res').innerHTML = ''; draw(); }; });
    }
    function set() { return Object.keys(chosen).map(function (k) { return pool[k]; }); }
    el.querySelector('#tr-run').onclick = function () {   // 預測只用你挑的資料，照「最像的那一張」算（真正的答案在伺服器）
      if (!Object.keys(chosen).length) return warn(api, '資料集是空的：先挑幾張照片');
      pred = tests.map(function (p) { return nn(set(), p); }); draw();
      el.querySelector('#tr-res').innerHTML = 'AI 的預測：' + pred.map(function (x, k) { return (k + 1) + ' 號 ' + (x === 'cat' ? '🐱' : '🐶'); }).join('、') + '<br><span class="soft">按「確認」看看猜對幾隻。</span>';
    };
    el.querySelector('#tr-ok').onclick = function () {
      if (!pred) return warn(api, '先按「🧠 訓練並預測」');
      api.send({ chosen: Object.keys(chosen).map(Number) });
    };
    draw();
  };

  /* 🤖 死板的機器人（A3）：試跑在這裡照規則模擬，交出的程式由伺服器重跑一次 */
  var DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]], ARROW = ['➡️', '⬇️', '⬅️', '⬆️'];
  L.robotAlgo = function (el, api) {
    var P = api.pub, G = P.G, s = P.s, limit = P.limit, H = G.length, W = G[0].length, prog = [], lastRun = null;
    el.dataset.lab = 'robotAlgo'; el.dataset.map = JSON.stringify(P);
    var BL = [['fwd', '⬆ 前進 1 格'], ['left', '↺ 左轉'], ['right', '↻ 右轉'], ['pick', '✋ 拿起']];
    if (limit) BL.splice(3, 0, ['rep', '🔁 重複執行 _ 次（下一塊）']);
    el.innerHTML = '<div class="ra"><p class="small">機器人很<b>死板</b>：只會照積木一步一步做。排出步驟，讓 🤖 走到 🪥 牙刷那一格再「拿起」。碰到牆壁 🧱 或走出地圖就會停；在 🚽 那格拿起，就拿到馬桶刷了！' + (limit ? '<br>⚡ <b>挑戰：最多只能用 ' + limit + ' 塊積木</b>（用「重複執行」讓程式變短 —— 這就是<b>優化</b>）。' : '') + '</p>' +
      tip(api, '機器人的「前進」是朝它面對的方向。先想好路線，轉彎時想想它現在面向哪裡。') +
      '<div class="ra-grid"><div class="ra-map" id="ra-map" style="grid-template-columns:repeat(' + W + ',1fr)"></div><div><div class="ra-pal">' + BL.map(function (b) { return '<button type="button" class="blk ra-b" data-b="' + b[0] + '">' + b[1] + '</button>'; }).join('') + '</div>' +
      '<ol class="ra-prog" id="ra-prog"></ol><div class="row mt1" style="gap:.35rem"><button type="button" class="btn sm" id="ra-run">▶ 試跑</button><button type="button" class="btn sm" id="ra-clr">🗑️ 清空</button><span class="chip" id="ra-n"></span></div><div id="ra-msg" class="small mt1"></div></div></div>' +
      '<div class="row mt2"><button type="button" class="btn go" id="ra-ok">✅ 交出程式</button></div></div>';
    function run() {
      var p = { x: s.x, y: s.y, d: s.d }, path = [[p.x, p.y]], rep = 1;
      for (var i = 0; i < prog.length; i++) {
        var b = prog[i];
        if (b.t === 'rep') { rep = Math.max(1, Math.min(9, +b.n || 1)); continue; }
        for (var r = 0; r < rep; r++) {
          if (b.t === 'left') p.d = (p.d + 3) % 4;
          else if (b.t === 'right') p.d = (p.d + 1) % 4;
          else if (b.t === 'fwd') {
            var x = p.x + DIRS[p.d][0], y = p.y + DIRS[p.d][1];
            if (x < 0 || y < 0 || x >= W || y >= H) return { path: path, p: p, err: '第 ' + (i + 1) + ' 塊：走出地圖了！' };
            if (G[y][x] === 'wall') return { path: path, p: p, err: '第 ' + (i + 1) + ' 塊：撞到牆壁 🧱！' };
            p.x = x; p.y = y; path.push([x, y]);
          } else if (b.t === 'pick') {
            var c = G[p.y][p.x];
            if (c === 'trap') return { path: path, p: p, err: '拿到馬桶刷了！🚽 機器人不會分辨，完全照你的步驟做。' };
            if (c !== 'goal') return { path: path, p: p, err: '第 ' + (i + 1) + ' 塊：這一格沒有東西可以拿。' };
            return { path: path, p: p, done: true, i: i };
          }
        }
        rep = 1;
      }
      return { path: path, p: p, err: '程式跑完了，但還沒拿到牙刷。' };
    }
    function draw() {
      var on = {}; (lastRun ? lastRun.path : []).forEach(function (q) { on[q[0] + ',' + q[1]] = 1; });
      var rp = lastRun ? lastRun.p : s, h = '';
      for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
        var c = G[y][x], here = rp.x === x && rp.y === y;
        h += '<div class="ra-c' + (c === 'wall' ? ' wall' : '') + (on[x + ',' + y] ? ' trail' : '') + '">' + (here ? '<b>🤖<i>' + ARROW[rp.d] + '</i></b>' : c === 'wall' ? '🧱' : c === 'goal' ? '🪥' : c === 'trap' ? '🚽' : '') + '</div>';
      }
      el.querySelector('#ra-map').innerHTML = h;
      el.querySelector('#ra-prog').innerHTML = prog.length ? prog.map(function (b, i) { return '<li><span class="blk ra-k-' + b.t + '">' + (b.t === 'rep' ? '🔁 重複執行 <input class="ra-rep" data-i="' + i + '" value="' + (b.n || '') + '" inputmode="numeric" aria-label="重複次數"> 次' : BL.filter(function (x) { return x[0] === b.t; })[0][1]) + '</span><button type="button" class="ra-x" data-i="' + i + '" aria-label="刪除第 ' + (i + 1) + ' 塊">✕</button></li>'; }).join('') : '<li class="soft small">（點上面的積木加進來）</li>';
      el.querySelector('#ra-n').textContent = '積木 ' + prog.length + (limit ? '／' + limit : '') + ' 塊';
      el.querySelectorAll('.ra-x').forEach(function (b) { b.onclick = function () { prog.splice(+b.dataset.i, 1); lastRun = null; draw(); }; });
      el.querySelectorAll('.ra-rep').forEach(function (inp) { inp.onchange = function () { prog[+inp.dataset.i].n = +inp.value; lastRun = null; }; });
    }
    el.querySelectorAll('.ra-b').forEach(function (b) { b.onclick = function () { prog.push({ t: b.dataset.b, n: b.dataset.b === 'rep' ? 2 : null }); lastRun = null; el.querySelector('#ra-msg').textContent = ''; draw(); }; });
    el.querySelector('#ra-clr').onclick = function () { prog = []; lastRun = null; draw(); };
    el.querySelector('#ra-run').onclick = function () { lastRun = run(); draw(); el.querySelector('#ra-msg').innerHTML = lastRun.done ? '🎉 拿到牙刷了！' + (limit && prog.length > limit ? '<br>⚠️ 但是用了 ' + prog.length + ' 塊，超過 ' + limit + ' 塊。' : '') : '❌ ' + esc(lastRun.err); };
    el.querySelector('#ra-ok').onclick = function () {
      if (!prog.length) return warn(api, '先排積木');
      lastRun = run(); draw();
      api.send({ prog: prog.map(function (b) { return { t: b.t, n: b.n }; }) });
    };
    draw();
  };

  /* 💬 下一個詞預測機（A4） */
  var WS = { S: ['我', '小明', '阿嬤', '小貓'], V: ['喜歡', '看到', '想要'], A: ['紅紅的', '可愛的', '大大的'], O: ['蘋果', '小狗', '氣球', '書包'] };
  L.nextWord = function (el, api) {
    var P = api.pub, corpus = P.corpus, N = corpus.length;
    el.dataset.lab = 'nextWord'; el.dataset.corpus = JSON.stringify(corpus);
    var show = '<div class="nw-corpus">' + corpus.map(function (s, i) { return '<span><b>' + (i + 1) + '</b> ' + esc(s.join(' ')) + '</span>'; }).join('') + '</div>';
    if (!P.hard) {
      var asks = P.asks, pk = {};
      el.dataset.asks = asks.join(',');
      el.innerHTML = '<div class="nw"><p class="small">這是一個超迷你語言模型的<b>訓練資料</b>（' + N + ' 句話）。語言模型的祕密：數一數哪個詞<b>最常接在後面</b>，就預測它。</p>' + show +
        tip(api, '找出所有含有這個詞的句子，看它後面接什麼，數一數。') +
        '<div class="stack mt1">' + asks.map(function (w, i) {
          var opts = WS[WS.V.indexOf(w) >= 0 ? 'A' : 'O'];
          return '<div class="card soft-bg" style="padding:.55rem .75rem"><p class="small bold">' + (i + 1) + '.「' + esc(w) + '」下一個詞最可能是？</p><div class="row" style="gap:.3rem">' + opts.map(function (o) { return '<button type="button" class="btn sm nw-o" data-i="' + i + '" data-v="' + o + '">' + o + '</button>'; }).join('') + '</div>' +
            '<p class="small mt1">它在「' + esc(w) + '」後面出現了幾次？ <input class="input nw-c" data-i="' + i + '" inputmode="numeric" style="max-width:5rem;display:inline-block;margin:0" aria-label="出現次數"></p></div>';
        }).join('') + '</div><div class="row mt2"><button type="button" class="btn go" id="nw-ok">✅ 確認</button></div></div>';
      el.querySelectorAll('.nw-o').forEach(function (b) { b.onclick = function () { pk[b.dataset.i] = b.dataset.v; el.querySelectorAll('.nw-o[data-i="' + b.dataset.i + '"]').forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
      el.querySelector('#nw-ok').onclick = function () {
        for (var i = 0; i < asks.length; i++) if (!pk[i] || el.querySelector('.nw-c[data-i="' + i + '"]').value.trim() === '') return warn(api, '每一題都要選詞、填次數');
        api.send({ a: asks.map(function (_, i) { return { w: pk[i], n: +el.querySelector('.nw-c[data-i="' + i + '"]').value.trim() }; }) });
      };
      return;
    }
    el.dataset.start = P.start;
    var built = [P.start], seen = null;
    el.innerHTML = '<div class="nw"><p class="small">訓練資料（' + N + ' 句）：</p>' + show +
      '<p class="small mt1">從「<b>' + esc(P.start) + '</b>」開始，每一次都選<b>最常接在後面</b>的詞，接出一句 4 個詞的話。</p>' +
      tip(api, '每一步只看「前一個詞」後面最常出現什麼。') +
      '<div class="nw-built" id="nw-b"></div><div class="row mt1" style="gap:.3rem" id="nw-opts"></div>' +
      '<div class="card soft-bg mt1" style="padding:.55rem .75rem"><p class="small bold">接出來的這句話，在訓練資料裡一模一樣出現過嗎？</p><div class="row" style="gap:.3rem"><button type="button" class="btn sm nw-y" data-v="y">出現過</button><button type="button" class="btn sm nw-y" data-v="n">沒出現過（是新句子）</button></div></div>' +
      '<div class="row mt2"><button type="button" class="btn go" id="nw-ok">✅ 確認</button></div></div>';
    function draw() {
      el.querySelector('#nw-b').innerHTML = built.map(function (w) { return '<span>' + esc(w) + '</span>'; }).join('→') + (built.length < 4 ? '→<span class="soft">？</span>' : '') + (built.length > 1 ? ' <button type="button" class="btn sm" id="nw-undo">↶</button>' : '');
      var cat = ['S', 'V', 'A', 'O'][built.length];
      el.querySelector('#nw-opts').innerHTML = cat ? WS[cat].map(function (w) { return '<button type="button" class="btn sm nw-w" data-w="' + w + '">' + w + '</button>'; }).join('') : '';
      el.querySelectorAll('.nw-w').forEach(function (b) { b.onclick = function () { built.push(b.dataset.w); draw(); }; });
      var u = el.querySelector('#nw-undo'); if (u) u.onclick = function () { built.pop(); draw(); };
    }
    el.querySelectorAll('.nw-y').forEach(function (b) { b.onclick = function () { seen = b.dataset.v; el.querySelectorAll('.nw-y').forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
    el.querySelector('#nw-ok').onclick = function () {
      if (built.length < 4 || !seen) return warn(api, '接滿 4 個詞，也要回答下面那一題');
      api.send({ built: built, seen: seen }).then(function (r) { if (r && r.cut) { built = built.slice(0, r.cut); draw(); } });
    };
    draw();
  };

  /* 🔍 提示詞實驗室（A5）：四要素組提示詞 → 檢查 AI 給的標語草稿 */
  function plen(s) { return String(s).replace(/[，。！？、「」\s,.!?]/g, '').length; }
  L.promptLab = function (el, api) {
    var P = api.pub, slot = {}, mark = {};
    el.dataset.lab = 'promptLab'; el.dataset.s = JSON.stringify(P);
    var SL = [['who', '對象', P.WHO], ['feat', '特色', P.fopts.concat(['全世界最好用'])], ['tone', '語氣', P.TONE], ['lim', '限制', ['每句不超過 ' + P.lim + ' 字、不要誇大', '越長越好', '（不寫）']]];
    var KD = [['ok', '✅ 可以用'], ['long', '📏 太長'], ['hype', '📢 誇大'], ['nofeat', '❓ 沒提到特色']];
    el.innerHTML = '<div class="pl"><div class="note small"><b>任務：</b>幫<b>' + esc(P.o) + '</b>的廣告想標語。要給<b>' + esc(P.who) + '</b>看，想要<b>' + esc(P.tone) + '</b>的感覺，特色是「<b>' + esc(P.feat) + '</b>」，每句不超過 <b>' + P.lim + '</b> 個字。</div>' +
      tip(api, '四要素：對象、特色、語氣、限制。誇大的字（最、保證、第一、全世界、100%、絕對）不能用；字數不算標點。') +
      '<p class="small bold mt1">① 組出提示詞</p>' + SL.map(function (s) { return '<div class="pl-slot"><b class="small">' + s[1] + '</b><span class="pb-opts">' + s[2].map(function (o, k) { return '<button type="button" class="btn sm pl-s" data-s="' + s[0] + '" data-k="' + k + '">' + esc(o) + '</button>'; }).join('') + '</span></div>'; }).join('') +
      '<div class="pl-prompt small mono" id="pl-p"></div>' +
      '<p class="small bold mt2">② AI 給了這些草稿，每一句檢查一下</p><div class="stack">' + P.drafts.map(function (d, i) { return '<div class="pl-d"><span>「' + esc(d) + '」<small class="soft">' + plen(d) + ' 字</small></span><span class="pb-opts">' + KD.map(function (k) { return '<button type="button" class="btn sm pl-k" data-i="' + i + '" data-k="' + k[0] + '">' + k[1] + '</button>'; }).join('') + '</span></div>'; }).join('') + '</div>' +
      (P.hard ? '<p class="small bold mt2">③ 最後由你決定：寫一句自己的標語（要有特色「' + esc(P.feat) + '」、不超過 ' + P.lim + ' 字、不誇大）</p><input class="input" id="pl-mine" maxlength="40" aria-label="我自己的標語">' : '') +
      '<div class="row mt2"><button type="button" class="btn go" id="pl-ok">✅ 確認</button></div></div>';
    function prompt() {
      var g = function (k) { return slot[k] != null ? SL.filter(function (s) { return s[0] === k; })[0][2][slot[k]] : '＿＿'; };
      el.querySelector('#pl-p').textContent = '請為' + P.o + '寫 5 句給「' + g('who') + '」看的「' + g('tone') + '」標語，特色是「' + g('feat') + '」，限制：' + g('lim') + '。';
    }
    el.querySelectorAll('.pl-s').forEach(function (b) { b.onclick = function () { slot[b.dataset.s] = +b.dataset.k; el.querySelectorAll('.pl-s[data-s="' + b.dataset.s + '"]').forEach(function (x) { x.classList.toggle('on', x === b); }); prompt(); }; });
    el.querySelectorAll('.pl-k').forEach(function (b) { b.onclick = function () { mark[b.dataset.i] = b.dataset.k; el.querySelectorAll('.pl-k[data-i="' + b.dataset.i + '"]').forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
    prompt();
    el.querySelector('#pl-ok').onclick = function () {
      if (Object.keys(slot).length < 4) return warn(api, '提示詞的四個要素都要選');
      if (Object.keys(mark).length < P.drafts.length) return warn(api, '每一句草稿都要檢查');
      var mine = el.querySelector('#pl-mine');
      if (mine && !mine.value.trim()) return warn(api, '寫一句你自己的標語');
      api.send({ slot: slot, mark: mark, mine: mine ? mine.value.trim() : null });
    };
  };

  /* 🕵️ 深偽偵探（A6）：AI 生成的圖片常常有破綻 —— 手指數不對、時鐘的數字不對 */
  function handSVG(n, hue) {
    var s = '<svg viewBox="0 0 100 110" class="fk-svg"><rect x="28" y="52" width="46" height="46" rx="14" fill="hsl(' + hue + ',55%,78%)" stroke="#475569" stroke-width="1.5"/>';
    var fingers = n - 1, w = 44 / fingers;
    for (var i = 0; i < fingers; i++) s += '<rect x="' + (30 + i * w + 1) + '" y="' + (14 + Math.abs(i - (fingers - 1) / 2) * 5) + '" width="' + (w - 2.5) + '" height="44" rx="5" fill="hsl(' + hue + ',55%,78%)" stroke="#475569" stroke-width="1.5"/>';
    return s + '<rect x="8" y="58" width="26" height="12" rx="6" transform="rotate(-30 20 64)" fill="hsl(' + hue + ',55%,78%)" stroke="#475569" stroke-width="1.5"/></svg>';
  }
  function clockSVG(nums) {
    var s = '<svg viewBox="0 0 100 100" class="fk-svg"><circle cx="50" cy="50" r="44" fill="#fff" stroke="#334155" stroke-width="3"/>';
    nums.forEach(function (v, i) { var a = (i + 1) / nums.length * 2 * Math.PI - Math.PI / 2; s += '<text x="' + (50 + Math.cos(a) * 34) + '" y="' + (50 + Math.sin(a) * 34) + '" font-size="' + (nums.length > 12 ? 8 : 10) + '" text-anchor="middle" dominant-baseline="middle" font-weight="700">' + v + '</text>'; });
    return s + '<line x1="50" y1="50" x2="50" y2="24" stroke="#334155" stroke-width="3"/><line x1="50" y1="50" x2="68" y2="56" stroke="#334155" stroke-width="2"/></svg>';
  }
  L.fakeSpot = function (el, api) {
    var P = api.pub, imgs = P.imgs, mark = {};
    el.dataset.lab = 'fakeSpot'; el.dataset.imgs = JSON.stringify(imgs);
    el.innerHTML = '<div class="fk"><p class="small">這些圖片有些是 AI 生成的，乍看很正常，<b>細節卻不合理</b>。點出所有有破綻的圖片（可以點很多張，再點一次取消）。</p>' +
      tip(api, '一張一張數：手（含大拇指）應該有 5 根手指' + (P.hard ? '；時鐘應該剛好是 1～12，順序正確、不重複、不多也不少' : '') + '。') +
      '<div class="fk-grid" id="fk-g"></div><div class="row mt2"><button type="button" class="btn go" id="fk-ok">✅ 確認</button></div></div>';
    function draw() {
      el.querySelector('#fk-g').innerHTML = imgs.map(function (x, i) { return '<button type="button" class="fk-i' + (mark[i] ? ' on' : '') + '" data-i="' + i + '" aria-label="第 ' + (i + 1) + ' 張' + (mark[i] ? '（已標記）' : '') + '"><b>' + (i + 1) + '</b>' + (x.k === 'hand' ? handSVG(x.n, x.hue) : clockSVG(x.nums)) + (mark[i] ? '<span class="fk-tag">🤖 有破綻</span>' : '') + '</button>'; }).join('');
      el.querySelectorAll('.fk-i').forEach(function (b) { b.onclick = function () { var i = +b.dataset.i; if (mark[i]) delete mark[i]; else mark[i] = 1; draw(); }; });
    }
    draw();
    el.querySelector('#fk-ok').onclick = function () { api.send({ mark: mark }); };
  };

  CARDGAME.labs = Object.assign(CARDGAME.labs || {}, L);
})();
