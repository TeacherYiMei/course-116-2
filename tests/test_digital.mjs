import { launch, login, BASE, SHOTS } from './harness.mjs';
import fs from 'fs';
const REVIEW = JSON.parse(fs.readFileSync(new URL('../private/11601/digital/review.json', import.meta.url))); fs.mkdirSync(SHOTS, { recursive: true });
const { browser, context } = await launch();
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto(BASE + '/11601/hub.html');
await login(page);
for (const u of ['1', '2']) {
  await page.goto(BASE + `/11601/digital/${u}.html`);
  await page.waitForSelector('#ucards .ucard.on');
  // 對錯封存在 data-k，測試改從 private/11601/digital/review.json 讀；u=1 先按一個錯的
  const rv = REVIEW[u];
  const btns = await page.$$('button[onclick*="answerReview"]');
  const labels = await page.$$eval('button[onclick*="answerReview"]', bs => bs.map(b => b.textContent.replace(/\s+/g, '')));
  const isOk = i => rv.find(x => x.label.replace(/\s+/g, '') === labels[i]).ok;
  if (u === '1') {
    const w = labels.findIndex((_, i) => !isOk(i));
    await btns[w].click();
    await page.waitForFunction(() => document.getElementById('review-feedback').innerText.startsWith('💡'));
    console.log('wrong hint:', await page.textContent('#review-feedback'));
  }
  for (let i = 0; i < btns.length; i++) if (isOk(i)) await btns[i].click();
  await page.waitForFunction(() => document.getElementById('review-score').innerText.startsWith('3'));
  await page.waitForTimeout(300);
  console.log('unit', u, 'badge visible:', await page.isVisible('#review-badge'), 'rec:', JSON.stringify(await page.evaluate(k => STORE.level('digital', 'u' + k), u)));
}
/* ── 🧪 實驗任務：每課三項，完成一項 1⭐（x1～x4） ── */
const labStars = u => page.evaluate(k => (STORE.level('digital', 'x' + k) || {}).stars || 0, u);
let lfail = 0; const lok = (c, m) => { console.log((c ? '  ✔ ' : '  ✘ ') + m); if (!c) lfail++; };
await page.goto(BASE + '/11601/digital/1.html'); await page.waitForSelector('#lab-tasks .labtask');
lok((await page.$$('#lab-tasks .labtask')).length === 3, '1-1 顯示三項實驗任務');
await page.evaluate(() => { for (let k = 0; k < 3; k++) { resetBits(); const t = gameLevels[currentLevel]; [16, 8, 4, 2, 1].forEach(v => { const i = bitValues.indexOf(v); if ((t & v) && bitStates[i] === 0) toggleBit(i, v); }); nextLevel(); } });
await page.waitForTimeout(200);
lok(await labStars(1) === 1 && (await page.textContent('#lab-stars')).startsWith('1'), '1-1 位元燈泡拼出 3 個目標數字 → 1⭐');
await page.goto(BASE + '/11601/digital/2.html'); await page.waitForSelector('#lab-tasks .labtask');
await page.fill('#cipher-input-text', 'ABC'); await page.evaluate(() => runMultiCodec());
lok(await labStars(2) === 0, '1-2 只輸入英文，編碼任務還沒完成');
await page.fill('#cipher-input-text', 'Hi 你好'); await page.evaluate(() => runMultiCodec());
lok(await labStars(2) === 1, '1-2 中英混合比較三種編碼 → 1⭐');
await page.goto(BASE + '/11601/digital/3.html'); await page.waitForSelector('#lab-tasks .labtask');
await page.evaluate(() => { for (const id of ['range-sampling', 'range-quantize']) for (const v of ['min', 'max']) { const el = document.getElementById(id); el.value = el[v]; el.dispatchEvent(new Event('input')); } });
lok(await labStars(3) === 1, '1-3 取樣、量化都拉到最少和最多 → 1⭐');
await page.goto(BASE + '/11601/digital/4.html'); await page.waitForSelector('#lab-tasks .labtask');
await page.click('#sub-image-compress'); await page.waitForTimeout(400);
await page.click('#btn-comp-color');   // 切到這一步時會自動顯示原圖（raw）
lok(await labStars(4) === 0, '1-4 壓縮只試了兩種，還沒完成');
await page.click('#btn-comp-size');
lok(await labStars(4) === 1, '1-4 三種壓縮都試過 → 1⭐');
await page.screenshot({ path: SHOTS + 'digital-lab.png' });
if (lfail) process.exitCode = 1;

await page.goto(BASE + '/11601/digital/index.html');
await page.waitForSelector('#ucards .ucard');
const prog = await page.$$eval('#ucards .ucard .pg', e => e.map(x => x.textContent.replace(/\s+/g, '')));
console.log('unit cards:', prog);
if (!(prog[0].includes('3/6') && prog[1].includes('4/6') && prog[2].includes('1/6') && prog[3].includes('1/6'))) { console.log('✘ 課程小卡進度不對'); process.exitCode = 1; }
console.log('topbar back:', await page.getAttribute('#topbar .back', 'href'), 'unit color:', await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--unit').trim()));
await page.screenshot({ path: SHOTS + 'digital-index.png' });
await page.goto(BASE + '/11601/hub.html');
await page.waitForTimeout(1200);
{ // 闖關地圖：稱號看「平均完成度」＝各單元完成 % 的平均（5016B 不算）
  const want = await page.evaluate(() => { const M = CONFIG.MODULES.filter(m => m.maxStars); const st = m => m.parts ? m.parts.reduce((a, p) => a + STORE.partStars(p), 0) : STORE.moduleStars(m.id); return Math.floor(M.reduce((a, m) => a + st(m) / m.maxStars, 0) / M.length * 100); });
  const shown = await page.textContent('#avg-pct');
  lok(shown === want + '%' && want > 0, '闖關地圖顯示平均完成度 ' + shown);
  if (lfail) process.exitCode = 1;
}
await page.screenshot({ path: SHOTS + 'hub.png', fullPage: true });
console.log('errors', errors);
await browser.close();
