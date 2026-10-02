// ♿ 無障礙＋投影可讀性：用 axe-core 掃主要頁面（對比 ≥ 4.5、替代文字、標籤、表頭…），一個問題都不能有
import { launch, login, BASE } from './harness.mjs';
import fs from 'fs';
const AXE = fs.readFileSync(new URL('./node_modules/axe-core/axe.min.js', import.meta.url).pathname, 'utf8');
const { browser, context } = await launch();
const p = await context.newPage();
await p.goto(BASE + '/11601/hub.html'); await login(p);
const pages = process.argv.slice(2).length ? process.argv.slice(2) : ['index.html?stay', '11601/hub.html', '11601/digital/index.html', '11601/digital/1.html', '11601/digital/2.html', '11601/digital/3.html', '11601/digital/4.html', '11601/python.html#P1', '11601/pyref.html', '11601/platform.html', '11601/platform.html#G3', '11601/5016b.html',
  '11602/hub.html', '11602/media.html', '11602/media.html#W3', '11602/media.html#ai', '11602/network.html', '11602/network.html#N4', '11602/unit6.html', '11602/data.html', '11602/sheet.html#T2', '11602/sheetref.html', '11602/cipher.html', '11602/5016b.html',
  // 🧪 實驗站（@階）：先把前面記成通過再打開
  '11602/data.html#D1@2', '11602/data.html#D2@2', '11602/data.html#D3@2', '11602/media.html#M1@1', '11602/media.html#M2@1', '11602/media.html#M3@2', '11602/media.html#M4@2',
  '11602/media.html#A1@2', '11602/media.html#A2@2', '11602/media.html#A3@2', '11602/media.html#A4@2', '11602/media.html#A5@2', '11602/media.html#A6@2', '11602/cipher.html#K1', '11602/challenge.html', '11602/review.html',
  // 🐍 pylab：教師試用版、學生版（登入畫面、登入後）
  'pylab/teacher.html#P1', 'pylab/index.html', 'pylab/index.html#me'];
const agg = {}; let total = 0; const other = {};
for (const u of pages) {
  if (u.includes('@')) {
    const [url, st] = u.split('@'), id = url.split('#')[1], mod = url.includes('data') ? 'data' : 'media';
    await p.goto(BASE + '/' + url); await p.evaluate(([m, id]) => STORE.saveLevel(m, id, { stars: 3 }), [mod, id]);
    await p.goto(BASE + '/' + url.replace('#', '?a=' + st + '#')); await p.click(`.stage[data-s="${st}"]`); await p.waitForTimeout(700);
  } else if (u === 'pylab/index.html#me') {
    await p.goto(BASE + '/pylab/index.html'); await p.evaluate(() => localStorage.setItem('pylab-me', JSON.stringify({ cls: '801', seat: '7', name: '林小華' })));
    await p.goto(BASE + '/pylab/index.html#P1'); await p.reload(); await p.waitForSelector('.lv');
  } else await p.goto(BASE + '/' + u);
  await p.waitForTimeout(1300);
  if (/#G3|#N4|#K1$/.test(u)) { await p.click('.stage[data-s="0"]').catch(() => {}); await p.waitForTimeout(600); }
  await p.addScriptTag({ content: AXE });
  const r = await p.evaluate(async () => { const r = await axe.run(document, { resultTypes: ['violations'] }); return r.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ t: n.target.join(' '), d: (n.any[0] || {}).data })) })); });
  for (const v of r) for (const n of v.nodes) {
    total++;
    if (v.id === 'color-contrast') { const k = (n.d ? n.d.fgColor + ' on ' + n.d.bgColor + ' ' + n.d.contrastRatio : '?'); agg[k] = agg[k] || { n: 0, ex: new Set() }; agg[k].n++; if (agg[k].ex.size < 3) agg[k].ex.add(u + ' ' + n.t.slice(-50)); }
    else { other[v.id] = other[v.id] || []; other[v.id].push(u + ' ' + n.t.slice(-60)); }
  }
}
console.log('TOTAL', total);
Object.entries(agg).sort((a, b) => b[1].n - a[1].n).forEach(([k, v]) => console.log(v.n, k, '|', [...v.ex].join(' ; ')));
console.log(JSON.stringify(other, null, 1));
await browser.close();
if (total) process.exit(1);
