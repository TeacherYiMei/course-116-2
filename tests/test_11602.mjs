// 116-2 下學期：網路世界、資料偵探（遊戲）、試算表、密碼特務（🎲 隨機出題）
import { launch, login, BASE, SHOTS } from './harness.mjs';
import fs from 'fs'; fs.mkdirSync(SHOTS, { recursive: true });
import { priv, passCool } from './harness.mjs';
import { solve as netSolve0, answer as netAnswer, solveLab as netLab } from './net_solver.mjs';
import { cipherAnswer, solveLab2, LABS2 } from './labs2_solver.mjs';
// 🎲 密碼出題器（D4 用到）先試；不是密碼題才交給網路解題器
const netSolve = async page => { const a = await cipherAnswer(page); return a != null ? { kind: 'input', answer: a } : netSolve0(page); };
const solveLab = async page => LABS2.includes(await page.waitForSelector('#lab[data-lab]').then(() => page.$eval('#lab', e => e.dataset.lab))) ? solveLab2(page) : netLab(page);

const { browser, context } = await launch();
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('dialog', d => d.accept());
let bad = 0;
const ok = (cond, ...msg) => { if (!cond) bad++; console.log(cond ? '✔' : '✘', ...msg); };

await page.goto(BASE + '/11602/hub.html');
await login(page);

/* ── 遊戲：照正解玩完每一關 ───────────────── */
/* 🎲 gen 回合：看畫面算答案（net_solver.mjs）；每一回合的第一題故意先答錯一次，確認會扣心、可以重答 */
async function playGen(n) {
  for (let k = 1; k <= n; k++) {
    const sol = await netSolve(page);
    let use = sol;
    if (k === 1 && !genWrongTried) {
      genWrongTried = true;
      await netAnswer(page, sol, true);
      await page.waitForSelector('#fb .note');
      ok((await page.textContent('#fb')).includes('不對'), '🎲 答錯會扣心', sol.kind);
      const cooled = await passCool(page);
      ok(cooled, '🧊 答錯太快 → 冷靜一下 5 秒');
      if (sol.kind === 'choice') {   // 三星三階的選擇題：答錯換一題（不能翻牌）
        ok(!!(await page.$('#swap')), '🎲 選擇題答錯 → 換一題');
        await page.click('#swap'); use = await netSolve(page);
      }
      if (sol.kind === 'bits') for (let i = 0; i < 8; i++) if (await page.$(`.gbit[data-j="${i}"].on`)) await page.click(`.gbit[data-j="${i}"]`);
      if (sol.kind === 'order') await page.click('#reset').catch(() => {});
    }
    await netAnswer(page, use, false);
    await page.waitForSelector('#nx', { timeout: 5000 }).catch(async () => { throw new Error('🎲 答不對：' + (await page.textContent('.qcard')) + ' → ' + JSON.stringify(sol) + ' ' + (await page.textContent('#fb'))); });
    await page.click('#nx');
  }
}
let genWrongTried = false;
async function playRounds(rounds) {
  for (const rd of rounds) {
    if (rd.type === 'gen') { await playGen(rd.n); continue; }
    if (rd.type === 'lab') {   // 🧪 實驗站：一題一題做出正確結果
      for (let q = 0; q < (rd.n || 1); q++) {
        await solveLab(page);
        await page.waitForSelector('#nx', { timeout: 8000 }).catch(async () => { throw new Error('🧪 實驗站沒過：' + (await page.textContent('#fb'))); });
        await page.click('#nx');
      }
      continue;
    }
    await playSealed(rd);
  }
}
async function playCard(levels, i) {
  const lv = levels[i];
  await page.click(`.lvcard[data-i="${i}"]`);
  if (lv.stages) {   // ⭐ 三星三階：一階一階打上去
    genWrongTried = false;
    await page.click('.stage[data-s="0"]');
    for (let s = 0; s < lv.stages.length; s++) {
      if (s > 0) await page.click('#up');
      await playRounds(lv.stages[s].rounds);
      await page.waitForSelector('.end-star');
      const got = await page.$eval('.end-star .stars', e => e.getAttribute('aria-label'));
      ok(got.startsWith(String(s + 1)), lv.id, '第', s + 1, '階通過 →', got);
    }
    const s = await page.$eval('.end-star .stars', e => e.getAttribute('aria-label'));
    await page.click('#menu');
    return s;
  }
  await page.click('#go');
  await playRounds(lv.rounds);
  await page.waitForSelector('.end-star');
  const s = await page.$eval('.end-star .stars', e => e.getAttribute('aria-label'));
  await page.click('#menu');
  return s;
}
async function playSealed(rd) {
  {
    if (rd.type === 'sort') {
      const n = rd.pick || rd.items.length;
      for (let k = 0; k < n; k++) {
        const txt = (await page.textContent('.qcard .txt')).trim();
        const it = rd.items.find(x => x.t === txt);
        await page.click(`.bucket[data-b="${it.a}"]`);
        await page.click('#nx');
      }
    } else if (rd.type === 'order') {
      for (const [k, it] of rd.items.entries()) { await page.click(`.order-btn[data-t="${it.t}"]`); await page.waitForFunction(n => document.querySelectorAll('.order-btn.right').length >= n, k + 1); }
      await page.click('#nx');
    } else if (rd.type === 'type') {
      for (let k = 0; k < rd.items.length; k++) {
        const txt = (await page.textContent('.qcard .txt')).trim();
        const it = rd.items.find(x => x.t === txt);
        await page.fill('#ans', it.a[0].toLowerCase());   // 小寫也要算對
        await page.press('#ans', 'Enter');
        await page.click('#nx');
      }
    }
  }
}
for (const [file, varName] of [['network', 'NET_LEVELS'], ['data', 'DATA_LEVELS']]) {
  await page.goto(`${BASE}/11602/${file}.html`);
  await page.waitForSelector('.lvcard');
  const levels = priv('11602/content/' + file + '.js')[varName];   // 正解從 private 讀
  if (file === 'network') {   // ⭐ 三星三階：一開始只開第 1 階；題號整階連續算
    await page.click('.lvcard[data-i="0"]'); await page.click('.stage[data-s="0"]');
    const t0 = await page.textContent('#app .card > p.small');
    ok(/（第 1 \/ 10 題）/.test(t0), '題號整階連續：第 1 / 10 題', t0);
    await page.click('#quit'); await page.waitForSelector('.lvcard');
    await page.click('.lvcard[data-i="0"]');
    ok(!(await page.$eval('.stage[data-s="0"]', b => b.disabled)) && await page.$eval('.stage[data-s="1"]', b => b.disabled) && await page.$eval('.stage[data-s="2"]', b => b.disabled), '三星三階：一開始只開放第 1 階');
    await page.screenshot({ path: SHOTS + 'net-stages.png', fullPage: true });
    await page.click('#back');
  }
  for (let i = 0; i < levels.length; i++) { const s = await playCard(levels, i); ok(s.startsWith('3'), file, levels[i].id, s); }
}
/* ── 🧪 實驗站：做錯會扣心、告訴你哪裡錯；做對才過 ── */
{
  await page.goto(`${BASE}/11602/network.html?r=7#N1`); await page.click('.stage[data-s="1"]'); await page.waitForSelector('.wr-port');
  await page.click('[data-p="wall.out"]'); await page.click('[data-p="router.wan"]');   // 光纖孔直接接路由器：錯
  await page.waitForTimeout(1600); await page.click('#wr-test'); await page.waitForSelector('#fb .note');
  ok((await page.textContent('#fb')).includes('數據機') && (await page.$$('.hud .hearts .off, .hud .hearts [data-off]')).length >= 0, '🔌 拉線：接錯會說明（光纖孔要先接數據機）');
  await passCool(page);
  await page.click('#wr-clear');
  await solveLab(page); await page.waitForSelector('#nx'); ok(true, '🔌 拉線：照規則接好就通過');
  await page.screenshot({ path: SHOTS + 'lab-wire-ok.png' });
  await page.goto(`${BASE}/11602/network.html?r=8#N8`); await page.click('.stage[data-s="1"]'); await page.waitForSelector('.wf-c');
  const lay = JSON.parse(await page.$eval('#lab', e => e.dataset.layout));
  const far = await page.evaluate(() => { const lay = JSON.parse(document.getElementById('lab').dataset.layout), W = CARDGAME.labs._wifi, tv = lay.devs.find(d => d.need5);
    for (let x = 0; x < 12; x++) for (let y = 0; y < 8; y++) if (W.sig(lay, { x, y }, tv, 'g5') <= 0 && !lay.devs.some(d => d.x === x && d.y === y)) return { x, y }; });
  await page.click(`.wf-c[data-x="${far.x}"][data-y="${far.y}"]`);
  for (let i = 0; i < lay.devs.length; i++) await page.click(`.wf-b[data-i="${i}"][data-b="g5"]`);
  await page.waitForTimeout(1600); await page.click('#wf-ok'); await page.waitForSelector('#fb .note');
  ok((await page.textContent('#fb')).includes('收不到'), '📶 Wi-Fi：電視收不到 5GHz 會說明');
  await passCool(page);
  await solveLab(page); await page.waitForSelector('#nx'); ok(true, '📶 Wi-Fi：放對位置、選對頻段就通過');
  await page.screenshot({ path: SHOTS + 'lab-wifi-ok.png' });
}

/* ── 🧪 其他實驗站：做錯會說明錯在哪裡 ── */
{
  const open = async (id, s, q) => { await page.goto(`${BASE}/11602/network.html?w=${q}#${id}`); await page.click(`.stage[data-s="${s}"]`); await page.waitForSelector('#lab[data-lab]'); await page.waitForTimeout(1600); };
  const fbHas = async (t, msg) => { await page.waitForFunction(t => (document.querySelector('#fb .note') || {}).textContent?.includes(t), t, { timeout: 8000 }).catch(() => {}); ok((await page.textContent('#fb')).includes(t), msg); await passCool(page); };   // 等「這一次」的回饋（上一步的回饋可能還在畫面上）
  await open('N2', 1, 1);   // 長距離用雙絞線
  const spots = JSON.parse(await page.$eval('#lab', e => e.dataset.spots));
  for (let i = 0; i < spots.length; i++) await page.click(`.cp-c[data-i="${i}"][data-c="${spots[i].kind === 'tv' ? 'coax' : 'tp'}"]`);
  await page.click('#cp-ok'); await fbHas('太遠', '🧵 佈線：超過 100 公尺用雙絞線會被擋');
  await open('N5', 2, 2); await page.click('#v6-ok'); await fbHas('更短', '✂️ IPv6：沒壓到最短會被擋');
  await open('N7', 1, 3);
  await page.click('.mt-s[data-s="pcB"]'); await page.click('.mt-p[data-p="SMTP"]'); await page.click('#mt-go'); await fbHas('不會送到', '📨 郵件：跳站會被擋');
  await open('N9', 1, 4);
  await page.click('.dl-p[data-id="p50"]'); await page.click('.dl-a[data-id="w4"]');
  const slow = await page.evaluate(() => { const sc = JSON.parse(document.getElementById('lab').dataset.sc), D = CARDGAME.labs._dl; return D.time(D.PLAN[0], D.APS[0], sc.n, sc.mb) > sc.T; });
  if (slow) { await page.click('#dl-go'); await fbHas('超過', '🚀 下載：太慢會被擋'); }
  await open('N6', 1, 5);
  for (let k = 0; k < 4; k++) await page.selectOption(`.dn-part select[data-i="${k}"]`, ['host', 'org', 'cat', 'area'][k]);
  await page.click('#dn-1'); await page.waitForSelector('.dn-row');
  const dom = await page.$eval('#lab', e => e.dataset.dom);
  await page.locator('.dn-row').filter({ hasNotText: dom }).first().click(); await fbHas('不一樣', '🌐 DNS：點到很像的網址會被擋');
  // 偷看者：http 會被看到密碼
  await page.goto(`${BASE}/11602/network.html?w=6#N7`); await page.click('.stage[data-s="1"]'); await page.waitForSelector('#lab[data-lab]');
  await solveLab(page); await page.waitForSelector('#nx'); await page.click('#nx'); await page.waitForSelector('.sp-m');
  await page.waitForTimeout(1600); await page.click('.sp-m[data-m="http"]'); await page.click('#sp-go');
  ok((await page.textContent('#sp-see')).includes('password='), '🕵️ 偷看者：http 送出看得到密碼'); await passCool(page);
  await page.click('.sp-m[data-m="https"]'); await page.click('#sp-go'); await page.waitForSelector('#nx');
  ok(!(await page.textContent('#sp-see')).includes('password='), '🕵️ 偷看者：https 只看到亂碼');
  // 手機寬度：每個實驗站都沒有橫向捲動
  const m = await context.newPage(); await m.setViewportSize({ width: 375, height: 800 });
  for (const [id, s] of [['N1', 1], ['N2', 1], ['N3', 1], ['N4', 1], ['N5', 2], ['N6', 1], ['N7', 1], ['N8', 1], ['N9', 1], ['N10', 1], ['N10', 2]]) {
    await m.goto(`${BASE}/11602/network.html?mm=${id}${s}#${id}`); await m.click(`.stage[data-s="${s}"]`); await m.waitForSelector('#lab[data-lab]'); await m.waitForTimeout(300);
    const w = await m.evaluate(() => document.documentElement.scrollWidth); ok(w <= 375, '📱 手機 ' + id + ' 實驗站沒有橫向捲動', w);
  }
  await m.close();
}

/* ── 防亂猜與強化：📖 小卡、🧊 冷靜一下（離開畫面重算）、🩹 修復站 ── */
{
  await page.goto(`${BASE}/11602/network.html?r=9#N4`); await page.click('.stage[data-s="0"]');
  await page.waitForSelector('.gopt');
  await page.click('#peek'); await page.waitForSelector('#peek-box');
  ok((await page.textContent('#peek-box')).includes('IPv4'), '📖 小卡：不離開關卡就能看概念');
  await page.click('#peek-x');
  // 第 1 次答錯（答太快）→ 冷靜一下；中途離開畫面 → 秒數重算
  let sol = await netSolve(page); await netAnswer(page, sol, true);
  await page.waitForSelector('#cool-box');
  ok(await page.$eval('#cool-ok', b => b.disabled), '🧊 冷靜一下：倒數完之前不能繼續');
  await page.waitForTimeout(2300);
  const mid = +(await page.textContent('#cool-n'));
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  const afterBlur = +(await page.textContent('#cool-n')), msg = await page.textContent('#cool-msg');
  ok(mid < 5 && afterBlur === 5 && msg.includes('重算'), '🧊 離開畫面 → 秒數重算', mid, '→', afterBlur);
  await page.waitForTimeout(1500);
  ok(+(await page.textContent('#cool-n')) === 5, '🧊 離開畫面期間不倒數');
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await page.waitForSelector('#cool-ok:not([disabled])', { timeout: 8000 }); await page.click('#cool-ok');
  await page.click('#swap');
  // 再錯兩次 → ❤️ 用完 → 修復站
  for (let t = 0; t < 2; t++) {
    sol = await netSolve(page); await netAnswer(page, sol, true);
    await page.waitForSelector('#fb .note');
    if (await page.$('#swap')) { await passCool(page); await page.click('#swap'); }
  }
  await page.waitForSelector('#nx'); await page.click('#nx');
  await page.waitForSelector('#repair-go');
  ok((await page.textContent('#app')).includes('修復站'), '🩹 愛心用完 → 先進修復站');
  await page.click('#repair-go');
  ok((await page.textContent('.hud')).includes('修復站') && !(await page.$('.hud .hearts')) && (await page.textContent('#app')).includes('💡 提示'), '🩹 修復站：不扣心、題目上方先給提示');
  for (let q = 0; q < 2; q++) {
    sol = await netSolve(page);
    if (q === 0) { await netAnswer(page, sol, true); await page.waitForSelector('#fb .note'); ok(!(await page.$('#cool-box')) && !(await page.$('#swap')), '🩹 修復站答錯：不冷靜、不換題，可以再試'); }
    await netAnswer(page, { ...sol, follow: null }, false);
    await page.waitForSelector('#nx'); await page.click('#nx');
  }
  await page.waitForSelector('#retry');
  ok((await page.textContent('#app')).includes('修復完成'), '🩹 修復完成 → 可以重新挑戰');
  await page.screenshot({ path: SHOTS + 'net-repair.png' });
}

// 凱薩轉盤與位元計算機截圖
await page.goto(`${BASE}/11602/data.html?r=1#D4`); await page.click('.stage[data-s="0"]');
await page.click('[data-d="1"]'); await page.click('[data-d="1"]'); await page.click('[data-d="1"]');
await page.screenshot({ path: SHOTS + 'data-caesar.png', fullPage: true });
await page.fill('#ans', 'XXX'); await page.press('#ans', 'Enter');
await page.waitForFunction(() => document.getElementById('fb').textContent.trim().length > 0);
ok((await page.textContent('#fb')).includes('不對'), 'type 答錯會提示並可重答');
await passCool(page);

/* ── 試算表 ─────────────────────────────── */
await page.goto(`${BASE}/11602/sheet.html`);
await page.waitForSelector('.lvcard');
const ev = await page.evaluate(() => {
  const g = SHEET.makeGrid([['a', 'b'], [1, 'B'], [5, 'A'], [3, 'B'], [8, ''], [null, 'B']]);
  const t = f => { try { return SHEET.fmt(SHEET.evaluate(f, g)); } catch (e) { return e.code; } };
  return {
    sum: t('=SUM(A2:A5)'), avg: t('=AVERAGE(A2:A6)'), cif: t('=COUNTIF(B2:B6,"B")'), gt: t('=COUNTIF(A2:A5,">=5")'),
    cell: t('=COUNTIF(B2:B6,B2)'), ne: t('=COUNTIF(B2:B6,"<>B")'), fw: t('＝ＳＵＭ（A2:A3）'), name: t('=SUMM(A2:A3)'),
    div: t('=A2/0'), arith: t('=(A2+A3)*2/4'), counta: t('=COUNTA(B2:B6)'), pct: t('=50%*A5')
  };
});
console.log(JSON.stringify(ev));
ok(ev.sum === '17' && ev.avg === '4.25' && ev.cif === '3' && ev.gt === '2' && ev.cell === '3' && ev.ne === '2' && ev.fw === '6' &&
   ev.name === '#NAME?' && ev.div === '#DIV/0!' && ev.arith === '3' && ev.counta === '4' && ev.pct === '4', '公式計算');

const SL = priv('11602/content/sheet.js').SHEET_LEVELS;
async function fill(cell, f) {
  await page.click(`td[data-ref="${cell}"]`);
  await page.fill('#fx', f); await page.press('#fx', 'Enter');
}
for (let i = 0; i < SL.length; i++) {
  const lv = SL[i];
  await page.click(`.lvcard[data-i="${i}"]`);
  if (lv.clean) {
    if (i === 3) {   // 先故意全部判「沒問題」扣一顆心
      await page.click('#check'); await page.waitForSelector('#fb .note');
      ok((await page.textContent('#fb')).includes('判斷得不對'), 'T4 清理檢查會擋');
    }
    for (const [r, v] of Object.entries(lv.clean.issues)) await page.selectOption(`select.issue[data-r="${r}"]`, v);
    await page.click('#check');
    await page.waitForFunction(() => document.getElementById('fb').textContent.includes('清理完成'), null, { timeout: 8000 }).catch(() => {});
    ok((await page.textContent('#fb')).includes('清理完成'), 'T4 清理通過');
  }
  if (i === 1) {   // 寫死數字要被擋
    await fill(lv.targets[0].cell, '=5');
    await page.click('#check'); await page.waitForSelector('#fb .note');
    ok((await page.textContent('#fb')).includes('不要直接打答案'), 'T2 寫死數字被擋');
  }
  for (const t of lv.targets) await fill(t.cell, t.ref);
  if (i === 0) await page.screenshot({ path: SHOTS + 'sheet-T1.png', fullPage: true });
  await page.click('#check');
  await page.waitForSelector('.end-star');
  const s = await page.$eval('.end-star .stars', e => e.getAttribute('aria-label'));
  ok(s.startsWith(i === 1 || i === 3 ? '2' : '3'), 'sheet', lv.id, s);
  if (i === 3) await page.screenshot({ path: SHOTS + 'sheet-T4-end.png', fullPage: true });
  await page.click('#menu');
}
// T4 清理畫面截圖
await page.click('.lvcard[data-i="3"]');
await page.screenshot({ path: SHOTS + 'sheet-T4.png', fullPage: true });

/* ── 密碼特務（🎲 隨機出題，⭐ 三星三階）──────── */
// 解題機器人（labs2_solver.mjs 的 cipherAnswer）：只看畫面上的題目算答案，不讀任何答案資料
await page.goto(`${BASE}/11602/cipher.html`);
await page.waitForSelector('.lvcard');
ok((await page.$$('.lvcard.locked')).length === 5, '密碼特務：一開始只開放第 1 關');
// 隨機：同一關連開兩次，題目應該不一樣
const firstQs = async () => { await page.click('.lvcard[data-i="0"]'); await page.click('.stage[data-s="0"]'); return page.textContent('.qcard .txt'); };
const q1 = await firstQs(); await page.goto(`${BASE}/11602/cipher.html`); await page.waitForSelector('.lvcard');
const q2 = await firstQs(); await page.goto(`${BASE}/11602/cipher.html`); await page.waitForSelector('.lvcard');
const q3 = await firstQs();
ok(new Set([q1, q2, q3]).size >= 2, '密碼特務：每次開始題目都隨機', q1, q2, q3);
await page.goto(`${BASE}/11602/cipher.html`); await page.waitForSelector('.lvcard');
const CL = priv('11602/content/cipher.js').CIPHER_LEVELS;
ok(CL.every(l => l.stages && l.stages.length === 3), '密碼特務六關都是三星三階');
for (let i = 0; i < CL.length; i++) {
  await page.click(`.lvcard[data-i="${i}"]`); await page.click('.stage[data-s="0"]');
  let wrongDone = i !== 2;
  for (let s = 0; s < 3; s++) {
    if (s > 0) await page.click('#up');
    for (let guard = 0; guard < 40 && !(await page.$('.end-star')); guard++) {
      await page.waitForSelector('#ans:not([disabled])');
      if (!wrongDone) {          // K3 先故意答錯一次：扣心、不公布答案
        await page.fill('#ans', 'ZZZZZZ'); await page.press('#ans', 'Enter'); await page.waitForSelector('#fb .note');
        const fb = await page.textContent('#fb'); ok(fb.includes('不對') && !/→/.test(fb), '密碼特務答錯：扣心、不給答案'); wrongDone = true; await passCool(page);
      }
      const a = await cipherAnswer(page);
      if (a == null) throw new Error('密碼解題器不認得：' + await page.textContent('.qcard'));
      await page.fill('#ans', a); await page.press('#ans', 'Enter');
      await page.waitForSelector('#nx', { timeout: 5000 }).catch(async () => { throw new Error('密碼題答不對：' + (await page.textContent('.qcard')) + ' → ' + a); });
      await page.click('#nx');
      await page.waitForTimeout(50);
    }
    const got = await page.$eval('.end-star .stars', e => e.getAttribute('aria-label'));
    ok(got.startsWith(String(s + 1)), 'cipher', CL[i].id, '第', s + 1, '階 →', got);
  }
  if (i === 5) await page.screenshot({ path: SHOTS + 'cipher-end.png', fullPage: true });
  await page.click('#menu');
}
await page.click('.lvcard[data-i="5"]'); await page.click('.stage[data-s="2"]');
await page.screenshot({ path: SHOTS + 'cipher-K6.png', fullPage: true });

console.log('errors', errors);
ok(errors.length === 0, '沒有頁面錯誤');
await browser.close();
process.exit(bad ? 1 : 0);
