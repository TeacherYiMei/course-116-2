// 錯誤翻譯機：每一種常見錯誤都要有「你的程式 → 可以改成」或範例對照
import { launch, login, BASE, SHOTS } from './harness.mjs';
import fs from 'fs'; fs.mkdirSync(SHOTS, { recursive: true });

const { browser, context } = await launch();
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
let bad = 0;
const ok = (c, ...m) => { if (!c) bad++; console.log(c ? '✔' : '✘', ...m); };

await page.goto(BASE + '/11601/hub.html');
await login(page);
await page.goto(BASE + '/11601/python.html');
await page.waitForSelector('#engine.ok', { timeout: 60000 });

// [名稱, 程式, 輸入, 期望的 fixed（null＝沒有自動改法，要有範例）, 標題要包含]
const CASES = [
  ['全形括號', "print（'你好，同學'）", [], "print('你好，同學')", '全形'],
  ['全形冒號', "age = 15\nif age >= 13：\n    print('ok')", [], 'if age >= 13:', '全形'],
  ['少冒號', "age = 15\nif age >= 13\n    print('ok')", [], 'if age >= 13:', '冒號'],
  ['else 少冒號', "age = 5\nif age > 3:\n    print(1)\nelse\n    print(2)", [], 'else:', '冒號'],
  ['沒縮排', "age = 15\nif age >= 13:\nprint('ok')", [], "    print('ok')", '縮排'],
  ['多縮排', "name = 'a'\n    print(name)", [], 'print(name)', '縮排'],
  ['引號沒成對', "print('哈囉)", [], "print('哈囉')", '引號'],
  ['括號沒關', "age = int(input('幾歲？')\nprint(age)", ['3'], "age = int(input('幾歲？'))", '括號'],
  ['多右括號', "print('你好'))", [], "print('你好')", '右括號'],
  ['if 用 =', "x = 1\nif x = 1:\n    print(x)", [], 'if x == 1:', '=='],
  ['少逗號', "name = 'A'\nprint('我是' name)", [], "print('我是', name)", '逗號'],
  ['else if', "x = 1\nif x > 3:\n    print(1)\nelse if x > 0:\n    print(2)", [], 'elif x > 0:', 'elif'],
  ['esle 拼錯', "x = 1\nif x > 3:\n    print(1)\nesle:\n    print(2)", [], 'else:', '拼錯'],
  ['print 沒括號', "print '你好'", [], "print('你好')", 'print'],
  ['Print 大寫', "Print('hi')", [], "print('hi')", 'print'],
  ['變數未建立', "print(name)\nname = 'A'", [], null, '不認識'],
  ['忘了引號', "print(hello)", [], null, '不認識'],
  ['文字＋數字', "age = 15\nprint('今年' + age + '歲')", [], null, '+'],
  ['文字比大小', "h = input()\nif h > 3:\n    print(1)", ['5'], null, '比大小'],
  ['int 遇小數', "w = int(input('體重：'))", ['48.5'], "w = float(input('體重：'))", 'int'],
  ['除以 0', "p = 0\nprint(10 // p)", [], null, '除以 0'],
  ['停不下來', "ans = '1'\nwhile ans != '2027':\n    x = 1", [], null, '3 秒']
];
for (const [name, code, inputs, want, kw] of CASES) {
  const ex = await page.evaluate(async ([code, inputs]) => { const r = await PYRUN.run(code, inputs); return PYRUN.explain(r.error, code); }, [code, inputs]);
  const good = ex && ex.title.includes(kw) && (want === null ? (!!ex.bad && !!ex.good) : (ex.fixed || '').trim() === want.trim());
  ok(good, name.padEnd(8), '→', ex && ex.title, '| fixed:', ex && JSON.stringify(ex.fixed), want === null ? '| 範例：' + !!(ex && ex.bad) : '');
}

// 畫面截圖：少冒號、全形、括號沒關（錯在下一行）
async function shot(code, file) {
  await page.fill('#code', code);
  await page.dispatchEvent('#code', 'input');
  await page.click('#btn-run');
  await page.waitForSelector('#err .errbox');
  await (await page.$('#err')).screenshot({ path: SHOTS + file });
}
await shot("age = int(input('今年幾歲？'))\nif age <= 6\n    print('免購票')", 'err-colon.png');
await shot("print（'Hello, World!'）", 'err-fullwidth.png');
await shot("age = int(input('幾歲？')\nprint(age)", 'err-paren.png');
await shot("age = 15\nprint('今年' + age + '歲')", 'err-concat.png');

console.log('errors', errors);
ok(errors.length === 0, '沒有頁面錯誤');
await browser.close();
process.exit(bad ? 1 : 0);
