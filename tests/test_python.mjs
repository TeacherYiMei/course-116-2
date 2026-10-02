import { launch, login, BASE, SHOTS } from './harness.mjs';
import fs from 'fs'; fs.mkdirSync(SHOTS, { recursive: true });
import { SOL_11601 as SOL, WEAK_11601 as WEAK } from '../private/tests/answers.mjs';   // 參考解答不放在公開 repo


// 應該拿不到滿分的寫法 → 期望星數


const { browser, context } = await launch();
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
await page.goto(BASE + '/11601/hub.html');
await login(page);
await page.evaluate(() => { const c = JSON.parse(JSON.stringify(window.CONFIG)); });
await page.goto(BASE + '/11601/python.html');
await page.waitForSelector('#engine.ok', { timeout: 60000 });
console.log('engine:', await page.textContent('#engine'));

async function gradeCode(id, code) {
  return page.evaluate(async ([id, code]) => {
    const lv = PY_LEVELS.find(l => l.id === id);
    const g = await PYRUN.grade(lv, code);
    return { stars: g.stars, passed: g.passed, total: g.total,
      fails: g.tests.filter(t => !t.pass).map(t => t.test.name + ':' + (t.error ? t.error.type : t.msg)),   // 評分在伺服器：只回「過了沒、原因」
      reqs: g.reqs.filter(r => !r.ok).map(r => r.req.msg) };
  }, [id, code]);
}
let bad = 0;
for (const [id, code] of Object.entries(SOL)) {
  const r = await gradeCode(id, code);
  const ok = r.stars === 3;
  if (!ok) bad++;
  console.log(ok ? '✔' : '✘', id, r.stars + '★', r.passed + '/' + r.total, r.fails.join(' | '), r.reqs.join(','));
}
for (const [id, code, want] of WEAK) {
  const t0 = Date.now();
  const r = await gradeCode(id, code);
  const ok = r.stars === want;
  if (!ok) bad++;
  console.log(ok ? '✔' : '✘', 'weak', id, 'want', want, 'got', r.stars, r.passed + '/' + r.total, (Date.now() - t0) + 'ms', r.fails.join(' | '));
}
// 錯誤翻譯
const errs = {
  fullwidth: "print（'hi'）",
  colon: "x = 3\nif x > 1\n    print(x)",
  indent: "x = 3\nif x > 1:\nprint(x)",
  name: "Print('hi')",
  name2: "print(hello)",
  concat: "age = 15\nprint('今年' + age)",
  cmp: "h = input()\nif h > 3:\n    print(1)",
  intfloat: "w = int('48.5')",
  eq: "x = 1\nif x = 1:\n    print(x)",
  quote: "print('hi)",
  paren: "print('hi'",
  zero: "print(1/0)",
};
for (const [k, code] of Object.entries(errs)) {
  const r = await page.evaluate(async ([code]) => { const r = await PYRUN.run(code, ['5']); return PYRUN.explain(r.error, code); }, [code]);
  console.log('err', k, '→', r && r.title, '|', r && r.raw);
}
// 無限迴圈 timeout + 之後引擎恢復
const t0 = Date.now();
const r1 = await page.evaluate(async () => (await PYRUN.run('while True:\n    pass', [])).error);
const r2 = await page.evaluate(async () => (await PYRUN.run("print('ok')", [])).events);
console.log('timeout', r1.type, (Date.now() - t0) + 'ms', 'recovered', JSON.stringify(r2));
const r3 = await page.evaluate(async () => (await PYRUN.run("while True:\n    print('x')", [])).error);
console.log('flood', r3 && r3.type);
console.log('page errors:', errors);
await browser.close();
process.exit(bad ? 1 : 0);
