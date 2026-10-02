// 📊 試算表函式小抄（11602/sheetref.html）＋試算表關卡頁的 📚 浮動視窗、錯誤說明、提示不給答案
import { launch, login, BASE, SHOTS, gas } from './harness.mjs';
import fs from 'fs'; fs.mkdirSync(SHOTS, { recursive: true });
const { browser, context } = await launch();
const page = await context.newPage();
const errors = []; let bad = 0;
page.on('pageerror', e => errors.push(e.message));
page.on('dialog', d => d.accept());
const ok = (c, ...m) => { if (!c) bad++; console.log(c ? '  ✔' : '  ✘', ...m); };
const cards = () => page.$$eval('.rf-card', cs => cs.map(c => c.id));

await page.goto(BASE + '/11602/hub.html'); await login(page);
await page.goto(BASE + '/11602/sheetref.html'); await page.waitForSelector('.rf-card');
const all = await cards();
ok(all.length >= 14, '函式卡片', all.length, '種');
const res = await page.$$eval('.rf-f .res', r => r.map(x => x.textContent));
ok(res.length > 25 && res.every(r => !/#/.test(r)), '每個範例公式都算得出結果（用同一個試算引擎）', res.length);
ok(await page.$$eval('#err-list .card', c => c.length) >= 14 && await page.$$eval('#err-list .sx-ex', c => c.length) >= 12, '常見錯誤：每一種都有 ❌／✅ 對照');
await page.screenshot({ path: SHOTS + 'sheetref.png' });

await page.fill('#q', '引號'); await page.waitForTimeout(300);
ok((await cards()).includes('countif-cmp') && (await cards()).includes('countif-text'), '搜尋「引號」→ COUNTIF 比大小、文字條件');
await page.fill('#q', ''); await page.waitForTimeout(300);
await page.goto(BASE + '/11602/sheetref.html#T3'); await page.waitForSelector('.rf-card');
const t3 = await cards();
ok(t3.includes('countif-text') && t3.includes('countif-cell') && !t3.includes('sum'), '#T3 → 只看第 3 關用到的', t3.join(','));

/* ✏️ 換你試試：當場算、錯了馬上說明、表格標出用到的格子 */
await page.goto(BASE + '/11602/sheetref.html#countif-cmp'); await page.waitForTimeout(800);
const inp = page.locator('#countif-cmp input[data-try]');
await inp.fill('=COUNTIF(C2:C7,">=7")');
ok((await page.textContent('#countif-cmp .rf-try .out')).includes('3'), '換你試試：改公式馬上算出結果');
ok(await page.$$eval('#countif-cmp td.on', t => t.length) === 6, '表格標出公式用到的 6 格');
await inp.fill('=COUNTIF(C2:C7,>=7)');
ok((await page.textContent('#countif-cmp .rf-try .out')).includes('雙引號'), '換你試試：寫錯 → 中文說明＋❌／✅');
await page.screenshot({ path: SHOTS + 'sheetref-try.png' });

/* 試算表關卡頁：📚 浮動視窗、公式列即時說明、檢查的錯誤說明、提示不給完整公式 */
await page.goto(BASE + '/11602/sheet.html'); await page.waitForSelector('#ref-link');
await page.click('.lvcard[data-i="1"]'); await page.waitForSelector('#btn-ref');
ok((await page.getAttribute('#btn-ref', 'href')) === 'sheetref.html#T2' && !!(await page.$('#btn-ref2')), '關卡：「📚 這關用到的函式」＋公式列旁「📚 查函式」');
await page.click('#btn-ref'); await page.waitForSelector('.refp:not(.hidden) iframe');
const fr = page.frameLocator('.refp iframe');
await fr.locator('.rf-card').first().waitFor();
ok(await fr.locator('#countif-cmp').count() === 1 && await fr.locator('#sum').count() === 0 && await fr.locator('.topbar').isHidden(), '浮動視窗：嵌入版小抄，只列第 2 關用到的');
await page.click('#refp-min');   // 縮成標題列，才點得到後面的格子（學生也可以拖到旁邊）
const tg = await page.$$eval('td.tgt', t => t.map(x => x.dataset.ref));
await page.click(`td[data-ref="${tg[0]}"]`); await page.fill('#fx', '=COUNTIF(D2:D9,>=150)'); await page.press('#fx', 'Enter');
ok((await page.textContent('#fxplain')).includes('雙引號'), '公式列：寫錯按 Enter → 馬上說明（不扣心）');
await page.click(`td[data-ref="${tg[1]}"]`); await page.fill('#fx', '=COUNTIF(C1:C9,14)'); await page.press('#fx', 'Enter');
await page.click('#check'); await page.waitForSelector('#fb .note.bad');
const fbt = await page.textContent('#fb');
ok(fbt.includes('雙引號') && fbt.includes('標題') && await page.$$eval('#fb .sx-ex', x => x.length) >= 1, '檢查：每一格的錯誤都有說明＋❌／✅（範圍包含標題列也會指出來）');
await page.screenshot({ path: SHOTS + 'sheet-explain.png', fullPage: true });
for (let k = 1; k <= 3; k++) { await page.click('#hint'); await page.waitForFunction(n => document.querySelectorAll('#fb .hint').length >= n, k); }   // 提示在伺服器：按一次拿一則
const hints = await page.$$eval('#fb .hint', h => h.map(x => x.textContent));
ok(hints.length === 3 && hints.every(h => !/=\s*[A-Z]+\(/.test(h)), '提示：三段都不直接給公式', hints.length);
await page.click('#refp-x'); await page.click('#quit'); await page.click('.lvcard[data-i="4"]'); await page.click('#btn-ref'); await page.waitForTimeout(600);
ok(await fr.locator('#countif-cell').count() === 1 && await fr.locator('#countif-cmp').count() === 0, '第 5 關按 📚 → 小抄換成第 5 關用到的');

/* 所有關卡的提示都不給完整公式 */
const allHints = Object.values(gas.ctx.SV_ANS.sheet['11602']).map(l => l.hints).flat();   // 提示只在伺服器
ok(allHints.length >= 15 && allHints.every(h => !/=\s*[A-Z]+\(/.test(h)), '五關提示都不含完整公式', allHints.length);

/* 手機 */
const m = await context.newPage(); await m.setViewportSize({ width: 375, height: 760 });
await m.goto(BASE + '/11602/sheetref.html#countif-cell'); await m.waitForSelector('.rf-card'); await m.waitForTimeout(500);
ok(await m.evaluate(() => document.documentElement.scrollWidth) <= 375, '手機：小抄沒有橫向捲動');
await m.screenshot({ path: SHOTS + 'sheetref-m.png' });
await m.goto(BASE + '/11602/sheet.html#T2'); await m.waitForSelector('#btn-ref'); await m.click('#btn-ref'); await m.waitForSelector('.refp:not(.hidden)');
{ const r = await m.$eval('.refp', e => { const b = e.getBoundingClientRect(); return { l: b.left, r: b.right }; }); ok(r.l >= 0 && r.r <= 375, '手機：浮動視窗在畫面內', JSON.stringify(r)); }
console.log('errors', errors);
await browser.close();
if (bad || errors.length) process.exit(1);
