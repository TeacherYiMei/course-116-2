// 📚 Python 語法小抄（11601/pyref.html）的範例結果，用真正的 Python 3 跑一次核對
//   node tests/pyref_check.mjs          核對：畫面上寫的執行結果 == 真的執行結果
//   node tests/pyref_check.mjs --write  把執行結果填進（或更新到）頁面裡（新增、修改範例後用）
import fs from 'fs'; import vm from 'vm'; import { execFileSync } from 'child_process';
const FILE = new URL('../11601/pyref.html', import.meta.url).pathname, WRITE = process.argv.includes('--write');
let src = fs.readFileSync(FILE, 'utf8');
const data = /<script id="pyref-data">([\s\S]*?)<\/script>/.exec(src)[1];
const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(data, ctx);
const HARNESS = `
import builtins, sys, time, random
random.seed(116)
time.sleep = lambda s: None
_in = sys.argv[1:]
def _input(p=''):
    v = _in.pop(0)
    print(str(p) + '\\u27e6' + v + '\\u27e7')
    return v
builtins.input = _input
exec(compile(sys.stdin.buffer.read().decode('utf-8'), '<ex>', 'exec'), {'__name__': '__main__'})
`;
function py(code, inputs) {
  return execFileSync('python3', ['-c', HARNESS, ...inputs], { input: code, encoding: 'utf8', timeout: 5000, env: { ...process.env, PYTHONIOENCODING: 'utf-8' } }).replace(/\n$/, '');
}
let bad = 0, n = 0;
for (const r of ctx.window.PYREF) for (const e of r.ex) {
  const out = (e.runs || [[]]).map(inp => py(e.code, inp)); n++;
  const same = JSON.stringify(out) === JSON.stringify(e.out || null);
  if (WRITE) {
    const lit = 'code: ' + JSON.stringify(e.code);
    const at = src.indexOf(lit); if (at < 0) throw new Error('找不到範例原始碼：' + r.id + ' / ' + e.t);
    const end = at + lit.length, rest = src.slice(end), old = /^, out: \[[^\]]*\]/.exec(rest);
    src = src.slice(0, end) + ', out: ' + JSON.stringify(out) + rest.slice(old ? old[0].length : 0);
  } else if (!same && !e.rand) { bad++; console.log('✘', r.id, e.t, '\n  頁面：', JSON.stringify(e.out), '\n  實際：', JSON.stringify(out)); }
}
if (WRITE) { fs.writeFileSync(FILE, src); console.log('已填入', n, '個範例的執行結果'); }
else console.log(bad ? '✘ ' + bad + ' 個範例的結果和實際執行不同' : '✔ ' + n + ' 個範例的執行結果都和 Python 3 一致');
process.exit(bad ? 1 : 0);
