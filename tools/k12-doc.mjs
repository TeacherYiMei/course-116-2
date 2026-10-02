// 由 11601／11602 的 config.js（CURRICULUM）＋ shared/k12.js 產生 docs/06_課綱對照.md
// 用法：node tools/k12-doc.mjs
import fs from 'fs'; import vm from 'vm';
const root = new URL('..', import.meta.url).pathname;
const kw = {}; vm.runInNewContext(fs.readFileSync(root + 'shared/k12.js', 'utf8'), { window: kw });
const K = kw.K12.CODES;
const TITLE = {};
for (const f of ['11601/content/platform.js', '11601/content/python.js', '11602/content/network.js', '11602/content/data.js', '11602/content/cipher.js', '11602/content/media.js', '11602/content/sheet.js', '11602/content/5016b.js', '11601/content/5016b.js']) {
  const p = root + 'private/' + f; if (!fs.existsSync(p)) continue;
  const w = {}; vm.runInNewContext(fs.readFileSync(p, 'utf8'), { window: w });
  for (const v of Object.values(w)) if (Array.isArray(v)) v.forEach(l => { if (l && l.id && l.title) TITLE[f.slice(0, 5) + l.id] = l.title; });
}
for (const t of ['11601', '11602']) {   // 5016B 的節次寫在 5016b.html；單元一用課程小卡的標題
  const h = fs.readFileSync(root + t + '/5016b.html', 'utf8');
  for (const m of h.matchAll(/id: '(S\d)'[^\n]*?title: '([^']+)'/g)) TITLE[t + m[1]] = m[2];
  const w = {}; vm.runInNewContext(fs.readFileSync(root + t + '/config.js', 'utf8'), { window: w });
  w.CONFIG.MODULES.forEach(m => (m.parts || []).forEach(p => (p.levels || []).forEach(id => { if (!TITLE[t + id]) TITLE[t + id] = p.title; })));
}
let md = '# 108 課綱對照（資訊科技・國中第四學習階段）\n\n' +
  '> 由 `tools/k12-doc.mjs` 自動產生：對照表寫在各學期 `config.js` 的 `CURRICULUM`，代碼條文在 `shared/k12.js`。改對照請改 config，再重新產生這份文件。\n' +
  '> 學習表現代碼照教育部課綱寫「運」開頭（部分縣市教學綱要寫成「資t／資c／資p／資a」，意思相同）。\n\n';
for (const t of ['11601', '11602']) {
  const w = {}; vm.runInNewContext(fs.readFileSync(root + t + '/config.js', 'utf8'), { window: w });
  const C = w.CONFIG;
  md += '## ' + (t === '11601' ? '上學期 116-1' : '下學期 116-2') + '\n\n';
  for (const m of C.MODULES) {
    md += '### ' + (m.no === '＋' ? '延伸' : '單元' + m.no) + '　' + m.title + '\n\n| 關卡 | 名稱 | 學習內容 | 學習表現 |\n|---|---|---|---|\n';
    for (const id of m.levels) {
      const c = C.CURRICULUM[id] || [], name = TITLE[t + id] || '';
      md += '| ' + id + ' | ' + name + ' | ' + c.filter(x => x[0] === '資').map(x => x + ' ' + K[x]).join('<br>') + ' | ' + c.filter(x => x[0] === '運').map(x => x + ' ' + K[x]).join('<br>') + ' |\n';
    }
    md += '\n';
  }
  const used = new Set(Object.values(C.CURRICULUM).flat());
  md += '**這學期涵蓋的學習內容**：' + Object.keys(K).filter(k => k[0] === '資' && used.has(k)).join('、') + '\n\n';
}
const all = new Set();
for (const t of ['11601', '11602']) { const w = {}; vm.runInNewContext(fs.readFileSync(root + t + '/config.js', 'utf8'), { window: w }); Object.values(w.CONFIG.CURRICULUM).flat().forEach(x => all.add(x)); }
md += '## 九年級整年沒有涵蓋的條目\n\n' + Object.keys(K).filter(k => !all.has(k)).map(k => '- ' + k + ' ' + K[k]).join('\n') + '\n\n（陣列、模組化程式設計等屬七、八年級的內容；九年級以系統平臺、網路、資料處理與應用專題為主。）\n';
fs.writeFileSync(root + 'docs/06_課綱對照.md', md);
console.log('寫好 docs/06_課綱對照.md', md.length);
