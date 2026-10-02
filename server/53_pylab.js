/* ── 🐍 pylab 學生版：進度碼（伺服器端鎖關＋成績卡驗證＋換電腦還原）─────────
   進度碼 12 碼（XXXX-XXXX-XXXX）：前 4 碼＝10 關的星數（每關 0～3，壓成 20 位元），後 8 碼＝伺服器簽章。
   簽章只綁「學期｜班級｜座號」，不綁姓名 —— 姓名打錯可以隨時改，不影響進度。
   ・py （mod = 'pylab'）：要附進度碼；第 N 關要進度碼裡第 N−1 關 ≥ 2⭐ 才能評分（F12 改瀏覽器紀錄跳不了關）
   ・pyg：評分後把這一關的星數（只增不減）寫進新的進度碼回傳
   ・pcv：驗證進度碼 → 各關星數（老師驗證成績卡、學生換電腦還原進度）
   ・pls：學生登入時同步雲端存檔（下面）；plt：老師看進度表
   學生自己改不出正確的簽章（金鑰是指令碼屬性 SECRET）。 */
var PL_B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';   // Crockford Base32：沒有 I L O U，比較不會抄錯

function plLevels(term) { var T = SV_ANS.py[term]; if (!T) svFail('no-term'); var ks = Object.keys(T); if (ks.length > 10) svFail('server'); return ks; }
function plWho(w) {
  w = w || {};
  var cls = String(w.cls == null ? '' : w.cls).trim().slice(0, 8), seat = String(w.seat == null ? '' : w.seat).trim().replace(/^0+(?=\d)/, '');
  if (!cls || !/^\d{1,3}$/.test(seat)) svFail('bad-who');
  return { cls: cls, seat: seat };
}
function plNorm(code) { return String(code || '').toUpperCase().replace(/[\s\-]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1'); }
function plSig(term, w, packed) {
  var b = Utilities.computeHmacSha256Signature(['pylab', term, w.cls, w.seat, packed].join('|'), svSecret()), bits = '', s = '';
  for (var i = 0; i < 5; i++) bits += ('0000000' + ((b[i] + 256) % 256).toString(2)).slice(-8);
  for (var j = 0; j < 40; j += 5) s += PL_B32.charAt(parseInt(bits.substr(j, 5), 2));
  return s;
}
function plPack(stars) {
  var v = 0, s = '';
  for (var i = stars.length - 1; i >= 0; i--) v = v * 4 + Math.max(0, Math.min(3, stars[i] | 0));
  for (var k = 0; k < 4; k++) { s = PL_B32.charAt(v % 32) + s; v = Math.floor(v / 32); }
  return s;
}
function plUnpack(p, n) {
  var v = 0, out = [];
  for (var i = 0; i < 4; i++) { var d = PL_B32.indexOf(p.charAt(i)); if (d < 0) svFail('bad-code'); v = v * 32 + d; }
  for (var k = 0; k < n; k++) { out.push(v % 4); v = Math.floor(v / 4); }
  if (v) svFail('bad-code');
  return out;
}
/* 讀進度碼：空的＝全新的學生（全部 0⭐）；簽章對不上 → bad-code */
function plRead(term, w, code) {
  var n = plLevels(term).length, c = plNorm(code);
  if (!c) { var z = []; for (var i = 0; i < n; i++) z.push(0); return z; }
  if (!/^[0-9A-Z]{12}$/.test(c) || plSig(term, w, c.slice(0, 4)) !== c.slice(4)) svFail('bad-code');
  return plUnpack(c.slice(0, 4), n);
}
function plMake(term, w, stars) { var p = plPack(stars), c = p + plSig(term, w, p); return c.slice(0, 4) + '-' + c.slice(4, 8) + '-' + c.slice(8); }

/* ── ☁️ 雲端存檔：每位學生的星數記在出題老師的 Google 試算表「course_116 pylab 學生進度」（電腦教室有還原卡也不怕）──
   ・指令碼屬性 PYLAB_SHEET_ID：第一次用到時自動建立；PYLAB_TEACHER_KEY：老師看進度表的密碼（編輯器執行「pylab老師密碼」產生）
   ・同一位學生＝學期＋班級＋座號（姓名記最新的一次）
   ・試算表壞了或沒授權：自動退回只用進度碼，不影響評分 */
var PL_TAB = '學生進度';
function plBook(create) {
  var P = PropertiesService.getScriptProperties(), id = P.getProperty('PYLAB_SHEET_ID'), ss = null;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
  if (!ss && create) { ss = SpreadsheetApp.create('course_116 pylab 學生進度'); P.setProperty('PYLAB_SHEET_ID', ss.getId()); }
  return ss;
}
function plTab(create) {
  var ss = plBook(create); if (!ss) return null;
  var sh = ss.getSheetByName(PL_TAB);
  if (!sh && create) sh = ss.insertSheet(PL_TAB);
  if (sh && sh.getLastRow() === 0) {
    var head = ['學期', '班級', '座號', '姓名']; for (var i = 1; i <= 10; i++) head.push('P' + i);
    sh.appendRow(head.concat(['合計', '最後更新', '進度碼']));
  }
  return sh;
}
function plKey(term, w) { return 'pl:' + term + ':' + w.cls + '_' + w.seat; }
function plFind(sh, term, w) {
  var v = sh.getDataRange().getValues();
  for (var r = 1; r < v.length; r++) if (String(v[r][0]) === term && String(v[r][1]) === w.cls && String(v[r][2]) === w.seat) return { row: r + 1, v: v[r] };
  return null;
}
/* 讀雲端的星數：{ stars, name } 或 null（沒有紀錄／試算表不能用） */
function plDbGet(term, w) {
  var c = svCache(), k = plKey(term, w), hit = c.get(k);
  if (hit) return JSON.parse(hit);
  try {
    var sh = plTab(false); if (!sh) return null;
    var f = plFind(sh, term, w); if (!f) return null;
    var n = plLevels(term).length, st = []; for (var i = 0; i < n; i++) st.push(Math.max(0, Math.min(3, +f.v[4 + i] || 0)));
    var o = { stars: st, name: String(f.v[3] || '') }; c.put(k, JSON.stringify(o), 21600); return o;
  } catch (e) { return null; }
}
function plDbPut(term, w, name, stars) {
  try {
    svWithLock(function () {
      var sh = plTab(true), f = plFind(sh, term, w), row = [term, w.cls, w.seat, String(name || '').replace(/^[=+\-@]/, "'$&").slice(0, 20)];
      var st = stars.slice(); if (f) for (var i = 0; i < st.length; i++) st[i] = Math.max(st[i], Math.max(0, Math.min(3, +f.v[4 + i] || 0)));   // 只增不減
      for (var j = 0; j < 10; j++) row.push(j < st.length ? st[j] : '');
      row.push(st.reduce(function (a, b) { return a + b; }, 0), new Date(), plMake(term, w, st));
      if (f) sh.getRange(f.row, 1, 1, row.length).setValues([row]); else sh.appendRow(row);
      svCache().put(plKey(term, w), JSON.stringify({ stars: st, name: row[3] }), 21600);
    });
    return true;
  } catch (e) { return false; }
}
function plMax(a, b) { return a.map(function (x, i) { return Math.max(x, (b && b[i]) || 0); }); }

/* py 開局時呼叫（mod = 'pylab'）：雲端紀錄＋進度碼取大的 → 檢查鎖關 */
function plStart(req, term, lv) {
  var w = plWho(req.who), db = plDbGet(term, w), stars = plMax(plRead(term, w, req.pc), db && db.stars), i = plLevels(term).indexOf(lv);
  if (i < 0) svFail('no-level');
  if (i > 0 && stars[i - 1] < 2) svFail('locked');
  return { w: w, name: String((req.who || {}).name || '').slice(0, 20), stars: stars };
}
/* pyg 評分後呼叫：這一關的星數只增不減，存到雲端，回傳新的進度碼 */
function plFinish(run, stars, out) {
  var db = plDbGet(run.term, run.pl.w), st = plMax(run.pl.stars, db && db.stars), i = plLevels(run.term).indexOf(run.lv), was = st[i];
  if (stars > st[i]) st[i] = stars;
  var name = run.pl.name || (db && db.name) || '';
  if (stars > was || !db || st.join() !== db.stars.join() || db.name !== name) out.saved = plDbPut(run.term, run.pl.w, name, st);
  else out.saved = true;
  out.pc = plMake(run.term, run.pl.w, st); out.pstars = st;
}

SV_ACTIONS.pcv = function (req) {
  var term = String(req.t), w = plWho(req.who), stars = plRead(term, w, req.pc);
  return { ok: true, pc: plMake(term, w, stars), stars: stars, total: stars.reduce(function (a, b) { return a + b; }, 0), max: stars.length * 3 };
};
/* pls：學生登入時同步 —— 雲端紀錄＋（有填的話）進度碼合併，回傳最新的星數與進度碼 */
SV_ACTIONS.pls = function (req) {
  var term = String(req.t), w = plWho(req.who), name = String((req.who || {}).name || '').slice(0, 20), db = plDbGet(term, w), n = plLevels(term).length;
  var st = plMax(plRead(term, w, req.pc), db && db.stars), total = st.reduce(function (a, b) { return a + b; }, 0), saved = !!db;
  if (total > 0 && (!db || st.join() !== db.stars.join() || (name && db.name !== name))) saved = plDbPut(term, w, name || (db && db.name) || '', st);
  return { ok: true, stars: st, total: total, max: n * 3, pc: plMake(term, w, st), saved: saved, cloud: !!db };
};
/* plt：老師看進度表（要老師密碼；可以只看一個班） */
SV_ACTIONS.plt = function (req) {
  var P = PropertiesService.getScriptProperties(), key = P.getProperty('PYLAB_TEACHER_KEY');
  if (!key) svFail('no-key');
  var c = svCache(), bk = 'plt-bad:' + Math.floor(Date.now() / 3600000), bad = +(c.get(bk) || 0);
  if (bad >= 30) svFail('too-many');
  if (String(req.key || '').trim() !== key) { c.put(bk, String(bad + 1), 3700); svFail('bad-key'); }
  var term = String(req.t), cls = String(req.cls || '').trim(), sh = null;
  try { sh = plTab(false); } catch (e) { sh = null; }
  if (!sh) return { ok: true, rows: [] };
  var v = sh.getDataRange().getValues(), rows = [];
  for (var r = 1; r < v.length; r++) {
    if (String(v[r][0]) !== term || (cls && String(v[r][1]) !== cls)) continue;
    rows.push({ cls: String(v[r][1]), seat: String(v[r][2]), name: String(v[r][3]), stars: v[r].slice(4, 14).map(function (x) { return +x || 0; }), total: +v[r][14] || 0, ts: v[r][15] ? new Date(v[r][15]).getTime() : null });
  }
  rows.sort(function (a, b) { return a.cls < b.cls ? -1 : a.cls > b.cls ? 1 : (+a.seat) - (+b.seat); });
  return { ok: true, rows: rows };
};
/* 在 Apps Script 編輯器選這個函式按「執行」：產生（或查看）老師密碼，並建立學生進度試算表 */
function pylab老師密碼() {
  var P = PropertiesService.getScriptProperties(), k = P.getProperty('PYLAB_TEACHER_KEY');
  if (!k) { k = ''; for (var i = 0; i < 8; i++) k += PL_B32.charAt(Math.floor(Math.random() * 32)); P.setProperty('PYLAB_TEACHER_KEY', k); }
  Logger.log('🔑 pylab 老師密碼：' + k + '（給其他老師在 teacher.html 看學生進度用；想換就改指令碼屬性 PYLAB_TEACHER_KEY）');
  Logger.log('📊 學生進度試算表：' + plTab(true).getParent().getUrl());
}
