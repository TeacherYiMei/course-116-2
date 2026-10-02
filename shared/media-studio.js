/* =====================================================================
   🎬 多媒體專題頁（11602/media.html）：課程小卡、概念闖關、看示範、AI 前導關、30 秒廣告工作站 W1～W5
   ---------------------------------------------------------------------
   原本整段寫在 media.html 裡（約 700 行），拆出來方便維護；頁面只留版面和載入順序。
   需要（依序載入）：config.js、store.js、ui.js、api.js、cardgame.js、labkit.js、media-labs.js、ai-labs.js、content/media.js
   內容（關卡、示範、工作站步驟）都在 content/media.js；AI 工具在 config.js 的 AI_TOOL。
   ===================================================================== */
(function () {
  var esc = UI.esc, MOD = 'media', STEPS = window.MEDIA_STEPS;
  var AIT = (window.CONFIG && CONFIG.AI_TOOL) || { name: '老師指定的 AI 工具', url: '', login: '' };   // 學校指定的 AI 工具（config.js）
  UI.topbar('#topbar', { title: '🎬 多媒體專題：30 秒廣告', kicker: '單元四 · 3下 第 1 章 · 好好用 AI' });
  /* 兩組闖關（概念 M1～M4、AI 素養 A1～A6）共用 cardgame 引擎，引擎用固定的元素 id，
     所以同一時間只掛一組：切到哪個分頁就掛哪一組、清掉另一組。 */
  function mountGames() {
    var a = document.getElementById('ai-games'); if (a) a.innerHTML = '';
    CARDGAME.mount({ app: '#games', levels: MEDIA_LEVELS, mod: MOD, headline: '先看懂影片規格，再和 AI 一起拍一支 30 秒廣告' });
  }
  mountGames();

  /* ── 課程小卡：概念闖關 → 看示範 → AI 前導關 → 廣告工作站（照上課順序，顯示各自的進度）── */
  var TABS = ['games', 'demo', 'ai', 'studio'], curTab = 'games';
  function starsOf(ids) { return ids.reduce(function (a, id) { return a + ((STORE.level(MOD, id) || {}).stars || 0); }, 0); }
  function drawCards() {
    var M = (window.MEDIA_LEVELS || []).map(function (l) { return l.id; }), AI = (window.MEDIA_AI_LEVELS || []).map(function (l) { return l.id; });
    var W = STEPS.filter(function (s) { return (STORE.level(MOD, s.id) || {}).done; }).length, D = window.MEDIA_DEMO || {};
    var C = [
      { t: 'games', icon: '🎮', title: '概念闖關', ds: '畫質、影片格式、時間軸、後製與著作權', got: starsOf(M), max: M.length * 3, unit: '⭐' },
      { t: 'demo', icon: '📺', title: '看示範', ds: '拆解示範廣告的 ' + ((D.moves || []).length || 8) + ' 個手法', note: '課堂一起看' },
      { t: 'ai', icon: '🤖', title: 'AI 前導關', ds: 'AI 素養六關：先認識 AI，再請它幫忙', got: starsOf(AI), max: AI.length * 3, unit: '⭐' },
      { t: 'studio', icon: '🎬', title: '廣告工作站', ds: '好好用 AI，拍一支 30 秒廣告', got: W, max: STEPS.length, unit: '步' }
    ];
    document.getElementById('ucards').innerHTML = C.map(function (c, i) {
      var pct = c.max ? Math.round(c.got / c.max * 100) : 0;
      return '<button class="ucard mtab uc-' + (i + 1) + (c.t === curTab ? ' on' : '') + '" data-t="' + c.t + '" aria-pressed="' + (c.t === curTab) + '">' +
        '<span class="no">' + (i + 1) + '</span><span class="here">目前在這裡 👇</span>' +
        '<span class="ic">' + c.icon + '</span><span class="tt">' + c.title + '</span><span class="ds">' + esc(c.ds) + '</span>' +
        (c.max ? '<span class="pg"><span>' + (c.got >= c.max ? '✅ 完成' : '進度') + '</span><span>' + c.got + ' / ' + c.max + ' ' + c.unit + '</span></span><span class="bar"><i style="width:' + pct + '%"></i></span>'
          : '<span class="pg"><span>👀 ' + c.note + '</span></span>') + '</button>';
    }).join('');
    document.querySelectorAll('#ucards .ucard').forEach(function (b) { b.onclick = function () { clearHash(); tab(b.dataset.t); UI.scrollToNav('#ucards'); }; });
  }
  window.addEventListener('store:change', function () { if (STORE.me()) drawCards(); });
  /* 每一部分的結尾：← 上一部分／下一部分 →（和其他單元的「上一課／下一課」同一組樣式） */
  var TAB_NAMES = { games: '🎮 概念闖關', demo: '📺 看示範', ai: '🤖 AI 前導關', studio: '🎬 廣告工作站' };
  function tabPager(t) {
    var i = TABS.indexOf(t), P = TABS[i - 1], N = TABS[i + 1];
    function go(k) { return function () { clearHash(); tab(k); UI.scrollToNav('#ucards'); }; }
    UI.pager('#tab-pager',
      P ? { lbl: '← 上一部分', title: TAB_NAMES[P], go: go(P) } : null,
      N ? { lbl: '下一部分 →', title: TAB_NAMES[N], go: go(N) } : { lbl: '完成了嗎？回到 →', title: '🗺️ 闖關地圖', href: 'hub.html' });
  }
  function tab(t) {
    curTab = t; drawCards(); tabPager(t);
    TABS.forEach(function (k) { document.getElementById(k).classList.toggle('hidden', k !== t); });
    if (t === 'games' && !document.querySelector('#games .card')) mountGames();
    if (t === 'studio') studio();
    if (t === 'demo') demo();
    if (t === 'ai') ai();
  }
  // 手動切分頁時清掉網址的 #關卡（不然引擎會直接打開上次那一關）
  function clearHash() { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} }
  drawCards(); tabPager('games');
  UI.stickyNav('#ucards');   // 捲動時精簡版課程小卡固定在上方

  function rec(id) { return STORE.level(MOD, id) || {}; }
  function done(id) { return !!rec(id).done; }
  function extra(id) { return rec(id).extra || {}; }
  function save(id, ex, isDone) {
    var r = STORE.saveLevel(MOD, id, { done: !!isDone, extra: ex });
    if (isDone && r.improved) UI.toast('✅ ' + STEPS.filter(function (s) { return s.id === id; })[0].title + ' 完成！');
    return r;
  }
  function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
  function len(t) { return Array.from(String(t || '').replace(/\s/g, '')).length; }      // 字數（不算空白）
  function sel(id, opts, v) { return '<select class="input" id="' + id + '">' + opts.map(function (o) { return '<option' + (o === v ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>'; }
  function msgBox(el, ok, okText, miss) {
    el.innerHTML = ok ? '<div class="note ok small">' + okText + '</div>' : '<div class="note warn small">已暫存，但還不算完成 —— 還差：' + miss.map(esc).join('、') + '</div>';
  }

  /* ================================================================
     📺 看示範：出處＋手法拆解（影片不放進網站，老師課堂播放）
     ================================================================ */
  function demo() {
    var D = window.MEDIA_DEMO, box = document.getElementById('demo'), found = {};
    function draw() {
      var n = Object.keys(found).length;
      box.innerHTML = '<section class="card pop"><div class="tape"></div><p class="kicker">看示範 · 邊看邊找廣告手法</p>' +
        '<h2 class="black" style="font-size:1.3rem">《' + esc(D.title) + '》</h2>' +
        '<p class="small mt1">創作者：<b>' + esc(D.creator) + '</b>（' + esc(D.platform) + '）· 長度 ' + esc(D.length) +
        ' · <a href="' + esc(D.url) + '" target="_blank" rel="noopener">到創作者頁面看原作 ↗</a></p>' +
        (D.schoolUrl ? '<div class="row mt2"><a class="btn primary" id="demo-play" href="' + esc(D.schoolUrl) + '" target="_blank" rel="noopener">▶ 用學校帳號觀看示範影片</a></div>' +
          '<p class="tiny soft mt1">🔒 影片放在學校雲端硬碟，只有本校 Google 帳號登入後才能看（依著作權法第 46 條：教學使用、限校內、註明出處）。請不要下載或轉傳。</p>'
          : '<p class="tiny soft mt1">🎥 影片是別人的作品，網站不放檔案，由老師在課堂播放。</p>') +
        '<div class="note warn small mt2">🤖 ' + esc(D.aiNote) + '</div></section>' +
        '<section class="card mt2"><div class="row between"><h3 class="bold">🔎 這支廣告用了哪些手法？看到就點一下</h3><span class="chip">找到 ' + n + ' / ' + D.moves.length + '</span></div>' +
        '<div class="grid g2 mt1">' + D.moves.map(function (m, i) {
          return '<button class="move' + (found[i] ? ' on' : '') + '" data-i="' + i + '"><div class="at">' + m.icon + ' ' + esc(m.at) + (found[i] ? ' ✅' : '') + '</div>' +
            '<div class="small mt1">' + esc(m.what) + '</div>' +
            (found[i] ? '<div class="small mt1">💡 ' + esc(m.why) + '</div><div class="tiny soft mt1">➡️ 我們的 30 秒：' + esc(m.ours) + '</div>' : '') + '</button>';
        }).join('') + '</div>' +
        (n === D.moves.length ? '<div class="note ok small mt2">🎉 八個手法都找到了！接下來想想：30 秒裡要留下哪幾個？</div>' : '') + '</section>' +
        '<section class="card mt2"><h3 class="bold">💭 想一想（課堂討論）</h3><ol class="mt1">' + D.think.map(function (t) { return '<li class="mt1">' + esc(t) + '</li>'; }).join('') + '</ol></section>';
      box.querySelectorAll('.move').forEach(function (b) { b.onclick = function () { var i = +b.dataset.i; if (found[i]) delete found[i]; else found[i] = 1; draw(); }; });
    }
    draw();
  }

  /* ================================================================
     🤖 AI 前導關：AI 素養六關（MEDIA_AI_LEVELS，改編自 Day of AI，計星）
     ================================================================ */
  function ai() {
    var box = document.getElementById('ai'), src = window.MEDIA_AI_SOURCE || {};
    document.getElementById('games').innerHTML = '';
    box.innerHTML = '<section class="card pop"><div class="tape"></div><p class="kicker">AI 前導關 · 和 AI 一起做廣告之前先闖這六關</p>' +
      '<h2 class="black" style="font-size:1.3rem">🤖 先認識 AI，再請它幫忙</h2>' +
      '<p class="small mt1">⭐ 這個單元的重點是<b>「好好用 AI」</b>：創意發想、文案、句型、鏡頭、配樂建議都可以請 AI 幫忙。AI 是什麼、怎麼學會的、會在哪裡出錯、哪些事不能做，先弄清楚才能用得好。</p>' +
      rulesHTML(true) + aiHowHTML() + '</section><div id="ai-games" class="mt2"></div>' +
      (src.note ? '<p class="tiny soft mt2">📚 ' + esc(src.note) + ' <a href="' + esc(src.url) + '" target="_blank" rel="noopener">' + esc(src.name) + ' ↗</a></p>' : '');
    CARDGAME.mount({ app: '#ai-games', levels: window.MEDIA_AI_LEVELS || [], mod: MOD, headline: 'AI 素養六關：AI 是什麼 → 怎麼學 → 演算法 → 生成式 AI → 好好問 → 倫理' });
  }

  /* ================================================================
     🎬 30 秒廣告工作站：決定主題 → 三句文案 → 拍攝重點 → 配樂 → 剪輯
     ================================================================ */
  var cur = 0;
  function studio() {
    var box = document.getElementById('studio');
    var n = STEPS.filter(function (s) { return done(s.id); }).length;
    box.innerHTML = '<section class="card pop"><div class="tape"></div><div class="row between"><div><p class="kicker">廣告工作站 · 不計星 · 記錄完成</p>' +
      '<h2 class="black" style="font-size:1.35rem">拍一支 ' + V().short + '廣告：讓平凡物品變主角</h2>' +
      '<p class="small soft mt1">決定主題 → 三句文案 → 拍攝重點 → 配樂 → 剪輯。每一步都可以請 AI 當創作夥伴；影片自己實拍、在電腦上剪。</p></div>' +
      '<div class="center"><div class="black" style="font-size:1.8rem">' + n + ' / ' + STEPS.length + '</div><div class="tiny soft bold">步驟完成</div></div></div>' +
      '<nav class="ucards compact wsteps" style="--n:' + STEPS.length + '" aria-label="工作站五個步驟">' + STEPS.map(function (s, i) {
        var d = done(s.id);
        return '<button class="ucard step' + (i === cur ? ' on' : '') + (d ? ' done' : '') + '" data-i="' + i + '"' + (i === cur ? ' aria-current="step"' : '') + '>' +
          '<span class="no">' + (i + 1) + '</span><span class="here">目前在這裡 👇</span><span class="ic">' + s.icon + '</span><span class="tt">' + esc(s.title) + '</span>' +
          '<span class="pg"><span>' + (d ? '✅ 完成' : '尚未完成') + '</span></span><span class="bar"><i style="width:' + (d ? 100 : 0) + '%"></i></span></button>';
      }).join('') + '</nav>' + verHTML() + aiHowHTML() + rulesHTML() + '</section><section class="card mt2" id="panel"></section>';
    box.querySelectorAll('.step').forEach(function (b) { b.onclick = function () { cur = +b.dataset.i; studio(); }; });
    box.querySelectorAll('[data-ver]').forEach(function (b) { b.onclick = function () { setVer(+b.dataset.ver); studio(); }; });
    var s = STEPS[cur], panel = document.getElementById('panel');
    panel.innerHTML = '<div class="row between"><h3 class="black" style="font-size:1.2rem">' + s.icon + ' ' + esc(s.title) + '</h3>' + (s.time ? '<span class="chip">⏰ ' + esc(s.time) + '</span>' : '') + '</div><p class="small soft mt1">' + esc(vtext(s.desc)) + '</p>' +
      (s.ai ? '<div class="aihelp mt1"><div><b>🤖 AI 可以幫忙</b>' + esc(vtext(s.ai.can)) + '</div><div><b>🙋 要自己決定</b>' + esc(vtext(s.ai.self)) + '</div></div>' : '') +
      '<div id="body" class="mt2"></div><nav id="w-pager" aria-label="上一步／下一步"></nav>';
    var body = document.getElementById('body');
    // 每一步的結尾：← 上一步／下一步 →
    function goW(k) { return function () { cur = k; studio(); document.getElementById('panel').scrollIntoView({ behavior: 'smooth', block: 'start' }); }; }
    var P = STEPS[cur - 1], N = STEPS[cur + 1];
    UI.pager('#w-pager', P ? { lbl: '← 上一步', title: cur + '. ' + P.icon + ' ' + P.title, go: goW(cur - 1) } : null,
      N ? { lbl: '下一步 →', title: (cur + 2) + '. ' + N.icon + ' ' + N.title, go: goW(cur + 1) } : null);
    ({ W1: topicStep, W2: copyStep, W3: shotStep, W4: musicStep, W5: editStep })[s.id](body, s);
  }
  function next() { if (cur < STEPS.length - 1) cur++; setTimeout(studio, 900); }

  /* 「和 AI 討論」怎麼做：網站不是 AI，是幫你寫好提示詞，到學校指定的 AI 工具貼上 */
  function aiHowHTML() {
    return '<div class="note small mt2 aihow">🤖 <b>這個網站不是 AI。</b>「和 AI 討論」這樣做：① 按 <b>📋 複製</b>網站幫你寫好的提示詞 → ② 按 <b>↗ 開啟 ' + esc(AIT.name) + '</b>' +
      (AIT.login ? '（用' + esc(AIT.login) + '登入）' : '') + '，貼上送出 → ③ 把 AI 的回答貼回網站，寫下你採用或修改了什麼。' +
      (AIT.url ? ' <a class="btn sm" href="' + esc(AIT.url) + '" target="_blank" rel="noopener">↗ 開啟 ' + esc(AIT.name) + '</a>' : '') + '</div>';
  }
  /* 好好用 AI 五守則（工作站最上面一直看得到） */
  function rulesHTML(closed) {
    var R = window.MEDIA_AI_RULES || [];
    return '<details class="rules mt2"' + (closed ? '' : ' open') + '><summary class="bold">🤖 好好用 AI：五個守則</summary><div class="grid g3 mt1">' + R.map(function (r, i) {
      return '<div class="rule"><div class="bold">' + r.icon + ' ' + (i + 1) + '. ' + esc(r.t) + '</div><div class="tiny soft mt1">' + esc(r.d) + '</div></div>';
    }).join('') + '</div></details>';
  }
  /* 每一步的「AI 建議紀錄」：貼上 AI 的建議（選填）；有貼就要寫採用／修改了什麼 */
  function aiRec(p, ex) {
    return '<details class="mt2"' + (ex.aiText ? ' open' : '') + '><summary class="small bold">📝 AI 建議紀錄（有用 AI 就填）</summary>' +
      '<label class="field mt1">AI 的建議（貼上來）<textarea class="input" id="' + p + '-ait" rows="3">' + esc(ex.aiText || '') + '</textarea></label>' +
      '<label class="field mt1">我採用了哪些、改了哪些？為什麼？<input class="input" id="' + p + '-aiu" maxlength="50" value="' + esc(ex.aiUse || '') + '" placeholder="例：採用「低角度拍椅腳」，但操場太遠，改成在教室走廊拍"></label></details>';
  }
  function aiVals(p) { return { aiText: val(p + '-ait'), aiUse: val(p + '-aiu') }; }
  function aiMiss(p, miss) { if (val(p + '-ait') && len(val(p + '-aiu')) < 4) miss.push('AI 建議紀錄：寫下採用或修改了什麼'); }

  /* 共用：提示詞框（顯示＋一鍵複製） */
  function promptBox(id, label) {
    return '<p class="small bold mt2">' + label + '</p><div class="files mt1" id="' + id + '"></div>' +
      '<div class="row mt1"><button class="btn sm" data-copy="' + id + '">📋 複製</button>' +
      (AIT.url ? '<a class="btn sm" href="' + esc(AIT.url) + '" target="_blank" rel="noopener">↗ 開啟 ' + esc(AIT.name) + '</a>' : '') + '<span class="tiny soft" id="' + id + '-ok"></span></div>';
  }
  function wireCopy(root) {
    root.querySelectorAll('[data-copy]').forEach(function (b) {
      b.onclick = function () {
        var id = b.dataset.copy, t = document.getElementById(id).textContent, out = document.getElementById(id + '-ok');
        try { navigator.clipboard.writeText(t).then(function () { out.textContent = '✅ 已複製，到 ' + AIT.name + ' 貼上（Ctrl＋V）'; }, function () { out.textContent = '請手動選取上面的文字複製'; }); }
        catch (e) { out.textContent = '請手動選取上面的文字複製'; }
      };
    });
  }
  /* 共用：檢核清單（「（挑戰）」開頭的可以不做）；回傳 { html, wire(root, onChange) } */
  function checkList(name, list, st) {
    return {
      html: '<div class="stack">' + list.map(function (c, i) {
        return '<label class="chk"><input type="checkbox" data-cl="' + name + '" data-i="' + i + '"' + (st[i] ? ' checked' : '') + '><span>' + esc(c) + '</span></label>';
      }).join('') + '</div>',
      wire: function (root, onChange) {
        root.querySelectorAll('input[data-cl="' + name + '"]').forEach(function (cb) { cb.onchange = function () { st[+cb.dataset.i] = cb.checked; onChange(st); }; });
      }
    };
  }
  function allChecked(list, st) { return list.every(function (c, i) { return /^（挑戰）/.test(c) || st[i]; }); }
  function left(list, st) { return list.filter(function (c, i) { return !/^（挑戰）/.test(c) && !st[i]; }).length; }

  /* ── ⏱️ 兩種版本：30 秒（標準）／15 秒（精簡）——學生在工作站上方自己選，記在 W1 的學習紀錄（ver）──
     三句文案都要寫，只是時段變短；W3、W5 的完成條件依版本自動換。先完成 15 秒版，可以再挑戰 30 秒。 */
  var VERS = {
    30: { sec: 30, name: '30 秒（標準版）', short: '30 秒',
      at: { open: '0–3 秒', feat: '8–18 秒', end: '25–30 秒' },
      segs: [
        { t: '0–3 秒', what: '物品特寫或有趣動作', aim: '抓住注意', sec: 3, line: 'open', c: 0 },
        { t: '3–8 秒', what: '材質、外形、細節', aim: '認識主角', sec: 5, c: 1 },
        { t: '8–18 秒', what: '人物使用或移動物品', aim: '呈現特色', sec: 10, line: 'feat', c: 2 },
        { t: '18–25 秒', what: '最有情緒或趣味的畫面', aim: '加深印象', sec: 7, c: 3 },
        { t: '25–30 秒', what: '物品全景＋收尾標語', aim: '留下記憶', sec: 5, line: 'end', c: 4 }],
      shots: [8, 12], per: [2, 4], tot: [26, 34], len: [25, 35], allFeats: true, beat: 25,
      start: [0, 1, 1, 2, 2, 2, 3, 4], angles: ['特寫', '特寫', '中景', '中景', '低角度', '遠景', '中景', '遠景'] },
    15: { sec: 15, name: '15 秒（精簡版）', short: '15 秒',
      at: { open: '0–3 秒', feat: '4–11 秒', end: '12–15 秒' },
      segs: [
        { t: '0–3 秒', what: '物品特寫或有趣動作', aim: '抓住注意', sec: 3, line: 'open', c: 0 },
        { t: '3–12 秒', what: '核心特色：人物使用或移動物品', aim: '呈現特色', sec: 9, line: 'feat', c: 2 },
        { t: '12–15 秒', what: '物品全景＋收尾標語', aim: '留下記憶', sec: 3, line: 'end', c: 4 }],
      shots: [5, 7], per: [2, 3], tot: [13, 17], len: [13, 17], allFeats: false, beat: 12,
      start: [0, 1, 1, 1, 2], angles: ['特寫', '特寫', '中景', '低角度', '遠景'] }
  };
  function ver() { return extra('W1').ver === 15 ? 15 : 30; }
  function V() { return VERS[ver()]; }
  // 換版本時，鏡頭清單的時段跟著對應過去（30 秒的五段 ↔ 15 秒的三段）
  var SEG_MAP = { '30>15': [0, 1, 1, 1, 2], '15>30': [0, 2, 4] };
  function setVer(v) {
    var old = ver(); if (old === v) return;
    var m = SEG_MAP[old + '>' + v], fix = function (list) { return (list || []).map(function (x) { return Object.assign({}, x, { seg: m[+x.seg] != null ? m[+x.seg] : 0 }); }); };
    var d = null; try { d = JSON.parse(STORE.draft('media-shots') || 'null'); } catch (e) {}
    if (d) STORE.draft('media-shots', JSON.stringify(fix(d)));
    if (extra('W3').shots) STORE.saveLevel(MOD, 'W3', { extra: { shots: fix(extra('W3').shots) } });
    STORE.saveLevel(MOD, 'W1', { extra: { ver: v } });
  }
  function vtext(t) { return String(t || '').replace(/30 秒/g, V().short).replace(/2～4 秒/g, V().per.join('～') + ' 秒').replace(/8～12 個/g, V().shots.join('～') + ' 個').replace(/五個時段/g, V().segs.length === 3 ? '三個時段' : '五個時段'); }
  function verHTML() {
    return '<div class="verbar mt2" role="radiogroup" aria-label="影片長度"><b class="small">⏱️ 我要拍：</b>' + [30, 15].map(function (v) {
      return '<button type="button" class="btn sm ver' + (ver() === v ? ' on' : '') + '" data-ver="' + v + '" role="radio" aria-checked="' + (ver() === v) + '">' + VERS[v].name + '</button>';
    }).join('') + '<span class="tiny soft">' + (ver() === 15 ? '15 秒：三句話照寫、5～7 個鏡頭，拍完剪完比較快；完成後可以再挑戰 30 秒。' : '30 秒：8～12 個鏡頭，特色可以拍得更完整。時間不夠可以先做 15 秒版。') + '</span></div>';
  }

  /* ── 🆘 沒想法也能開始：網站自己的鷹架（不經過 AI）──
     W1 引導問題＋反差句型 → 特色候選；W2 句型填空（自動帶入主角、特色）；W3 鏡頭食譜（依特色類型產生草稿，每一鏡都要改成自己的）。 */
  var SPARK = [
    { q: '① 它平常在哪裡？', ph: '例：教室、書包裡、玄關' },
    { q: '② 誰會用？什麼時候用？', ph: '例：下雨天上學的我' },
    { q: '③ 用它的時候，手會做什麼動作？', ph: '例：一按就打開', cand: 1 },
    { q: '④ 摸起來、看起來怎麼樣？', ph: '例：傘面滑滑的、有小碎花', cand: 1 },
    { q: '⑤ 它可以變形、收起來或疊起來嗎？', ph: '例：收起來只剩手掌長', cand: 1 },
    { q: '⑥ 和同類的東西比，它哪裡不一樣？', ph: '例：比一般的傘輕很多', cand: 1 }
  ];
  var TPL = {   // {obj} 主角、{core} 核心特色、{usual} 大家通常覺得它；＿＿ 要自己填
    open: ['你以為它只是一個{obj}？', '每天都看到的{obj}，你真的認識它嗎？', '{usual}？那是你還沒看過這一面。'],
    feat: ['一＿＿，就＿＿。', '原來{obj}也可以＿＿。', '{core}，就是它的秘密。'],
    end: ['{obj}，不只是{obj}。', '＿＿，從{obj}開始。', '平凡的{obj}，不平凡。']
  };
  function tplFill(t, w1) { return t.replace(/\{obj\}/g, w1.obj || '它').replace(/\{core\}/g, coreFeat(w1) || '＿＿').replace(/\{usual\}/g, w1.usual || '很普通'); }
  var FT = ['動作型', '材質型', '變化型', '外觀型', '情境型'];
  function guessType(f) {
    f = f || '';
    if (/收|疊|摺|折|變|伸縮|展開|拆|組/.test(f)) return 2;
    if (/提|按|轉|推|拉|倒|拿|揮|扣|單手|一按|甩|撐/.test(f)) return 0;
    if (/軟|硬|滑|紋|材質|摸|透明|亮|粗|細|觸感|輕|重/.test(f)) return 1;
    if (/色|圖案|款式|花|造型|樣式|可愛|印/.test(f)) return 3;
    return 4;
  }
  var RECIPE = [   // 每一型三個拍法：[拍什麼, 角度]；{f} 帶入特色
    [['手做出「{f}」那一下的特寫', '特寫'], ['拉遠一點：人做出「{f}」的整個動作', '中景'], ['同一個動作換低角度再拍一次', '低角度']],
    [['手指慢慢滑過表面，拍出「{f}」', '特寫'], ['光從側面照，讓「{f}」看得更清楚', '特寫'], ['一邊摸一邊把鏡頭拉遠', '中景']],
    [['變化前的樣子，準備「{f}」', '中景'], ['「{f}」的過程，用低角度拍', '低角度'], ['變化後的樣子，和變化前放在一起比', '中景']],
    [['把不同顏色或款式排成一排，拍出「{f}」', '俯拍'], ['一個一個換，快速切換「{f}」', '特寫'], ['拿起最喜歡的那一個', '中景']],
    [['在真的會用到它的地方，拍出「{f}」', '遠景'], ['跟著人帶它走，呈現「{f}」', '跟拍'], ['用的人開心的樣子（拍手和動作就好）', '中景']]
  ];

  /* ── 步驟 1 決定主題：拍主角照片，和 AI 討論特色 ── */
  var FEEL = ['驚喜', '溫暖', '好笑', '帥氣', '安心', '療癒', '懷念'];
  function thumb(file, cb) {           // 照片縮成 360px 的小圖（只存在自己的瀏覽器／學習紀錄）
    var r = new FileReader();
    r.onload = function () {
      var img = new Image();
      img.onload = function () {
        var k = Math.min(1, 360 / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        cb(c.toDataURL('image/jpeg', 0.7));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  }
  function topicStep(body) {
    var ex = extra('W1'), f = ex.feats || ['', '', ''], photo = ex.photo || '', sp = ex.spark || [], ct = ex.contrast || ['', ''];
    body.innerHTML = '<details class="mb1"><summary class="small bold">💡 想不到要拍什麼？先請 AI 給點子</summary>' + promptBox('w1-idea', '先自己想 1 個，再把這段話給 AI：') + '</details>' +
      '<details class="spark mb1" id="w1-spark"' + (ex.obj && (ex.feats || []).every(Boolean) ? '' : ' open') + '><summary class="small bold">🆘 完全沒想法？從手上的物品開始想（不用 AI 也可以）</summary>' +
      '<p class="tiny soft mt1">把物品拿在手上，一題一題回答。③～⑥ 的答案會變成「特色候選」，點一下就放進下面的特色。</p><div class="grid g2 mt1">' +
      SPARK.map(function (q, i) { return '<label class="field">' + q.q + '<input class="input" id="sp-' + i + '" maxlength="20" value="' + esc(sp[i] || '') + '" placeholder="' + esc(q.ph) + '"></label>'; }).join('') + '</div>' +
      '<div class="mt1" id="sp-cands"></div>' +
      '<p class="small bold mt2">🔄 反差句型：大家以為它＿＿，其實它＿＿</p><div class="row sp-row"><span class="small">大家以為它</span><input class="input" id="sp-a" maxlength="12" value="' + esc(ct[0]) + '" placeholder="很普通、很無聊">' +
      '<span class="small">，其實它</span><input class="input" id="sp-b" maxlength="20" value="' + esc(ct[1]) + '" placeholder="單手就能撐開"><button type="button" class="btn sm" id="sp-use">⬇ 放進下面</button></div>' +
      '<p class="tiny soft mt1">反差就是廣告的核心：觀眾以為它很普通，你讓他發現「其實它…」。還是想不到？到「📺 看示範」看別人怎麼把一張凳子拍得很特別。</p></details>' +
      '<div class="grid g2 mt2"><div>' +
      '<label class="field">🎯 主角是（一項物品）<input class="input" id="w1-obj" maxlength="10" value="' + esc(ex.obj || '') + '" placeholder="例：塑膠椅、水壺、雨傘、書包"></label>' +
      '<p class="tiny soft mt1">好主角：容易取得、可以從不同角度拍（上面、側面、特寫、有人在用）。</p>' +
      '<label class="field mt2">📷 主角照片（選填，拍好可以給 AI 看）<input class="input" type="file" id="w1-photo" accept="image/*" capture="environment"></label>' +
      '<p class="tiny mt1" style="color:var(--bad)">⚠️ 照片裡不要有人臉、名牌、學號或學校名稱。</p></div>' +
      '<div class="center" id="w1-prev">' + (photo ? '<img src="' + photo + '" alt="主角照片" style="max-width:100%;max-height:220px;border-radius:.8rem">' : '<p class="tiny soft">（還沒有照片）</p>') + '</div></div>' +
      '<p class="bold mt3">🤖 和 AI 討論：這個主角有什麼「拍得出來」的特色？</p>' +
      promptBox('w1-prompt', '把照片和這段話一起給 AI（在 ' + AIT.name + ' 先按「＋」上傳照片，再貼上這段話）：') +
      '<label class="field mt2">AI 找到的特色（貼上來，選填）<textarea class="input" id="w1-ai" rows="4" placeholder="把 AI 的回答貼在這裡，方便挑選">' + esc(ex.ai || '') + '</textarea></label>' +
      '<p class="bold mt3">✅ 我決定的 3 個特色（看得見、拍得出來），圈出最重要的「核心特色」</p><div class="stack mt1">' + [0, 1, 2].map(function (i) {
        return '<div class="row" style="flex-wrap:nowrap"><input type="radio" name="w1-core" value="' + i + '"' + (ex.core === i ? ' checked' : '') + ' aria-label="第 ' + (i + 1) + ' 個是核心特色" style="width:1.2rem;height:1.2rem">' +
          '<input class="input" id="w1-f' + i + '" maxlength="20" value="' + esc(f[i] || '') + '" placeholder="' + ['例：輕巧、單手就能提', '例：可以疊起來收', '例：有很多顏色'][i] + '" style="margin-top:0"></div>';
      }).join('') + '</div><p class="tiny soft mt1">左邊圓圈選「核心特色」—— ' + V().short + '只講清楚一個重點，其他兩個當配角。</p>' +
      '<div class="grid g3 mt2">' +
      '<label class="field">大家通常覺得它…<input class="input" id="w1-usual" maxlength="20" value="' + esc(ex.usual || '') + '" placeholder="例：很普通"></label>' +
      '<label class="field">👥 想給誰看？<input class="input" id="w1-who" maxlength="12" value="' + esc(ex.who || '') + '" placeholder="例：同學、爸媽"></label>' +
      '<label class="field">看完的感受（選一種）' + sel('w1-feel', FEEL, ex.feel || '驚喜') + '</label></div>' +
      '<div class="note small mt2" id="w1-pre"></div>' +
      '<div class="row mt2"><button class="btn go" id="w1-sv">💾 儲存</button></div><div id="w1-msg" class="mt1"></div>';
    function core() { var r = document.querySelector('input[name=w1-core]:checked'); return r ? +r.value : -1; }
    document.getElementById('w1-idea').textContent = '我是國中生，要用手機拍一支 ' + V().short + '廣告，主角是一樣在教室或家裡很容易拿到的普通物品。請給我 8 個主角點子，每個用一句話說明：大家通常覺得它怎樣、廣告可以讓人發現它什麼（要拍得出來、不要誇大）。';
    function upd() {
      document.getElementById('w1-prompt').textContent = '（附上照片）這是我要拍 ' + V().short + '廣告的主角：' + (val('w1-obj') || '＿＿') +
        '。請從外觀、材質、用法、使用情境，幫我找出 5 個「用手機就拍得出來」的特色，每個特色用一句話說明可以怎麼拍。請用國中生看得懂的話，不要誇大。';
      var c = core(), cf = c >= 0 ? val('w1-f' + c) : '';
      document.getElementById('w1-pre').innerHTML = '📝 主角是 <b>' + esc(val('w1-obj') || '＿＿') + '</b>；大家通常覺得它 <b>' + esc(val('w1-usual') || '＿＿') +
        '</b>；我想讓 <b>' + esc(val('w1-who') || '＿＿') + '</b> 發現它 <b>' + esc(cf || '＿＿') + '</b>，看完覺得 <b>' + esc(val('w1-feel')) + '</b>。';
    }
    body.querySelectorAll('input:not([type=file]),select,textarea').forEach(function (e) { e.addEventListener('input', upd); e.addEventListener('change', upd); });
    document.getElementById('w1-photo').onchange = function () {
      var fl = this.files && this.files[0]; if (!fl) return;
      thumb(fl, function (u) { photo = u; document.getElementById('w1-prev').innerHTML = '<img src="' + u + '" alt="主角照片" style="max-width:100%;max-height:220px;border-radius:.8rem">'; });
    };
    function firstEmptyFeat(t) {
      for (var i = 0; i < 3; i++) { var e = document.getElementById('w1-f' + i); if (!e.value.trim()) { e.value = t; upd(); e.focus(); return true; } }
      return false;
    }
    function cands() {
      var list = SPARK.map(function (q, i) { return q.cand ? val('sp-' + i) : ''; }).concat([val('sp-b')]).filter(function (x) { return len(x) >= 2; });
      document.getElementById('sp-cands').innerHTML = list.length ? '<span class="tiny bold">✨ 特色候選（點一下放進特色）：</span>' + list.map(function (c) { return '<button type="button" class="chip sp-c">' + esc(c) + '</button>'; }).join(' ') : '';
      body.querySelectorAll('.sp-c').forEach(function (b) { b.onclick = function () { if (!firstEmptyFeat(b.textContent)) UI.toast('三個特色都填了；想換就先清掉一格'); }; });
    }
    body.querySelectorAll('#w1-spark input').forEach(function (e) { e.addEventListener('input', cands); });
    document.getElementById('sp-use').onclick = function () {
      if (val('sp-a')) { document.getElementById('w1-usual').value = val('sp-a'); }
      if (val('sp-b')) firstEmptyFeat(val('sp-b'));
      upd();
    };
    cands(); upd(); wireCopy(body);
    document.getElementById('w1-sv').onclick = function () {
      var v = { obj: val('w1-obj'), photo: photo, ai: val('w1-ai'), feats: [val('w1-f0'), val('w1-f1'), val('w1-f2')], core: core(),
        usual: val('w1-usual'), who: val('w1-who'), feel: val('w1-feel'), ver: ver(),
        spark: SPARK.map(function (_, i) { return val('sp-' + i); }), contrast: [val('sp-a'), val('sp-b')] }, miss = [];
      if (!v.obj) miss.push('主角');
      if (v.feats.some(function (x) { return len(x) < 2; })) miss.push('3 個特色');
      if (v.core < 0) miss.push('圈出核心特色');
      if (len(v.usual) < 2) miss.push('大家通常覺得它');
      if (!v.who) miss.push('想給誰看');
      save('W1', v, !miss.length);
      msgBox(document.getElementById('w1-msg'), !miss.length, '✅ 主題決定了！下一步：和 AI 一起想三句文案。', miss);
      if (!miss.length) next();
    };
  }
  function coreFeat(w1) { w1 = w1 || extra('W1'); return (w1.feats || [])[w1.core] || ''; }

  /* ── 步驟 2 三句文案：開場句、特色句、收尾標語（和 AI 來回討論，自己決定） ── */
  var LINES = [
    { k: 'open', name: '開場句', at: '0–3 秒', aim: '讓人想看下去：問句、反差或一個動作', max: 15, ph: '例：你以為它只是一張椅子？' },
    { k: 'feat', name: '特色句', at: '8–18 秒', aim: '說出核心特色，而且畫面拍得出來', max: 15, ph: '例：單手一提，想去哪就去哪' },
    { k: 'end', name: '收尾標語', at: '25–30 秒', aim: '最短、最好記，影片最後出現', max: 12, ph: '例：想坐哪裡，就坐哪裡' }
  ];
  var TONE = ['溫暖', '幽默', '酷', '優雅', '活潑', '感性'];
  var HYPE = /最|第一|唯一|100%|百分之百|保證|永遠|全世界|世界級|無敵|神級|絕對/;
  function copyStep(body) {
    var ex = extra('W2'), w1 = extra('W1'), L = ex.lines || {};
    body.innerHTML = (done('W1') ? '' : '<div class="note warn small">先完成步驟 1「決定主題」，這裡會自動帶入主角、特色和觀眾。</div>') +
      '<div class="note small">🎬 一支 ' + V().short + '廣告只要 <b>三句話</b>，各有任務：<br>' + LINES.map(function (l) { return '<b>' + l.name + '</b>（' + V().at[l.k] + '）' + esc(l.aim); }).join('<br>') + '</div>' +
      '<div class="note small mt1">🤖 還沒闖 <a href="#" id="w2-ai">AI 前導關</a>？先看看 AI 會在哪裡出錯。AI 給的是<b>草稿</b>，最後由你決定。</div>' +
      '<p class="bold mt3">① 先自己想，再請 AI 發想</p>' +
      '<label class="field mt1">🧠 問 AI 之前，我自己先想的一句<input class="input" id="w2-mine" maxlength="24" value="' + esc(ex.mine || '') + '" placeholder="例：椅子也想去旅行"></label>' +
      '<div class="tpl mt1"><span class="tiny bold">🆘 沒想法？挑一個句型，把＿＿改成你的字：</span>' + TPL.open.concat(TPL.feat.slice(0, 2)).map(function (t) { return '<button type="button" class="chip tpl-b" data-to="w2-mine">' + esc(tplFill(t, w1)) + '</button>'; }).join('') + '</div>' +
      '<div class="grid g2 mt1"><label class="field">語氣' + sel('w2-tone', TONE, ex.tone || '溫暖') + '</label>' +
      '<label class="field">用了哪個 AI 工具？（沒用就寫「沒有用 AI」）<input class="input" id="w2-tool" maxlength="20" value="' + esc(ex.tool || AIT.name) + '" placeholder="例：' + esc(AIT.name) + '"></label></div>' +
      promptBox('w2-pa', '提示詞 A：發想') +
      '<label class="field mt2">AI 給的選項（貼上來，選填）<textarea class="input" id="w2-cands" rows="4">' + esc(ex.cands || '') + '</textarea></label>' +
      '<p class="bold mt3">② 選出三句，寫在下面（可以改、可以混搭）</p><div class="stack mt1">' + LINES.map(function (l) {
        return '<label class="field">' + l.name + '（' + V().at[l.k] + '）<span class="cnt" id="w2-c-' + l.k + '"></span><input class="input" id="w2-' + l.k + '" maxlength="24" value="' + esc(L[l.k] || '') + '" placeholder="' + esc(l.ph) + '"></label>' +
          '<div class="tpl"><span class="tiny soft">句型：</span>' + TPL[l.k].map(function (t) { return '<button type="button" class="chip tpl-b" data-to="w2-' + l.k + '">' + esc(tplFill(t, w1)) + '</button>'; }).join('') + '</div>';
      }).join('') + '</div><div id="w2-hype" class="mt1"></div>' +
      promptBox('w2-pb', '提示詞 B：請 AI 幫你檢查（選好三句後再用）') +
      '<p class="bold mt3">③ 自己做最後決定</p>' +
      '<label class="field">我改了什麼？為什麼？<input class="input" id="w2-edit" maxlength="40" value="' + esc(ex.edit || '') + '" placeholder="例：AI 寫「全世界最輕」，太誇張，改成畫面拍得出的「單手一提」"></label>' +
      '<label class="field mt1">三句話要怎麼出現？' + sel('w2-mode', ['字幕', '旁白', '字幕＋旁白'], ex.mode || '字幕') + '</label>' +
      '<div class="row mt2"><button class="btn go" id="w2-sv">💾 儲存三句文案</button></div><div id="w2-msg" class="mt1"></div>';
    function lines() { var o = {}; LINES.forEach(function (l) { o[l.k] = val('w2-' + l.k); }); return o; }
    function upd() {
      var fs = (w1.feats || []).filter(Boolean);
      document.getElementById('w2-pa').textContent = '我要拍一支 ' + V().short + '廣告。主角：' + (w1.obj || '＿＿') + '；觀眾：' + (w1.who || '＿＿') +
        '；核心特色：' + (coreFeat(w1) || '＿＿') + '（其他特色：' + (fs.filter(function (x) { return x !== coreFeat(w1); }).join('、') || '＿＿') + '）；想讓觀眾覺得：' + (w1.feel || '＿＿') + '；語氣：' + val('w2-tone') +
        '。' + (val('w2-mine') ? '我自己想到的是「' + val('w2-mine') + '」，可以參考。' : '') + '請寫三種句子，每種 3 個選項：1. 開場句（讓人想看下去，可以用問句或反差）2. 特色句（說出核心特色，要拍得出來）3. 收尾標語（12 字以內，好記）。每句不超過 15 字，不要誇大，不要用「最」「第一」「保證」。';
      var o = lines();
      document.getElementById('w2-pb').textContent = '這是我選的三句：開場「' + (o.open || '＿＿') + '」、特色「' + (o.feat || '＿＿') + '」、收尾「' + (o.end || '＿＿') +
        '」。主角是' + (w1.obj || '＿＿') + '，觀眾是' + (w1.who || '＿＿') + '。請幫我檢查：有沒有誇大或不實？三句連起來順不順？有沒有更口語、更像國中生會說的說法？請給建議，不要直接幫我全部改掉。';
      var hy = [];
      LINES.forEach(function (l) {
        var n = len(o[l.k]), c = document.getElementById('w2-c-' + l.k);
        c.textContent = n + ' / ' + l.max + ' 字'; c.className = 'cnt ' + (n === 0 ? '' : n <= l.max ? 'ok' : 'bad');
        var m = o[l.k].match(HYPE); if (m) hy.push(l.name + '的「' + m[0] + '」');
      });
      document.getElementById('w2-hype').innerHTML = hy.length ? '<div class="note warn small">' + esc(hy.join('、')) + ' 聽起來有點誇大，畫面真的拍得出來嗎？可以換個說法。</div>' : '';
    }
    body.querySelectorAll('input,select,textarea').forEach(function (e) { e.addEventListener('input', upd); e.addEventListener('change', upd); });
    body.querySelectorAll('.tpl-b').forEach(function (b) {
      b.onclick = function () {
        var e = document.getElementById(b.dataset.to); e.value = b.textContent; upd(); e.focus();
        var k = e.value.indexOf('＿＿'); if (k >= 0) e.setSelectionRange(k, k + 2);   // 直接選到要自己填的地方
      };
    });
    upd(); wireCopy(body);
    document.getElementById('w2-ai').onclick = function (e) { e.preventDefault(); clearHash(); tab('ai'); };
    document.getElementById('w2-sv').onclick = function () {
      var v = { mine: val('w2-mine'), tone: val('w2-tone'), tool: val('w2-tool'), cands: val('w2-cands'), lines: lines(), edit: val('w2-edit'), mode: val('w2-mode') }, miss = [];
      if (len(v.mine) < 2) miss.push('自己先想的一句');
      if (/＿/.test(v.mine) || LINES.some(function (l) { return /＿/.test(v.lines[l.k]); })) miss.push('把句型裡的＿＿換成你自己的字');
      if (!v.tool) miss.push('用了哪個 AI 工具');
      LINES.forEach(function (l) { var n = len(v.lines[l.k]); if (!n || n > l.max) miss.push(l.name + '（1～' + l.max + ' 字）'); });
      if (len(v.edit) < 4) miss.push('我改了什麼');
      if (!done('W1')) miss.push('先完成步驟 1');
      save('W2', v, !miss.length);
      msgBox(document.getElementById('w2-msg'), !miss.length, '✅ 三句文案完成！收尾標語：「' + esc(v.lines.end) + '」。下一步：依特色決定拍攝重點。', miss);
      if (!miss.length) next();
    };
  }

  /* ── 步驟 3 依特色決定拍攝重點：鏡頭清單＋實拍檢核 ── */
  var ANGLE = ['特寫', '中景', '遠景', '低角度', '俯拍', '跟拍'];
  function shots() {
    var d = null; try { d = JSON.parse(STORE.draft('media-shots') || 'null'); } catch (e) {}
    var fe = V().segs.map(function (g) { return g.line === 'feat'; });
    return d || extra('W3').shots || V().start.map(function (g, i) {
      return { seg: g, what: '', angle: V().angles[i], sec: 3, feat: fe[g] ? 0 : 3 };
    });
  }
  /* 🍳 鏡頭食譜：依版本和特色類型排一份草稿（tpl 記下原文，沒改過的不算完成） */
  function recipeShots(w1, ftypes) {
    var core = w1.core >= 0 ? w1.core : 0, oth = [0, 1, 2].filter(function (k) { return k !== core; }), obj = w1.obj || '主角';
    function fName(k) { return (w1.feats || [])[k] || '特色 ' + (k + 1); }
    function R(k, j) { var r = RECIPE[ftypes[k] != null ? ftypes[k] : guessType(fName(k))][j]; return [r[0].replace(/\{f\}/g, fName(k)), r[1]]; }
    function S(seg, wa, sec, feat) { return { seg: seg, what: wa[0], tpl: wa[0], angle: wa[1], sec: sec, feat: feat }; }
    var open = [obj + '最特別的一個細節，鏡頭慢慢拉近', '特寫'], end = [obj + '全景＋收尾標語（標語停 2 秒以上）', '遠景'];
    if (ver() === 15) return [S(0, open, 3, 3), S(1, R(core, 0), 3, core), S(1, R(core, 1), 3, core), S(1, R(oth[0], 0), 2, oth[0]), S(2, end, 3, 3)];
    return [S(0, open, 3, 3), S(1, R(oth[0], 0), 3, oth[0]), S(1, [obj + '的整體外形，從側面慢慢繞一圈', '中景'], 2, 3),
      S(2, R(core, 0), 3, core), S(2, R(core, 1), 4, core), S(2, R(core, 2), 3, core),
      S(3, R(oth[1], 0), 3, oth[1]), S(3, [RECIPE[4][0][0].replace('{f}', '平常用它的樣子'), '遠景'], 4, 3), S(4, end, 4, 3)];
  }
  function sumSec(sh) { return sh.reduce(function (a, x) { return a + (+x.sec || 0); }, 0); }
  function shotStep(body, s) {
    var VV = V(), SEGS = VV.segs, CHK = s.checks.map(vtext);
    var ftypes = (extra('W3').ftypes || []).slice();
    var sh = shots(), w1 = extra('W1'), w2l = extra('W2').lines || {}, ex = extra('W3'), st = ex.checks || [], listOk = !!ex.listOk;
    var feats = (w1.feats || ['特色 1', '特色 2', '特色 3']).map(function (x, i) { return (i === w1.core ? '⭐ ' : '') + (x || '特色 ' + (i + 1)); }).concat(['氣氛／情境']);
    function finish() {
      var ok = listOk && allChecked(CHK, st);
      save('W3', Object.assign({ shots: sh, listOk: listOk, checks: st, ftypes: ftypes }, document.getElementById('w3-ait') ? aiVals('w3') : { aiText: ex.aiText, aiUse: ex.aiUse }), ok);
      return ok;
    }
    function draw() {
      var tot = sumSec(sh), per = SEGS.map(function (_, g) { return sumSec(sh.filter(function (x) { return +x.seg === g; })); });
      var cl = checkList('shoot', CHK, st);
      body.innerHTML = '<div id="print-area"><p class="bold">' + VV.short + '廣告 · 拍攝重點　<span class="small soft">主角：' + esc(w1.obj || '＿＿') + '　核心特色：' + esc(coreFeat(w1) || '＿＿') + '　' +
        esc((STORE.me() || {}).cls || '') + ' 班 ' + esc((STORE.me() || {}).seat || '') + ' 號 ' + esc((STORE.me() || {}).name || '') + '</span></p>' +
        '<div class="tl mt1">' + SEGS.map(function (g, i) {
          return '<div class="s' + g.c + '" style="flex:' + g.sec + '">' + esc(g.t) + '<span class="n">' + esc(g.aim) + '・已排 ' + per[i] + ' 秒</span></div>';
        }).join('') + '</div>' +
        '<div class="scroll-x mt1"><table class="t small"><tr><th>時段</th><th>拍攝內容</th><th>這時候出現的句子</th></tr>' + SEGS.map(function (g, i) {
          return '<tr><td class="s' + g.c + '">' + esc(g.t) + '</td><td>' + esc(g.what) + '</td><td>' + (g.line ? '「' + esc(w2l[g.line] || '＿＿') + '」' : '<span class="soft">（畫面說話）</span>') + '</td></tr>'; }).join('') + '</table></div>' +
        '<details class="spark mt2 no-print" id="w3-rc"' + (sh.some(function (x) { return len(x.what) >= 2; }) ? '' : ' open') + '><summary class="small bold">🆘 不知道怎麼拍？用「鏡頭食譜」排一份草稿</summary>' +
        '<p class="tiny soft mt1">先確認每個特色是哪一種（網站先幫你猜了），食譜會依類型給拍法。產生之後，<b>每一個鏡頭都要改成你真的要拍的畫面</b>（在哪裡拍、拍誰的手、怎麼動）。</p>' +
        '<div class="stack mt1">' + [0, 1, 2].map(function (k) {
          var ft = ftypes[k] != null ? ftypes[k] : guessType((w1.feats || [])[k]);
          return '<label class="row small" style="flex-wrap:nowrap"><b style="min-width:9rem">' + esc(feats[k]) + '</b><select class="input" data-ft="' + k + '" style="max-width:9rem;margin:0">' +
            FT.map(function (t, j) { return '<option value="' + j + '"' + (ft === j ? ' selected' : '') + '>' + t + '</option>'; }).join('') + '</select></label>';
        }).join('') + '</div><div class="row mt1"><button type="button" class="btn" id="w3-recipe">🍳 產生鏡頭草稿</button><span class="tiny soft">動作型：拍手的動作；材質型：拍表面；變化型：拍前後對比；外觀型：拍顏色款式；情境型：拍用它的地方</span></div></details>' +
        '<div class="stack mt2">' + sh.map(function (x, i) {
          return '<div class="shotrow' + (x.tpl && x.what === x.tpl ? ' tplrow' : '') + '"><div class="no">#' + (i + 1) + '</div>' +
            '<label class="tiny bold">時段<select class="input" data-k="seg" data-i="' + i + '">' + SEGS.map(function (g, k) { return '<option value="' + k + '"' + (+x.seg === k ? ' selected' : '') + '>' + g.t + '</option>'; }).join('') + '</select></label>' +
            '<label class="tiny bold what">拍什麼<input class="input" data-k="what" data-i="' + i + '" value="' + esc(x.what) + '" placeholder="例：手指滑過椅面的紋路"></label>' +
            '<label class="tiny bold">拍出哪個特色<select class="input" data-k="feat" data-i="' + i + '">' + feats.map(function (f, k) { return '<option value="' + k + '"' + (+x.feat === k ? ' selected' : '') + '>' + esc(f) + '</option>'; }).join('') + '</select></label>' +
            '<label class="tiny bold">角度<select class="input" data-k="angle" data-i="' + i + '">' + ANGLE.map(function (a) { return '<option' + (a === x.angle ? ' selected' : '') + '>' + a + '</option>'; }).join('') + '</select></label>' +
            '<label class="tiny bold">秒數<input class="input" type="number" min="1" max="8" data-k="sec" data-i="' + i + '" value="' + esc(x.sec) + '"></label>' +
            (sh.length > 1 ? '<button class="btn sm no-print" data-del="' + i + '" aria-label="刪除第 ' + (i + 1) + ' 個鏡頭">✕</button>' : '<span></span>') + '</div>';
        }).join('') + '</div></div>' +
        '<div class="no-print">' + promptBox('w3-p', '🤖 請 AI 建議鏡頭（先自己想一兩個鏡頭再問）') + aiRec('w3', ex) + '</div>' +
        '<div class="row mt2 no-print">' + (sh.length < VV.shots[1] ? '<button class="btn" id="add">＋ 新增鏡頭</button>' : '') +
        '<span class="bold">共 ' + sh.length + ' 個鏡頭・總長 <span' + (tot < VV.tot[0] || tot > VV.tot[1] ? ' style="color:var(--bad)"' : '') + '>' + tot + ' 秒</span></span><span class="tiny soft">（' + VV.shots.join('～') + ' 個鏡頭、約 ' + VV.short + '）</span></div>' +
        '<div class="row mt2 no-print"><button class="btn go" id="sv">💾 儲存鏡頭清單</button><button class="btn" id="pr">🖨️ 列印／存成 PDF</button></div><div id="msg" class="mt1"></div>' +
        '<div class="no-print"><p class="bold mt3">🎥 實拍檢核（照鏡頭清單拍，拍完一項勾一項）</p><div class="mt1" id="shoot">' + cl.html + '</div><div id="cmsg" class="mt1"></div></div>';
      body.querySelectorAll('[data-k]').forEach(function (el) {
        var k = el.dataset.k;
        el.oninput = function () { sh[+el.dataset.i][k] = (k === 'sec' || k === 'seg' || k === 'feat') ? (+el.value || 0) : el.value; STORE.draft('media-shots', JSON.stringify(sh)); };
        if (k !== 'what') el.onchange = function () { el.oninput(); draw(); };   // 換選項才重畫（打字時不重畫，游標才不會跳掉）
      });
      body.querySelectorAll('[data-del]').forEach(function (b) { b.onclick = function () { sh.splice(+b.dataset.del, 1); STORE.draft('media-shots', JSON.stringify(sh)); draw(); }; });
      body.querySelectorAll('[data-ft]').forEach(function (e) { e.onchange = function () { ftypes[+e.dataset.ft] = +e.value; }; });
      document.getElementById('w3-recipe').onclick = function () {
        if (sh.some(function (x) { return len(x.what) >= 2 && x.what !== x.tpl; }) && !confirm('會用草稿蓋掉目前寫好的鏡頭，確定嗎？')) return;
        [0, 1, 2].forEach(function (k) { if (ftypes[k] == null) ftypes[k] = +body.querySelector('[data-ft="' + k + '"]').value; });
        sh = recipeShots(w1, ftypes); STORE.draft('media-shots', JSON.stringify(sh)); draw();
        document.getElementById('msg').innerHTML = '<div class="note warn small">🍳 草稿排好了（黃色的是食譜原文）。一格一格改成你真的要拍的畫面，再按「儲存鏡頭清單」。</div>';
      };
      var add = document.getElementById('add'); if (add) add.onclick = function () { sh.push({ seg: SEGS.map(function (g) { return g.line; }).indexOf('feat'), what: '', angle: '中景', sec: 3, feat: 3 }); STORE.draft('media-shots', JSON.stringify(sh)); draw(); };
      document.getElementById('pr').onclick = function () { window.print(); };
      document.getElementById('w3-p').textContent = '我要用手機拍 ' + VV.short + '廣告。主角：' + (w1.obj || '＿＿') + '；核心特色：' + (coreFeat(w1) || '＿＿') + '；其他特色：' +
        ((w1.feats || []).filter(function (x, k) { return k !== w1.core && x; }).join('、') || '＿＿') + '；三句話：開場「' + (w2l.open || '＿＿') + '」、特色「' + (w2l.feat || '＿＿') + '」、收尾「' + (w2l.end || '＿＿') +
        '」。請依' + (SEGS.length === 3 ? '三' : '五') + '個時段（' + SEGS.map(function (g) { return g.t + g.aim; }).join('、') + '）建議 ' + VV.shots[0] + ' 個鏡頭，每個寫：拍什麼、角度（特寫／中景／遠景／低角度）、秒數（' + VV.per.join('～') + ' 秒）。只用手機就拍得到，不需要特效。';
      wireCopy(body);
      body.querySelectorAll('#w3-ait,#w3-aiu').forEach(function (e) { e.oninput = function () { ex = Object.assign(ex, aiVals('w3')); }; });
      cl.wire(body, function () {
        var ok = finish(), n = left(CHK, st);
        document.getElementById('cmsg').innerHTML = ok ? '<div class="note ok small">✅ 拍攝重點完成！下一步：配樂。</div>' :
          '<p class="tiny soft">' + (n ? '還有 ' + n + ' 項（「挑戰」那項可以不做）' : '檢核都勾了，記得按上面的「儲存鏡頭清單」') + '</p>';
        if (ok) next();
      });
      document.getElementById('sv').onclick = function () {
        var filled = sh.filter(function (x) { return len(x.what) >= 2; }), miss = [], t = sumSec(sh);
        if (filled.length < VV.shots[0] || sh.length > VV.shots[1]) miss.push(VV.shots.join('～') + ' 個寫好內容的鏡頭（目前 ' + filled.length + ' 個）');
        SEGS.forEach(function (g, k) { if (!filled.some(function (x) { return +x.seg === k; })) miss.push(g.t + ' 至少一個鏡頭'); });
        if (filled.filter(function (x) { return +x.feat === w1.core; }).length < 2) miss.push('核心特色至少拍 2 個鏡頭');
        var raw = filled.filter(function (x) { return x.tpl && x.what === x.tpl; }).length;
        if (raw) miss.push('還有 ' + raw + ' 個鏡頭是食譜原文（黃色），改成你真的要拍的畫面');
        if (VV.allFeats) [0, 1, 2].forEach(function (k) { if (!filled.some(function (x) { return +x.feat === k; })) miss.push('「' + ((w1.feats || [])[k] || '特色 ' + (k + 1)) + '」至少一個鏡頭'); });
        else if (!filled.some(function (x) { return +x.feat !== w1.core && +x.feat < 3; })) miss.push('另外兩個特色，至少拍到其中一個');
        if (!sh.some(function (x) { return x.angle === '遠景'; })) miss.push('一個遠景');
        if (!sh.some(function (x) { return x.angle === '特寫'; })) miss.push('一個特寫');
        if (sh.some(function (x) { return x.sec < VV.per[0] || x.sec > VV.per[1]; })) miss.push('每個鏡頭 ' + VV.per.join('～') + ' 秒');
        if (t < VV.tot[0] || t > VV.tot[1]) miss.push('總長約 ' + VV.short + '（' + VV.tot.join('～') + ' 秒，目前 ' + t + ' 秒）');
        aiMiss('w3', miss);
        listOk = !miss.length;
        var ok = finish();
        msgBox(document.getElementById('msg'), listOk, ok ? '✅ 拍攝重點完成！下一步：配樂。' : '✅ 鏡頭清單 OK！印出來帶去拍，拍完把下面的實拍檢核勾完。', miss);
        if (ok) next();
      };
    }
    draw();
  }

  /* ── 步驟 4 配樂：依感受選音樂、確認授權、對拍 ── */
  var MOOD = { '驚喜': '節奏輕快，轉折處加「叮」的音效', '溫暖': '木吉他、鋼琴，速度中慢', '好笑': '俏皮、一跳一跳的節奏', '帥氣': '電子節拍、重低音',
    '安心': '慢板、柔和的弦樂', '療癒': 'Lo-fi、輕柔的節奏', '懷念': '復古、有一點雜訊的老歌感' };
  var SRC = ['剪輯軟體內建音樂', 'YouTube 音效庫', '創用 CC 音樂網站', '自己錄製或演奏', 'AI 生成音樂'];
  var LIC = ['可免費使用（照網站規定）', '創用 CC：要標示作者', '自己創作', '不確定'];
  function musicStep(body, s) {
    var ex = extra('W4'), w1 = extra('W1'), st = ex.checks || [], CHK = s.checks.map(vtext), cl = checkList('music', CHK, st);
    body.innerHTML = (done('W1') ? '<div class="note small">🎧 你的感受是「<b>' + esc(w1.feel) + '</b>」，可以找：' + esc(MOOD[w1.feel] || '') + '。</div>' : '<div class="note warn small">先完成步驟 1，這裡會依你想要的感受推薦音樂風格。</div>') +
      promptBox('w4-p', '🤖 請 AI 推薦音樂風格和搜尋關鍵字') + aiRec('w4', ex) +
      '<p class="bold mt3">① 選一首音樂（到合法的音樂庫找）</p><div class="grid g2 mt1">' +
      '<label class="field">曲名<input class="input" id="w4-name" maxlength="30" value="' + esc(ex.name || '') + '"></label>' +
      '<label class="field">從哪裡來' + sel('w4-src', SRC, ex.src || SRC[0]) + '</label>' +
      '<label class="field">作者／網址（片尾要標示）<input class="input" id="w4-credit" maxlength="60" value="' + esc(ex.credit || '') + '" placeholder="例：Music by ○○○（網站名稱）"></label>' +
      '<label class="field">授權' + sel('w4-lic', LIC, ex.lic || LIC[0]) + '</label></div><div id="w4-tip" class="mt1"></div>' +
      '<p class="bold mt3">② 音樂和畫面對拍</p>' +
      '<label class="field">音樂的轉折或重拍，對在第幾秒？（建議對準收尾標語出現的時候）<input class="input" type="number" min="0" max="35" id="w4-beat" value="' + esc(ex.beat != null ? ex.beat : '') + '" placeholder="例：' + V().beat + '"></label>' +
      '<p class="bold mt3">③ 配樂檢核</p><div class="mt1">' + cl.html + '</div>' +
      '<div class="row mt2"><button class="btn go" id="w4-sv">💾 儲存配樂</button></div><div id="w4-msg" class="mt1"></div>';
    function tip() {
      var src = val('w4-src'), lic = val('w4-lic'), t = [];
      if (lic === '不確定') t.push('不確定授權的音樂就換一首 —— 自己拍的畫面配上侵權的音樂，整支影片就不能公開了。');
      if (src === 'YouTube 音效庫') t.push('每首的授權不一樣，看清楚是否要標示作者。');
      if (src === 'AI 生成音樂') t.push('依 AI 工具的使用條款使用，並在片尾和步驟 5 的 AI 使用聲明寫出來。');
      if (src === '創用 CC 音樂網站' && lic !== '創用 CC：要標示作者') t.push('創用 CC 通常要標示作者，授權請選「創用 CC：要標示作者」。');
      document.getElementById('w4-tip').innerHTML = t.length ? '<div class="note warn small">' + t.map(esc).join('<br>') + '</div>' : '';
    }
    document.getElementById('w4-p').textContent = '我在做一支 ' + V().short + '廣告，主角是' + (w1.obj || '＿＿') + '，想讓觀眾覺得「' + (w1.feel || '＿＿') + '」，最後一句是「' + ((extra('W2').lines || {}).end || '＿＿') +
      '」。請推薦 3 種適合的配樂風格，每種說明為什麼適合，並給我可以在剪輯軟體內建音樂或 YouTube 音效庫搜尋的關鍵字（中英文都要）。不要推薦有版權的流行歌。';
    wireCopy(body);
    ['w4-src', 'w4-lic'].forEach(function (id) { document.getElementById(id).onchange = tip; });
    tip();
    cl.wire(body, function () {});
    document.getElementById('w4-sv').onclick = function () {
      var b = val('w4-beat'), v = Object.assign({ name: val('w4-name'), src: val('w4-src'), credit: val('w4-credit'), lic: val('w4-lic'), beat: b === '' ? null : +b, checks: st }, aiVals('w4')), miss = [];
      aiMiss('w4', miss);
      if (!v.name) miss.push('曲名');
      if (len(v.credit) < 2) miss.push('作者／網址（自己做的就寫自己）');
      if (v.lic === '不確定') miss.push('授權確定可以用的音樂');
      if (v.beat == null) miss.push('對拍的秒數');
      if (!allChecked(CHK, st)) miss.push('配樂檢核（還有 ' + left(CHK, st) + ' 項）');
      save('W4', v, !miss.length);
      msgBox(document.getElementById('w4-msg'), !miss.length, '✅ 配樂完成！下一步：剪輯。', miss);
      if (!miss.length) next();
    };
  }

  /* ── 步驟 5 剪輯：剪輯檢核 → 同儕試看 → 修正 → AI 使用聲明 → 作品說明卡 ── */
  var PEER = ['前三秒，你想看下去嗎？', '看完，你知道它的特色是什麼嗎？', '你記得最後那一句標語嗎？'];
  var ANS = ['是', '有一點', '不是'];
  var FIX = ['刪去重複的畫面', '縮短文字', '加強結尾', '調整字幕或音量'];
  var AIUSE = ['找主角點子或特色', '文案發想與檢查', '鏡頭建議', '配樂建議', '修改建議', '畫面或影片生成', '沒有使用 AI'], NO_AI = 6, GEN_AI = 5;
  function usedAI() {                 // 依前面每一步的紀錄，預先勾好 AI 使用聲明（學生可以再調整）
    var w1 = extra('W1'), w2 = extra('W2'), u = [];
    if (w1.ai) u.push(0);
    if (w2.tool && !/沒有/.test(w2.tool)) u.push(1);
    if (extra('W3').aiText) u.push(2);
    if (extra('W4').aiText || extra('W4').src === 'AI 生成音樂') u.push(3);
    if (extra('W5').aiText) u.push(4);
    return u;
  }
  function editStep(body, s) {
    var ex = extra('W5'), w1 = extra('W1'), w2 = extra('W2'), w4 = extra('W4'), me = STORE.me() || {}, st = ex.checks || [], VV = V(), CHK = s.checks.map(vtext), cl = checkList('edit', CHK, st);
    function checks(name, list, on) { return list.map(function (t, i) { return '<label class="chk"><input type="checkbox" name="' + name + '" value="' + i + '"' + ((on || []).indexOf(i) >= 0 ? ' checked' : '') + '><span>' + esc(t) + '</span></label>'; }).join(''); }
    body.innerHTML = '<p class="bold">① 剪輯</p><div class="grid g3 mt1">' +
      '<label class="field">剪輯軟體' + sel('w5-app', ['Shotcut', '剪映', 'iMovie', '其他'], ex.app || 'Shotcut') + '</label>' +
      '<label class="field">影片長度（秒）<input class="input" type="number" id="w5-len" min="1" max="120" value="' + esc(ex.len || '') + '" placeholder="' + VV.sec + '"></label>' +
      '<label class="field">畫面比例' + sel('w5-ratio', ['16:9 橫式', '9:16 直式'], ex.ratio || '16:9 橫式') + '</label></div>' +
      '<div class="mt1">' + cl.html + '</div>' +
      '<p class="bold mt3">② 同儕試看：請一位同學看完回答</p>' +
      '<label class="field">試看的同學（座號或名字）<input class="input" id="w5-peer" maxlength="12" value="' + esc(ex.peer || '') + '"></label>' +
      '<div class="scroll-x"><table class="t rub mt1"><tr><th>問題</th>' + ANS.map(function (a) { return '<th>' + a + '</th>'; }).join('') + '</tr>' +
      PEER.map(function (q, i) { return '<tr><td>' + esc(q) + '</td>' + ANS.map(function (a, k) { return '<td><input type="radio" name="pq' + i + '" value="' + k + '"' + ((ex.pa || [])[i] === k ? ' checked' : '') + ' aria-label="' + esc(q) + ' ' + a + '"></td>'; }).join('') + '</tr>'; }).join('') +
      '</table></div>' +
      '<p class="bold mt3">③ 依回答修正（不必靠複雜特效）</p><div class="stack mt1">' + checks('w5-fix', FIX, ex.fix) + '</div>' +
      promptBox('w5-p', '🤖 請 AI 依回饋給修改建議（先填好上面的試看結果）') + aiRec('w5', ex) +
      '<label class="field mt2">我改了什麼？（三題都「是」的話，寫為什麼不用改）<input class="input" id="w5-what" maxlength="40" value="' + esc(ex.what || '') + '"></label>' +
      '<p class="bold mt3">④ AI 使用聲明：這支廣告哪些地方用了 AI？</p><p class="tiny soft">已依你前面的紀錄先勾好，請確認。誠實標示是「好好用 AI」的最後一步。</p><div class="stack mt1">' + checks('w5-ai', AIUSE, ex.ai || usedAI()) + '</div><div id="w5-aiw" class="mt1"></div>' +
      '<div class="row mt2"><button class="btn go" id="w5-make">🎨 產生作品說明卡</button></div><p id="w5-err" class="small bold mt1" style="color:var(--bad)"></p><div id="w5-out" class="center mt2"></div>';
    cl.wire(body, function () {});
    function pw() {
      var pa = PEER.map(function (q, i) { var r = document.querySelector('input[name=pq' + i + ']:checked'); return q + (r ? ANS[+r.value] : '＿＿'); });
      document.getElementById('w5-p').textContent = '我拍了一支 ' + VV.short + '廣告，主角是' + (w1.obj || '＿＿') + '，三句話是「' + ((w2.lines || {}).open || '') + '」「' + ((w2.lines || {}).feat || '') + '」「' + ((w2.lines || {}).end || '') +
        '」。同學看完的回饋：' + pa.join('；') + '。請給我 3 個修改建議，只能用剪輯做到（調整順序、長度、字幕、音量），不需要特效。';
    }
    body.querySelectorAll('input[name^=pq]').forEach(function (r) { r.addEventListener('change', pw); });
    pw(); wireCopy(body);
    function picked(name) { return Array.from(document.querySelectorAll('input[name=' + name + ']:checked')).map(function (c) { return +c.value; }); }
    function aiWarn() {
      var a = picked('w5-ai'), t = [];
      if (a.indexOf(NO_AI) >= 0 && a.length > 1) t.push('勾了「沒有使用 AI」，就不能再勾其他項目。');
      if (a.indexOf(GEN_AI) >= 0) t.push('這次的作業要自己實拍；AI 生成的畫面要在作品裡清楚標示，並先和老師討論。');
      document.getElementById('w5-aiw').innerHTML = t.length ? '<div class="note warn small">' + t.map(esc).join('<br>') + '</div>' : '';
      return !(a.indexOf(NO_AI) >= 0 && a.length > 1);
    }
    body.querySelectorAll('input[name=w5-ai]').forEach(function (c) { c.onchange = aiWarn; });
    aiWarn();
    document.getElementById('w5-make').onclick = function () {
      var v = { app: val('w5-app'), len: +val('w5-len') || 0, ratio: val('w5-ratio'), checks: st, peer: val('w5-peer'),
        pa: PEER.map(function (_, i) { var r = document.querySelector('input[name=pq' + i + ']:checked'); return r ? +r.value : -1; }),
        fix: picked('w5-fix'), what: val('w5-what'), ai: picked('w5-ai'), ver: VV.sec }, miss = [];
      Object.assign(v, aiVals('w5')); aiMiss('w5', miss);
      if (v.len < VV.len[0] || v.len > VV.len[1]) miss.push('影片長度約 ' + VV.short + '（' + VV.len.join('～') + ' 秒）');
      if (!allChecked(CHK, st)) miss.push('剪輯檢核（還有 ' + left(CHK, st) + ' 項）');
      if (!v.peer) miss.push('試看的同學');
      if (v.pa.some(function (x) { return x < 0; })) miss.push('三題試看都要回答');
      if (len(v.what) < 4) miss.push('我改了什麼');
      if (!v.ai.length) miss.push('AI 使用聲明（沒用也要勾「沒有使用 AI」）');
      if (!aiWarn()) miss.push('AI 使用聲明（看上面的提醒）');
      if (!done('W2')) miss.push('先完成步驟 2 的三句文案');
      document.getElementById('w5-err').textContent = miss.length ? '還差：' + miss.join('、') : '';
      if (miss.length) { save('W5', v, false); return; }
      var L = w2.lines || {}, yes = v.pa.filter(function (x) { return x === 0; }).length, n = (extra('W3').shots || []).length;
      var decl = v.ai.indexOf(NO_AI) >= 0 ? '沒有使用 AI' : 'AI 協助：' + v.ai.map(function (i) { return AIUSE[i]; }).join('、') + '（文案經我修改）';
      LABKIT.showCard(document.getElementById('w5-out'), LABKIT.drawCard({
        title: L.end, banner: VV.short + '廣告 · 主角：' + (w1.obj || ''), me: me,
        rule: v.app + ' · ' + v.len + ' 秒 · ' + v.ratio + ' · ' + n + ' 個鏡頭 · 試看 ' + yes + '/3 是',
        boxes: [['主角', w1.obj || ''], ['核心特色', coreFeat(w1)], ['配樂', w4.name || ''], ['長度', v.len + ' 秒']],
        lines: [('開場：' + (L.open || '')).slice(0, 34), ('特色：' + (L.feat || '')).slice(0, 34), decl.slice(0, 34)] }), me);
      var a = document.querySelector('#w5-out a'); if (a) a.download = '廣告說明卡-' + me.cls + '_' + me.seat + '_' + me.name + '.png';
      save('W5', v, true);
    };
  }

  /* 網址 #W3 → 工作站第 3 步；#ai、#demo → 對應分頁 */
  function route() {
    var h = location.hash;
    if (/^#W/.test(h)) { var wi = STEPS.findIndex(function (s) { return '#' + s.id === h; }); if (wi >= 0) cur = wi; tab('studio'); }
    else if (h === '#ai' || /^#A\d/.test(h)) tab('ai');
    else if (h === '#demo') tab('demo');
  }
  route();
  window.addEventListener('hashchange', route);
})();
