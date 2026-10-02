// 🏁 課堂挑戰模式：設定組數 → 搶答（答錯鎖住、換別組）→ 答對加分 → 重新整理可以繼續 → 排名；📅 本週任務、🏅 徽章
import { launch, login, BASE, SHOTS } from './harness.mjs';
import { cipherAnswer } from './labs2_solver.mjs';
import fs from 'fs'; fs.mkdirSync(SHOTS, { recursive: true });
const { browser, context } = await launch({ viewport: { width: 1366, height: 800 } });
const page = await context.newPage();
const errors = []; let bad = 0;
page.on('pageerror', e => errors.push(e.message));
page.on('dialog', d => d.accept());
const ok = (c, ...m) => { if (!c) bad++; console.log(c ? '  ✔' : '  ✘', ...m); };
const S = { txt: '.ch-t', sub: '.ch-sub', ans: '.ch-q' };

await page.goto(BASE + '/11602/challenge.html'); await page.waitForSelector('#ch-start');
await page.click('.ch-n[data-n="3"]');
ok((await page.$$('#ch-names input')).length === 3, '選 3 組 → 三個組名');
await page.fill('#ch-names input >> nth=0', '火箭隊');
for (const cb of await page.$$('.ch-topic input')) { const v = await cb.getAttribute('value'); if (v !== '2') await cb.uncheck(); }   // 只留密碼特務
await page.selectOption('#ch-total', '5');
await page.click('#ch-start'); await page.waitForSelector('.ch-card');
ok((await page.$$('.ch-team')).length === 3 && (await page.textContent('.ch-board')).includes('火箭隊'), '記分板：三組、自訂組名');
await page.screenshot({ path: SHOTS + 'challenge-q.png', fullPage: true });

// 第 1 題：第 2 組答錯（鎖住）→ 第 1 組答對（＋10、搶快＋5）
await page.keyboard.press('2'); await page.waitForSelector('#ch-in');
await page.fill('#ch-in', 'ZZZZ'); await page.click('#ch-judge'); await page.waitForSelector('#fb .note');   // 伺服器判斷：等回覆
ok((await page.textContent('#fb')).includes('答錯') && await page.$eval('.ch-team[data-i="1"]', b => b.disabled), '答錯：這一組這題鎖住，換別組');
await page.click('.ch-team[data-i="0"]'); const a = await cipherAnswer(page, S);
await page.fill('#ch-in', a); await page.click('#ch-judge'); await page.waitForSelector('#fb .note.ok');
ok((await page.textContent('#fb')).includes('答對') && (await page.textContent('.ch-team[data-i="0"] .ch-score')).startsWith('15'), '答對：＋10，搶快再＋5', a);
await page.screenshot({ path: SHOTS + 'challenge-ok.png', fullPage: true });
await page.click('#ch-next');

// 重新整理：可以繼續上一場
await page.reload(); await page.waitForSelector('#ch-resume');
await page.click('#ch-resume'); await page.waitForSelector('.ch-card');
ok((await page.textContent('.ch-q')).includes('第 2 / 5 題') && (await page.textContent('.ch-team[data-i="0"] .ch-score')).startsWith('15'), '重新整理 → 繼續上一場（分數、題號都在）');
for (let q = 2; q <= 5; q++) {
  await page.click(`.ch-team[data-i="${q % 3}"]`);
  await page.fill('#ch-in', await cipherAnswer(page, S)); await page.click('#ch-judge');
  await page.waitForSelector('#ch-next'); await page.click('#ch-next');
}
await page.waitForSelector('.ch-rank');
ok((await page.$$('.ch-rank li')).length === 3 && (await page.textContent('.ch-rank li:first-child')).includes('🥇'), '五題結束 → 排名');
await page.screenshot({ path: SHOTS + 'challenge-end.png', fullPage: true });

// 網路題（有選擇題、追問理由）也能出題
await page.click('#ch-again'); await page.click('.ch-n[data-n="2"]');
for (const cb of await page.$$('.ch-topic input')) { const v = await cb.getAttribute('value'); if (v !== '1') await cb.uncheck(); else await cb.check(); }
await page.click('#ch-start'); await page.waitForSelector('.ch-card');
await page.click('.ch-team[data-i="0"]'); await page.waitForSelector('#ch-in, .ch-o');
ok(true, '網路題出題正常：' + (await page.textContent('.ch-t')).slice(0, 30));

/* 📅 本週任務、🏅 徽章 */
await page.goto(BASE + '/11602/hub.html'); await login(page, '902', '8', '週任務');
await page.evaluate(() => ['M1', 'M2', 'M3', 'M4'].forEach(id => STORE.saveLevel('media', id, { stars: 3, extra: { maxCombo: 3 } })));
await page.goto(BASE + '/11602/hub.html?today=2028-02-17'); await page.waitForSelector('.wk');
ok((await page.textContent('.wk')).includes('第 1 週') && (await page.textContent('.wk')).includes('本週完成'), '📅 第 1 週：M1～M4 都完成 → 本週完成');
ok((await page.$$eval('.bdg.on b', b => b.map(x => x.textContent))).includes('準時完成'), '🏅 本週任務完成 → 「準時完成」徽章');
await page.goto(BASE + '/11602/hub.html?today=2028-04-20'); await page.waitForSelector('.wk');
ok((await page.textContent('.wk')).includes('第 10 週') && (await page.textContent('.wk')).includes('N4'), '📅 第 10 週：網路世界 N4～N6');
ok((await page.$$eval('.bdg.on b', b => b.map(x => x.textContent))).includes('準時完成'), '🏅 徽章拿到就保留（換週也不會消失）');
await page.goto(BASE + '/11602/hub.html?today=2028-01-20'); await page.waitForSelector('.wk');
ok((await page.textContent('.wk')).includes('開學預告'), '📅 開學前 → 第 1 週預告');
ok(!!(await page.$('a[href="challenge.html"]')), '闖關地圖有「🏁 課堂挑戰」連結');
await page.goto(BASE + '/11601/hub.html?today=2027-11-10'); await page.waitForSelector('.wk');
ok((await page.textContent('.wk')).includes('第 11 週') && (await page.textContent('.wk')).includes('P10'), '📅 上學期第 11 週：Python 魔王關');
await page.screenshot({ path: SHOTS + 'hub-week.png', fullPage: true });

console.log('errors', errors);
await browser.close();
if (bad || errors.length) process.exit(1);
