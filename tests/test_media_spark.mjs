// 🎬 廣告工作站「🆘 沒想法也能開始」：W1 引導問題＋反差句型 → 特色候選；W2 句型填空；W3 鏡頭食譜（草稿要改過才算）
import { launch, login, BASE, SHOTS } from './harness.mjs';
const { browser, context } = await launch();
const page = await context.newPage();
const errors = []; let bad = 0;
page.on('pageerror', e => errors.push(e.message));
page.on('dialog', d => d.accept());
const ok = (c, ...m) => { if (!c) bad++; console.log(c ? '  ✔' : '  ✘', ...m); };

await page.goto(BASE + '/11602/hub.html'); await login(page, '904', '3', '沒想法');
await page.goto(BASE + '/11602/media.html#W1'); await page.waitForSelector('#w1-obj');
ok(await page.$eval('#w1-spark', d => d.open), 'W1：還沒填完，「🆘 完全沒想法？」自動展開');
await page.fill('#w1-obj', '雨傘');
await page.fill('#sp-2', '一按就打開'); await page.fill('#sp-3', '傘面有小碎花'); await page.fill('#sp-4', '收起來只剩手掌長');
const cands = await page.$$eval('#sp-cands .sp-c', b => b.map(x => x.textContent));
ok(cands.length === 3, 'W1：③～⑥ 的答案變成特色候選', cands.join('／'));
for (let i = 0; i < 3; i++) await page.click(`#sp-cands .sp-c >> nth=${i}`);
ok((await page.inputValue('#w1-f0')) === '一按就打開' && (await page.inputValue('#w1-f2')) === '收起來只剩手掌長', 'W1：點候選 → 依序放進三個特色');
await page.fill('#sp-a', '很無聊'); await page.fill('#sp-b', '單手就能撐開'); await page.click('#sp-use');
ok((await page.inputValue('#w1-usual')) === '很無聊', 'W1：反差句型「大家以為它…」放進「大家通常覺得它」');
await page.check('input[name=w1-core][value="0"]'); await page.fill('#w1-who', '同學');
await page.screenshot({ path: SHOTS + 'media-spark-W1.png', fullPage: true });
await page.click('#w1-sv'); await page.waitForSelector('#w2-open');
ok(await page.evaluate(() => (STORE.level('media', 'W1').extra.spark || [])[2] === '一按就打開'), 'W1：引導問題的答案也存進學習紀錄');

/* W2：句型帶入主角、特色；＿＿ 沒改不能存 */
const tpl = await page.$$eval('.tpl-b[data-to="w2-open"]', b => b.map(x => x.textContent));
ok(tpl[0] === '你以為它只是一個雨傘？' && tpl[2].startsWith('很無聊？'), 'W2：開場句型自動帶入主角、大家以為它', tpl.join('／'));
await page.click('.tpl-b[data-to="w2-mine"] >> nth=3');   // 「一＿＿，就＿＿。」
ok((await page.inputValue('#w2-mine')).includes('＿＿') && await page.evaluate(() => document.activeElement.id === 'w2-mine'), 'W2：點句型 → 放進欄位、游標停在＿＿');
await page.click('.tpl-b[data-to="w2-open"] >> nth=0'); await page.click('.tpl-b[data-to="w2-feat"] >> nth=0'); await page.click('.tpl-b[data-to="w2-end"] >> nth=2');
await page.fill('#w2-edit', '套句型再改成自己的話');
await page.click('#w2-sv');
ok((await page.textContent('#w2-msg')).includes('把句型裡的＿＿換成你自己的字'), 'W2：＿＿ 沒填不能存');
await page.fill('#w2-mine', '一按，雨天就不可怕'); await page.fill('#w2-feat', '一按，就撐開一片天');
await page.click('#w2-sv'); await page.waitForSelector('.shotrow');
ok(await page.evaluate(() => !!STORE.level('media', 'W2').done), 'W2：用句型改寫後完成');

/* W3：鏡頭食譜 */
ok(await page.$eval('#w3-rc', d => d.open), 'W3：「🆘 不知道怎麼拍？」自動展開');
const types = await page.$$eval('[data-ft]', s => s.map(x => x.options[x.selectedIndex].text));
ok(types[0] === '動作型' && types[1] === '外觀型' && types[2] === '變化型', 'W3：依特色猜類型（動作／外觀／變化）', types.join('、'));
await page.click('#w3-recipe');
const rows = await page.$$('.shotrow'), tplrows = await page.$$('.shotrow.tplrow');
ok(rows.length === 9 && tplrows.length === 9, 'W3：30 秒版產生 9 個鏡頭草稿（都是黃色原文）');
ok((await page.inputValue('input[data-k="what"][data-i="3"]')).includes('一按就打開'), 'W3：核心特色用「動作型」拍法', await page.inputValue('input[data-k="what"][data-i="3"]'));
await page.screenshot({ path: SHOTS + 'media-spark-W3.png', fullPage: true });
await page.click('#sv');
ok((await page.textContent('#msg')).includes('食譜原文'), 'W3：草稿沒改就存 → 擋下');
const mine = ['在玄關按下傘扣的手', '走廊外同學按開傘的側面', '從側面繞一圈看傘', '傘「啪」一聲撐開的特寫', '同學在雨中撐著走', '低角度拍撐開的瞬間', '三把花傘排在桌上', '同學在公車站撐傘等車', '雨傘全景＋標語'];
for (const [i, t] of mine.entries()) await page.fill(`input[data-k="what"][data-i="${i}"]`, t);
await page.click('#sv');
const m = await page.textContent('#msg');
ok(m.includes('鏡頭清單 OK'), 'W3：每一鏡都改成自己的 → 鏡頭清單通過（食譜排的時段、秒數、特色都符合 30 秒版條件）', m.replace(/\s+/g, ' ').slice(0, 80));

/* 15 秒版的食譜也要符合條件 */
await page.click('[data-ver="15"]'); await page.click('.wsteps .step[data-i="2"]'); await page.waitForSelector('#w3-rc'); await page.click('#w3-rc summary');
await page.click('#w3-recipe');
ok((await page.$$('.shotrow')).length === 5, 'W3：15 秒版產生 5 個鏡頭草稿');
for (let i = 0; i < 5; i++) await page.fill(`input[data-k="what"][data-i="${i}"]`, '我自己的鏡頭 ' + (i + 1));
await page.click('#sv');
ok((await page.textContent('#msg')).includes('鏡頭清單 OK'), 'W3：15 秒版草稿改過後也通過');

console.log('errors', errors);
await browser.close();
if (bad || errors.length) process.exit(1);
