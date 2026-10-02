import { lastLab, gas } from './harness.mjs';
// 🧪 資料偵探／多媒體／AI 前導關的實驗站解題器＋🎲 密碼出題器解題器
// 🎲 出題器：只看畫面上的題目，照課本規則算答案（和學生一樣）。
// 🧪 實驗站：情境藏在伺服器，解題器直接看模擬伺服器裡的 sec（lastLab()）── 學生的網頁拿不到這些。

/** 🎲 密碼特務的出題器：看題目算答案；不是密碼題就回傳 null */
export async function cipherAnswer(page, S = { txt: '.qcard .txt', sub: '.qcard .small', ans: '#ans' }) {
  await page.waitForSelector(S.txt, { timeout: 8000 }).catch(() => {});   // 題目由伺服器出：等它出現
  const P = await page.evaluate(S => {   // 從畫面讀題目（和學生看到的一樣）；算答案用伺服器那份密碼規則（shift／vig／單字庫）
    if (!document.querySelector(S.txt) || !document.querySelector(S.ans)) return null;
    return { t: document.querySelector(S.txt).textContent.trim(), sub: (document.querySelector(S.sub) || {}).textContent || '',
      cells: [...document.querySelectorAll('#tool [data-i] .black')].map(e => e.textContent.replace('✔', '').trim()) };
  }, S);
  if (!P) return null;
  {
    const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', C = gas.ctx.CARDGAME.cipher, t = P.t, sub = P.sub;
    let m;
    if (/把整個單字換成編號/.test(sub)) return t.split('').map(c => A.indexOf(c)).join(',');
    if (/這串編號是哪一個英文單字/.test(sub)) return t.split(' ').map(x => A[+x]).join('');
    if ((m = t.match(/編號 (\d+) 先往後移 (\d+) 格，再往前移 (\d+) 格/))) return String(((+m[1] + +m[2] - +m[3]) % 26 + 26) % 26);
    if (/編號是？/.test(sub)) return String(A.indexOf(t));
    if ((m = t.match(/^字母 ([A-Z]) 往後移 (\d+) 格/))) return A[(A.indexOf(m[1]) + +m[2]) % 26];
    if (/哪一個字母/.test(sub)) return A[+t.replace(/\D/g, '')];
    if ((m = t.match(/編號 (\d+) 往(後|前)移 (\d+) 格/))) return String(((+m[1] + (m[2] === '後' ? 1 : -1) * +m[3]) % 26 + 26) % 26);
    if ((m = sub.match(/^加密，金鑰 (\d+)/))) return C.shift(t, +m[1] % 26);
    if ((m = sub.match(/^解密，金鑰 (\d+)/))) return C.shift(t, -m[1]);
    if (/兩個單字（同一把金鑰）/.test(sub)) { const ws = t.split(' '); for (let k = 1; k < 26; k++) { const w = ws.map(x => C.shift(x, -k)); if (w.every(x => C.WORDS.includes(x))) return w.join(' '); } }
    if (/金鑰不知道/.test(sub)) { for (let k = 1; k < 26; k++) { const w = C.shift(t, -k); if (C.WORDS.includes(w)) return w; } }
    if (/加密法 1/.test(sub)) return C.vig(t, t.split('').map((_, i) => i + 1), 1);
    if ((m = sub.match(/維吉尼亞解密，金鑰依序 ([\d、]+)/))) return C.vig(t, m[1].split('、').map(Number), -1);
    if ((m = sub.match(/金鑰依序 ([\d、]+)/))) return C.vig(t, m[1].split('、').map(Number), 1);
    const km = sub.match(/正解是 ([A-D])/);
    if (!P.cells.length || !km) return null;
    const ans = P.cells, key = km[1];
    if (/答對的有幾人/.test(t)) return String(ans.filter(x => x === key).length);
    if (/答錯的有幾人/.test(t)) return String(ans.filter(x => x !== key).length);
    if (/錯誤選項.*最多人選/.test(t)) { const c = {}; ans.filter(x => x !== key).forEach(x => c[x] = (c[x] || 0) + 1); return Object.keys(c).sort((a, b) => c[b] - c[a])[0]; }
    if ((m = t.match(/選 ([A-D]) 的有幾人/))) return String(ans.filter(x => x === m[1]).length);
    if (/答對率/.test(t)) return String(Math.round(ans.filter(x => x === key).length / ans.length * 100));
    return null;
  }
}

export const LABS2 = ['resFrame', 'flipbook', 'timeline', 'licenseCheck', 'dataToInfo', 'cleanLab', 'rleLab', 'blackBox', 'trainer', 'robotAlgo', 'nextWord', 'promptLab', 'fakeSpot'];
const ds = page => page.$eval('#lab', e => ({ ...e.dataset }));
const change = (page, sel, v) => page.$eval(sel, (e, v) => { e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); }, v);

/** 🧪 把目前畫面上的實驗站做對（最後按確認） */
export async function solveLab2(page) {
  await page.waitForSelector('#lab[data-lab]', { timeout: 10000 });   // 實驗站的情境由伺服器產生：等畫面畫好
  const d = await ds(page), lab = d.lab || (await page.$eval('#lab > div', e => e.className));
  const S = lastLab().sec, SV = gas.ctx.SV;   // 伺服器留著的情境（解題器可以偷看；學生的網頁拿不到）
  if (d.lab === 'resFrame') {   // 📺
    for (const [i, x] of S.q.entries()) {
      if (x.k === 'wh') { await page.fill(`.rf-n[data-i="${i}"][data-p="w"]`, String(x.w)); await page.fill(`.rf-n[data-i="${i}"][data-p="h"]`, String(x.h)); }
      else if (x.k === 'hi') await page.click(`.rf-o[data-i="${i}"][data-v="${x.v}"]`);
      else await page.fill(`.rf-n[data-i="${i}"][data-p="v"]`, String(x.v));
    }
    return page.click('#rf-ok');
  }
  if (d.lab === 'flipbook') {   // 🎞️ 畫面上的第 k 張 → 真正的第 order[k] 格
    const ks = S.order.map((_, k) => k).sort((a, b) => S.order[a] - S.order[b]);
    for (const k of ks) await page.click(`.fb-f[data-k="${k}"]`);
    await page.fill('#fb-fps', String(S.N / S.T));
    if (S.extra) await page.fill('#fb-tot', String((S.extra.m * 60 + S.extra.s) * S.extra.f));
    return page.click('#fb-ok');
  }
  if (d.lab === 'timeline') {   // 🎚️
    for (const c of S.clips) {
      const tr = c.kind === 'base' ? 'V1' : c.kind === 'over' ? 'V2' : c.id === 'voice' ? 'A2' : 'A1';
      await page.click(`.tl-clip[data-c="${c.id}"]`); await page.click(`.tl-lab[data-t="${tr}"]`);
    }
    if (S.hard) for (const c of S.clips) await change(page, `.tl-st[data-c="${c.id}"]`, String(S.want[c.id]));
    return page.click('#tl-ok');
  }
  if (d.lab === 'licenseCheck') {   // 📜
    for (const m of S.mats) await page.click(`.lc-a[data-m="${m.id}"][data-a="${SV._media.verdict(m, S.commercial, S.edit)}"]`);
    return page.click('#lc-ok');
  }
  if (await page.$('.di')) {   // 🔎 dataToInfo
    const x = JSON.parse(d.d), put = (k, v) => page.fill(`.di-n[data-k="${k}"]`, String(v));
    if (x.kind === 'temp') {
      const fever = x.temps.filter(t => t >= 37.5).length;
      await put('fever', fever); await put('max', x.temps.indexOf(Math.max(...x.temps)) + 1);
      await page.click(`.di-yn[data-k="act"][data-v="${fever ? 'y' : 'n'}"]`);
    } else {
      const a1 = x.w1.reduce((a, b) => a + b) / 7, a2 = x.w2.reduce((a, b) => a + b) / 7;
      await put('a1', a1); await put('a2', a2); await put('pct', Math.round((a2 - a1) / a1 * 100));
      await page.click(`.di-yn[data-k="act"][data-v="${a2 > a1 ? 'y' : 'n'}"]`);
    }
    return page.click('#di-ok');
  }
  if (await page.$('.cl-k')) {   // 🧹 cleanLab 基本
    for (const [i, r] of S.rows.entries()) await page.click(`.cl-k[data-i="${i}"][data-k="${SV._data.judge(r)}"]`);
    return page.click('#cl-ok');
  }
  if (await page.$('.cl-a')) {   // 🧹 cleanLab 挑戰
    const rows = JSON.parse(d.rows), valid = rows.filter(r => typeof r.score === 'number' && r.score <= 100);
    const avg = valid.reduce((a, r) => a + r.score, 0) / valid.length;
    for (const [i, r] of rows.entries()) {
      const std = /^\d{4}\/\d{1,2}\/\d{1,2}$/.test(r.date) ? null : r.date.match(/\d+/g).map(Number).join('/');
      const a = typeof r.score === 'number' && r.score > 100 ? 'del' : r.score === '' ? 'fill' : std ? 'conv' : 'keep';
      await page.click(`.cl-a[data-i="${i}"][data-a="${a}"]`);
      if (a === 'fill') await page.fill(`.cl-v[data-i="${i}"]`, String(avg));
      if (a === 'conv') await page.fill(`.cl-v[data-i="${i}"]`, std);
    }
    return page.click('#cl-ok');
  }
  if (await page.$('.rl')) {   // 🗜️ rleLab
    const rle = row => { const o = []; let cur = 0, c = 0; for (const p of row) { if (p === cur) c++; else { o.push(c); cur = p; c = 1; } } o.push(c); return o; };
    if (d.rows) {
      const rows = JSON.parse(d.rows), codes = rows.map(rle);
      for (const [i, c] of codes.entries()) await page.fill(`.rl-in[data-i="${i}"]`, c.join(','));
      await page.fill('#rl-cnt', String(codes[0].length + codes[1].length));
    } else {
      const codes = JSON.parse(d.codes);
      for (const [y, c] of codes.entries()) { let x = 0; for (const [k, n] of c.entries()) { if (k % 2) for (let j = 0; j < n; j++) await page.click(`#rl-g .px[data-x="${x + j}"][data-y="${y}"]`); x += n; } }
      await page.fill('#rl-cnt', String(codes.reduce((a, c) => a + c.length, 0)));
      await page.click('.rl-k[data-k="lossless"]');
    }
    return page.click('#rl-ok');
  }
  if (d.lab === 'blackBox') {   // 🤖 每一台：每個水果教一遍 → 再測一次（有證據）→ 照伺服器的答案分類
    const logN = () => page.$$eval('.bb-log li:not(.soft)', ls => ls.length);
    for (let i = 0; i < S.ms.length; i++) {
      await page.click(`.bb-tab[data-i="${i}"]`);
      for (let k = 0; k < S.fruits.length; k++) {
        const n0 = await logN(); await page.click(`.bb-f[data-k="${k}"]`); await page.click('#bb-teach');
        await page.waitForFunction(n => document.querySelectorAll('.bb-log li:not(.soft)').length > n, n0);
      }
      const n1 = await logN(); await page.click('.bb-f[data-k="0"]'); await page.click('#bb-test');
      await page.waitForFunction(n => document.querySelectorAll('.bb-log li:not(.soft)').length > n, n1);
      await page.click(`.bb-k[data-k="${S.ms[i].type}"]`);
    }
    return page.click('#bb-ok');
  }
  if (d.lab === 'trainer') {   // 🐱🐶 暴力找一組 ≤ max 張、讓測試全對的資料集（真正的答案用伺服器的 truth）
    const pool = JSON.parse(d.pool), tests = S.tests || JSON.parse(d.tests), max = +d.max, A = SV._ai;
    let best = null;
    for (let m = 1; m < (1 << pool.length) && !best; m++) {
      const idx = pool.map((_, i) => i).filter(i => m & (1 << i)); if (idx.length > max) continue;
      const set = idx.map(i => (S.pool || pool)[i]);
      if (tests.every(p => A.nn(set, p) === A.truth(p))) best = idx;
    }
    for (const i of best) await page.click(`.tr-p[data-k="${i}"]`);
    await page.click('#tr-run');
    return page.click('#tr-ok');
  }
  if (d.lab === 'robotAlgo') {   // 🤖 最少積木的路線（Dijkstra），挑戰版用「重複執行」
    const { G, s, limit } = JSON.parse(d.map), gy = G.findIndex(r => r.includes('goal')), goal = { x: G[gy].indexOf('goal'), y: gy }, H = G.length, W = G[0].length, DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    const key = (x, y, dd) => x + ',' + y + ',' + dd, best = { [key(s.x, s.y, s.d)]: 0 }, prev = {};
    const q = [[s.x, s.y, s.d, 0]]; let end = null;
    while (q.length) {
      q.sort((a, b) => a[3] - b[3]); const c = q.shift();
      if (c[0] === goal.x && c[1] === goal.y) { end = c; break; }
      const nx = [[c[0], c[1], (c[2] + 3) % 4, c[3] + 1, { t: 'left' }], [c[0], c[1], (c[2] + 1) % 4, c[3] + 1, { t: 'right' }]];
      for (let k = 1; k < 6; k++) { const x = c[0] + DIRS[c[2]][0] * k, y = c[1] + DIRS[c[2]][1] * k; if (x < 0 || y < 0 || x >= W || y >= H || G[y][x] === 'wall') break; nx.push([x, y, c[2], c[3] + (limit ? (k === 1 ? 1 : 2) : k), { t: 'fwd', k }]); }
      for (const n of nx) { const kk = key(n[0], n[1], n[2]); if (best[kk] == null || best[kk] > n[3]) { best[kk] = n[3]; prev[kk] = [key(c[0], c[1], c[2]), n[4]]; q.push(n.slice(0, 4)); } }
    }
    const moves = []; let kk = key(end[0], end[1], end[2]);
    while (prev[kk]) { moves.unshift(prev[kk][1]); kk = prev[kk][0]; }
    const blocks = [];
    for (const mv of moves) { if (mv.t !== 'fwd') blocks.push({ t: mv.t }); else if (limit && mv.k > 1) blocks.push({ t: 'rep', n: mv.k }, { t: 'fwd' }); else for (let j = 0; j < mv.k; j++) blocks.push({ t: 'fwd' }); }
    blocks.push({ t: 'pick' });
    for (const [i, b] of blocks.entries()) { await page.click(`.ra-b[data-b="${b.t}"]`); if (b.t === 'rep') await change(page, `.ra-rep[data-i="${i}"]`, String(b.n)); }
    return page.click('#ra-ok');
  }
  if (d.lab === 'nextWord') {   // 💬 數一數哪個詞最常接在後面
    const corpus = JSON.parse(d.corpus);
    const top = w => { const c = {}; for (const s of corpus) { const i = s.indexOf(w); if (i >= 0 && i < s.length - 1) c[s[i + 1]] = (c[s[i + 1]] || 0) + 1; } const k = Object.keys(c).sort((a, b) => c[b] - c[a])[0]; return [k, c[k]]; };
    if (d.asks) {
      for (const [i, w] of d.asks.split(',').entries()) { const [t, c] = top(w); await page.click(`.nw-o[data-i="${i}"][data-v="${t}"]`); await page.fill(`.nw-c[data-i="${i}"]`, String(c)); }
    } else {
      const chain = [d.start]; for (let k = 0; k < 3; k++) { const t = top(chain[k])[0]; chain.push(t); await page.click(`.nw-w[data-w="${t}"]`); }
      await page.click(`.nw-y[data-v="${corpus.some(s => s.join(' ') === chain.join(' ')) ? 'y' : 'n'}"]`);
    }
    return page.click('#nw-ok');
  }
  if (d.lab === 'promptLab') {   // 🔍 四要素＋一句一句檢查
    const s = JSON.parse(d.s);
    const r = { who: S.WHO.indexOf(S.who), tone: S.TONE.indexOf(S.tone), k: S.drafts.map(x => SV._ai.judgeDraft(x, S.feat, S.lim)) };
    for (const [k, v] of [['who', r.who], ['feat', s.fopts.indexOf(s.feat)], ['tone', r.tone], ['lim', 0]]) await page.click(`.pl-s[data-s="${k}"][data-k="${v}"]`);
    for (const [i, v] of r.k.entries()) await page.click(`.pl-k[data-i="${i}"][data-k="${v}"]`);
    if (await page.$('#pl-mine')) await page.fill('#pl-mine', s.feat + '真方便');
    return page.click('#pl-ok');
  }
  if (d.lab === 'fakeSpot') {   // 🕵️ 數手指、檢查時鐘
    const imgs = JSON.parse(d.imgs), okClock = n => n.length === 12 && n.every((v, i) => v === i + 1);
    for (const [i, x] of imgs.entries()) if (x.k === 'hand' ? x.n !== 5 : !okClock(x.nums)) await page.click(`.fk-i[data-i="${i}"]`);
    return page.click('#fk-ok');
  }
  throw new Error('labs2_solver 不認得的實驗站：' + lab);
}
