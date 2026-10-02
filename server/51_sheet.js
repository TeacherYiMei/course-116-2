/* =====================================================================
   📊 試算表評分：學生的公式送上來，由這裡的試算表引擎（shared/sheet.js）重算、比對標準答案
   ---------------------------------------------------------------------
   sh  { t, lv }             → run（3 顆 ❤️）
   shc { run, marks }        → 清理步驟：每一列的判斷（全對才回傳清理後的資料）
   shf { run, cells }        → 每一個目標格：對不對、錯在哪（{code…} 給前端的 SHEET.explain 翻成白話）
   ===================================================================== */
function shLevel(term, lv) { var T = SV_ANS.sheet[term]; var L = T && T[lv]; if (!L) svFail('no-level'); return L; }
SV_ACTIONS.sh = function (req) {
  var term = String(req.t), L = shLevel(term, String(req.lv)), run = { id: svId(16), kind: 'sheet', term: term, mod: String(req.mod || 'sheet'), lv: L.id, st: null, hearts: SV_HEARTS, stage: L.clean ? 'clean' : 'calc', t0: Date.now(), who: req.who || null };
  svPut('run:' + run.id, run);
  return { run: run.id, hearts: run.hearts };
};
SV_ACTIONS.shc = function (req) {
  return svWithLock(function () {
    var run = svRun(req.run); if (run.kind !== 'sheet' || run.stage !== 'clean') svFail('bad-run'); svAlive(run);
    var L = shLevel(run.term, run.lv), marks = req.marks || {}, wrong = 0;
    for (var r = 2; r <= L.data.length; r++) if ((marks[r] || 'ok') !== (L.clean.issues[r] || 'ok')) wrong++;
    var res;
    if (wrong) { svHit(run, false); res = { ok: false, wrong: wrong }; }
    else { run.stage = 'calc'; res = { ok: true, fixed: L.clean.fixed, note: L.clean.note }; }
    svSave(run);
    res.hearts = run.hearts; if (run.dead) res.dead = true;
    return res;
  });
};
function shGrade(t, grid) {
  var f = String(grid.get(t.cell) || '').trim(), F = String(f).replace(/[！-～]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); }).toUpperCase();
  if (!f) return { ok: false, e: { code: 'empty' } };
  if (F[0] !== '=') return { ok: false, e: { code: 'noeq' } };
  var v;
  try { v = SHEET.evaluate(f, grid); } catch (x) { return { ok: false, e: { code: x.code || '#ERROR!', msg: x.msg } }; }
  if (!/[A-Z]+\d+/.test(F.slice(1))) return { ok: false, e: { code: 'number' } };
  var miss = (t.must || []).filter(function (fn) { return F.indexOf(fn + '(') < 0; });
  if (miss.length) return { ok: false, e: { code: 'must', fn: miss[0] } };
  var tol = t.tol == null ? 0.01 : t.tol, okv = typeof v === 'number' && [t.want].concat(t.alt || []).some(function (w) { return typeof w === 'number' ? Math.abs(v - w) <= tol + 1e-9 : String(v) === String(w); });
  if (!okv) return { ok: false, e: { code: 'value', v: SHEET.fmt(v) }, tip: t.tip || null };
  return { ok: true };
}
SV_ACTIONS.shf = function (req) {
  return svWithLock(function () {
    var run = svRun(req.run); if (run.kind !== 'sheet' || run.stage !== 'calc') svFail('bad-run'); svAlive(run);
    var L = shLevel(run.term, run.lv), cells = req.cells || {}, grid = SHEET.makeGrid(L.clean ? L.clean.fixed : L.data, L.labels);
    L.targets.forEach(function (t) { if (cells[t.cell] != null) grid.set(t.cell, String(cells[t.cell]).slice(0, 300)); });
    var res = {}, bad = 0;
    L.targets.forEach(function (t) { res[t.cell] = shGrade(t, grid); if (!res[t.cell].ok) bad++; });
    var out = { res: res };
    if (bad) svHit(run, false);
    else { run.done = true; var stars = run.hearts, rc = svReceipt(run, stars); out.stars = stars; out.rc = rc.rc; out.ts = rc.ts; out.after = L.after || null; svLog(run, stars); }   // after：過關後的延伸說明（也只在伺服器）
    svSave(run);
    out.hearts = run.hearts; if (run.dead) out.dead = true;
    return out;
  });
};
