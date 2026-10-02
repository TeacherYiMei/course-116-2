/* =====================================================================
   🧾 單元學習卡（反思）：選一個單元 → 寫「我學會了什麼」「我還想知道」→ 下載 PNG 交作業／貼學習歷程
   卡片內容：姓名座號、單元、每一關的星星、課綱代碼、徽章數、兩段反思。
   用法：LEARNCARD.mount('#learncard')（闖關地圖 hub.js 會自動呼叫）
   需要：config.js、store.js、ui.js（k12.js 有載入就印課綱代碼）
   ===================================================================== */
(function () {
  var C = window.CONFIG, esc = UI.esc, MIN = 15;
  function recs(m) {
    return (m.parts || [m]).reduce(function (a, p) {
      return a.concat(p.levels.map(function (id) { return { id: id, r: STORE.level(p.mod || p.id, id) || {} }; }));
    }, []);
  }
  function wrap(ctx, text, x, y, w, lh, maxLines) {
    var line = '', n = 0;
    for (var i = 0; i < text.length; i++) {
      var t = line + text[i];
      if (ctx.measureText(t).width > w && line) { ctx.fillText(line, x, y + n * lh); n++; line = text[i]; if (n >= maxLines) return y + n * lh; }
      else line = t;
    }
    if (line) { ctx.fillText(line, x, y + n * lh); n++; }
    return y + n * lh;
  }
  function draw(canvas, m, learned, wonder, H) {   // 先用很高的畫布畫一次量出高度，再用剛好的高度重畫
    if (!H) { H = draw(canvas, m, learned, wonder, 2400) + 90; }
    var W = 1080, ctx = canvas.getContext('2d'), me = STORE.me() || { cls: '', seat: '', name: '' };
    canvas.width = W; canvas.height = H;
    var F = '"Noto Sans TC", "Microsoft JhengHei", sans-serif';
    ctx.fillStyle = '#fffbeb'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, W, 190);
    ctx.fillStyle = '#fbbf24'; ctx.font = '900 34px ' + F; ctx.fillText('🧾 單元學習卡 · ' + (C.TERM || ''), 60, 70);
    ctx.fillStyle = '#fff'; ctx.font = '900 56px ' + F; ctx.fillText(m.icon + ' ' + (m.no === '＋' ? '' : '單元' + m.no + '　') + m.title, 60, 150);
    ctx.fillStyle = '#1e293b'; ctx.font = '800 34px ' + F; ctx.fillText(me.cls + ' 班　' + me.seat + ' 號　' + me.name, 60, 250);
    ctx.fillStyle = '#64748b'; ctx.font = '700 26px ' + F; ctx.fillText(new Date().toLocaleDateString('zh-TW'), W - 260, 250);
    // 每一關的成績
    var R = recs(m), y = 310, col = 0;
    ctx.font = '800 28px ' + F;
    R.forEach(function (x, i) {
      var cx = 60 + (i % 5) * 196, cy = y + Math.floor(i / 5) * 80;
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx, cy, 180, 64, 14) : ctx.rect(cx, cy, 180, 64); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#1e293b'; ctx.fillText(x.id, cx + 14, cy + 42);
      ctx.fillStyle = '#b45309'; ctx.fillText(x.r.stars ? '⭐'.repeat(x.r.stars) : x.r.done ? '✅' : '—', cx + 72, cy + 42);
      col = i;
    });
    y += (Math.floor(col / 5) + 1) * 80 + 20;
    // 課綱
    if (window.K12) {
      var codes = []; R.forEach(function (x) { K12.codesOf(x.id).forEach(function (c) { if (codes.indexOf(c) < 0 && c[0] === '資') codes.push(c); }); });
      ctx.fillStyle = '#475569'; ctx.font = '700 24px ' + F;
      y = wrap(ctx, '📚 108 課綱：' + codes.map(function (c) { return c + ' ' + K12.CODES[c]; }).join('、'), 60, y + 10, W - 120, 36, 4) + 10;
    }
    function box(title, text, color) {
      ctx.fillStyle = color; ctx.font = '900 34px ' + F; ctx.fillText(title, 60, y + 40);
      ctx.fillStyle = '#fff'; ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(60, y + 60, W - 120, 250, 20) : ctx.rect(60, y + 60, W - 120, 250); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#1e293b'; ctx.font = '700 32px ' + F; wrap(ctx, text, 90, y + 115, W - 180, 46, 5);
      y += 340;
    }
    box('💡 我學會最重要的一件事', learned, '#047857');
    box('❓ 我還想知道', wonder, '#1d4ed8');
    ctx.fillStyle = '#64748b'; ctx.font = '700 22px ' + F; ctx.fillText((C.SCHOOL || '') + ' · 資訊科技闖關地圖', 60, H - 40);
    return y;
  }
  function mount(sel) {
    var root = document.querySelector(sel); if (!root) return;
    var mods = C.MODULES.filter(function (m) { return !m.soon; });
    root.innerHTML = '<section class="card mt3" aria-label="單元學習卡"><h2 class="black" style="font-size:1.1rem">🧾 單元學習卡</h2>' +
      '<p class="small soft mt1">學完一個單元，寫下兩句反思，下載成圖片交給老師（或放進學習歷程）。</p>' +
      '<div class="row mt1" style="gap:.4rem"><label class="small bold" for="lc-mod">單元</label><select class="input" id="lc-mod" style="width:auto;margin:0">' +
      mods.map(function (m, i) { return '<option value="' + i + '">' + esc((m.no === '＋' ? '延伸 ' : '單元' + m.no + ' ') + m.title) + '</option>'; }).join('') + '</select></div>' +
      '<label class="small bold mt1" style="display:block" for="lc-a">💡 我學會最重要的一件事（至少 ' + MIN + ' 字）</label><textarea class="input" id="lc-a" rows="2" maxlength="120"></textarea>' +
      '<label class="small bold mt1" style="display:block" for="lc-b">❓ 我還想知道（至少 ' + MIN + ' 字）</label><textarea class="input" id="lc-b" rows="2" maxlength="120"></textarea>' +
      '<div class="row mt1"><button type="button" class="btn go" id="lc-make">🖼️ 做成學習卡</button><span class="tiny soft" id="lc-msg" aria-live="polite"></span></div>' +
      '<div id="lc-out" class="mt2"></div></section>';
    var sel2 = root.querySelector('#lc-mod'), a = root.querySelector('#lc-a'), b = root.querySelector('#lc-b');
    function loadDraft() { var m = mods[+sel2.value]; a.value = STORE.draft('reflect-a-' + m.id) || ''; b.value = STORE.draft('reflect-b-' + m.id) || ''; root.querySelector('#lc-out').innerHTML = ''; }
    sel2.onchange = loadDraft; loadDraft();
    a.oninput = function () { STORE.draft('reflect-a-' + mods[+sel2.value].id, a.value); };
    b.oninput = function () { STORE.draft('reflect-b-' + mods[+sel2.value].id, b.value); };
    root.querySelector('#lc-make').onclick = function () {
      var m = mods[+sel2.value], msg = root.querySelector('#lc-msg'), A = a.value.trim(), B = b.value.trim();
      var done = recs(m).filter(function (x) { return x.r.stars || x.r.done; }).length;
      if (!done) { msg.textContent = '這個單元還沒有闖過任何一關喔！'; return; }
      if (A.length < MIN || B.length < MIN) { msg.textContent = '兩段反思都要寫到 ' + MIN + ' 個字以上：寫具體一點，例如「我學會…，因為…」。'; return; }
      msg.textContent = '';
      var out = root.querySelector('#lc-out');
      out.innerHTML = '<canvas id="lc-canvas" style="width:100%;max-width:27rem;border-radius:1rem;box-shadow:0 4px 16px rgba(0,0,0,.12)" role="img" aria-label="單元學習卡圖片"></canvas><p class="mt1"><a class="btn primary" id="lc-dl">⬇ 下載學習卡</a></p>';
      var cv = out.querySelector('#lc-canvas'), me = STORE.me() || {};
      draw(cv, m, A, B);
      var dl = out.querySelector('#lc-dl'); dl.href = cv.toDataURL('image/png'); dl.download = '學習卡-' + (m.no === '＋' ? '延伸' : '單元' + m.no) + '-' + me.cls + '_' + me.seat + '_' + me.name + '.png';
    };
  }
  window.LEARNCARD = { mount: mount };
})();
