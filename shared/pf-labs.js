/* =====================================================================
   🧪 系統平臺大冒險・視覺化實驗站（CARDGAME.labs）── 三星三階的「操作」「挑戰」用
   ---------------------------------------------------------------------
   八個實驗站：G1 平臺組合機、G2 五大單元傳令兵、G3 記憶體調度員、G4 電腦組裝師、
   G5 作業系統總管、G6 電腦急診室、G7 雲端披薩店、G8 嵌入式工程師
   ⭐ 情境由伺服器產生（server/41_labs_pf.js），也由伺服器判斷對錯；這裡只畫畫面、把學生的操作送上去（api.send）。
   畫面上的相容表、價目表、記憶體速度是「課本的規則」，本來就要給學生看；任務要的答案只在伺服器。
   ===================================================================== */
(function () {
  function esc(s) { return UI.esc(s); }
  function tip(api, text) { return api.practice ? '<div class="note small mt1">💡 提示：' + esc(text) + '</div>' : ''; }
  function warn(api, t) { api.say('<div class="note warn small">' + esc(t) + '</div>'); }
  var L = {};

  /* 🧩 平臺組合機（G1）：系統平臺＝硬體＋作業系統＋應用軟體 */
  var HW = [{ id: 'desk', t: '🖥️ 桌上型電腦', os: ['win', 'mac', 'linux'] }, { id: 'nb', t: '💻 筆記型電腦', os: ['win', 'mac', 'linux'] },
    { id: 'phone', t: '📱 手機', os: ['android', 'ios'] }, { id: 'watch', t: '⌚ 智慧手錶', os: ['wearos', 'watchos'] }];
  var OS = { win: 'Windows', mac: 'macOS', linux: 'Linux', android: 'Android', ios: 'iOS', wearos: 'Wear OS', watchos: 'watchOS' };
  var APP = [{ id: 'nav', t: '🗺️ 地圖導航', os: ['android', 'ios', 'wearos', 'watchos'] }, { id: 'edit', t: '🎬 專業影片剪輯', os: ['win', 'mac'] }, { id: 'heart', t: '❤️ 心跳紀錄', os: ['wearos', 'watchos'] },
    { id: 'office', t: '📝 文書處理', os: ['win', 'mac', 'linux', 'android', 'ios'] }, { id: 'code', t: '🐍 寫 Python 程式', os: ['win', 'mac', 'linux'] }, { id: 'chat', t: '💬 即時通訊', os: ['android', 'ios', 'win', 'mac'] }];
  var TYPE4 = { pc: '🖥️ 電腦系統平臺', mobile: '📱 可攜式系統平臺', cloud: '☁️ 雲端系統平臺', emb: '🔌 嵌入式系統平臺' };
  L.platformBuilder = function (el, api) {
    var P = api.pub, sel = { hw: null, os: null, app: null, type: null };
    el.dataset.lab = 'platformBuilder'; el.dataset.task = JSON.stringify({ t: P.t });
    el.innerHTML = '<div class="pb"><p class="small">任務：<b>' + esc(P.t) + '</b>。挑一組能用的<b>硬體＋作業系統＋應用軟體</b>，再判斷它是哪一種系統平臺。</p>' +
      tip(api, '先看任務要不要隨身帶著；硬體決定能裝哪些作業系統，作業系統決定能裝哪些 App（看下面的相容表）。') +
      '<details class="small mt1"><summary class="bold">📋 相容表（點開）</summary><table class="t tiny mt1"><tr><th>硬體</th><th>能裝的作業系統</th></tr>' + HW.map(function (h) { return '<tr><td>' + h.t + '</td><td>' + h.os.map(function (o) { return OS[o]; }).join('、') + '</td></tr>'; }).join('') +
      '</table><table class="t tiny mt1"><tr><th>App</th><th>支援的作業系統</th></tr>' + APP.map(function (a) { return '<tr><td>' + a.t + '</td><td>' + a.os.map(function (o) { return OS[o]; }).join('、') + '</td></tr>'; }).join('') + '</table></details>' +
      '<div class="pb-stack mt1" id="pb"></div><div class="row mt2"><button type="button" class="btn go" id="pb-ok">✅ 組好了</button></div></div>';
    function row(key, title, opts) {
      return '<div class="pb-row"><b class="tiny">' + title + '</b><div class="pb-opts">' + opts.map(function (o) { return '<button type="button" class="btn sm pb-o' + (sel[key] === o.id ? ' on' : '') + '" data-k="' + key + '" data-v="' + o.id + '">' + esc(o.t) + '</button>'; }).join('') + '</div></div>';
    }
    function draw() {
      el.querySelector('#pb').innerHTML = row('app', '📦 應用軟體', APP) + row('os', '⚙️ 作業系統', Object.keys(OS).map(function (k) { return { id: k, t: OS[k] }; })) + row('hw', '🔩 硬體', HW) +
        row('type', '🏷️ 這是哪一種系統平臺？', (P.hard ? ['pc', 'mobile', 'cloud', 'emb'] : ['pc', 'mobile']).map(function (k) { return { id: k, t: TYPE4[k] }; }));
      el.querySelectorAll('.pb-o').forEach(function (b) { b.onclick = function () { sel[b.dataset.k] = b.dataset.v; draw(); }; });
    }
    el.querySelector('#pb-ok').onclick = function () {
      if (!sel.hw || !sel.os || !sel.app || !sel.type) return warn(api, '硬體、作業系統、應用軟體、平臺種類都要選');
      api.send(sel);
    };
    draw();
  };

  /* 🏭 五大單元傳令兵（G2）：讓資料依序經過五大單元，走到算術與邏輯單元時自己算（每一步都由伺服器確認） */
  var UNITS = [{ id: 'in', t: '⌨️ 輸入單元' }, { id: 'mem', t: '🗄️ 記憶單元' }, { id: 'ctl', t: '🎛️ 控制單元' }, { id: 'alu', t: '🧮 算術與邏輯單元' }, { id: 'out', t: '🖥️ 輸出單元' }];
  L.fiveUnits = function (el, api) {
    var P = api.pub, path = [], busy = false, calc = null;
    el.dataset.lab = 'fiveUnits'; el.dataset.task = P.t;
    el.innerHTML = '<div class="fu"><p class="small">任務：<b>' + esc(P.t) + '</b>。點下一個要工作的單元，讓 📨 資料一站一站走完。走到「算術與邏輯單元」時要自己算！</p>' +
      tip(api, '資料從輸入進來 → 先存進記憶 → 控制單元下指令 → 算術與邏輯單元計算 → 結果存回記憶 → 輸出。') +
      '<div class="fu-map"><div class="fu-cpu"><span class="tiny bold">中央處理器 CPU</span><div class="fu-cpu-in" id="fu-cpu"></div></div><div class="fu-side" id="fu-side"></div></div>' +
      '<div class="fu-path mt1" id="fu-path"></div><div id="fu-calc" class="mt1"></div></div>';
    function unitBtn(u) { var here = path.length && path[path.length - 1] === u.id; return '<button type="button" class="fu-u' + (here ? ' here' : '') + '" data-u="' + u.id + '">' + u.t + (here ? '<span class="fu-tok">📨</span>' : '') + '</button>'; }
    function draw() {
      el.querySelector('#fu-cpu').innerHTML = UNITS.filter(function (u) { return u.id === 'ctl' || u.id === 'alu'; }).map(unitBtn).join('');
      el.querySelector('#fu-side').innerHTML = UNITS.filter(function (u) { return u.id !== 'ctl' && u.id !== 'alu'; }).map(unitBtn).join('');
      el.querySelector('#fu-path').innerHTML = path.length ? path.map(function (p) { return '<span class="chip">' + UNITS.filter(function (u) { return u.id === p; })[0].t + '</span>'; }).join(' → ') : '<span class="tiny soft">資料還在外面，先點第一個單元</span>';
      el.querySelectorAll('.fu-u').forEach(function (b) { b.onclick = function () { go(b.dataset.u); }; });
    }
    function go(u) {
      if (calc) return warn(api, '先把算術與邏輯單元的計算做完');
      if (busy) return; busy = true;
      api.send({ op: 'step', u: u }).then(function (r) {
        busy = false;
        if (!r || !r.ok) return;
        path.push(u); draw();
        if (r.data && r.data.calc) {
          calc = r.data.calc;
          el.querySelector('#fu-calc').innerHTML = '<div class="row"><b>🧮 計算：' + esc(calc) + ' ＝</b><input class="input" id="fu-ans" style="max-width:8rem;margin:0" inputmode="numeric" aria-label="計算結果"><button type="button" class="btn go" id="fu-go">算好了</button></div>';
          var inp = el.querySelector('#fu-ans'); inp.focus();
          inp.onkeydown = function (e) { if (e.key === 'Enter') el.querySelector('#fu-go').click(); };
          el.querySelector('#fu-go').onclick = function () {
            if (busy) return; busy = true;
            api.send({ op: 'calc', v: +inp.value }).then(function (r2) {
              busy = false;
              if (r2 && r2.ok) { el.querySelector('#fu-calc').innerHTML = '<div class="note ok small">' + esc(r2.say || '') + '</div>'; calc = null; }
            });
          };
        }
      });
    }
    draw();
  };

  /* 📦 記憶體調度員（G3）：把資料放到快取／RAM／輔助記憶體，讓 CPU 找資料的總時間最短 */
  var LV = [{ id: 'cache', t: '📝 快取記憶體', cap: 2, ns: 1 }, { id: 'ram', t: '📒 RAM', cap: 3, ns: 10 }, { id: 'disk', t: '📚 輔助記憶體', cap: 99, ns: 200 }];
  L.memPlan = function (el, api) {
    var P = api.pub, items = P.items, place = items.map(function () { return null; });
    el.dataset.lab = 'memPlan'; el.dataset.items = JSON.stringify(items);
    el.innerHTML = '<div class="mp"><p class="small">CPU 等一下要讀這些資料很多次。把每筆資料放到一層記憶體，讓<b>總讀取時間最短</b>。' + (P.hard ? '<b>🔒 標了「關機後要留著」的，只能放在關機不會消失的地方。</b>' : '') + '</p>' +
      '<div class="mp-lv">' + LV.map(function (l) { return '<span><b>' + l.t + '</b> 每次 ' + l.ns + ' 單位・' + (l.cap > 50 ? '放得下全部' : '最多 ' + l.cap + ' 筆') + (l.id === 'disk' ? '・關機還在' : '・關機就消失') + '</span>'; }).join('') + '</div>' +
      tip(api, '越常用的資料放越快的地方：次數最多的 2 筆放快取、接下來 3 筆放 RAM，其他放輔助記憶體。') +
      '<div class="mp-list mt1" id="mp-list"></div><div class="row between mt2"><b id="mp-sum"></b><button type="button" class="btn go" id="mp-ok">▶ 讓 CPU 讀讀看</button></div></div>';
    function cost() { return items.reduce(function (a, it, i) { return a + it.n * LV.filter(function (l) { return l.id === place[i]; })[0].ns; }, 0); }
    function draw() {
      el.querySelector('#mp-list').innerHTML = items.map(function (it, i) {
        return '<div class="mp-row"><span><b>' + esc(it.t) + '</b>' + (it.keep ? ' <span class="chip">🔒 關機後要留著</span>' : '') + '<small>要讀 ' + it.n + ' 次</small></span><span class="mp-btns">' +
          LV.map(function (l) { return '<button type="button" class="btn sm mp-b' + (place[i] === l.id ? ' on' : '') + '" data-i="' + i + '" data-l="' + l.id + '">' + l.t.split(' ')[1] + '</button>'; }).join('') + '</span></div>';
      }).join('');
      el.querySelector('#mp-sum').textContent = place.indexOf(null) < 0 ? '預估總時間：' + cost().toLocaleString() + ' 單位' : '還有資料沒放';
      el.querySelectorAll('.mp-b').forEach(function (b) { b.onclick = function () { place[+b.dataset.i] = b.dataset.l; draw(); }; });
    }
    el.querySelector('#mp-ok').onclick = function () {
      if (place.indexOf(null) >= 0) return warn(api, '每筆資料都要放');
      api.send({ place: place });
    };
    draw();
  };

  /* 🔧 電腦組裝師（G4）：照客人的需求和預算挑零件（每台另加 8,000 元主機板、電源、機殼、螢幕） */
  var PARTS = { cpu: [{ id: 'c2', t: '雙核心', $: 3000 }, { id: 'c4', t: '四核心', $: 6000 }, { id: 'c8', t: '八核心', $: 12000 }, { id: 'c16', t: '十六核心', $: 22000 }],
    ram: [{ id: 'r8', t: '8 GB', $: 1500 }, { id: 'r16', t: '16 GB', $: 3000 }, { id: 'r32', t: '32 GB', $: 6000 }],
    disk: [{ id: 'h1', t: 'HDD 1TB', $: 1500 }, { id: 's512', t: 'SSD 512GB', $: 2000 }, { id: 's1', t: 'SSD 1TB', $: 3500 }, { id: 's2', t: 'SSD 2TB', $: 6500 }, { id: 'h4', t: 'HDD 4TB', $: 3500 }] };
  L.pcBuild = function (el, api) {
    var P = api.pub, need = P.need, budget = P.budget, sel = { cpu: null, ram: null, disk: null };
    el.dataset.lab = 'pcBuild'; el.dataset.need = JSON.stringify(need); el.dataset.budget = budget;
    el.innerHTML = '<div class="pc"><p class="small"><b>' + esc(P.who) + '</b> 的需求：至少 <b>' + need.cores + ' 核心</b>、RAM 至少 <b>' + need.ram + ' GB</b>、儲存空間至少 <b>' + (need.cap >= 1000 ? need.cap / 1000 + ' TB' : need.cap + ' GB') + '</b>' + (need.ssd ? '、<b>開機和讀檔要快（要 SSD）</b>' : '') + '。預算 <b>$' + budget.toLocaleString() + '</b>' + (P.hard ? '（剛好夠買最省的組合）' : '') + '。</p>' +
      '<p class="tiny soft">每台另加 $8,000（主機板、電源、機殼、螢幕）。HDD 便宜、容量大但比較慢；SSD 快很多但比較貴。</p>' +
      tip(api, '每一項都挑「剛好達到需求」的最便宜選項；需要快就一定要 SSD。') +
      '<div class="pc-parts" id="pc-parts"></div><div class="row between mt2"><b id="pc-sum"></b><button type="button" class="btn go" id="pc-ok">🔧 組裝</button></div></div>';
    function draw() {
      el.querySelector('#pc-parts').innerHTML = [['cpu', '處理器 CPU'], ['ram', '記憶體 RAM'], ['disk', '儲存裝置']].map(function (k) {
        return '<div class="pc-row"><b class="tiny">' + k[1] + '</b><div class="pb-opts">' + PARTS[k[0]].map(function (p) { return '<button type="button" class="btn sm pc-o' + (sel[k[0]] === p ? ' on' : '') + '" data-k="' + k[0] + '" data-id="' + p.id + '">' + p.t + '<small>$' + p.$.toLocaleString() + '</small></button>'; }).join('') + '</div></div>';
      }).join('');
      var full = sel.cpu && sel.ram && sel.disk, c = full ? 8000 + sel.cpu.$ + sel.ram.$ + sel.disk.$ : 0;
      el.querySelector('#pc-sum').innerHTML = full ? '總價 <span style="color:' + (c > budget ? 'var(--bad)' : 'var(--ok)') + '">$' + c.toLocaleString() + '</span> / 預算 $' + budget.toLocaleString() : '三樣零件都要選';
      el.querySelectorAll('.pc-o').forEach(function (b) { b.onclick = function () { sel[b.dataset.k] = PARTS[b.dataset.k].filter(function (p) { return p.id === b.dataset.id; })[0]; draw(); }; });
    }
    el.querySelector('#pc-ok').onclick = function () {
      if (!sel.cpu || !sel.ram || !sel.disk) return warn(api, '三樣零件都要選');
      api.send({ cpu: sel.cpu.id, ram: sel.ram.id, disk: sel.disk.id });
    };
    draw();
  };

  /* 🧑‍💼 作業系統總管（G5）：記憶體管理 —— RAM 不夠開新程式時，關掉哪些？ */
  L.osManager = function (el, api) {
    var P = api.pub, TOTAL = P.TOTAL, osG = P.osG, newP = P.newP, keepI = P.keepI, lostWork = false;
    var run = P.run.map(function (p) { return { t: p.t, g: p.g, saved: p.saved, open: true }; });
    el.dataset.lab = 'osManager'; el.dataset.state = JSON.stringify(P);
    el.innerHTML = '<div class="om"><p class="small">RAM 共 <b>' + TOTAL + ' GB</b>。你要開 <b>' + esc(newP.t) + '（需要 ' + newP.g + ' GB）</b>，但記憶體不夠了。當一次作業系統：關掉一些程式讓出空間。' +
      (P.hard ? '<b>「' + esc(run[keepI].t) + '」正在用，不能關</b>；而且<b>關越少個越好</b>。' : '') + '</p>' +
      tip(api, '作業系統本身不能關；還沒存檔的要先存檔再關，不然作業就不見了。挑佔用大的關，比較快讓出空間。') +
      '<div class="om-ram" id="om-ram"></div><div class="om-list mt1" id="om-list"></div>' +
      '<div class="row mt2"><button type="button" class="btn go" id="om-go">▶ 開啟 ' + esc(newP.t) + '</button><span class="tiny soft" id="om-msg"></span></div></div>';
    function freeG() { return TOTAL - osG - run.reduce(function (a, p) { return a + (p.open ? p.g : 0); }, 0); }
    function draw() {
      var f = freeG();
      el.querySelector('#om-ram').innerHTML = '<div class="om-bar"><i class="os" style="width:' + (osG / TOTAL * 100) + '%">⚙️ 作業系統 ' + osG + 'G</i>' +
        run.filter(function (p) { return p.open; }).map(function (p) { return '<i style="width:' + (p.g / TOTAL * 100) + '%" title="' + esc(p.t) + '">' + esc(p.t.split(' ')[0].split('（')[0]) + ' ' + p.g + 'G</i>'; }).join('') +
        '<i class="free" style="width:' + (Math.max(0, f) / TOTAL * 100) + '%">空 ' + f + 'G</i></div><p class="tiny bold mt1">可用 ' + f + ' GB / 需要 ' + newP.g + ' GB</p>';
      el.querySelector('#om-list').innerHTML = '<div class="om-p"><span>⚙️ 作業系統</span><b>' + osG + ' GB</b><button type="button" class="btn sm" id="om-os">✕ 關閉</button></div>' + run.map(function (p, i) {
        return '<div class="om-p' + (p.open ? '' : ' off') + '"><span>' + esc(p.t) + (p.saved ? '' : ' <span class="chip">未存檔</span>') + (i === keepI ? ' <span class="chip">正在用</span>' : '') + '</span><b>' + p.g + ' GB</b>' +
          (p.open ? (!p.saved ? '<button type="button" class="btn sm om-save" data-i="' + i + '">💾 存檔</button>' : '') + '<button type="button" class="btn sm om-x" data-i="' + i + '">✕ 關閉</button>' : '<button type="button" class="btn sm om-re" data-i="' + i + '">↺ 重開</button>') + '</div>';
      }).join('');
      el.querySelector('#om-os').onclick = function () { api.send({ op: 'os' }); };
      el.querySelectorAll('.om-x').forEach(function (b) { b.onclick = function () { var p = run[+b.dataset.i]; if (!p.saved) lostWork = true; p.open = false; draw(); }; });
      el.querySelectorAll('.om-re').forEach(function (b) { b.onclick = function () { run[+b.dataset.i].open = true; draw(); }; });
      el.querySelectorAll('.om-save').forEach(function (b) { b.onclick = function () { run[+b.dataset.i].saved = true; el.querySelector('#om-msg').textContent = '💾 已存檔（存到輔助記憶體）'; draw(); }; });
    }
    el.querySelector('#om-go').onclick = function () {
      var lost = lostWork; lostWork = false;
      api.send({ lost: lost, open: run.map(function (p) { return p.open; }) }).then(function (r) {
        if (r && r.restore) { run.forEach(function (p) { if (!p.saved) p.open = true; }); draw(); }
      });
    };
    draw();
  };

  /* 🚑 電腦急診室（G6）：看病人的電腦狀態，用對工具修好（看診結束時把狀態送去給伺服器檢查） */
  L.pcDoctor = function (el, api) {
    var P = api.pub, S0 = P.st, s, done;
    function fresh() {
      s = { used: S0.used, temp: S0.temp, updates: S0.updates, fw: S0.fw, backup: S0.backup, apps: S0.apps.map(function (a) { return { t: a.t, g: a.g }; }), procs: S0.procs.map(function (p) { return { t: p.t, on: true }; }) };
      done = { cleaned: false, gone: {}, ended: {}, updated: false };
    }
    fresh();
    el.dataset.lab = 'pcDoctor'; el.dataset.says = JSON.stringify(P.says);
    el.innerHTML = '<div class="dr"><p class="small">🩺 病人說：' + P.says.map(function (t) { return '<br>' + esc(t); }).join('') + '</p>' +
      tip(api, '空間不夠 → 磁碟清理、解除安裝不用的程式；程式當掉 → 工作管理員；安全性更新 → 系統更新；可疑連線 → 防火牆；硬碟怪聲 → 趕快備份到另一個地方。') +
      '<div class="dr-stat" id="dr-stat"></div><div class="dr-tools">' + [['clean', '🧹 磁碟清理'], ['uninst', '🗑️ 解除安裝'], ['update', '🔄 系統更新'], ['fw', '🧱 防火牆'], ['task', '📋 工作管理員'], ['backup', '💾 備份']].map(function (t) { return '<button type="button" class="btn sm dr-t" data-t="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' +
      '<div id="dr-panel" class="dr-panel mt1"></div><div class="row mt2"><button type="button" class="btn go" id="dr-ok">🩺 看診結束</button></div></div>';
    function stat() {
      el.querySelector('#dr-stat').innerHTML = '<span>💽 硬碟 <b style="color:' + (s.used > 85 ? 'var(--bad)' : 'var(--ok)') + '">' + s.used + '%</b></span><span>🔄 待安裝更新 <b>' + s.updates + '</b></span><span>🧱 防火牆 <b>' + (s.fw ? '開' : '關') + '</b></span>' +
        '<span>💾 備份 <b>' + (s.backup === 'ext' ? '外接硬碟' : s.backup === 'same' ? '同一顆硬碟' : '沒有') + '</b></span><span>📋 沒有回應 <b>' + s.procs.filter(function (p) { return p.on && /沒有回應/.test(p.t); }).length + '</b></span>';
    }
    function show(t) {
      var p = el.querySelector('#dr-panel'), h = '';
      if (t === 'clean') h = '<p class="small">暫存檔 ' + s.temp + '% 的空間</p><button type="button" class="btn sm" id="dr-clean">刪除暫存檔</button>';
      if (t === 'uninst') h = s.apps.map(function (a, i) { return '<div class="om-p"><span>' + esc(a.t) + '</span><b>' + a.g + '%</b>' + (done.gone[i] ? '<span class="tiny soft">已移除</span>' : '<button type="button" class="btn sm dr-un" data-i="' + i + '">解除安裝</button>') + '</div>'; }).join('');
      if (t === 'update') h = '<p class="small">待安裝的更新：' + s.updates + ' 個</p><button type="button" class="btn sm" id="dr-upd">安裝更新</button>';
      if (t === 'fw') h = '<p class="small">防火牆目前：<b>' + (s.fw ? '開啟' : '關閉') + '</b></p><button type="button" class="btn sm" id="dr-fw">' + (s.fw ? '關閉防火牆' : '開啟防火牆') + '</button>';
      if (t === 'task') h = s.procs.map(function (q, i) { return '<div class="om-p"><span>' + esc(q.t) + '</span>' + (q.on ? '<button type="button" class="btn sm dr-end" data-i="' + i + '">結束工作</button>' : '<span class="tiny soft">已結束</span>') + '</div>'; }).join('');
      if (t === 'backup') h = '<p class="small">重要檔案要備份到哪裡？</p><button type="button" class="btn sm dr-bk" data-b="ext">外接硬碟</button> <button type="button" class="btn sm dr-bk" data-b="same">同一顆硬碟的另一個資料夾</button>';
      p.innerHTML = h;
      var q = function (id) { return p.querySelector(id); };
      if (q('#dr-clean')) q('#dr-clean').onclick = function () { if (!done.cleaned) { s.used = Math.max(0, s.used - s.temp); s.temp = 0; done.cleaned = true; } stat(); show('clean'); };
      p.querySelectorAll('.dr-un').forEach(function (b) { b.onclick = function () { var i = +b.dataset.i; done.gone[i] = 1; s.used -= s.apps[i].g; stat(); show('uninst'); }; });
      if (q('#dr-upd')) q('#dr-upd').onclick = function () { s.updates = 0; done.updated = true; stat(); show('update'); };
      if (q('#dr-fw')) q('#dr-fw').onclick = function () { s.fw = !s.fw; stat(); show('fw'); };
      p.querySelectorAll('.dr-end').forEach(function (b) { b.onclick = function () { var i = +b.dataset.i; s.procs[i].on = false; done.ended[i] = 1; stat(); show('task'); }; });
      p.querySelectorAll('.dr-bk').forEach(function (b) { b.onclick = function () { s.backup = b.dataset.b; stat(); show('backup'); }; });
    }
    el.querySelectorAll('.dr-t').forEach(function (b) { b.onclick = function () { show(b.dataset.t); }; });
    el.querySelector('#dr-ok').onclick = function () {
      api.send({ cleaned: done.cleaned, gone: done.gone, ended: done.ended, updated: done.updated, fw: s.fw, backup: s.backup }).then(function (r) {
        if (r && r.reset) { fresh(); stat(); el.querySelector('#dr-panel').innerHTML = ''; }   // 弄壞了東西：病人換一台一樣的電腦重來
      });
    };
    stat();
  };

  /* 🍕 雲端披薩店（G7）：依客人要自己做到哪裡，判斷 IaaS／PaaS／SaaS，並標出每一層誰負責 */
  var LAYERS = [{ t: '🏢 機房、網路', p: '店面、水電' }, { t: '🖥️ 伺服器、儲存', p: '廚房、烤箱' }, { t: '💿 作業系統', p: '廚具、爐火設定' }, { t: '🧰 開發平臺（資料庫、API）', p: '現成餅皮、醬料' }, { t: '📱 應用程式', p: '做好的披薩' }];
  var SVC = { iaas: '🏗️ IaaS 租設備', paas: '🧰 PaaS 給平臺', saas: '🍕 SaaS 直接用' };
  L.cloudPizza = function (el, api) {
    var P = api.pub, sel = null, who = LAYERS.map(function () { return null; });
    el.dataset.lab = 'cloudPizza'; el.dataset.line = P.line;
    el.innerHTML = '<div class="cz"><p class="small">客人說：<b>「' + esc(P.line) + '」</b>。選一種雲端服務，再把每一層標成<b>雲端業者負責</b>或<b>客人自己來</b>。</p>' +
      tip(api, 'IaaS 只租機房和伺服器；PaaS 連作業系統、開發平臺都準備好；SaaS 整個做好給你用。') +
      '<div class="pb-opts">' + Object.keys(SVC).map(function (k) { return '<button type="button" class="btn sm cz-s" data-s="' + k + '">' + SVC[k] + '</button>'; }).join('') + '</div>' +
      '<div class="cz-stack mt1" id="cz-stack"></div><div class="row mt2"><button type="button" class="btn go" id="cz-ok">🍕 開店</button></div></div>';
    function draw() {
      el.querySelectorAll('.cz-s').forEach(function (b) { b.classList.toggle('on', b.dataset.s === sel); });
      el.querySelector('#cz-stack').innerHTML = LAYERS.map(function (l, i) { return i; }).reverse().map(function (i) {
        var l = LAYERS[i];
        return '<div class="cz-l ' + (who[i] || '') + '"><span><b>' + l.t + '</b><small>🍕 ' + l.p + '</small></span><span class="pb-opts"><button type="button" class="btn sm cz-w' + (who[i] === 'cloud' ? ' on' : '') + '" data-i="' + i + '" data-w="cloud">☁️ 雲端業者</button><button type="button" class="btn sm cz-w' + (who[i] === 'me' ? ' on' : '') + '" data-i="' + i + '" data-w="me">🙋 客人自己</button></span></div>';
      }).join('');
      el.querySelectorAll('.cz-w').forEach(function (b) { b.onclick = function () { who[+b.dataset.i] = b.dataset.w; draw(); }; });
    }
    el.querySelectorAll('.cz-s').forEach(function (b) { b.onclick = function () { sel = b.dataset.s; draw(); }; });
    el.querySelector('#cz-ok').onclick = function () {
      if (!sel || who.indexOf(null) >= 0) return warn(api, '服務種類和每一層都要選');
      api.send({ svc: sel, who: who });
    };
    draw();
  };

  /* 🔌 嵌入式工程師（G8）：用積木寫出「如果 感測器 比較 數值 那麼 致動器 開 否則 關」，測試由伺服器跑 */
  var SENS = { light: '光感測器（亮度 0～100）', temp: '溫度感測器（°C）', dist: '超音波距離感測器（公分）', soil: '土壤濕度感測器（0～100）' };
  var ACT = { led: '💡 LED 燈', motor: '⚙️ 開門馬達', heat: '🔥 加熱器', pump: '💧 抽水馬達', fan: '🌀 風扇' };
  L.embedded = function (el, api) {
    var P = api.pub;
    el.dataset.lab = 'embedded'; el.dataset.say = P.say; el.dataset.t = P.t;
    el.innerHTML = '<div class="em"><p class="small">做一個 <b>' + esc(P.t) + '</b>：<b>' + esc(P.say) + '</b>。用積木拼出微控制器的程式，再按「▶ 測試」。</p>' +
      (P.hard ? '<p class="tiny soft">⚠️ 積木只有「如果…那麼 打開…否則 關掉」，條件要怎麼寫才能讓每一個測試值都對？</p>' : '') +
      tip(api, '感測器量什麼（亮度、距離、溫度、濕度）？致動器做什麼動作（開燈、開門、加熱…）？「低於」用 <、「高於」用 >。') +
      '<div class="em-code"><div class="blk ctl">重複執行</div><div class="em-in"><div class="blk ctl">如果 <select class="input em-s" id="em-s" aria-label="感測器"><option value="">感測器</option>' + Object.keys(SENS).map(function (k) { return '<option value="' + k + '">' + SENS[k] + '</option>'; }).join('') +
      '</select> <select class="input em-o" id="em-o" aria-label="比較"><option value="">比較</option><option>&lt;</option><option>&gt;</option><option>=</option></select> <input class="input em-n" id="em-n" inputmode="numeric" placeholder="數值" aria-label="數值"> 那麼</div>' +
      '<div class="em-in"><div class="blk act">打開 <select class="input" id="em-a" aria-label="致動器"><option value="">致動器</option>' + Object.keys(ACT).map(function (k) { return '<option value="' + k + '">' + ACT[k] + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="blk ctl">否則</div><div class="em-in"><div class="blk act">關掉它</div></div></div></div>' +
      '<div class="row mt2"><button type="button" class="btn go" id="em-run">▶ 測試</button></div><div class="em-tests mt1" id="em-tests"></div></div>';
    el.querySelector('#em-run').onclick = function () {
      var rule = { s: el.querySelector('#em-s').value, op: el.querySelector('#em-o').value, n: el.querySelector('#em-n').value.trim(), a: el.querySelector('#em-a').value };
      if (!rule.s || !rule.op || rule.n === '' || !rule.a) return warn(api, '積木的每個空格都要填');
      api.send(rule).then(function (r) {
        var d = r && r.data; if (!d) return;
        el.querySelector('#em-tests').innerHTML = '<p class="tiny bold">🧪 測試（' + esc(d.unit) + '）</p>' + d.tests.map(function (t) { return '<span class="em-t ' + (t.ok ? 'ok' : 'bad') + '">' + t.x + ' → ' + (t.on ? '開' : '關') + (t.ok ? ' ✔' : ' ✘') + '</span>'; }).join('');
      });
    };
  };

  CARDGAME.labs = Object.assign(CARDGAME.labs || {}, L);
})();
