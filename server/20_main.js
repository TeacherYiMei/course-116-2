/* ── 入口：前端用 POST（text/plain 的 JSON）呼叫 ───────── */
/* 用瀏覽器打開網址（GET）＝健康檢查：檔案有沒有漏貼、順序對不對、答案檔有沒有更新 */
function doGet() { return svOut(svHealth()); }
function svHealth() {
  var want = ['start', 'ans', 'gen', 'gq', 'lab', 'lq', 'fin', 'py', 'pyg', 'sh', 'shc', 'shf', 'lks', 'lk', 'lkf', 'lkp', 'dq', 'hint', 'fb', 'pcv', 'pls', 'plt'];
  var miss = want.filter(function (a) { return !SV_ACTIONS[a]; });
  var ans = typeof SV_ANS !== 'undefined' ? SV_ANS : null;
  return { ok: !miss.length && !!ans && typeof SHEET !== 'undefined', service: 'course_116 驗證伺服器', v: SV.VERSION,
    labs: Object.keys(SV.labs).length, gens: Object.keys(CARDGAME.gens || {}).length, missing: miss,
    terms: ans ? Object.keys(ans.cards) : [], built: ans ? ans.built : null };
}
function doPost(e) {
  var req;
  try { req = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (x) { return svOut({ err: 'bad-json' }); }
  try { return svOut(svRoute(req)); }
  catch (x) {
    var m = String(x && x.message || x);
    return svOut({ err: m === 'busy' ? 'busy' : /^E:/.test(m) ? m.slice(2) : 'server', msg: /^E:/.test(m) ? undefined : m });
  }
}
function svOut(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function svFail(code) { throw new Error('E:' + code); }

var SV_ACTIONS = {};   // 各模組把自己的動作登記在這裡：SV_ACTIONS['名稱'] = function (req) { … }
function svRoute(req) {
  var f = SV_ACTIONS[req.a];
  if (!f) svFail('no-action');
  if (req.t && !(SV_ANS.cards && SV_ANS.cards[req.t])) svFail('no-term');
  return f(req);
}
SV_ACTIONS.ping = function () { return { pong: true, v: SV.VERSION }; };
