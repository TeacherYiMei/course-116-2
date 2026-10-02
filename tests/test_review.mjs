// 🎓 會考前總複習：三關、三星三階（題庫混抽 → 出題器混合 → 實驗站挑戰版），每次重新抽題；📚 課綱小標籤；🧾 單元學習卡
import { launch, login, BASE, SHOTS, priv } from './harness.mjs';
import { solve as netSolve, answer as netAnswer, solveLab as netLab } from './net_solver.mjs';
import { solvePfLab } from './pf_solver.mjs';
import { cipherAnswer, solveLab2, LABS2 } from './labs2_solver.mjs';
import fs from 'fs'; fs.mkdirSync(SHOTS, { recursive: true });
const { browser, context } = await launch({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const errors = []; let bad = 0;
page.on('pageerror', e => errors.push(e.message));
page.on('dialog', d => d.accept());
const ok = (c, ...m) => { if (!c) bad++; console.log(c ? '  ✔' : '  ✘', ...m); };
await page.goto(BASE + '/11602/hub.html'); await login(page, '903', '12', '複習生');

// 正解：所有關卡的分類題（從 private 讀）
const MP = priv('11602/content/media.js');
const ALL = [priv('11601/content/platform.js').PF_LEVELS, priv('11602/content/network.js').NET_LEVELS, MP.MEDIA_LEVELS, MP.MEDIA_AI_LEVELS, priv('11602/content/data.js').DATA_LEVELS].flat();
const ITEM = new Map(); for (const lv of ALL) for (const st of lv.stages) for (const rd of st.rounds) if (rd.type === 'sort') for (const it of rd.items) ITEM.set(it.t, it.a);
const PF = ['platformBuilder', 'fiveUnits', 'memPlan', 'pcBuild', 'osManager', 'cloudPizza', 'pcDoctor', 'embedded'];

async function playStage() {
  for (let guard = 0; guard < 60 && !(await page.$('.end-star')); guard++) {
    if (await page.$('#cool-ok')) { await page.waitForSelector('#cool-ok:not([disabled])', { timeout: 8000 }); await page.click('#cool-ok'); continue; }
    if (await page.$('#nx')) { await page.click('#nx'); continue; }
    if (await page.$('.bucket:not(.gopt)')) { const t = (await page.textContent('.qcard .txt')).trim(); await page.click(`.bucket[data-b="${ITEM.get(t)}"]`); await page.waitForSelector('#nx'); continue; }
    if (await page.$('#lab > div')) {
      const lab = await page.$eval('#lab', e => e.dataset.lab);
      if (LABS2.includes(lab)) await solveLab2(page); else if (PF.includes(lab)) await solvePfLab(page); else await netLab(page);
      await page.waitForSelector('#nx', { timeout: 15000 }).catch(async () => { throw new Error('🧪 ' + lab + '：' + await page.textContent('#fb')); });
      continue;
    }
    if (await page.$('.qcard')) {
      const a = await cipherAnswer(page);
      if (a == null && !(await page.$('.gopt, .qcard input'))) { await page.waitForTimeout(300); if (await page.$('.bucket:not(.gopt)')) continue; }   // 分類題的按鈕比卡片晚一點出現
      const sol = a != null ? { kind: 'input', answer: a } : await netSolve(page);
      await netAnswer(page, sol, false);
      await page.waitForSelector('#nx', { timeout: 5000 }).catch(async () => { throw new Error('🎲 ' + await page.textContent('.qcard') + ' → ' + JSON.stringify(sol)); });
      continue;
    }
    await page.waitForTimeout(200);
  }
}
await page.goto(BASE + '/11602/review.html'); await page.waitForSelector('.lvcard');
ok((await page.$$('.lvcard')).length === 3, '總複習：三關');
const firstQ = async () => { await page.click('.lvcard[data-i="0"]'); await page.click('.stage[data-s="0"]'); return page.textContent('.qcard .txt'); };
const q1 = await firstQ(); await page.goto(BASE + '/11602/review.html'); await page.waitForSelector('.lvcard');
const q2 = await firstQ(); await page.goto(BASE + '/11602/review.html'); await page.waitForSelector('.lvcard');
const q3 = await firstQ();
ok(new Set([q1, q2, q3]).size >= 2, '每次打開重新抽題', q1, '/', q2, '/', q3);
await page.goto(BASE + '/11602/review.html'); await page.waitForSelector('.lvcard');
for (let i = 0; i < 3; i++) {
  await page.click(`.lvcard[data-i="${i}"]`); await page.click('.stage[data-s="0"]');
  for (let s = 0; s < 3; s++) {
    if (s > 0) await page.click('#up');
    await playStage();
    const got = await page.$eval('.end-star .stars', e => e.getAttribute('aria-label'));
    ok(got.startsWith(String(s + 1)), 'R' + (i + 1), '第', s + 1, '階 →', got);
  }
  if (i === 1) await page.screenshot({ path: SHOTS + 'review-end.png', fullPage: true });
  await page.click('#menu');
}
ok(await page.evaluate(() => STORE.moduleStars('review')) === 9 && await page.evaluate(() => STORE.moduleStars('media')) === 0, '總複習 9⭐ 記在 review，不算進單元進度');

/* 📚 課綱小標籤 */
await page.goto(BASE + '/11602/network.html#N4'); await page.waitForSelector('.k12');
ok((await page.textContent('.k12')).includes('資S-IV-3') && (await page.getAttribute('.k12-c', 'title')).includes('網路技術'), '📚 N4 概念小卡有課綱代碼（滑鼠移上去看條目）');
await page.goto(BASE + '/11601/python.html'); await page.waitForSelector('.k12');
ok((await page.textContent('.k12')).includes('資P-IV-1'), '📚 Python 任務卡有課綱代碼');

/* 🧾 單元學習卡 */
await page.goto(BASE + '/11602/hub.html'); await page.waitForSelector('#lc-mod');
await page.selectOption('#lc-mod', '0'); await page.fill('#lc-a', '太短'); await page.fill('#lc-b', '太短');
await page.click('#lc-make'); ok((await page.textContent('#lc-msg')).includes('還沒有闖過'), '🧾 單元四還沒闖關 → 不能做學習卡');
await page.evaluate(() => STORE.saveLevel('media', 'M1', { stars: 3 }));
await page.waitForSelector('#lc-mod'); await page.selectOption('#lc-mod', '0');
await page.fill('#lc-a', '太短'); await page.fill('#lc-b', '太短'); await page.click('#lc-make');
ok((await page.textContent('#lc-msg')).includes('15 個字'), '🧾 反思太短 → 要寫具體');
await page.fill('#lc-a', '我學會解析度越高像素越多，檔案也會變大很多'); await page.fill('#lc-b', '我想知道為什麼電影通常用每秒二十四格來拍攝');
await page.click('#lc-make'); await page.waitForSelector('#lc-dl');
ok((await page.getAttribute('#lc-dl', 'download')).startsWith('學習卡-單元四-903_12_複習生') && (await page.getAttribute('#lc-dl', 'href')).startsWith('data:image/png'), '🧾 產生 PNG 學習卡，檔名有單元、班級座號姓名');
await page.reload(); await page.waitForSelector('#lc-a');
ok((await page.inputValue('#lc-a')).startsWith('我學會解析度'), '🧾 反思草稿會保留');
await page.click('#lc-make'); await page.waitForSelector('#lc-canvas');
await (await page.$('#lc-canvas')).screenshot({ path: SHOTS + 'learncard.png' });
ok(!!(await page.$('a[href="review.html"]')), '闖關地圖有「🎓 會考前總複習」連結');
/* 💾 進度下載提醒 */
ok(!!(await page.$('#backup-note')) && (await page.textContent('#backup-note')).includes('還沒下載過'), '💾 有進度、還沒下載過 → 提醒下載');
{ await page.evaluate(() => { const o = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function () { window.__dl = this.download; return o.call(this); }; });
  await Promise.all([page.waitForEvent('download'), page.click('#btn-export2')]);
  const name = await page.evaluate(() => window.__dl);
  ok(name.startsWith('進度-11602-903_12_複習生') && !(await page.$('#backup-note')), '💾 按「現在下載」→ 下載進度檔、提醒消失', name); }
await page.reload(); await page.waitForSelector('#hub .card');
ok(!(await page.$('#backup-note')), '💾 7 天內下載過就不再提醒');

console.log('errors', errors);
await browser.close();
if (bad || errors.length) process.exit(1);
