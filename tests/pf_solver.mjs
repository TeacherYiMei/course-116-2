// 🧪 系統平臺大冒險・實驗站解題器：情境藏在伺服器，解題器看模擬伺服器裡的 sec（lastLab()），照課本規則做出正確操作
import { lastLab, gas } from './harness.mjs';
export async function solvePfLab(page) {
  await page.waitForSelector('#lab[data-lab]', { timeout: 10000 });   // 實驗站的情境由伺服器產生：等畫面畫好
  const lab = await page.$eval('#lab', e => e.dataset.lab);
  const ds = await page.$eval('#lab', e => ({ ...e.dataset }));
  const S = lastLab().sec, PF = gas.ctx.SV._pf;
  if (lab === 'platformBuilder') {
    const t = S.task, app = PF.APP.find(a => a.id === t.app), hw = PF.HW.find(h => h.id === (t.small ? 'watch' : t.carry ? 'phone' : 'desk'));
    const os = hw.os.find(o => app.os.includes(o));
    for (const [k, v] of [['app', t.app], ['os', os], ['hw', hw.id], ['type', hw.type]]) await page.click(`.pb-o[data-k="${k}"][data-v="${v}"]`);
    await page.click('#pb-ok');
  } else if (lab === 'fiveUnits') {   // 每一步都等伺服器確認
    let c = 0;
    for (const [k, u] of S.steps.entries()) {
      await page.click(`.fu-u[data-u="${u}"]`);
      await page.waitForFunction(n => document.querySelectorAll('#fu-path .chip').length >= n, k + 1);
      if (u === 'alu') { await page.fill('#fu-ans', String(S.task.calc[c++].v)); await page.click('#fu-go'); await page.waitForSelector('#fu-calc .note'); }
    }
  } else if (lab === 'memPlan') {
    const items = JSON.parse(ds.items);
    const order = items.map((_, i) => i).filter(i => !items[i].keep).sort((a, b) => items[b].n - items[a].n);
    const place = items.map(it => it.keep ? 'disk' : null);
    order.forEach((i, k) => { place[i] = k < 2 ? 'cache' : k < 5 ? 'ram' : 'disk'; });
    for (const [i, l] of place.entries()) await page.click(`.mp-b[data-i="${i}"][data-l="${l}"]`);
    await page.click('#mp-ok');
  } else if (lab === 'pcBuild') {
    const b = PF.pcCheapest(S.need), sel = { cpu: b.cpu.id, ram: b.ram.id, disk: b.disk.id };
    for (const k of ['cpu', 'ram', 'disk']) await page.click(`.pc-o[data-k="${k}"][data-id="${sel[k]}"]`);
    await page.click('#pc-ok');
  } else if (lab === 'osManager') {
    const st = JSON.parse(ds.state);
    const free = st.TOTAL - st.osG - st.run.reduce((a, p) => a + p.g, 0);
    const cand = st.run.map((_, i) => i).filter(i => i !== st.keepI).sort((a, b) => st.run[b].g - st.run[a].g);
    let got = free;
    for (const i of cand) {
      if (got >= st.newP.g) break;
      if (!st.run[i].saved) await page.click(`.om-save[data-i="${i}"]`);
      await page.click(`.om-x[data-i="${i}"]`); got += st.run[i].g;
    }
    await page.click('#om-go');
  } else if (lab === 'pcDoctor') {   // 伺服器知道哪個軟體不用、哪個程式當掉
    const st = S.st;
    for (const k of S.keys) {
      if (k === 'disk') {
        await page.click('.dr-t[data-t="clean"]'); await page.click('#dr-clean');
        let used = st.used - st.temp;
        await page.click('.dr-t[data-t="uninst"]');
        for (const [i, a] of st.apps.entries()) if (!a.need && used > 85) { await page.click(`.dr-un[data-i="${i}"]`); used -= a.g; }
      }
      if (k === 'update') { await page.click('.dr-t[data-t="update"]'); await page.click('#dr-upd'); }
      if (k === 'fw') { await page.click('.dr-t[data-t="fw"]'); await page.click('#dr-fw'); }
      if (k === 'backup') { await page.click('.dr-t[data-t="backup"]'); await page.click('.dr-bk[data-b="ext"]'); }
      if (k === 'hang') { await page.click('.dr-t[data-t="task"]'); await page.click(`.dr-end[data-i="${st.procs.findIndex(p => p.hang)}"]`); }
    }
    await page.click('#dr-ok');
  } else if (lab === 'cloudPizza') {
    const svc = S.svc, n = { iaas: 2, paas: 4, saas: 5 }[svc];
    await page.click(`.cz-s[data-s="${svc}"]`);
    for (let i = 0; i < 5; i++) await page.click(`.cz-w[data-i="${i}"][data-w="${i < n ? 'cloud' : 'me'}"]`);
    await page.click('#cz-ok');
  } else if (lab === 'embedded') {
    const d = PF.DEVS[S.di], lt = d.op === '<';
    const [op, v] = S.mode === 'incl' ? (lt ? ['<', S.v + 1] : ['>', S.v - 1]) : [d.op, S.v];
    await page.selectOption('#em-s', d.s); await page.selectOption('#em-o', op); await page.fill('#em-n', String(v)); await page.selectOption('#em-a', d.a);
    await page.click('#em-run');
  } else throw new Error('不認得的實驗站 ' + lab);
}
