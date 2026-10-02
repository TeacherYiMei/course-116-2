/* 🧪 資料偵探 D1～D3（前端：shared/data-labs.js） */
(function () {
  var rnd = svRnd, between = svBetween, pick = svPick, shuffle = svShuffle;
  var NAMES = ['小安', '阿哲', '小雯', '柏宇', '若晴', '子涵', '冠廷', '雅婷', '承恩', '品妍', '宥辰', '芷若'];

  /* 🔎 資料 → 資訊（D1） */
  SV.labs.dataToInfo = {
    make: function (hard) {
      if (!hard) {
        var n = between(7, 9), names = shuffle(NAMES).slice(0, n), temps;
        for (;;) {
          temps = names.map(function () { return (363 + rnd(20)) / 10; });
          var mx = Math.max.apply(null, temps);
          if (temps.filter(function (t) { return t === mx; }).length === 1) break;
        }
        var pub = { kind: 'temp', names: names, temps: temps };
        return { pub: pub, sec: pub };
      }
      var w1, w2, a1, a2, pct;
      for (;;) {
        w1 = []; w2 = []; for (var d = 0; d < 7; d++) { w1.push(between(40, 90) * 100); w2.push(between(40, 90) * 100); }
        var s1 = w1.reduce(function (a, b) { return a + b; }, 0), s2 = w2.reduce(function (a, b) { return a + b; }, 0);
        if (s1 % 7 || s2 % 7) continue;
        a1 = s1 / 7; a2 = s2 / 7; pct = Math.round((a2 - a1) / a1 * 100);
        if (Math.abs(pct) >= 3) break;
      }
      var p2 = { kind: 'steps', w1: w1, w2: w2 };
      return { pub: p2, sec: p2 };
    },
    check: function (s, v, ctx) {
      var calc, ask;
      if (s.kind === 'temp') {
        var fever = s.temps.filter(function (t) { return t >= 37.5; }).length;
        calc = { fever: fever, max: s.temps.indexOf(Math.max.apply(null, s.temps)) + 1, act: fever > 0 ? 'y' : 'n' }; ask = ['fever', 'max', 'act'];
      } else {
        var a1 = s.w1.reduce(function (a, b) { return a + b; }, 0) / 7, a2 = s.w2.reduce(function (a, b) { return a + b; }, 0) / 7;
        calc = { a1: a1, a2: a2, pct: Math.round((a2 - a1) / a1 * 100), act: a2 > a1 ? 'y' : 'n' }; ask = ['a1', 'a2', 'pct', 'act'];
      }
      var H = { fever: ['發燒人數不對。', '37.5 也算發燒（含）。'], max: ['體溫最高的不是這一號。', '從上到下比一遍，記住最大的。'], act: ['結論和你算出來的資訊對不上。', s.kind === 'steps' ? '平均變大就是有比較多。' : '有人發燒就要通報。'],
        a1: ['上週平均算錯了。', '七天加起來再除以 7。'], a2: ['這週平均算錯了。', '七天加起來再除以 7。'], pct: ['成長率算錯了。', '（這週 − 上週）÷ 上週 × 100，四捨五入；變少就是負的。'] };
      for (var i = 0; i < ask.length; i++) {
        var k = ask[i], got = k === 'act' ? String(v[k]) : +v[k];
        if (got !== calc[k]) return svNo((i + 1) + '. ' + H[k][0], H[k][1]);
      }
      return svYes(s.kind === 'steps' ? '一串步數（資料）→ 平均、成長率（資訊）→「運動量變多了」（可以拿來做判斷）。' : '一串體溫（資料）→「' + calc.fever + ' 人發燒」（資訊）→ 決定要不要通報。整理過、能幫忙做決定的，才是資訊。');
    }
  };

  /* 🧹 資料清潔隊（D2） */
  var BAD = ['miss', 'noise', 'fmt'];
  function mkDate() { return { y: between(1995, 2012), m: between(1, 12), d: between(1, 28) }; }
  function std(dt) { return dt.y + '/' + dt.m + '/' + dt.d; }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function oddFmt(dt) { return pick([dt.y + '.' + pad2(dt.m) + '.' + pad2(dt.d), dt.y + '-' + pad2(dt.m) + '-' + pad2(dt.d), dt.y + '年' + dt.m + '月' + dt.d + '日']); }
  function judge(r) {
    if (!r.phone || !r.birth) return 'miss';
    if (r.age > 120 || r.phone.length !== 10) return 'noise';
    if (!/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(r.birth)) return 'fmt';
    return 'ok';
  }
  SV.labs.cleanLab = {
    make: function (hard) {
      var n = hard ? 7 : 6, rows = [];
      if (!hard) {
        var kinds = shuffle(['ok', 'miss', 'noise', 'fmt'].concat([pick(BAD), pick(['ok'].concat(BAD))])).slice(0, n);
        kinds.forEach(function (k, i) {
          var dt = mkDate(), r = { name: NAMES[i], birth: std(dt), phone: '09' + String(between(10000000, 99999999)), age: 2026 - dt.y };
          if (k === 'miss') r[pick(['phone', 'birth'])] = '';
          if (k === 'noise') { var how = rnd(3); if (how === 0) r.age = between(150, 230); else if (how === 1) r.phone = r.phone + between(0, 9); else { r.birth = std({ y: between(1860, 1890), m: dt.m, d: dt.d }); r.age = 2026 - +r.birth.split('/')[0]; } }
          if (k === 'fmt') r.birth = oddFmt(dt);
          rows.push(r);
        });
        return { pub: { kind: 'members', rows: rows }, sec: { kind: 'members', rows: rows } };
      }
      var scores, others, missI, noiseI, i2;
      for (;;) {
        scores = []; for (i2 = 0; i2 < n; i2++) scores.push(between(55, 98));
        missI = rnd(n); noiseI = (missI + 1 + rnd(n - 1)) % n; others = scores.filter(function (_, j) { return j !== missI && j !== noiseI; });
        if (others.reduce(function (a, b) { return a + b; }, 0) % others.length === 0) break;
      }
      var fmtIs = shuffle(scores.map(function (_, j) { return j; }).filter(function (j) { return j !== missI && j !== noiseI; })).slice(0, 2);
      rows = scores.map(function (sc, j) { var dt = mkDate(); dt.y = 2026; dt.m = between(3, 5); return { name: NAMES[j], score: j === missI ? '' : j === noiseI ? between(150, 400) : sc, date: fmtIs.indexOf(j) >= 0 ? oddFmt(dt) : std(dt), std: std(dt) }; });
      return { pub: { kind: 'scores', rows: rows.map(function (r) { return { name: r.name, score: r.score, date: r.date }; }) },
        sec: { kind: 'scores', rows: rows, avg: others.reduce(function (a, b) { return a + b; }, 0) / others.length } };
    },
    check: function (s, v) {
      var rows = s.rows, i;
      if (s.kind === 'members') {
        var mark = v.mark || {};
        for (i = 0; i < rows.length; i++) {
          var k = judge(rows[i]);
          if (mark[i] !== k) return svNo(rows[i].name + ' 這一筆判斷得不對。', k === 'ok' ? '仔細看，每一欄都合理嗎？都合理就是正常。' : { miss: '有欄位是空白的。', noise: '有一個數值不可能是真的。', fmt: '生日的寫法和其他人不一樣。' }[k]);
        }
        return svYes('找出問題之後，才知道要刪除、填補還是轉換 —— 這就是「資料前處理」。');
      }
      var act = v.act || {}, val = v.val || {}, noiseScore = 0;
      for (var j = 0; j < rows.length; j++) {
        var r = rows[j], a = act[j], x = String(val[j] || '').replace(/\s/g, '');
        var noise = typeof r.score === 'number' && r.score > 100, miss = r.score === '', odd = r.date !== r.std;
        if (noise) { noiseScore = r.score; if (a !== 'del') return svNo(r.name + ' 的成績 ' + r.score + ' 分不可能（滿分 100），這是雜訊。', '有雜訊的整筆刪除。'); continue; }
        if (a === 'del') return svNo(r.name + ' 這筆資料可以救，不用刪。', '只有「不可能」的資料才刪除；漏填可以填補、格式可以轉換。');
        if (miss) { if (a !== 'fill') return svNo(r.name + ' 漏登了成績。', '人數不多，刪掉可惜 —— 用平均填補。');
          if (+x !== s.avg || x === '') return svNo(r.name + ' 填的平均不對。', '把雜訊刪掉之後，其他有成績的同學加起來 ÷ 人數。', '不要把被刪除的那一筆，也不要把空白的算進去。'); continue; }
        if (odd) { if (a !== 'conv') return svNo(r.name + ' 的日期寫法和別人不一樣。', '選「轉換日期」，改成 2026/4/2 的格式。');
          if (x !== r.std) return svNo(r.name + ' 的日期轉換得不對：' + (x || '（空白）') + '。', '年/月/日，月和日前面不用補 0。'); continue; }
        if (a !== 'keep') return svNo(r.name + ' 這一筆沒有問題，保留就好。', '不需要處理的資料，不要動它。');
      }
      return svYes('清理完成！平均是 ' + s.avg + ' 分 —— 如果沒刪掉 ' + noiseScore + ' 分那一筆，平均會被拉高很多。');
    }
  };

  /* 🗜️ 連續長度編碼（D3） */
  function rle(row) { var out = [], cur = 0, c = 0; row.forEach(function (px) { if (px === cur) c++; else { out.push(c); cur = px; c = 1; } }); out.push(c); return out; }
  function mkRow(w) { var r = [], v = rnd(2); while (r.length < w) { var len = between(1, 4); for (var i = 0; i < len && r.length < w; i++) r.push(v); v = 1 - v; } return r; }
  SV.labs.rleLab = {
    make: function (hard) {
      var W = hard ? 8 : 10;
      if (!hard) { var p = { kind: 'enc', W: W, rows: [mkRow(W), mkRow(W)] }; return { pub: p, sec: p }; }
      var img = []; for (var y = 0; y < 6; y++) img.push(mkRow(W));
      var p2 = { kind: 'dec', W: W, H: 6, codes: img.map(rle) };
      return { pub: p2, sec: p2 };
    },
    check: function (s, v) {
      if (s.kind === 'enc') {
        var vals = (v.vals || []).map(function (a) { return (a || []).map(Number); });
        for (var i = 0; i < 2; i++) {
          var want = rle(s.rows[i]), mine = vals[i] || [];
          if (mine.join(',') !== want.join(',')) {
            var sum = mine.reduce(function (a, b) { return a + b; }, 0);
            return svNo('第 ' + (i + 1) + ' 排的編碼不對' + (sum !== s.W ? '（加起來是 ' + sum + ' 格，應該是 ' + s.W + ' 格）' : '') + '。', s.rows[i][0] ? '這一排開頭是黑色：第一個數字要寫 0（白色 0 格）。' : '從白色開始，一段一段數。');
          }
        }
        if (+v.cnt !== rle(s.rows[0]).length + rle(s.rows[1]).length) return svNo('數字個數算錯了。', '把兩排編碼的數字個數加起來。');
        return svYes('用數字就能把圖「一格不差」地還原 —— 這是無失真壓縮（PNG、ZIP 的想法）。同樣顏色連得越長，省得越多。');
      }
      var grid = v.grid || [];
      for (var y = 0; y < s.H; y++) { var row = (grid[y] || []).slice(0, s.W).map(function (x) { return x ? 1 : 0; }); while (row.length < s.W) row.push(0); if (rle(row).join(',') !== s.codes[y].join(',')) return svNo('第 ' + (y + 1) + ' 排畫得和壓縮碼 ' + s.codes[y].join(',') + ' 對不上。', '從左邊開始：先留白幾格、再塗黑幾格……'); }
      var total = s.codes.reduce(function (a, c) { return a + c.length; }, 0);
      if (+v.cnt !== total) return svNo('數字個數算錯了。', '每一排的數字個數加起來。');
      if (v.kind !== 'lossless') return svNo('你剛剛把圖一格不差地畫回來了 —— 能完全還原的是哪一種？', '可以完全還原＝無失真。');
      return svYes('照著 ' + total + ' 個數字就畫回 ' + s.W * s.H + ' 格，一格都沒錯 —— 可以完全還原，就是無失真壓縮。');
    }
  };
  SV._data = { rle: rle, judge: judge };
})();
