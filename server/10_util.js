/* ── 小工具：亂數、快取、鎖、簽章、回應 ─────────────── */
function svRnd(n) { return Math.floor(Math.random() * n); }
function svPick(a) { return a[svRnd(a.length)]; }
function svBetween(lo, hi) { return lo + svRnd(hi - lo + 1); }
function svShuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = svRnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function svPicks(a, n) { return svShuffle(a).slice(0, n); }
/* 可重現的亂數（出題器用）：同一個種子 → 同一組題目，驗證時重新產生一次再比對 */
function svSeeded(seed) {
  var s = seed >>> 0;
  return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function svId(n) { var c = 'abcdefghijkmnpqrstuvwxyz23456789', s = ''; for (var i = 0; i < (n || 12); i++) s += c[svRnd(c.length)]; return s; }
function svNorm(s) { return String(s == null ? '' : s).replace(/[！-～]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); }).replace(/\s+/g, '').toUpperCase(); }
function svClone(o) { return JSON.parse(JSON.stringify(o)); }

/* 快取：run（一次挑戰）的狀態放在 Apps Script 的 CacheService（最多 6 小時） */
var SV_TTL = 6 * 3600;
function svCache() { return CacheService.getScriptCache(); }
function svGet(key) { var v = svCache().get(key); return v ? JSON.parse(v) : null; }
function svPut(key, obj) { svCache().put(key, JSON.stringify(obj), SV_TTL); }
/* 同一個 run 的讀-改-寫要排隊：不讓同時送出好幾個答案繞過 ❤️ 限制 */
function svWithLock(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(8000)) throw new Error('busy');
  try { return fn(); } finally { lock.releaseLock(); }
}

/* 簽章收據：過關時發給前端，教師端之後可以驗證這顆星是伺服器給的 */
function svSecret() {
  var P = PropertiesService.getScriptProperties(), s = P.getProperty('SECRET');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); P.setProperty('SECRET', s); }
  return s;
}
function svSign(text) { return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(text, svSecret())).replace(/=+$/, ''); }
function svReceipt(run, stars) {
  var w = run.who || {}, ts = Date.now();
  var body = [run.term, w.cls || '', w.seat || '', w.name || '', run.mod, run.lv, stars, ts].join('|');
  return { ts: ts, rc: svSign(body) };
}
/* 過關紀錄（選用）：指令碼屬性 LOG_SHEET_ID 填一份 Google 試算表的 ID，就會一列一列記下來 */
function svLog(run, stars, extra) {
  var id = PropertiesService.getScriptProperties().getProperty('LOG_SHEET_ID');
  if (!id) return;
  try {
    var ss = SpreadsheetApp.openById(id), sh = ss.getSheetByName('紀錄') || ss.insertSheet('紀錄'), w = run.who || {};
    if (sh.getLastRow() === 0) sh.appendRow(['時間', '學期', '班級', '座號', '姓名', '單元', '關卡', '階', '星', '剩餘❤️', '秒數', '備註']);
    sh.appendRow([new Date(), run.term, w.cls || '', w.seat || '', w.name || '', run.mod, run.lv, run.st == null ? '' : run.st + 1, stars, run.hearts, Math.round((Date.now() - run.t0) / 1000), extra || '']);
  } catch (e) { /* 紀錄失敗不影響作答 */ }
}
