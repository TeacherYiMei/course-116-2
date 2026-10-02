/* =====================================================================
   迷你試算表關卡引擎（SHEET）
   ---------------------------------------------------------------------
   SHEET.mount({ app:'#app', levels: SHEET_LEVELS, mod:'sheet', ref:'sheetref.html' })
     ref：函式小抄的網址；有給就顯示「📚」按鈕，在同一頁開浮動視窗（要先載入 shared/refpanel.js）
   SHEET.explain(公式, 錯誤)       → { title, tip, bad, good, ref } 國中生看得懂的錯誤說明（小抄頁也用它）
   SHEET.evaluate(formula, grid)   → 數值／字串，錯誤時丟出 { code:'#NAME?', msg }

   支援：= 開頭的公式、+ - * / 與括號、儲存格 B2、範圍 B2:B9、
         SUM AVERAGE COUNT COUNTA MAX MIN ROUND COUNTIF
         COUNTIF 條件：數字、"女"、">=140"、"<>A"、儲存格（B10）
   全形符號（＝，（）＂）會先轉成半形 —— 真的試算表不會幫你轉，所以畫面上會提醒。

   關卡欄位
     data     二維陣列，第一列是標題（A1 開始）
     labels   { 'A7': '總和' } 固定文字
     targets  [{ cell:'C9', ref:'=SUM(C2:C8)', must:['SUM'], tol, alt:[另一個可接受的值] , tip }]
              ref 用同一張表算出標準答案；學生的公式必須用到 must 的函式、而且要參照儲存格（不能直接打答案）
     clean    （選用）先清理再計算：{ issues:{ 列號: 'dup'|'miss'|'noise'|'unit' }, fixed: 清理後的 data, note }
   ⚠️ 上面是 private/ 裡的寫法；公開的 content（tools/build.mjs 產生）只剩題目：targets 只有 cell／label／must，clean 只有 prompt。
      標準答案、清理後的資料、提示都在驗證伺服器（server/51_sheet.js 用同一份試算表引擎重算學生的公式）。
   計星：3 顆 ❤️，每按一次「檢查」有錯就扣一顆；全部正確時剩幾顆 ❤️ 就拿幾顆 ⭐。
   ===================================================================== */
(function () {
  var COLS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function half(s) {
    return String(s).replace(/[！-～]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); })
      .replace(/[“”]/g, '"').replace(/　/g, ' ');
  }
  function colIdx(c) { return COLS.indexOf(c); }
  function parseRef(r) { var m = /^([A-Z])(\d+)$/.exec(r); return m ? { c: colIdx(m[1]), r: +m[2] } : null; }

  function err(code, msg) { return { code: code, msg: msg }; }

  /* ── 公式計算 ─────────────────────────────── */
  function evaluate(formula, grid, depth) {
    depth = depth || 0;
    if (depth > 20) throw err('#REF!', '公式互相參照，繞不出來了');
    var src = half(formula).trim();
    if (src[0] !== '=') return src;
    src = src.slice(1);
    var toks = [], i = 0, m;
    var re = /\s*(?:(\d+(?:\.\d+)?%?)|("[^"]*")|([A-Z]+\d+(?::[A-Z]+\d+)?)|([A-Z]+)(?=\s*\()|(>=|<=|<>|[+\-*\/(),:&<>=]))/iy;
    while (i < src.length) {
      re.lastIndex = i;
      m = re.exec(src);
      if (!m || m[0].length === 0) { if (/\s/.test(src[i])) { i++; continue; } throw err('#ERROR!', '看不懂「' + src.slice(i, i + 6) + '」'); }
      i = re.lastIndex;
      if (m[1]) toks.push({ t: 'num', v: m[1].slice(-1) === '%' ? parseFloat(m[1]) / 100 : parseFloat(m[1]) });
      else if (m[2]) toks.push({ t: 'str', v: m[2].slice(1, -1) });
      else if (m[3]) toks.push({ t: 'ref', v: m[3].toUpperCase() });
      else if (m[4]) toks.push({ t: 'fn', v: m[4].toUpperCase() });
      else toks.push({ t: 'op', v: m[5] });
    }
    var p = 0;
    function peek() { return toks[p]; }
    function eat(v) { var k = toks[p]; if (!k || (v && k.v !== v)) throw err('#ERROR!', v ? '少了「' + v + '」' : '公式沒寫完'); p++; return k; }
    function cell(ref) {
      var rc = parseRef(ref);
      if (!rc) throw err('#REF!', ref + ' 不是儲存格');
      var raw = grid.get(ref);
      if (raw == null || raw === '') return null;
      if (typeof raw === 'string' && raw[0] === '=') return evaluate(raw, grid, depth + 1);
      return raw;
    }
    function range(a, b) {
      var A = parseRef(a), B = parseRef(b), out = [];
      if (!A || !B) throw err('#REF!', '範圍寫錯了');
      for (var r = Math.min(A.r, B.r); r <= Math.max(A.r, B.r); r++)
        for (var c = Math.min(A.c, B.c); c <= Math.max(A.c, B.c); c++) out.push(cell(COLS[c] + r));
      out.isRange = true;
      return out;
    }
    function expr() {
      var v = term();
      while (peek() && (peek().v === '+' || peek().v === '-')) { var o = eat().v, w = term(); v = o === '+' ? num(v) + num(w) : num(v) - num(w); }
      return v;
    }
    function term() {
      var v = factor();
      while (peek() && (peek().v === '*' || peek().v === '/')) {
        var o = eat().v, w = factor();
        if (o === '/' && num(w) === 0) throw err('#DIV/0!', '除以 0 了');
        v = o === '*' ? num(v) * num(w) : num(v) / num(w);
      }
      return v;
    }
    function factor() {
      var k = peek();
      if (!k) throw err('#ERROR!', '公式沒寫完');
      if (k.v === '-') { eat(); return -num(factor()); }
      if (k.v === '(') { eat('('); var v = expr(); eat(')'); return v; }
      if (k.t === 'num' || k.t === 'str') { eat(); return k.v; }
      if (k.t === 'ref') { eat(); var parts = k.v.split(':'); return parts.length === 2 ? range(parts[0], parts[1]) : cell(parts[0]); }
      if (k.t === 'fn') {
        eat(); eat('(');
        var args = [];
        if (peek() && peek().v !== ')') { args.push(expr()); while (peek() && peek().v === ',') { eat(','); args.push(expr()); } }
        eat(')');
        return call(k.v, args);
      }
      throw err('#ERROR!', '這裡不該出現「' + k.v + '」');
    }
    var v = expr();
    if (p < toks.length) throw err('#ERROR!', '多了「' + toks[p].v + '」');
    return v;
  }

  function num(v) {
    if (v && v.isRange) throw err('#VALUE!', '範圍不能直接拿來加減，要放進函式裡');
    if (v == null || v === '') return 0;
    var n = typeof v === 'number' ? v : parseFloat(v);
    if (isNaN(n)) throw err('#VALUE!', '「' + v + '」不是數字');
    return n;
  }
  function flat(args) { var out = []; args.forEach(function (a) { if (a && a.isRange) out.push.apply(out, a); else out.push(a); }); return out; }
  function nums(args) { return flat(args).filter(function (x) { return typeof x === 'number'; }); }

  function match(v, crit) {
    if (typeof crit === 'number') return typeof v === 'number' ? v === crit : String(v) === String(crit);
    var m = /^(>=|<=|<>|>|<|=)?(.*)$/.exec(String(crit)), op = m[1] || '=', rhs = m[2];
    var rn = rhs !== '' && !isNaN(+rhs) ? +rhs : null;
    if (rn !== null && typeof v === 'number') {
      return { '=': v === rn, '<>': v !== rn, '>': v > rn, '<': v < rn, '>=': v >= rn, '<=': v <= rn }[op];
    }
    var a = String(v == null ? '' : v).toLowerCase(), b = rhs.toLowerCase();
    return op === '<>' ? a !== b : (op === '=' ? a === b : false);
  }

  function call(fn, args) {
    switch (fn) {
      case 'SUM': return nums(args).reduce(function (a, b) { return a + b; }, 0);
      case 'AVERAGE': var ns = nums(args); if (!ns.length) throw err('#DIV/0!', '範圍裡沒有數字'); return ns.reduce(function (a, b) { return a + b; }, 0) / ns.length;
      case 'COUNT': return nums(args).length;
      case 'COUNTA': return flat(args).filter(function (x) { return x != null && x !== ''; }).length;
      case 'MAX': return Math.max.apply(null, nums(args));
      case 'MIN': return Math.min.apply(null, nums(args));
      case 'ROUND': var f = Math.pow(10, num(args[1] || 0)); return Math.round(num(args[0]) * f) / f;
      case 'COUNTIF':
        if (args.length !== 2) throw err('#N/A', 'COUNTIF 要兩個引數：COUNTIF(範圍, 條件)');
        if (!args[0] || !args[0].isRange) throw err('#VALUE!', 'COUNTIF 的第一個引數要是範圍，例如 B2:B9');
        var crit = args[1];
        if (crit && crit.isRange) throw err('#VALUE!', 'COUNTIF 的條件只能是一個值');
        return args[0].filter(function (x) { return match(x, crit); }).length;
      default: throw err('#NAME?', '沒有「' + fn + '」這個函式（拼錯了嗎？）');
    }
  }

  function fmt(v) {
    if (v == null) return '';
    if (typeof v === 'number') return Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : String(Math.round(v * 100) / 100);
    return String(v);
  }

  /* ── 表格資料 ─────────────────────────────── */
  function makeGrid(data, labels) {
    var g = {};
    data.forEach(function (row, r) { row.forEach(function (v, c) { if (v !== null && v !== undefined) g[COLS[c] + (r + 1)] = v; }); });
    for (var k in (labels || {})) g[k] = labels[k];
    return { cells: g, get: function (ref) { return g[ref]; }, set: function (ref, v) { g[ref] = v; } };
  }

  /* ── 錯誤說明：把錯誤翻成國中生看得懂的話，附「❌ 常見錯誤寫法／✅ 正確寫法」 ──
     explain(公式, 錯誤)  錯誤是 evaluate 丟出的 { code, msg }，或評分用的 { code:'empty'|'noeq'|'number'|'must'|'value', fn, v }
     回傳 { title, tip, bad, good, ref }；ref 是函式小抄裡對應的那一張（#countif…）
     ⚠️ 範例刻意用 C2:C7、">=60" 這類和關卡無關的寫法，不能變成答案 */
  var FN_HELP = {
    SUM: ['=SUM(範圍)', '把範圍裡的數字全部加起來', '=SUM(C2:C7)', 'sum'],
    AVERAGE: ['=AVERAGE(範圍)', '算範圍裡數字的平均', '=AVERAGE(C2:C7)', 'average'],
    MAX: ['=MAX(範圍)', '找出範圍裡最大的數字', '=MAX(C2:C7)', 'maxmin'],
    MIN: ['=MIN(範圍)', '找出範圍裡最小的數字', '=MIN(C2:C7)', 'maxmin'],
    COUNT: ['=COUNT(範圍)', '數範圍裡有幾格是「數字」', '=COUNT(C2:C7)', 'count'],
    COUNTA: ['=COUNTA(範圍)', '數範圍裡有幾格「不是空白」', '=COUNTA(C2:C7)', 'count'],
    ROUND: ['=ROUND(數字, 小數位數)', '四捨五入到指定的小數位數', '=ROUND(C8, 1)', 'round'],
    COUNTIF: ['=COUNTIF(範圍, 條件)', '數出範圍裡「符合條件」的有幾格', '=COUNTIF(C2:C9,">=60")', 'countif']
  };
  function explain(f, e) {
    var c = e && e.code, m = (e && e.msg) || '', X = function (title, tip, bad, good, ref) { return { title: title, tip: tip, bad: bad, good: good, ref: ref || 'errors' }; };
    var q = (/「([^」]*)」/.exec(m) || [])[1] || '';
    switch (c) {
      case 'empty': return X('還沒寫公式', '點這個黃色格子，在上面的公式列（fx）輸入公式，再按 Enter。', null, null, 'formula');
      case 'noeq': return X('公式要用「=」開頭', '沒有 = 開頭，試算表會把它當成一般文字，不會計算。', 'SUM(C2:C7)', '=SUM(C2:C7)', 'formula');
      case 'number': return X('不要直接打答案，要用公式從表格裡的資料算出來', '直接打數字，資料一改就錯了。公式裡要用儲存格或範圍（例如 C2:C7），讓試算表自己算。', '=4200', '=SUM(C2:C7)', 'range');
      case 'must': var h = FN_HELP[e.fn] || ['=' + e.fn + '(…)', '', '', 'errors'];
        return X('這一格要用 ' + e.fn + ' 函式', e.fn + ' 的功用是「' + h[1] + '」，寫法：' + h[0], null, h[2], h[3]);
      case 'value':
        var head = /[A-Z]1\b(?!\d)/.test(half(f).toUpperCase().replace(/"[^"]*"/g, ''));
        return X('算出來是 ' + e.v + '，和正確結果不一樣',
          head ? '範圍包含了第 1 列的標題！資料從第 2 列開始，範圍要從第 2 列選到最後一列。' :
            '一項一項檢查：① 範圍選對欄了嗎？有沒有從第 2 列選到最後一列？② 比較符號對嗎？「以上（含）」是 >=、「未滿」是 <。③ 條件的文字和表格裡的一模一樣嗎？',
          head ? '=AVERAGE(C1:C7)' : null, head ? '=AVERAGE(C2:C7)' : null, 'range');
      case '#NAME?': return X('#NAME?：試算表不認識「' + q + '」這個函式', '函式名稱拼錯了嗎？這個單元會用到：SUM、AVERAGE、MAX、MIN、COUNT、COUNTA、COUNTIF、ROUND。', '=SUMM(C2:C7)\n=AVERGE(C2:C7)', '=SUM(C2:C7)\n=AVERAGE(C2:C7)');
      case '#DIV/0!': return X('#DIV/0!：' + (/沒有數字/.test(m) ? '範圍裡沒有數字，平均算不出來' : '除以 0 了'),
        /沒有數字/.test(m) ? 'AVERAGE 的範圍是不是選到文字欄（例如姓名）或空白格？' : '除數那一格是 0 或空白。檢查 / 後面的儲存格位址。', /沒有數字/.test(m) ? '=AVERAGE(A2:A7)   ← A 欄是姓名' : '=C8/D8   ← D8 是空白', /沒有數字/.test(m) ? '=AVERAGE(C2:C7)' : '=C8/COUNTA(C2:C7)');
      case '#VALUE!':
        if (/範圍不能直接/.test(m)) return X('#VALUE!：範圍不能直接拿來加減乘除', '範圍（一整串格子）要先放進函式變成一個數字，例如用 SUM 加總之後再除。', '=C2:C7/2', '=SUM(C2:C7)/2', 'sum');
        if (/第一個引數要是範圍/.test(m)) return X('#VALUE!：COUNTIF 的第一個要寫範圍', 'COUNTIF(範圍, 條件)：先寫「在哪裡數」，再寫「數什麼」，順序不能反過來。', '=COUNTIF(">=60",C2:C9)', '=COUNTIF(C2:C9,">=60")', 'countif');
        if (/只能是一個值/.test(m)) return X('#VALUE!：COUNTIF 的條件只能是一個值', '條件可以是一個數字、一段文字（加引號）或「一格」儲存格，不能是一整個範圍。', '=COUNTIF(C2:C9,D2:D9)', '=COUNTIF(C2:C9,D10)', 'countif-cell');
        return X('#VALUE!：「' + q + '」不是數字，不能拿來計算', '算式用到了文字格子（例如標題列）。檢查公式裡的儲存格位址是不是指到數字。', '=C1*2   ← C1 是標題', '=C2*2', 'range');
      case '#N/A': return X('#N/A：COUNTIF 要寫兩樣東西', 'COUNTIF(範圍, 條件)：範圍和條件中間用半形逗號隔開，兩樣都要有。', '=COUNTIF(C2:C9)', '=COUNTIF(C2:C9,">=60")', 'countif');
      case '#REF!': return X('#REF!：儲存格位址寫錯了', '位址是「欄的英文字母＋列的數字」，例如 C2；範圍是「起點:終點」，兩邊都要寫完整。', '=SUM(C2:7)', '=SUM(C2:C7)', 'range');
      case '#ERROR!':
        if (/少了「\)」/.test(m)) return X('括號沒有關起來', '每一個 ( 都要有一個 ) 對應。', '=SUM(C2:C7', '=SUM(C2:C7)', 'formula');
        if (/少了「\(」/.test(m)) return X('函式名稱後面要接小括號', '函式的寫法是「函式名稱(…)」，括號緊跟在名稱後面。', '=SUM C2:C7', '=SUM(C2:C7)', 'formula');
        if (/沒寫完/.test(m)) return X('公式沒寫完', '看看最後面是不是少了範圍、數字或右括號。', '=SUM(', '=SUM(C2:C7)', 'formula');
        if (/不該出現「(>=|<=|<>|>|<|=)」/.test(m)) return X('比大小的條件要放在雙引號裡', '條件裡有 >、<、>= 這些符號時，整個條件要用半形雙引號包起來。', '=COUNTIF(C2:C9,>=60)', '=COUNTIF(C2:C9,">=60")', 'countif-cmp');
        if (/^;/.test(q)) return X('要用逗號，不是分號', '函式裡兩樣東西之間用半形逗號 , 隔開；範圍中間用冒號 :', '=COUNTIF(C2:C9;">=60")', '=COUNTIF(C2:C9,">=60")', 'countif');
        if (/^["']/.test(q) || /^'/.test(q)) return X('引號要用半形雙引號 " "，而且要成對', '文字和條件要用一對半形雙引號包起來；單引號 \' 在試算表裡不能用。', "=COUNTIF(C2:C9,'優')", '=COUNTIF(C2:C9,"優")', 'countif-text');
        if (/[一-鿿]/.test(q)) return X('文字要用半形雙引號包起來', '公式裡的中文或英文文字（不是儲存格位址）要加雙引號，試算表才知道它是「文字」。', '=COUNTIF(C2:C9,優)', '=COUNTIF(C2:C9,"優")', 'countif-text');
        return X('公式寫法有問題（看不懂「' + q + '」）', '檢查這幾個地方：函式名稱、括號有沒有成對、範圍用冒號、條件用逗號隔開、文字加雙引號。', null, null);
    }
    return X((c || '') + ' ' + m, '', null, null);
  }

  /* ── 評分 ─────────────────────────────────── */
  function gradeTarget(t, grid) {
    var f = String(grid.get(t.cell) || '').trim(), F = half(f).toUpperCase();
    function no(e) { var x = explain(f, e); return { ok: false, why: x.title, x: x }; }
    if (!f) return no({ code: 'empty' });
    if (F[0] !== '=') return no({ code: 'noeq' });
    var v;
    try { v = evaluate(f, grid); } catch (e) { return no(e); }
    if (!/[A-Z]+\d+/.test(F.slice(1))) return no({ code: 'number' });
    var miss = (t.must || []).filter(function (fn) { return F.indexOf(fn + '(') < 0; });
    if (miss.length) return no({ code: 'must', fn: miss[0] });
    // 明碼版（只在 private/、測試、伺服器裡用；網頁的評分在伺服器 server/51_sheet.js）
    var want = evaluate(t.ref, grid), tol = t.tol == null ? 0.01 : t.tol;
    var okv = [want].concat(t.alt || []).some(function (w) { return typeof w === 'number' ? Math.abs(num(v) - w) <= tol : String(v) === String(w); });
    if (!okv) { var r = no({ code: 'value', v: fmt(v) }); if (t.tip) r.x.tip = '💬 ' + t.tip + '。' + r.x.tip; return r; }
    return { ok: true, v: v };
  }

  var ISSUES = [['ok', '✅ 沒問題'], ['dup', '🔁 重複'], ['miss', '🕳️ 缺值'], ['noise', '⚡ 不合理'], ['unit', '📏 單位不一致']];

  /* ── 畫面 ─────────────────────────────────── */
  function mount(opts) {
    var L = opts.levels, MOD = opts.mod || 'sheet', esc = UI.esc, HEARTS = 3;
    var app = typeof opts.app === 'string' ? document.querySelector(opts.app) : opts.app;
    var S = null, REF = opts.ref && window.REFPANEL ? opts.ref : null;
    if (REF) REFPANEL.bind(app, { url: REF, title: '📚 函式小抄' });

    /* 一個錯誤的說明：標題、提示、❌／✅ 對照、📚 看小抄 */
    function xHTML(x, brief) {
      return '<b>' + esc(x.title) + '</b>' + (x.tip ? '<div class="small">💡 ' + esc(x.tip) + '</div>' : '') +
        (x.bad || x.good ? '<div class="sx-ex">' + (x.bad ? '<span>❌ <code>' + esc(x.bad) + '</code></span>' : '') + (x.good ? '<span>✅ <code>' + esc(x.good) + '</code></span>' : '') + '</div>' : '') +
        (REF && !brief ? '<a class="tiny bold" data-refp="' + x.ref + '" href="' + REF + '#' + x.ref + '" target="_blank" rel="noopener">📚 看小抄怎麼寫</a>' : '');
    }

    function best(id) { var r = STORE.level(MOD, id); return r ? (r.stars || 0) : 0; }

    function menu() {
      S = null;
      var total = L.reduce(function (s, lv) { return s + best(lv.id); }, 0);
      app.innerHTML = '<section class="card pop"><div class="tape"></div><div class="row between"><div>' +
        '<p class="kicker">' + L.length + ' 關 · 在網頁裡直接寫公式</p><h2 class="black" style="font-size:1.35rem">點黃色格子 → 在公式列輸入 → 按「檢查」</h2>' +
        '<p class="small soft mt1">每關 3 顆 ❤️，檢查時有錯扣一顆，剩幾顆就拿幾顆 ⭐。學會之後，到 Google 試算表做課本的實作。</p>' +
        (REF ? '<a class="btn sm mt1" id="ref-link" data-refp="all" href="' + REF + '" target="_blank" rel="noopener">📚 函式小抄（公式怎麼寫都在這裡）</a>' : '') + '</div>' +
        '<div class="center"><div class="black" style="font-size:1.8rem;color:var(--star-ink)">' + total + ' / ' + (L.length * 3) + '</div><div class="tiny soft bold">⭐ 總星數</div></div></div></section>' +
        '<section class="grid ' + UI.gridCols(L.length) + ' mt3">' + L.map(function (lv, i) {
          return '<button class="card lvcard pop" data-i="' + i + '"><div class="row between"><span style="font-size:2rem">' + lv.icon + '</span>' + UI.stars(best(lv.id)) + '</div>' +
            '<h3 class="black mt1">第 ' + (i + 1) + ' 關　' + esc(lv.title) + '</h3><p class="tiny soft bold mt1">' + esc(lv.book) + '</p></button>';
        }).join('') + '</section>';
      app.querySelectorAll('.lvcard').forEach(function (b) { b.onclick = function () { start(+b.dataset.i); }; });
    }

    /* 🔐 評分在驗證伺服器（server/51_sheet.js）：標準答案、清理後的資料、提示、延伸說明都只在伺服器
       連不上伺服器 → 練習模式：可以寫公式、看算出來的值，但不判斷、不記星 */
    function start(i) {
      var lv = L[i];
      try { history.replaceState(null, '', '#' + lv.id); } catch (e) {}
      if (REF) REFPANEL.follow(lv.id);
      var me = S = { i: i, lv: lv, hearts: HEARTS, stage: lv.clean ? 'clean' : 'calc', sel: null, marks: {}, hints: [] };
      S.grid = lv.clean ? makeGrid(lv.data, {}) : makeGrid(lv.data, lv.labels);
      draw();
      S.ready = API.call('sh', { lv: lv.id, mod: MOD, who: STORE.me() }).then(function (r) { if (S !== me) return; S.run = r.run; S.hearts = r.hearts; },
        function (e) { if (S !== me) return; S.offline = true; draw(); if (e.err !== 'offline') document.getElementById('fb').innerHTML = '<div class="note bad">⚠️ ' + esc(API.msg(e)) + '</div>'; });
    }

    function draw() {
      var lv = S.lv, grid = S.grid, data = S.stage === 'clean' ? lv.data : (lv.clean ? S.fixed : lv.data);
      var clean = S.stage === 'clean';
      var nRows = clean ? data.length : Math.max(data.length, maxRow(lv)), nCols = clean ? data[0].length : Math.max(data[0].length, maxCol(lv));
      var tmap = {}; if (S.stage === 'calc') lv.targets.forEach(function (t) { tmap[t.cell] = t; });
      var head = '<tr><td class="corner" aria-hidden="true"></td>' + COLS.slice(0, nCols).split('').map(function (c) { return '<th>' + c + '</th>'; }).join('') + (S.stage === 'clean' ? '<th>🧹 判斷</th>' : '') + '</tr>';
      var rows = '';
      for (var r = 1; r <= nRows; r++) {
        rows += '<tr><th>' + r + '</th>';
        for (var c = 0; c < nCols; c++) {
          var ref = COLS[c] + r, raw = grid.get(ref), t = tmap[ref], shown = '';
          if (t) { try { shown = raw ? fmt(evaluate(raw, grid)) : ''; } catch (e) { shown = e.code; } }
          else shown = fmt(raw);
          rows += '<td class="' + (t ? 'tgt' : '') + (S.sel === ref ? ' sel' : '') + (r === 1 ? ' hd' : '') + '"' + (t ? ' data-ref="' + ref + '" tabindex="0"' : '') + '>' + esc(shown) + '</td>';
        }
        if (S.stage === 'clean') rows += '<td>' + (r === 1 ? '' : '<select class="issue" data-r="' + r + '" aria-label="第 ' + r + ' 列的問題">' + ISSUES.map(function (o) { return '<option value="' + o[0] + '"' + ((S.marks[r] || 'ok') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>') + '</td>';
        rows += '</tr>';
      }
      var selT = S.sel && tmap[S.sel];
      app.innerHTML = '<section class="card">' +
        '<div class="hud"><button class="btn sm" id="quit">✕ 離開</button><b>' + lv.icon + ' ' + esc(lv.title) + '</b>' +
        '<span class="chip">' + (S.stage === 'clean' ? '步驟 1：清理資料' : (lv.clean ? '步驟 2：計算' : '寫公式')) + '</span>' +
        (S.offline ? '<span class="chip">📴 練習模式 · 不判斷、不記星</span>' : '') +
        '<span style="margin-left:auto"></span>' + (S.offline ? '' : UI.hearts(S.hearts, HEARTS)) + '</div>' +
        '<p class="mt2">' + lv.story + '</p>' +
        (S.stage === 'clean' ? '<div class="note warn mt1 small">' + lv.clean.prompt + '</div>' :
          '<ol class="small mt1" style="padding-left:1.3rem">' + lv.targets.map(function (t) { return '<li><b class="mono">' + t.cell + '</b>：' + esc(t.label) + '</li>'; }).join('') + '</ol>') +
        (S.stage === 'calc' ? '<div class="fbar mt2"><span class="mono bold" style="min-width:2.6rem">' + (S.sel || '') + '</span><span class="mono bold">fx</span>' +
          '<input id="fx" class="input mono" autocomplete="off" spellcheck="false" placeholder="' + (selT ? '輸入公式，例如 =' + (selT.must && selT.must[0] || 'SUM') + '(…)' : '先點一個黃色格子') + '"' + (selT ? '' : ' disabled') + ' value="' + esc(selT ? (grid.get(S.sel) || '') : '') + '">' +
          (REF ? '<a class="btn sm" id="btn-ref2" data-refp="' + lv.id + '" href="' + REF + '#' + lv.id + '" target="_blank" rel="noopener" title="不知道怎麼寫？查函式">📚 查函式</a>' : '') + '</div>' +
          '<p id="fwarn" class="tiny bold mt1" style="color:var(--warn);min-height:1.1em"></p><div id="fxplain"></div>' : '') +
        '<div class="scroll-x mt1"><table class="sheet">' + head + rows + '</table></div>' +
        '<div class="row mt2"><button class="btn go" id="check">✅ 檢查</button>' +
        (lv.hn ? '<button class="btn sm" id="hint">💡 提示</button>' : '') +
        (REF ? '<a class="btn sm" id="btn-ref" data-refp="' + lv.id + '" href="' + REF + '#' + lv.id + '" target="_blank" rel="noopener">📚 這關用到的函式</a>' : '') + '</div>' +
        '<div class="fb mt2" id="fb" aria-live="polite"></div></section>';
      document.getElementById('quit').onclick = function () { if (confirm('離開這一關？這次的進度不會保留。')) menu(); };
      app.querySelectorAll('td[data-ref]').forEach(function (td) {
        td.onclick = function () { S.sel = td.dataset.ref; draw(); var fx = document.getElementById('fx'); fx.focus(); fx.setSelectionRange(fx.value.length, fx.value.length); };
        td.onkeydown = function (e) { if (e.key === 'Enter') td.onclick(); };
      });
      app.querySelectorAll('select.issue').forEach(function (s) { s.onchange = function () { S.marks[s.dataset.r] = s.value; }; });
      var fx = document.getElementById('fx');
      if (fx) {
        var commit = function () { S.grid.set(S.sel, fx.value.trim()); draw(); };
        fx.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); commit(); } };
        fx.onblur = function () { if (S && S.sel) S.grid.set(S.sel, fx.value.trim()); };   // 只存值不重畫：重畫會把「檢查」的回饋洗掉
        fx.oninput = function () { document.getElementById('fwarn').textContent = /[！-～“”]/.test(fx.value) ? '⚠️ 有全形符號（＝，（）＂）—— 真正的試算表會出錯，請切換成半形' : ''; };
        fx.oninput();
        // 剛輸入的公式算不出來（#NAME? 之類）→ 馬上在公式列下面說明，不扣心
        var raw = S.sel && grid.get(S.sel);
        if (raw) {
          var ex = null;
          if (half(String(raw)).trim()[0] !== '=') ex = explain(raw, { code: 'noeq' });
          else { try { evaluate(raw, grid); } catch (e) { ex = explain(raw, e); } }
          if (ex) document.getElementById('fxplain').innerHTML = '<div class="note warn small pop">' + xHTML(ex) + '</div>';
        }
      }
      var hb = document.getElementById('hint');
      if (hb) hb.onclick = function () {   // 提示在伺服器：按一次多拿一則
        var me = S, k = S.hints.length; if (k >= lv.hn || S.asking) return;
        S.asking = true;
        API.call('hint', { kind: 'sheet', lv: lv.id, i: k }).then(function (r) { me.asking = false; me.hints[k] = r.hint; if (S === me) showHints(); }, function (e) { me.asking = false; UI.toast(API.msg(e)); });
      };
      showHints();
      document.getElementById('check').onclick = check;
    }

    function showHints() {
      if (!S.hints.length) return;
      var fb = document.getElementById('fb');
      fb.innerHTML = S.hints.map(function (h, i) { return '<div class="hint small mt1">💡 提示 ' + (i + 1) + '：' + esc(h) + '</div>'; }).join('') + (S.msg || '');
    }

    function check() {
      var lv = S.lv, fb = document.getElementById('fb'), me = S;
      if (S.busy) return;
      var fx = document.getElementById('fx'); if (fx && S.sel) S.grid.set(S.sel, fx.value.trim());
      if (S.offline) return offlineCheck(fb);
      if (!S.run) return S.ready.then(function () { if (S === me && !me.offline) check(); });   // 還在跟伺服器開局：開好就接著檢查
      function fail(e) { me.busy = false; if (e.err === 'dead') return over(); fb.innerHTML = '<div class="note bad">⚠️ ' + esc(API.msg(e)) + '</div>'; }
      S.busy = true;
      if (S.stage === 'clean') {
        var marks = {};
        for (var r = 2; r <= lv.data.length; r++) marks[r] = S.marks[r] || 'ok';
        API.call('shc', { run: S.run, marks: marks }).then(function (res) {
          me.busy = false; if (S !== me) return;
          if (!res.ok) return miss('<div class="note bad pop">❌ 還有 <b>' + res.wrong + '</b> 列判斷得不對。一列一列看：有沒有一模一樣的？有沒有空白？數字合不合理？單位一樣嗎？</div>', res);
          // 全部判對，伺服器才給「清理後的資料」
          S.fixed = res.fixed; S.stage = 'calc'; S.grid = makeGrid(res.fixed, lv.labels); S.sel = null; S.msg = '';
          draw();
          document.getElementById('fb').innerHTML = '<div class="note ok pop"><b>✅ 清理完成！</b> ' + res.note + '</div>';
        }, fail);
        return;
      }
      var cells = {}; lv.targets.forEach(function (t) { cells[t.cell] = S.grid.get(t.cell) || ''; });
      API.call('shf', { run: S.run, cells: cells }).then(function (out) {
        me.busy = false; if (S !== me) return;
        var bad = lv.targets.filter(function (t) { return !(out.res[t.cell] || {}).ok; }).map(function (t) {
          var g = out.res[t.cell] || {}, x = explain(String(cells[t.cell] || ''), g.e || { code: 'value' });
          if (g.tip) x.tip = '💬 ' + g.tip + '。' + x.tip;
          return { t: t, x: x };
        });
        if (bad.length) {
          return miss('<div class="note bad pop"><b>❌ 還有 ' + bad.length + ' 格不對</b><ul style="margin:.3rem 0 0;padding-left:1.2rem">' +
            bad.map(function (b) { return '<li class="mt1"><b class="mono">' + b.t.cell + '</b>：' + xHTML(b.x) + '</li>'; }).join('') + '</ul></div>', out);
        }
        finish(out);
      }, fail);
    }
    /* 練習模式：只看公式算不算得出來（不知道標準答案，所以不判斷對錯） */
    function offlineCheck(fb) {
      if (S.stage === 'clean') { fb.innerHTML = '<div class="note warn">📴 練習模式：清理資料的步驟要連上驗證伺服器才能判斷（清理後的資料也在伺服器）。</div>'; return; }
      fb.innerHTML = '<div class="note pop">📴 練習模式（不判斷對錯）：<ul style="margin:.3rem 0 0;padding-left:1.2rem">' + S.lv.targets.map(function (t) {
        var f = String(S.grid.get(t.cell) || ''), v = '（空白）';
        if (f) { try { v = fmt(evaluate(f, S.grid)); } catch (e) { v = explain(f, e).title; } }
        return '<li><b class="mono">' + t.cell + '</b>　<code>' + esc(f) + '</code> → ' + esc(v) + '</li>';
      }).join('') + '</ul></div>';
    }

    function miss(html, res) {
      S.hearts = res.hearts;
      S.msg = html;
      if (res.dead) return over();
      draw();
      document.getElementById('fb').innerHTML = html;
      showHints();
    }

    function finish(out) {
      var lv = S.lv, i = S.i, stars = out.stars;
      var formulas = {}; lv.targets.forEach(function (t) { formulas[t.cell] = S.grid.get(t.cell); });
      var r = STORE.saveLevel(MOD, lv.id, { stars: stars, rc: out.rc, ts: out.ts, score: Math.round(stars / 3 * 100), extra: { formulas: formulas } });
      app.innerHTML = '<section class="card pop center"><div class="tape"></div><p class="kicker">過關！</p>' +
        '<h2 class="black" style="font-size:1.6rem">' + lv.icon + ' ' + esc(lv.title) + '</h2><div class="end-star mt1">' + UI.stars(stars) + '</div>' +
        '<div class="note small mt2" style="text-align:left;display:inline-block">' + lv.targets.map(function (t) { return '<div><b class="mono">' + t.cell + '</b>　<code>' + esc(formulas[t.cell]) + '</code></div>'; }).join('') + '</div>' +
        (out.after ? '<p class="small mt2">' + out.after + '</p>' : '') +
        (r.improved ? '<p class="note ok small mt2" style="display:inline-block">⭐ 新紀錄已儲存！</p>' : '<p class="small soft mt1">最佳紀錄：' + UI.stars(best(lv.id)) + '</p>') +
        '<div class="row mt3" style="justify-content:center"><button class="btn" id="again">🔁 再做一次</button></div><nav id="end-pager"></nav></section>';
      document.getElementById('again').onclick = function () { start(i); };
      // 結尾：← 關卡選單／下一關 →（全站同一組樣式）
      var N = L[i + 1];
      UI.pager('#end-pager', { id: 'menu', lbl: '← 回到', title: '關卡選單', go: menu },
        N ? { id: 'next', lbl: '下一關 →', title: N.icon + ' ' + N.title, go: function () { start(i + 1); } } : null);
      if (r.improved) UI.toast('⭐ ' + lv.title + '：' + '★'.repeat(stars));
    }

    function over() {
      var i = S.i;
      app.innerHTML = '<section class="card pop center"><p style="font-size:3rem">💔</p><h2 class="black">愛心用完了</h2>' +
        '<p class="soft mt1">看看提示，再挑戰一次！這次的結果不會記錄。</p>' + (S.msg || '') +
        '<nav id="end-pager"></nav></section>';
      UI.pager('#end-pager', { id: 'menu', lbl: '← 回到', title: '關卡選單', go: menu },
        { id: 'retry', lbl: '再挑戰一次 →', title: '🔁 重新挑戰', go: function () { start(i); } });
    }

    function maxRow(lv) { var m = 0; (lv.targets || []).concat(Object.keys(lv.labels || {}).map(function (k) { return { cell: k }; })).forEach(function (t) { m = Math.max(m, parseRef(t.cell).r); }); return m; }
    function maxCol(lv) { var m = 0; (lv.targets || []).concat(Object.keys(lv.labels || {}).map(function (k) { return { cell: k }; })).forEach(function (t) { m = Math.max(m, parseRef(t.cell).c + 1); }); return m; }

    UI.requireLogin(function () {
      var want = (location.hash || '').slice(1);
      var i = L.findIndex(function (lv) { return lv.id === want; });
      if (i >= 0) start(i); else menu();
    });
    return { menu: menu, start: start };
  }

  window.SHEET = { mount: mount, evaluate: function (f, data) { return evaluate(f, data && data.get ? data : makeGrid(data || [[]])); }, makeGrid: makeGrid, grade: gradeTarget, fmt: fmt, explain: explain, FN: FN_HELP };
})();
