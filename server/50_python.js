/* =====================================================================
   🐍 Python 評分：程式在學生的瀏覽器裡跑（Pyodide），輸出送回來由這裡比對
   ---------------------------------------------------------------------
   py  { t, lv }                  → 這一次評分要跑的測資（含隱藏測資的輸入）
   pyg { run, outs, feats, code } → 每一組過了沒、結構要求、星星（預期輸出只在伺服器）
   檢查規則和 shared/pyrunner.js 以前的明碼版一樣（line／has／not／word／order／count／num／nums）
   ===================================================================== */
function pyHalf(s) { return String(s).replace(/[！-～]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); }).replace(/　/g, ' '); }
function pyNorm(s) { return pyHalf(s).replace(/\s+/g, '').toLowerCase(); }
function pyNums(s) { var m = pyHalf(s).match(/-?\d+(?:\.\d+)?/g); return m ? m.map(Number) : []; }
function pyText(events, kinds) { return (events || []).filter(function (ev) { return ev && kinds.indexOf(ev[0]) >= 0; }).map(function (ev) { return String(ev[1]); }).join('\n'); }
function pyCheck(c, events) {
  var all = pyText(events, ['out', 'prompt']), outs = pyText(events, ['out']), A = pyNorm(all);
  if (c.line != null) { var want = pyNorm(c.line); return pyHalf(all).split('\n').some(function (l) { return pyNorm(l) === want; }); }
  if (c.has != null) return A.indexOf(pyNorm(c.has)) >= 0;
  if (c.not != null) return A.indexOf(pyNorm(c.not)) < 0;
  if (c.word != null) { var e = c.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); return new RegExp('(^|[^A-Za-z])' + e + '([^A-Za-z]|$)').test(pyHalf(outs)); }
  if (c.order) {
    var pos = 0;
    for (var i = 0; i < c.order.length; i++) { var at = A.indexOf(pyNorm(c.order[i]), pos); if (at < 0) return false; pos = at + pyNorm(c.order[i]).length; }
    return true;
  }
  if (c.count != null) {
    var k = pyNorm(c.count), n = 0, p = A.indexOf(k);
    while (p >= 0) { n++; p = A.indexOf(k, p + k.length); }
    return (c.min == null || n >= c.min) && (c.max == null || n <= c.max) && (c.eq == null || n === c.eq);
  }
  if (c.num != null) { var tol = c.tol == null ? 0.01 : c.tol; return pyNums(outs).some(function (x) { return Math.abs(x - c.num) <= tol + 1e-9; }); }
  if (c.nums) {
    var got = pyNums(outs);
    if (c.tail) { var t = got.slice(-c.nums.length); return t.length === c.nums.length && t.every(function (x, j) { return x === c.nums[j]; }); }
    var j = 0; for (var q = 0; q < got.length && j < c.nums.length; q++) if (got[q] === c.nums[j]) j++;
    return j === c.nums.length;
  }
  return false;
}
function pyReq(expr, f) {
  var m = /^([\w.]+)\s*(>=|<=|==|>|<)\s*(\d+)$/.exec(expr);
  if (!m || !f) return false;
  var v = m[1].split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, f) || 0, n = +m[3];
  return { '>=': v >= n, '<=': v <= n, '==': v === n, '>': v > n, '<': v < n }[m[2]];
}
function pyLevel(term, lv) { var T = SV_ANS.py[term]; var L = T && T[lv]; if (!L) svFail('no-level'); return L; }

SV_ACTIONS.py = function (req) {
  var term = String(req.t), L = pyLevel(term, String(req.lv)), run = { id: svId(16), kind: 'py', term: term, mod: String(req.mod || 'python'), lv: String(req.lv), st: null, t0: Date.now(), who: req.who || null, hearts: 0 };
  if (run.mod === 'pylab') run.pl = plStart(req, term, run.lv);   // 🐍 pylab 學生版：伺服器端鎖關（53_pylab.js）
  svPut('run:' + run.id, run);
  return { run: run.id, tests: L.tests.map(function (t) { return { name: t.name, hidden: !!t.hidden, inputs: t.inputs || [] }; }) };
};
SV_ACTIONS.pyg = function (req) {
  var run = svRun(req.run); if (run.kind !== 'py') svFail('bad-run');
  var L = pyLevel(run.term, run.lv), outs = req.outs || [];
  if (!Array.isArray(outs) || outs.length !== L.tests.length) svFail('bad-answer');
  var results = L.tests.map(function (t, i) {
    var o = outs[i] || {}, ev = Array.isArray(o.events) ? o.events.slice(0, 5000) : [];
    if (o.err) return { pass: false, err: true };
    var fails = (t.checks || []).filter(function (c) { return !pyCheck(c, ev); });
    if (!fails.length) return { pass: true };
    return { pass: false, msg: t.hidden ? (t.why || '再想想特殊情況') : (fails[0].msg || '輸出和預期不一樣') };
  });
  var reqs = (L.req || []).map(function (q) { return { msg: q.msg, ok: !!pyReq(q.need, req.feats) }; });
  var passed = results.filter(function (r) { return r.pass; }).length, all = passed === results.length && results.length > 0, reqOk = reqs.every(function (r) { return r.ok; });
  var stars = all ? (reqOk ? 3 : 2) : (passed > 0 ? 1 : 0);
  var score = Math.round((results.length ? passed / results.length : 0) * 80 + (reqs.length ? reqs.filter(function (r) { return r.ok; }).length / reqs.length : 1) * 20);
  if (!all) score = Math.min(score, 74);
  var out = { results: results, reqs: reqs, passed: passed, total: results.length, stars: stars, score: score };
  if (run.pl) plFinish(run, stars, out);
  if (stars > 0) { run.hearts = stars; var rc = svReceipt(run, stars); out.rc = rc.rc; out.ts = rc.ts; svLog(run, stars, passed + '/' + results.length); }
  return out;
};
