/* =====================================================================
   其他：5016B 專題（計星）、單元一快速檢核、漸進提示
   ===================================================================== */
/* ── 5016B 專題：一節一局，看「預測錯幾次」給星 ──────────────
   lks { t, sid, who }      → 開這一節的局（run），回傳有幾題檢核
   lk  { run, i, v }        → 這一題的預測對不對（對了才給解說）；錯一次記一次
   lkf { run }              → 每一題都說對了才結算：一次都沒錯 3⭐、錯 1 次 2⭐、錯 2 次以上 1⭐（附收據）
   lkp { t, sid, who, v }   → 專題節（沒有檢核，例如 S5）：成果卡的欄位填完整就 3⭐（附收據）
   ⚠️ 星星由這裡算，前端送什麼都改不了「錯幾次」 */
var SV_LK_PROJECT = { S5: true };
function lkStars(wrong) { return wrong === 0 ? 3 : wrong === 1 ? 2 : 1; }
SV_ACTIONS.lks = function (req) {
  var term = String(req.t), sid = String(req.sid), list = (SV_ANS.labkit[term] || {})[sid];
  if (!list || !list.length) svFail('bad-item');
  var run = { id: svId(16), kind: 'lk', term: term, mod: 'arduino', lv: sid, st: null, hearts: 0, wrong: 0, got: {}, t0: Date.now(), who: req.who || null };
  svSave(run);
  return { run: run.id, n: list.length };
};
SV_ACTIONS.lk = function (req) {
  return svWithLock(function () {
    var run = svRun(req.run); if (run.kind !== 'lk') svFail('bad-run'); if (run.done) svFail('done');
    var list = SV_ANS.labkit[run.term][run.lv], q = list[+req.i];
    if (!q) svFail('bad-item');
    var ok = String(q.answer) === String(req.v);
    if (ok) run.got[+req.i] = 1; else run.wrong++;
    svSave(run);
    return ok ? { ok: true, why: q.why, wrong: run.wrong } : { ok: false, wrong: run.wrong };
  });
};
SV_ACTIONS.lkf = function (req) {
  return svWithLock(function () {
    var run = svRun(req.run); if (run.kind !== 'lk') svFail('bad-run'); if (run.done) svFail('done');
    var n = SV_ANS.labkit[run.term][run.lv].length;
    if (Object.keys(run.got).length < n) svFail('incomplete');
    run.done = true; svSave(run);
    var stars = lkStars(run.wrong), rc = svReceipt(run, stars);
    svLog(run, stars, '預測錯 ' + run.wrong + ' 次');
    return { ok: true, stars: stars, wrong: run.wrong, rc: rc.rc, ts: rc.ts };
  });
};
SV_ACTIONS.lkp = function (req) {
  var term = String(req.t), sid = String(req.sid), v = req.v || {};
  if (!SV_LK_PROJECT[sid]) svFail('bad-item');
  function str(k) { return String(v[k] == null ? '' : v[k]).trim(); }
  var miss = [];
  if (!str('p-name')) miss.push('作品名稱');
  ['p-s1', 'p-s2', 'p-s3'].forEach(function (k, i) { if (str(k).length < 6) miss.push('第' + '一二三'[i] + '句（至少 6 個字）'); });
  var max = str('p-in') === '超音波' ? 400 : 1023, num = str('p-num');
  if (num === '' || isNaN(+num) || +num < 0 || +num > max) miss.push('規則的數字');
  if (miss.length) return { ok: false, miss: miss };
  var run = { id: svId(16), kind: 'lkp', term: term, mod: 'arduino', lv: sid, st: null, hearts: 3, t0: Date.now(), who: req.who || null };
  var rc = svReceipt(run, 3);
  svLog(run, 3, '專題成果卡');
  return { ok: true, stars: 3, rc: rc.rc, ts: rc.ts };
};
/* 單元一：{ u, q, v } → v 是學生按的按鈕上的字 */
SV_ACTIONS.dq = function (req) {
  var list = SV_ANS.digital[String(req.u)] || [], v = String(req.v || '').replace(/\s+/g, '');
  var b = list.filter(function (x) { return String(x.q) === String(req.q) && x.label.replace(/\s+/g, '') === v; })[0];
  if (!b) svFail('bad-item');
  return b.ok ? { ok: true } : { ok: false, hint: b.hint };
};
/* 漸進提示：按一次給一則（Python、試算表） */
SV_ACTIONS.hint = function (req) {
  var src = req.kind === 'sheet' ? SV_ANS.sheet : SV_ANS.py, T = src[String(req.t)] || {}, L = T[String(req.lv)];
  if (!L || !L.hints) svFail('no-hint');
  var i = +req.i; if (!(i >= 0 && i < L.hints.length)) svFail('no-hint');
  return { hint: L.hints[i], n: L.hints.length };
};

/* ── 📮 老師回報（pylab 教師試用版）：寫進老師的 Google 試算表 ──────────────
   fb { t, lv, kind, msg, who, from, code, result, ua }
   · 試算表：指令碼屬性 FEEDBACK_SHEET_ID；沒有就第一次自動建立一份「course_116 Python 老師回報」
     （在部署者的雲端硬碟，只有部署者看得到），ID 記回指令碼屬性
   · 防灌爆：每一欄都有長度上限；整個伺服器每小時最多 60 則（CacheService 計數） */
var SV_FB_KINDS = { strict: '測資太嚴', loose: '測資太鬆', task: '題目／範例', hint: '提示', error: '錯誤說明', other: '其他' };
function svFbSheet() {
  var P = PropertiesService.getScriptProperties(), id = P.getProperty('FEEDBACK_SHEET_ID'), ss = null;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
  if (!ss) { ss = SpreadsheetApp.create('course_116 Python 老師回報'); P.setProperty('FEEDBACK_SHEET_ID', ss.getId()); }
  var sh = ss.getSheetByName('老師回報') || ss.insertSheet('老師回報');
  if (sh.getLastRow() === 0) sh.appendRow(['時間', '狀態', '任務', '類別', '說明', '稱呼', '學校／聯絡', '星數', '通過', '沒過的測資', '沒達成的結構要求', '程式碼', '瀏覽器']);
  return sh;
}
SV_ACTIONS.fb = function (req) {
  function cut(v, n) { return String(v == null ? '' : v).replace(/^[=+\-@]/, "'$&").slice(0, n); }   // 開頭是 = + - @ 的字串加 '，試算表不會當成公式
  var lv = String(req.lv || ''), L = (SV_ANS.py[String(req.t)] || {})[lv];
  if (!L) svFail('bad-item');
  var msg = String(req.msg || '').trim();
  if (msg.length < 4) svFail('bad-answer');
  var c = svCache(), key = 'fb:' + Math.floor(Date.now() / 3600000), n = +(c.get(key) || 0);
  if (n >= 60) svFail('too-many');
  c.put(key, String(n + 1), 3700);
  var r = req.result && typeof req.result === 'object' ? req.result : null;
  svWithLock(function () {
    svFbSheet().appendRow([new Date(), '待處理', lv + ' ' + L.title, SV_FB_KINDS[req.kind] || '其他', cut(msg, 1000), cut(req.who, 40), cut(req.from, 80),
      r ? cut(r.stars, 2) : '', r ? cut(r.passed + '/' + r.total, 12) : '', r ? cut((r.fails || []).join('\n'), 1500) : '', r ? cut((r.reqs || []).join('\n'), 500) : '',
      cut(req.code, 5000), cut(req.ua, 160)]);
  });
  return { ok: true };
};
/* 在 Apps Script 編輯器裡選這個函式按「執行」：建立（或找到）回報試算表，記錄檔會印出網址 */
function 建立回報試算表() { var sh = svFbSheet(); Logger.log('📮 老師回報試算表：' + sh.getParent().getUrl()); }
