/* 📦 Python 教師試用版（pylab）的複本：來源 shared/pyrunner.js（2026-09-29 複製）。
   和闖關網站分開，改這裡不會影響學生用的系統；主系統改了也不會自動跟過來。 */
/* =====================================================================
   Python 執行與評分引擎（主執行緒端）
   ---------------------------------------------------------------------
   PYRUN.init(url)                   載入 Pyodide（第一次約 5～15 秒，之後有快取）
   PYRUN.run(code, inputs, opts)     執行一次 → { events, error, need, used, features }
   PYRUN.grade(level, code, ctx)     評分 → { stars, score, tests:[…], reqs:[…], rc } （伺服器判斷，見下面）
   PYRUN.explain(error, code)        把 Python 錯誤翻成國中生看得懂的中文
   PYRUN.transcript(events)          把 events 組成畫面上的文字

   ★ 程式在學生的瀏覽器裡跑（Pyodide），不花伺服器額度。
   🔐 預期輸出、隱藏測資、提示都只在驗證伺服器（server/50_python.js）：網頁只送「程式跑出來的輸出」上去比對。
   ===================================================================== */
(function () {
  var TIMEOUT_MS = 3000;
  var worker = null, readyPromise = null, url = null, seq = 0, pending = {};
  var statusCb = function () {};

  function boot() {
    worker = new Worker(workerUrl());
    readyPromise = new Promise(function (resolve, reject) {
      worker.onmessage = function (e) {
        var m = e.data;
        if (m.type === 'ready') { statusCb('ready', m.version); resolve(m.version); }
        else if (m.type === 'fail') { statusCb('fail', m.msg); reject(new Error(m.msg)); }
        else if (m.type === 'result' && pending[m.id]) { pending[m.id](m); delete pending[m.id]; }
      };
      worker.onerror = function (ev) { statusCb('fail', ev.message || 'worker error'); reject(new Error(ev.message)); };
    });
    statusCb('loading');
    worker.postMessage({ type: 'init', url: url });
    return readyPromise;
  }

  function workerUrl() {
    // 找到 pyrunner.js 自己的位置，pyworker.js 就在隔壁
    var s = document.querySelector('script[src*="pyrunner.js"]');
    return s ? s.src.replace(/pyrunner\.js.*$/, 'pyworker.js') : '../shared/pyworker.js';
  }

  function restart() {
    try { worker && worker.terminate(); } catch (e) {}
    Object.keys(pending).forEach(function (k) { delete pending[k]; });
    return boot();
  }

  var PYRUN = {
    TIMEOUT_MS: TIMEOUT_MS,
    onStatus: function (cb) { statusCb = cb || function () {}; },
    init: function (pyodideUrl) { url = pyodideUrl; return boot(); },
    ready: function () { return readyPromise; },

    run: function (code, inputs, opts) {
      opts = opts || {};
      return readyPromise.then(function () {
        return new Promise(function (resolve) {
          var id = ++seq, done = false;
          var timer = setTimeout(function () {
            if (done) return; done = true; delete pending[id];
            restart();   // 砍掉重開：停不下來的迴圈只能這樣收
            resolve({ events: [], error: { type: 'Timeout', msg: '', line: null }, need: false, used: 0, features: null, timeout: true });
          }, opts.timeout || TIMEOUT_MS);
          pending[id] = function (m) { if (done) return; done = true; clearTimeout(timer); resolve(m); };
          worker.postMessage({ type: 'run', id: id, code: code, inputs: inputs || [], seed: opts.seed || 116 });
        });
      });
    }
  };

  /* ── 文字正規化：全形→半形、去空白、小寫 ───────────────────── */
  function half(s) {
    return String(s).replace(/[！-～]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); })
      .replace(/　/g, ' ');
  }
  function norm(s) { return half(s).replace(/\s+/g, '').toLowerCase(); }
  /** 畫面用：組出主控台文字（含使用者輸入） */
  PYRUN.transcript = function (events, withInputs) {
    return (events || []).map(function (ev) {
      if (ev[0] === 'in') return withInputs === false ? '' : ev[1] + '\n';
      if (ev[0] === 'sleep') return '';
      return ev[1];
    }).join('');
  };

  /* ── 評分（伺服器判斷）─────────────────────────────────────
     1. 問驗證伺服器這一關要跑哪些測資（隱藏測資的輸入也是這時才拿到）
     2. 在學生的瀏覽器裡跑每一組（Pyodide），把輸出（events）送回伺服器
     3. 伺服器比對預期輸出、看程式結構，決定星星（附簽章收據）
        1★ 程式跑得動，而且至少過 1 組測資；2★ 全部測資（含隱藏測資）通過；3★ 2★ ＋ 符合程式結構要求
     連不上伺服器 → 練習模式：只跑公開的範例測資給學生看輸出，不判斷、不記星（offline: true）
     回傳 { stars, score, tests:[{ test:{name,hidden,inputs}, run, error, pass, msg }], reqs:[{ req:{msg}, ok }], passed, total, features, rc, ts, offline } */
  function runAll(code, tests) {
    var results = [], chain = Promise.resolve(), timedOut = false;
    tests.forEach(function (t, i) {
      chain = chain.then(function () {
        if (timedOut) { results.push({ test: t, run: { events: [] }, error: { type: 'Timeout', msg: '', line: null } }); return; }   // 一組停不下來，後面幾組也一定停不下來
        return PYRUN.run(code, t.inputs || [], { seed: 116 + i }).then(function (r) {
          var err = r.error;
          if (r.timeout) timedOut = true;
          if (r.need) err = { type: 'NeedMoreInput', msg: '', line: null };
          results.push({ test: t, run: r, error: err });
        });
      });
    });
    return chain.then(function () { return results; });
  }
  PYRUN.grade = function (level, code, ctx) {
    ctx = ctx || {};
    function offline() {
      var pub = (level.tests || []).filter(function (t) { return !t.hidden; });
      return runAll(code, pub).then(function (rs) {
        rs.forEach(function (x) { x.pass = null; });
        return { offline: true, stars: 0, score: 0, tests: rs, reqs: [], passed: 0, total: rs.length, features: rs.length ? rs[0].run.features : null };
      });
    }
    return API.call('py', { lv: level.id, mod: ctx.mod, who: ctx.who || (window.STORE && STORE.me()) || null, pc: ctx.pc || '' }).then(function (P) {
      return runAll(code, P.tests).then(function (rs) {
        var feats = rs.length && rs[0].run ? rs[0].run.features : null;
        var outs = rs.map(function (x) { return { events: (x.run && x.run.events || []).slice(0, 5000), err: !!x.error }; });
        return API.call('pyg', { run: P.run, outs: outs, feats: feats }).then(function (G) {
          rs.forEach(function (x, i) { var g = G.results[i] || {}; x.pass = !!g.pass; x.msg = g.msg; });
          return { stars: G.stars, score: G.score, tests: rs, reqs: G.reqs.map(function (q) { return { req: { msg: q.msg }, ok: q.ok }; }),
            passed: G.passed, total: G.total, features: feats, rc: G.rc, ts: G.ts, pc: G.pc, pstars: G.pstars };
        });
      });
    }, function (e) { if (e && e.err === 'offline') return offline(); throw e; });
  };

  /* ── 錯誤翻譯機 ─────────────────────────────────────────
     PYRUN.explain(err, code) 回傳
       { title, tip, line, raw,
         yours,          學生出錯的那一行（原樣）
         fixed,          自動推測的改法（推不出來就是 null）
         bad, good,      通用的「❌ 錯的寫法／✅ 對的寫法」範例（多行字串）
         mark }          yours 裡要標紅的範圍 [起, 迄)，沒有就 null
     ★ 能從學生自己的程式推出改法時，優先給 fixed —— 看自己的程式比看別人的範例好懂。
       推不出來才給通用範例。原始的英文訊息只收在最下面。 */
  var FULLWIDTH = /[（）｛｝［］＂＇“”‘’，：；＝＋－＊／＜＞　]/;
  var FW_MAP = { '（': '(', '）': ')', '｛': '{', '｝': '}', '［': '[', '］': ']', '＂': '"', '＇': "'", '“': '"', '”': '"', '‘': "'", '’': "'",
                 '，': ',', '：': ':', '；': ';', '＝': '=', '＋': '+', '－': '-', '＊': '*', '／': '/', '＜': '<', '＞': '>', '　': ' ' };
  var KNOWN = ['print', 'input', 'int', 'float', 'str', 'range', 'round', 'len', 'abs', 'max', 'min', 'ord', 'chr', 'random', 'time', 'while', 'for', 'if', 'else', 'elif', 'True', 'False'];
  var TYPO_KW = { esle: 'else', eles: 'else', els: 'else', elsif: 'elif', elseif: 'elif', esif: 'elif', eilf: 'elif', whlie: 'while', wihle: 'while', whiel: 'while', fro: 'for', ofr: 'for', fi: 'if' };
  var BLOCK_KW = /^\s*(if|elif|else|for|while|def)\b/;

  function closeName(name) {
    var low = name.toLowerCase();
    for (var i = 0; i < KNOWN.length; i++) {
      var k = KNOWN[i];
      if (k.toLowerCase() === low && k !== name) return k;
      if (Math.abs(k.length - name.length) <= 1 && dist(k, low) === 1) return k;
    }
    return null;
  }
  function dist(a, b) {
    var d = [], i, j;
    for (i = 0; i <= a.length; i++) { d[i] = [i]; }
    for (j = 0; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }

  /** 把引號外面的全形符號換成半形（引號裡的中文標點保留） */
  function fixFullwidth(line) {
    var out = '', q = null;
    for (var k = 0; k < line.length; k++) {
      var c = line[k], h = FW_MAP[c];
      if (q) { out += c; if (c === q) q = null; continue; }
      if (c === '#') { out += line.slice(k); break; }
      if (h === '"' || h === "'") { q = h; out += h; continue; }   // 全形引號本身也要換
      if (c === '"' || c === "'") { q = c; out += c; continue; }
      out += h != null ? h : c;
    }
    return out;
  }
  function parenBalance(line) {
    var n = 0, q = null;
    for (var k = 0; k < line.length; k++) {
      var c = line[k];
      if (q) { if (c === q) q = null; continue; }
      if (c === '#') break;
      if (c === '"' || c === "'") q = c;
      else if (c === '(') n++;
      else if (c === ')') n--;
    }
    return n;
  }
  function openQuote(line) {
    var q = null;
    for (var k = 0; k < line.length; k++) { var c = line[k]; if (q) { if (c === q) q = null; } else if (c === '#') break; else if (c === '"' || c === "'") q = c; }
    return q;
  }
  /** 條件裡的單一 = 換成 ==（不動 ==、<=、>=、!=） */
  function fixAssignInCond(line) { return line.replace(/([^=<>!])=([^=])/, '$1==$2').replace(/([^=<>!\s])==/, '$1 =='); }

  PYRUN.explain = function (err, code) {
    if (!err) return null;
    var t = err.type, msg = err.msg || '', line = err.line;
    var lines = (code || '').split('\n');
    var src = lines[(line || 1) - 1];
    if (src == null) src = err.text || '';
    var at = line ? '第 ' + line + ' 行：' : '';
    var ind = (/^\s*/.exec(src) || [''])[0];
    function R(title, tip, o) {
      o = o || {};
      return { title: title, tip: tip, line: line, raw: t + (msg ? ': ' + msg : ''),
        yours: line ? src : null, fixed: o.fixed != null && o.fixed !== src ? o.fixed : null,
        bad: o.bad || null, good: o.good || null, mark: o.mark || null, fixedLine: o.fixedLine || line };
    }

    /* ── 不是語法問題的狀況 ── */
    if (t === 'Timeout' || t === 'TooMuchOutput') return R(t === 'Timeout' ? '⏰ 程式跑超過 3 秒還沒結束' : '📜 輸出太多了，程式停不下來',
      '通常是「停不下來的迴圈」：while 的條件永遠成立。檢查迴圈裡面有沒有「改變條件用到的變數」—— 下面的範例少了最後一行，n 永遠不會變。',
      { bad: "n = 1\nwhile n <= 5:\n    print('第', n, '圈')", good: "n = 1\nwhile n <= 5:\n    print('第', n, '圈')\n    n = n + 1    # ← 每跑一圈就加 1，n 才會改變" });
    if (t === 'NeedMoreInput') return R('⌨️ 程式要的輸入比這組測資還多',
      '這組測資只給了固定幾個輸入。常見原因：該結束了卻沒有離開迴圈，或是 input( ) 寫在不該重複的地方。',
      { bad: "while True:\n    cmd = input('指令（q 結束）：')\n    if cmd == 'q':\n        print('再見！')     # 印完還在迴圈裡，又去問下一次", good: "while True:\n    cmd = input('指令（q 結束）：')\n    if cmd == 'q':\n        print('再見！')\n        break               # ← 離開迴圈" });
    if (t === 'EngineError' || t === 'EngineNotReady') return R('⚙️ Python 引擎出了狀況', '請重新整理頁面再試一次。');

    /* ── 全形符號（最常見，優先判斷） ── */
    var fwAt = -1;
    (function () { var q = null; for (var k = 0; k < src.length; k++) { var c = src[k]; if (q) { if (c === q) q = null; continue; } if (c === '#') break; if (c === '"' || c === "'") { q = c; continue; } if (FULLWIDTH.test(c)) { fwAt = k; return; } } })();
    if (fwAt >= 0 && (t === 'SyntaxError' || t === 'IndentationError')) {
      return R('🔤 ' + at + '有全形符號「' + src[fwAt] + '」', '程式的括號、引號、逗號、冒號、等號都要用「半形」。按 Shift＋空白鍵 可以切換全形／半形。只有引號裡面的文字可以用全形（例如「，」「！」）。',
        { fixed: fixFullwidth(src), mark: [fwAt, fwAt + 1], bad: "print（'你好'）\nif age ＞＝ 13：", good: "print('你好')\nif age >= 13:" });
    }

    /* ── 縮排 ── */
    if (t === 'IndentationError' || t === 'TabError') {
      if (/expected an indented block/.test(msg)) {
        var prev = (lines[(line || 1) - 2] || '').trimEnd();
        return R('↹ ' + at + '這一行應該往右縮排', '冒號 : 結尾的那一行（if、else、for、while）底下，屬於它的程式要往右縮 4 格（按一下 Tab）。' + (prev ? '上一行是「' + prev.trim() + '」，所以這一行要縮排。' : ''),
          { fixed: ind + '    ' + src.trimStart(), bad: "if age >= 13:\nprint('兒童票')", good: "if age >= 13:\n    print('兒童票')" });
      }
      if (/unexpected indent/.test(msg)) return R('↹ ' + at + '這一行不應該縮排', '這一行前面多了空白。只有冒號 : 下面、屬於 if／for／while 的程式才要縮排，其他都從最左邊開始。',
        { fixed: src.trimStart(), bad: "name = input('姓名：')\n    print(name)", good: "name = input('姓名：')\nprint(name)" });
      if (/unindent/.test(msg)) return R('↹ ' + at + '縮排對不齊', '同一層的程式，前面的空白數要一樣多。建議一律用 Tab（這個編輯器按 Tab 會變成 4 個空白）。',
        { bad: "if age <= 6:\n    print('免購票')\n  else:", good: "if age <= 6:\n    print('免購票')\nelse:" });
      return R('↹ ' + at + '縮排有問題', '檢查這一行和上一行的空白是不是對齊。', { bad: "for i in range(3):\n  print(i)\n    print('!')", good: "for i in range(3):\n    print(i)\n    print('!')" });
    }

    if (t === 'SyntaxError') {
      var trimmed = src.trim();
      /* else if → elif（Python 也會報「少冒號」，所以要先判斷） */
      if (/^\s*else\s+if\b/.test(src)) {
        return R('❗ ' + at + 'Python 要寫 elif，不是 else if', 'Python 把「否則如果」合成一個字：elif。',
          { fixed: src.replace(/else\s+if/, 'elif'), bad: "else if age <= 13:", good: "elif age <= 13:" });
      }
      /* 少了冒號 */
      if ((/expected ':'/.test(msg) && !/:\s*(#.*)?$/.test(src)) || (BLOCK_KW.test(src) && !/:\s*(#.*)?$/.test(src) && /invalid syntax/.test(msg))) {
        return R('❗ ' + at + '這一行最後少了冒號 :', 'if、elif、else、for、while 這些「後面要接一段程式」的指令，那一行的最後都要加一個半形冒號 :',
          { fixed: src.replace(/\s*$/, '') + ':', bad: "if age >= 65\n    print('敬老票')", good: "if age >= 65:\n    print('敬老票')" });
      }
      /* 引號沒成對 */
      if (/unterminated string|EOL while scanning/.test(msg)) {
        var oq = openQuote(src) || "'";
        var fx = /\)\s*$/.test(src) ? src.replace(/\)\s*$/, oq + ')') : src + oq;
        return R('❗ ' + at + '引號沒有成對', '文字要用一對引號包起來，開頭和結尾都要有，而且要同一種（都用 \' 或都用 "）。',
          { fixed: fx, bad: "print('哈囉)\nprint(\"哈囉')", good: "print('哈囉')\nprint(\"哈囉\")" });
      }
      /* 括號沒關 */
      if (/was never closed|unexpected EOF/.test(msg)) {
        var need = Math.max(1, parenBalance(src));
        return R('❗ ' + at + '括號沒有關起來', '每一個 ( 都要有一個 ) 對應。數數看左右括號是不是一樣多 —— 函式裡面又有函式時最容易少一個。',
          { fixed: src.replace(/\s*$/, '') + new Array(need + 1).join(')'), bad: "age = int(input('幾歲？')\nprint(age", good: "age = int(input('幾歲？'))\nprint(age)" });
      }
      if (/unmatched '\)'/.test(msg)) {
        var li = src.lastIndexOf(')');
        return R('❗ ' + at + '多了一個右括號 )', '右括號比左括號多，刪掉多的那一個。',
          { fixed: li >= 0 ? src.slice(0, li) + src.slice(li + 1) : null, mark: li >= 0 ? [li, li + 1] : null, bad: "print('你好'))", good: "print('你好')" });
      }
      /* = 和 == */
      if (/Maybe you meant '=='|cannot assign to/.test(msg) && /^\s*(if|elif|while)\b/.test(src)) {
        return R('❗ ' + at + '比較「是否相等」要用 ==', '一個等號 = 是「把值存進變數」；兩個等號 == 才是「是否相等」。if、while 的條件裡要用 ==。',
          { fixed: fixAssignInCond(src), bad: "if guess = answer:", good: "if guess == answer:" });
      }
      if (/cannot assign to|Maybe you meant '=='/.test(msg)) {
        return R('❗ ' + at + '等號左邊要是一個變數名稱', '「變數 = 值」是把右邊的值存進左邊的變數，所以左邊只能是一個名字，不能是算式或文字。',
          { bad: "'我的名字' = input('姓名：')\nage + 1 = age", good: "name = input('姓名：')\nage = age + 1" });
      }
      /* 少逗號 */
      if (/forgot a comma/.test(msg)) {
        var fc = src.replace(/(['"])\s+(?=[A-Za-z_一-鿿])/g, '$1, ').replace(/([A-Za-z_0-9)])\s+(?=['"])/g, '$1, ');
        return R('❗ ' + at + '可能少了逗號 ,', 'print( ) 裡面要印好幾樣東西時，每一樣之間要用逗號 , 隔開。',
          { fixed: fc, bad: "print('我是' name '今年' age '歲')", good: "print('我是', name, '今年', age, '歲')" });
      }
      if (/invalid decimal literal|invalid character/.test(msg)) {
        return R('❗ ' + at + '數字和文字黏在一起了', '變數名稱不能用數字開頭（2name 不行，name2 可以）；要印出的文字記得加引號。',
          { bad: "2027year = 3\nprint(3個人)", good: "year2027 = 3\nprint('3個人')" });
      }
      /* invalid syntax：再細分 */
      var first = (/^\s*([A-Za-z_]+)/.exec(src) || [])[1] || '';
      if (TYPO_KW[first.toLowerCase()]) {
        return R('❗ ' + at + '「' + first + '」拼錯了', '應該是「' + TYPO_KW[first.toLowerCase()] + '」。Python 的指令一個字母都不能錯，而且都是小寫。',
          { fixed: src.replace(first, TYPO_KW[first.toLowerCase()]), bad: 'esle:\nwhlie x < 3:', good: 'else:\nwhile x < 3:' });
      }
      if (/^\s*(elif|else)\b/.test(src)) {
        return R('❗ ' + at + 'elif／else 的位置不對', 'elif、else 一定要接在 if 那一段的後面，而且要和 if 對齊（縮排一樣多），中間不能夾別的程式。',
          { bad: "if age <= 6:\n    print('免購票')\nprint('歡迎')\nelse:\n    print('全票')", good: "if age <= 6:\n    print('免購票')\nelse:\n    print('全票')\nprint('歡迎')" });
      }
      var pl = lines[(line || 1) - 2];
      if (pl != null && parenBalance(pl) > 0) {
        line = line - 1; src = pl; at = '第 ' + line + ' 行：';
        return R('❗ ' + at + '括號沒有關起來（錯誤出現在下一行，但問題在這一行）', '這一行的 ( 比 ) 多，Python 以為下一行還是這個括號裡的內容，所以在下一行才發現不對。',
          { fixed: pl.replace(/\s*$/, '') + new Array(parenBalance(pl) + 1).join(')'), bad: "age = int(input('幾歲？')\nprint(age)", good: "age = int(input('幾歲？'))\nprint(age)" });
      }
      if (/^\s*print\s+['"(A-Za-z]/.test(src) && !/^\s*print\s*\(/.test(src)) {
        return R('❗ ' + at + 'print 後面要加小括號', 'Python 3 的 print 是函式，要印的東西放在小括號裡。',
          { fixed: src.replace(/print\s+(.*?)\s*$/, 'print($1)'), bad: "print '你好'", good: "print('你好')" });
      }
      return R('❗ ' + at + '語法錯誤：電腦看不懂這一行', '先對照下面四個最常見的原因，一個一個檢查這一行（如果這一行看起來沒問題，也看看上一行）。',
        { mark: err.col ? [Math.max(0, err.col - 1), err.col] : null,
          bad: "if age >= 13          # ① 少了冒號\nprint('我是' name)     # ② 少了逗號\nprint('哈囉)           # ③ 引號沒成對\nage = int(input('幾歲')  # ④ 括號沒關",
          good: "if age >= 13:\nprint('我是', name)\nprint('哈囉')\nage = int(input('幾歲'))" });
    }

    /* ── 執行時才發生的錯誤 ── */
    if (t === 'NameError') {
      var nm = (/name '([^']+)'/.exec(msg) || [])[1] || '';
      var cn = nm && closeName(nm), pos = nm ? src.indexOf(nm) : -1;
      if (cn) return R('🔍 ' + at + '電腦不認識「' + nm + '」—— 是不是要寫「' + cn + '」？', 'Python 會分大小寫，一個字母都不能錯。',
        { fixed: src.replace(new RegExp('\\b' + nm + '\\b'), cn), mark: pos >= 0 ? [pos, pos + nm.length] : null, bad: "Print('你好')\npirnt('你好')", good: "print('你好')" });
      var usedLater = lines.slice(line || 0).some(function (l) { return new RegExp('^\\s*' + nm + '\\s*=[^=]').test(l); });
      return R('🔍 ' + at + '電腦不認識「' + nm + '」', usedLater ? '「' + nm + '」是在後面才建立的 —— 變數要先建立（先寫 ' + nm + ' = …），後面才能用。' :
        '兩種可能：① 變數還沒建立、或名字打錯（和建立時要一模一樣）；② 它其實是要印出的文字，忘了加引號。',
        { mark: pos >= 0 ? [pos, pos + nm.length] : null, bad: "print(name)\nname = input('姓名：')\nprint(你好)", good: "name = input('姓名：')\nprint(name)\nprint('你好')" });
    }
    if (t === 'TypeError') {
      if (/can only concatenate str|unsupported operand type\(s\) for \+: 'int' and 'str'/.test(msg))
        return R('🧩 ' + at + '文字和數字不能直接用 + 接起來', '有兩種改法：用逗號分開（最簡單），或用 str( ) 把數字先變成文字。',
          { bad: "age = 15\nprint('今年' + age + '歲')", good: "print('今年', age, '歲')\nprint('今年' + str(age) + '歲')" });
      if (/not supported between instances of 'str' and 'int'|'int' and 'str'/.test(msg))
        return R('🧩 ' + at + '拿文字去和數字比大小', 'input( ) 拿到的一律是「文字」，就算打的是 15 也一樣。要比大小，先用 int( ) 轉成數字。',
          { bad: "age = input('幾歲？')\nif age >= 13:", good: "age = int(input('幾歲？'))\nif age >= 13:" });
      if (/unsupported operand type|can't multiply sequence/.test(msg))
        return R('🧩 ' + at + '文字不能拿來計算', 'input( ) 拿到的是文字。要計算的數字，先用 int( )（整數）或 float( )（有小數）轉換。',
          { bad: "w = input('體重：')\nbmi = w / 1.6 ** 2", good: "w = float(input('體重：'))\nbmi = w / 1.6 ** 2" });
      if (/object is not callable/.test(msg))
        return R('🧩 ' + at + '把變數當成函式用了', '有變數取了和函式一樣的名字（print、input、int…），函式就被蓋掉了。幫變數換個名字。',
          { bad: "input = input('姓名：')\nage = input('年齡：')", good: "name = input('姓名：')\nage = input('年齡：')" });
      return R('🧩 ' + at + '資料型態不對', '檢查這一行用到的變數是文字還是數字。', { bad: "n = '3'\nprint(n * 2)   # 印出 33", good: "n = int('3')\nprint(n * 2)   # 印出 6" });
    }
    if (t === 'ValueError') {
      if (/invalid literal for int\(\).*'(-?\d+\.\d+)'/.test(msg))
        return R('🔢 ' + at + 'int( ) 遇到了小數', 'int( ) 只能轉整數，有小數點的（例如體重 48.5）要用 float( )。',
          { fixed: src.replace(/\bint\(/, 'float('), bad: "w = int(input('體重：'))   # 輸入 48.5 會出錯", good: "w = float(input('體重：'))" });
      if (/invalid literal for int|could not convert string to float/.test(msg))
        return R('🔢 ' + at + '這個輸入不是數字', '程式要把輸入轉成數字，但輸入的內容是文字或空白。試跑時請輸入數字，例如 15，不要打「十五」或「15歲」。',
          { bad: '輸入：十五\n輸入：15歲', good: '輸入：15' });
      return R('🔢 ' + at + '數值不對', msg);
    }
    if (t === 'ZeroDivisionError') return R('➗ ' + at + '除以 0 了', '任何數都不能除以 0。檢查除數會不會是 0（例如人數輸入 0）。',
      { bad: "people = int(input('人數：'))\nprint(1000 // people)", good: "people = int(input('人數：'))\nif people > 0:\n    print(1000 // people)" });
    if (t === 'EOFError') return R('⌨️ 沒有輸入了', '程式還在等輸入。');
    return R('⚠️ ' + at + '執行時發生錯誤（' + t + '）', msg);
  };

  /** 找出「引號與註解以外」的全形符號（即時提醒用） */
  PYRUN.fullwidthOutsideStrings = function (code) {
    var hits = [];
    code.split('\n').forEach(function (l, i) {
      var q = null;
      for (var k = 0; k < l.length; k++) {
        var c = l[k];
        if (q) { if (c === q) q = null; continue; }
        if (c === '#') break;
        if (c === '"' || c === "'") { q = c; continue; }
        if (FULLWIDTH.test(c)) { hits.push({ line: i + 1, ch: c }); break; }
      }
    });
    return hits;
  };

  PYRUN._norm = norm; PYRUN._half = half;   // 給測試用
  window.PYRUN = PYRUN;
})();
