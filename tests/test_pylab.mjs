// 🐍 pylab/（和闖關網站分開）：teacher.html 教師試用版（10 關全開、📮 回報寫進試算表、連不上時可以複製）＋ index.html 學生版（填身分、2⭐ 開下一關、成績卡）
import { launch, BASE, SHOTS, gas } from './harness.mjs';
import fs from 'fs'; fs.mkdirSync(SHOTS, { recursive: true });
import { SOL_11601 as SOL } from '../private/tests/answers.mjs';
let bad = 0;
const ok = (c, ...m) => { if (!c) bad++; console.log(c ? '  ✔' : '  ✘', ...m); };

const { browser, context } = await launch();
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('dialog', d => d.accept());
await page.goto(BASE + '/pylab/teacher.html');
await page.waitForSelector('#engine.ok', { timeout: 60000 });
console.log('🧑‍🏫 教師試用版');

/* 獨立：不用登入、不載入闖關網站的程式 */
ok(!(await page.$('#login, .login')) && await page.evaluate(() => !window.STORE && !window.HUB && !window.UI), '不用登入、沒有載入闖關網站的 STORE／HUB／UI');
const srcs = await page.$$eval('script[src], link[rel=stylesheet]', e => e.map(x => x.getAttribute('src') || x.getAttribute('href')));
ok(srcs.every(s => !s.includes('../shared/') && !s.includes('../1160')), '所有程式、樣式都在 pylab/ 裡（複本）', srcs.join(' '));
ok((await page.$$('.lv')).length === 10 && !(await page.$('.lv.lock')), '10 關全部開放');

/* 評分：參考解答 → 3⭐（和學生版同一個伺服器、同一份測資） */
await page.click('.lv[data-i="2"]');
ok((await page.textContent('#stage')).includes('評分測資'), '每一關顯示測資組數（公開／隱藏）與結構要求');
await page.fill('#code', SOL.P3); await page.dispatchEvent('#code', 'input');
await page.click('#btn-grade'); await page.waitForSelector('#result .res-star', { timeout: 60000 });
ok((await page.$eval('#result .res-star .stars', e => e.getAttribute('aria-label'))).startsWith('3'), 'P3 參考解答 → 3⭐');
ok(await page.evaluate(() => localStorage.getItem('pylab-best-P3')) === '3' && (await page.textContent('#lv-got')).startsWith('3'), '成績只存在這台電腦（pylab- 開頭）');
await page.click('#btn-hint'); await page.waitForSelector('#hints .hint');
ok(true, '💡 提示從伺服器拿：' + (await page.textContent('#hints .hint')).slice(0, 20));

/* 📮 回報：送到伺服器 → 試算表 */
await page.fill('#code', "print('hello')"); await page.dispatchEvent('#code', 'input');
await page.click('#btn-grade'); await page.waitForSelector('#result .res-star', { timeout: 60000 });
await page.click('#to-fb'); await page.waitForSelector('#fb[open]');
await page.check('input[name="fb-kind"][value="strict"]');
await page.fill('#fb-msg', '輸入 0 的時候題目沒說要怎麼處理');
await page.fill('#fb-who', '王老師'); await page.fill('#fb-from', '測試國中');
await page.click('#fb-send'); await page.waitForSelector('#fb-note .ok-c');
const rows = gas.sheet() || [];
const last = rows[rows.length - 1] || [];
ok(rows.length >= 2 && last[2].startsWith('P3') && last[3] === '測資太嚴' && last[5] === '王老師' && last[11].includes("print('hello')") && /\d+\/\d+/.test(last[8]),
  '📮 回報寫進試算表：任務、類別、稱呼、程式碼、評分結果', last.slice(1, 9).join(' | '));
await page.reload(); await page.waitForSelector('.lv'); await page.click('#fb summary');
ok(await page.inputValue('#fb-who') === '王老師', '📮 稱呼會記住（下次不用再打）');
await page.screenshot({ path: SHOTS + 'pylab.png', fullPage: true });

/* 手機寬度不橫向捲動 */
await page.setViewportSize({ width: 390, height: 800 });
ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), '📱 手機寬度沒有橫向捲動');
await browser.close();

/* 連不上伺服器：回報改成「複製」 */
{
  const { browser: b2, context: c2 } = await launch({ offline: true });
  const p = await c2.newPage();
  await p.goto(BASE + '/pylab/teacher.html#P1'); await p.waitForSelector('#fb');
  await p.click('#fb summary'); await p.fill('#fb-msg', '離線時的回報測試');
  await p.click('#fb-send'); await p.waitForSelector('#fb-copy');
  ok(true, '📴 連不上伺服器 → 出現「📋 複製回報內容」，可以用 email／LINE 傳');
  await b2.close();
}
let PC = '';
/* 🎒 學生版 index.html */
{
  console.log('🎒 學生版');
  const { browser: b3, context: c3 } = await launch({ utf8: true });
  const p = await c3.newPage();
  p.on('pageerror', e => errors.push(e.message)); p.on('dialog', d => d.accept());
  await p.goto(BASE + '/pylab/'); await p.waitForSelector('#login');
  ok(!(await p.$('.lv')), '先填班級座號姓名才看得到關卡');
  await p.click('#login button'); ok((await p.textContent('#login-err')).includes('都要填'), '沒填完 → 提醒');
  await p.fill('#in-cls', '801'); await p.fill('#in-seat', '07'); await p.fill('#in-name', '林小華'); await p.click('#login button');
  await p.waitForSelector('#engine.ok', { timeout: 60000 });
  ok((await p.textContent('.topbar')).includes('801 班 7 號 林小華'), '頁首顯示身分（座號去掉前面的 0）');
  ok((await p.$$('.lv.lock')).length === 9 && !(await p.$('#fb')) && !(await p.textContent('#stage')).includes('評分測資'), '只開第 1 關、沒有回報區、不顯示測資組數');
  await p.click('.lv[data-i="1"]', { force: true }); await p.waitForSelector('.toast');
  ok((await p.$eval('.lv[data-i="0"]', b => b.classList.contains('on'))), '點鎖住的關卡 → 不會打開、跳出提醒：' + (await p.textContent('.toast')).slice(0, 24));
  await p.fill('#code', SOL.P1); await p.dispatchEvent('#code', 'input');
  await p.click('#btn-grade'); await p.waitForSelector('#result .res-star', { timeout: 60000 });
  ok(!!(await p.$('#btn-next')) && (await p.textContent('#btn-next')).includes('下一關已開放') && !(await p.$('.lv[data-i="1"].lock')), 'P1 過關 → 第 2 關開放、出現「下一關」');
  await p.click('#btn-next'); await p.waitForSelector('.lv[data-i="1"].on');
  PC = await p.evaluate(() => localStorage.getItem('pylab-s801_7-pc'));
  ok(/^[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/.test(PC || '') && (await p.textContent('#pc-code')) === PC, '🔑 過關後拿到伺服器簽的進度碼，顯示在左邊（依學生分開存）', PC);
  /* 🛡️ F12 改紀錄：改星數沒用、改進度碼會被伺服器擋 */
  await p.evaluate(() => { localStorage.setItem('pylab-s801_7-best-P5', '3'); });
  await p.reload(); await p.waitForSelector('.lv');
  ok((await p.$$('.lv.lock')).length === 8, '🛡️ F12 改 best-P5 = 3 → 關卡鎖不受影響');
  const forged = await p.evaluate(pc => { const B = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; let v = 0; for (let i = 0; i < 10; i++) v = v * 4 + 3; let h = ''; for (let k = 0; k < 4; k++) { h = B[v % 32] + h; v = Math.floor(v / 32); } const f = h + pc.replace(/-/g, '').slice(4); localStorage.setItem('pylab-s801_7-pc', f.slice(0, 4) + '-' + f.slice(4, 8) + '-' + f.slice(8)); return f; }, PC);
  await p.reload(); await p.waitForFunction(pc => localStorage.getItem('pylab-s801_7-pc') === pc, PC, { timeout: 15000 }).catch(() => {});
  ok(await p.evaluate(() => localStorage.getItem('pylab-s801_7-pc')) === PC && (await p.$$('.lv.lock')).length === 8, '🛡️ F12 改進度碼的星數（假裝 30⭐）→ 重新整理時伺服器發現對不上，自動換回雲端的進度', forged);
  /* 就算不重新整理、直接送出評分，伺服器也擋 */
  await p.evaluate(f => localStorage.setItem('pylab-s801_7-pc', f.slice(0, 4) + '-' + f.slice(4, 8) + '-' + f.slice(8)), forged);
  await p.fill('#code', SOL.P2); await p.dispatchEvent('#code', 'input');
  await p.click('#btn-grade'); await p.waitForSelector('#result .note.bad', { timeout: 60000 });
  ok((await p.textContent('#result')).includes('進度碼對不上'), '🛡️ 改過的進度碼送出評分 → 伺服器擋下來');
  await p.evaluate(pc => localStorage.setItem('pylab-s801_7-pc', pc), PC); await p.goto(BASE + '/pylab/'); await p.reload(); await p.waitForSelector('.lv');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#btn-card')]);
  await dl.saveAs(SHOTS + 'pylab-card.png');
  ok(dl.suggestedFilename() === 'Python成績卡-801_7_林小華.png', '🧾 成績卡下載（檔名有班級座號姓名）', dl.suggestedFilename());
  await p.screenshot({ path: SHOTS + 'pylab-student.png', fullPage: true });
  await p.click('#who-x'); await p.waitForSelector('#login');
  await p.fill('#in-cls', '801'); await p.fill('#in-seat', '8'); await p.fill('#in-name', '陳同學'); await p.click('#login button');
  await p.waitForSelector('.lv');
  ok((await p.$$('.lv.lock')).length === 9, '換人 → 另一位同學從第 1 關開始（彼此的成績分開）');
  /* 🧑‍🏫 老師驗證成績卡 */
  await p.goto(BASE + '/pylab/teacher.html'); await p.click('#verify summary');
  await p.fill('#vf-cls', '801'); await p.fill('#vf-seat', '7'); await p.fill('#vf-pc', PC.toLowerCase()); await p.click('#vf button');
  await p.waitForSelector('#vf-out .note');
  ok((await p.textContent('#vf-out')).includes('進度碼正確') && (await p.textContent('#vf-out')).includes('3 / 30'), '🔍 老師輸入班級座號＋進度碼 → ✅ 正確、3 / 30 ⭐');
  await p.fill('#vf-seat', '8'); await p.click('#vf button'); await p.waitForSelector('#vf-out .note.bad');
  ok((await p.textContent('#vf-out')).includes('對不上'), '🔍 座號不對（拿同學的碼）→ ❌ 對不上');
  /* 📊 老師看進度表 */
  await p.click('#prog summary'); await p.fill('#pf-key', 'WRONG'); await p.click('#pf button'); await p.waitForSelector('#pf-out .note');
  ok((await p.textContent('#pf-out')).includes('還沒設定'), '📊 出題老師還沒產生老師密碼 → 提示');
  gas.props.set('PYLAB_TEACHER_KEY', 'K7Q2ABCD');
  await p.click('#pf button'); await p.waitForSelector('#pf-out .note.bad');
  ok((await p.textContent('#pf-out')).includes('不對'), '📊 老師密碼錯 → 看不到');
  await p.fill('#pf-key', 'K7Q2ABCD'); await p.fill('#pf-cls', '801'); await p.click('#pf button'); await p.waitForSelector('#pf-out table');
  const prow = await p.$$eval('#pf-out tr', trs => trs.map(t => t.textContent));
  ok(prow.some(t => t.includes('林小華') && t.includes('★★★')) && prow.length === 2, '📊 老師密碼對 → 801 班進度表（林小華 P1 ★★★）', prow[1]);
  const [csv] = await Promise.all([p.waitForEvent('download'), p.click('#pf-csv')]);
  ok(csv.suggestedFilename() === 'Python進度-801.csv', '📊 下載 CSV', csv.suggestedFilename());
  await b3.close();
}
/* 💻 還原卡清掉（新的瀏覽器）：只填班級座號就從雲端拿回進度；進度碼抄錯會提醒 */
{
  const { browser: b4, context: c4 } = await launch();
  const p = await c4.newPage(); p.on('pageerror', e => errors.push(e.message));
  await p.goto(BASE + '/pylab/'); await p.waitForSelector('#login');
  await p.fill('#in-cls', '801'); await p.fill('#in-seat', '7'); await p.fill('#in-name', '林小華'); await p.click('#pc-in-box summary');
  await p.fill('#in-pc', 'ZZZZ-ZZZZ-ZZZZ'); await p.click('#login button.go');
  await p.waitForFunction(() => document.getElementById('login-err').textContent.includes('對不上'));
  ok(true, '💻 進度碼抄錯 → 提醒「對不上」，不會進去');
  await p.fill('#in-pc', ''); await p.click('#login button.go'); await p.waitForSelector('.lv');
  ok((await p.$$('.lv.lock')).length === 8 && (await p.textContent('#lv-got')).startsWith('3') && await p.evaluate(() => localStorage.getItem('pylab-s801_7-pc')) === PC, '💻 電腦重開（瀏覽器是空的）→ 不用進度碼，只填班級座號就接續雲端進度（3⭐、第 2 關開放）');
  await p.setViewportSize({ width: 390, height: 800 });
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), '📱 學生版手機寬度沒有橫向捲動');
  await p.screenshot({ path: SHOTS + 'pylab-student-m.png', fullPage: true });
  await b4.close();
}
console.log('errors', errors);
if (bad || errors.length) process.exit(1);
