// 🎬 廣告工作站：⏱️ 15 秒精簡版（學生自己選）—— 時段、鏡頭數、秒數、影片長度的完成條件跟著換；建議節次標在每一步
import { launch, login, BASE, SHOTS } from './harness.mjs';
const { browser, context } = await launch();
const page = await context.newPage();
const errors = []; let bad = 0;
page.on('pageerror', e => errors.push(e.message));
const ok = (c, ...m) => { if (!c) bad++; console.log(c ? '  ✔' : '  ✘', ...m); };

await page.goto(BASE + '/11602/hub.html'); await login(page, '903', '7', '短片生');
await page.goto(BASE + '/11602/media.html#W1'); await page.waitForSelector('#w1-obj');
ok(await page.$eval('[data-ver="30"]', b => b.classList.contains('on')), '預設是 30 秒標準版');
{ const how = await page.textContent('#studio .aihow');
  ok(how.includes('這個網站不是 AI') && how.includes('Gemini 教育版') && how.includes('學校 Google 帳號'), '工作站說明：網站不是 AI，到 Gemini 教育版貼上');
  ok((await page.getAttribute('#studio .aihow a', 'href')) === 'https://gemini.google.com/app' && (await page.getAttribute('#studio .aihow a', 'target')) === '_blank', '「↗ 開啟 Gemini 教育版」開新分頁');
  ok((await page.$$eval('#body [data-copy] + a', a => a.map(x => x.textContent))).every(t => t.includes('Gemini 教育版')), '每個提示詞旁邊都有「↗ 開啟 Gemini 教育版」'); }
ok((await page.textContent('#panel .chip')).includes('第 1 節'), '每一步標出建議節次（W1：第 1 節）');
await page.click('[data-ver="15"]'); await page.waitForSelector('[data-ver="15"].on');
ok((await page.textContent('#studio h2')).includes('15 秒') && (await page.textContent('#w1-idea')).includes('15 秒廣告'), '選 15 秒：標題、提示詞跟著換');
await page.fill('#w1-obj', '雨傘');
await page.fill('#w1-f0', '一按就打開'); await page.fill('#w1-f1', '收起來很小'); await page.fill('#w1-f2', '傘面有圖案');
await page.check('input[name=w1-core][value="0"]');
await page.fill('#w1-usual', '很無聊'); await page.fill('#w1-who', '同學');
await page.click('#w1-sv'); await page.waitForSelector('#w2-open');
ok(await page.evaluate(() => (STORE.level('media', 'W1') || {}).extra.ver === 15), '版本記在學習紀錄（W1.ver = 15）');
const w2note = await page.textContent('#body .note');
ok(w2note.includes('15 秒') && w2note.includes('4–11 秒') && w2note.includes('12–15 秒'), 'W2：三句的時段換成 15 秒版', w2note.replace(/\s+/g, ' ').slice(0, 80));
ok((await page.inputValue('#w2-tool')) === 'Gemini 教育版', 'W2「用了哪個 AI 工具」預先填好 Gemini 教育版');
await page.fill('#w2-mine', '雨天也可以很酷'); await page.fill('#w2-tool', '沒有用 AI');
await page.fill('#w2-open', '下雨天，你在等誰？'); await page.fill('#w2-feat', '一按，就撐開一片天'); await page.fill('#w2-end', '雨天，換我陪你');
await page.fill('#w2-edit', '自己想的，改短一點');
await page.click('#w2-sv'); await page.waitForSelector('.shotrow');

/* W3：三個時段、預設 5 個鏡頭、2～3 秒、總長 13～17 秒 */
ok((await page.$$('.tl > div')).length === 3 && (await page.$$('.shotrow')).length === 5, 'W3：三個時段、預設 5 個鏡頭');
ok((await page.textContent('#panel .soft')).includes('5～7 個') && (await page.textContent('#panel .soft')).includes('2～3 秒'), 'W3 說明換成 5～7 個、2～3 秒');
ok((await page.textContent('#w3-p')).includes('三個時段') && (await page.textContent('#w3-p')).includes('12–15 秒'), 'W3 提示詞：三個時段');
const plan = [[0, '按下傘扣的特寫', 3, '特寫', 3], [1, '傘一下子撐開', 0, '中景', 3], [1, '同學撐傘走進雨裡', 0, '遠景', 3], [1, '收好的傘放進書包', 1, '低角度', 3], [2, '雨傘全景＋標語', 3, '遠景', 4]];
for (const [i, [seg, what, feat, angle, sec]] of plan.entries()) {
  await page.selectOption(`select[data-k="seg"][data-i="${i}"]`, String(seg));
  await page.fill(`input[data-k="what"][data-i="${i}"]`, what);
  await page.selectOption(`select[data-k="feat"][data-i="${i}"]`, String(feat));
  await page.selectOption(`select[data-k="angle"][data-i="${i}"]`, angle);
  await page.fill(`input[data-k="sec"][data-i="${i}"]`, String(sec)); await page.press(`input[data-k="sec"][data-i="${i}"]`, 'Tab');
}
await page.click('#sv');
const m1 = await page.textContent('#msg');
ok(m1.includes('每個鏡頭 2～3 秒'), 'W3：有鏡頭超過 3 秒會擋', m1.replace(/\s+/g, ' ').slice(0, 90));
ok(!m1.includes('傘面有圖案'), 'W3：15 秒版不要求三個特色都拍（另外兩個拍到一個就好）');
await page.fill('input[data-k="sec"][data-i="4"]', '3'); await page.press('input[data-k="sec"][data-i="4"]', 'Tab');
await page.click('#sv');
ok((await page.textContent('#msg')).includes('鏡頭清單 OK'), 'W3：5 個鏡頭、15 秒 → 清單通過');
await page.screenshot({ path: SHOTS + 'media-W3-15.png', fullPage: true });
const sc = await page.$$('#shoot .chk input');
for (let k = 0; k < sc.length - 1; k++) await sc[k].check();
await page.waitForSelector('#w4-name');
ok((await page.getAttribute('#w4-beat', 'placeholder')).includes('12'), 'W4：對拍秒數的例子換成第 12 秒');
await page.fill('#w4-name', 'Rainy Beat'); await page.fill('#w4-credit', 'Music by 測試'); await page.fill('#w4-beat', '12');
for (const cb of await page.$$('input[data-cl="music"]')) await cb.check();
await page.click('#w4-sv'); await page.waitForSelector('#w5-len');
ok((await page.textContent('#body')).includes('2～3 秒'), 'W5 剪輯檢核換成每鏡 2～3 秒');
await page.fill('#w5-len', '30'); await page.fill('#w5-peer', '8 號');
for (let i = 0; i < 3; i++) await page.check(`input[name=pq${i}][value="0"]`);
await page.fill('#w5-what', '三題都是，不用改');
await page.check('input[name=w5-ai][value="6"]');   // 沒有使用 AI
for (const cb of await page.$$('input[data-cl="edit"]')) await cb.check();
await page.click('#w5-make');
ok((await page.textContent('#w5-err')).includes('約 15 秒（13～17 秒）'), 'W5：15 秒版交 30 秒的影片會擋');
await page.fill('#w5-len', '15'); await page.click('#w5-make'); await page.waitForSelector('#card-canvas', { timeout: 5000 }).catch(async () => console.log('    w5-err:', await page.textContent('#w5-err')));
ok(await page.evaluate(() => (STORE.level('media', 'W5') || {}).extra.ver === 15 && STORE.level('media', 'W5').done), 'W5：15 秒版完成（紀錄裡有 ver）');

/* 換回 30 秒：鏡頭的時段對應到五段，條件回到 8～12 個 */
await page.click('[data-ver="30"]'); await page.click('.wsteps .step[data-i="2"]'); await page.waitForSelector('.shotrow');
const segs = await page.$$eval('select[data-k="seg"]', s => s.map(x => +x.value));
ok((await page.$$('.tl > div')).length === 5 && JSON.stringify(segs) === '[0,2,2,2,4]', '換回 30 秒：五個時段，鏡頭對應過去', segs.join(','));
await page.click('#sv');
ok((await page.textContent('#msg')).includes('8～12 個'), '30 秒版：鏡頭不夠 8 個會擋');

console.log('errors', errors);
await browser.close();
if (bad || errors.length) process.exit(1);
