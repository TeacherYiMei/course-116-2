/* 🧪 系統平臺大冒險 G1～G8（前端：shared/pf-labs.js） */
(function () {
  var rnd = svRnd, between = svBetween, pick = svPick, shuffle = svShuffle;

  /* 🧩 平臺組合機（G1）：任務要用哪個 App、要不要隨身，只有伺服器知道 */
  var HW = [{ id: 'desk', t: '🖥️ 桌上型電腦', os: ['win', 'mac', 'linux'], type: 'pc', carry: false }, { id: 'nb', t: '💻 筆記型電腦', os: ['win', 'mac', 'linux'], type: 'pc', carry: false },
    { id: 'phone', t: '📱 手機', os: ['android', 'ios'], type: 'mobile', carry: true }, { id: 'watch', t: '⌚ 智慧手錶', os: ['wearos', 'watchos'], type: 'mobile', carry: true }];
  var OS = { win: 'Windows', mac: 'macOS', linux: 'Linux', android: 'Android', ios: 'iOS', wearos: 'Wear OS', watchos: 'watchOS' };
  var APP = [{ id: 'nav', t: '🗺️ 地圖導航', os: ['android', 'ios', 'wearos', 'watchos'] }, { id: 'edit', t: '🎬 專業影片剪輯', os: ['win', 'mac'] }, { id: 'heart', t: '❤️ 心跳紀錄', os: ['wearos', 'watchos'] },
    { id: 'office', t: '📝 文書處理', os: ['win', 'mac', 'linux', 'android', 'ios'] }, { id: 'code', t: '🐍 寫 Python 程式', os: ['win', 'mac', 'linux'] }, { id: 'chat', t: '💬 即時通訊', os: ['android', 'ios', 'win', 'mac'] }];
  var TASKS = [{ t: '騎腳踏車時手腕一抬就看路線', app: 'nav', carry: true, small: true }, { t: '在電腦教室剪輯畢業影片', app: 'edit', carry: false },
    { t: '跑步時隨時記錄心跳', app: 'heart', carry: true, small: true }, { t: '在家用大螢幕寫 Python 作業', app: 'code', carry: false },
    { t: '搭公車時打報告（要能放進口袋）', app: 'office', carry: true }, { t: '走在路上用地圖找餐廳', app: 'nav', carry: true, small: false }];
  var TYPE = { pc: '🖥️ 電腦系統平臺', mobile: '📱 可攜式系統平臺' };
  SV.labs.platformBuilder = {
    make: function (hard) { var task = pick(TASKS); return { pub: { t: task.t, hard: hard }, sec: { task: task, hard: hard } }; },
    check: function (s, v) {
      var task = s.task, h = HW.filter(function (x) { return x.id === v.hw; })[0], a = APP.filter(function (x) { return x.id === v.app; })[0];
      if (!h || !a || !OS[v.os] || !v.type) svFail('bad-answer');
      if (v.app !== task.app) return svNo('這個任務要用的是「' + APP.filter(function (x) { return x.id === task.app; })[0].t + '」。', '先看任務要做什麼，挑對應的應用軟體。');
      if (h.os.indexOf(v.os) < 0) return svNo(h.t + ' 不能裝 ' + OS[v.os] + '。', '看相容表：硬體決定能裝哪些作業系統。');
      if (a.os.indexOf(v.os) < 0) return svNo(a.t + ' 不支援 ' + OS[v.os] + '。', '看相容表：作業系統決定能裝哪些 App。');
      if (task.carry && !h.carry) return svNo('任務要隨身帶著，' + h.t + ' 不適合。', '要能帶著走（放口袋、戴手上）的是可攜式裝置。');
      if (task.small && h.id !== 'watch') return svNo('任務要在手腕上直接看，選手錶比較適合。', '「手腕一抬」「跑步時」—— 戴在身上的裝置。');
      if (v.type !== h.type) return svNo(h.t + ' 屬於「' + TYPE[h.type] + '」。', '桌電、筆電 → 電腦系統平臺；手機、手錶等隨身帶著、穿戴的 → 可攜式系統平臺。' + (s.hard ? '雲端是運算在遠方機房；嵌入式是藏在裝置裡、外表看不出是電腦。' : ''));
      return svYes(h.t + ' ＋ ' + OS[v.os] + ' ＋ ' + a.t + ' ＝ 一個' + TYPE[h.type] + '。系統平臺就是硬體、作業系統、應用軟體組在一起。');
    }
  };

  /* 🏭 五大單元傳令兵（G2）：每走一步都問伺服器 */
  var UNITS = { in: '⌨️ 輸入單元', mem: '🗄️ 記憶單元', ctl: '🎛️ 控制單元', alu: '🧮 算術與邏輯單元', out: '🖥️ 輸出單元' };
  SV.labs.fiveUnits = {
    make: function (hard) {
      var task, steps;
      if (!hard) {
        var kind = rnd(3);
        if (kind === 0) { var a = between(12, 89), b = between(11, 79); task = { t: '用計算機算 ' + a + ' ＋ ' + b, calc: [{ q: a + ' ＋ ' + b, v: a + b }] }; }
        else if (kind === 1) { var price = pick([15, 20, 25, 35, 45]), pay = pick([50, 100]); task = { t: '自動販賣機：投 ' + pay + ' 元買 ' + price + ' 元的飲料，要找多少錢', calc: [{ q: pay + ' − ' + price, v: pay - price }] }; }
        else { var x = between(3, 12), y = between(3, 9); task = { t: '算 ' + x + ' 個人、每人 ' + y + ' 元，一共多少錢', calc: [{ q: x + ' × ' + y, v: x * y }] }; }
        steps = ['in', 'mem', 'ctl', 'alu', 'mem', 'out'];
      } else {
        var n = [between(60, 99), between(60, 99), between(60, 99)], sum = n[0] + n[1] + n[2];
        while (sum % 3) { n[2]++; sum++; }
        task = { t: '算三次小考的平均：' + n.join('、') + ' 分', calc: [{ q: n.join(' ＋ '), v: sum }, { q: sum + ' ÷ 3', v: sum / 3 }] };
        steps = ['in', 'mem', 'ctl', 'alu', 'mem', 'ctl', 'alu', 'mem', 'out'];
      }
      return { pub: { t: task.t, n: steps.length }, sec: { task: task, steps: steps, at: 0, ci: 0, wait: false } };
    },
    check: function (s, v) {
      if (v.op === 'calc') {
        if (!s.wait) svFail('bad-answer');
        var c = s.task.calc[s.ci];
        if (+v.v !== c.v) return svNo(c.q + ' 不是 ' + v.v + '，再算一次。', '慢慢算，算術與邏輯單元不能算錯！');
        s.wait = false; s.ci++;
        return { ok: true, partial: true, say: '✔ ' + c.q + ' ＝ ' + c.v, sec: s, data: { calcDone: true } };
      }
      if (s.wait) return { act: true, warn: '先把算術與邏輯單元的計算做完' };
      var u = String(v.u), want = s.steps[s.at];
      if (!UNITS[u]) svFail('bad-answer');
      if (u !== want) {
        var msg = { in: '資料要先從「輸入單元」進來', mem: '資料（或算好的結果）要先存進「記憶單元」', ctl: '要先由「控制單元」下指令，其他單元才知道做什麼', alu: '控制單元下了指令，接著由「算術與邏輯單元」計算', out: '結果存好了，最後由「輸出單元」顯示' }[want];
        return svNo('下一步不是' + UNITS[u] + '：' + msg + '。', '順序：輸入 → 記憶 → 控制 → 算術與邏輯 → 記憶 → 輸出。');
      }
      s.at++;
      if (u === 'alu') { s.wait = true; return { ok: true, partial: true, sec: s, data: { u: u, calc: s.task.calc[s.ci].q } }; }
      if (s.at === s.steps.length) return svYes('完成！' + s.steps.map(function (p) { return UNITS[p].slice(2); }).join(' → ') + '。控制單元＋算術與邏輯單元就是 CPU。', { data: { u: u } });
      return { ok: true, partial: true, sec: s, data: { u: u } };
    }
  };

  /* 📦 記憶體調度員（G3） */
  var LV = [{ id: 'cache', t: '📝 快取記憶體', cap: 2, ns: 1 }, { id: 'ram', t: '📒 RAM', cap: 3, ns: 10 }, { id: 'disk', t: '📚 輔助記憶體', cap: 99, ns: 200 }];
  var DATA = ['🎮 遊戲角色位置', '🎵 正在播的歌', '📊 試算表公式', '🖼️ 桌布圖片', '📨 聊天訊息', '🗺️ 地圖圖塊', '🔤 輸入法字庫', '📄 作業檔案', '📷 相簿縮圖', '⏰ 鬧鐘設定'];
  function memCost(items, place) { return items.reduce(function (a, it, i) { var l = LV.filter(function (x) { return x.id === place[i]; })[0]; return a + it.n * (l ? l.ns : 1e6); }, 0); }
  function memBest(items) {
    var place = items.map(function (it) { return it.keep ? 'disk' : null; }), order = items.map(function (it, i) { return i; }).filter(function (i) { return !items[i].keep; }).sort(function (a, b) { return items[b].n - items[a].n; });
    order.forEach(function (i, k) { place[i] = k < 2 ? 'cache' : k < 5 ? 'ram' : 'disk'; });
    return memCost(items, place);
  }
  SV.labs.memPlan = {
    make: function (hard) {
      var names = shuffle(DATA).slice(0, hard ? 7 : 6), used = {};
      var items = names.map(function (t) { var n; do { n = between(1, 60); } while (used[n]); used[n] = 1; return { t: t, n: n, keep: false }; });
      if (hard) { var hi = items.slice().sort(function (a, b) { return b.n - a.n; }); hi[1].keep = true; }
      return { pub: { hard: hard, items: items }, sec: { items: items } };
    },
    check: function (s, v) {
      var items = s.items, place = (v.place || []).slice(0, items.length);
      if (place.length < items.length || place.some(function (p) { return !LV.some(function (l) { return l.id === p; }); })) svFail('bad-answer');
      var over = LV.filter(function (l) { return place.filter(function (p) { return p === l.id; }).length > l.cap; });
      if (over.length) return svNo(over[0].t + ' 放太多了（最多 ' + over[0].cap + ' 筆）。', '快取、RAM 越快越貴，容量都很小。');
      var lost = items.filter(function (it, i) { return it.keep && place[i] !== 'disk'; });
      if (lost.length) return svNo('「' + lost[0].t + '」放在 ' + LV.filter(function (l) { return l.id === place[items.indexOf(lost[0])]; })[0].t + '，關機就消失了！', '只有輔助記憶體（硬碟、隨身碟）關機後資料還在。');
      var c = memCost(items, place), best = memBest(items);
      if (c > best) return svNo('總時間 ' + c.toLocaleString() + ' 單位，還可以更快（最快 ' + best.toLocaleString() + '）。', '讀越多次的，越要放在快的地方。', '把「要讀的次數」由多到少排：前 2 名放快取、接下來 3 名放 RAM。');
      return svYes('總時間 ' + c.toLocaleString() + ' 單位，最快了！CPU 找資料由近而遠：快取 → RAM → 輔助記憶體；常用的放快的地方。');
    }
  };

  /* 🔧 電腦組裝師（G4） */
  var PARTS = { cpu: [{ id: 'c2', t: '雙核心', v: 2, $: 3000 }, { id: 'c4', t: '四核心', v: 4, $: 6000 }, { id: 'c8', t: '八核心', v: 8, $: 12000 }, { id: 'c16', t: '十六核心', v: 16, $: 22000 }],
    ram: [{ id: 'r8', t: '8 GB', v: 8, $: 1500 }, { id: 'r16', t: '16 GB', v: 16, $: 3000 }, { id: 'r32', t: '32 GB', v: 32, $: 6000 }],
    disk: [{ id: 'h1', t: 'HDD 1TB', v: 1000, ssd: false, $: 1500 }, { id: 's512', t: 'SSD 512GB', v: 512, ssd: true, $: 2000 }, { id: 's1', t: 'SSD 1TB', v: 1000, ssd: true, $: 3500 }, { id: 's2', t: 'SSD 2TB', v: 2000, ssd: true, $: 6500 }, { id: 'h4', t: 'HDD 4TB', v: 4000, ssd: false, $: 3500 }] };
  var WHO = ['👵 阿嬤', '🎮 電競玩家', '🎬 影片剪輯師', '🧑‍🏫 老師', '📚 國中生', '📸 攝影社'];
  function pcCost(s) { return 8000 + s.cpu.$ + s.ram.$ + s.disk.$; }
  function pcOk(need, s) { return s.cpu.v >= need.cores && s.ram.v >= need.ram && s.disk.v >= need.cap && (!need.ssd || s.disk.ssd); }
  function pcCheapest(need) { var b = null; PARTS.cpu.forEach(function (c) { PARTS.ram.forEach(function (r) { PARTS.disk.forEach(function (d) { var s = { cpu: c, ram: r, disk: d }; if (pcOk(need, s) && (!b || pcCost(s) < pcCost(b))) b = s; }); }); }); return b; }
  SV.labs.pcBuild = {
    make: function (hard) {
      var need = { cores: pick([2, 4, 8]), ram: pick([8, 16, 32]), ssd: rnd(2) === 0, cap: pick([500, 1000, 2000]) };
      var budget = Math.ceil(pcCost(pcCheapest(need)) * (hard ? 1.0 : 1.25) / 500) * 500, p = { hard: hard, need: need, budget: budget, who: pick(WHO) };
      return { pub: p, sec: p };
    },
    check: function (s, v) {
      function part(k) { return PARTS[k].filter(function (p) { return p.id === v[k]; })[0]; }
      var sel = { cpu: part('cpu'), ram: part('ram'), disk: part('disk') }, need = s.need, bad = [];
      if (!sel.cpu || !sel.ram || !sel.disk) svFail('bad-answer');
      if (sel.cpu.v < need.cores) bad.push('核心數不夠（要 ' + need.cores + ' 核心）');
      if (sel.ram.v < need.ram) bad.push('RAM 不夠（要 ' + need.ram + ' GB）');
      if (sel.disk.v < need.cap) bad.push('儲存空間不夠');
      if (need.ssd && !sel.disk.ssd) bad.push('要開機快，HDD 太慢了，要 SSD');
      if (bad.length) return svNo(bad.join('；') + '。', '一項一項對照客人的需求。');
      if (pcCost(sel) > s.budget) return svNo('需求都有達到，但超出預算 $' + (pcCost(sel) - s.budget).toLocaleString() + '。', '每一項挑「剛好夠」的就好，多的效能要花錢。', '例：需要 1TB 又不用快 → HDD 1TB 最便宜；需要快又要 1TB → SSD 1TB。');
      return svYes(s.who + ' 很滿意！總價 $' + pcCost(sel).toLocaleString() + '。挑電腦就是在需求和預算之間取捨。');
    }
  };

  /* 🧑‍💼 作業系統總管（G5） */
  var PROGS = [{ t: '🌐 瀏覽器（20 個分頁）', g: 3 }, { t: '🎮 遊戲', g: 4 }, { t: '💬 聊天軟體', g: 1 }, { t: '🎵 音樂播放器', g: 1 }, { t: '📊 試算表', g: 2 }, { t: '🖼️ 修圖軟體', g: 3 }, { t: '📹 視訊會議', g: 2 }];
  SV.labs.osManager = {
    make: function (hard) {
      var TOTAL = 16, osG = 3, run, newP, keepI = -1;
      for (;;) {
        run = shuffle(PROGS).slice(0, hard ? 5 : 4).map(function (p) { return { t: p.t, g: p.g, saved: true }; });
        run.push({ t: '📝 文書（作業還沒存檔！）', g: 2, saved: false });
        if (hard) keepI = rnd(run.length - 1);
        newP = { t: pick(['🎬 影片剪輯軟體', '🧊 3D 建模軟體', '🐍 Python 編輯器＋模擬器']), g: pick([4, 5, 6]) };
        var free = TOTAL - osG - run.reduce(function (a, p) { return a + p.g; }, 0);
        if (free < newP.g && free >= 0) break;
      }
      var p = { hard: hard, TOTAL: TOTAL, osG: osG, run: run, newP: newP, keepI: keepI };
      return { pub: p, sec: p };
    },
    check: function (s, v) {
      if (v.op === 'os') return svNo('作業系統不能關！關掉整台電腦就停了。', '作業系統是總管，其他程式都靠它才能用硬體。');
      if (v.lost) return svNo('文書還沒存檔就被關掉，作業不見了！（這次先幫你救回來）', '沒存檔的程式要先按「💾 存檔」再關。', null, { restore: true });
      var open = (v.open || []).slice(0, s.run.length), run = s.run;
      while (open.length < run.length) open.push(true);
      var free = s.TOTAL - s.osG - run.reduce(function (a, p, i) { return a + (open[i] ? p.g : 0); }, 0), need = s.newP.g;
      if (free < need) return svNo('還差 ' + (need - free) + ' GB，開不起來。', '再關掉一些佔用大的程式。');
      if (s.keepI >= 0 && !open[s.keepI]) return svNo('「' + run[s.keepI].t + '」正在用，不能關。', '按「↺ 重開」把它開回來，改關別的。');
      var extra = run.filter(function (p, i) { return !open[i] && free - p.g >= need; })[0];
      if (extra) return svNo('開得起來，但「' + extra.t + '」其實不用關（把它開回來也還夠）。', '只關「需要關」的程式，別人還在用呢。', '算算看：可用 ' + free + ' GB，需要 ' + need + ' GB，多出來的空間夠不夠把它開回來？');
      var closed = open.filter(function (o) { return !o; }).length;
      if (s.hard) {
        var c = run.map(function (p, i) { return i; }).filter(function (i) { return i !== s.keepI; }).sort(function (a, b) { return run[b].g - run[a].g; }), lack = need - (s.TOTAL - s.osG - run.reduce(function (a, p) { return a + p.g; }, 0)), k = 0, got = 0;
        while (got < lack) { got += run[c[k]].g; k++; }
        if (closed > k) return svNo('開得起來，但關了 ' + closed + ' 個程式，其實 ' + k + ' 個就夠了。', '優先關佔用記憶體大的程式。');
      }
      return svYes(s.newP.t + ' 開起來了！作業系統的「記憶體管理」：分配 RAM 給程式、用完收回來；沒存檔的先存到輔助記憶體再關。');
    }
  };

  /* 🚑 電腦急診室（G6）：前端操作工具，看診結束時把電腦狀態送上來 */
  var ISSUES = {
    disk: { say: '「硬碟快滿了，新照片存不進去！」', ok: function (st) { return st.used <= 85; } },
    hang: { say: '「有個程式當掉了，整個畫面卡住不動！」', ok: function (st) { return !st.hangOn; } },
    update: { say: '「右下角一直跳『有安全性更新』，聽說不更新會中毒…」', ok: function (st) { return st.updates === 0; } },
    fw: { say: '「網路上來路不明的連線一直想連進我的電腦。」', ok: function (st) { return st.fw; } },
    backup: { say: '「硬碟一直發出怪聲，裡面有三年的班級照片…」', ok: function (st) { return st.backup === 'ext'; } }
  };
  SV.labs.pcDoctor = {
    make: function (hard) {
      var keys = shuffle(Object.keys(ISSUES)).slice(0, hard ? 4 : 2);
      if (keys.indexOf('disk') < 0 && hard) keys[0] = 'disk';
      var st = { used: keys.indexOf('disk') >= 0 ? between(94, 98) : between(40, 60), temp: 12, updates: keys.indexOf('update') >= 0 ? between(2, 5) : 0, fw: keys.indexOf('fw') < 0, backup: keys.indexOf('backup') >= 0 ? null : 'ext',
        apps: shuffle([{ t: '🎮 兩年沒玩的大型遊戲', g: 15, need: false }, { t: '📝 學校要用的文書軟體', g: 3, need: true }, { t: '🧰 試用期過了的影音軟體', g: 5, need: false }, { t: '🐍 資訊課的 Python', g: 2, need: true }]),
        procs: [{ t: '⚙️ 系統程式（Windows 檔案總管）', sys: true }, { t: '🎵 音樂播放器' }].concat(keys.indexOf('hang') >= 0 ? [{ t: pick(['🌐 瀏覽器', '🖼️ 修圖軟體', '📊 試算表']) + '（沒有回應）', hang: true }] : []) };
      var pst = { used: st.used, temp: st.temp, updates: st.updates, fw: st.fw, backup: st.backup,   // 畫面用的狀態：不帶「哪個軟體要用」「哪個是系統程式」這種答案
        apps: st.apps.map(function (a) { return { t: a.t, g: a.g }; }), procs: st.procs.map(function (p) { return { t: p.t }; }) };
      return { pub: { hard: hard, says: keys.map(function (k) { return ISSUES[k].say; }), st: pst }, sec: { keys: keys, st: st } };
    },
    check: function (s, v) {
      var st0 = s.st, gone = v.gone || {}, ended = v.ended || {};
      var used = st0.used - (v.cleaned ? st0.temp : 0) - st0.apps.reduce(function (a, x, i) { return a + (gone[i] ? x.g : 0); }, 0);
      var harmApp = st0.apps.filter(function (x, i) { return gone[i] && x.need; })[0], harmProc = st0.procs.filter(function (p, i) { return ended[i] && !p.hang; })[0];
      if (harmProc) return svNo((harmProc.sys ? '結束了系統程式，桌面整個不見了' : '「' + harmProc.t + '」好好的，不用結束') + '！', '只處理病人說的問題，別動正常的東西。', null, { reset: true });
      if (harmApp) return svNo('「' + harmApp.t + '」是要用的軟體，被你移除了！', '只處理病人說的問題，別動正常的東西。', null, { reset: true });
      var st = { used: Math.max(0, used), updates: v.updated ? 0 : st0.updates, fw: !!v.fw, backup: v.backup || st0.backup, hangOn: st0.procs.some(function (p, i) { return p.hang && !ended[i]; }) };
      var left = s.keys.filter(function (k) { return !ISSUES[k].ok(st); });
      if (!st.fw && s.keys.indexOf('fw') < 0) left.push('fwoff');
      if (left.length) {
        var name = { disk: '硬碟還是太滿（要降到 85% 以下）', hang: '還有程式沒有回應', update: '更新還沒裝', fw: '防火牆還沒開', backup: st.backup === 'same' ? '備份在同一顆硬碟，硬碟壞了一起不見' : '重要檔案還沒備份', fwoff: '防火牆被你關掉了，很危險' };
        return svNo(left.map(function (k) { return name[k]; }).join('；') + '。', '看上面的狀態列，哪一項還是紅的？', '磁碟清理只刪暫存檔；還不夠就解除安裝「不用的」大程式。');
      }
      return svYes('病人康復了！定期清理、更新、開防火牆、備份到另一個地方，電腦就不容易生病。');
    }
  };

  /* 🍕 雲端披薩店（G7） */
  var LAYERS = ['🏢 機房、網路', '🖥️ 伺服器、儲存', '💿 作業系統', '🧰 開發平臺（資料庫、API）', '📱 應用程式'];
  var SVC = { iaas: { t: '🏗️ IaaS 租設備', n: 2 }, paas: { t: '🧰 PaaS 給平臺', n: 4 }, saas: { t: '🍕 SaaS 直接用', n: 5 } };
  var WANT = [
    { os: true, t: ['想自己挑作業系統、自己架設班級遊戲伺服器', '要自己安裝作業系統和所有軟體，只想租一台雲端主機'] },
    { os: false, code: true, t: ['寫好了一個網站程式，只想上傳就能跑，不想管作業系統', '要用雲端資料庫幫自己寫的 App 存資料'] },
    { os: false, code: false, t: ['打開瀏覽器就能寫報告、和同學一起編輯', '用網頁版信箱收發 email'] }];
  var WANT2 = [
    { os: true, t: ['公司不想買機器，但要在雲端主機上裝自己熟悉的 Linux 版本架網站', '研究團隊租雲端的運算主機，自己安裝作業系統和模擬程式'] },
    { os: false, code: true, t: ['資訊社用雲端的 App 開發平臺做校園 App，不想管伺服器和作業系統', '工程師在自己的網站裡套用雲端的翻譯 API'] },
    { os: false, code: false, t: ['老師用線上表單收作業、自動統計', '全班用雲端簡報軟體一起做期末報告'] }];
  SV.labs.cloudPizza = {
    make: function (hard) { var w = pick(hard ? WANT2 : WANT), line = pick(w.t); return { pub: { line: line }, sec: { line: line, svc: w.os ? 'iaas' : w.code ? 'paas' : 'saas', os: w.os, code: w.code } }; },
    check: function (s, v) {
      var sel = String(v.svc || ''), who = v.who || [];
      if (!SVC[sel]) svFail('bad-answer');
      if (sel !== s.svc) return svNo('客人的需求不適合「' + SVC[sel].t + '」。', s.os ? '客人要自己管作業系統 → 只租設備。' : s.code ? '客人自己寫程式，但不想管作業系統 → 給平臺。' : '客人只想打開就用 → 直接用做好的。');
      var n = SVC[s.svc].n, wrong = LAYERS.map(function (t, i) { return who[i] === (i < n ? 'cloud' : 'me') ? 0 : t; }).filter(Boolean);
      if (wrong.length) return svNo(wrong.length + ' 層標錯了：' + wrong.join('、') + '。', SVC[s.svc].t + '：雲端業者負責到「' + LAYERS[n - 1] + '」，上面的客人自己來。');
      return svYes(SVC[s.svc].t + '：雲端業者負責 ' + LAYERS.slice(0, n).map(function (l) { return l.slice(2); }).join('、') + (n < 5 ? '；客人自己負責 ' + LAYERS.slice(n).map(function (l) { return l.slice(2); }).join('、') : '；客人打開就能用') + '。');
    }
  };

  /* 🔌 嵌入式工程師（G8）：要用哪個感測器、致動器、條件怎麼寫，只有伺服器知道；測試也在伺服器跑 */
  var SENS = { light: '亮度', temp: '溫度', dist: '距離', soil: '濕度' };
  var SENS_T = { light: '光感測器（亮度 0～100）', temp: '溫度感測器（°C）', dist: '超音波距離感測器（公分）', soil: '土壤濕度感測器（0～100）' };
  var ACT = { led: '💡 LED 燈', motor: '⚙️ 開門馬達', heat: '🔥 加熱器', pump: '💧 抽水馬達', fan: '🌀 風扇' };
  var DEVS = [{ t: '🌃 自動路燈', s: 'light', a: 'led', op: '<', lo: 20, hi: 45, q: '亮度', u: '', on: '開燈', off: '關燈' },
    { t: '🚪 自動門', s: 'dist', a: 'motor', op: '<', lo: 60, hi: 150, q: '人和門的距離', u: ' 公分', on: '開門', off: '關門' },
    { t: '🌱 自動澆水器', s: 'soil', a: 'pump', op: '<', lo: 25, hi: 45, q: '土壤濕度', u: '', on: '澆水', off: '停止澆水' },
    { t: '🌀 教室自動風扇', s: 'temp', a: 'fan', op: '>', lo: 26, hi: 30, q: '溫度', u: '°C', on: '開風扇', off: '關風扇' },
    { t: '🐠 魚缸加熱棒', s: 'temp', a: 'heat', op: '<', lo: 22, hi: 26, q: '水溫', u: '°C', on: '加熱', off: '停止加熱' }];
  function emSay(d, v, mode) {
    var lt = d.op === '<';
    if (mode === 'incl') return d.q + ' ' + v + d.u + (lt ? ' 以下' : ' 以上') + '（含 ' + v + '）就' + d.on;
    if (mode === 'inv') return d.q + ' ' + v + d.u + (lt ? ' 以上' : ' 以下') + '（含 ' + v + '）就' + d.off + '，其他時候' + d.on;
    return d.q + (lt ? '低於 ' : '高於 ') + v + d.u + ' 就' + d.on + '（剛好 ' + v + ' 時不動作）';
  }
  function emWant(d, v, mode, x) { var lt = d.op === '<'; return mode === 'incl' ? (lt ? x <= v : x >= v) : (lt ? x < v : x > v); }
  SV.labs.embedded = {
    make: function (hard) {
      var di = rnd(DEVS.length), d = DEVS[di], v = between(d.lo, d.hi), mode = hard ? pick(['incl', 'inv']) : 'plain';
      var tests = shuffle([v - between(3, 8), v + between(3, 8), v - 1, v + 1, v]).map(function (x) { return Math.max(0, x); });
      if (hard) tests = tests.concat([v - 12, v + 12].map(function (x) { return Math.max(0, x); }));
      return { pub: { hard: hard, t: d.t, say: emSay(d, v, mode) }, sec: { di: di, v: v, mode: mode, tests: tests } };
    },
    check: function (s, v) {
      var d = DEVS[s.di], rule = { s: String(v.s || ''), op: String(v.op || ''), n: String(v.n == null ? '' : v.n).trim(), a: String(v.a || '') };
      if (!SENS[rule.s] || !ACT[rule.a] || ['<', '>', '='].indexOf(rule.op) < 0 || rule.n === '' || isNaN(+rule.n)) return { act: true, warn: '積木的每個空格都要填' };
      if (rule.s !== d.s) return svNo(SENS_T[rule.s] + ' 量不到「' + SENS[d.s] + '」。', '先想：這個裝置要偵測什麼？');
      if (rule.a !== d.a) return svNo('要控制的是 ' + ACT[d.a].slice(2) + '，不是 ' + ACT[rule.a].slice(2) + '。', '致動器就是「做出動作」的零件。');
      var n = +rule.n, res = s.tests.map(function (x) { var on = rule.op === '<' ? x < n : rule.op === '>' ? x > n : x === n; return { x: x, on: on, ok: on === emWant(d, s.v, s.mode, x) }; });
      var bad = res.filter(function (r) { return !r.ok; }), data = { unit: SENS[d.s], tests: res };
      if (bad.length) return svNo(bad.length + ' 個測試沒過（例如 ' + SENS[d.s] + ' ' + bad[0].x + ' 時應該' + (emWant(d, s.v, s.mode, bad[0].x) ? '開' : '關') + '）。', '「' + emSay(d, s.v, s.mode) + '」→ 比較符號和數值要照這句話寫。',
        s.mode === 'incl' ? '「' + s.v + ' 以下（含 ' + s.v + '）」＝ 比 ' + (s.v + 1) + ' 小，所以寫 < ' + (s.v + 1) + '；「以上（含）」同理寫 > ' + (s.v - 1) + '。' : s.mode === 'inv' ? '先把句子反過來：什麼時候要「打開」？那就是「如果」後面的條件。' : '「低於 ' + s.v + '」＝ < ' + s.v + '；「高於 ' + s.v + '」＝ > ' + s.v + '。', { data: data });
      return svYes('全部測試通過！感測器（輸入）→ 微控制器判斷 → 致動器（輸出），這就是嵌入式系統的主迴圈。', { data: data });
    }
  };
  SV._pf = { HW: HW, APP: APP, OS: OS, TASKS: TASKS, PARTS: PARTS, pcCheapest: pcCheapest, memBest: memBest, LV: LV, DEVS: DEVS, emWant: emWant, WANT: WANT, WANT2: WANT2, ISSUES: ISSUES };
})();
