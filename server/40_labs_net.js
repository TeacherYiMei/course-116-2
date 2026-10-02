/* 🧪 網路世界 N1～N10（前端：shared/net-labs.js） */
(function () {
  var rnd = svRnd, between = svBetween, pick = svPick, shuffle = svShuffle;

  /* 📦 封包快遞模擬器（N3）：哪幾個封包會遺失、哪一個會重複，只有伺服器知道（按「傳送」才公布抵達的封包） */
  var PH = ['畢業快樂', '明天見喔', '會考加油', '週末去爬山', '記得帶便當', '放學去打球', '謝謝老師'];
  var PH2 = ['明天早上七點集合', '畢業旅行要出發囉', '記得帶水壺和帽子', '資訊課在電腦教室', '週五下午練大隊接力'];
  SV.labs.packetSim = {
    make: function (hard) {
      var msg = pick(hard ? PH2 : PH), n = msg.length, idx = []; for (var i = 1; i <= n; i++) idx.push(i);
      var lost = shuffle(idx).slice(0, hard ? 2 : 1), dup = hard ? pick(idx.filter(function (x) { return lost.indexOf(x) < 0; })) : 0;
      return { pub: { n: n }, sec: { msg: msg, lost: lost, dup: dup, sent: false, resent: {} } };
    },
    check: function (s, v) {
      var chars = s.msg.split('');
      if (v.op === 'send') {
        if (s.sent) svFail('bad-answer');
        s.sent = true;
        var list = chars.map(function (c, i) { return { n: i + 1, c: c }; }); if (s.dup) list.push({ n: s.dup, c: chars[s.dup - 1] });
        var plan = shuffle(list).map(function (p, k) { var drop = s.lost.indexOf(p.n) >= 0; return { n: p.n, c: drop ? null : p.c, lane: rnd(3), delay: k * 0.25 + rnd(5) * 0.1, drop: drop }; });
        return { act: true, out: plan, sec: s };
      }
      if (v.op === 'resend') {
        var num = +v.num;
        if (!s.sent || !(num >= 1 && num <= chars.length)) svFail('bad-answer');
        if (s.lost.indexOf(num) < 0 || s.resent[num]) return svNo('#' + num + ' 已經收到了，不需要重送 —— 看看收件匣或格子裡。', '只有「完全沒收到」的編號才要請對方重送。');
        s.resent[num] = 1;
        return { ok: true, partial: true, sec: s, data: { n: num, c: chars[num - 1] } };
      }
      var slots = (v.slots || []).map(Number);
      if (slots.length !== chars.length || slots.some(function (x) { return !x; })) return { act: true, warn: '還有空格（遺失的要請求重送）' };
      if (s.lost.some(function (x) { return !s.resent[x]; })) svFail('bad-answer');
      var wrong = slots.filter(function (x, i) { return x !== i + 1; }).length;
      if (wrong) return svNo('有 ' + wrong + ' 個格子放錯了，組出來是「' + slots.map(function (x) { return chars[x - 1]; }).join('') + '」。', '看封包上的 # 編號，#1 放第 1 格、#2 放第 2 格…', '先把格子裡的封包都拿回來，再從 #1 開始一個一個放。');
      return svYes('組回「' + s.msg + '」！封包走不同路線、不照順序到，TCP 靠編號重組；遺失的 #' + s.lost.join('、#') + ' 請對方重送' + (s.dup ? '；#' + s.dup + ' 收到兩次，只留一份' : '') + '。');
    }
  };

  /* 📶 Wi-Fi 覆蓋地圖（N8）：訊號怎麼算是課本規則（前端也畫得出覆蓋範圍），判斷在伺服器 */
  var W = 12, H = 8, BAND = { g24: { range: 6.8, loss: 2.2, label: '2.4GHz' }, g5: { range: 4.6, loss: 2.6, label: '5GHz' } };
  var DEV = [{ id: 'tv', ic: '📺', t: '4K 電視', need5: true }, { id: 'nb', ic: '💻', t: '筆電' }, { id: 'ph', ic: '📱', t: '手機' }, { id: 'pr', ic: '🖨️', t: '印表機' }, { id: 'cam', ic: '📷', t: '監視器' }];
  function segCross(ax, ay, bx, by, w) {
    if (w.v) {
      if ((ax - w.x) * (bx - w.x) > 0 || ax === bx) return false;
      var t = (w.x - ax) / (bx - ax), y = ay + t * (by - ay);
      return y >= w.y0 && y <= w.y1 && !(y >= w.d0 && y <= w.d1);
    }
    if ((ay - w.y) * (by - w.y) > 0 || ay === by) return false;
    var t2 = (w.y - ay) / (by - ay), x = ax + t2 * (bx - ax);
    return x >= w.x0 && x <= w.x1 && !(x >= w.d0 && x <= w.d1);
  }
  function sig(lay, ap, p, band) {
    var ax = ap.x + 0.5, ay = ap.y + 0.5, bx = p.x + 0.5, by = p.y + 0.5, d = Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by)), walls = 0;
    lay.walls.forEach(function (w) { if (segCross(ax, ay, bx, by, w)) walls++; });
    return BAND[band].range - d - walls * BAND[band].loss;
  }
  function ok(lay, ap) { return lay.devs.every(function (d) { return d.need5 ? sig(lay, ap, d, 'g5') > 0 : sig(lay, ap, d, 'g24') > 0 || sig(lay, ap, d, 'g5') > 0; }); }
  function wifiLayout(hard) {
    var lay;
    for (var tries = 0; tries < 1200; tries++) {
      var a = between(3, 5), b = between(7, 9), walls = [];
      [a, b].forEach(function (x) { var d = between(1, H - 3); walls.push({ v: true, x: x, y0: 0, y1: H, d0: d, d1: d + 1.4 }); });
      if (hard) { var y = between(3, 5), d = between(b + 1, W - 3); walls.push({ v: false, y: y, x0: b, x1: W, d0: d, d1: d + 1.4 }); }
      var cells = []; for (var x = 0; x < W; x++) for (var yy = 0; yy < H; yy++) cells.push({ x: x, y: yy });
      var kinds = hard ? ['tv', 'tv', pick(['nb', 'ph']), pick(['pr', 'cam'])] : ['tv', pick(['nb', 'ph']), pick(['pr', 'cam'])];
      var devs = shuffle(cells).slice(0, kinds.length).map(function (c, i) { var k = DEV.filter(function (dd) { return dd.id === kinds[i]; })[0]; return { x: c.x, y: c.y, id: kinds[i], ic: k.ic, t: k.t, need5: !!k.need5 }; });
      if (devs.some(function (dd, i) { return devs.some(function (e, j) { return j !== i && Math.abs(dd.x - e.x) + Math.abs(dd.y - e.y) < 3; }); })) continue;
      lay = { walls: walls, devs: devs };
      var good = cells.filter(function (c) { return !devs.some(function (dd) { return dd.x === c.x && dd.y === c.y; }) && ok(lay, c); });
      if (good.length >= 2 && (tries > 600 || good.length / cells.length <= (hard ? 0.12 : 0.25))) return lay;
    }
    return lay;
  }
  SV.labs.wifiMap = {
    make: function (hard) { var lay = wifiLayout(hard); return { pub: lay, sec: lay }; },
    check: function (lay, v) {
      var ap = v.ap, bands = v.bands || [];
      if (!ap || !(ap.x >= 0 && ap.x < W && ap.y >= 0 && ap.y < H) || lay.devs.some(function (d) { return d.x === +ap.x && d.y === +ap.y; })) svFail('bad-answer');
      ap = { x: +ap.x, y: +ap.y };
      var bad = [];
      lay.devs.forEach(function (d, i) {
        var b = bands[i]; if (!BAND[b]) svFail('bad-answer');
        if (d.need5 && b !== 'g5') bad.push(d.ic + d.t + ' 要看 4K，要用速度快的 5GHz');
        else if (sig(lay, ap, d, b) <= 0) bad.push(d.ic + d.t + ' 用 ' + BAND[b].label + ' 收不到（太遠或隔了牆）');
      });
      if (bad.length) return svNo(bad.join('；') + '。', '5GHz 範圍小：要看 4K 的電視，基地臺要靠近它、最好同一個房間；遠的裝置改用 2.4GHz。', '先切到「顯示 5GHz 範圍」，把基地臺移到電視附近，讓電視在深色區；再看其他裝置 2.4GHz 有沒有訊號。');
      return svYes('每個裝置都連上了！5GHz 速度快但範圍小、穿牆衰減大，所以 4K 電視要靠近基地臺；遠的裝置用 2.4GHz 比較穩。');
    }
  };

  /* 🔌 教室拉線（N1）：接線規則與連通檢查在伺服器 */
  function wrKind(p) { var n = p.split('.')[0], q = p.split('.')[1]; return n === 'wall' ? 'wall' : n === 'modem' ? 'modem.' + q : n === 'router' ? (q === 'wan' ? 'rwan' : 'rlan') : n.indexOf('sw') === 0 ? (q === 'up' ? 'swup' : 'swp') : 'pc'; }
  var RULE = { 'wall|modem.in': 1, 'modem.out|rwan': 1, 'rlan|pc': 1, 'rlan|swup': 1, 'swp|pc': 1, 'swp|swup': 1 };
  function wrWhy(a, b) {
    var k = [a, b].sort().join('|');
    if (/pc/.test(k) && /modem/.test(k)) return '電腦直接接數據機：數據機只負責轉換訊號，要經過路由器分配給各台電腦';
    if (/wall/.test(k) && !/modem\.in/.test(k)) return '光纖孔進來的訊號要先接「數據機」轉換';
    if (/modem\.in/.test(k)) return '數據機的「入」要接牆上的光纖孔，「出」才接路由器';
    if (/rwan/.test(k)) return '路由器的 WAN 孔是「對外」的，要接數據機；對內的電腦、交換器接 LAN 孔';
    if (/rlan/.test(k) && /modem/.test(k)) return '數據機要接路由器的 WAN 孔（對外），不是 LAN 孔';
    if (/swp/.test(k) && /rlan/.test(k)) return '交換器接路由器要用「上行」孔';
    if (/swup/.test(k) && /pc/.test(k)) return '電腦要接交換器的一般孔，上行孔是用來接回路由器的';
    if (k === 'pc|pc') return '兩台電腦互接不能上網';
    return '這條線接的位置不對';
  }
  SV.labs.wireRoom = {
    make: function (hard) { var p = { pcs: hard ? between(8, 12) : pick([between(2, 4), between(5, 7)]), sw: hard ? 2 : 1 }; return { pub: p, sec: p }; },
    check: function (s, v) {
      var cables = (v.cables || []).slice(0, 60), ports = {}, bad = [];
      var valid = /^(wall\.out|modem\.(in|out)|router\.(wan|l[1-4])|sw[12]\.(up|p[1-7])|pc\d{1,2}\.nic)$/;
      cables.forEach(function (c) { if (!Array.isArray(c) || c.length !== 2 || !valid.test(c[0]) || !valid.test(c[1])) svFail('bad-answer'); });
      if (!cables.length) return { act: true, warn: '還沒接線' };
      cables.forEach(function (c) { var k1 = wrKind(c[0]) + '|' + wrKind(c[1]), k2 = wrKind(c[1]) + '|' + wrKind(c[0]); if (!RULE[k1] && !RULE[k2]) bad.push(wrWhy(wrKind(c[0]), wrKind(c[1]))); });
      var adj = {}; function add(a, b) { var A = a.split('.')[0], B = b.split('.')[0]; (adj[A] = adj[A] || []).push(B); (adj[B] = adj[B] || []).push(A); }
      cables.forEach(function (c) { var k1 = wrKind(c[0]) + '|' + wrKind(c[1]), k2 = wrKind(c[1]) + '|' + wrKind(c[0]); if (RULE[k1] || RULE[k2]) add(c[0], c[1]); });
      var seen = { wall: 1 }, q = ['wall'];
      while (q.length) { var x = q.shift(); (adj[x] || []).forEach(function (y) { if (!seen[y]) { seen[y] = 1; q.push(y); } }); }
      var okPcs = 0; for (var i = 1; i <= s.pcs; i++) if (seen['pc' + i]) okPcs++;
      var data = { lit: Object.keys(seen) };
      if (bad.length) return svNo(bad[0] + (bad.length > 1 ? '（還有 ' + (bad.length - 1) + ' 條也接錯）' : '') + '。', '順序：光纖孔 → 數據機 入；數據機 出 → 路由器 WAN；路由器 LAN → 電腦或交換器上行；交換器一般孔 → 電腦。', null, { data: data });
      if (okPcs < s.pcs) return svNo('還有 ' + (s.pcs - okPcs) + ' 台電腦沒接通（紅色的）。', s.pcs > 4 ? '路由器只有 4 個 LAN 孔：把交換器的「上行」接到路由器 LAN，其他電腦接交換器。' : '每台電腦都要一路通到光纖孔。', '從光纖孔開始沿著線走一遍：數據機 → 路由器 → （交換器）→ 電腦，看哪裡斷掉了。', { data: data });
      return svYes(s.pcs + ' 台電腦都連上了！光纖孔 → 數據機（轉換訊號）→ 路由器（分配、對外 WAN／對內 LAN）' + (s.pcs > 4 ? '→ 交換器（孔不夠時擴充）' : '') + '→ 電腦。', { data: data });
    }
  };

  /* 🧵 佈線工程師（N2） */
  var CAB = { tp: { cost: 1, max: 100 }, fiber: { cost: 5, max: 5000 }, coax: { cost: 2, max: 500 } };
  var SPOTS = [
    { a: '電信機房', b: '學校機房', d: [800, 2500], kind: 'data' }, { a: '學校機房', b: '教學大樓', d: [150, 400], kind: 'data' }, { a: '學校機房', b: '圖書館', d: [120, 300], kind: 'data' },
    { a: '教學大樓交換器', b: '電腦教室', d: [20, 90], kind: 'data' }, { a: '電腦教室交換器', b: '老師電腦', d: [5, 30], kind: 'data' }, { a: '圖書館交換器', b: '查詢電腦', d: [10, 60], kind: 'data' },
    { a: '有線電視盒', b: '會議室電視', d: [10, 40], kind: 'tv' }, { a: '警衛室', b: '門口監視器（有線電視系統）', d: [30, 120], kind: 'tv' }, { a: '辦公室交換器', b: '事務印表機', d: [5, 40], kind: 'data' }
  ];
  SV.labs.cablePlan = {
    make: function (hard) {
      var n = hard ? 6 : 4, spots;
      for (;;) {
        spots = shuffle(SPOTS).slice(0, n).map(function (x) { return { a: x.a, b: x.b, kind: x.kind, dist: Math.round(between(x.d[0], x.d[1]) / 5) * 5 }; });
        if (spots.some(function (x) { return x.kind === 'data' && x.dist > 100; }) && spots.some(function (x) { return x.kind === 'data' && x.dist <= 100; })) break;
      }
      if (hard && !spots.some(function (x) { return x.kind === 'tv'; })) spots[0] = { a: '有線電視盒', b: '會議室電視', kind: 'tv', dist: between(2, 8) * 5 };
      var best = spots.reduce(function (a, x) { var c = x.kind === 'tv' ? 'coax' : x.dist <= 100 ? 'tp' : 'fiber'; return a + CAB[c].cost * x.dist; }, 0);
      var p = { spots: spots, budget: Math.ceil(best * (hard ? 1.03 : 1.15) / 10) * 10 };
      return { pub: p, sec: p };
    },
    check: function (s, v) {
      var pick2 = v.pick || [], bad = [], sum = 0;
      s.spots.forEach(function (x, i) {
        var c = pick2[i]; if (!CAB[c]) svFail('bad-answer');
        sum += CAB[c].cost * x.dist;
        if (x.kind === 'tv' && c !== 'coax') bad.push(x.b + '：有線電視訊號要用同軸電纜');
        else if (x.kind === 'data' && c === 'coax') bad.push(x.a + ' → ' + x.b + '：同軸電纜已經被雙絞線取代，網路資料不用它');
        else if (x.kind === 'data' && x.dist > CAB[c].max) bad.push(x.a + ' → ' + x.b + '：' + x.dist + ' 公尺太遠了，雙絞線只能約 100 公尺');
      });
      if (bad.length) return svNo(bad[0] + (bad.length > 1 ? '（還有 ' + (bad.length - 1) + ' 段也不合規）' : '') + '。', '先看距離：超過 100 公尺的網路線一定要光纖。', '再看用途：📺 電視訊號 → 同軸；🌐 網路 100 公尺內 → 雙絞線最省。');
      if (sum > s.budget) return svNo('全部合規，但超出預算 $' + (sum - s.budget).toLocaleString() + '。', '光纖很貴：100 公尺以內的網路線改用雙絞線。');
      return svYes('驗收通過！花費 $' + sum.toLocaleString() + '。長距離的主幹道用光纖、室內短距離用便宜的雙絞線、電視訊號用同軸電纜。');
    }
  };

  /* 🔎 IP 設定面板（N4） */
  SV.labs.ipPanel = {
    make: function (hard) {
      if (!hard) { var base = pick([[192, 168], [10, between(0, 255)], [172, between(16, 31)]]), target = base.concat([between(0, 255), between(1, 254)]); return { pub: { target: target }, sec: { target: target } }; }
      var p = { t3: between(0, 255), t4: between(1, 254) }; return { pub: p, sec: p };
    },
    check: function (s, v) {
      var bits = v.bits || [], val = [0, 1, 2, 3].map(function (o) { var r = bits[o] || []; return [128, 64, 32, 16, 8, 4, 2, 1].reduce(function (a, w, j) { return a + (r[j] ? w : 0); }, 0); });
      var txt = function (o) { return (bits[o] || []).map(function (b) { return b ? 1 : 0; }).join(''); };
      if (s.target) {
        var wrong = val.map(function (x, i) { return x === s.target[i] ? 0 : i + 1; }).filter(Boolean);
        if (wrong.length) return svNo('第 ' + wrong.join('、') + ' 組不對：你設定的是 ' + val.join('.') + '。', '一組一組對：每組目標數字從 128 開始拆。', '例：168 → 128（剩 40）→ 32（剩 8）→ 8 → 10101000。');
        return svYes('設定好了：' + val.join('.') + ' ＝ ' + [0, 1, 2, 3].map(txt).join('.') + '。');
      }
      var why = [];
      if (val[0] !== 172) why.push('第 1 組要是 172');
      if (val[1] < 16 || val[1] > 31) why.push('第 2 組要在 16～31 之間（現在是 ' + val[1] + '）');
      if (val[2] !== s.t3) why.push('第 3 組要是 ' + s.t3);
      if (val[3] !== s.t4) why.push('第 4 組要是 ' + s.t4);
      if (why.length) return svNo(why.join('；') + '。', '172.16～172.31 是私有區段：第 2 組 16 ＝ 00010000、31 ＝ 00011111，中間任一個都可以。');
      return svYes(val.join('.') + ' 是 172.16～172.31 的私有位址 ✔（第 2 組 ' + val[1] + ' ＝ ' + txt(1) + '）。');
    }
  };

  /* ✂️ IPv6 壓縮機（N5）：最短寫法只在伺服器算 */
  function v6strip(g) { return g.map(function (x) { return x.replace(/^0+/, '') || '0'; }); }
  function v6short(g) {
    var s = v6strip(g), best = -1, bl = 1, i = 0;
    while (i < 8) { if (s[i] === '0') { var j = i; while (j < 8 && s[j] === '0') j++; if (j - i > bl) { bl = j - i; best = i; } i = j; } else i++; }
    return best < 0 ? s.join(':') : s.slice(0, best).join(':') + '::' + s.slice(best + bl).join(':');
  }
  function v6make(hard) {
    function grp() { var r = pick([[0x1000, 0xffff], [0x100, 0xfff], [0x10, 0xff], [1, 0xf]]); return ('0000' + between(r[0], r[1]).toString(16)).slice(-4); }
    for (;;) {
      var g = [0, 1, 2, 3, 4, 5, 6, 7].map(grp), L1 = hard ? between(2, 3) : between(2, 4), a = between(0, 8 - L1), i;
      for (i = 0; i < L1; i++) g[a + i] = '0000';
      if (hard) { var L2 = L1 - 1, b = between(0, 8 - L2), okb = true; for (i = -1; i <= L2; i++) if (b + i >= a - 1 && b + i <= a + L1) okb = false; if (!okb) continue; for (i = 0; i < L2; i++) g[b + i] = '0000'; }
      return g;
    }
  }
  SV.labs.v6Press = {
    make: function (hard) { var g = v6make(hard); return { pub: { orig: g }, sec: { orig: g } }; },
    check: function (s, v) {
      var t = String(v.text || ''), ans = v6short(s.orig);
      if (t === ans) return svYes('最短寫法：' + ans + '（' + ans.length + ' 個字，原本 39 個字）。');
      var why = t.length > ans.length ? '還可以更短（最短是 ' + ans.length + ' 個字，你現在 ' + t.length + ' 個字）' : '不是最短的標準寫法';
      var col = v.col;
      if (col && ans.indexOf('::') >= 0) {
        var st = v6strip(s.orig), best = 0, i = 0; while (i < 8) { if (st[i] === '0') { var j = i; while (j < 8 && st[j] === '0') j++; best = Math.max(best, j - i); i = j; } else i++; }
        if (+col.len < best) why = ':: 要用在「最長」的那一段 0（有一段連續 ' + best + ' 組）';
      }
      return svNo(why + '。', '每組開頭的 0 都要刪到不能再刪；0000 要剩一個 0 或被 :: 合併。', '步驟：① 每組刪開頭的 0 → ② 找最長的連續 0 → ③ 選起來按「合併成 ::」。');
    }
  };

  /* 🌐 DNS 電話簿（N6）：三個步驟，每一步都問伺服器 */
  var ORGS = { edu: ['ntu', 'ncku', 'nthu', 'nccu'], gov: ['moe', 'taichung', 'cwa'], com: ['pchome', 'momo', 'asus'], org: ['redcross', 'wwf'] };
  function ipr() { return between(20, 223) + '.' + between(0, 255) + '.' + between(0, 255) + '.' + between(1, 254); }
  SV.labs.dnsBook = {
    make: function (hard) {
      var cat = pick(Object.keys(ORGS)), org = pick(ORGS[cat]), host = pick(['www', 'mail', 'news']), dom = host + '.' + org + '.' + cat + '.tw';
      var decoys = [pick(['www', 'mail', 'news'].filter(function (h) { return h !== host; })) + '.' + org + '.' + cat + '.tw', host + '.' + org + '.' + cat + '.jp',
        host + '.' + pick(ORGS[cat].filter(function (o) { return o !== org; }).concat(['abc'])) + '.' + cat + '.tw'];
      if (hard) decoys.push(host + '.' + org + '.' + pick(Object.keys(ORGS).filter(function (c) { return c !== cat; })) + '.tw', host + '.' + org + '.' + cat + '.tw.example');
      var rows = shuffle([dom].concat(decoys).map(function (d) { return { d: d, ip: ipr() }; })), ip = rows.filter(function (r) { return r.d === dom; })[0].ip, k = hard ? 5 : 4;
      var servers = shuffle(rows.slice(0, k).map(function (r) { return r.ip; }).concat(rows.some(function (r, i) { return i < k && r.ip === ip; }) ? [] : [ip]));
      var p = { dom: dom, rows: rows, servers: servers };
      return { pub: p, sec: { dom: dom, rows: rows, servers: servers, ip: ip, step: 1 } };
    },
    check: function (s, v) {
      var O = ['主機', '機構', '類別', '地區'], want = ['host', 'org', 'cat', 'area'], parts = s.dom.split('.');
      if (v.op === 'parts') {
        if (s.step !== 1) svFail('bad-answer');
        var labels = v.labels || [], wrong = labels.filter(function (l, i) { return l !== want[i]; }).length + Math.max(0, want.length - labels.length);
        if (wrong) return svNo('有 ' + wrong + ' 段標錯了。', '由左到右：主機 → 機構 → 類別 → 地區。');
        s.step = 2; return { ok: true, partial: true, sec: s, say: '✔ 拆對了：' + parts.map(function (p, i) { return p + '＝' + O[i]; }).join('、') };
      }
      if (v.op === 'row') {
        if (s.step !== 2) svFail('bad-answer');
        var r = s.rows[+v.i]; if (!r) svFail('bad-answer');
        if (r.d !== s.dom) return svNo('「' + r.d + '」和網址不一樣！', 'DNS 要找一模一樣的網域名稱：主機、機構、類別、地區每一段都要一樣。');
        s.step = 3; return { ok: true, partial: true, sec: s, say: '✔ DNS 查到了：' + s.dom + ' → ' + r.ip };
      }
      if (s.step !== 3) svFail('bad-answer');
      if (String(v.ip) !== s.ip) return svNo('連到 ' + v.ip + '，不是剛剛查到的 IP。', '看剛剛 DNS 查到的 IP：' + s.ip + '。');
      return svYes('網頁打開了！瀏覽器拿到網域名稱 → DNS 查成 IP（' + s.ip + '）→ 依 IP 連到伺服器。');
    }
  };

  /* 📨 郵件旅程（N7）：每一段的下一站、協定由伺服器判斷 */
  var NAMES = ['小潔', '阿凱', '小芸', '志明', '怡君', '家豪'];
  SV.labs.mailTrip = {
    make: function (hard) {
      var nm = shuffle(NAMES).slice(0, 2), ST = [{ id: 'pcA', t: nm[0] + '的電腦', ic: '💻' }, { id: 'mA', t: nm[0] + '的郵件伺服器', ic: '📮' }, { id: 'mB', t: nm[1] + '的郵件伺服器', ic: '📬' }, { id: 'pcB', t: nm[1] + '的電腦', ic: '💻' }];
      var all = ST.concat(hard ? [{ id: 'web', t: '網站伺服器', ic: '🌐' }, { id: 'dns', t: 'DNS 伺服器', ic: '📒' }] : []);
      return { pub: { names: nm, stations: hard ? shuffle(all) : all, start: 'pcA' }, sec: { names: nm, all: all, at: 0 } };
    },
    check: function (s, v) {
      var route = ['pcA', 'mA', 'mB', 'pcB'], proto = { 'pcA>mA': 'SMTP', 'mA>mB': 'SMTP', 'mB>pcB': 'POP3' };
      if (s.at >= 3) svFail('bad-answer');
      var nx = route[s.at + 1], key = route[s.at] + '>' + nx, to = s.all.filter(function (x) { return x.id === v.to; })[0];
      if (!to || ['SMTP', 'POP3', 'HTTPS'].indexOf(v.p) < 0) svFail('bad-answer');
      if (v.to !== nx) return svNo('信不會送到「' + to.t + '」。', '寄信的路線：寄件人電腦 → 自己的郵件伺服器 → 對方的郵件伺服器 → 收件人電腦。');
      if (v.p !== proto[key]) return svNo('這一段不是用 ' + v.p + '。', '寄出去用 SMTP，收信下載用 POP3；HTTPS 是瀏覽網頁用的。');
      s.at++;
      var nm = s.names, say = '✔ ' + key.replace('>', ' → ').replace('pcA', nm[0] + '的電腦').replace('mA', nm[0] + '的伺服器').replace('mB', nm[1] + '的伺服器').replace('pcB', nm[1] + '的電腦') + '（' + proto[key] + '）';
      if (s.at === 3) return svYes(nm[1] + ' 收到信了！電腦 →（SMTP）→ 郵件伺服器 →（SMTP）→ 對方的郵件伺服器 →（POP3）→ 收件人電腦。', { data: { at: nx } });
      return { ok: true, partial: true, sec: s, say: say, data: { at: nx } };
    }
  };

  /* 🕵️ 偷看者（N7） */
  SV.labs.spy = {
    make: function () {
      var p = { acct: 's' + between(1100000, 1199999), pw: pick(['Sun', 'Moon', 'Cat', 'Tea', 'Fox']) + between(1000, 9999) + pick(['!', '#', '$']) };
      return { pub: p, sec: p };
    },
    check: function (s, v) {
      if (v.mode === 'http') return svNo('偷看者看到你的密碼「' + s.pw + '」了！http 是明文傳送。', '改用 https（有鎖頭的網址）再登入一次。');
      if (v.mode !== 'https') svFail('bad-answer');
      return svYes('用 https 加密傳送，偷看者只看到一堆亂碼！要輸入帳號密碼、個資、付款資料的網頁一定要用 https。');
    }
  };

  /* 🚀 下載模擬器（N9）：最省的組合只在伺服器算 */
  var PLAN = [{ id: 'p50', v: 50, $: 399 }, { id: 'p100', v: 100, $: 499 }, { id: 'p300', v: 300, $: 699 }, { id: 'p500', v: 500, $: 899 }];
  var APS = [{ id: 'w4', v: 150, $: 600 }, { id: 'w5', v: 866, $: 1500 }, { id: 'w6', v: 1200, $: 2800 }];
  function dlTime(p, a, n, mb) { return mb / (Math.min(p.v, a.v) / n / 8); }
  function dlCost(p, a) { return p.$ + Math.round(a.$ / 24); }
  SV.labs.dlSim = {
    make: function (hard) {
      for (;;) {
        var n = pick([2, 3, 4, 5]), mb = pick([300, 500, 750, 1000, 1500, 2000]), T = pick([30, 45, 60, 90, 120]), okl = [];
        PLAN.forEach(function (p) { APS.forEach(function (a) { if (dlTime(p, a, n, mb) <= T) okl.push(dlCost(p, a)); }); });
        if (okl.length >= 2 && okl.length <= 8) { var pub = { n: n, mb: mb, T: T, hard: hard }; return { pub: pub, sec: { n: n, mb: mb, T: T, hard: hard, best: Math.min.apply(null, okl) } }; }
      }
    },
    check: function (s, v) {
      var P = PLAN.filter(function (p) { return p.id === v.p; })[0], A = APS.filter(function (a) { return a.id === v.a; })[0];
      if (!P || !A) svFail('bad-answer');
      var t = dlTime(P, A, s.n, s.mb), tt = Math.round(t * 10) / 10, each = Math.min(P.v, A.v) / s.n;
      if (t > s.T) return svNo('下載要 ' + tt + ' 秒，超過 ' + s.T + ' 秒了。', '慢的那一段是瓶頸：' + (P.v < A.v ? '網路方案太慢' : '基地臺太慢') + '。', '算法：min(方案, 基地臺) ÷ ' + s.n + ' 人 ÷ 8 ＝ MB/s；' + s.mb + ' MB ÷ MB/s ＝ 秒。');
      if (s.hard && dlCost(P, A) > s.best) return svNo(tt + ' 秒下載完，但還有更便宜的組合也能在時間內完成。', '基地臺比網路方案快很多的話，多出來的速度用不到 —— 選剛好夠的就好。');
      return svYes(tt + ' 秒下載完！每人 ' + (Math.round(each * 10) / 10) + ' Mbps（' + (P.v <= A.v ? '網路方案' : '基地臺') + '是比較慢的那一段）÷ 8 ＝ ' + (Math.round(each / 8 * 100) / 100) + ' MB/s。');
    }
  };

  /* ▮ 條碼掃描器／印條碼（N10） */
  SV.labs.barcodeScan = {
    make: function (hard) { var d = between(hard ? 100 : 20, 255); return { pub: { b: ('00000000' + d.toString(2)).slice(-8) }, sec: { d: d, b: ('00000000' + d.toString(2)).slice(-8) } }; },
    check: function (s, v) {
      if (+v.v !== s.d) return svNo('讀到的 ' + s.b + ' 不是 ' + v.v + '。', '把 1 的位置的權值加起來：128、64、32、16、8、4、2、1。', '例：10000011 ＝ 128＋2＋1 ＝ 131。');
      return svYes('掃描器讀到 ' + s.b + ' ＝ ' + s.d + '。真實的條碼用寬窄不同的黑白色塊，原理一樣：照光 → 黑吸白反 → 轉成數位訊號 → 解碼。');
    }
  };
  SV.labs.barcodePrint = {
    make: function () { var p = { d: between(100, 255) }; return { pub: p, sec: p }; },
    check: function (s, v) {
      var bits = (v.bits || []).slice(0, 8).map(function (b) { return b ? 1 : 0; }); while (bits.length < 8) bits.push(0);
      var val = parseInt(bits.join(''), 2);
      if (val !== s.d) return svNo('你印的條碼代表 ' + val + '，不是 ' + s.d + '。', s.d + ' 從 128 開始拆：放得下就塗黑。', '例：200 ＝ 128＋64＋8 → 黑黑白白黑白白白。');
      return svYes('印好了：' + bits.join('') + ' ＝ ' + s.d + '。');
    }
  };
  SV._net = { sig: sig, ok: ok, BAND: BAND, v6short: v6short, PLAN: PLAN, APS: APS, dlTime: dlTime, dlCost: dlCost, wrKind: wrKind };
})();
