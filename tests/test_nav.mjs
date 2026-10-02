// 全站導覽一致性：課程小卡（含捲動時固定在上方）、每一課／每一部分結尾的「← 上一課／下一課 →」
import { launch, login, BASE, SHOTS } from './harness.mjs';
const { browser, context } = await launch();
const page = await context.newPage();
const errors = []; let fail = 0;
page.on('pageerror', e => errors.push(e.message));
const ok = (c, ...m) => { console.log((c ? '  ✔ ' : '  ✘ ') + m.join(' ')); if (!c) fail++; };
const pager = () => page.$$eval('.pager .pg-btn', bs => bs.map(b => (b.classList.contains('prev') ? 'P:' : 'N:') + (b.getAttribute('href') || '') + '|' + b.textContent));
async function stuckAfterScroll(sel) {
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(80);
  const before = await page.$eval(sel, e => !!e.closest('.ucards-ph.stuck'));
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await page.waitForTimeout(150);
  const r = await page.$eval(sel, e => { const b = e.getBoundingClientRect(); return { stuck: !!e.closest('.ucards-ph.stuck'), top: Math.round(b.top), pos: getComputedStyle(e).position }; });
  return { before, ...r };
}

await page.goto(BASE + '/11601/hub.html'); await login(page);

/* ── 單元一：每一課結尾的上一課／下一課；1-4 四個小步驟是小卡 ── */
for (const [u, want] of [['1', ['P:index.html', 'N:2.html']], ['2', ['P:1.html', 'N:3.html']], ['4', ['P:3.html', 'N:index.html']]]) {
  await page.goto(BASE + `/11601/digital/${u}.html`); await page.waitForSelector('#pager .pg-btn');
  const p = await page.$$eval('#pager .pg-btn', bs => bs.map(b => (b.classList.contains('prev') ? 'P:' : 'N:') + b.getAttribute('href')));
  ok(JSON.stringify(p) === JSON.stringify(want), `1-${u} 結尾的上一課／下一課`, p.join(' '));
  ok(!(await page.textContent('body')).includes('回到課程地圖'), `1-${u} 回顧區改成「回到單元首頁」`);
}
{ const s = await stuckAfterScroll('#ucards');
  ok(!s.before && s.stuck && s.pos === 'fixed' && s.top >= 0 && s.top < 20, '捲動後課程小卡固定在上方', JSON.stringify(s)); }
await page.screenshot({ path: SHOTS + 'nav-sticky.png' });
await page.click('#ucards .ucard[data-part="d2"]'); await page.waitForURL(/2\.html/);
ok(true, '固定的小卡可以直接切到別一課');

await page.goto(BASE + '/11601/digital/4.html'); await page.waitForSelector('#image-steps .ucard');
ok((await page.$$('#image-steps .ucard')).length === 4 && await page.$eval('#sub-image-intro', b => b.classList.contains('on')), '1-4 四個小步驟是課程小卡（第 1 張亮）');
let sp = await page.$$eval('#image-step-pager .pg-btn', bs => bs.map(b => b.className + '|' + b.textContent));
ok(sp.length === 1 && sp[0].includes('next') && sp[0].includes('2. 🧭 像素探險家'), '1-4 第一步結尾只有「下一步」', sp.join(' / '));
await page.click('#image-step-pager .next');
ok(await page.$eval('#sub-image-explorer', b => b.classList.contains('on')) && !(await page.$eval('#image-sub-explorer', d => d.classList.contains('section-hidden'))), '按「下一步」切到第 2 步');
await page.click('#sub-image-compress');
sp = await page.$$eval('#image-step-pager .pg-btn', bs => bs.map(b => b.textContent));
ok(sp[0].includes('3. 🎨') && sp[1].includes('快速檢核'), '第 4 步：上一步＝第 3 步、下一步＝快速檢核', sp.join(' / '));
await page.screenshot({ path: SHOTS + 'nav-digital4.png', fullPage: false });

/* ── 116-2 單元六：三個部分的上一課／下一課 ── */
await page.goto(BASE + '/11602/hub.html'); await login(page);
for (const [f, want] of [['data', ['P:unit6.html', 'N:sheet.html']], ['sheet', ['P:data.html', 'N:cipher.html']], ['cipher', ['P:sheet.html', 'N:unit6.html']]]) {
  await page.goto(BASE + `/11602/${f}.html`); await page.waitForSelector('#pager .pg-btn');
  const p = await page.$$eval('#pager .pg-btn', bs => bs.map(b => (b.classList.contains('prev') ? 'P:' : 'N:') + b.getAttribute('href')));
  ok(JSON.stringify(p) === JSON.stringify(want), `單元六 ${f} 結尾的上一課／下一課`, p.join(' '));
}

/* ── 單元四（媒體）：四個部分的上一部分／下一部分、工作站五步小卡、固定小卡 ── */
await page.goto(BASE + '/11602/media.html'); await page.waitForSelector('#games .lvcard');
ok((await pager()).length === 1 && (await pager())[0].includes('看示範'), '概念闖關結尾：下一部分＝看示範');
await page.click('#tab-pager .next'); await page.waitForSelector('.move');
ok((await pager()).some(x => x.includes('概念闖關')) && (await pager()).some(x => x.includes('AI 前導關')), '看示範結尾：上一部分／下一部分');
{ const s = await stuckAfterScroll('#ucards'); ok(s.stuck && s.pos === 'fixed', '媒體頁捲動後四張小卡固定在上方'); }
await page.click('#ucards .mtab[data-t="studio"]'); await page.waitForSelector('.wsteps .ucard.step'); await page.waitForTimeout(900);
ok((await page.$$('.wsteps .ucard.step')).length === 5, '工作站五個步驟是課程小卡');
ok(await page.evaluate(() => { const ph = document.querySelector('#ucards').closest('.ucards-ph'); return ph.getBoundingClientRect().top >= -2; }), '切換部分後捲回小卡');
let wp = await page.$$eval('#w-pager .pg-btn', bs => bs.map(b => b.className + '|' + b.textContent));
ok(wp.length === 1 && wp[0].includes('next') && wp[0].includes('2.'), '工作站第 1 步結尾：下一步', wp.join(' / '));
await page.click('#w-pager .next');
ok(await page.$eval('.wsteps .ucard.step[data-i="1"]', b => b.classList.contains('on')), '按「下一步」切到第 2 步');
const tp = await pager();
ok(tp.some(x => x.startsWith('N:hub.html')), '廣告工作站（最後一部分）結尾接回闖關地圖');

/* ── 5016B：五節課的上一節／下一節＋固定小卡 ── */
await page.goto(BASE + '/11602/5016b.html'); await page.waitForSelector('#lab-pager .pg-btn');
ok((await page.$$('#lab-pager .pg-btn')).length === 1, '5016B 第 1 節結尾：下一節');
await page.click('#lab-pager .next');
ok(await page.$eval('#tabs .ucard[data-i="1"]', b => b.classList.contains('on')), '按「下一節」切到第 2 節');
{ const s = await stuckAfterScroll('#tabs'); ok(s.stuck && s.pos === 'fixed', '5016B 捲動後五節小卡固定在上方'); }

/* ── 手機寬度：固定小卡不造成橫向捲動 ── */
const m = await context.newPage(); await m.setViewportSize({ width: 375, height: 740 });
for (const u of ['/11601/digital/4.html', '/11602/media.html', '/11602/cipher.html']) {
  await m.goto(BASE + u); await m.waitForSelector('.ucard');
  await m.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await m.waitForTimeout(150);
  const w = await m.evaluate(() => document.documentElement.scrollWidth);
  ok(w <= 375, '手機 ' + u + ' 捲到底沒有橫向捲動', w);
}
await m.screenshot({ path: SHOTS + 'nav-mobile-sticky.png' });

console.log('errors', errors);
await browser.close();
if (fail || errors.length) process.exit(1);
