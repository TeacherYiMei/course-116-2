import { launch, login, BASE, SHOTS } from './harness.mjs';
import { PYUI_P2 } from '../private/tests/answers.mjs';
import fs from 'fs'; fs.mkdirSync(SHOTS, { recursive: true });
const vp = process.argv[2] === 'mobile' ? { width: 390, height: 844 } : { width: 1280, height: 900 };
const { browser, context } = await launch({ viewport: vp });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto(BASE + '/11601/hub.html');
await login(page);
// 先給 P1 2 星，讓 P2 開放
await page.evaluate(() => STORE.saveLevel('python', 'P1', { stars: 2 }));
await page.goto(BASE + '/11601/python.html#P2');
await page.waitForSelector('#engine.ok', { timeout: 60000 });
await page.waitForSelector('#btn-run:not([disabled])');
const sfx = vp.width < 500 ? '-m' : '';
await page.screenshot({ path: `${SHOTS}py-top${sfx}.png`, fullPage: false });
// 寫程式（用鍵盤打，測自動縮排）
await page.fill('#code', '');
await page.click('#code');
await page.keyboard.type(PYUI_P2);
await page.click('#btn-run');
await page.waitForSelector('#stdin');
await page.fill('#stdin', '王小明'); await page.press('#stdin', 'Enter');
await page.waitForFunction(() => document.querySelectorAll('.io-in').length >= 2 && document.getElementById('stdin'));
await page.fill('#stdin', '15'); await page.press('#stdin', 'Enter');
await page.waitForFunction(() => document.getElementById('run-note').textContent === '執行完畢');
console.log('console:', JSON.stringify(await page.textContent('#console')));
await page.click('#btn-grade');
await page.waitForSelector('#result .res-star', { timeout: 20000 });
console.log('result:', (await page.textContent('#result')).slice(0, 160));
await page.screenshot({ path: `${SHOTS}py-result${sfx}.png`, fullPage: true });
// 錯誤行標示
await page.fill('#code', "x = 3\nif x > 1\n    print(x)");
await page.dispatchEvent('#code', 'input');
await page.click('#btn-run');
await page.waitForSelector('#err .note');
console.log('err:', await page.textContent('#err .note b'), '| gutter:', await page.innerHTML('#gut'));
// 自動縮排
await page.fill('#code', ''); await page.click('#code');
await page.keyboard.type('for i in range(3):'); await page.keyboard.press('Enter'); await page.keyboard.type('print(i)');
console.log('indent:', JSON.stringify(await page.inputValue('#code')));
// 全形提醒
await page.fill('#code', "print（'嗨'）"); await page.dispatchEvent('#code', 'input');
console.log('fw:', await page.textContent('#fw'));
// time.sleep 動畫（P8 不開放 → 用 openAll 以外的方式：直接改進度）
await page.evaluate(() => { ['P2','P3','P4','P5','P6','P7'].forEach(id => STORE.saveLevel('python', id, { stars: 2 })); });
await page.goto(BASE + '/11601/python.html#P8');
await page.waitForSelector('#btn-run:not([disabled])', { timeout: 60000 });
await page.fill('#code', "import time\nfor i in range(3, 0, -1):\n    print(i)\n    time.sleep(1)\nprint('出發！')");
await page.dispatchEvent('#code', 'input');
await page.click('#btn-run');
await page.waitForTimeout(500);
const mid = await page.textContent('#console');
await page.waitForTimeout(1200);
console.log('anim mid:', JSON.stringify(mid), 'end:', JSON.stringify(await page.textContent('#console')));
console.log('locked P10?', await page.getAttribute('.lv[data-i="9"]', 'aria-disabled'));
await page.goto(BASE + '/11601/hub.html');
await page.waitForSelector('#hub .card');
await page.screenshot({ path: `${SHOTS}hub${sfx}.png`, fullPage: true });
console.log('errors', errors);
await browser.close();
