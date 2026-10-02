/* =====================================================================
   單元課程小卡（UNIT）── 一個單元包好幾個部分時使用（例如 116-2 單元六）
   ---------------------------------------------------------------------
   config.js 的單元寫 parts：[{ id, icon, title, ds, href, levels, maxStars, mod? }]
   （mod：這個部分的進度存在哪個模組；不寫就是 id 本身。例如單元一四課都存在 digital 模組）
   （color／bg：這一課內容本身有主色時（單元一的四課），小卡跟著用；沒寫就用全站步驟色 --s1～--s4）
   UNIT.cards('#ucards', 'unit6', 'sheet')   ← 第三個參數是「目前在哪一部分」（單元首頁給 null）
   每張小卡是連結，顯示這一部分的星數／完成關數，目前這張會標「目前在這裡」。
   ===================================================================== */
window.UNIT = {
  find: function (id) { return (CONFIG.MODULES || []).filter(function (m) { return m.id === id; })[0]; },
  cards: function (el, unitId, current) {
    if (typeof el === 'string') el = document.querySelector(el);
    var u = UNIT.find(unitId); if (!el || !u) return;
    function draw() {
      el.className = 'ucards' + (current ? ' compact' : ''); el.style.setProperty('--n', u.parts.length);
      el.setAttribute('aria-label', '單元' + u.no + '課程小卡');
      el.innerHTML = u.parts.map(function (p, i) {
        var got = p.maxStars ? STORE.partStars(p) : STORE.partDone(p), max = p.maxStars || p.levels.length, unit = p.maxStars ? '⭐' : '關';
        var on = p.id === current, pct = max ? Math.round(got / max * 100) : 0;
        return '<a class="ucard uc-' + (i + 1) + (on ? ' on' : '') + '" href="' + UI.esc(p.href) + '"' + (p.color ? ' style="--c:' + p.color + ';--cb:' + (p.bg || '#fff') + '"' : '') + (on ? ' aria-current="page"' : '') + ' data-part="' + UI.esc(p.id) + '">' +
          '<span class="no">' + (i + 1) + '</span><span class="here">目前在這裡 👇</span>' +
          '<span class="ic">' + p.icon + '</span><span class="tt">' + UI.esc(p.title) + '</span><span class="ds">' + UI.esc(p.ds || '') + '</span>' +
          '<span class="pg"><span>' + (got >= max ? '✅ 完成' : (p.sequential ? '🔒 依序開放' : '進度')) + '</span><span>' + got + ' / ' + max + ' ' + unit + '</span></span>' +
          '<span class="bar"><i style="width:' + pct + '%"></i></span></a>';
      }).join('');
    }
    draw();
    window.addEventListener('store:change', draw);
    if (UI.stickyNav) UI.stickyNav(el);
  },
  /* 每一部分的結尾：「← 上一課／下一課 →」。第一課的上一個、最後一課的下一個都回單元首頁（home：從這一頁連回單元首頁的網址） */
  pager: function (el, unitId, current, home) {
    var u = UNIT.find(unitId); if (!u) return;
    var i = u.parts.map(function (p) { return p.id; }).indexOf(current); if (i < 0) return;
    var prev = u.parts[i - 1], next = u.parts[i + 1];
    UI.pager(el,
      prev ? { lbl: '← 上一課', title: prev.icon + ' ' + prev.title, href: prev.href } : { lbl: '← 回到', title: '單元' + u.no + '首頁', href: home },
      next ? { lbl: '下一課 →', title: next.icon + ' ' + next.title, href: next.href } : { lbl: '全部完成了嗎？回到 →', title: '單元' + u.no + '首頁', href: home });
  }
};
