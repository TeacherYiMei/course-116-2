/* =====================================================================
   單元一「數位時代」進度掛鉤
   ---------------------------------------------------------------------
   這個單元是 unforte_114 移植過來的，內容區保留原本的互動；116 在外面套上全站外框：
     · 全站頁首（← 單元一／闖關地圖、學生名牌）＋四課的課程小卡（進度、目前在這裡）
     · 每一課兩種星星（一課最多 6★，單元一共 24★）：
         🧪 實驗任務（x1～x4）：頁面裡的互動遊戲完成三項任務，每項 1★
         ✅ 快速檢核（u1～u4）：三題全對 → 一次都沒錯 3★、錯 1 次 2★、錯 2 次以上 1★（星星只會變多）
   ⚠️ 實驗任務只挑「算得出來」的操作（二進位、摩斯、RGB 解碼、動手調參數），
      不挑選擇題 —— 選擇題的答案寫在原本的頁面程式裡，F12 看得到，不拿來計星。
   ⚠️ 快速檢核的對錯原本寫在按鈕的 onclick 裡（F12 一看就知道），
      現在按鈕只剩 answerReview(題號, this)：由這支把「按了哪一顆」送到驗證伺服器判斷（API.call('dq')）。
   ===================================================================== */
(function () {
  /* 116：頁首、課程小卡、登入框都用全站樣式（theme.css + ui.js + unit.js），和其他單元長得一樣。 */
  var unit = document.body.getAttribute('data-unit');     // '1'～'4'；課程首頁沒有
  UI.topbar('#topbar', { title: '💾 數位時代', kicker: '單元一 · 3上 第 1 章 · 0 與 1 的藝術',
    hub: unit ? 'index.html' : '../hub.html', backLabel: unit ? '← 單元一' : '← 闖關地圖' });
  UNIT.cards('#ucards', 'digital', unit ? 'd' + unit : null);
  if (unit) UNIT.pager('#pager', 'digital', 'd' + unit, 'index.html');   // 每一課結尾：← 上一課／下一課 →

  // ⚠️ 要在登入前就換掉：按鈕的 onclick 已經改成 answerReview(題號, this)，原本的函式接不住
  if (unit) hookReview();
  var names = { '1': '1-1 二進位原理', '2': '1-2 文字數位化', '3': '1-3 音訊數位化', '4': '1-4 影像數位化' };

  /* 快速檢核：對錯與提示都在驗證伺服器（來源 private/11601/digital/review.json）
     送出「第幾題、按鈕上的字」，伺服器回答對不對、錯的話提示是什麼。 */
  function hookReview() {
    var wrong = 0, saved = false, right = {};
    window.answerReview = function (q, btn) {
      if (!btn || btn.dataset.busy) return;
      btn.dataset.busy = '1';
      API.call('dq', { u: unit, q: q, v: btn.textContent.replace(/\s+/g, '') }).then(function (r) {
        delete btn.dataset.busy;
        var fb = document.getElementById('review-feedback'), sc = document.getElementById('review-score');
        if (r.ok) {
          right[q] = true;
          btn.classList.remove('wrong'); btn.classList.add('right');   // 全站選項樣式：答對綠框
          if (fb) fb.innerText = '✅ 第 ' + q + ' 題答對了！';
        } else {
          wrong++; btn.classList.add('wrong');   // 答錯紅框（不公布正解，看提示再想）
          if (fb) fb.innerText = '💡 ' + r.hint;
        }
        var n = Object.keys(right).length;
        if (sc) sc.innerText = n + ' / 3';
        if (n >= 3) {
          var badge = document.getElementById('review-badge'); if (badge) badge.classList.remove('hidden');
          if (!saved && STORE.me()) {
            saved = true;
            var stars = wrong === 0 ? 3 : (wrong === 1 ? 2 : 1);
            var res = STORE.saveLevel('digital', 'u' + unit, { stars: stars, score: Math.max(0, 100 - wrong * 20) });
            var best = res.record ? res.record.stars : stars;
            UI.toast('🏅 ' + names[unit] + '：這次 ' + '★'.repeat(stars) + (res.improved ? '（新紀錄！）' : '（最佳 ' + '★'.repeat(best) + '）'), 3500);
          }
        }
      }, function (e) {
        delete btn.dataset.busy;
        var fb = document.getElementById('review-feedback'); if (fb) fb.innerText = '📴 ' + API.msg(e);
      });
    };
  }


  /* ================================================================
     🧪 實驗任務：每一課三項，完成一項 1★（進度存在 digital 模組的 x1～x4）
     做法：把頁面原本的函式包一層（跑完原本的，再檢查有沒有達成），或聽滑桿的 input 事件。
     頁面的狀態變數（currentLevel、bonanzaScore…）是原本程式的全域變數，直接讀。
     ================================================================ */
  function V(name) { try { return (0, eval)(name); } catch (e) { return undefined; } }   // 讀頁面程式的全域 let 變數
  function $(id) { return document.getElementById(id); }
  var LAB = {
    '1': [
      { k: 'bits', t: '🔦 位元燈泡：拼出 3 個不同的目標數字', mem: {},
        fn: { calculateDecimal: function (m) { var lv = V('currentLevel'), g = V('gameLevels'); if (g && $('decimal-result') && +$('decimal-result').innerText === g[lv]) m[lv] = 1; return Object.keys(m).length >= 3; } } },
      { k: 'bonanza', t: '💎 BINARY BONANZA：一局裡拿到 100 分', fn: { evaluateSelection: function () { return (V('bonanzaScore') || 0) >= 100; }, endBonanzaGame: function () { return (V('bonanzaScore') || 0) >= 100; } } },
      { k: 'quiz', t: '🔁 雙向換算：十進位 → 二進位、二進位 → 十進位各答對 5 題', fn: { nextQuizQuestion: function () { return !!(V('isD2BCompleted') && V('isB2DCompleted')); } } }
    ],
    '2': [
      { k: 'listen', t: '📻 收報員：聽神祕訊號，成功解碼一個單字', fn: { checkDecryption: function () { return /^✅/.test(($('decrypt-feedback') || {}).innerText || ''); } } },
      { k: 'send', t: '📡 發報員：把單字正確發報成摩斯電碼', fn: { checkSendChallenge: function () { return /^✅/.test(($('send-feedback') || {}).innerText || ''); } } },
      { k: 'codec', t: '🔤 編碼實驗室：自己輸入一段「中英混合」的文字，比較 ASCII、Big-5、UTF-8', fn: { runMultiCodec: function () { var el = $('cipher-input-text') || {}, v = el.value || ''; return v !== el.defaultValue && /[A-Za-z0-9]/.test(v) && /[^\x00-\x7f]/.test(v); } } }
    ],
    '3': [
      { k: 'wave', t: '🎚️ 聲音三要素：調過響度和音調，並試過 3 種音色', mem: { t: {} },
        fn: { changeTimbre: function (m, a) { m.t[a[0]] = 1; return done3(m); } },
        input: { 'sound-loudness': function (m) { m.l = 1; return done3(m); }, 'sound-pitch': function (m) { m.p = 1; return done3(m); } } },
      { k: 'digit', t: '📉 取樣與量化：取樣點、量化位元都拉到最少，再拉到最多，比較波形', mem: {},
        input: { 'range-sampling': edge, 'range-quantize': edge } },
      { k: 'format', t: '💾 格式與容量：WAV、MP3、MIDI 三種都比較過，並試算錄音容量', mem: { f: {} },
        fn: { setCompareFormat: function (m, a) { m.f[a[0]] = 1; return Object.keys(m.f).length >= 3 && m.c; } },
        input: { 'audio-calc-slider': function (m) { m.c = 1; return Object.keys(m.f).length >= 3; } } }
    ],
    '4': [
      { k: 'explorer', t: '🔍 像素探險家：自己取樣、量化一張圖，和電腦的結果比對', fn: { peCompleteExplorer: function () { return true; } } },
      { k: 'decode', t: '🎨 色彩解碼：把二進位換成 RGB，解開 3 種顏色', mem: { n: 0 },
        fn: { submitImageDecode: function (m) { var u = V('unlockedColors'); m.n = Math.max(m.n, u ? u.size : 0); return m.n >= 3; } } },
      { k: 'compress', t: '🗜️ 壓縮實驗室：原圖、減少顏色、縮小尺寸三種都試過，比較檔案重量', mem: { c: {} },
        fn: { renderCompressDemo: function (m, a) { m.c[a[0]] = 1; return Object.keys(m.c).length >= 3; } } }
    ]
  };
  function done3(m) { return !!(m.l && m.p && Object.keys(m.t).length >= 3); }
  function edge(m, a, el) {   // 同一個滑桿碰過最小值和最大值
    var id = el.id; m[id] = m[id] || {};
    if (+el.value <= +el.min) m[id].lo = 1; if (+el.value >= +el.max) m[id].hi = 1;
    return ['range-sampling', 'range-quantize'].every(function (k) { return m[k] && m[k].lo && m[k].hi; });
  }

  function hookLab() {
    var tasks = LAB[unit]; if (!tasks) return;
    var ID = 'x' + unit, rec = STORE.level('digital', ID) || {}, got = Object.assign({}, (rec.extra || {}).tasks || {});
    // 任務卡：放在課程小卡下面（捲動時課程小卡會固定在上方，任務卡跟著內容走）
    var nav = $('ucards'), anchor = nav && (nav.closest('.ucards-ph') || nav);
    var box = document.createElement('section'); box.className = 'card labtasks'; box.id = 'lab-tasks'; box.setAttribute('aria-label', '本課實驗任務');
    if (anchor) anchor.insertAdjacentElement('afterend', box);
    function draw() {
      var n = tasks.filter(function (t) { return got[t.k]; }).length;
      box.innerHTML = '<div class="row between"><div><p class="kicker">🧪 本課實驗任務 · 每完成一項 1⭐</p><h2 class="bold" style="font-size:1.05rem">動手玩下面的實驗，完成這三項任務</h2></div>' +
        '<span class="chip" id="lab-stars">' + n + ' / 3 ⭐</span></div><div class="grid g3 mt1">' +
        tasks.map(function (t) { return '<div class="labtask' + (got[t.k] ? ' done' : '') + '" data-k="' + t.k + '"><span class="ck">' + (got[t.k] ? '✅' : '⬜') + '</span><span>' + UI.esc(t.t) + '</span></div>'; }).join('') +
        '</div><p class="tiny soft mt1">再加上最後的「快速檢核」（最多 3⭐），這一課最多 6⭐。</p>';
    }
    function finish(t) {
      if (got[t.k]) return;
      got[t.k] = 1;
      var n = tasks.filter(function (x) { return got[x.k]; }).length;
      STORE.saveLevel('digital', ID, { stars: n, extra: { tasks: got } });
      draw(); UI.toast('🧪 實驗任務完成：' + t.t.split('：')[0] + '（' + n + ' / 3 ⭐）', 3000);
    }
    tasks.forEach(function (t) {
      var m = t.mem || {};
      Object.keys(t.fn || {}).forEach(function (name) {
        var orig = window[name]; if (typeof orig !== 'function') return;
        window[name] = function () {
          var args = arguments, r = orig.apply(this, args);
          function chk() { try { if (t.fn[name](m, args)) finish(t); } catch (e) {} }
          if (r && typeof r.then === 'function') r.then(chk, chk); else chk();
          return r;
        };
      });
      Object.keys(t.input || {}).forEach(function (id) {
        var el = $(id); if (!el) return;
        el.addEventListener('input', function () { try { if (t.input[id](m, null, el)) finish(t); } catch (e) {} });
      });
    });
    draw();
  }


  // 放在最後：上面的 LAB 表要先建好（已登入時 requireLogin 會立刻呼叫）
  UI.requireLogin(function () { if (unit) hookLab(); });
})();
