/* =====================================================================
   🧪 網路世界・視覺化實驗站（CARDGAME.labs）── 三星三階的「操作」「挑戰」用
   ---------------------------------------------------------------------
   十個實驗站：N1 教室拉線、N2 佈線工程師、N3 封包快遞、N4 IP 設定面板、N5 IPv6 壓縮機、N6 DNS 電話簿、
   N7 郵件旅程＋偷看者、N8 Wi-Fi 覆蓋地圖、N9 下載模擬器、N10 條碼掃描器／印條碼
   ⭐ 情境由伺服器產生（server/40_labs_net.js），也由伺服器判斷對錯；這裡只畫畫面、把學生的操作送上去（api.send）。
   訊號強度、下載時間這些「課本上的規則」前端也算得出來（拿來畫熱度圖、進度條），但過不過關只有伺服器說了算。
   el.dataset 只放畫面上看得到的題目，給測試的解題器看。
   ===================================================================== */
(function () {
  function rnd(n) { return Math.floor(Math.random() * n); }
  function esc(s) { return UI.esc(s); }
  function tip(api, text) { return api.practice ? '<div class="note small mt1">💡 提示：' + esc(text) + '</div>' : ''; }
  function warn(api, t) { api.say('<div class="note warn small">' + esc(t) + '</div>'); }
  var L = {};

  /* =================================================================
     📦 封包快遞模擬器（N3）
     按「傳送」→ 伺服器才告訴我們哪些封包到了（遺失的只看到 💥）→ 依編號放進格子；
     缺的格子選起來按「請求重送」→ 組好了就送出
     ================================================================= */
  L.packetSim = function (el, api) {
    var n = api.pub.n;
    var LANES = [{ name: '路線 A', via: '路由器 1 → 3', sp: 1.4 }, { name: '路線 B', via: '路由器 2 → 4 → 5', sp: 2.2 }, { name: '路線 C', via: '路由器 2 → 6', sp: 1.8 }];
    var sent = false, landed = false, tray = [], slots = [], sel = null, want = null;
    for (var i = 0; i < n; i++) slots.push(null);
    el.innerHTML = '<div class="pk">' +
      '<div class="row between"><div><b>📤 傳送端</b>：訊息已切成 <b>' + n + '</b> 個封包（TCP 幫每個封包編了號）</div><button type="button" class="btn go" id="pk-send">▶ 傳送</button></div>' +
      tip(api, '封包會走不同路線、不照順序到。依 # 編號放進格子；空著的格子就是遺失的，選它再按「請求重送」。') +
      '<div class="pk-net mt1" id="pk-net">' + LANES.map(function (l, i) { return '<div class="pk-lane" data-l="' + i + '"><span class="pk-lab">' + l.name + '<small>' + l.via + '</small></span><div class="pk-track"></div></div>'; }).join('') + '</div>' +
      '<p class="small bold mt2">📥 收件匣（依抵達順序）<span class="tiny soft">　點一個封包，再點下面的格子放進去</span></p><div class="pk-tray" id="pk-tray"><span class="tiny soft">還沒收到封包，先按「傳送」</span></div>' +
      '<p class="small bold mt2">🧩 組回訊息<span class="tiny soft">　點已放好的格子可以拿回來</span></p><div class="pk-slots" id="pk-slots"></div>' +
      '<div class="row mt2"><button type="button" class="btn" id="pk-re" disabled>📨 請求重送</button><button type="button" class="btn go" id="pk-ok" disabled>✅ 組好了</button><span class="tiny soft" id="pk-msg"></span></div></div>';
    var trayEl = el.querySelector('#pk-tray'), slotEl = el.querySelector('#pk-slots'), msgEl = el.querySelector('#pk-msg');
    function draw() {
      trayEl.innerHTML = tray.length ? tray.map(function (p, i) { return '<button type="button" class="pk-pkt' + (sel === i ? ' on' : '') + '" data-i="' + i + '" data-n="' + p.n + '">#' + p.n + '<b>' + esc(p.c) + '</b></button>'; }).join('') : '<span class="tiny soft">' + (sent ? '收件匣空了' : '還沒收到封包，先按「傳送」') + '</span>';
      slotEl.innerHTML = slots.map(function (p, i) { return '<button type="button" class="pk-slot' + (p ? ' full' : '') + (want === i ? ' want' : '') + '" data-s="' + i + '"><small>#' + (i + 1) + '</small><b>' + (p ? esc(p.c) : '？') + '</b></button>'; }).join('');
      trayEl.querySelectorAll('.pk-pkt').forEach(function (b) { b.onclick = function () { sel = sel === +b.dataset.i ? null : +b.dataset.i; want = null; draw(); }; });
      slotEl.querySelectorAll('.pk-slot').forEach(function (b) {
        b.onclick = function () {
          var i = +b.dataset.s;
          if (sel != null) { if (slots[i]) tray.push(slots[i]); slots[i] = tray.splice(sel, 1)[0]; sel = null; want = null; }
          else if (slots[i]) { tray.push(slots[i]); slots[i] = null; }
          else want = want === i ? null : i;
          draw();
        };
      });
      el.querySelector('#pk-re').disabled = !landed || want == null;
      el.querySelector('#pk-ok').disabled = !landed;
    }
    function fly(p, lane, delay, dur, drop, done) {
      var tr = el.querySelectorAll('.pk-track')[lane], d = document.createElement('span');
      d.className = 'pk-fly'; d.textContent = '#' + p.n; tr.appendChild(d);
      d.style.transition = 'left ' + dur + 's linear ' + delay + 's, opacity .3s';
      requestAnimationFrame(function () { requestAnimationFrame(function () { d.style.left = drop ? '48%' : 'calc(100% - 2.6rem)'; }); });
      setTimeout(function () {
        if (drop) { d.textContent = '💥'; d.classList.add('lost'); setTimeout(function () { d.remove(); }, 700); }
        else { d.remove(); tray.push(p); draw(); }
        done && done();
      }, (delay + dur * (drop ? 0.5 : 1)) * 1000 + 50);
    }
    el.querySelector('#pk-send').onclick = function () {
      if (sent) return; sent = true; this.disabled = true; msgEl.textContent = '傳送中…';
      api.send({ op: 'send' }).then(function (r) {
        var plan = r && r.out; if (!plan) { sent = false; el.querySelector('#pk-send').disabled = false; msgEl.textContent = ''; return; }
        var left = plan.length;
        plan.forEach(function (p) {
          fly({ n: p.n, c: p.c }, p.lane, p.delay, LANES[p.lane].sp, p.drop, function () { if (--left === 0) { landed = true; msgEl.textContent = '全部送完了！看看少了哪幾號？'; draw(); } });
        });
        draw();
      });
    };
    el.querySelector('#pk-re').onclick = function () {
      if (want == null) return;
      var num = want + 1; want = null; draw();
      api.send({ op: 'resend', num: num }).then(function (r) {
        if (!r || !r.ok || !r.data) return;
        msgEl.textContent = '📨 已請求重送 #' + num + '…';
        fly(r.data, 0, 0, LANES[0].sp, false, function () { msgEl.textContent = '✅ #' + num + ' 重送到了'; });
      });
    };
    el.querySelector('#pk-ok').onclick = function () {
      var empty = slots.map(function (p, i) { return p ? 0 : i + 1; }).filter(Boolean);
      if (empty.length) { msgEl.textContent = '還有空格：#' + empty.join('、#') + '（遺失的要請求重送）'; return; }
      api.send({ op: 'done', slots: slots.map(function (p) { return p.n; }) });
    };
    el.dataset.lab = 'packetSim';
    draw();
  };

  /* =================================================================
     📶 Wi-Fi 覆蓋地圖（N8）
     點平面圖放基地臺（雙頻：2.4GHz 範圍大、5GHz 範圍小，穿牆都會變弱），
     幫每個裝置選頻段：4K 電視一定要用 5GHz；每個裝置選的頻段都要收得到
     ================================================================= */
  var W = 12, H = 8, CS = 40;
  var BAND = { g24: { range: 6.8, loss: 2.2, label: '2.4GHz' }, g5: { range: 4.6, loss: 2.6, label: '5GHz' } };
  function segCross(ax, ay, bx, by, w) {   // 線段 (a→b) 有沒有穿過牆 w（避開門）
    if (w.v) {
      if ((ax - w.x) * (bx - w.x) > 0 || ax === bx) return false;
      var t = (w.x - ax) / (bx - ax), y = ay + t * (by - ay);
      return y >= w.y0 && y <= w.y1 && !(y >= w.d0 && y <= w.d1);
    }
    if ((ay - w.y) * (by - w.y) > 0 || ay === by) return false;
    var t2 = (w.y - ay) / (by - ay), x = ax + t2 * (bx - ax);
    return x >= w.x0 && x <= w.x1 && !(x >= w.d0 && x <= w.d1);
  }
  function sig(lay, ap, p, band) {   // 畫熱度圖用：範圍 − 距離 − 穿牆衰減（規則寫在畫面上）
    var ax = ap.x + 0.5, ay = ap.y + 0.5, bx = p.x + 0.5, by = p.y + 0.5, d = Math.hypot(ax - bx, ay - by), walls = 0;
    lay.walls.forEach(function (w) { if (segCross(ax, ay, bx, by, w)) walls++; });
    return BAND[band].range - d - walls * BAND[band].loss;
  }
  function bars(s) { return s > 2.5 ? '▂▄▆' : s > 1 ? '▂▄' : s > 0 ? '▂' : '✕'; }
  L.wifiMap = function (el, api) {
    var lay = api.pub, ap = null, view = 'g5', pickBand = lay.devs.map(function () { return null; });
    el.dataset.lab = 'wifiMap'; el.dataset.layout = JSON.stringify(lay);
    el.innerHTML = '<div class="wf">' +
      '<p class="small">點平面圖放<b>📡 雙頻基地臺</b>，再幫每個裝置選頻段。<b>2.4GHz</b> 範圍大、速度慢；<b>5GHz</b> 速度快、範圍小；穿過牆都會變弱（門口不會）。<b>📺 4K 電視一定要用 5GHz</b>。</p>' +
      tip(api, '先讓 4K 電視在 5GHz 的範圍裡（放近一點、別隔牆），再看其他裝置用 2.4GHz 收不收得到。') +
      '<div class="row mt1"><span class="tiny bold">顯示範圍：</span><button type="button" class="btn sm wf-v on" data-v="g5">5GHz</button><button type="button" class="btn sm wf-v" data-v="g24">2.4GHz</button></div>' +
      '<svg class="wf-map mt1" viewBox="0 0 ' + (W * CS) + ' ' + (H * CS) + '" id="wf-map" role="img" aria-label="平面圖"></svg>' +
      '<div class="wf-legend tiny"><span><i style="background:var(--wf-3)"></i>訊號強</span><span><i style="background:var(--wf-2)"></i>中</span><span><i style="background:var(--wf-1)"></i>弱</span><span><i style="background:#fff"></i>收不到</span><span>▮ 牆（缺口是門）</span></div>' +
      '<div class="wf-devs mt1" id="wf-devs"></div>' +
      '<div class="row mt2"><button type="button" class="btn go" id="wf-ok">✅ 確認</button><span class="tiny soft" id="wf-msg">還沒放基地臺</span></div></div>';
    var svg = el.querySelector('#wf-map');
    function draw() {
      var h = '';
      for (var x = 0; x < W; x++) for (var y = 0; y < H; y++) {
        var s = ap ? sig(lay, ap, { x: x, y: y }, view) : -1, col = s > 2.5 ? 'var(--wf-3)' : s > 1 ? 'var(--wf-2)' : s > 0 ? 'var(--wf-1)' : '#fff';
        h += '<rect class="wf-c" data-x="' + x + '" data-y="' + y + '" x="' + (x * CS) + '" y="' + (y * CS) + '" width="' + CS + '" height="' + CS + '" fill="' + col + '" stroke="#e2e8f0"/>';
      }
      lay.walls.forEach(function (w) {
        if (w.v) h += '<line x1="' + w.x * CS + '" y1="' + w.y0 * CS + '" x2="' + w.x * CS + '" y2="' + w.d0 * CS + '" class="wf-w"/><line x1="' + w.x * CS + '" y1="' + w.d1 * CS + '" x2="' + w.x * CS + '" y2="' + w.y1 * CS + '" class="wf-w"/>';
        else h += '<line x1="' + w.x0 * CS + '" y1="' + w.y * CS + '" x2="' + w.d0 * CS + '" y2="' + w.y * CS + '" class="wf-w"/><line x1="' + w.d1 * CS + '" y1="' + w.y * CS + '" x2="' + w.x1 * CS + '" y2="' + w.y * CS + '" class="wf-w"/>';
      });
      lay.devs.forEach(function (d) { h += '<text x="' + (d.x * CS + CS / 2) + '" y="' + (d.y * CS + CS / 2 + 9) + '" text-anchor="middle" font-size="26" pointer-events="none">' + d.ic + '</text>'; });
      if (ap) h += '<text x="' + (ap.x * CS + CS / 2) + '" y="' + (ap.y * CS + CS / 2 + 9) + '" text-anchor="middle" font-size="28" pointer-events="none">📡</text>';
      svg.innerHTML = h;
      svg.querySelectorAll('.wf-c').forEach(function (r) {
        r.onclick = function () {
          var c = { x: +r.dataset.x, y: +r.dataset.y };
          if (lay.devs.some(function (d) { return d.x === c.x && d.y === c.y; })) return;
          ap = c; draw();
        };
      });
      el.querySelector('#wf-devs').innerHTML = lay.devs.map(function (d, i) {
        var s24 = ap ? sig(lay, ap, d, 'g24') : -1, s5 = ap ? sig(lay, ap, d, 'g5') : -1;
        return '<div class="wf-dev" data-i="' + i + '"><span class="ic">' + d.ic + '</span><b>' + d.t + '</b>' + (d.need5 ? '<span class="chip">要 5GHz</span>' : '') +
          '<span class="tiny soft">2.4GHz ' + (ap ? bars(s24) : '—') + '　5GHz ' + (ap ? bars(s5) : '—') + '</span>' +
          '<span class="wf-bands">' + ['g24', 'g5'].map(function (b) { return '<button type="button" class="btn sm wf-b' + (pickBand[i] === b ? ' on' : '') + '" data-i="' + i + '" data-b="' + b + '">' + BAND[b].label + '</button>'; }).join('') + '</span></div>';
      }).join('');
      el.querySelectorAll('.wf-b').forEach(function (b) { b.onclick = function () { pickBand[+b.dataset.i] = b.dataset.b; draw(); }; });
      el.querySelector('#wf-msg').textContent = ap ? '基地臺放在第 ' + (ap.y + 1) + ' 列、第 ' + (ap.x + 1) + ' 行（可以再點別的地方移動）' : '還沒放基地臺';
    }
    el.querySelectorAll('.wf-v').forEach(function (b) { b.onclick = function () { view = b.dataset.v; el.querySelectorAll('.wf-v').forEach(function (x) { x.classList.toggle('on', x === b); }); draw(); }; });
    el.querySelector('#wf-ok').onclick = function () {
      if (!ap) { el.querySelector('#wf-msg').textContent = '先點平面圖放基地臺'; return; }
      if (pickBand.indexOf(null) >= 0) { el.querySelector('#wf-msg').textContent = '每個裝置都要選頻段'; return; }
      api.send({ ap: ap, bands: pickBand });
    };
    draw();
  };
  L._wifi = { sig: sig, BAND: BAND };   // 給測試用（算訊號的規則本來就寫在畫面上，不是答案）

  /* =================================================================
     🔌 教室拉線（N1）
     點一個孔、再點另一個孔就接一條線（點有線的孔可以拔掉）→ 按「測試連線」（伺服器判斷）
     ================================================================= */
  L.wireRoom = function (el, api) {
    var pcs = api.pub.pcs, SW = api.pub.sw;
    var nodes = [{ id: 'wall', ic: '🧱', t: '牆上的光纖孔', ports: ['out'] }, { id: 'modem', ic: '📞', t: '數據機', ports: ['in', 'out'] },
      { id: 'router', ic: '🧭', t: '路由器', ports: ['wan', 'l1', 'l2', 'l3', 'l4'] }];
    for (var s = 1; s <= SW; s++) nodes.push({ id: 'sw' + s, ic: '🔀', t: '交換器' + (SW > 1 ? ' ' + s : ''), ports: ['up'].concat([1, 2, 3, 4, 5, 6, 7].map(function (x) { return 'p' + x; })) });
    for (var p = 1; p <= pcs; p++) nodes.push({ id: 'pc' + p, ic: '🖥️', t: '電腦 ' + p, ports: ['nic'], pc: true });
    var cables = [], selPort = null;
    var PN = { out: '出', in: '入', wan: 'WAN', up: '上行', nic: '網路孔' };
    function pname(pid) { return PN[pid] || (pid[0] === 'l' ? 'LAN' + pid.slice(1) : pid.slice(1)); }
    el.dataset.lab = 'wireRoom'; el.dataset.pcs = pcs;
    el.innerHTML = '<div class="wr">' +
      '<p class="small">教室要讓 <b>' + pcs + ' 台電腦</b>用網路線上網。<b>點一個孔、再點另一個孔</b>就接上一條線；點有線的孔可以拔掉。接好按「🔌 測試連線」。</p>' +
      tip(api, '訊號從牆上的光纖孔進來：光纖孔 → 數據機（轉換訊號）→ 路由器 WAN（對外）→ 路由器 LAN（對內）→ 電腦。路由器只有 4 個 LAN 孔，不夠就接交換器。') +
      '<div class="wr-board" id="wr-board"><svg class="wr-lines" id="wr-lines"></svg>' +
      '<div class="wr-row">' + nodes.filter(function (n) { return !n.pc; }).map(nodeHTML).join('') + '</div>' +
      '<div class="wr-row wr-pcs">' + nodes.filter(function (n) { return n.pc; }).map(nodeHTML).join('') + '</div></div>' +
      '<div class="row mt2"><button type="button" class="btn go" id="wr-test">🔌 測試連線</button><button type="button" class="btn sm" id="wr-clear">全部拔掉</button><span class="tiny soft" id="wr-msg">還沒接線</span></div></div>';
    function nodeHTML(n) {
      return '<div class="wr-node' + (n.pc ? ' pc' : '') + '" data-node="' + n.id + '"><div class="wr-t"><span class="ic">' + n.ic + '</span>' + esc(n.t) + '</div><div class="wr-ports">' +
        n.ports.map(function (pp) { return '<button type="button" class="wr-port" data-p="' + n.id + '.' + pp + '" title="' + esc(n.t + ' ' + pname(pp)) + '">' + pname(pp) + '</button>'; }).join('') + '</div></div>';
    }
    var board = el.querySelector('#wr-board'), lines = el.querySelector('#wr-lines'), msg = el.querySelector('#wr-msg');
    function cableOf(p) { for (var i = 0; i < cables.length; i++) if (cables[i][0] === p || cables[i][1] === p) return i; return -1; }
    function center(p) { var b = board.querySelector('[data-p="' + p + '"]').getBoundingClientRect(), o = board.getBoundingClientRect(); return [b.left - o.left + b.width / 2, b.top - o.top + b.height / 2]; }
    var COLORS = ['#2563eb', '#16a34a', '#9333ea', '#ea580c', '#0891b2', '#db2777', '#65a30d', '#b45309'];
    function draw() {
      var o = board.getBoundingClientRect();
      lines.setAttribute('viewBox', '0 0 ' + o.width + ' ' + o.height); lines.setAttribute('width', o.width); lines.setAttribute('height', o.height);
      lines.innerHTML = cables.map(function (c, i) { var a = center(c[0]), b = center(c[1]); return '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + COLORS[i % COLORS.length] + '" stroke-width="3" stroke-linecap="round" opacity=".85"/>'; }).join('');
      board.querySelectorAll('.wr-port').forEach(function (b) { b.classList.toggle('on', cableOf(b.dataset.p) >= 0); b.classList.toggle('sel', b.dataset.p === selPort); });
      msg.textContent = selPort ? '選了「' + selPort.replace('.', ' ') + '」，再點另一個孔接上' : '已接 ' + cables.length + ' 條線';
    }
    board.querySelectorAll('.wr-port').forEach(function (b) {
      b.onclick = function () {
        var p = b.dataset.p;
        board.querySelectorAll('.wr-node').forEach(function (x) { x.classList.remove('lit', 'dead'); });
        if (!selPort) { var ci = cableOf(p); if (ci >= 0) { cables.splice(ci, 1); draw(); return; } selPort = p; draw(); return; }
        if (selPort === p) { selPort = null; draw(); return; }
        if (selPort.split('.')[0] === p.split('.')[0]) { msg.textContent = '同一台設備的兩個孔不能互接'; selPort = null; draw(); return; }
        [selPort, p].forEach(function (q) { var ci = cableOf(q); if (ci >= 0) cables.splice(ci, 1); });
        cables.push([selPort, p]); selPort = null; draw();
      };
    });
    el.querySelector('#wr-clear').onclick = function () { cables = []; selPort = null; draw(); };
    window.addEventListener('resize', function () { if (document.body.contains(board)) draw(); });
    el.querySelector('#wr-test').onclick = function () {
      if (!cables.length) { msg.textContent = '還沒接線'; return; }
      api.send({ cables: cables }).then(function (r) {   // 伺服器回傳「從光纖孔一路通到哪些設備」，把它們點亮
        var lit = {}; ((r && r.data && r.data.lit) || []).forEach(function (id) { lit[id] = 1; });
        if (!r || !r.data) return;
        board.querySelectorAll('.wr-node').forEach(function (d) { var id = d.dataset.node; d.classList.toggle('lit', !!lit[id]); d.classList.toggle('dead', /^pc/.test(id) && !lit[id]); });
      });
    };
    setTimeout(draw, 0);
  };

  /* =================================================================
     🧵 佈線工程師（N2）
     每一段線路選線材：雙絞線便宜但只能約 100 公尺；光纖可以很遠但很貴；有線電視訊號用同軸電纜。
     ================================================================= */
  var CAB = { tp: { t: '雙絞線', ic: '🔀', cost: 1, col: '#2563eb' }, fiber: { t: '光纖', ic: '💡', cost: 5, col: '#ea580c' }, coax: { t: '同軸電纜', ic: '📺', cost: 2, col: '#7c3aed' } };
  L.cablePlan = function (el, api) {
    var spots = api.pub.spots, budget = api.pub.budget, pick = spots.map(function () { return null; });
    el.dataset.lab = 'cablePlan'; el.dataset.spots = JSON.stringify(spots);
    el.innerHTML = '<div class="cp"><p class="small">幫學校拉網路線：每一段選一種線材。<b>預算 $' + budget.toLocaleString() + '</b>。</p>' +
      '<div class="cp-rule">' + Object.keys(CAB).map(function (k) { var c = CAB[k]; return '<span style="border-color:' + c.col + '">' + c.ic + ' <b>' + c.t + '</b> 每公尺 $' + c.cost + (k === 'tp' ? '・最長約 100 公尺' : k === 'fiber' ? '・可到數公里' : '・有線電視訊號用') + '</span>'; }).join('') + '</div>' +
      tip(api, '超過 100 公尺的網路線只能用光纖；100 公尺以內用便宜的雙絞線才不會超支；電視訊號用同軸電纜。') +
      '<div class="cp-list mt1" id="cp-list"></div>' +
      '<div class="row between mt2"><div class="bold" id="cp-sum"></div><button type="button" class="btn go" id="cp-ok">✅ 驗收</button></div></div>';
    function draw() {
      var sum = 0;
      el.querySelector('#cp-list').innerHTML = spots.map(function (s, i) {
        var c = pick[i]; if (c) sum += CAB[c].cost * s.dist;
        return '<div class="cp-row"' + (c ? ' style="border-left-color:' + CAB[c].col + '"' : '') + '><div><b>' + esc(s.a) + ' → ' + esc(s.b) + '</b><span class="tiny soft">' + (s.kind === 'tv' ? '📺 傳有線電視訊號' : '🌐 網路資料') + '・距離 <b>' + s.dist + ' 公尺</b></span></div>' +
          '<div class="cp-btns">' + Object.keys(CAB).map(function (k) { return '<button type="button" class="btn sm cp-c' + (c === k ? ' on' : '') + '" data-i="' + i + '" data-c="' + k + '">' + CAB[k].ic + ' ' + CAB[k].t + '</button>'; }).join('') + '</div>' +
          (c ? '<span class="tiny bold cp-cost">$' + (CAB[c].cost * s.dist).toLocaleString() + '</span>' : '') + '</div>';
      }).join('');
      el.querySelector('#cp-sum').innerHTML = '花費 <span style="color:' + (sum > budget ? 'var(--bad)' : 'var(--ok)') + '">$' + sum.toLocaleString() + '</span> / 預算 $' + budget.toLocaleString();
      el.querySelectorAll('.cp-c').forEach(function (b) { b.onclick = function () { pick[+b.dataset.i] = b.dataset.c; draw(); }; });
    }
    el.querySelector('#cp-ok').onclick = function () {
      if (pick.indexOf(null) >= 0) return warn(api, '每一段都要選線材');
      api.send({ pick: pick });
    };
    draw();
  };

  /* =================================================================
     🔎 IP 設定面板（N4）：4 組 × 8 個位元開關，調出指定的 IPv4 位址
     挑戰版：只給條件（172.16～172.31 的私有位址，第 3、4 組是…），自己決定第 2 組
     ================================================================= */
  L.ipPanel = function (el, api) {
    var P = api.pub, target = P.target, cond, W8 = [128, 64, 32, 16, 8, 4, 2, 1];
    if (target) cond = '把這台電腦的位址設定成 <b class="mono">' + target.join('.') + '</b>';
    else { cond = '設定一個 <b>172.16～172.31 開頭的私有位址</b>，第 3 組是 <b>' + P.t3 + '</b>、第 4 組是 <b>' + P.t4 + '</b>（第 2 組自己決定）'; el.dataset.t3 = P.t3; el.dataset.t4 = P.t4; }
    var bits = [0, 0, 0, 0].map(function () { return [0, 0, 0, 0, 0, 0, 0, 0]; });
    el.dataset.lab = 'ipPanel'; if (target) el.dataset.target = target.join('.');
    el.innerHTML = '<div class="ip"><p class="small">' + cond + '。每一組是 8 個位元，點開關切換 0／1。</p>' +
      tip(api, '每一組從 128 開始：放得下就打開，再看剩下多少。192 ＝ 128＋64；168 ＝ 128＋32＋8。') +
      '<div class="ip-rows" id="ip-rows"></div><div class="ip-out mt1">目前的位址：<b class="mono" id="ip-now"></b></div>' +
      '<div class="row mt2"><button type="button" class="btn go" id="ip-ok">✅ 套用設定</button><button type="button" class="btn sm" id="ip-clr">全部歸零</button></div></div>';
    function val(o) { return bits[o].reduce(function (a, b, j) { return a + b * W8[j]; }, 0); }
    function draw() {
      el.querySelector('#ip-rows').innerHTML = bits.map(function (row, o) {
        return '<div class="ip-row"><span class="tiny bold">第 ' + (o + 1) + ' 組</span><div class="ip-bits">' + row.map(function (b, j) { return '<button type="button" class="ip-bit' + (b ? ' on' : '') + '" data-o="' + o + '" data-j="' + j + '"><small>' + W8[j] + '</small>' + b + '</button>'; }).join('') + '</div><b class="mono ip-dec">' + val(o) + '</b></div>';
      }).join('');
      el.querySelector('#ip-now').textContent = [0, 1, 2, 3].map(val).join('.');
      el.querySelectorAll('.ip-bit').forEach(function (b) { b.onclick = function () { bits[+b.dataset.o][+b.dataset.j] ^= 1; draw(); }; });
    }
    el.querySelector('#ip-clr').onclick = function () { bits = bits.map(function () { return [0, 0, 0, 0, 0, 0, 0, 0]; }); draw(); };
    el.querySelector('#ip-ok').onclick = function () { api.send({ bits: bits }); };
    draw();
  };

  /* =================================================================
     ✂️ IPv6 壓縮機（N5）：點「開頭的 0」讓它消失；選連續的 0 組合併成 ::；壓到最短（最短寫法只有伺服器知道）
     ================================================================= */
  L.v6Press = function (el, api) {
    var orig = api.pub.orig, g = orig.slice(), sel = {}, col = null;   // col = { s, len }
    el.dataset.lab = 'v6Press'; el.dataset.orig = orig.join(':');
    el.innerHTML = '<div class="v6"><p class="small">把這個 IPv6 位址壓到<b>最短</b>：點每組<b>開頭的 0</b> 讓它消失；點選連續的 <b>0000</b> 方塊，按「合併成 ::」（只能用一次）。</p>' +
      tip(api, '規則：① 開頭的 0 可以省略（0db8 → db8）② 0000 可以寫成 0 ③ 連續好幾組 0 用 :: 代替，只能用一次，要用在最長的那一段。') +
      '<div class="v6-grid mt1" id="v6-grid"></div><div class="ip-out mt1">現在的寫法：<b class="mono" id="v6-now"></b>　<span class="tiny soft" id="v6-len"></span></div>' +
      '<div class="row mt2"><button type="button" class="btn" id="v6-col">🔗 合併成 ::</button><button type="button" class="btn sm" id="v6-reset">↺ 重來</button><button type="button" class="btn go" id="v6-ok">✅ 壓好了</button><span class="tiny soft" id="v6-msg"></span></div></div>';
    function text() {
      if (!col) return g.join(':');
      return g.slice(0, col.s).join(':') + '::' + g.slice(col.s + col.len).join(':');
    }
    function draw() {
      el.querySelector('#v6-grid').innerHTML = g.map(function (x, i) {
        var inCol = col && i >= col.s && i < col.s + col.len;
        return '<div class="v6-g' + (sel[i] ? ' sel' : '') + (inCol ? ' col' : '') + '" data-g="' + i + '">' + (inCol ? '<span class="v6-c">::</span>' :
          x.split('').map(function (ch, j) { var lead = /^0+$/.test(x.slice(0, j + 1)) && x.length > 1; return '<button type="button" class="v6-ch' + (lead ? ' lead' : '') + '" data-g="' + i + '" data-j="' + j + '">' + ch + '</button>'; }).join('')) +
          (inCol ? '' : '<button type="button" class="v6-pick" data-g="' + i + '" title="選這一組">' + (sel[i] ? '☑' : '☐') + '</button>') + '</div>';
      }).join('');
      var t = text();
      el.querySelector('#v6-now').textContent = t; el.querySelector('#v6-len').textContent = '（' + t.length + ' 個字）';
      el.querySelectorAll('.v6-ch').forEach(function (b) {
        b.onclick = function () {
          var i = +b.dataset.g, j = +b.dataset.j, x = g[i];
          if (x.length === 1) return msg('這一組只剩一個數字了，不能再刪');
          if (!/^0+$/.test(x.slice(0, j + 1))) return msg('只有「開頭」的 0 可以省略 —— 這個不能刪');
          g[i] = x.slice(1); msg(''); draw();
        };
      });
      el.querySelectorAll('.v6-pick').forEach(function (b) { b.onclick = function () { var i = +b.dataset.g; sel[i] = !sel[i]; draw(); }; });
    }
    function msg(t) { el.querySelector('#v6-msg').textContent = t; }
    el.querySelector('#v6-col').onclick = function () {
      var ids = Object.keys(sel).filter(function (k) { return sel[k]; }).map(Number).sort(function (a, b) { return a - b; });
      if (col) return msg(':: 只能用一次！');
      if (!ids.length) return msg('先點方塊右上角的 ☐，選要合併的 0 組');
      if (ids.some(function (i, k) { return k && i !== ids[k - 1] + 1; })) return msg('要選「連續」的組');
      if (ids.some(function (i) { return !/^0+$/.test(g[i]); })) return msg('只有全部是 0 的組才能合併');
      col = { s: ids[0], len: ids.length }; sel = {}; msg(''); draw();
    };
    el.querySelector('#v6-reset').onclick = function () { g = orig.slice(); sel = {}; col = null; msg(''); draw(); };
    el.querySelector('#v6-ok').onclick = function () { api.send({ text: text(), col: col }); };
    draw();
  };

  /* =================================================================
     🌐 DNS 電話簿（N6）：拆網址 → 查 DNS 電話簿找 IP → 連到那台伺服器（每一步都由伺服器判斷）
     ================================================================= */
  L.dnsBook = function (el, api) {
    var P = api.pub, dom = P.dom, rows = P.rows, servers = P.servers;
    var parts = dom.split('.'), labels = parts.map(function () { return null; }), step = 1, O = [['host', '主機'], ['org', '機構'], ['cat', '類別'], ['area', '地區']];
    el.dataset.lab = 'dnsBook'; el.dataset.dom = dom;
    el.innerHTML = '<div class="dn"><div class="dn-bar">🌐 <span class="mono">https://' + esc(dom) + '</span></div>' +
      tip(api, '網址由左到右：主機 → 機構 → 類別 → 地區。DNS 電話簿要找「一模一樣」的網域名稱。') +
      '<div id="dn-step" class="mt1"></div></div>';
    function next(r) { if (r && r.ok && r.partial) { step++; draw(); } }
    function draw() {
      var box = el.querySelector('#dn-step');
      if (step === 1) {
        box.innerHTML = '<p class="small bold">① 拆網址：每一段是什麼？</p><div class="dn-parts">' + parts.map(function (p, i) {
          return '<div class="dn-part"><b class="mono">' + esc(p) + '</b><select class="input" data-i="' + i + '" aria-label="' + esc(p) + ' 是什麼"><option value="">— 選 —</option>' + O.map(function (o) { return '<option value="' + o[0] + '"' + (labels[i] === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>';
        }).join('') + '</div><div class="row mt2"><button type="button" class="btn go" id="dn-1">下一步：查 DNS →</button></div>';
        box.querySelectorAll('select').forEach(function (s) { s.onchange = function () { labels[+s.dataset.i] = s.value || null; }; });
        box.querySelector('#dn-1').onclick = function () {
          if (labels.indexOf(null) >= 0) return warn(api, '每一段都要選');
          api.send({ op: 'parts', labels: labels }).then(next);
        };
      } else if (step === 2) {
        box.innerHTML = '<p class="small bold">② 查 DNS 電話簿：「' + esc(dom) + '」的 IP 是？（點那一列）</p><table class="t dn-book"><tr><th>網域名稱</th><th>IP 位址</th></tr>' +
          rows.map(function (r, i) { return '<tr class="dn-row" data-i="' + i + '"><td class="mono">' + esc(r.d) + '</td><td class="mono">' + r.ip + '</td></tr>'; }).join('') + '</table>';
        box.querySelectorAll('.dn-row').forEach(function (tr) { tr.onclick = function () { api.send({ op: 'row', i: +tr.dataset.i }).then(next); }; });
      } else {
        box.innerHTML = '<p class="small bold">③ 瀏覽器要連到哪一台伺服器？（點它）</p><div class="dn-srv">' + servers.map(function (s) { return '<button type="button" class="dn-s" data-ip="' + s + '">🖥️<span class="mono">' + s + '</span></button>'; }).join('') + '</div>';
        box.querySelectorAll('.dn-s').forEach(function (b) {
          b.onclick = function () { api.send({ op: 'ip', ip: b.dataset.ip }).then(function (r) { if (r && r.ok) b.classList.add('on'); }); };
        });
      }
    }
    draw();
  };

  /* =================================================================
     📨 郵件旅程（N7）：一站一站把信送到收件人，每一段選對協定（下一站、協定都由伺服器判斷）
     🕵️ 偷看者：同一份表單用 http／https 送出，看偷看者看到什麼
     ================================================================= */
  L.mailTrip = function (el, api) {
    var P = api.pub, nm = P.names, all = P.stations, here = P.start, done = [], finished = false, pSel = null, sSel = null;
    el.dataset.lab = 'mailTrip'; el.dataset.names = nm.join(',');
    el.innerHTML = '<div class="mt"><p class="small">把 <b>' + nm[0] + '</b> 寫給 <b>' + nm[1] + '</b> 的信，一站一站送過去：每一段先選<b>下一站</b>，再選<b>用什麼協定</b>。</p>' +
      tip(api, '寄出去（電腦 → 伺服器、伺服器 → 伺服器）用 SMTP；收件人把信從自己的伺服器下載到電腦用 POP3。') +
      '<div class="mt-map" id="mt-map"></div><div id="mt-ctl" class="mt1"></div></div>';
    function st(id) { return all.filter(function (s) { return s.id === id; })[0]; }
    function draw() {
      el.querySelector('#mt-map').innerHTML = all.map(function (s) { var h = here === s.id; return '<div class="mt-st' + (h ? ' here' : '') + (done.indexOf(s.id) >= 0 ? ' done' : '') + '"><span class="ic">' + s.ic + '</span>' + esc(s.t) + (h ? '<span class="mt-env">✉️</span>' : '') + '</div>'; }).join('');
      if (finished) { el.querySelector('#mt-ctl').innerHTML = ''; return; }
      el.querySelector('#mt-ctl').innerHTML = '<p class="small bold">✉️ 信現在在「' + esc(st(here).t) + '」。下一站？</p><div class="mt-opts">' +
        all.filter(function (s) { return s.id !== here; }).map(function (s) { return '<button type="button" class="btn sm mt-s' + (sSel === s.id ? ' on' : '') + '" data-s="' + s.id + '">' + s.ic + ' ' + esc(s.t) + '</button>'; }).join('') + '</div>' +
        '<p class="small bold mt1">用什麼協定？</p><div class="mt-opts">' + ['SMTP', 'POP3', 'HTTPS'].map(function (p) { return '<button type="button" class="btn sm mt-p' + (pSel === p ? ' on' : '') + '" data-p="' + p + '">' + p + '</button>'; }).join('') + '</div>' +
        '<div class="row mt1"><button type="button" class="btn go" id="mt-go">✉️ 送出這一段</button></div>';
      el.querySelectorAll('.mt-s').forEach(function (b) { b.onclick = function () { sSel = b.dataset.s; draw(); }; });
      el.querySelectorAll('.mt-p').forEach(function (b) { b.onclick = function () { pSel = b.dataset.p; draw(); }; });
      el.querySelector('#mt-go').onclick = function () {
        if (!sSel || !pSel) return warn(api, '下一站和協定都要選');
        api.send({ to: sSel, p: pSel }).then(function (r) {
          if (!r || !r.ok) return;
          done.push(here); here = (r.data && r.data.at) || sSel; sSel = null; pSel = null;
          if (!r.partial) finished = true;
          draw();
        });
      };
    }
    draw();
  };
  function scramble(t) { var c = '█▓▒░#@%&*$?'; return t.split('').map(function () { return c[rnd(c.length)]; }).join('') + '…'; }
  L.spy = function (el, api) {
    var acct = api.pub.acct, pw = api.pub.pw, mode = null;
    el.dataset.lab = 'spy';
    el.innerHTML = '<div class="sp"><p class="small">登入學校系統：先選要用 <b>http</b> 還是 <b>https</b> 送出，再按「登入」。右邊的 🕵️ 偷看者會攔截網路上傳的資料。<b>任務：不能讓偷看者看到密碼。</b></p>' +
      tip(api, 'https 的 s ＝ secure，傳送的資料會加密；http 是明文，偷看者看得一清二楚。') +
      '<div class="sp-grid"><div class="sp-form"><div class="row"><button type="button" class="btn sm sp-m" data-m="http">http://</button><button type="button" class="btn sm sp-m" data-m="https">🔒 https://</button></div>' +
      '<label class="tiny bold mt1">帳號<input class="input" value="' + esc(acct) + '" readonly></label><label class="tiny bold">密碼<input class="input" type="password" value="' + esc(pw) + '" readonly></label>' +
      '<button type="button" class="btn go mt1" id="sp-go">登入</button></div><div class="sp-spy"><b>🕵️ 偷看者攔截到的內容</b><pre id="sp-see">（還沒送出）</pre></div></div></div>';
    el.querySelectorAll('.sp-m').forEach(function (b) { b.onclick = function () { mode = b.dataset.m; el.querySelectorAll('.sp-m').forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
    el.querySelector('#sp-go').onclick = function () {
      if (!mode) return warn(api, '先選 http 或 https');
      var see = el.querySelector('#sp-see');
      see.textContent = mode === 'http' ? 'POST /login\naccount=' + acct + '\npassword=' + pw : scramble('account=' + acct + '&password=' + pw) + '\n（加密了，看不懂）';
      api.send({ mode: mode });
    };
  };

  /* =================================================================
     🚀 下載模擬器（N9）：選網路方案和基地臺，按「開始下載」看進度條跑
     條件：時間內下載完（大家同時上網、平分頻寬）；挑戰版還要花費最低（最低多少只有伺服器知道）
     ================================================================= */
  var PLAN = [{ id: 'p50', t: '50 Mbps', v: 50, $: 399 }, { id: 'p100', t: '100 Mbps', v: 100, $: 499 }, { id: 'p300', t: '300 Mbps', v: 300, $: 699 }, { id: 'p500', t: '500 Mbps', v: 500, $: 899 }];
  var APS = [{ id: 'w4', t: 'Wi-Fi 4 基地臺（最快 150 Mbps）', v: 150, $: 600 }, { id: 'w5', t: 'Wi-Fi 5 基地臺（最快 866 Mbps）', v: 866, $: 1500 }, { id: 'w6', t: 'Wi-Fi 6 基地臺（最快 1200 Mbps）', v: 1200, $: 2800 }];
  function dlTime(p, a, n, mb) { return mb / (Math.min(p.v, a.v) / n / 8); }
  function dlCost(p, a) { return p.$ + Math.round(a.$ / 24); }   // 每月花費：方案月付＋基地臺攤成 24 個月
  L.dlSim = function (el, api) {
    var sc = api.pub, P = null, A = null, running = false;
    el.dataset.lab = 'dlSim'; el.dataset.sc = JSON.stringify({ n: sc.n, mb: sc.mb, T: sc.T });
    el.innerHTML = '<div class="dl"><p class="small">家裡 <b>' + sc.n + ' 個人同時上網</b>（平分頻寬）。你要下載 <b>' + sc.mb + ' MB</b> 的遊戲更新，要在 <b>' + sc.T + ' 秒內</b>完成' + (api.hard ? '，而且<b>每月花費最少</b>' : '') + '。選方案再按「開始下載」。</p>' +
      tip(api, '速度被「網路方案」和「基地臺」比較慢的那個卡住，再除以人數、除以 8 變成 MB/s。') +
      '<div class="dl-grid"><div><p class="tiny bold">🏢 網路方案（ISP）</p>' + PLAN.map(function (p) { return '<button type="button" class="btn sm dl-p" data-id="' + p.id + '">' + p.t + '<small>月付 $' + p.$ + '</small></button>'; }).join('') + '</div>' +
      '<div><p class="tiny bold">📶 基地臺</p>' + APS.map(function (a) { return '<button type="button" class="btn sm dl-a" data-id="' + a.id + '">' + a.t + '<small>$' + a.$ + '（攤成月付約 $' + Math.round(a.$ / 24) + '）</small></button>'; }).join('') + '</div></div>' +
      '<div class="dl-bar mt2"><i id="dl-fill"></i><span id="dl-txt">還沒開始</span></div>' +
      '<div class="row mt2"><button type="button" class="btn go" id="dl-go">▶ 開始下載</button><span class="tiny soft" id="dl-msg"></span></div></div>';
    function mark() { el.querySelectorAll('.dl-p').forEach(function (b) { b.classList.toggle('on', P && b.dataset.id === P.id); }); el.querySelectorAll('.dl-a').forEach(function (b) { b.classList.toggle('on', A && b.dataset.id === A.id); }); }
    el.querySelectorAll('.dl-p').forEach(function (b) { b.onclick = function () { if (running) return; P = PLAN.filter(function (p) { return p.id === b.dataset.id; })[0]; mark(); }; });
    el.querySelectorAll('.dl-a').forEach(function (b) { b.onclick = function () { if (running) return; A = APS.filter(function (a) { return a.id === b.dataset.id; })[0]; mark(); }; });
    el.querySelector('#dl-go').onclick = function () {
      if (!P || !A || running) { if (!running) el.querySelector('#dl-msg').textContent = '網路方案和基地臺都要選'; return; }
      running = true;
      var t = dlTime(P, A, sc.n, sc.mb), each = Math.min(P.v, A.v) / sc.n, fill = el.querySelector('#dl-fill'), txt = el.querySelector('#dl-txt');
      var anim = Math.min(3, Math.max(1.2, t / 40)), t0 = performance.now();
      el.querySelector('#dl-msg').textContent = '每人約 ' + (Math.round(each * 10) / 10) + ' Mbps ＝ ' + (Math.round(each / 8 * 100) / 100) + ' MB/s';
      (function step() {
        var f = Math.min(1, (performance.now() - t0) / 1000 / anim);
        fill.style.width = (f * 100) + '%'; fill.style.background = t <= sc.T ? 'var(--ok)' : 'var(--bad)';
        txt.textContent = '⏱ ' + (Math.round(f * t * 10) / 10) + ' 秒　' + Math.round(f * sc.mb) + ' / ' + sc.mb + ' MB';
        if (f < 1) return requestAnimationFrame(step);
        running = false;
        api.send({ p: P.id, a: A.id });
      })();
    };
  };
  L._dl = { PLAN: PLAN, APS: APS, time: dlTime, cost: dlCost };

  /* =================================================================
     ▮ 條碼掃描器（N10）：按「掃描」讓雷射劃過條碼，一格一格讀出 1／0，再換成數字
     挑戰版（印條碼）：點格子塗黑／塗白，印出代表指定數字的條碼（不顯示總和）
     ================================================================= */
  L.barcodeScan = function (el, api) {
    var b = api.pub.b, read = 0;
    el.dataset.lab = 'barcodeScan';
    el.innerHTML = '<div class="bc"><p class="small">簡化版條碼：<b>黑色吸光＝1、白色反光＝0</b>。按「🔦 掃描」讓雷射劃過條碼，看掃描器讀出什麼，再換成十進位數字。</p>' +
      tip(api, '讀出 8 個位元後，權值由左到右是 128、64、32、16、8、4、2、1，把 1 的權值加起來。') +
      '<div class="bc-code" id="bc-code">' + b.split('').map(function (x) { return '<i class="' + (x === '1' ? 'k' : 'w') + '"></i>'; }).join('') + '<span class="bc-laser" id="bc-laser"></span></div>' +
      '<div class="bc-read" id="bc-read">' + b.split('').map(function (_, i) { return '<span data-i="' + i + '">?</span>'; }).join('') + '</div>' +
      '<div class="row mt2"><button type="button" class="btn" id="bc-scan">🔦 掃描</button><input class="input" id="bc-ans" placeholder="換成十進位" aria-label="換成十進位" style="max-width:10rem;margin:0" disabled><button type="button" class="btn go" id="bc-ok" disabled>確定</button></div></div>';
    var laser = el.querySelector('#bc-laser');
    el.querySelector('#bc-scan').onclick = function () {
      this.disabled = true; read = 0; laser.style.display = 'block';
      var iv = setInterval(function () {
        laser.style.left = (read * 12.5 + 6) + '%';
        var s = el.querySelector('#bc-read [data-i="' + read + '"]'); s.textContent = b[read]; s.classList.add('on');
        if (++read >= 8) { clearInterval(iv); setTimeout(function () { laser.style.display = 'none'; }, 250); el.querySelector('#bc-ans').disabled = false; el.querySelector('#bc-ok').disabled = false; el.querySelector('#bc-ans').focus(); }
      }, 260);
    };
    el.querySelector('#bc-ok').onclick = function () {
      var v = el.querySelector('#bc-ans').value.replace(/\s/g, '');
      if (!/^\d+$/.test(v)) return warn(api, '請輸入數字');
      api.send({ v: +v });
    };
  };
  L.barcodePrint = function (el, api) {
    var d = api.pub.d, bits = [0, 0, 0, 0, 0, 0, 0, 0];
    el.dataset.lab = 'barcodePrint'; el.dataset.d = d;
    el.innerHTML = '<div class="bc"><p class="small">印一張代表 <b class="mono" style="font-size:1.3rem">' + d + '</b> 的條碼：點格子塗黑（1）或塗白（0）。<b>這次不顯示總和</b>，自己算！</p>' +
      tip(api, '從 128 開始：放得下就塗黑，再看剩下多少。') +
      '<div class="bc-code print" id="bc-print"></div><div class="tiny soft mt1">權值：128　64　32　16　8　4　2　1</div>' +
      '<div class="row mt2"><button type="button" class="btn go" id="bc-pok">🖨️ 印出來</button></div></div>';
    function draw() {
      el.querySelector('#bc-print').innerHTML = bits.map(function (x, i) { return '<button type="button" class="bc-cell ' + (x ? 'k' : 'w') + '" data-i="' + i + '" aria-label="第 ' + (i + 1) + ' 格"></button>'; }).join('');
      el.querySelectorAll('.bc-cell').forEach(function (c) { c.onclick = function () { bits[+c.dataset.i] ^= 1; draw(); }; });
    }
    el.querySelector('#bc-pok').onclick = function () { api.send({ bits: bits }); };
    draw();
  };

  CARDGAME.labs = Object.assign(CARDGAME.labs || {}, L);
})();
