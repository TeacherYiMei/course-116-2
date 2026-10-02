/* =====================================================================
   卡片遊戲（sort／order／build／type）、🎲 出題器、🧪 實驗站：一次挑戰＝一個 run
   ---------------------------------------------------------------------
   start → （ans／gen+gq／lab+lq）… → fin
   · run 存在快取：哪一回合、哪幾題答對了、剩幾顆 ❤️；❤️ 用完這個 run 就作廢
   · 過關條件由伺服器照關卡內容檢查（每一回合答對的題數），前端送什麼都不能跳過
   · 修復站（practice）不扣心、不給星；課堂挑戰（free）不扣心、不給星
   ===================================================================== */
var SV_HEARTS = 3;

function svLevel(term, lv) { var T = SV_ANS.cards[term]; var L = T && T[lv]; if (!L) svFail('no-level'); return L; }
/* 回合參照 src＝"學期/關卡/階/回合"（沒有階寫 -） */
function svRoundBySrc(src) {
  var p = String(src).split('/'); if (p.length !== 4) svFail('bad-src');
  var L = svLevel(p[0], p[1]), list = p[2] === '-' ? L.rounds : (L.stages && L.stages[+p[2]] || {}).rounds, rd = list && list[+p[3]];
  if (!rd) svFail('bad-src');
  return rd;
}
var SV_GEN_OK = null;   // 課堂挑戰、總複習可以直接指定的出題器（有登記的才可以）
function svResolve(run, r) {
  var ref = run.rounds[r]; if (!ref) svFail('bad-round');
  if (ref.src) {
    var rd = svRoundBySrc(ref.src), o = {};
    for (var k in rd) o[k] = rd[k];
    if (ref.pick != null) o.pick = ref.pick;
    if (ref.n != null) o.n = ref.n;
    return o;
  }
  if (ref.gen) { if (!CARDGAME.gens[ref.gen]) svFail('no-gen'); return { type: 'gen', gen: ref.gen, n: ref.n, hard: !!ref.hard, tool: ref.tool, keys: ref.keys, seq: ref.seq, max: ref.max, min: ref.min }; }
  if (ref.lab) { if (!SV.labs[ref.lab]) svFail('no-lab'); return { type: 'lab', lab: ref.lab, n: ref.n || 1, hard: !!ref.hard }; }
  svFail('bad-round');
}
/* 每一回合要答對幾題 */
function svNeed(rd) {
  if (rd.type === 'sort') return rd.pick || rd.items.length;
  if (rd.type === 'order') return rd.items.length;
  if (rd.type === 'build') return rd.customers.length;
  if (rd.type === 'type') return rd.items.length;
  if (rd.type === 'gen') { if (rd.n) return rd.n; CARDGAME.rand = svSeeded(1); try { return CARDGAME.gens[rd.gen](rd).length; } finally { CARDGAME.rand = null; } }
  if (rd.type === 'lab') return rd.n || 1;
  return 1;
}

function svRun(id) { var r = svGet('run:' + id); if (!r) svFail('run-expired'); return r; }
function svSave(run) { svPut('run:' + run.id, run); }
function svHit(run, ok) {
  if (ok || run.practice || run.free) return;
  run.hearts--; if (run.hearts <= 0) run.dead = true;
}
function svAlive(run) { if (run.dead) svFail('dead'); if (run.done) svFail('done'); }

SV_ACTIONS.start = function (req) {
  var term = String(req.t || ''), run = { id: svId(16), term: term, mod: String(req.mod || ''), lv: String(req.lv || ''), st: req.st == null ? null : +req.st,
    practice: !!req.practice, free: !!req.free, hearts: SV_HEARTS, got: {}, ord: {}, gq: {}, labs: {}, t0: Date.now(), who: req.who || null, rounds: [] };
  if (run.free) {                       // 🏁 課堂挑戰：只能用出題器，題目在 gen 時指定
    run.rounds = [];
  } else if (req.comp) {                // 🎓 總複習：前端抽好的組合（每一項都要是真的關卡回合或登記過的出題器、實驗站）
    if (!Array.isArray(req.comp) || !req.comp.length || req.comp.length > 12) svFail('bad-comp');
    run.rounds = req.comp.map(function (c) {
      if (c.src) { var rd = svRoundBySrc(c.src); if (rd.type !== 'sort') svFail('bad-comp'); return { src: c.src, pick: Math.max(2, Math.min(+c.pick || 3, rd.items.length)) }; }
      if (c.gen) { if (!CARDGAME.gens[c.gen]) svFail('bad-comp'); return { gen: c.gen, n: 1, hard: !!c.hard, tool: c.tool || null }; }
      if (c.lab) { if (!SV.labs[c.lab]) svFail('bad-comp'); return { lab: c.lab, n: 1, hard: !!c.hard }; }
      svFail('bad-comp');
    });
  } else {
    var L = svLevel(term, run.lv), st = run.st, list = st == null ? L.rounds : (L.stages && L.stages[st] || {}).rounds;
    if (!list) svFail('bad-stage');
    run.rounds = list.map(function (rd, ri) { return { src: term + '/' + run.lv + '/' + (st == null ? '-' : st) + '/' + ri }; });
    if (run.practice) {                 // 🩹 修復站：只練卡住的那一回合，題數少一點
      var fr = +req.focus || 0, base = list[fr]; if (!base) svFail('bad-round');
      var ref = run.rounds[fr];
      if (base.type === 'gen') ref.n = 2; else if (base.type === 'lab') ref.n = 1; else if (base.type === 'sort') ref.pick = Math.min(2, base.items.length);
      run.rounds = [ref];
    }
  }
  var sizes = run.rounds.map(function (ref, r) { return svNeed(svResolve(run, r)); });
  svSave(run);
  return { run: run.id, hearts: run.hearts, sizes: sizes };
};

/* ── 固定題庫：sort／order／build／type ── */
SV_ACTIONS.ans = function (req) {
  return svWithLock(function () {
    var run = svRun(req.run); svAlive(run);
    var r = +req.r, rd = svResolve(run, r), i = +req.i, v = req.v, res;
    var got = run.got[r] = run.got[r] || {};
    if (rd.type === 'sort') {
      var it = rd.items[i]; if (!it) svFail('bad-item');
      res = it.a === String(v) ? { ok: true, why: it.why } : { ok: false };
    } else if (rd.type === 'order') {
      var pos = run.ord[r] || 0; if (i !== pos) svFail('bad-item');
      if (rd.items[pos].t === String(v)) { run.ord[r] = pos + 1; res = { ok: true, pos: pos + 1, why: pos + 1 === rd.items.length ? rd.why : undefined }; }
      else res = { ok: false };
    } else if (rd.type === 'build') {
      var cu = rd.customers[i]; if (!cu) svFail('bad-item');
      res = svBuildCheck(rd, cu, String(v));
    } else if (rd.type === 'type') {
      var ti = rd.items[i]; if (!ti) svFail('bad-item');
      var nv = svNorm(v);
      res = ti.a.some(function (a) { return svNorm(a) === nv; }) ? { ok: true, why: ti.why } : { ok: false };
    } else svFail('bad-round');
    if (res.ok && (rd.type !== 'order' || res.pos === rd.items.length)) got[rd.type === 'order' ? 0 : i] = 1;
    svHit(run, res.ok); svSave(run);
    res.hearts = run.hearts; if (run.dead) res.dead = true;
    return res;
  });
};
/* 組裝題：每一條規則照關卡內容算（價錢加總、屬性、指定選項） */
function svBuildCheck(rd, cu, key) {
  var ids = key.split('|'); if (ids.length !== rd.slots.length) svFail('bad-answer');
  var chosen = {}, props = { price: rd.base ? rd.base.price : 0 };
  for (var s = 0; s < rd.slots.length; s++) {
    var o = rd.slots[s].options.filter(function (x) { return x.id === ids[s]; })[0]; if (!o) svFail('bad-answer');
    chosen[rd.slots[s].id] = o;
    if (o.price) props.price += o.price;
    for (var k in o) if (['id', 'label', 'price'].indexOf(k) < 0) props[k] = o[k];
  }
  var fails = cu.rules.filter(function (r) {
    return r.sum ? props[r.sum] > r.max : r.pick ? chosen[r.pick].id !== r.is : ((r.min != null && !(props[r.prop] >= r.min)) || (r.eq != null && props[r.prop] !== r.eq));
  });
  return fails.length ? { ok: false, msgs: fails.map(function (f) { return f.msg; }) } : { ok: true, good: cu.good };
}

/* ── 🎲 出題器：伺服器出題，前端只拿到題目；種子存在 run 裡，驗證時重新產生再比對 ── */
var SV_PUB = ['t', 'sub', 'icon', 'ph', 'kind', 'mono', 'html', 'tool', 'data', 'toolShift', 'need', 'n', 'showSum', 'options', 'parts', 'prompt'];
function svGenItems(rd, seed) {
  CARDGAME.rand = svSeeded(seed);
  try { return CARDGAME.gens[rd.gen](rd); } finally { CARDGAME.rand = null; }
}
function svPubItem(it, practice) {
  var o = {};
  SV_PUB.forEach(function (k) { if (it[k] !== undefined && typeof it[k] !== 'function') o[k] = it[k]; });
  if (it.items) o.items = it.items.map(function (x) { return { t: x.t, icon: x.icon }; });   // 依序點的題目：只給文字，id 換成「畫面上的第幾個」
  if (practice && it.hint) o.hint = typeof it.hint === 'function' ? it.hint('') : it.hint;
  return o;
}
SV_ACTIONS.gen = function (req) {
  return svWithLock(function () {
    var run = svRun(req.run); svAlive(run);
    var rd, r;
    if (run.free) {                     // 課堂挑戰：前端指定出題器（只能用有登記的）
      if (!CARDGAME.gens[req.gen]) svFail('no-gen');
      rd = { type: 'gen', gen: req.gen, n: 1, hard: !!req.hard, tool: req.tool || null }; r = -1;
    } else { r = +req.r; rd = svResolve(run, r); if (rd.type !== 'gen') svFail('bad-round'); }
    var seed = (Math.random() * 4294967296) >>> 0, items = svGenItems(rd, seed), idx = items.map(function (_, k) { return k; });
    if (Array.isArray(req.kinds)) idx = idx.filter(function (k) { return req.kinds.indexOf(items[k].kind || 'input') >= 0; });   // 課堂挑戰只要能投影作答的題型
    if (!idx.length) svFail('no-item');
    var take = req.one ? [idx[svRnd(idx.length)]] : idx;
    var out = take.map(function (k) {
      var q = svId(10);
      run.gq[q] = { r: r, seed: seed, idx: k, tries: 0, ok: false, fol: false, rd: run.free ? rd : null };
      var pub = svPubItem(items[k], run.practice || run.free); pub.q = q; return pub;
    });
    svSave(run);
    return { qs: out, hearts: run.hearts };
  });
};
SV_ACTIONS.gq = function (req) {
  return svWithLock(function () {
    var run = svRun(req.run); svAlive(run);
    var g = run.gq[req.q]; if (!g) svFail('bad-q');
    if (g.ok) svFail('answered');
    if (run.free && g.tries >= 8) svFail('too-many');
    var rd = g.rd || svResolve(run, g.r), it = svGenItems(rd, g.seed)[g.idx], v = req.v, res;
    if (it.kind === 'order' && Array.isArray(v)) v = v.map(function (k) { var x = it.items[+k]; if (!x) svFail('bad-answer'); return x.id != null ? x.id : x.t; });
    if (it.kind === 'input' || !it.kind) v = svNorm(v);
    if (req.f != null) {                // 追問的理由
      if (!g.fol) svFail('bad-q');
      var ok2 = !!it.follow.check(String(req.f));
      if (ok2) { g.ok = true; res = { ok: true, why: typeof it.why === 'function' ? it.why(g.v) : it.why }; }
      else { g.fol = false; res = { ok: false, swap: true }; }
      svHit(run, ok2);
    } else {
      if (g.fol) svFail('need-follow');
      var ok = !!it.check(v);
      if (ok && it.follow && !run.practice && !run.free) { g.fol = true; g.v = v; res = { ok: true, follow: { q: it.follow.q, options: it.follow.options } }; }
      else if (ok) { g.ok = true; res = { ok: true, why: typeof it.why === 'function' ? it.why(v) : it.why }; }
      else {
        g.tries++;
        var h = g.tries >= 2 && it.hint2 ? it.hint2 : it.hint;
        res = { ok: false, hint: typeof h === 'function' ? h(v) : h, deep: g.tries >= 2 && !!it.hint2 };
      }
      svHit(run, ok);
    }
    svSave(run);
    res.hearts = run.hearts; if (run.dead) res.dead = true;
    return res;
  });
};

/* ── 🧪 實驗站：伺服器產生情境（隱藏的資訊留在這裡），前端只拿到畫面要用的資料 ── */
SV_ACTIONS.lab = function (req) {
  return svWithLock(function () {
    var run = svRun(req.run); svAlive(run);
    var r = +req.r, rd = svResolve(run, r); if (rd.type !== 'lab') svFail('bad-round');
    var L = SV.labs[rd.lab]; if (!L) svFail('no-lab');
    var m = L.make(!!rd.hard, run.practice), l = svId(10);
    run.labs[l] = { r: r, name: rd.lab, hard: !!rd.hard, sec: m.sec, tries: 0, ok: false };
    svSave(run);
    return { l: l, pub: m.pub, hearts: run.hearts };
  });
};
SV_ACTIONS.lq = function (req) {
  return svWithLock(function () {
    var run = svRun(req.run); svAlive(run);
    var x = run.labs[req.l]; if (!x) svFail('bad-lab');
    if (x.ok) svFail('answered');
    var L = SV.labs[x.name], res = L.check(x.sec, req.v || {}, { hard: x.hard, practice: run.practice, tries: x.tries }) || { ok: false };
    if (res.sec) { x.sec = res.sec; delete res.sec; }
    if (res.act) { svSave(run); res.hearts = run.hearts; return res; }        // 動手操作（例如教機器、測試）：不算對錯
    if (res.ok && !res.partial) x.ok = true;
    if (!res.ok) { x.tries++; if (x.tries >= 2 && res.hint2) res.hint = res.hint2, res.deep = true; delete res.hint2; }
    else delete res.hint2;
    svHit(run, res.ok);
    svSave(run);
    res.hearts = run.hearts; if (run.dead) res.dead = true;
    return res;
  });
};

/* ── 結算：每一回合都做完才給星 ── */
SV_ACTIONS.fin = function (req) {
  return svWithLock(function () {
    var run = svRun(req.run); svAlive(run);
    for (var r = 0; r < run.rounds.length; r++) {
      var rd = svResolve(run, r), need = svNeed(rd), have = 0;
      if (rd.type === 'gen') { for (var q in run.gq) if (run.gq[q].r === r && run.gq[q].ok) have++; }
      else if (rd.type === 'lab') { for (var l in run.labs) if (run.labs[l].r === r && run.labs[l].ok) have++; }
      else if (rd.type === 'order') have = run.ord[r] === rd.items.length ? need : 0;
      else have = Object.keys(run.got[r] || {}).length;
      if (have < need) svFail('incomplete');
    }
    run.done = true; svSave(run);
    if (run.practice || run.free) return { ok: true, practice: true };
    var stars = run.st != null ? run.st + 1 : run.hearts, rc = svReceipt(run, stars);
    svLog(run, stars);
    return { ok: true, stars: stars, hearts: run.hearts, rc: rc.rc, ts: rc.ts };
  });
};
