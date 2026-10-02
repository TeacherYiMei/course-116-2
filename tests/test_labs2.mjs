// 🧪 資料偵探 D1～D3、多媒體 M1～M4、AI 前導關 A1～A6 的實驗站：做錯會被擋下並說明原因，做對才過；手機版不破版
import { launch, login, BASE, SHOTS, passCool, lastLab, gas } from './harness.mjs';
import { solveLab2 } from './labs2_solver.mjs';
import fs from 'fs'; fs.mkdirSync(SHOTS, { recursive: true });
const { browser, context } = await launch({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const errors = []; let bad = 0;
page.on('pageerror', e => errors.push(e.message));
page.on('dialog', d => d.accept());
const ok = (c, ...m) => { if (!c) bad++; console.log(c ? '  ✔' : '  ✘', ...m); };
await page.goto(BASE + '/11602/hub.html'); await login(page, '905', '9', '實驗生');

const open = async (id, s, q = 0) => {   // 直接打開某一關的第 s 階（先把前一階記成通過）
  const pg = id[0] === 'D' ? 'data' : 'media';
  await page.goto(`${BASE}/11602/${pg}.html?o=${id}${s}${q}#${id}`);
  await page.evaluate(([m, id]) => STORE.saveLevel(m, id, { stars: 3 }), [pg, id]);
  await page.goto(`${BASE}/11602/${pg}.html?p=${id}${s}${q}#${id}`);
  await page.click(`.stage[data-s="${s}"]`); await page.waitForSelector('#lab > div'); await page.waitForTimeout(1600);
};
const fb = async t => { await page.waitForSelector('#fb .note:not(.warn)', { timeout: 8000 }).catch(() => {}); return (await page.textContent('#fb')).includes(t); };   // 伺服器判斷：等回覆
const ds = () => page.$eval('#lab', e => ({ ...e.dataset }));
const done = async (id, s) => { await solveLab2(page); await page.waitForSelector('#nx', { timeout: 6000 }).then(() => ok(true, id, ['', '操作', '挑戰'][s], '照規則做對 → 通過')).catch(async () => ok(false, id, s, await page.textContent('#fb'))); };

/* D1 資料 → 資訊：結論和算出來的資訊不一致 */
await open('D1', 1);
{ const d = JSON.parse((await ds()).d), fever = d.temps.filter(t => t >= 37.5).length;
  await page.fill('.di-n[data-k="fever"]', String(fever)); await page.fill('.di-n[data-k="max"]', String(d.temps.indexOf(Math.max(...d.temps)) + 1));
  await page.click(`.di-yn[data-k="act"][data-v="${fever ? 'n' : 'y'}"]`); await page.click('#di-ok');
  ok(await fb('結論和你算出來的資訊對不上'), '🔎 D1：結論和資訊不一致 → 擋下'); await passCool(page);
  await page.screenshot({ path: SHOTS + 'lab2-D1.png', fullPage: true }); await done('D1', 1); }
/* D2 挑戰：把雜訊留著 */
await open('D2', 2);
{ const rows = JSON.parse((await ds()).rows);
  for (let i = 0; i < rows.length; i++) await page.click(`.cl-a[data-i="${i}"][data-a="keep"]`);
  await page.click('#cl-ok'); ok(await fb('不可能') || await fb('漏登') || await fb('寫法'), '🧹 D2：全部保留 → 指出第一個有問題的'); await passCool(page);
  await page.screenshot({ path: SHOTS + 'lab2-D2.png', fullPage: true }); await done('D2', 2); }
/* D3 基本：開頭是黑色卻沒寫 0 */
await open('D3', 1);
{ const rows = JSON.parse((await ds()).rows);
  await page.fill('.rl-in[data-i="0"]', '1,1'); await page.fill('.rl-in[data-i="1"]', '1,1'); await page.fill('#rl-cnt', '4'); await page.click('#rl-ok');
  ok(await fb('編碼不對'), '🗜️ D3：編碼錯 → 說明格數不對', rows[0].join('')); await passCool(page); await done('D3', 1); }
await open('D3', 2); await page.screenshot({ path: SHOTS + 'lab2-D3.png', fullPage: true }); await done('D3', 2);

/* M1～M4 */
await open('M1', 2); await page.screenshot({ path: SHOTS + 'lab2-M1.png', fullPage: true }); await done('M1', 2);
await open('M2', 1);
{ const S = lastLab().sec, ks = S.order.map((_, k) => k).sort((a, b) => S.order[b] - S.order[a]); for (const k of ks) await page.click(`.fb-f[data-k="${k}"]`);   // 倒過來排（畫面上的順序是打亂的，真正順序只有伺服器知道）
  await page.fill('#fb-fps', '12'); await page.click('#fb-ok'); ok(await fb('順序不對'), '🎞️ M2：畫面倒過來排 → 球會跳來跳去'); await passCool(page);
  await page.screenshot({ path: SHOTS + 'lab2-M2.png', fullPage: true }); await done('M2', 1); }
await open('M3', 1);
{ const clips = lastLab().sec.clips;   // 哪一段是畫面、聲音只有伺服器知道
  for (const c of clips) { await page.click(`.tl-clip[data-c="${c.id}"]`); await page.click(`.tl-lab[data-t="${c.kind === 'audio' ? 'A1' : c.kind === 'base' ? 'V2' : 'V1'}"]`); }
  await page.click('#tl-ok'); ok(await fb('蓋住'), '🎚️ M3：全景影片放上層 → 會把其他畫面蓋住'); await passCool(page);
  await page.screenshot({ path: SHOTS + 'lab2-M3.png', fullPage: true }); await done('M3', 1); }
await open('M4', 2);
{ const s = JSON.parse((await ds()).s); for (const m of s.mats) await page.click(`.lc-a[data-m="${m.id}"][data-a="credit"]`);
  await page.click('#lc-ok'); ok(await fb('判斷得不對'), '📜 M4：全部選「標示作者就能用」→ 擋下（商業＋改作）'); await passCool(page); await done('M4', 2); }

/* A1～A6 */
await open('A1', 1);
{ const n = +(await ds()).n; for (let i = 0; i < n; i++) { await page.click(`.bb-tab[data-i="${i}"]`); await page.click('.bb-k[data-k="learn"]'); }
  await page.click('#bb-ok'); await page.waitForSelector('#fb .note'); ok((await page.textContent('#fb')).includes('還沒做完實驗'), '🤖 A1：沒做實驗就判斷 → 要先教再測');
  await page.screenshot({ path: SHOTS + 'lab2-A1.png', fullPage: true }); await done('A1', 1); }
await open('A2', 2);
{ const pool = JSON.parse((await ds()).pool), noBig = pool.map((p, i) => [p, i]).filter(([p]) => !(p.a === 'cat' && p.size >= 8));
  for (const [, i] of noBig.slice(0, 5)) await page.click(`.tr-p[data-k="${i}"]`);
  await page.click('#tr-run'); await page.click('#tr-ok');
  ok(await fb('猜錯了'), '🐱 A2 挑戰：資料集沒有大型貓 → AI 猜錯'); await passCool(page);
  for (const [, i] of noBig.slice(0, 5)) await page.click(`.tr-p[data-k="${i}"]`);   // 取消
  await page.screenshot({ path: SHOTS + 'lab2-A2.png', fullPage: true }); await done('A2', 2); }
await open('A3', 1);
{ await page.click('.ra-b[data-b="pick"]'); await page.click('#ra-ok');
  ok(await fb('沒有東西可以拿'), '🤖 A3：原地拿起 → 這一格沒有東西'); await passCool(page); await page.click('#ra-clr'); await done('A3', 1); }
await open('A3', 2); await page.screenshot({ path: SHOTS + 'lab2-A3.png', fullPage: true });
{ const m = JSON.parse((await ds()).map); ok(m.limit > 0, '🤖 A3 挑戰：積木有上限', m.limit); await done('A3', 2); }
await open('A4', 2); await page.screenshot({ path: SHOTS + 'lab2-A4.png', fullPage: true }); await done('A4', 2);
await open('A5', 2);
{ await solveLab2(page).catch(() => {}); }   // 先照規則做一遍（會通過）；再開一題測「照抄 AI 原句」
await open('A5', 2, 1);
{ const s = JSON.parse((await ds()).s);
  const r = { who: s.WHO.indexOf(s.who), tone: s.TONE.indexOf(s.tone), k: s.drafts.map(x => gas.ctx.SV._ai.judgeDraft(x, s.feat, s.lim)) };
  for (const [k, v] of [['who', r.who], ['feat', s.fopts.indexOf(s.feat)], ['tone', r.tone], ['lim', 0]]) await page.click(`.pl-s[data-s="${k}"][data-k="${v}"]`);
  for (const [i, v] of r.k.entries()) await page.click(`.pl-k[data-i="${i}"][data-k="${v}"]`);
  await page.fill('#pl-mine', s.drafts[r.k.indexOf('ok')]); await page.click('#pl-ok');
  ok(await fb('AI 的原句'), '🔍 A5 挑戰：照抄 AI 的草稿 → 要改成自己的');
  await page.screenshot({ path: SHOTS + 'lab2-A5.png', fullPage: true }); }
await open('A6', 2);
{ const imgs = JSON.parse((await ds()).imgs); for (let i = 0; i < imgs.length; i++) await page.click(`.fk-i[data-i="${i}"]`);
  await page.click('#fk-ok'); ok(await fb('其實沒有破綻'), '🕵️ A6：全部都點 → 有些其實沒問題'); await passCool(page);
  for (let i = 0; i < imgs.length; i++) await page.click(`.fk-i[data-i="${i}"]`);
  await page.screenshot({ path: SHOTS + 'lab2-A6.png', fullPage: true }); await done('A6', 2); }

/* 📱 手機寬度：每個實驗站都不能讓整頁左右捲動 */
await page.setViewportSize({ width: 390, height: 800 });
for (const id of ['D1', 'D2', 'D3', 'M1', 'M2', 'M3', 'M4', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6']) for (const s of [1, 2]) {
  await open(id, s);
  const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (over > 2) ok(false, '📱', id, s, '超出寬度', over);
}
ok(true, '📱 手機寬度檢查完成');
await page.screenshot({ path: SHOTS + 'lab2-mobile-A6.png', fullPage: true });

console.log('errors', errors);
await browser.close();
if (bad || errors.length) process.exit(1);
