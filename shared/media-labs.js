/* =====================================================================
   🧪 多媒體概念闖關・視覺化實驗站（CARDGAME.labs）── M1～M4 三星三階的「操作」「挑戰」
   ---------------------------------------------------------------------
   resFrame（M1 解析度與影格）、flipbook（M2 視覺暫留與 fps）、timeline（M3 多重軌道）、licenseCheck（M4 素材授權）
   ⭐ 情境由伺服器產生（server/43_labs_media.js），也由伺服器判斷對錯；這裡只畫畫面、把學生的操作送上去（api.send）。
   el.dataset 只放畫面上看得到的題目，給測試的解題器看。
   ===================================================================== */
(function () {
  function esc(s) { return UI.esc(s); }
  function tip(api, t) { return api.practice ? '<div class="note small mt1">💡 提示：' + esc(t) + '</div>' : ''; }
  function warn(api, t) { api.say('<div class="note warn small">' + esc(t) + '</div>'); }
  var L = {};

  /* 📺 解析度與影格（M1）：標示 → 像素、影格數；挑戰：像素是幾倍、分秒換影格、隔行掃描 */
  L.resFrame = function (el, api) {
    var P = api.pub, q = P.q;
    el.dataset.lab = 'resFrame'; el.dataset.q = JSON.stringify(q.map(function (x) { return { k: x.k, t: x.t }; }));
    el.innerHTML = '<div class="rf2">' + (P.boxes ? '<div class="res-boxes" id="rb"></div>' : '') +
      tip(api, api.hard ? '像素數量＝水平 × 垂直，兩個相除就是幾倍；影格數＝總秒數 × fps；隔行掃描一格只有一半的行數。' : '解析度常用「垂直」的數字簡稱；影格數＝秒數 × 每秒幾格。') +
      '<div class="stack mt1">' + q.map(function (x, i) {
        var inp = x.k === 'wh' ? '<span class="row" style="gap:.3rem"><input class="input rf-n" data-i="' + i + '" data-p="w" inputmode="numeric" placeholder="水平" aria-label="水平"> × <input class="input rf-n" data-i="' + i + '" data-p="h" inputmode="numeric" placeholder="垂直" aria-label="垂直"></span>'
          : x.opts ? '<span class="row" style="gap:.3rem">' + x.opts.map(function (o, k) { return '<button type="button" class="btn sm rf-o" data-i="' + i + '" data-v="' + k + '">' + esc(o) + '</button>'; }).join('') + '</span>'
            : '<input class="input rf-n" data-i="' + i + '" data-p="v" inputmode="decimal" placeholder="輸入數字" aria-label="答案">';
        return '<div class="card soft-bg" style="padding:.6rem .8rem"><p class="small bold">' + (i + 1) + '. ' + esc(x.t) + '</p><div class="mt1">' + inp + '</div></div>';
      }).join('') + '</div><div class="row mt2"><button type="button" class="btn go" id="rf-ok">✅ 確認</button></div></div>';
    if (P.boxes) {   // 挑戰：兩種解析度畫成等比例的框，看得出大小差多少
      var mx = Math.max(P.boxes[0].w, P.boxes[1].w);
      el.querySelector('#rb').innerHTML = P.boxes.map(function (r) { return '<div class="res-box" style="width:' + (r.w / mx * 100) + '%;aspect-ratio:' + r.w + '/' + r.h + '"><span>' + esc(r.n) + '</span></div>'; }).join('');
    }
    var pickV = {};
    el.querySelectorAll('.rf-o').forEach(function (b) { b.onclick = function () { pickV[b.dataset.i] = +b.dataset.v; el.querySelectorAll('.rf-o[data-i="' + b.dataset.i + '"]').forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
    el.querySelector('#rf-ok').onclick = function () {
      function v(i, p) { var e = el.querySelector('.rf-n[data-i="' + i + '"][data-p="' + p + '"]'); return e ? e.value.trim() : ''; }
      var a = [];
      for (var i = 0; i < q.length; i++) {
        var x = q[i];
        if (x.k === 'wh') { if (!v(i, 'w') || !v(i, 'h')) return warn(api, '每一題都要作答'); a.push({ w: v(i, 'w'), h: v(i, 'h') }); }
        else if (x.opts) { if (pickV[i] == null) return warn(api, '每一題都要作答'); a.push({ o: pickV[i] }); }
        else { if (!v(i, 'v')) return warn(api, '每一題都要作答'); a.push({ v: v(i, 'v') }); }
      }
      api.send({ a: a });
    };
  };

  /* 🎞️ 翻頁動畫（M2 視覺暫留）：把畫面排好順序、算出 fps，按播放看動起來 */
  L.flipbook = function (el, api) {
    var P = api.pub, N = P.N, T = P.T, frames = P.frames, extra = P.extra, picked = [], timer = null;
    el.dataset.lab = 'flipbook'; el.dataset.n = N; el.dataset.t = T; el.dataset.frames = JSON.stringify(frames); if (extra) el.dataset.x = JSON.stringify(extra);
    function svg(f, big) { return '<svg viewBox="0 0 100 80" class="fb-svg' + (big ? ' big' : '') + '"><line x1="0" y1="76" x2="100" y2="76" stroke="#94a3b8" stroke-width="2"/><circle cx="' + f.x + '" cy="' + f.y + '" r="7" fill="#f97316"/></svg>'; }
    el.innerHTML = '<div class="fbk"><p class="small">一顆球被丟起來又落下，拍成 <b>' + N + '</b> 張畫面，但順序亂掉了。① <b>依時間順序點選畫面</b>（球從左邊飛到右邊）② 要在 <b>' + T + ' 秒</b>內播完，算出 fps ③ 按「▶ 播放」看看。</p>' +
      tip(api, '球越往右，時間越晚；fps ＝ 畫面張數 ÷ 播放秒數。') +
      '<div class="fb-grid" id="fb-g"></div><div class="row mt1"><span class="small bold">順序：</span><span id="fb-seq" class="small mono"></span><button type="button" class="btn sm" id="fb-clr">↺ 重排</button></div>' +
      '<div class="row mt1"><label class="small bold">fps：<input class="input" id="fb-fps" inputmode="decimal" style="max-width:6rem;display:inline-block;margin:0"></label><button type="button" class="btn sm" id="fb-play">▶ 播放</button><div id="fb-view"></div></div>' +
      (extra ? '<div class="card soft-bg mt1" style="padding:.6rem .8rem"><p class="small bold">再算一題：一段 ' + extra.m + ' 分 ' + extra.s + ' 秒的影片，' + extra.f + 'fps，一共有幾張畫面？</p><input class="input" id="fb-tot" inputmode="numeric" style="max-width:10rem;margin:0" aria-label="總影格數"></div>' : '') +
      '<div class="row mt2"><button type="button" class="btn go" id="fb-ok">✅ 確認</button></div></div>';
    function draw() {
      el.querySelector('#fb-g').innerHTML = frames.map(function (f, k) {
        var at = picked.indexOf(k);
        return '<button type="button" class="fb-f' + (at >= 0 ? ' on' : '') + '" data-k="' + k + '" aria-label="畫面 ' + String.fromCharCode(65 + k) + '"><b>' + String.fromCharCode(65 + k) + (at >= 0 ? ' · ' + (at + 1) : '') + '</b>' + svg(f) + '</button>';
      }).join('');
      el.querySelector('#fb-seq').textContent = picked.map(function (k) { return String.fromCharCode(65 + k); }).join(' → ') || '（還沒點）';
      el.querySelectorAll('.fb-f').forEach(function (b) { b.onclick = function () { var k = +b.dataset.k; if (picked.indexOf(k) < 0) picked.push(k); draw(); }; });
    }
    el.querySelector('#fb-clr').onclick = function () { picked = []; draw(); };
    el.querySelector('#fb-play').onclick = function () {
      var f = parseFloat(el.querySelector('#fb-fps').value), seq = picked.length ? picked : frames.map(function (_, k) { return k; }), k = 0, view = el.querySelector('#fb-view');
      if (!(f > 0 && f <= 60)) return warn(api, '先填 fps（1～60）');
      clearInterval(timer);
      timer = setInterval(function () { view.innerHTML = svg(frames[seq[k % seq.length]], true); k++; if (k > seq.length * 2) clearInterval(timer); }, 1000 / f);
    };
    el.querySelector('#fb-ok').onclick = function () {
      clearInterval(timer);
      if (picked.length < N) return warn(api, '先把 ' + N + ' 張畫面都依順序點完');
      var tot = el.querySelector('#fb-tot');
      api.send({ seq: picked, fps: el.querySelector('#fb-fps').value, tot: tot ? tot.value : null }).then(function (r) { if (r && r.reset) { picked = []; draw(); } });
    };
    draw();
  };

  /* 🎚️ 多重軌道（M3）：把素材放到對的軌道；挑戰：還要排時間，同一軌不能重疊 */
  var TRACKS = [{ id: 'V2', t: '🎬 影像軌 V2（上層）' }, { id: 'V1', t: '🎬 影像軌 V1（下層）' }, { id: 'A1', t: '🔊 音訊軌 A1' }, { id: 'A2', t: '🔊 音訊軌 A2' }];
  L.timeline = function (el, api) {
    var P = api.pub, clips = P.clips, hard = P.hard, place = {}, start = {}, sel = null;
    el.dataset.lab = 'timeline'; el.dataset.clips = JSON.stringify(clips);
    el.innerHTML = '<div class="tl2"><p class="small">把素材放到軌道上（先點素材，再點軌道）。' + (hard ? '<b>還要照「出現時間」填開始秒數</b>；同一條軌道上，時間不能重疊。' : '畫面上要看得到每一個影像素材，聲音都要聽得到。') + '</p>' +
      tip(api, '上層影像會蓋住下層：文字、小畫面、貼圖放上層，全景影片放下層；聲音放音訊軌，兩段聲音同時播就要分開兩條音軌。') +
      '<div class="tl-clips" id="tl-c"></div><div class="tl-tracks mt1" id="tl-t"></div>' +
      '<div class="row mt1"><label class="small bold">預覽第 <input type="range" id="tl-s" min="0" max="9" value="1" style="vertical-align:middle" aria-label="預覽第幾秒"> <span id="tl-sv">1</span> 秒</label></div><div class="tl-view" id="tl-v"></div>' +
      '<div class="row mt2"><button type="button" class="btn go" id="tl-ok">✅ 確認</button></div></div>';
    function draw() {
      el.querySelector('#tl-c').innerHTML = clips.map(function (c) {
        return '<button type="button" class="tl-clip' + (sel === c.id ? ' on' : '') + (place[c.id] ? ' placed' : '') + '" data-c="' + c.id + '">' + esc(c.t) + '<small>' + c.len + ' 秒' + (hard ? '・出現在第 ' + c.at + '～' + (c.at + c.len) + ' 秒' : '') + (place[c.id] ? '・在 ' + place[c.id] : '') + '</small></button>';
      }).join('');
      el.querySelector('#tl-t').innerHTML = TRACKS.map(function (t) {
        var on = clips.filter(function (c) { return place[c.id] === t.id; });
        return '<div class="tl-row" data-t="' + t.id + '"><button type="button" class="tl-lab" data-t="' + t.id + '">' + t.t + '</button><div class="tl-lane">' + on.map(function (c) {
          var s = hard ? (start[c.id] != null ? start[c.id] : 0) : 0;
          return '<span class="tl-bar k-' + t.id + '" style="left:' + (s * 10) + '%;width:' + (c.len * 10) + '%">' + esc(c.t.split(' ')[1] || c.t) +
            (hard ? ' <input class="tl-st" data-c="' + c.id + '" inputmode="numeric" value="' + (start[c.id] != null ? start[c.id] : '') + '" placeholder="秒" aria-label="' + esc(c.t) + ' 開始秒數">' : '') + '</span>';
        }).join('') + '</div></div>';
      }).join('');
      el.querySelectorAll('.tl-clip').forEach(function (b) { b.onclick = function () { sel = b.dataset.c; draw(); }; });
      el.querySelectorAll('.tl-lab,.tl-row').forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); if (e.target.closest('.tl-st')) return; if (!sel) return warn(api, '先點一個素材'); place[sel] = b.dataset.t; sel = null; draw(); }; });
      el.querySelectorAll('.tl-st').forEach(function (inp) { inp.onclick = function (e) { e.stopPropagation(); }; inp.onchange = function () { start[inp.dataset.c] = inp.value === '' ? null : +inp.value; draw(); }; });
      view();
    }
    function view() {   // 預覽：這一秒畫面上看得到什麼（上層蓋下層）、聽得到什麼 —— 只看你放的軌道
      var t = +el.querySelector('#tl-s').value, st = function (c) { return hard ? (start[c.id] || 0) : 0; };
      el.querySelector('#tl-sv').textContent = t;
      var at = clips.filter(function (c) { return place[c.id] && t >= st(c) && t < st(c) + c.len; });
      var vis = ['V1', 'V2'].map(function (tr) { return at.filter(function (c) { return place[c.id] === tr; })[0]; }).filter(Boolean);
      var aud = at.filter(function (c) { return /^A/.test(place[c.id]); });
      el.querySelector('#tl-v').innerHTML = '<div class="tl-screen">' + (vis.length ? vis.map(function (c, i) { return '<span class="lay' + i + '">' + esc(c.t) + '</span>'; }).join('') : '<span class="soft">（黑畫面）</span>') + '</div>' +
        '<div class="tiny soft mt1">🔊 ' + (aud.map(function (c) { return esc(c.t); }).join('＋') || '沒有聲音') + '</div>';
    }
    el.querySelector('#tl-s').oninput = view;
    el.querySelector('#tl-ok').onclick = function () {
      var miss = clips.filter(function (c) { return !place[c.id]; });
      if (miss.length) return warn(api, '還有素材沒放：' + miss.map(function (c) { return c.t; }).join('、'));
      if (hard && clips.some(function (c) { return start[c.id] == null; })) return warn(api, '每一段都要填開始秒數');
      api.send({ place: place, start: start });
    };
    draw();
  };

  /* 📜 素材授權檢查（M4）：這些素材放進廣告能不能用？要不要標示作者？ */
  var ANS = [['ok', '✅ 可以直接用'], ['credit', '📝 可以用，要標示作者'], ['no', '🚫 不能用']];
  L.licenseCheck = function (el, api) {
    var P = api.pub, mats = P.mats, ans = {};
    el.dataset.lab = 'licenseCheck'; el.dataset.s = JSON.stringify(P);
    el.innerHTML = '<div class="lc"><div class="note small"><b>情境：</b>' + (P.commercial ? '附近的飲料店<b>付錢</b>請你拍一支廣告，要在店裡和網路上播放（<b>商業用途</b>）' : '你的 30 秒廣告要在學校成果展播放、放上班級網頁（<b>非商業</b>）') +
      '，而且' + (P.edit ? '素材會<b>剪短、加上字幕</b>（改作）' : '素材<b>照原樣</b>使用，不修改') + '。</div>' +
      tip(api, '創用 CC：BY＝要標示作者；NC＝不能商業使用；ND＝不能修改（剪輯、加字都算）。沒寫授權的，就當作不能用。') +
      '<div class="stack mt1">' + mats.map(function (m) {
        return '<div class="lc-row"><div><b>' + esc(m.t) + '</b><small>授權：' + esc(m.lic) + '</small></div><div class="pb-opts">' + ANS.map(function (a) { return '<button type="button" class="btn sm lc-a" data-m="' + m.id + '" data-a="' + a[0] + '">' + a[1] + '</button>'; }).join('') + '</div></div>';
      }).join('') + '</div><div class="row mt2"><button type="button" class="btn go" id="lc-ok">✅ 確認</button></div></div>';
    el.querySelectorAll('.lc-a').forEach(function (b) { b.onclick = function () { ans[b.dataset.m] = b.dataset.a; el.querySelectorAll('.lc-a[data-m="' + b.dataset.m + '"]').forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
    el.querySelector('#lc-ok').onclick = function () {
      if (mats.some(function (m) { return !ans[m.id]; })) return warn(api, '每一項素材都要判斷');
      api.send({ ans: ans });
    };
  };

  CARDGAME.labs = Object.assign(CARDGAME.labs || {}, L);
})();
