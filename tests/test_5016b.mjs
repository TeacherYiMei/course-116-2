import { launch, login, BASE, SHOTS, priv } from './harness.mjs';
import fs from 'fs'; fs.mkdirSync(SHOTS, { recursive: true });
const { browser, context } = await launch();
const page = await context.newPage();
const errors = []; let bad = 0;
const ok = (c, ...m) => { if (!c) bad++; console.log(c ? '✔' : '✘', ...m); };
page.on('pageerror', e => errors.push(e.message));
await page.goto(BASE + '/11601/hub.html');
await login(page);
await page.goto(BASE + '/11601/5016b.html');
await page.waitForSelector('#sim');
const LA = priv('11601/lab.js').LAB_ANSWERS;
const answers = Object.fromEntries(Object.entries(LA).map(([k, v]) => [k, v.map(x => x.answer)]));
let i = 0;
for (const [sid, ans] of Object.entries(answers)) {
  await page.click(`.tab[data-i="${i}"]`);
  const cards = await page.$$('#checks > .card');
  for (let q = 0; q < ans.length; q++) {
    const c = cards[q];
    if (q === 0 && sid === 'S2') {   // 先答錯一次，再重新預測
      await (await c.$(`.pick[data-k="0"]`)).click();
      await (await c.$('[data-run]')).click();
      await c.waitForSelector('[data-again]');
      console.log('wrong fb:', (await (await c.$('[data-fb]')).textContent()).slice(0, 60));
      await (await c.$('[data-again]')).click();
    }
    await (await c.$(`.pick[data-k="${ans[q]}"]`)).click();
    await (await c.$('[data-run]')).click();
    await c.waitForSelector('[data-fb] .note');
    console.log(sid, q, (await (await c.$('[data-fb]')).textContent()).slice(0, 70).replace(/\s+/g, ' '));
  }
  await page.waitForSelector('#lk-end .note');
  const want = sid === 'S2' ? 2 : 3, got = await page.evaluate(id => (STORE.level('arduino', id) || {}).stars, sid);
  ok(got === want, sid, '過關 →', got + '⭐', sid === 'S2' ? '（預測錯 1 次 → 2⭐）' : '（一次都沒錯 → 3⭐）', (await page.textContent('#lk-end')).slice(0, 40));
  if (sid === 'S2' || sid === 'S1' || sid === 'S3') await page.screenshot({ path: `${SHOTS}5016-${sid}.png`, fullPage: true });
  i++;
}
await page.click('.tab[data-i="4"]');
await page.fill('#p-name', '專注守護燈');
await page.fill('#p-s1', '上課時有人一直靠近門口會分心');
await page.fill('#p-s2', '超音波偵測到有人靠近就亮黃燈');
await page.fill('#p-s3', '把次數上傳雲端找出最常被打擾的時段');
await page.click('#p-make');
await page.waitForSelector('#card-canvas');
await page.screenshot({ path: SHOTS + '5016-S5.png', fullPage: true });
await page.waitForFunction(() => (STORE.level('arduino', 'S5') || {}).stars === 3);
ok(true, 'S5 專題成果卡填完整 → 3⭐');
ok(await page.evaluate(() => STORE.moduleStars('arduino')) === 14, '五節共 14⭐（S2 錯 1 次）');
/* 再挑戰 S2：這次一次都不錯 → 刷新成 3⭐ */
await page.click('.tab[data-i="1"]'); await page.waitForSelector('#checks > .card');
ok(!(await page.$('#lk-again')), '重新進來：檢核重新開始');
{ const cards = await page.$$('#checks > .card');
  for (let q = 0; q < answers.S2.length; q++) { await (await cards[q].$(`.pick[data-k="${answers.S2[q]}"]`)).click(); await (await cards[q].$('[data-run]')).click(); await cards[q].waitForSelector('[data-fb] .note'); }
  await page.waitForSelector('#lk-end .note'); }
ok(await page.evaluate(() => STORE.moduleStars('arduino')) === 15 && !!(await page.evaluate(() => STORE.level('arduino', 'S2').rc)), '再挑戰 S2 一次都沒錯 → 刷新成 3⭐，共 15⭐（附伺服器收據）');
await page.goto(BASE + '/11601/hub.html'); await page.waitForSelector('#hub .card');
ok((await page.textContent('#hub')).includes('⭐ 15 / 15'), '闖關地圖：5016B 顯示 ⭐ 15 / 15、算進平均完成度');
console.log('tabs:', await page.textContent('#tabs').catch(() => ''));
console.log('errors', errors);
await browser.close();
if (bad || errors.length) process.exit(1);
