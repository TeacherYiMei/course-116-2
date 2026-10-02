// 網路世界 🎲 出題器的「解題機器人」：只看畫面上的題目文字來算答案（和學生看到的一樣），
// 用來確認每一種隨機題都答得出來、檢查也正確。
const CABLE = { '電信機房 → 你家社區': 'fiber', '臺北 ↔ 臺中的網路主幹道': 'fiber', '臺灣 ↔ 日本的海底電纜': 'fiber', '學校機房 → 各棟大樓': 'fiber',
  '教室電腦 → 教室的交換器': 'tp', '筆電 → 家裡路由器的網路孔': 'tp', '數據機 → 路由器': 'tp', '遊戲機 → 客廳的路由器': 'tp',
  '牆上的有線電視孔 → 電視盒': 'coax', '社區的有線電視系統 → 各戶': 'coax' };
const HTTPS = { 登入學校的成績查詢系統: 'y', '網路商店結帳，輸入信用卡號': 'y', '填寫報名表：姓名、電話、地址': 'y', 網路銀行轉帳: 'y', 變更社群網站的密碼: 'y',
  看氣象局公布的明天天氣: 'n', 看公開的新聞文章: 'n', 查公車到站時間: 'n', 看學校首頁的最新消息: 'n' };
const HTTPS_WHY = { 登入學校的成績查詢系統: '帳號密碼', '網路商店結帳，輸入信用卡號': '付款（信用卡）資料', '填寫報名表：姓名、電話、地址': '個人資料', 網路銀行轉帳: '金錢交易資料', 變更社群網站的密碼: '帳號密碼' };
const REG = { tw: '臺灣', jp: '日本', kr: '韓國', uk: '英國' }, CAT = { edu: '學校', ac: '學校', gov: '政府機關', go: '政府機關', com: '公司', co: '公司', org: '非營利組織', or: '非營利組織' };
const n = s => (s.match(/\d+(\.\d+)?/g) || []).map(Number);
const strip = g => g.map(x => x.replace(/^0+/, '') || '0');
function shortest(g) {
  const s = strip(g); let best = -1, bl = 1, i = 0;
  while (i < 8) { if (s[i] === '0') { let j = i; while (j < 8 && s[j] === '0') j++; if (j - i > bl) { bl = j - i; best = i; } i = j; } else i++; }
  return best < 0 ? s.join(':') : s.slice(0, best).join(':') + '::' + s.slice(best + bl).join(':');
}

/** 回傳 { kind, answer }：input → 字串；choice → 選項 id；order → 依序要點的按鈕文字片段；slots → 每格的值；bits → 位元字串 */
export async function solve(page) {
  await page.waitForSelector('.qcard .txt', { timeout: 8000 });
  const t = (await page.textContent('.qcard .txt')).trim();
  const sub = (await page.$eval('.qcard', e => (e.querySelector('.small') || {}).textContent || '')).trim();
  const has = async sel => !!(await page.$(sel));
  if (await has('.gitem')) {
    const items = await page.$$eval('.gitem', bs => bs.map(b => b.textContent.trim()));
    if (t.includes('封包亂序')) return { kind: 'order', answer: items.slice().sort((a, b) => n(a)[0] - n(b)[0]) };
    if (t.includes('email')) { const key = ['按下「寄出」', 'SMTP', '轉送', 'POP3', '打開信件']; return { kind: 'order', answer: key.map(k => items.find(x => x.includes(k))) }; }
    const pcs = n(t)[0], need = pcs > 4;   // netChain
    return { kind: 'order', answer: ['ISP', '數據機', '路由器'].concat(need ? ['交換器'] : []).concat(['台電腦']).map(k => items.find(x => x.includes(k))) };
  }
  if (await has('.gslot')) {
    const parts = await page.$$eval('.gslot > span.bold', ss => ss.map(s => s.textContent.trim()));
    if (t === '幫每一段線路選線材') return { kind: 'slots', answer: parts.map(p => CABLE[p]) };
    if (t.includes('協定')) return { kind: 'slots', answer: parts.map(p => /寄出|送出/.test(p) ? 'smtp' : /下載|收/.test(p) ? 'pop3' : 'https') };
    const segs = t.split('.'), ids = ['host', 'org', 'cat'].concat(segs.length === 4 ? ['area'] : []);   // urlSlots
    return { kind: 'slots', answer: parts.map(p => ids[segs.indexOf(p.replace(/[「」]/g, ''))]) };
  }
  if (await has('.gbit')) { const d = n(t)[0]; return { kind: 'bits', answer: d.toString(2).padStart(8, '0') }; }
  if (await has('.gopt')) {
    const opts = await page.$$eval('.gopt', bs => bs.map(b => b.dataset.v));
    if (sub.includes('合法的 IPv4')) {
      const p = t.split('.'), why = p.length !== 4 ? '組數不對' : p.some(x => !/^\d+$/.test(x)) ? '不是數字' : p.some(x => +x > 255) ? '超過 255' : '每組都在';
      return { kind: 'choice', answer: why === '每組都在' ? 'ok' : 'bad', follow: why };
    }
    if (sub.includes('公有還是私有')) {
      const [a, b] = t.split('.').map(Number), f = a === 10 ? '10.x' : (a === 172 && b >= 16 && b <= 31) ? '172.16' : (a === 192 && b === 168) ? '192.168' : '三段都不是';
      return { kind: 'choice', answer: f === '三段都不是' ? 'pub' : 'pri', follow: f };
    }
    if (sub.includes('https')) return { kind: 'choice', answer: HTTPS[t], follow: HTTPS[t] === 'y' ? HTTPS_WHY[t] : '公開資料' };
    if (sub.includes('最可能是')) { const s = t.split('.'); return { kind: 'choice', answer: REG[s[3]] + '的' + CAT[s[2]] }; }
    // wirelessPick
    const w = sub.includes('不用上網') ? 'bt' : sub.includes('附近沒有 Wi-Fi 基地臺') ? 'mobile' : 'wifi';
    return { kind: 'choice', answer: w, opts, follow: { bt: '近距離', wifi: '室內有', mobile: '會移動' }[w] };
  }
  // 打答案
  let a;
  if (t.includes('台電腦（都用網路線）')) { const [R, N] = n(t), P = n(sub)[0]; let k = 0; while ((R - k) + k * (P - 1) < N) k++; a = k; }
  else if (t.startsWith('收到：')) { const got = new Set(n(t)), T = n(sub)[0], miss = []; for (let i = 1; i <= T; i++) if (!got.has(i)) miss.push(i); a = miss.join(','); }
  else if (/^[01]{8}$/.test(t)) a = parseInt(t, 2);
  else if (/^[01]{4}$/.test(t)) a = parseInt(t, 2).toString(16);
  else if (/^[01]{8}(\.[01]{8}){3}$/.test(t)) a = t.split('.').map(x => parseInt(x, 2)).join('.');
  else if (t.includes('::')) { const [h, tl] = t.split('::').map(x => x ? x.split(':') : []); a = h.concat(Array(8 - h.length - tl.length).fill('0')).concat(tl).map(x => x.padStart(4, '0')).join(':'); }
  else if (/^[0-9a-f]{4}(:[0-9a-f]{4}){7}$/.test(t)) { const g = t.split(':'); a = sub.includes('最短') ? shortest(g) : strip(g).join(':'); }
  else if (/ Mbps$/.test(t)) a = n(t)[0] / 8;
  else if (t.startsWith('用 ')) { const [m, mb] = n(t); a = mb / (m / 8); }
  else if (t.startsWith('家裡租')) { const [isp, ap, k] = n(t); a = Math.min(isp, ap) / k; }
  else if (t.startsWith('頻寬')) { const [e, p, mb] = n(t); a = mb / (e / p / 8); }
  else if (t.includes('條碼')) { let b = (await page.$$eval('.barcode i', is => is.map(i => i.className === 'k' ? '1' : '0'))).join(''); if (t.includes('倒著')) b = b.split('').reverse().join(''); a = parseInt(b, 2); }
  else if (t.startsWith('購物籃')) { const [cnt] = n(t), [s, tt] = n(sub); a = cnt * s - tt; }
  else throw new Error('解題機器人不認得這題：' + t + ' / ' + sub);
  return { kind: 'input', answer: String(a) };
}

/** 作答（wrong=true 故意答錯一次） */
export async function answer(page, sol, wrong) {
  if (sol.kind === 'input') await page.fill('#ans', wrong ? '999999' : sol.answer);
  else if (sol.kind === 'choice') await page.click(`.gopt[data-v="${wrong ? (await page.$$eval('.gopt', bs => bs.map(b => b.dataset.v))).find(v => v !== sol.answer) : sol.answer}"]`);
  else if (sol.kind === 'order') { const seq = wrong ? sol.answer.slice().reverse() : sol.answer; for (const x of seq) await page.click(`.gitem:has-text("${x.replace(/"/g, '\\"')}")`); }
  else if (sol.kind === 'slots') {
    const sels = await page.$$('.gslot select');
    for (const [i, s] of sels.entries()) {
      let v = sol.answer[i];
      if (wrong && i === 0) v = (await s.evaluate(e => [...e.options].map(o => o.value).filter(Boolean))).find(x => x !== v);
      await s.selectOption(v);
    }
  }
  else if (sol.kind === 'bits') { const b = wrong ? '00000000' : sol.answer; for (let i = 0; i < 8; i++) if (b[i] === '1') await page.click(`.gbit[data-j="${i}"]`); }
  await page.click('#tf button.go');
  // 追問「為什麼」
  if (!wrong && sol.follow) {
    await page.waitForSelector('.gfol');
    const labels = await page.$$eval('.gfol', bs => bs.map(b => b.textContent.trim()));
    const pickI = labels.findIndex(l => l === sol.follow);
    const i = pickI >= 0 ? pickI : labels.findIndex(l => l.includes(sol.follow));
    await page.locator('.gfol').nth(i).click();
  }
}

/** 🧪 實驗站：照畫面上的狀態做出正確結果（封包重組、Wi-Fi 基地臺位置、拉線） */
export async function solveLab(page) {
  await page.waitForSelector('#lab[data-lab]', { timeout: 10000 });   // 實驗站的情境由伺服器產生：等畫面畫好
  const lab = await page.$eval('#lab', e => e.dataset.lab);
  if (lab === 'packetSim') {
    await page.click('#pk-send');
    await page.waitForSelector('#pk-ok:not([disabled])', { timeout: 15000 });
    const n = (await page.$$('.pk-slot')).length;
    const have = new Set(await page.$$eval('.pk-pkt', bs => bs.map(b => +b.dataset.n)));
    for (let i = 1; i <= n; i++) if (!have.has(i)) {
      await page.click(`.pk-slot[data-s="${i - 1}"]`); await page.click('#pk-re');
      await page.waitForSelector(`.pk-pkt[data-n="${i}"]`, { timeout: 8000 });
    }
    for (let i = 1; i <= n; i++) { await page.locator(`.pk-pkt[data-n="${i}"]`).first().click(); await page.click(`.pk-slot[data-s="${i - 1}"]`); }
    await page.click('#pk-ok');
  } else if (lab === 'wifiMap') {
    const plan = await page.evaluate(() => {
      const lay = JSON.parse(document.getElementById('lab').dataset.layout), W = CARDGAME.labs._wifi;
      for (let x = 0; x < 12; x++) for (let y = 0; y < 8; y++) {
        const ap = { x, y };
        if (lay.devs.some(d => d.x === x && d.y === y)) continue;
        const bands = lay.devs.map(d => d.need5 ? 'g5' : W.sig(lay, ap, d, 'g24') > 0 ? 'g24' : 'g5');
        if (lay.devs.every((d, i) => W.sig(lay, ap, d, bands[i]) > 0)) return { ap, bands };
      }
      return null;
    });
    if (!plan) throw new Error('Wi-Fi 地圖找不到解');
    await page.click(`.wf-c[data-x="${plan.ap.x}"][data-y="${plan.ap.y}"]`);
    for (const [i, b] of plan.bands.entries()) await page.click(`.wf-b[data-i="${i}"][data-b="${b}"]`);
    await page.click('#wf-ok');
  } else if (lab === 'wireRoom') {
    const pcs = +(await page.$eval('#lab', e => e.dataset.pcs)), nsw = pcs <= 4 ? 0 : pcs <= 10 ? 1 : 2;
    const pairs = [['wall.out', 'modem.in'], ['modem.out', 'router.wan']];
    let pc = 1;
    for (let s = 1; s <= nsw; s++) pairs.push(['router.l' + s, 'sw' + s + '.up']);
    for (let l = nsw + 1; l <= 4 && pc <= pcs; l++) pairs.push(['router.l' + l, 'pc' + pc++ + '.nic']);
    for (let s = 1; s <= nsw; s++) for (let p = 1; p <= 7 && pc <= pcs; p++) pairs.push(['sw' + s + '.p' + p, 'pc' + pc++ + '.nic']);
    for (const [a, b] of pairs) { await page.click(`[data-p="${a}"]`); await page.click(`[data-p="${b}"]`); }
    await page.click('#wr-test');
  } else if (lab === 'cablePlan') {
    const spots = JSON.parse(await page.$eval('#lab', e => e.dataset.spots));
    for (const [i, sp] of spots.entries()) await page.click(`.cp-c[data-i="${i}"][data-c="${sp.kind === 'tv' ? 'coax' : sp.dist > 100 ? 'fiber' : 'tp'}"]`);
    await page.click('#cp-ok');
  } else if (lab === 'ipPanel') {
    const d = await page.$eval('#lab', e => ({ t: e.dataset.target, t3: e.dataset.t3, t4: e.dataset.t4 }));
    const v = d.t ? d.t.split('.').map(Number) : [172, 16 + Math.floor(Math.random() * 16), +d.t3, +d.t4];
    for (let o = 0; o < 4; o++) { const b = v[o].toString(2).padStart(8, '0'); for (let j = 0; j < 8; j++) if (b[j] === '1') await page.click(`.ip-bit[data-o="${o}"][data-j="${j}"]`); }
    await page.click('#ip-ok');
  } else if (lab === 'v6Press') {
    const orig = (await page.$eval('#lab', e => e.dataset.orig)).split(':');
    for (let i = 0; i < 8; i++) { let x = orig[i]; while (x.length > 1 && x[0] === '0') { await page.click(`.v6-ch[data-g="${i}"][data-j="0"]`); x = x.slice(1); } }
    const s = orig.map(x => x.replace(/^0+/, '') || '0'); let best = -1, bl = 1, i = 0;
    while (i < 8) { if (s[i] === '0') { let j = i; while (j < 8 && s[j] === '0') j++; if (j - i > bl) { bl = j - i; best = i; } i = j; } else i++; }
    if (best >= 0) { for (let k = best; k < best + bl; k++) await page.click(`.v6-pick[data-g="${k}"]`); await page.click('#v6-col'); }
    await page.click('#v6-ok');
  } else if (lab === 'dnsBook') {
    const dom = await page.$eval('#lab', e => e.dataset.dom);
    const want = ['host', 'org', 'cat', 'area'];
    for (let k = 0; k < 4; k++) await page.selectOption(`.dn-part select[data-i="${k}"]`, want[k]);
    await page.click('#dn-1'); await page.waitForSelector('.dn-row');
    const rows = await page.$$eval('.dn-row', trs => trs.map(t => [t.children[0].textContent, t.children[1].textContent]));
    const ip = rows.find(r => r[0] === dom)[1];
    await page.click(`.dn-row:has(td:text-is("${dom}"))`); await page.waitForSelector('.dn-s');
    await page.click(`.dn-s[data-ip="${ip}"]`);
  } else if (lab === 'mailTrip') {
    for (const [k, [st, p]] of [['mA', 'SMTP'], ['mB', 'SMTP'], ['pcB', 'POP3']].entries()) {
      await page.click(`.mt-s[data-s="${st}"]`); await page.click(`.mt-p[data-p="${p}"]`); await page.click('#mt-go');
      await page.waitForFunction(n => document.querySelectorAll('.mt-st.done').length >= n, k + 1);   // 等伺服器回覆、畫面換到下一站
    }
  } else if (lab === 'spy') {
    await page.click('.sp-m[data-m="https"]'); await page.click('#sp-go');
  } else if (lab === 'dlSim') {
    const best = await page.evaluate(() => {
      const sc = JSON.parse(document.getElementById('lab').dataset.sc), D = CARDGAME.labs._dl; let b = null;
      for (const p of D.PLAN) for (const a of D.APS) if (D.time(p, a, sc.n, sc.mb) <= sc.T && (!b || D.cost(p, a) < b.c)) b = { p: p.id, a: a.id, c: D.cost(p, a) };
      return b;
    });
    await page.click(`.dl-p[data-id="${best.p}"]`); await page.click(`.dl-a[data-id="${best.a}"]`); await page.click('#dl-go');
  } else if (lab === 'barcodeScan') {
    await page.click('#bc-scan'); await page.waitForSelector('#bc-ok:not([disabled])', { timeout: 6000 });
    const b = (await page.$$eval('.bc-code i', is => is.map(i => i.className === 'k' ? '1' : '0'))).join('');
    await page.fill('#bc-ans', String(parseInt(b, 2))); await page.click('#bc-ok');
  } else if (lab === 'barcodePrint') {
    const d = +(await page.$eval('#lab', e => e.dataset.d)), b = d.toString(2).padStart(8, '0');
    for (let j = 0; j < 8; j++) if (b[j] === '1') await page.click(`.bc-cell[data-i="${j}"]`);
    await page.click('#bc-pok');
  } else throw new Error('不認得的實驗站 ' + lab);
}
