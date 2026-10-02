#!/usr/bin/env node
/* =====================================================================
   建置：把 private/ 的明碼內容拆成兩份
   ---------------------------------------------------------------------
   用法（在 repo 根目錄）：  node tools/build.mjs
   ★ 改題目、改答案、改測資 → 改 private/ 裡的檔案 → 跑這支 → 提交公開檔 → 更新 Apps Script（見 server/README.md）
   ★ private/ 不進 git（.gitignore），只在老師的電腦上 —— 請另外備份

   產出
     ① 公開網站用（進 git）：{學期}/content/*.js ── 只有題目，沒有答案、解說、提示、預期輸出、隱藏測資
     ② 驗證伺服器用（不進 git）：private/server/ ── 整包貼到 Google Apps Script
          server/*.js（伺服器程式，公開）＋ 70_sheet_engine.js（試算表引擎）＋ 90_answers.js（SV_ANS：全部答案）
     ③ 11601/digital/1～4.html：拿掉快速檢核按鈕上的舊封存資料（改問伺服器）
   ===================================================================== */
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = (...a) => path.join(ROOT, ...a);
if (!fs.existsSync(P('private'))) { console.error('找不到 private/ —— 這台電腦沒有明碼答案來源，無法建置。'); process.exit(1); }

/* ── 在沙箱裡載入 private 的內容檔 ── */
function load(files) {
  const ctx = { window: {}, console };
  ctx.window.window = ctx.window;
  vm.createContext(ctx);
  for (const f of files) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
  return ctx.window;
}
const SHEET = load([P('shared/sheet.js')]).SHEET;
const clone = o => JSON.parse(JSON.stringify(o));
const pickKeys = (o, keys) => Object.fromEntries(keys.filter(k => o[k] !== undefined).map(k => [k, o[k]]));
function seededShuffle(arr, seed) {        // 依序點的題目：公開版打亂順序（固定亂法，不要剛好是正解順序）
  const a = arr.slice(); let x = parseInt(crypto.createHash('sha256').update(seed).digest('hex').slice(0, 8), 16);
  for (let i = a.length - 1; i > 0; i--) { x = (x * 1103515245 + 12345) >>> 0; const j = x % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  if (a.every((v, i) => v === arr[i]) && a.length > 1) a.push(a.shift());
  return a;
}

const ANS = { built: new Date().toISOString().slice(0, 16).replace('T', ' '), cards: {}, py: {}, sheet: {}, labkit: {}, digital: {} };
let stat = { levels: 0, rounds: 0 };

/* ── 互動遊戲（sort／order／build／type／gen／lab） ── */
function pubRounds(term, lvId, st, list) {
  return list.map((rd, ri) => {
    stat.rounds++;
    const src = term + '/' + lvId + '/' + (st == null ? '-' : st) + '/' + ri;
    if (rd.type === 'sort') {
      rd.items.forEach(it => { if (!rd.buckets.some(b => b.id === it.a)) throw new Error(lvId + ' 答案不在選項裡：' + it.t); });
      return { type: 'sort', src, prompt: rd.prompt, pick: rd.pick, ordered: rd.ordered, buckets: rd.buckets, items: rd.items.map(it => pickKeys(it, ['t', 'icon', 'scene'])) };
    }
    if (rd.type === 'order') return { type: 'order', src, prompt: rd.prompt, hint: rd.hint, items: seededShuffle(rd.items, src).map(x => pickKeys(x, ['t', 'icon'])) };
    if (rd.type === 'build') {
      const combos = rd.slots.reduce((acc, sl) => acc.flatMap(c => sl.options.map(o => [...c, [sl.id, o]])), [[]]);
      rd.customers.forEach(cu => {   // 每位客人至少要有一種組合能過關
        const okOne = combos.some(combo => {
          const chosen = Object.fromEntries(combo), props = { price: rd.base ? rd.base.price : 0 };
          for (const [, o] of combo) { if (o.price) props.price += o.price; for (const k in o) if (!['id', 'label', 'price'].includes(k)) props[k] = o[k]; }
          return !cu.rules.some(r => r.sum ? props[r.sum] > r.max : r.pick ? chosen[r.pick].id !== r.is : ((r.min != null && !(props[r.prop] >= r.min)) || (r.eq != null && props[r.prop] !== r.eq)));
        });
        if (!okOne) throw new Error(lvId + ' 客人「' + cu.who + '」沒有任何組合能過關');
      });
      return { type: 'build', src, title: rd.title, base: rd.base,
        slots: rd.slots.map(sl => ({ id: sl.id, label: sl.label, options: sl.options.map(o => pickKeys(o, ['id', 'label', 'price'])) })),
        customers: rd.customers.map(cu => ({ who: cu.who, need: cu.need })) };
    }
    if (rd.type === 'type') return { type: 'type', src, prompt: rd.prompt, tool: rd.tool, shuffle: rd.shuffle, items: rd.items.map(it => pickKeys(it, ['t', 'sub', 'icon', 'ph', 'hint', 'toolShift'])) };
    if (rd.type === 'lab' || rd.type === 'gen') return { ...clone(rd), src };   // 情境、題目都由伺服器產生（參數原樣帶過去）
    throw new Error('不認得的回合：' + rd.type);
  });
}
function cards(term, levels) {
  const T = ANS.cards[term] = ANS.cards[term] || {};
  return levels.map(lv => {
    if (T[lv.id]) throw new Error(term + ' 關卡編號重複：' + lv.id);
    T[lv.id] = clone(lv); stat.levels++;
    const base = { id: lv.id, icon: lv.icon, title: lv.title, book: lv.book, learn: lv.learn };
    if (lv.stages) return { ...base, stages: lv.stages.map((st, si) => ({ goal: st.goal, rounds: pubRounds(term, lv.id, si, st.rounds) })) };
    return { ...base, rounds: pubRounds(term, lv.id, null, lv.rounds) };
  });
}

/* ── Python：公開版只有題目、範例、要求、公開測資的輸入（離線練習用）；預期輸出、隱藏測資、提示都在伺服器 ── */
function python(term, levels) {
  const T = ANS.py[term] = ANS.py[term] || {};
  return levels.map(lv => {
    T[lv.id] = clone(lv);
    const { hints, tests, ...pub } = lv;
    return { ...clone(pub), hn: (hints || []).length, tests: tests.map(t => (t.hidden ? { name: t.name, hidden: true } : { name: t.name, inputs: t.inputs || [] })) };
  });
}

/* ── 試算表：標準答案先算好（伺服器比對用），公開版只有題目與資料 ── */
function sheet(term, levels) {
  const T = ANS.sheet[term] = ANS.sheet[term] || {};
  return levels.map(lv => {
    const grid = SHEET.makeGrid(lv.clean ? lv.clean.fixed : lv.data, lv.labels);
    lv.targets.forEach(t => grid.set(t.cell, t.ref));   // 後面的格子可能引用前面的答案（例如 B13 用到 B11）
    const targets = lv.targets.map(t => {
      const want = SHEET.evaluate(t.ref, grid);
      if (typeof want !== 'number') throw new Error(lv.id + ' ' + t.cell + ' 標準答案不是數字');
      return { ...clone(t), want };
    });
    T[lv.id] = { ...clone(lv), targets };
    const o = { id: lv.id, icon: lv.icon, title: lv.title, book: lv.book, story: lv.story, data: lv.data, labels: lv.labels,
      targets: lv.targets.map(t => pickKeys(t, ['cell', 'label', 'must'])), hn: (lv.hints || []).length };
    if (lv.clean) o.clean = { prompt: lv.clean.prompt };
    return o;
  });
}

/* ── 寫檔 ── */
function writeJS(file, globals, src) {
  const body = Object.entries(globals).map(([k, v]) => 'window.' + k + ' = ' + JSON.stringify(v, null, 1) + ';').join('\n\n');
  fs.writeFileSync(file, '/* ⚠️ 自動產生，請勿手改。來源：' + src + '（私有，不進 git）；產生方式：node tools/build.mjs\n' +
    '   公開版只有題目：答案、解說、提示、預期輸出都在驗證伺服器（server/，見 server/README.md）。 */\n' + body + '\n');
}

let PYLAB = null;   // 🐍 教師試用版（pylab/）用的關卡：和 11601 單元二同一份（只有題目）
for (const term of ['11601', '11602']) {
  const dir = P('private', term, 'content');
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort()) {
    const W = load([path.join(dir, f)]), outG = {};
    for (const [k, v] of Object.entries(W)) {
      if (k === 'window') continue;
      if (k === 'PY_LEVELS') { outG[k] = python(term, v); if (term === '11601') PYLAB = outG[k]; }
      else if (k === 'SHEET_LEVELS') outG[k] = sheet(term, v);
      else if (/_LEVELS$/.test(k)) outG[k] = cards(term, v);
      else outG[k] = v;                     // 沒有答案的資料（例如 MEDIA_STEPS）原樣輸出
    }
    writeJS(P(term, 'content', f), outG, 'private/' + term + '/content/' + f);
    console.log('✔', term + '/content/' + f, Object.keys(outG).join(', '));
  }
  /* 5016B 預測檢核：答案只在伺服器；舊的公開封存檔刪掉 */
  const labSrc = P('private', term, 'lab.js');
  if (fs.existsSync(labSrc)) ANS.labkit[term] = clone(load([labSrc]).LAB_ANSWERS);
  if (fs.existsSync(P(term, 'content', 'lab.js'))) { fs.unlinkSync(P(term, 'content', 'lab.js')); console.log('🗑', term + '/content/lab.js（改問伺服器）'); }
}

/* 🐍 教師試用版：pylab/levels.js（和學生版同一份題目；測資一樣在伺服器） */
if (PYLAB && fs.existsSync(P('pylab'))) {
  writeJS(P('pylab', 'levels.js'), { PY_LEVELS: PYLAB }, 'private/11601/content/python.js（和 11601 單元二同一份）');
  console.log('✔ pylab/levels.js（教師試用版）');
}

/* 單元一：快速檢核按鈕 ── 答案在伺服器；HTML 上不留任何答案資料 */
const REV = P('private', '11601', 'digital', 'review.json');
if (fs.existsSync(REV)) {
  const R = JSON.parse(fs.readFileSync(REV, 'utf8'));
  ANS.digital = R;
  for (const [u, list] of Object.entries(R)) {
    const file = P('11601', 'digital', u + '.html');
    let html = fs.readFileSync(file, 'utf8'), i = 0;
    html = html.replace(/onclick="answerReview\((\d+), this\)"(?: data-k="[^"]*")?/g, (m, q) => {
      const b = list[i++]; if (!b || String(b.q) !== q) throw new Error('單元一 ' + u + '.html 按鈕順序和 review.json 對不上');
      return 'onclick="answerReview(' + q + ', this)"';
    });
    if (i !== list.length) throw new Error('單元一 ' + u + '.html 按鈕數量和 review.json 對不上');
    fs.writeFileSync(file, html);
  }
  console.log('✔ 11601/digital/1～4.html 快速檢核');
}

/* ── 驗證伺服器整包：private/server/（貼到 Google Apps Script，或用 clasp push） ── */
const OUT = P('private', 'server');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(P('server')).filter(f => /^\d\d_.*\.js$/.test(f)).sort()) fs.copyFileSync(P('server', f), path.join(OUT, f));
fs.writeFileSync(path.join(OUT, '70_sheet_engine.js'), '/* 試算表引擎（和網頁用的 shared/sheet.js 同一份）：伺服器重算學生的公式 */\n' + fs.readFileSync(P('shared/sheet.js'), 'utf8'));
fs.writeFileSync(path.join(OUT, '90_answers.js'), '/* ⚠️ 自動產生（node tools/build.mjs），全部答案都在這裡 —— 只能放在 Apps Script，絕對不能公開 */\nvar SV_ANS = ' + JSON.stringify(ANS) + ';\n');
if (fs.existsSync(P('server', 'appsscript.json'))) fs.copyFileSync(P('server', 'appsscript.json'), path.join(OUT, 'appsscript.json'));
/* 📋 一鍵貼上：全部檔案依序合成一個檔（Apps Script 只要建一個檔、整個貼上）
   放在 private/伺服器一鍵貼上/（和 private/server/ 分開：用 clasp 上傳 server/ 時才不會重複）
   ・一鍵複製.html            用瀏覽器打開 → 按「📋 複製全部」
   ・一鍵貼上_course116.gs    用記事本打開 → 全選 → 複製 */
const ONE = P('private', '伺服器一鍵貼上');
fs.rmSync(ONE, { recursive: true, force: true }); fs.mkdirSync(ONE, { recursive: true });
const parts = fs.readdirSync(OUT).filter(f => f.endsWith('.js')).sort();
const one = '/* ⚠️ course_116 驗證伺服器（一鍵貼上版，node tools/build.mjs 產生，' + ANS.built + ' UTC）\n' +
  '   含全部答案：只能貼在 Google Apps Script，絕對不能公開。更新時整個取代。 */\n' +
  parts.map(f => '\n/* ════════ ' + f + ' ════════ */\n' + fs.readFileSync(path.join(OUT, f), 'utf8').replace(/\s*$/, '') + '\n;').join('\n') + '\n';
fs.writeFileSync(path.join(ONE, '一鍵貼上_course116.gs'), one);
const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
fs.writeFileSync(path.join(ONE, '一鍵複製.html'), '<!doctype html><meta charset="utf-8"><title>course_116 驗證伺服器：一鍵複製</title>' +
  '<style>body{font-family:"Microsoft JhengHei",sans-serif;max-width:46rem;margin:2rem auto;padding:0 1rem;line-height:1.7}button{font:inherit;font-size:1.3rem;padding:.6rem 1.4rem;border-radius:.6rem;border:0;background:#047857;color:#fff;cursor:pointer}' +
  'textarea{width:100%;height:10rem;font:12px monospace}.ok{color:#047857;font-weight:900}ol li{margin:.3rem 0}</style>' +
  '<h1>🔐 course_116 驗證伺服器</h1><p>建置時間：' + ANS.built + ' UTC　·　' + parts.length + ' 個檔案合成一個　·　' + Math.round(one.length / 1024) + ' KB</p>' +
  '<p><button id="b">📋 複製全部</button> <span id="m"></span></p>' +
  '<ol><li>打開 Apps Script 專案的 <b>程式碼.gs</b>（只要這一個檔）</li><li>在編輯區按 <b>Ctrl＋A</b> 全選，再按 <b>Ctrl＋V</b> 貼上（整個取代）</li><li>按 💾 儲存</li>' +
  '<li>第一次：部署 → 新增部署作業 → 網頁應用程式（執行身分：我；存取：所有人）<br>之後更新：部署 → 管理部署作業 → ✏️ → 版本：新版本 → 部署</li></ol>' +
  '<p>⚠️ 這一頁含全部答案，只放在老師電腦（private/ 資料夾），不要傳給學生、不要上傳 GitHub。</p>' +
  '<textarea id="t" readonly>' + esc(one) + '</textarea>' +
  '<script>document.getElementById("b").onclick=function(){var t=document.getElementById("t"),m=document.getElementById("m");' +
  'function ok(){m.innerHTML="<span class=ok>✅ 已複製，到 Apps Script 貼上吧</span>";}' +
  'if(navigator.clipboard){navigator.clipboard.writeText(t.value).then(ok,function(){t.select();document.execCommand("copy");ok();});}else{t.select();document.execCommand("copy");ok();}};</script>');

/* 用 clasp 上傳（選用）：private/script-id.txt 放 Apps Script 專案的「指令碼 ID」，就產生 .clasp.json（照檔名順序上傳） */
const SID = P('private', 'script-id.txt');
if (fs.existsSync(SID)) {
  const order = fs.readdirSync(OUT).filter(f => f.endsWith('.js')).sort();
  fs.writeFileSync(path.join(OUT, '.clasp.json'), JSON.stringify({ scriptId: fs.readFileSync(SID, 'utf8').trim(), rootDir: '.', filePushOrder: order }, null, 2) + '\n');
}
console.log('✔ private/server/：' + fs.readdirSync(OUT).length + ' 個檔案（' + stat.levels + ' 關、' + stat.rounds + ' 回合）');
console.log('📋 一鍵貼上：private/伺服器一鍵貼上/一鍵複製.html（用瀏覽器打開，按「複製全部」）');
