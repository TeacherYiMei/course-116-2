/* 🧪 AI 前導關 A1～A6（前端：shared/ai-labs.js） */
(function () {
  var rnd = svRnd, between = svBetween, pick = svPick, shuffle = svShuffle;

  /* 🤖 黑盒子實驗室（A1）：哪一台是規則、哪一台會學習，只有伺服器知道；每一次「測試」「教它」都問伺服器 */
  var FRUIT = [{ e: '🍎', n: '蘋果', c: 'red', s: 'round' }, { e: '🍌', n: '香蕉', c: 'yellow', s: 'long' }, { e: '🍇', n: '葡萄', c: 'purple', s: 'small' }, { e: '🍊', n: '橘子', c: 'orange', s: 'round' }, { e: '🍓', n: '草莓', c: 'red', s: 'small' }];
  function guess(m, k, fruits) {
    var f = fruits[k];
    if (m.type === 'rule') return f.c === m.color ? m.name : '不知道';
    if (m.type === 'rand') return pick(FRUIT).n;
    var best = null, bs = 0;
    m.mem.forEach(function (j) { var x = fruits[j], sc = (x.c === f.c ? 2 : 0) + (x.s === f.s ? 1 : 0) + (j === k ? 5 : 0); if (sc >= bs && sc > 0) { bs = sc; best = x.n; } });
    return best || '不知道';
  }
  SV.labs.blackBox = {
    make: function (hard) {
      var types = hard ? shuffle(['rule', 'learn', 'learn', 'rand']) : shuffle(['rule', 'learn', pick(['rule', 'learn'])]);
      var fruits = hard ? FRUIT : FRUIT.slice(0, 4);
      var ms = types.map(function (t) { var m = { type: t, mem: [], taught: false, after: false }; if (t === 'rule') { var r = pick(FRUIT); m.color = r.c; m.name = r.n; } return m; });
      return { pub: { hard: hard, n: ms.length, fruits: fruits.map(function (f) { return { e: f.e, n: f.n }; }) }, sec: { hard: hard, fruits: fruits, ms: ms } };
    },
    check: function (s, v) {
      var i = +v.i, k = +v.k, m = s.ms[i];
      if (v.op === 'test' || v.op === 'teach') {
        if (!m || !s.fruits[k]) svFail('bad-answer');
        if (v.op === 'test') { if (m.taught) m.after = true; return { act: true, out: guess(m, k, s.fruits), sec: s }; }
        if (m.type === 'learn' && m.mem.indexOf(k) < 0) m.mem.push(k);
        m.taught = true; return { act: true, sec: s };
      }
      var cls = v.cls || {};
      for (i = 0; i < s.ms.length; i++) if (!s.ms[i].taught || !s.ms[i].after) return { act: true, warn: '機器 ' + 'ABCD'[i] + ' 還沒做完實驗：要「教它」之後再「測試」，才有證據' };
      for (i = 0; i < s.ms.length; i++) if (cls[i] !== s.ms[i].type) {
        var t = s.ms[i].type;
        return svNo('機器 ' + 'ABCD'[i] + ' 判斷錯了。', t === 'learn' ? '教了它之後，同一個水果的答案有沒有變對？' : t === 'rule' ? '不管你教它什麼，它的答案都一樣 —— 只是照規則做。' : '沒教它，答案也一直亂變 —— 那不是學習。');
      }
      for (i = 0; i < s.ms.length; i++) if (s.ms[i].type === 'learn') {
        var miss = s.fruits.filter(function (f, j) { return guess(s.ms[i], j, s.fruits) !== f.n; });
        if (miss.length) return svNo('機器 ' + 'ABCD'[i] + ' 還認不得 ' + miss.map(function (f) { return f.e; }).join('') + '。', '把每一種水果都教它一次（資料集要夠多、夠完整）。');
      }
      return svYes('規則機器只會照工程師寫好的規則做；會學習的機器從你給的「資料」找規律、做預測 —— 這就是 AI 的「學習」。');
    }
  };

  /* 🐱🐶 AI 訓練師（A2）：測試動物的真正答案只在伺服器 */
  function truth(p) { return p.big ? 'cat' : p.ear >= 5 ? 'cat' : 'dog'; }
  function nn(set, p) { var b = null, bd = 1e9; set.forEach(function (q) { var d = (q.ear - p.ear) * (q.ear - p.ear) + (q.size - p.size) * (q.size - p.size); if (d < bd) { bd = d; b = q; } }); return b ? truth(b) : null; }
  function subsets(pool, tests, max) {
    var r = { ok: false, okNoBig: false, okOneClass: false }, n = pool.length;
    for (var m = 1; m < (1 << n); m++) {
      var set = [], c = 0; for (var i = 0; i < n; i++) if (m & (1 << i)) { set.push(pool[i]); c++; }
      if (c > max) continue;
      if (tests.every(function (p) { return nn(set, p) === truth(p); })) {
        r.ok = true; if (!set.some(function (p) { return p.big; })) r.okNoBig = true;
        if (set.every(function (p) { return truth(p) === truth(set[0]); })) r.okOneClass = true;
      }
    }
    return r;
  }
  SV.labs.trainer = {
    make: function (hard) {
      var pool, tests, max = hard ? 5 : 4, i;
      function pt(kind) {
        if (kind === 'cat') return { ear: between(6, 9), size: between(1, 4) };
        if (kind === 'dog') return { ear: between(1, 4), size: between(3, 9) };
        return { ear: between(5, 6), size: between(8, 9), big: true };
      }
      for (;;) {
        pool = []; for (i = 0; i < 5; i++) pool.push(pt('cat')); for (i = 0; i < 5; i++) pool.push(pt('dog'));
        if (hard) { pool.push(pt('big')); pool[rnd(5)] = pt('cat'); }
        tests = [pt('cat'), pt('dog'), pt('cat'), pt('dog')]; if (hard) tests.push(pt('big'));
        tests = shuffle(tests);
        var seen = {}, dup = pool.concat(tests).some(function (p) { var k = p.ear + ',' + p.size; if (seen[k]) return true; seen[k] = 1; return false; });
        if (dup) continue;
        var s2 = subsets(pool, tests, max);
        if (!s2.ok || (hard && s2.okNoBig) || (!hard && s2.okOneClass)) continue;
        break;
      }
      pool = shuffle(pool);
      return { pub: { max: max, pool: pool.map(function (p) { return { ear: p.ear, size: p.size, a: truth(p), big: !!p.big }; }), tests: tests.map(function (p) { return { ear: p.ear, size: p.size }; }) },
        sec: { max: max, pool: pool, tests: tests } };
    },
    check: function (s, v) {
      var ch = (v.chosen || []).map(Number).filter(function (k, i, a) { return s.pool[k] && a.indexOf(k) === i; });
      if (!ch.length) return { act: true, warn: '資料集是空的：先挑幾張照片' };
      if (ch.length > s.max) return { act: true, warn: '最多 ' + s.max + ' 張' };
      var set = ch.map(function (k) { return s.pool[k]; }), wrong = [];
      s.tests.forEach(function (p, k) { if (nn(set, p) !== truth(p)) wrong.push(k); });
      if (wrong.length) {
        var big = wrong.some(function (k) { return s.tests[k].big; });
        return svNo(wrong.map(function (k) { return (k + 1) + ' 號其實是' + (truth(s.tests[k]) === 'cat' ? (s.tests[k].big ? '體型很大的貓（緬因貓）' : '貓') : '狗'); }).join('、') + '，AI 猜錯了。',
          big ? '資料集裡沒有「大貓」的代表，AI 只好拿最像的狗來猜 —— 這就是代表性偏見。' : '每一群 ❓ 附近，資料集裡都要有正確答案的例子。', '換掉離 ❓ 很遠的照片，改放靠近猜錯的那一隻的例子。');
      }
      return svYes(s.tests.some(function (p) { return p.big; }) ? '資料集裡有了大型貓的代表，AI 就認得了 —— AI 的偏見，常常來自資料集缺了誰。' : 'AI 只會從你給的資料學；資料挑得好，預測就準。');
    }
  };

  /* 🤖 死板的機器人（A3）：前端可以試跑（照規則模擬），交出的程式由伺服器重跑一次 */
  var DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  function bfsCost(G, W, H, s, goal) {
    var best = {}, q = [[s.x, s.y, s.d, 0]], key = function (x, y, d) { return x + ',' + y + ',' + d; };
    best[key(s.x, s.y, s.d)] = 0;
    while (q.length) {
      q.sort(function (a, b) { return a[3] - b[3]; }); var c = q.shift();
      if (c[0] === goal.x && c[1] === goal.y) return c[3] + 1;
      var nx = [[c[0], c[1], (c[2] + 1) % 4, c[3] + 1], [c[0], c[1], (c[2] + 3) % 4, c[3] + 1]];
      for (var k = 1; k < 6; k++) { var x = c[0] + DIRS[c[2]][0] * k, y = c[1] + DIRS[c[2]][1] * k; if (x < 0 || y < 0 || x >= W || y >= H || G[y][x] === 'wall') break; nx.push([x, y, c[2], c[3] + (k === 1 ? 1 : 2)]); }
      nx.forEach(function (n) { var kk = key(n[0], n[1], n[2]); if (best[kk] == null || best[kk] > n[3]) { best[kk] = n[3]; q.push(n); } });
    }
    return null;
  }
  function robotRun(G, s, prog) {
    var H = G.length, W = G[0].length, p = { x: s.x, y: s.y, d: s.d }, rep = 1;
    for (var i = 0; i < prog.length && i < 60; i++) {
      var b = prog[i] || {};
      if (b.t === 'rep') { rep = Math.max(1, Math.min(9, +b.n || 1)); continue; }
      for (var r = 0; r < rep; r++) {
        if (b.t === 'left') p.d = (p.d + 3) % 4;
        else if (b.t === 'right') p.d = (p.d + 1) % 4;
        else if (b.t === 'fwd') {
          var x = p.x + DIRS[p.d][0], y = p.y + DIRS[p.d][1];
          if (x < 0 || y < 0 || x >= W || y >= H) return { err: '第 ' + (i + 1) + ' 塊：走出地圖了！' };
          if (G[y][x] === 'wall') return { err: '第 ' + (i + 1) + ' 塊：撞到牆壁 🧱！' };
          p.x = x; p.y = y;
        } else if (b.t === 'pick') {
          var c = G[p.y][p.x];
          if (c === 'trap') return { err: '拿到馬桶刷了！🚽 機器人不會分辨，完全照你的步驟做。' };
          if (c !== 'goal') return { err: '第 ' + (i + 1) + ' 塊：這一格沒有東西可以拿。' };
          return { done: true, i: i };
        }
      }
      rep = 1;
    }
    return { err: '程式跑完了，但還沒拿到牙刷。' };
  }
  SV.labs.robotAlgo = {
    make: function (hard) {
      var W = hard ? 6 : 5, H = hard ? 6 : 5, G, s, goal, trap, minC;
      for (;;) {
        G = []; for (var y = 0; y < H; y++) { G.push([]); for (var x = 0; x < W; x++) G[y].push(rnd(100) < (hard ? 18 : 12) ? 'wall' : ''); }
        s = { x: 0, y: rnd(H), d: 0 }; goal = { x: W - 1 - rnd(2), y: rnd(H) }; trap = { x: between(1, W - 2), y: rnd(H) };
        if (G[s.y][s.x] || G[goal.y][goal.x] || G[trap.y][trap.x] || (trap.x === goal.x && trap.y === goal.y)) continue;
        G[goal.y][goal.x] = 'goal'; G[trap.y][trap.x] = 'trap';
        minC = bfsCost(G, W, H, s, goal);
        if (minC && minC >= (hard ? 6 : 4)) break;
      }
      var p = { G: G, s: s, limit: hard ? minC + 1 : null };
      return { pub: p, sec: p };
    },
    check: function (s, v) {
      var prog = Array.isArray(v.prog) ? v.prog.slice(0, 60) : [];
      if (!prog.length) return { act: true, warn: '先排積木' };
      var r = robotRun(s.G, s.s, prog);
      if (!r.done) return svNo(r.err, '按「▶ 試跑」看機器人走到哪裡停下來，從那裡開始修改。');
      if (r.i !== prog.length - 1) return svNo('拿到牙刷之後還有多餘的積木。', '「拿起」應該是最後一塊。');
      if (s.limit && prog.length > s.limit) return svNo('用了 ' + prog.length + ' 塊積木，超過 ' + s.limit + ' 塊。', '連續好幾個「前進」，可以換成「重複執行 N 次」＋一個「前進」。', '也想想看：換一條轉彎比較少的路線。');
      return svYes(s.limit ? '同樣走到終點，積木更少 —— 目標是「程式短」，所以演算法就往這個方向優化。' : '步驟明確、順序正確，死板的機器人也能完成任務 —— 這就是演算法。');
    }
  };

  /* 💬 下一個詞預測機（A4） */
  var WS = { S: ['我', '小明', '阿嬤', '小貓'], V: ['喜歡', '看到', '想要'], A: ['紅紅的', '可愛的', '大大的'], O: ['蘋果', '小狗', '氣球', '書包'] };
  function counts(corpus, w) { var c = {}; corpus.forEach(function (s) { var i = s.indexOf(w); if (i >= 0 && i < s.length - 1) c[s[i + 1]] = (c[s[i + 1]] || 0) + 1; }); return c; }
  function top(c) { var ks = Object.keys(c).sort(function (a, b) { return c[b] - c[a]; }); return ks.length && (ks.length === 1 || c[ks[0]] > c[ks[1]]) ? ks[0] : null; }
  SV.labs.nextWord = {
    make: function (hard) {
      var N = hard ? 10 : 8, corpus, asks, chain;
      for (;;) {
        var fav = { V: pick(WS.V), A: pick(WS.A), O: pick(WS.O) };
        corpus = []; for (var i = 0; i < N; i++) corpus.push([pick(WS.S), rnd(100) < 55 ? fav.V : pick(WS.V), rnd(100) < 50 ? fav.A : pick(WS.A), rnd(100) < 50 ? fav.O : pick(WS.O)]);
        if (!hard) { asks = shuffle([].concat(WS.V, WS.A)).filter(function (w) { return top(counts(corpus, w)); }).slice(0, 2); if (asks.length === 2) break; }
        else { chain = [pick(corpus)[0]]; for (var k = 0; k < 3; k++) { var t = top(counts(corpus, chain[k])); if (!t) break; chain.push(t); } if (chain.length === 4) break; }
      }
      var p = hard ? { hard: true, corpus: corpus, start: chain[0] } : { hard: false, corpus: corpus, asks: asks };
      return { pub: p, sec: p };
    },
    check: function (s, v) {
      if (!s.hard) {
        for (var i = 0; i < s.asks.length; i++) {
          var c = counts(s.corpus, s.asks[i]), t = top(c), g = (v.a || [])[i] || {};
          if (g.w !== t) return svNo((i + 1) + '.「' + s.asks[i] + '」後面接「' + g.w + '」的只有 ' + (c[g.w] || 0) + ' 次，不是最多。', '把含有「' + s.asks[i] + '」的句子都找出來，一個一個數。');
          if (+g.n !== c[t]) return svNo((i + 1) + '. 次數數錯了。', '再數一次「' + s.asks[i] + ' ' + t + '」一起出現的句子。');
        }
        return svYes('語言模型就是這樣「接話」：看過的資料裡，哪個詞最常接在後面，就選它。真正的模型讀了幾十億句話，所以接得很通順。');
      }
      var built = (v.built || []).map(String);
      if (built.length !== 4 || built[0] !== s.start) return { act: true, warn: '接滿 4 個詞，也要回答下面那一題' };
      for (var k = 1; k < 4; k++) {
        var cc = counts(s.corpus, built[k - 1]), tt = top(cc);
        if (built[k] !== tt) return svNo('「' + built[k - 1] + '」後面接「' + built[k] + '」只有 ' + (cc[built[k]] || 0) + ' 次，不是最多。', '找出含有「' + built[k - 1] + '」的句子，數它後面每個詞出現幾次。', null, { cut: k });
      }
      var inData = s.corpus.some(function (x) { return x.join(' ') === built.join(' '); });
      if ((v.seen === 'y') !== inData) return svNo('再對照一次訓練資料：這句話' + (inData ? '有' : '沒有') + '一模一樣出現過？', '一句一句比對 4 個詞。');
      return svYes(inData ? '這次剛好接出資料裡有的句子。' : '每一步都是資料裡「最常見」的接法，卻接出一句資料裡沒有的新句子 —— 這就是「生成」。但它不知道這句話是不是真的！');
    }
  };

  /* 🔍 提示詞實驗室（A5）：草稿有沒有問題的判斷規則在伺服器 */
  var PROD = [
    { o: '雨傘', f: ['一按就開', '傘面很大', '收起來很小'] }, { o: '水壺', f: ['單手就能開', '保冷一整天', '很輕'] },
    { o: '椅子', f: ['可以摺起來', '坐起來很軟', '很輕'] }, { o: '鉛筆盒', f: ['有兩層', '磁鐵扣', '可以站著放'] }, { o: '書包', f: ['有反光條', '背起來很輕', '口袋很多'] }
  ];
  var WHO = ['同學', '爸媽', '老師'], TONE = ['幽默', '溫暖', '熱血'], HYPE = ['最', '保證', '第一', '全世界', '100%', '絕對'];
  function plen(s) { return String(s).replace(/[，。！？、「」\s,.!?]/g, '').length; }
  function hype(s) { return HYPE.filter(function (h) { return String(s).indexOf(h) >= 0; }); }
  function judgeDraft(s, feat, lim) { if (hype(s).length) return 'hype'; if (plen(s) > lim) return 'long'; if (String(s).indexOf(feat) < 0) return 'nofeat'; return 'ok'; }
  SV.labs.promptLab = {
    make: function (hard) {
      var P = pick(PROD), feat = pick(P.f), who = pick(WHO), tone = pick(TONE), lim = pick([12, 15]);
      var OK = [feat + '，天天都好用', '就是' + feat + '，你會愛上它', feat + '，換我陪你', '你的' + P.o + '，' + feat],
        LONG = [feat + '，不管是上學、放學、出去玩還是回家的路上都很方便', '只要擁有這個' + P.o + '，' + feat + '，你每天的生活都會變得更加輕鬆愉快'],
        HY = ['全世界' + feat + '的' + P.o, feat + '，保證你考一百分', '最棒的' + P.o + '，' + feat, feat + '，第一名的選擇'],
        NF = ['快來買，心情好好', '有了它，天天開心', P.o + '，好看又好用'];
      var n = hard ? 6 : 5, drafts;
      for (;;) {
        drafts = shuffle([pick(OK), pick(LONG), pick(HY), pick(NF)].concat(shuffle(OK.concat(HY, NF)).slice(0, n - 4)));
        var ks = drafts.map(function (d) { return judgeDraft(d, feat, lim); });
        if (drafts.filter(function (d, i) { return drafts.indexOf(d) === i; }).length === n && ks.indexOf('ok') >= 0 && ks.indexOf('long') >= 0) break;
      }
      var p = { hard: hard, o: P.o, feat: feat, who: who, tone: tone, lim: lim, drafts: drafts, fopts: P.f, WHO: WHO, TONE: TONE };
      return { pub: p, sec: p };
    },
    check: function (s, v) {
      var slot = v.slot || {}, mark = v.mark || {};
      var want = { who: s.WHO.indexOf(s.who), feat: s.fopts.indexOf(s.feat), tone: s.TONE.indexOf(s.tone), lim: 0 }, name = { who: '對象', feat: '特色', tone: '語氣', lim: '限制' };
      for (var k in want) if (+slot[k] !== want[k]) return svNo('提示詞的「' + name[k] + '」和任務不一樣。', '回去看任務：對象、特色、語氣、字數都寫在裡面。');
      for (var i = 0; i < s.drafts.length; i++) {
        var j = judgeDraft(s.drafts[i], s.feat, s.lim);
        if (mark[i] !== j) return svNo('「' + s.drafts[i] + '」檢查得不對。', j === 'hype' ? '裡面有誇大的字：' + hype(s.drafts[i]).join('、') + '。' : j === 'long' ? '數一數：' + plen(s.drafts[i]) + ' 字，超過 ' + s.lim + ' 字。' : j === 'nofeat' ? '它有提到「' + s.feat + '」嗎？' : '字數、誇大、特色都沒問題，可以用。');
      }
      if (s.hard) {
        var m = String(v.mine || '').trim(), jm = judgeDraft(m, s.feat, s.lim);
        if (!m) return { act: true, warn: '寫一句你自己的標語' };
        if (jm !== 'ok') return svNo('你的標語' + { hype: '用了誇大的字（' + hype(m).join('、') + '）', long: '有 ' + plen(m) + ' 字，太長了', nofeat: '沒有提到「' + s.feat + '」' }[jm] + '。', '把特色放進去、刪掉多餘的字。');
        if (s.drafts.indexOf(m) >= 0) return svNo('這是 AI 的原句，改成你自己的說法。', 'AI 給草稿，你做決定 —— 至少改幾個字，變成你的。');
      }
      return svYes('提示詞四要素都有，AI 才寫得對方向；AI 的草稿還是要一句一句檢查 —— 太長、誇大、沒提到特色的都不能用。');
    }
  };

  /* 🕵️ 深偽偵探（A6） */
  function clockOk(nums) { return nums.length === 12 && nums.every(function (v, i) { return v === i + 1; }); }
  function imgOk(x) { return x.k === 'hand' ? x.n === 5 : clockOk(x.nums); }
  SV.labs.fakeSpot = {
    make: function (hard) {
      var N = hard ? 10 : 8, imgs;
      for (;;) {
        imgs = [];
        for (var i = 0; i < N; i++) {
          var fake = rnd(100) < 40;
          if (hard && i % 2) {
            var nums = []; for (var k = 1; k <= 12; k++) nums.push(k);
            if (fake) { var how = rnd(3); if (how === 0) { var a0 = between(1, 10), b0 = between(1, 10); nums[a0] = nums[b0] === 7 ? 3 : 7; } else if (how === 1) nums.push(13); else { var a = between(1, 10), t = nums[a]; nums[a] = nums[a + 1]; nums[a + 1] = t; } }
            imgs.push({ k: 'clock', nums: nums });
          } else imgs.push({ k: 'hand', n: fake ? pick([4, 6, 6, 7]) : 5, hue: between(15, 35) });
        }
        var f = imgs.filter(function (x) { return !imgOk(x); }).length;
        if (f >= 2 && f <= N - 2) break;
      }
      var p = { hard: hard, imgs: imgs };
      return { pub: p, sec: p };
    },
    check: function (s, v) {
      var mark = v.mark || {}, miss = [], wrong = [];
      s.imgs.forEach(function (x, i) { if (!imgOk(x) && !mark[i]) miss.push(i + 1); if (imgOk(x) && mark[i]) wrong.push(i + 1); });
      if (wrong.length) return svNo('第 ' + wrong.join('、') + ' 張其實沒有破綻。', '不要只憑感覺：數清楚手指、檢查時鐘的數字。');
      if (miss.length) return svNo('還有 ' + miss.length + ' 張有破綻沒找到。', '一張一張數，不要跳過。', '手：大拇指＋其他手指一共 5 根。' + (s.hard ? '時鐘：1、2、3…12 依序排一圈。' : ''));
      return svYes('AI 生成的圖片乍看很真，細節常常露出破綻。看到驚人的圖片：先停、查來源、找破綻、交叉比對，再決定要不要分享。');
    }
  };
  SV._ai = { truth: truth, nn: nn, bfsCost: bfsCost, robotRun: robotRun, counts: counts, top: top, judgeDraft: judgeDraft, clockOk: clockOk, WS: WS };
})();
