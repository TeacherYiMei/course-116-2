/* =====================================================================
   📚 小抄浮動視窗（REFPANEL）── Python 語法小抄、試算表函式小抄共用
   ---------------------------------------------------------------------
   REFPANEL.bind(root, { url:'pyref.html', title:'📚 語法小抄' })
       root 裡任何有 data-refp="P5"（或 "all"）的連結，點了就在同一頁開浮動視窗，
       iframe 載入 url?embed=1#P5（小抄頁的精簡版，只列那一關用到的）。Ctrl／⌘＋點一下 仍然開新分頁。
   REFPANEL.open(hash)     打開（或換成）某一關
   REFPANEL.follow(hash)   視窗開著、而且目前是在看某一關時，跟著換關卡（切換關卡時呼叫）
   視窗：拖標題列移動、拖右下角調整大小、「－」縮成標題列、「↗」開新分頁；位置和大小記在這台電腦。
   手機（≤ 760px）固定在畫面下方。樣式在 theme.css 的 .refp。
   ===================================================================== */
(function () {
  var P = null, cfg = null, cur = 'all', KEY = 'refpanel-float';
  function src(h) { return cfg.url + (cfg.url.indexOf('?') >= 0 ? '&' : '?') + 'embed=1#' + h; }
  function save() { try { var r = P.getBoundingClientRect(); localStorage.setItem(KEY, JSON.stringify({ x: r.left, y: r.top, w: r.width, h: r.height })); } catch (e) {} }
  function place(x, y) {
    var w = P.offsetWidth, vw = document.documentElement.clientWidth;
    P.style.left = Math.max(0, Math.min(x, vw - Math.min(w, vw))) + 'px';
    P.style.top = Math.max(0, Math.min(y, innerHeight - 44)) + 'px';
    P.style.right = 'auto';
  }
  function build() {
    P = document.createElement('aside');
    P.className = 'refp'; P.setAttribute('role', 'dialog'); P.setAttribute('aria-label', cfg.title.replace(/^\S+\s/, ''));
    P.innerHTML = '<div class="refp-hd" title="按住這裡可以拖曳移動"><b>' + UI.esc(cfg.title) + '</b>' +
      '<a class="btn sm" id="refp-new" target="_blank" rel="noopener" title="開新分頁看完整版">↗</a><button class="btn sm" id="refp-min" title="縮小／展開">－</button><button class="btn sm" id="refp-x" title="關閉">✕</button></div>' +
      '<iframe class="refp-if" title="' + UI.esc(cfg.title) + '" allow="clipboard-write"></iframe>';
    document.body.appendChild(P);
    try { var s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.w > 200) { P.style.width = s.w + 'px'; P.style.height = s.h + 'px'; place(s.x, s.y); } } catch (e) {}
    var hd = P.querySelector('.refp-hd'), drag = null;
    hd.addEventListener('pointerdown', function (e) {
      if (e.target.closest('a,button') || innerWidth <= 760) return;
      var r = P.getBoundingClientRect(); drag = { sx: e.clientX, sy: e.clientY, x: r.left, y: r.top };
      hd.setPointerCapture(e.pointerId); P.classList.add('drag'); e.preventDefault();
    });
    hd.addEventListener('pointermove', function (e) { if (drag) place(drag.x + e.clientX - drag.sx, drag.y + e.clientY - drag.sy); });
    hd.addEventListener('pointerup', function () { if (drag) { drag = null; P.classList.remove('drag'); save(); } });
    P.addEventListener('mouseup', function () { if (!P.classList.contains('min')) save(); });   // 拖右下角調整大小後記下來
    P.querySelector('#refp-x').onclick = function () { P.classList.add('hidden'); };
    P.querySelector('#refp-min').onclick = function () { var m = P.classList.toggle('min'); this.textContent = m ? '＋' : '－'; };
    window.addEventListener('resize', function () { if (P.style.left) place(parseFloat(P.style.left), parseFloat(P.style.top)); });
    P.querySelector('iframe').src = src(cur);
  }
  function open(h) {
    if (!cfg) return;
    cur = h || 'all';
    if (!P) build();
    else { var f = P.querySelector('iframe'); try { f.contentWindow.location.hash = cur; } catch (e) { f.src = src(cur); } }
    P.querySelector('#refp-new').href = cfg.url + '#' + cur;
    P.classList.remove('hidden', 'min'); P.querySelector('#refp-min').textContent = '－';
  }
  window.REFPANEL = {
    bind: function (root, c) {
      cfg = c;
      (typeof root === 'string' ? document.querySelector(root) : root).addEventListener('click', function (e) {
        var a = e.target.closest('[data-refp]'); if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return;
        e.preventDefault(); open(a.dataset.refp);
      });
    },
    open: open,
    follow: function (h) { if (P && !P.classList.contains('hidden') && cur !== 'all') open(h); }
  };
})();
