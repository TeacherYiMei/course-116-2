/* =====================================================================
   🧪 資料偵探・視覺化實驗站（CARDGAME.labs）── D1～D3 三星三階的「操作」「挑戰」
   ---------------------------------------------------------------------
   dataToInfo（D1 資料 → 資訊）、cleanLab（D2 資料清潔隊）、rleLab（D3 無失真壓縮：連續長度編碼）
   D4 密碼特務入門用伺服器上的出題器（server/61_gen_cipher.js）。
   ⭐ 情境由伺服器產生（server/42_labs_data.js），也由伺服器判斷對錯；這裡只畫畫面、把學生的操作送上去（api.send）。
   el.dataset 只放畫面上看得到的題目，給測試的解題器看。
   ===================================================================== */
(function () {
  function esc(s) { return UI.esc(s); }
  function tip(api, t) { return api.practice ? '<div class="note small mt1">💡 提示：' + esc(t) + '</div>' : ''; }
  function warn(api, t) { api.say('<div class="note warn small">' + esc(t) + '</div>'); }
  var L = {};

  /* =================================================================
     🔎 資料 → 資訊（D1）：一堆原始數字，整理出能做決定的資訊
     基本：體溫紀錄 → 幾人發燒、最高是誰、要不要通報
     挑戰：兩週步數 → 各週平均、成長幾 %、結論
     ================================================================= */
  L.dataToInfo = function (el, api) {
    el.dataset.lab = 'dataToInfo';
    var P = api.pub, table, ask;
    if (P.kind === 'temp') {
      table = '<table class="t mono di-t"><tr><th>座號</th><th>姓名</th><th>體溫 °C</th></tr>' + P.names.map(function (nm, i) { return '<tr><td>' + (i + 1) + '</td><td>' + esc(nm) + '</td><td>' + P.temps[i].toFixed(1) + '</td></tr>'; }).join('') + '</table>';
      ask = [{ k: 'fever', t: '體溫 37.5°C（含）以上算發燒，有幾人發燒？', inp: 'num' },
        { k: 'max', t: '體溫最高的是幾號？', inp: 'num' },
        { k: 'act', t: '所以，今天要不要通報？', inp: 'yn' }];
      el.dataset.d = JSON.stringify({ kind: 'temp', temps: P.temps });
    } else {
      var days = ['一', '二', '三', '四', '五', '六', '日'];
      table = '<div class="scroll-x"><table class="t mono di-t"><tr><th>哪一週</th>' + days.map(function (x) { return '<th>週' + x + '</th>'; }).join('') + '</tr>' +
        '<tr><th>上週</th>' + P.w1.map(function (v) { return '<td>' + v + '</td>'; }).join('') + '</tr><tr><th>這週</th>' + P.w2.map(function (v) { return '<td>' + v + '</td>'; }).join('') + '</tr></table></div>';
      ask = [{ k: 'a1', t: '上週平均每天走幾步？', inp: 'num' }, { k: 'a2', t: '這週平均每天走幾步？', inp: 'num' },
        { k: 'pct', t: '這週比上週多（或少）幾 %？（少了就打負的，四捨五入到整數）', inp: 'num' },
        { k: 'act', t: '結論：這週運動量有沒有比上週多？', inp: 'yn' }];
      el.dataset.d = JSON.stringify({ kind: 'steps', w1: P.w1, w2: P.w2 });
    }
    el.innerHTML = '<div class="di"><p class="small">左邊是一堆<b>原始資料</b>：看不出結論。把它整理、計算，變成<b>能幫我們做決定的資訊</b>。</p>' +
      tip(api, api.hard ? '平均 ＝ 七天加起來 ÷ 7；成長率 ＝（這週 − 上週）÷ 上週 × 100。' : '一個一個看，37.5 以上的就數 1。') +
      '<div class="di-grid"><div>' + table + '</div><div class="stack">' + ask.map(function (a, i) {
        return '<div class="card soft-bg" style="padding:.55rem .75rem"><p class="small bold">' + (i + 1) + '. ' + esc(a.t) + '</p><div class="mt1">' +
          (a.inp === 'yn' ? '<span class="row" style="gap:.3rem"><button type="button" class="btn sm di-yn" data-k="' + a.k + '" data-v="y">' + (api.hard ? '📈 有' : '📢 要通報') + '</button><button type="button" class="btn sm di-yn" data-k="' + a.k + '" data-v="n">' + (api.hard ? '📉 沒有' : '🙆 不用') + '</button></span>'
            : '<input class="input di-n" data-k="' + a.k + '" inputmode="numeric" style="max-width:9rem;margin:0" aria-label="' + esc(a.t) + '">') + '</div></div>';
      }).join('') + '</div></div><div class="row mt2"><button type="button" class="btn go" id="di-ok">✅ 確認</button></div></div>';
    var yn = {};
    el.querySelectorAll('.di-yn').forEach(function (b) { b.onclick = function () { yn[b.dataset.k] = b.dataset.v; el.querySelectorAll('.di-yn[data-k="' + b.dataset.k + '"]').forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
    el.querySelector('#di-ok').onclick = function () {
      var got = {};
      for (var i = 0; i < ask.length; i++) {
        var a = ask[i];
        if (a.inp === 'yn') { if (!yn[a.k]) return warn(api, '每一題都要作答'); got[a.k] = yn[a.k]; }
        else { var v = el.querySelector('.di-n[data-k="' + a.k + '"]').value.trim().replace('%', '').replace('−', '-'); if (v === '') return warn(api, '每一題都要作答'); got[a.k] = +v; }
      }
      api.send(got);
    };
  };

  /* =================================================================
     🧹 資料清潔隊（D2）
     基本：每一筆會員資料判斷問題：正常／不完整／有雜訊／格式不一致
     挑戰：真的動手清：有雜訊的刪除、漏填成績用平均填補、日期統一成 YYYY/M/D
     ================================================================= */
  var LAB = { ok: '✅ 正常', miss: '🕳️ 不完整', noise: '⚡ 有雜訊', fmt: '🔀 格式不一致' };
  L.cleanLab = function (el, api) {
    el.dataset.lab = 'cleanLab';
    var P = api.pub, rows = P.rows;
    el.dataset.rows = JSON.stringify(rows);
    if (P.kind === 'members') {
      el.innerHTML = '<div class="cl"><p class="small">會員資料要拿來分析之前，先檢查每一筆：它有什麼問題？</p>' +
        tip(api, '空白＝不完整；不可能的數值（200 歲、11 碼手機、一百多年前出生）＝雜訊；同一種資料寫法不同＝格式不一致。') +
        '<div class="scroll-x"><table class="t cl-t"><tr><th>姓名</th><th>年齡</th><th>生日</th><th>手機</th><th>這一筆…</th></tr>' + rows.map(function (r, i) {
          return '<tr><td>' + esc(r.name) + '</td><td class="mono">' + r.age + '</td><td class="mono">' + (r.birth ? esc(r.birth) : '<i class="cl-empty">（空白）</i>') + '</td><td class="mono">' + (r.phone ? esc(r.phone) : '<i class="cl-empty">（空白）</i>') + '</td><td><span class="pb-opts">' +
            Object.keys(LAB).map(function (k) { return '<button type="button" class="btn sm cl-k" data-i="' + i + '" data-k="' + k + '">' + LAB[k] + '</button>'; }).join('') + '</span></td></tr>';
        }).join('') + '</table></div><div class="row mt2"><button type="button" class="btn go" id="cl-ok">✅ 確認</button></div></div>';
      var mark = {};
      el.querySelectorAll('.cl-k').forEach(function (b) { b.onclick = function () { mark[b.dataset.i] = b.dataset.k; el.querySelectorAll('.cl-k[data-i="' + b.dataset.i + '"]').forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
      el.querySelector('#cl-ok').onclick = function () {
        if (Object.keys(mark).length < rows.length) return warn(api, '每一筆都要判斷');
        api.send({ mark: mark });
      };
      return;
    }
    /* 挑戰：成績單清理 */
    el.innerHTML = '<div class="cl"><p class="small">這是全班小考成績（滿分 100），要算平均之前先清理：每一筆選一個處理方式，需要的話填上新的值。</p>' +
      '<div class="note small">規則：<b>有雜訊</b>的整筆刪除；<b>漏登成績</b>用其他（刪除後剩下的）同學的平均填補；<b>日期</b>統一寫成 <code>2026/4/2</code> 這種格式。</div>' +
      tip(api, '先找出不可能的分數（超過 100）刪掉，再用剩下有分數的同學算平均。') +
      '<div class="scroll-x"><table class="t cl-t"><tr><th>姓名</th><th>成績</th><th>考試日期</th><th>處理</th><th>新的值</th></tr>' + rows.map(function (r, j) {
        return '<tr><td>' + esc(r.name) + '</td><td class="mono">' + (r.score === '' ? '<i class="cl-empty">（空白）</i>' : r.score) + '</td><td class="mono">' + esc(r.date) + '</td><td><span class="pb-opts">' +
          [['keep', '保留'], ['del', '🗑️ 刪除'], ['fill', '🩹 填補成績'], ['conv', '🔄 轉換日期']].map(function (a) { return '<button type="button" class="btn sm cl-a" data-i="' + j + '" data-a="' + a[0] + '">' + a[1] + '</button>'; }).join('') +
          '</span></td><td><input class="input cl-v" data-i="' + j + '" style="max-width:8rem;margin:0" aria-label="' + esc(r.name) + ' 新的值" disabled></td></tr>';
      }).join('') + '</table></div><div class="row mt2"><button type="button" class="btn go" id="cl-ok">✅ 確認</button></div></div>';
    var act = {};
    el.querySelectorAll('.cl-a').forEach(function (b) { b.onclick = function () {
      var j = b.dataset.i; act[j] = b.dataset.a;
      el.querySelectorAll('.cl-a[data-i="' + j + '"]').forEach(function (x) { x.classList.toggle('on', x === b); });
      var inp = el.querySelector('.cl-v[data-i="' + j + '"]'); inp.disabled = !(act[j] === 'fill' || act[j] === 'conv'); if (inp.disabled) inp.value = ''; else inp.focus();
    }; });
    el.querySelector('#cl-ok').onclick = function () {
      if (Object.keys(act).length < rows.length) return warn(api, '每一筆都要選處理方式');
      var val = {}; rows.forEach(function (_, j) { val[j] = el.querySelector('.cl-v[data-i="' + j + '"]').value.trim(); });
      api.send({ act: act, val: val });
    };
  };

  /* =================================================================
     🗜️ 無失真壓縮：連續長度編碼（D3 科技廣角）
     一排黑白格子 → 「白幾格、黑幾格…」的數字（從白色開始，第一段沒有白就寫 0）
     基本：把兩排編碼；挑戰：照數字把圖畫回來（證明可以完全還原），再算省了多少
     ================================================================= */
  L.rleLab = function (el, api) {
    el.dataset.lab = 'rleLab';
    var P = api.pub, W = P.W;
    if (P.kind === 'enc') {
      var rows = P.rows;
      el.dataset.rows = JSON.stringify(rows);
      el.innerHTML = '<div class="rl"><p class="small">傳真機的壓縮法：一排格子不要一格一格記，改記<b>「白幾格、黑幾格、白幾格…」</b>。<b>一定從白色開始數</b>，開頭是黑色就先寫 0。數字用逗號隔開。</p>' +
        '<div class="note small">例：⬜⬜⬛⬛⬛⬜ → <code>2,3,1</code>　　⬛⬛⬜⬜⬜⬜ → <code>0,2,4</code></div>' +
        tip(api, '數一數同樣顏色連在一起有幾格，換顏色就換下一個數字。') +
        rows.map(function (r, i) { return '<div class="rl-row mt1"><div class="px-row" aria-label="第 ' + (i + 1) + ' 排">' + r.map(function (p) { return '<i class="px' + (p ? ' on' : '') + '"></i>'; }).join('') + '</div><input class="input rl-in" data-i="' + i + '" placeholder="例如 2,3,1" inputmode="numeric" aria-label="第 ' + (i + 1) + ' 排的編碼"></div>'; }).join('') +
        '<div class="card soft-bg mt1" style="padding:.55rem .75rem"><p class="small bold">原本要記 ' + W * 2 + ' 格，壓縮後兩排一共只要記幾個數字？</p><input class="input" id="rl-cnt" inputmode="numeric" style="max-width:8rem;margin:0" aria-label="數字個數"></div>' +
        '<div class="row mt2"><button type="button" class="btn go" id="rl-ok">✅ 確認</button></div></div>';
      el.querySelector('#rl-ok').onclick = function () {
        var vals = [0, 1].map(function (i) { return el.querySelector('.rl-in[data-i="' + i + '"]').value.replace(/[，、\s]/g, ',').split(',').filter(function (x) { return x !== ''; }).map(Number); });
        var cnt = el.querySelector('#rl-cnt').value.trim();
        if (!vals[0].length || !vals[1].length || cnt === '') return warn(api, '兩排都要編碼，也要填數字個數');
        api.send({ vals: vals, cnt: +cnt });
      };
      return;
    }
    /* 挑戰：解碼畫圖 */
    var H = P.H, codes = P.codes, grid = codes.map(function () { var r = []; for (var x = 0; x < W; x++) r.push(0); return r; });
    el.dataset.codes = JSON.stringify(codes);
    el.innerHTML = '<div class="rl"><p class="small">收到一張傳真的「壓縮碼」：每一排都是「白幾格、黑幾格…」（從白色開始）。<b>點格子把圖畫回來</b>（點一下變黑、再點變白）。</p>' +
      tip(api, '第一個數字是白色的格數，第二個是黑色，第三個又是白色……0 表示開頭就是黑色。') +
      '<div class="rl-dec"><div class="rl-codes mono">' + codes.map(function (c) { return '<div>' + c.join(',') + '</div>'; }).join('') + '</div><div class="px-grid" id="rl-g"></div></div>' +
      '<div class="card soft-bg mt1" style="padding:.55rem .75rem"><p class="small bold">原本 ' + W * H + ' 格，壓縮碼一共幾個數字？這是失真還是無失真壓縮？</p><div class="row" style="gap:.4rem"><input class="input" id="rl-cnt" inputmode="numeric" style="max-width:7rem;margin:0" aria-label="數字個數">' +
      '<button type="button" class="btn sm rl-k" data-k="lossless">🗜️ 無失真</button><button type="button" class="btn sm rl-k" data-k="lossy">📉 失真</button></div></div>' +
      '<div class="row mt2"><button type="button" class="btn go" id="rl-ok">✅ 確認</button></div></div>';
    var kind = null;
    el.querySelectorAll('.rl-k').forEach(function (b) { b.onclick = function () { kind = b.dataset.k; el.querySelectorAll('.rl-k').forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
    function draw() {
      el.querySelector('#rl-g').innerHTML = grid.map(function (r, yy) { return '<div class="px-row">' + r.map(function (p, xx) { return '<button type="button" class="px' + (p ? ' on' : '') + '" data-x="' + xx + '" data-y="' + yy + '" aria-label="第 ' + (yy + 1) + ' 排第 ' + (xx + 1) + ' 格"></button>'; }).join('') + '</div>'; }).join('');
      el.querySelectorAll('#rl-g .px').forEach(function (b) { b.onclick = function () { grid[+b.dataset.y][+b.dataset.x] ^= 1; draw(); }; });
    }
    draw();
    el.querySelector('#rl-ok').onclick = function () {
      if (el.querySelector('#rl-cnt').value.trim() === '' || !kind) return warn(api, '畫完圖，也要回答下面兩題');
      api.send({ grid: grid, cnt: +el.querySelector('#rl-cnt').value.trim(), kind: kind });
    };
  };

  CARDGAME.labs = Object.assign(CARDGAME.labs || {}, L);
})();
