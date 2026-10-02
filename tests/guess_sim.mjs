// 亂猜模擬：一個「聰明地亂猜」的學生（同一題不重複選錯的選項）玩每一關、每一階幾萬次，
// 算出靠亂猜過關的機率。三星三階的關卡每一階都要低於 1%。
// 規則要和 shared/cardgame.js 一致：❤️ 3 顆（錯 3 次就失敗）；三星三階裡選項 ≤ 3 的題目答錯換一題；
// it.follow 追問理由；type／input／bits 題猜不到。新增出題器時要把它的題型加進 GEN。
import { priv } from './harness.mjs';
const FOLLOW = { ipValid: 4, ipPrivate: 4, wirelessPick: 3, httpsJudge: 3 };   // 追問有幾個選項
const GEN = { netChain: ['order', 5], portsCalc: ['input'], cableAssign: ['slots', 3, 4], packetOrder: ['order', 4], packetLost: ['input'], ipValid: ['choice', 2], octetBits: ['input'],
  bitsToDec: ['input'], ipPrivate: ['choice', 2], ipBinary: ['input'], hexBits: ['input'], v6short: ['input'], v6expand: ['input'], urlSlots: ['slots', 4, 3], urlRead: ['choice', 4],
  mailFlow: ['order', 5], protoSlots: ['slots', 3, 4], httpsJudge: ['choice', 2], wirelessPick: ['choice', 3], download: ['input'], bottleneck: ['input'], barcode: ['input'], checkout: ['input'],
  letterNum: ['input'], wrap: ['input'], caesarEnc: ['input'], caesarDec: ['input'], bruteForce: ['input'], vigEnc: ['input'], vigDec: ['input'], tally: ['input'] };
const r = n => Math.floor(Math.random() * n), fact = n => n <= 1 ? 1 : n * fact(n - 1);
function buildP(rd, cu) {
  let combos = [[]];
  for (const sl of rd.slots) combos = combos.flatMap(c => sl.options.map(o => [...c, [sl.id, o]]));
  const good = combos.filter(c => {
    const chosen = Object.fromEntries(c), props = { price: rd.base ? rd.base.price : 0 };
    for (const [, o] of c) { if (o.price) props.price += o.price; for (const k in o) if (!['id', 'label', 'price'].includes(k)) props[k] = o[k]; }
    return !cu.rules.some(r => r.sum ? props[r.sum] > r.max : r.pick ? chosen[r.pick].id !== r.is : ((r.min != null && !(props[r.prop] >= r.min)) || (r.eq != null && props[r.prop] !== r.eq)));
  }).length;
  return good / combos.length;
}
function stage(rounds) {
  let e = 0; const bad = () => ++e >= 3;
  for (const rd of rounds) {
    if (rd.type === 'type' || rd.type === 'lab') return false;   // 打字題、🧪 實驗站都猜不到
    if (rd.type === 'sort') {
      const n = rd.pick || rd.items.length, k = rd.buckets.length;
      for (let i = 0; i < n; i++) { if (k <= 3) { while (r(k) !== 0) if (bad()) return false; } else { e += r(k); if (e >= 3) return false; } }
    } else if (rd.type === 'order') { for (let m = rd.items.length; m > 1; m--) { e += r(m); if (e >= 3) return false; } }
    else if (rd.type === 'build') {   // 每位客人：從所有組合裡猜到合格的一組（猜錯扣心）
      for (const cu of rd.customers) { const p = buildP(rd, cu); while (Math.random() > p) if (bad()) return false; }
    }
    else if (rd.type === 'gen') {
      const g = GEN[rd.gen]; if (!g) throw new Error('guess_sim 不認得出題器 ' + rd.gen + '：請加進 GEN');
      for (let q = 0; q < (rd.n || 1); q++) {
        if (g[0] === 'input') return false;
        if (g[0] === 'choice') for (;;) { if (r(g[1]) !== 0) { if (bad()) return false; continue; } if (FOLLOW[rd.gen] && r(FOLLOW[rd.gen]) !== 0) { if (bad()) return false; continue; } break; }
        if (g[0] === 'order') { const p = 1 / fact(g[1]); while (Math.random() > p) if (bad()) return false; }
        if (g[0] === 'slots') { const p = Math.pow(1 / g[1], g[2]); while (Math.random() > p) if (bad()) return false; }
      }
    }
  }
  return true;
}
let fail = 0, worst = 0;
const MP = priv('11602/content/media.js');
const L = priv('11602/content/network.js').NET_LEVELS.concat(priv('11601/content/platform.js').PF_LEVELS, priv('11602/content/data.js').DATA_LEVELS,
  MP.MEDIA_LEVELS, MP.MEDIA_AI_LEVELS, priv('11602/content/cipher.js').CIPHER_LEVELS);
for (const lv of L) {
  if (!lv.stages) continue;
  const ps = lv.stages.map(st => { let ok = 0; const N = 40000; for (let i = 0; i < N; i++) if (stage(st.rounds)) ok++; return ok / N; });
  ps.forEach(p => { worst = Math.max(worst, p); if (p >= 0.01) fail++; });
  console.log((ps.every(p => p < 0.01) ? '✔' : '✘'), lv.id, ps.map(p => (p * 100).toFixed(2) + '%').join(' | '));
}
console.log('亂猜過關的最高機率：' + (worst * 100).toFixed(2) + '%（目標 < 1%）');
process.exit(fail ? 1 : 0);
