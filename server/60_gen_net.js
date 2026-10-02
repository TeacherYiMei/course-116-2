/* =====================================================================
   🎲 網路世界・隨機出題器（CARDGAME.gens）── 伺服器端（三星三階的「操作」「挑戰」用）
   ---------------------------------------------------------------------
   和密碼特務同一套做法：題目當場隨機產生，原始碼裡沒有「題目＋答案」的清單；
   檢查時照規則把答案算出來比對。每位學生、每一次挑戰的題目都不一樣。
   題型（it.kind）：input 打答案、choice 按選項、order 依序點、slots 每格選一個、bits 點位元
   ※ 學生打的答案先經過引擎的 norm()：全形轉半形、去空白、轉大寫
   ===================================================================== */
(function () {
  function rnd(n) { return Math.floor((CARDGAME.rand || Math.random)() * n); }   // 伺服器出題：有種子的亂數（驗證時重新產生同一題）
  function pick(a) { return a[rnd(a.length)]; }
  function picks(a, n) { a = a.slice(); var o = []; while (o.length < n && a.length) o.push(a.splice(rnd(a.length), 1)[0]); return o; }
  function between(lo, hi) { return lo + rnd(hi - lo + 1); }
  function shuffle(a) { return picks(a, a.length); }
  function times(n, f) { var o = []; for (var i = 0; i < n; i++) o.push(f(i)); return o; }
  function list(v) { return String(v).split(/[,、;；]+/).filter(Boolean).map(Number).sort(function (a, b) { return a - b; }).join(','); }

  var G = {
    /* ── N1：幫這個地方接上網路（依序點出設備；電腦太多要加交換器） ── */
    netChain: function (rd) {
      var places = ['小明家', '電腦教室', '圖書館', '社團教室', '導師辦公室', '小吃店'];
      return times(rd.n || 3, function (k) {
        var place = pick(places), ports = 4, pcs = k === 0 ? between(2, 4) : between(2, 12), need = pcs > ports;
        var items = shuffle([{ id: 'isp', t: 'ISP（電信公司）', icon: '🏢' }, { id: 'modem', t: '數據機', icon: '📞' }, { id: 'router', t: '路由器', icon: '🧭' },
          { id: 'switch', t: '交換器', icon: '🔀' }, { id: 'pc', t: pcs + ' 台電腦', icon: '🖥️' }]);
        var ans = ['isp', 'modem', 'router'].concat(need ? ['switch'] : []).concat(['pc']).join('>');
        return { kind: 'order', need: need ? 5 : 4, items: items, icon: '🔌', mono: false,
          t: place + '要讓 ' + pcs + ' 台電腦用網路線上網', sub: '路由器只有 ' + ports + ' 個 LAN 孔。從外面（ISP）一路點到電腦；用不到的設備不要點。',
          check: function (v) { return v.join('>') === ans; },
          why: need ? pcs + ' 台電腦超過路由器的 ' + ports + ' 個孔，要加交換器擴充：ISP → 數據機 → 路由器 → 交換器 → 電腦。' : pcs + ' 台電腦，路由器的 ' + ports + ' 個孔就夠了：ISP → 數據機 → 路由器 → 電腦，不用交換器。',
          hint: function (v) { return v.indexOf('switch') >= 0 !== need ? '數一數：' + pcs + ' 台電腦，路由器有幾個孔？' : '從外面進來：ISP → 數據機（轉換訊號）→ 路由器（分配）…'; } };
      });
    },
    /* ── N1 挑戰：最少要幾台交換器 ── */
    portsCalc: function (rd) {
      return times(rd.n || 2, function () {
        var R = 4, P = pick([8, 16, 24]), k0 = between(1, 3), lo = (R - (k0 - 1)) + (k0 - 1) * (P - 1) + 1, hi = (R - k0) + k0 * (P - 1), N = between(lo, hi), k = 0;
        while ((R - k) + k * (P - 1) < N) k++;
        return { icon: '🧮', mono: false, ph: '幾台？',
          t: '路由器有 ' + R + ' 個 LAN 孔，要接 ' + N + ' 台電腦（都用網路線）',
          sub: '每台交換器有 ' + P + ' 個孔，其中 1 個要接回路由器（占用路由器 1 個孔）。最少要幾台交換器？',
          check: function (v) { return +v === k; },
          why: '接 ' + k + ' 台交換器：路由器剩 ' + (R - k) + ' 孔＋交換器 ' + k + ' × ' + (P - 1) + ' 孔 ＝ ' + ((R - k) + k * (P - 1)) + ' 孔 ≥ ' + N + '；少一台就只有 ' + ((R - (k - 1)) + (k - 1) * (P - 1)) + ' 孔，不夠。',
          hint: '每接一台交換器：路由器少 1 孔，多出 ' + (P - 1) + ' 孔。一台一台加上去算算看。',
          hint2: '總孔數 ＝（4 − 交換器台數）＋ 交換器台數 × ' + (P - 1) + '。從 1 台開始代入，第一個 ≥ ' + N + ' 的就是答案。' };
      });
    },

    /* ── N2：每一段線路該用哪一種線材 ── */
    cableAssign: function (rd) {
      var POOL = [['電信機房 → 你家社區', 'fiber'], ['臺北 ↔ 臺中的網路主幹道', 'fiber'], ['臺灣 ↔ 日本的海底電纜', 'fiber'], ['學校機房 → 各棟大樓', 'fiber'],
        ['教室電腦 → 教室的交換器', 'tp'], ['筆電 → 家裡路由器的網路孔', 'tp'], ['數據機 → 路由器', 'tp'], ['遊戲機 → 客廳的路由器', 'tp'],
        ['牆上的有線電視孔 → 電視盒', 'coax'], ['社區的有線電視系統 → 各戶', 'coax']];
      var O = [{ id: 'fiber', label: '💡 光纖' }, { id: 'tp', label: '🔀 雙絞線' }, { id: 'coax', label: '📺 同軸電纜' }];
      return times(rd.n || 2, function () {
        var ps = picks(POOL, rd.hard ? 6 : 4);
        if (!ps.some(function (p) { return p[1] === 'coax'; }) && rd.hard) ps[0] = pick(POOL.filter(function (p) { return p[1] === 'coax'; }));
        return { kind: 'slots', icon: '🧵', mono: false, t: '幫每一段線路選線材', sub: '光纖：快、遠、貴（主幹道）；雙絞線：便宜、距離短（室內）；同軸電纜：有線電視',
          parts: ps.map(function (p) { return { t: p[0] }; }), options: O,
          check: function (v) { return v.every(function (x, i) { return x === ps[i][1]; }); },
          why: ps.map(function (p) { return p[0] + '：' + O.filter(function (o) { return o.id === p[1]; })[0].label.slice(3); }).join('；'),
          hint: function (v) { var n = v.filter(function (x, i) { return x !== ps[i][1]; }).length; return '有 ' + n + ' 段選錯了。距離遠、流量大 → 光纖；室內短距離 → 雙絞線；電視訊號 → 同軸。'; } };
      });
    },

    /* ── N3：封包重組（依編號點回原本的訊息） ── */
    packetOrder: function (rd) {
      var PH = ['畢業快樂', '明天見喔', '會考加油', '資訊科技', '週末去爬山', '記得帶便當', '放學打球', '謝謝老師'];
      return picks(PH, rd.n || 2).map(function (w) {
        var chars = w.split(''), nums = picks(times(chars.length + 3, function (i) { return i + 1; }), chars.length).sort(function (a, b) { return a - b; });
        var items = shuffle(chars.map(function (c, i) { return { id: c + i, t: '#' + nums[i] + '　' + c, icon: '📦' }; }));
        return { kind: 'order', items: items, icon: '📬', mono: false, t: chars.length + ' 個封包亂序抵達了', sub: '依封包上的編號從小到大點，把訊息組回來（編號不一定連續）',
          check: function (v) { return v.join('') === chars.map(function (c, i) { return c + i; }).join(''); },
          why: '依 TCP 編號排好：「' + w + '」。不管哪個先到，接收端都能靠編號組回來。', hint: '看 # 後面的數字，從最小的開始點。' };
      });
    },
    /* ── N3：掉了哪幾個封包（要重送） ── */
    packetLost: function (rd) {
      return times(rd.n || 2, function () {
        var total = rd.hard ? between(7, 10) : between(4, 6), miss = picks(times(total, function (i) { return i + 1; }), rd.hard ? between(1, 2) : 1).sort(function (a, b) { return a - b; });
        var got = times(total, function (i) { return i + 1; }).filter(function (x) { return miss.indexOf(x) < 0; });
        if (rd.hard) { got = got.concat(picks(got, 2)); }   // 挑戰：有重複收到的
        var show = shuffle(got);
        return { icon: '📭', ph: miss.length > 1 ? '例：2,5' : '編號',
          t: '收到：' + show.map(function (x) { return '#' + x; }).join('  '),
          sub: '這份資料一共切成 ' + total + ' 個封包（#1～#' + total + '）。TCP 要請對方重送哪' + (rd.hard ? '幾' : '一') + '號？' + (rd.hard ? '（有的封包收到兩次，不用重送；多個用逗號隔開）' : ''),
          check: function (v) { return list(v) === miss.join(','); },
          why: '#1～#' + total + ' 裡找不到 ' + miss.map(function (x) { return '#' + x; }).join('、') + ' → 請對方重送。收到兩次的只要留一份。',
          hint: '從 #1 數到 #' + total + '，一個一個對，找出沒出現的。', hint2: '把收到的號碼由小到大排好（重複的只算一次），再看 1～' + total + ' 哪幾個跳過了。' };
      });
    },

    /* ── N4：IPv4 合法嗎 ── */
    ipValid: function (rd) {
      function oct() { return between(0, 255); }
      function make(ok) {
        var a = times(4, oct);
        if (ok) return { s: a.join('.'), r: 'fine', why: '4 組、每組都在 0～255 之間。' };
        var t = rnd(4);
        if (t === 0) { var i = rnd(4); a[i] = between(256, 399); return { s: a.join('.'), r: 'big', why: a[i] + ' 超過 255 —— 8 個位元最多到 255。' }; }
        if (t === 1) return { s: a.slice(0, 3).join('.'), r: 'count', why: '只有 3 組，IPv4 要 4 組。' };
        if (t === 2) return { s: a.concat([oct()]).join('.'), r: 'count', why: '有 5 組，IPv4 只有 4 組。' };
        var j = rnd(4); a[j] = pick(['1a', 'x', '12,5']); return { s: a.join('.'), r: 'nan', why: '「' + a[j] + '」不是 0～255 的數字。' };
      }
      var R = [{ id: 'fine', label: '4 組，每組都在 0～255' }, { id: 'big', label: '有一組超過 255' }, { id: 'count', label: '組數不對（不是 4 組）' }, { id: 'nan', label: '有一組不是數字' }];
      return shuffle(times(rd.n || 5, function (k) {
        var ok = k === 0 ? true : k === 1 ? false : rnd(2) === 0, q = make(ok);
        return { kind: 'choice', icon: '🔢', t: q.s, sub: '這是合法的 IPv4 位址嗎？', options: [{ id: 'ok', label: '合法', icon: '✅' }, { id: 'bad', label: '不合法', icon: '❌' }],
          check: function (v) { return v === (ok ? 'ok' : 'bad'); }, why: q.why, hint: '數一數有幾組，每一組是不是都在 0～255？',
          hint2: '一組一組看：有沒有超過 255？有沒有不是數字的？總共是不是剛好 4 組？',
          follow: { q: '你的理由是？', options: shuffle(R), check: function (v) { return v === q.r; } } };
      }));
    },
    /* ── N4：點位元湊出十進位（IPv4 的一組 ＝ 8 個位元） ── */
    octetBits: function (rd) {
      return times(rd.n || 2, function (k) {
        var d = k === 0 ? between(128, 255) : between(1, 127);
        return { kind: 'bits', n: 8, showSum: !rd.hard, icon: '💡', t: '湊出 ' + d, sub: rd.hard ? '不顯示總和，自己算！點格子切換 0／1' : '點格子切換 0／1，讓總和剛好等於 ' + d,
          check: function (v) { return parseInt(v, 2) === d; },
          why: function (v) { return d + ' ＝ ' + v + '（' + v.split('').map(function (b, i) { return b === '1' ? Math.pow(2, 7 - i) : 0; }).filter(Boolean).join('＋') + '）'; },
          hint: '從最大的 128 開始：放得下就點亮，再看剩下多少。', hint2: '例：200 → 放 128（剩 72）→ 放 64（剩 8）→ 32、16 放不下 → 放 8（剩 0）。' };
      });
    },
    /* ── N4：8 個位元是多少 ── */
    bitsToDec: function (rd) {
      return times(rd.n || 2, function () {
        var d = between(1, 255), b = ('00000000' + d.toString(2)).slice(-8);
        return { icon: '🔢', tool: rd.hard ? null : 'binary', t: b, sub: '換成十進位是多少？', ph: '0～255',
          check: function (v) { return +v === d && /^\d+$/.test(v); }, why: b + ' ＝ ' + b.split('').map(function (x, i) { return x === '1' ? Math.pow(2, 7 - i) : 0; }).filter(Boolean).join('＋') + ' ＝ ' + d + '。',
          hint: '權值由左到右是 128、64、32、16、8、4、2、1，把 1 的位置加起來。', hint2: '例：10000011 → 1 在 128、2、1 的位置 → 128＋2＋1 ＝ 131。' };
      });
    },
    /* ── N4 挑戰：公有還是私有（含容易誤判的邊界） ── */
    ipPrivate: function (rd) {
      function o() { return between(0, 255); }
      var MK = [
        function () { return { s: '10.' + o() + '.' + o() + '.' + o(), p: 1, w: '10.x.x.x 整段都是私有。' }; },
        function () { return { s: '192.168.' + o() + '.' + o(), p: 1, w: '192.168.x.x 是私有區段。' }; },
        function () { var b = between(16, 31); return { s: '172.' + b + '.' + o() + '.' + o(), p: 1, w: '172.16～172.31 都是私有，' + b + ' 在範圍內。' }; },
        function () { var b = pick([15, 32, between(33, 60), between(1, 14)]); return { s: '172.' + b + '.' + o() + '.' + o(), p: 0, w: '陷阱！私有只有 172.16～172.31，' + b + ' 不在範圍內 → 公有。' }; },
        function () { var b = pick([167, 169, between(0, 160)]); return { s: '192.' + b + '.' + o() + '.' + o(), p: 0, w: '私有是 192.168 開頭，192.' + b + ' 不是 → 公有。' }; },
        function () { var a = pick([8, 11, 9, 140, 163, 203, 61, 1]); return { s: a + '.' + o() + '.' + o() + '.' + o(), p: 0, w: '不在三個私有區段裡 → 公有。' }; }
      ];
      var R = [{ id: 'm0', label: '10.x.x.x' }, { id: 'm2', label: '172.16～172.31.x.x' }, { id: 'm1', label: '192.168.x.x' }, { id: 'none', label: '三段都不是（公有）' }];
      return shuffle(times(rd.n || 5, function (k) {
        var m = k < 2 ? [3, 4][k] : rnd(MK.length), q = MK[m]();
        return { kind: 'choice', icon: '🏷️', t: q.s, sub: '這是公有還是私有網路位址？', options: [{ id: 'pub', label: '公有', icon: '🌐' }, { id: 'pri', label: '私有', icon: '🏠' }],
          check: function (v) { return v === (q.p ? 'pri' : 'pub'); }, why: q.w, hint: '私有只有三段：10.x.x.x、172.16～172.31.x.x、192.168.x.x。',
          hint2: '先看第一組：是 10、172、192 嗎？是 172 再看第二組在不在 16～31；是 192 再看第二組是不是 168。',
          follow: { q: '它符合哪一個私有區段？', options: R, check: function (v) { return v === (q.p ? 'm' + m : 'none'); } } };
      }));
    },
    /* ── N4 挑戰：32 個位元的 IP 換成點分十進位 ── */
    ipBinary: function (rd) {
      return times(rd.n || 1, function () {
        var a = [pick([192, 172, 10, 140]), between(0, 255), between(0, 255), between(1, 254)], b = a.map(function (x) { return ('00000000' + x.toString(2)).slice(-8); });
        return { icon: '🧩', tool: 'binary', t: b.join('.'), sub: '把 4 組 8 位元換成十進位，寫成 IPv4 位址', ph: '例：192.168.1.1',
          check: function (v) { return v === a.join('.'); }, why: b.map(function (x, i) { return x + ' ＝ ' + a[i]; }).join('；') + ' → ' + a.join('.'),
          hint: '一組一組換，換完用「.」接起來。', hint2: '把第一組 8 個位元放進位元計算機算出十進位，寫下來加一個「.」，再換下一組。' };
      });
    },

    /* ── N5：IPv6 ── */
    hexBits: function (rd) {
      return times(rd.n || 2, function () {
        var d = between(10, 15), b = ('0000' + d.toString(2)).slice(-4), h = d.toString(16);
        return { icon: '🔡', t: b, sub: '4 個位元換成 1 個十六進位數字（10＝a、11＝b … 15＝f）', ph: '0～9 或 a～f',
          check: function (v) { return v === h.toUpperCase(); }, why: b + ' ＝ 8＋4＋2＋1 裡的 ' + b.split('').map(function (x, i) { return x === '1' ? [8, 4, 2, 1][i] : 0; }).filter(Boolean).join('＋') + ' ＝ ' + d + ' → 十六進位 ' + h + '。',
          hint: '先換成十進位（8、4、2、1），10 以上用字母：10＝a、11＝b、12＝c、13＝d、14＝e、15＝f。', hint2: '例：1101 ＝ 8＋4＋1 ＝ 13 → d。' };
      });
    },
    v6short: function (rd) {
      function grp() { var r = pick([[0x1000, 0xffff], [0x100, 0xfff], [0x10, 0xff], [1, 0xf]]); return ('0000' + between(r[0], r[1]).toString(16)).slice(-4); }   // 不會是 0000
      function full() {
        var g = times(8, grp), zero = times(8, function () { return false; });
        if (rd.hard) {   // 挑戰：兩段連續的 0，長度不同 → :: 要用在比較長的那一段
          for (;;) {
            var L1 = between(2, 3), L2 = between(1, L1 - 1), a = between(0, 8 - L1), b = between(0, 8 - L2);
            if (rnd(2)) { var t = L1; L1 = L2; L2 = t; t = a; a = b; b = t; }
            var z = times(8, function () { return false; }), ok = true, i;
            for (i = 0; i < L1; i++) z[a + i] = true;
            for (i = 0; i < L2; i++) { if (z[b + i] || z[b + i - 1] || z[b + i + 1]) ok = false; z[b + i] = true; }
            if (ok && a + L1 <= 8 && b + L2 <= 8) { zero = z; break; }
          }
        } else { var p = between(1, 6); zero[p] = true; if (rnd(2)) zero[p + 1] = true; }
        return g.map(function (x, i) { return zero[i] ? '0000' : x; });
      }
      function strip(g) { return g.map(function (x) { return x.replace(/^0+/, '') || '0'; }); }
      function shortest(g) {
        var s = strip(g), best = -1, bl = 1, i = 0;
        while (i < 8) { if (s[i] === '0') { var j = i; while (j < 8 && s[j] === '0') j++; if (j - i > bl) { bl = j - i; best = i; } i = j; } else i++; }
        if (best < 0) return s.join(':');
        return s.slice(0, best).join(':') + '::' + s.slice(best + bl).join(':');
      }
      return times(rd.n || 2, function () {
        var g = full(), ans = rd.hard ? shortest(g) : strip(g).join(':');
        return { icon: '✂️', t: g.join(':'), sub: rd.hard ? '寫出最短的寫法（:: 只能用一次，要用在最長的那一段 0）' : '用規則 1、2 省略（開頭的 0 省略、0000 寫成 0），先不要用 ::', ph: '輸入省略後的位址',
          check: function (v) { return v === ans.toUpperCase(); }, why: '→ ' + ans,
          hint: rd.hard ? '先把每組開頭的 0 去掉；再找「連續最多組 0」的那一段換成 ::。' : '每一組把開頭的 0 拿掉；整組都是 0 就寫一個 0。',
          hint2: rd.hard ? '步驟：① 每組去掉開頭的 0 → ② 數一數哪一段連續的 0 最長 → ③ 只把那一段換成 ::，另一段的 0 照寫。' : '例：00a3 → a3、0000 → 0、0f00 → f00（只有「開頭」的 0 可以省略，後面的 0 要留著）。' };
      });
    },
    v6expand: function (rd) {
      return times(rd.n || 1, function () {
        var head = between(1, 3), tail = between(1, 8 - head - 2), hs = times(head, function () { return between(1, 65535).toString(16); }), ts = times(tail, function () { return between(1, 4095).toString(16); });
        var zeros = 8 - head - tail, full = hs.concat(times(zeros, function () { return '0'; })).concat(ts).map(function (x) { return ('0000' + x).slice(-4); }).join(':');
        return { icon: '📏', t: hs.join(':') + '::' + ts.join(':'), sub: '還原成完整的 8 組、每組 4 個數字', ph: 'xxxx:xxxx:…（8 組）',
          check: function (v) { return v === full.toUpperCase(); }, why: ':: 代表 ' + zeros + ' 組 0000（8 − ' + head + ' − ' + tail + '），每組補滿 4 位 → ' + full,
          hint: '先數 :: 前後各有幾組，8 減掉就是 :: 代表幾組 0000；每組不足 4 位前面補 0。', hint2: '例：abcd::12 → :: 前 1 組、後 1 組 → 中間補 6 組 0000 → abcd:0000:0000:0000:0000:0000:0000:0012。' };
      });
    },

    /* ── N6：網址拆解 ── */
    urlSlots: function (rd) {
      var HOST = ['www', 'mail', 'news', 'shop', 'drive', 'map'], ORG = { edu: ['ntu', 'nthu', 'ncku', 'nccu', 'tmu'], gov: ['taichung', 'moe', 'cwa', 'tainan'], com: ['pchome', 'yahoo', 'sony', 'asus'], org: ['wikipedia', 'redcross', 'wwf'] };
      var O = [{ id: 'host', label: '主機名稱' }, { id: 'org', label: '機構名稱' }, { id: 'cat', label: '類別名稱' }, { id: 'area', label: '地區名稱' }];
      return times(rd.n || 2, function () {
        var cat = pick(['edu', 'gov', 'com', 'org']), reg = cat === 'edu' || cat === 'gov' ? 'tw' : pick(['', 'tw']), parts = [pick(HOST), pick(ORG[cat]), cat].concat(reg ? [reg] : []);
        var ids = ['host', 'org', 'cat'].concat(reg ? ['area'] : []), order = shuffle(parts.map(function (p, i) { return i; }));
        return { kind: 'slots', icon: '🌐', t: parts.join('.'), sub: '每一段是網址的哪一部分？（順序打亂了，看清楚是哪一段）',
          parts: order.map(function (i) { return { t: '「' + parts[i] + '」' }; }), options: O,
          check: function (v) { return v.every(function (x, n) { return x === ids[order[n]]; }); },
          why: '由左到右：' + parts.map(function (p, i) { return p + '＝' + O.filter(function (o) { return o.id === ids[i]; })[0].label; }).join('、') + (reg ? '' : '（沒有地區名稱：常見於 .com、.org 的國際網站）'),
          hint: '由左到右是：主機 → 機構 → 類別 → 地區；最右邊的兩個字母是國家。' };
      });
    },
    urlRead: function (rd) {
      var CAT = { edu: '學校', gov: '政府機關', com: '公司', org: '非營利組織' }, REG = { tw: '臺灣', jp: '日本', kr: '韓國', uk: '英國' }, ORG = ['abc', 'star', 'moon', 'sunny', 'blue'];
      return times(rd.n || 3, function () {
        var c = pick(Object.keys(CAT)), r = pick(Object.keys(REG)), code = ({ tw: { edu: 'edu', gov: 'gov', com: 'com', org: 'org' }, jp: { edu: 'ac', gov: 'go', com: 'co', org: 'or' }, kr: { edu: 'ac', gov: 'go', com: 'co', org: 'or' }, uk: { edu: 'ac', gov: 'gov', com: 'co', org: 'org' } })[r][c], dom = pick(['www', 'mail']) + '.' + pick(ORG) + '.' + code + '.' + r;
        var right = REG[r] + '的' + CAT[c], opts = shuffle([right].concat(picks(Object.keys(REG).filter(function (x) { return x !== r; }), 2).map(function (x) { return REG[x] + '的' + CAT[c]; })
          .concat([REG[r] + '的' + CAT[pick(Object.keys(CAT).filter(function (x) { return x !== c; }))]])));
        return { kind: 'choice', icon: '🔍', t: dom, sub: '這個網站最可能是？' + (code !== c ? '（有些國家的類別寫法不同：ac＝學校、go／gov＝政府、co＝公司、or＝組織）' : ''),
          options: opts.map(function (o) { return { id: o, label: o }; }), check: function (v) { return v === right; },
          why: '最右邊「' + r + '」＝' + REG[r] + '；類別「' + code + '」＝' + CAT[c] + '。', hint: '先看最右邊的地區，再看倒數第二段的類別。' };
      });
    },

    /* ── N7：網路服務與協定 ── */
    mailFlow: function (rd) {
      var N = ['小潔', '阿凱', '小芸', '志明', '怡君'], a = picks(N, 2);
      return times(rd.n || 1, function () {
        var seq = [{ id: 1, t: a[0] + '按下「寄出」', icon: '✉️' }, { id: 2, t: '用 SMTP 送到寄件方的郵件伺服器', icon: '📤' }, { id: 3, t: '郵件伺服器轉送到' + a[1] + '的郵件伺服器', icon: '🔁' },
          { id: 4, t: a[1] + '用 POP3 把信下載到電腦', icon: '📥' }, { id: 5, t: a[1] + '打開信件', icon: '📖' }];
        return { kind: 'order', items: shuffle(seq), icon: '📧', mono: false, t: a[0] + ' 寄一封 email 給 ' + a[1], sub: '依序點出信件走的路',
          check: function (v) { return v.join(',') === '1,2,3,4,5'; }, why: '寄信用 SMTP 送出，伺服器之間轉送，收件人再用 POP3 下載。', hint: '先「寄」（SMTP），最後才「收」（POP3）。' };
      });
    },
    protoSlots: function (rd) {
      var POOL = [['按下「寄出」，信送往郵件伺服器', 'smtp'], ['把信從郵件伺服器下載到自己的電腦', 'pop3'], ['在網路商店輸入信用卡資料', 'https'], ['登入學校帳號的網頁', 'https'],
        ['網路銀行查餘額', 'https'], ['寄一封作業給老師（送出這一步）', 'smtp'], ['用收信軟體收新郵件', 'pop3'], ['網址列有鎖頭的購物網站', 'https']];
      var O = [{ id: 'smtp', label: 'SMTP（寄信）' }, { id: 'pop3', label: 'POP3（收信）' }, { id: 'https', label: 'HTTPS（加密的網頁）' }];
      return times(rd.n || 1, function () {
        var ps = picks(POOL, 4);
        return { kind: 'slots', icon: '📨', mono: false, t: '這件事用到哪一個協定？', parts: ps.map(function (p) { return { t: p[0] }; }), options: O,
          check: function (v) { return v.every(function (x, i) { return x === ps[i][1]; }); },
          why: ps.map(function (p) { return p[0] + ' → ' + p[1].toUpperCase(); }).join('；'), hint: '寄出 SMTP、下載收信 POP3、要加密的網頁 HTTPS。' };
      });
    },

    httpsJudge: function (rd) {
      var CATS = ['帳號密碼', '付款（信用卡）資料', '個人資料', '金錢交易資料', '公開資料'];
      var POOL = [['登入學校的成績查詢系統', '帳號密碼'], ['網路商店結帳，輸入信用卡號', '付款（信用卡）資料'], ['填寫報名表：姓名、電話、地址', '個人資料'],
        ['網路銀行轉帳', '金錢交易資料'], ['變更社群網站的密碼', '帳號密碼'], ['看氣象局公布的明天天氣', '公開資料'], ['看公開的新聞文章', '公開資料'],
        ['查公車到站時間', '公開資料'], ['看學校首頁的最新消息', '公開資料']];
      return picks(POOL, rd.n || 4).map(function (p) {
        var need = p[1] !== '公開資料';
        return { kind: 'choice', icon: '🔒', mono: false, t: p[0], sub: '這個網頁「一定要」用 https 加密傳送嗎？', options: [{ id: 'y', label: '一定要 https', icon: '🔒' }, { id: 'n', label: '不一定（沒有機密資料）', icon: '📰' }],
          check: function (v) { return v === (need ? 'y' : 'n'); }, why: need ? '傳的是' + p[1] + '，傳送過程一定要加密（https 的 s ＝ secure）。' : '是大家都能看的公開資料，沒有機密；不過現在大多數網站也都改用 https 了。',
          hint: '有沒有帳號、密碼、個資或金錢？有的話一定要加密。',
          follow: { q: '這個網頁傳的是哪一種資料？', options: shuffle([p[1]].concat(picks(CATS.filter(function (x) { return x !== p[1]; }), 2))).map(function (x) { return { id: x, label: x }; }),
            check: function (v) { return v === p[1]; } } };
      });
    },

    /* ── N8：選無線技術（依距離、要不要上網、有沒有基地臺、會不會移動） ── */
    wirelessPick: function (rd) {
      var O = [{ id: 'bt', label: '藍牙', icon: '🔵' }, { id: 'wifi', label: 'Wi-Fi', icon: '📶' }, { id: 'mobile', label: '行動網路', icon: '📱' }];
      var DEV = { bt: ['無線耳機', '智慧手錶', '無線滑鼠', '藍牙喇叭', '遊戲手把'], wifi: ['筆電', '平板', '智慧電視', '桌上型電腦'], mobile: ['手機', '共享單車的鎖', '公車的定位器', '行動電源租借站'] };
      var R = [{ id: 'bt', label: '近距離、不用上網、要省電' }, { id: 'wifi', label: '室內有 Wi-Fi 基地臺、要高速上網' }, { id: 'mobile', label: '會移動、附近沒有 Wi-Fi 基地臺，但要上網' }];
      return shuffle(times(rd.n || 4, function (k) {
        var ans = ['bt', 'wifi', 'mobile'][k % 3] || pick(['bt', 'wifi', 'mobile']), dev = pick(DEV[ans]), f;
        if (ans === 'bt') f = ['距離約 ' + between(1, 8) + ' 公尺', '只要和旁邊的手機配對，不用上網', '要省電、裝置很小'];
        else if (ans === 'wifi') f = ['在室內，附近有 Wi-Fi 基地臺', '要上網，看高畫質影片', '不太會移動'];
        else f = ['一直在移動（' + pick(['路上', '山上', '公車上', '河濱']) + '）', '要上網', '附近沒有 Wi-Fi 基地臺'];
        if (rd.hard) f.push(pick(['⚠️ 注意：' + (ans === 'bt' ? '它可以上網，但這次只需要傳給手機' : ans === 'wifi' ? '它也有藍牙，但要傳大量資料上網' : '它也有 Wi-Fi，但附近沒有基地臺')]));
        return { kind: 'choice', icon: '📡', mono: false, t: dev, sub: '條件：' + shuffle(f).join('；'), options: O,
          check: function (v) { return v === ans; },
          why: { bt: '近距離、不用上網、省電 → 藍牙。', wifi: '室內有基地臺、要高速上網 → Wi-Fi。', mobile: '會移動、沒有 Wi-Fi 基地臺但要上網 → 行動網路（連電信的基地臺）。' }[ans],
          hint: '先問：要不要上網？要上網的話，附近有沒有 Wi-Fi 基地臺？會不會一直移動？',
          follow: { q: '決定的關鍵條件是？', options: shuffle(R), check: function (v) { return v === ans; } } };
      }));
    },

    /* ── N9：網速計算 ── */
    download: function (rd) {
      return times(rd.n || 3, function (k) {
        var mbps = pick([8, 16, 40, 80, 100, 200, 240, 400, 800]), mbs = mbps / 8, sec = between(2, 30), mb = mbs * sec;
        if (k === 0) return { icon: '🧮', mono: false, t: mbps + ' Mbps', sub: '每秒最多下載幾 MB？', ph: 'MB',
          check: function (v) { return Math.abs(+v - mbs) < 1e-9; }, why: mbps + ' ÷ 8 ＝ ' + mbs + ' MB/s（1 Byte ＝ 8 bit）。', hint: '網速是「位元」，檔案是「位元組」：除以 8。', hint2: '例：80 Mbps ÷ 8 ＝ 10 MB/s。' };
        return { icon: '⏱️', mono: false, t: '用 ' + mbps + ' Mbps 下載 ' + mb + ' MB', sub: '最少要幾秒？', ph: '秒',
          check: function (v) { return Math.abs(+v - sec) < 1e-9; }, why: mbps + ' ÷ 8 ＝ ' + mbs + ' MB/s；' + mb + ' ÷ ' + mbs + ' ＝ ' + sec + ' 秒。', hint: '先把網速 ÷ 8 變成 MB/s，再用檔案大小去除。', hint2: '例：80 Mbps ÷ 8 ＝ 10 MB/s；下載 50 MB → 50 ÷ 10 ＝ 5 秒。' };
      });
    },
    bottleneck: function (rd) {
      return times(rd.n || 2, function (k) {
        var isp = pick([100, 200, 300, 500]), ap = pick([150, 450, 1200, 1750]), n = pick([1, 2, 4, 5]), eff = Math.min(isp, ap), each = eff / n;
        if (k === 0) return { icon: '🐢', mono: false, t: '家裡租 ' + isp + ' Mbps，基地臺最高 ' + ap + ' Mbps，' + n + ' 個人同時用', sub: '平均每個人最快幾 Mbps？', ph: 'Mbps',
          check: function (v) { return Math.abs(+v - each) < 0.01; }, why: '先看比較慢的那一段：' + eff + ' Mbps；' + n + ' 個人一起分 → ' + each + ' Mbps。', hint: '上網速度被較慢的那一段卡住，再平均分給同時上網的人。', hint2: '例：租 100、基地臺 450 → 取比較小的 100；2 人平分 → 50 Mbps。' };
        var e2 = pick([80, 160, 240, 400]), p2 = pick([2, 4]), each2 = e2 / p2, mbs = each2 / 8, sec = pick([4, 5, 8, 10]), mb = mbs * sec;
        return { icon: '📦', mono: false, t: '頻寬 ' + e2 + ' Mbps，' + p2 + ' 個人平分；你要下載 ' + mb + ' MB', sub: '最少要幾秒？', ph: '秒',
          check: function (v) { return Math.abs(+v - sec) < 0.01; }, why: e2 + ' ÷ ' + p2 + ' ＝ ' + each2 + ' Mbps；÷ 8 ＝ ' + mbs + ' MB/s；' + mb + ' ÷ ' + mbs + ' ＝ ' + sec + ' 秒。',
          hint: '三步：平分 → 除以 8 → 用檔案大小去除。', hint2: '例：頻寬 80、2 人平分 → 40 Mbps → ÷ 8 ＝ 5 MB/s → 50 MB ÷ 5 ＝ 10 秒。' };
      });
    },

    /* ── N10：簡化版條碼（黑＝1、白＝0）與結帳時間 ── */
    barcode: function (rd) {
      return times(rd.n || 2, function () {
        var d = between(rd.hard ? 128 : 16, 255), b = ('00000000' + d.toString(2)).slice(-8), rev = rd.hard && rnd(2);
        var shown = rev ? b.split('').reverse().join('') : b;
        var bars = '<div class="barcode" aria-label="條碼">' + shown.split('').map(function (x) { return '<i class="' + (x === '1' ? 'k' : 'w') + '"></i>'; }).join('') + '</div>';
        return { icon: '▮', mono: false, t: rev ? '這張條碼被倒著掃了（最右邊的是最高位 128）' : '掃描器讀到這張條碼', html: bars, tool: rd.hard ? null : 'binary',
          sub: '簡化版：黑色吸光＝1、白色反光＝0，8 格是 8 個位元。換成十進位是多少？', ph: '0～255',
          check: function (v) { return +v === d && /^\d+$/.test(v); }, why: '讀到 ' + b + ' ＝ ' + d + (rev ? '（倒過來讀）' : '') + '。掃描器就是這樣把黑白變成數位訊號，再解碼成數字。',
          hint: rev ? '先把 8 格倒過來寫，再用 128、64…1 換算。' : '黑＝1、白＝0，由左到右權值 128、64、32、16、8、4、2、1。', hint2: '把每一格寫成 1（黑）或 0（白），例：黑白白白白白黑黑 ＝ 10000011 ＝ 128＋2＋1 ＝ 131。' };
      });
    },
    checkout: function (rd) {
      return times(rd.n || 1, function () {
        var n = between(8, 25), s = pick([2, 3, 4]), t = pick([3, 5, 6]), save = n * s - t;
        return { icon: '🛒', mono: false, t: '購物籃裡有 ' + n + ' 件商品', sub: '一件一件掃條碼每件 ' + s + ' 秒；用 RFID 放上結帳區一次讀完只要 ' + t + ' 秒。用 RFID 省了幾秒？', ph: '秒',
          check: function (v) { return +v === save; }, why: n + ' × ' + s + ' − ' + t + ' ＝ ' + save + ' 秒。RFID 不用對準、可以一次讀很多個。', hint: '先算逐一掃描要幾秒，再減掉 RFID 的時間。', hint2: '例：10 件 × 3 秒 ＝ 30 秒；30 − 5 ＝ 25 秒。' };
      });
    }
  };
  CARDGAME.gens = Object.assign(CARDGAME.gens || {}, G);
})();
