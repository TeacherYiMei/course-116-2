// 📴 連不上驗證伺服器 → 練習模式：可以看題目、作答，但不判斷、不記星；出題器、實驗站要連線
import { launch, login, BASE, SHOTS } from './harness.mjs';
import fs from 'fs'; fs.mkdirSync(SHOTS, { recursive: true });
const { browser, context } = await launch({ offline: true });
const page = await context.newPage();
const errors = []; let bad = 0;
page.on('pageerror', e => errors.push(e.message));
page.on('dialog', d => d.accept());
const ok = (c, ...m) => { if (!c) bad++; console.log(c ? '  ✔' : '  ✘', ...m); };
await page.goto(BASE + '/11602/hub.html'); await login(page, '907', '3', '離線生');

/* 互動遊戲 */
await page.goto(BASE + '/11602/network.html'); await page.waitForSelector('.lvcard');
await page.waitForSelector('#net-state .note');
ok((await page.textContent('#net-state')).includes('練習模式'), '選單上方說明「練習模式」');
await page.click('.lvcard[data-i="0"]'); await page.click('.stage[data-s="0"]');
await page.waitForSelector('.bucket');
ok((await page.textContent('.hud')).includes('練習模式') && !(await page.$('.hud .hearts')), '關卡裡：練習模式標籤、沒有 ❤️');
for (let guard = 0; guard < 30 && !(await page.$('#again')); guard++) {
  if (await page.$('.bucket:not([disabled])')) { await page.click('.bucket >> nth=0'); await page.waitForSelector('#fb .note'); if (!guard) ok((await page.textContent('#fb')).includes('不判斷'), '作答後：不判斷對錯'); }
  await page.click('#nx');
}
ok((await page.textContent('#app')).includes('練習完成'), '做完 → 練習完成');
ok(await page.evaluate(() => !STORE.level('network', 'N1')), '練習模式不記星');
await page.screenshot({ path: SHOTS + 'offline-done.png', fullPage: true });
await page.click('#back'); await page.click('.lvcard[data-i="0"]');
await page.evaluate(() => STORE.saveLevel('network', 'N1', { stars: 1 }));
await page.goto(BASE + '/11602/network.html?o=1#N1'); await page.click('.stage[data-s="1"]');
await page.waitForSelector('#app .note.warn');
ok((await page.textContent('#app')).includes('要連上網路才能玩'), '出題器／實驗站回合：說明要連網，可以跳過');

/* 試算表 */
await page.goto(BASE + '/11602/sheet.html#T1'); await page.waitForSelector('td[data-ref]');
await page.waitForFunction(() => document.querySelector('.hud') && document.querySelector('.hud').textContent.includes('練習模式'));
const cell = await page.$eval('td[data-ref]', td => td.dataset.ref);
await page.click(`td[data-ref="${cell}"]`); await page.fill('#fx', '=SUM(B2:B3)'); await page.press('#fx', 'Enter');
await page.click('#check'); await page.waitForSelector('#fb .note');
ok((await page.textContent('#fb')).includes('不判斷'), '試算表：只看公式算出來的值，不判斷對錯');

/* Python */
await page.goto(BASE + '/11601/python.html'); await page.waitForSelector('#engine.ok', { timeout: 60000 });
await page.fill('#code', "name = input('名字：')\nprint('哈囉', name)");
await page.dispatchEvent('#code', 'input');
await page.click('#btn-grade'); await page.waitForSelector('#result .kicker');
ok((await page.textContent('#result')).includes('練習模式'), 'Python：送出評分 → 只跑公開範例、不記星');

console.log('errors', errors);
await browser.close();
if (bad || errors.length) process.exit(1);
