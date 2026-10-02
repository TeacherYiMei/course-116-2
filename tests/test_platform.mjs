// 單元三「系統平臺大冒險」：⭐ 三星三階（基礎題庫 → 🧪 實驗站 → 🧪 實驗站挑戰版）
import { launch, login, BASE, SHOTS, priv, passCool, lastLab, gas } from './harness.mjs';
import { solvePfLab } from './pf_solver.mjs';
import fs from 'fs'; fs.mkdirSync(SHOTS, { recursive: true });
const { browser, context } = await launch({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const errors = []; let bad = 0;
page.on('pageerror', e => errors.push(e.message));
page.on('dialog', d => d.accept());
const ok = (c, ...m) => { if (!c) bad++; console.log(c ? '  ✔' : '  ✘', ...m); };
await page.goto(BASE + '/11601/hub.html');
await login(page);
await page.goto(BASE + '/11601/platform.html?r=2');
await page.waitForSelector('.lvcard');
await page.screenshot({ path: SHOTS + 'pf-menu.png', fullPage: true });
const levels = priv('11601/content/platform.js').PF_LEVELS;   // 正解從 private 讀
ok(levels.every(l => l.stages && l.stages.length === 3 && l.stages[1].rounds.every(r => r.type === 'lab') && l.stages[2].rounds.some(r => r.hard)), '八關都是三星三階：操作＝實驗站、挑戰＝實驗站較難版');

async function playSealed(rd, wrong) {
  if (rd.type === 'sort') {
    const n = rd.pick || rd.items.length;
    for (let k = 0; k < n; k++) {
      const txt = (await page.textContent('.qcard .txt')).trim();
      const it = rd.items.find(x => x.t === txt);
      if (wrong.left > 0) {        // 故意答錯：扣一顆心；桶子 ≤3 個會換一張卡
        wrong.left--;
        await page.click(`.bucket[data-b="${rd.buckets.find(x => x.id !== it.a).id}"]`);
        await page.waitForSelector('#fb .note');
        if (await page.$('#nx')) { await page.click('#nx'); return 'over'; }
        await passCool(page);
        if (await page.$('#swap')) { await page.click('#swap'); k--; continue; }
      }
      await page.click(`.bucket[data-b="${it.a}"]`);
      await page.click('#nx');
    }
  } else if (rd.type === 'order') {
    for (const [k, it] of rd.items.entries()) { await page.click(`.order-btn[data-t="${it.t}"]`); await page.waitForFunction(n => document.querySelectorAll('.order-btn.right').length >= n, k + 1); }
    await page.click('#nx');
  } else if (rd.type === 'build') {
    for (const cu of rd.customers) {
      const pick = await page.evaluate(([rd, cu]) => {   // 找一組合格的：暴力搜尋
        const combos = [[]];
        for (const s of rd.slots) { const nxt = []; for (const c of combos) for (const o of s.options) nxt.push([...c, [s.id, o]]); combos.length = 0; combos.push(...nxt); }
        for (const c of combos) {
          const chosen = Object.fromEntries(c); const props = { price: (rd.base ? rd.base.price : 0) };
          for (const [, o] of c) { if (o.price) props.price += o.price; for (const k in o) if (!['id', 'label', 'price'].includes(k)) props[k] = o[k]; }
          const bad = cu.rules.some(r => r.sum ? props[r.sum] > r.max : r.pick ? chosen[r.pick].id !== r.is : ((r.min != null && !(props[r.prop] >= r.min)) || (r.eq != null && props[r.prop] !== r.eq)));
          if (!bad) return c.map(([s, o]) => [s, o.id]);
        }
        return null;
      }, [rd, cu]);
      if (!pick) throw new Error('no valid build for ' + cu.who);
      for (const [s, o] of pick) await page.click(`.opt[data-s="${s}"][data-o="${o}"]`);
      await page.click('#submit');
      await page.click('#nx');
    }
  }
}
async function playRounds(rounds, wrong) {
  for (const rd of rounds) {
    if (rd.type === 'lab') {
      for (let q = 0; q < (rd.n || 1); q++) {
        await solvePfLab(page);
        await page.waitForSelector('#nx', { timeout: 8000 }).catch(async () => { throw new Error('🧪 ' + rd.lab + ' 沒過：' + (await page.textContent('#fb'))); });
        await page.click('#nx');
      }
    } else if (await playSealed(rd, wrong) === 'over') return 'over';
  }
}
async function playLevel(i, mistakes = 0) {
  const lv = levels[i], wrong = { left: mistakes };
  await page.click(`.lvcard[data-i="${i}"]`);
  await page.click('.stage[data-s="0"]');
  for (let s = 0; s < 3; s++) {
    if (s > 0) await page.click('#up');
    if (await playRounds(lv.stages[s].rounds, wrong) === 'over') return 'over';
    await page.waitForSelector('.end-star');
    const got = await page.$eval('.end-star .stars', e => e.getAttribute('aria-label'));
    ok(got.startsWith(String(s + 1)), lv.id, '第', s + 1, '階通過 →', got);
  }
  if (i === 3) await page.screenshot({ path: SHOTS + 'pf-end.png' });
  await page.click('#menu');
  return 'done';
}
for (let i = 0; i < levels.length; i++) console.log(levels[i].id, await playLevel(i, i === 1 ? 1 : 0));
ok(await page.evaluate(() => STORE.moduleStars('platform')) === 24, '八關全破 → 24 顆星');

/* ── 🧪 實驗站：錯誤操作會被擋下（扣心但保留畫面），截圖 ── */
const open = async (id, s, q = 1) => { await page.goto(`${BASE}/11601/platform.html?t=${id}${s}${q}#${id}`); await page.click(`.stage[data-s="${s}"]`); await page.waitForSelector('#lab > div'); await page.waitForTimeout(1600); };
const fbHas = async t => { await page.waitForSelector('#fb .note', { timeout: 8000 }).catch(() => {}); return (await page.textContent('#fb')).includes(t); };   // 伺服器判斷：等回覆
const heartsLeft = () => page.$$eval('.hud .heart.full, .hud .h-on', e => e.length).catch(() => -1);

await open('G2', 1);
{ const steps = lastLab().sec.steps;   // 步驟順序只有伺服器知道
  await page.click('.fu-u[data-u="alu"]');   // 第一步就去計算 → 不對
  ok(await fbHas('輸入'), '🏭 五大單元：資料還沒輸入就計算 → 擋下', steps.length);
  await passCool(page); await page.screenshot({ path: SHOTS + 'pf-lab-five.png' });
  await solvePfLab(page); await page.waitForSelector('#nx'); ok(true, '🏭 照順序走完、算對 → 通過'); }

await open('G3', 1);
{ const items = JSON.parse(await page.$eval('#lab', e => e.dataset.items));
  const low = items.map((_, i) => i).sort((a, b) => items[a].n - items[b].n);   // 故意把最少用的放快取
  for (const [k, i] of low.entries()) await page.click(`.mp-b[data-i="${i}"][data-l="${k < 2 ? 'cache' : k < 5 ? 'ram' : 'disk'}"]`);
  await page.click('#mp-ok');
  ok(await fbHas('還可以更快'), '📦 記憶體：常用的放慢的地方 → 算出總時間、要求最佳');
  await page.screenshot({ path: SHOTS + 'pf-lab-mem.png' }); }
await open('G3', 2);
{ const items = JSON.parse(await page.$eval('#lab', e => e.dataset.items)), k = items.findIndex(x => x.keep);
  ok(k >= 0, '📦 挑戰：有一筆「關機後要留著」');
  for (let i = 0; i < items.length; i++) await page.click(`.mp-b[data-i="${i}"][data-l="${i === k ? 'cache' : 'disk'}"]`);
  await page.click('#mp-ok'); ok(await fbHas('關機就消失'), '📦 挑戰：要留著的放快取 → 關機就消失'); }

await open('G4', 1);
{ await page.click('.pc-o[data-k="cpu"][data-id="c16"]'); await page.click('.pc-o[data-k="ram"][data-id="r32"]'); await page.click('.pc-o[data-k="disk"][data-id="s2"]');
  await page.click('#pc-ok'); ok(await fbHas('超出預算'), '🔧 組裝：全部買最好的 → 超出預算');
  await page.screenshot({ path: SHOTS + 'pf-lab-pc.png' }); }

await open('G5', 1);
{ await page.click('#om-os'); ok(await fbHas('作業系統不能關'), '🧑‍💼 總管：關作業系統 → 擋下'); await passCool(page);
  const st = JSON.parse(await page.$eval('#lab', e => e.dataset.state)), w = st.run.findIndex(p => !p.saved);
  for (let i = 0; i < st.run.length; i++) await page.click(`.om-x[data-i="${i}"]`);   // 全部關（沒存檔就關）
  await page.click('#om-go'); ok(await fbHas('作業不見'), '🧑‍💼 總管：沒存檔就關 → 作業不見（救回來）'); await passCool(page);
  await page.screenshot({ path: SHOTS + 'pf-lab-os.png' });
  await open('G5', 1, 2);   // 前面已經扣兩顆心，換一題再試「關太多」
  const st2 = JSON.parse(await page.$eval('#lab', e => e.dataset.state));
  for (let i = 0; i < st2.run.length; i++) { if (!st2.run[i].saved) await page.click(`.om-save[data-i="${i}"]`); await page.click(`.om-x[data-i="${i}"]`); }
  await page.click('#om-go'); ok(await fbHas('其實不用關'), '🧑‍💼 總管：存檔後全部關掉 → 要求只關需要的'); }

await open('G6', 1);
{ await page.click('.dr-t[data-t="task"]'); await page.click('.dr-end[data-i="0"]'); await page.click('#dr-ok');
  ok(await fbHas('系統程式'), '🚑 急診室：結束系統程式 → 擋下'); await passCool(page);
  await page.screenshot({ path: SHOTS + 'pf-lab-dr.png' }); }

await open('G7', 1);
{ const line = await page.$eval('#lab', e => e.dataset.line);
  ok(!(await page.$eval('#lab', e => 'svc' in e.dataset)), '🍕 披薩店：答案不放在畫面資料裡');
  await page.click('.cz-s[data-s="iaas"]'); for (let i = 0; i < 5; i++) await page.click(`.cz-w[data-i="${i}"][data-w="cloud"]`);
  await page.click('#cz-ok'); ok(await fbHas('不適合') || await fbHas('標錯'), '🍕 選錯服務或層 → 擋下', line);
  await page.screenshot({ path: SHOTS + 'pf-lab-cloud.png' }); }

await open('G8', 2);
{ const S = lastLab().sec, d = gas.ctx.SV._pf.DEVS[S.di], sp = { s: d.s, op: d.op, v: S.v, a: d.a, mode: S.mode };   // 規格只有伺服器知道
  await page.selectOption('#em-s', sp.s); await page.selectOption('#em-o', sp.op); await page.fill('#em-n', String(sp.v)); await page.selectOption('#em-a', sp.a);
  await page.click('#em-run'); await page.waitForSelector('.em-t');
  const res = await page.$$eval('.em-t', e => e.length);
  ok(res >= 7 && (sp.mode === 'inv' ? await page.$('#nx') : await fbHas('測試沒過')), '🔌 挑戰：' + sp.mode + ' 條件照抄數字 →', sp.mode === 'inv' ? '（反過來說照抄剛好對）' : '邊界測試抓出來');
  await page.screenshot({ path: SHOTS + 'pf-lab-emb.png' }); }

await open('G1', 1);
await page.screenshot({ path: SHOTS + 'pf-lab-pb.png' });

/* ── 基礎階：答錯 3 次 → 修復站 ── */
await page.goto(BASE + '/11601/platform.html?r=3');
await page.waitForSelector('.lvcard');
ok(await playLevel(6, 3) === 'over' && !!(await page.waitForSelector('#repair-go', { timeout: 3000 }).catch(() => null)), 'G7 基礎階答錯 3 次 → ❤️ 用完 → 修復站');

/* ── 手機：每個實驗站都沒有橫向捲動 ── */
const m = await context.newPage(); await m.setViewportSize({ width: 375, height: 760 });
for (const id of ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8']) for (const s of [1, 2]) {
  await m.goto(`${BASE}/11601/platform.html?mm=${id}${s}#${id}`); await m.click(`.stage[data-s="${s}"]`); await m.waitForSelector('#lab > div'); await m.waitForTimeout(250);
  const w = await m.evaluate(() => document.documentElement.scrollWidth);
  ok(w <= 375, '📱', id, '第', s + 1, '階沒有橫向捲動', w);
  if (s === 1) await m.screenshot({ path: SHOTS + `pf-lab-${id}-m.png`, fullPage: true });
}
console.log('errors', errors);
await browser.close();
if (bad || errors.length) process.exit(1);
