// 測試共用：啟動瀏覽器，把 CDN 導到本機檔案（不用連網也能測）；驗證伺服器用 tools/gas-mock.mjs 在這個行程裡模擬
// 用法：cd tests && npm install && npx playwright install chromium
//       先在 repo 根目錄 node tools/build.mjs（產生 private/server/），再另開一個視窗：node tools/dev-server.mjs
//       node test_python.mjs （其他 test_*.mjs 同）
import { chromium } from 'playwright';
import { createGas } from '../tools/gas-mock.mjs';
import fs from 'fs';
import path from 'path';

const PYO = new URL('./node_modules/pyodide/', import.meta.url).pathname;
const TW = new URL('./node_modules/@tailwindcss/browser/dist/index.global.js', import.meta.url).pathname;
export const BASE = process.env.BASE || 'http://localhost:8116';
export const SHOTS = process.env.SHOTS || new URL('./shots/', import.meta.url).pathname;

const types = { '.js': 'application/javascript', '.mjs': 'application/javascript', '.wasm': 'application/wasm', '.json': 'application/json', '.zip': 'application/zip' };

/* 模擬的驗證伺服器：網頁送到 /__gas 的請求都由這裡回答；測試可以用 gas.run(id)、lastLab() 偷看伺服器狀態（解題器用） */
export const gas = createGas();
export function lastRun() { return gas.runs().sort((a, b) => a.t0 - b.t0).pop() || null; }
export function lastLab() { const r = lastRun(); if (!r || !r.labs) return null; const ks = Object.keys(r.labs); return ks.length ? r.labs[ks[ks.length - 1]] : null; }
export const stats = { calls: 0 };

export async function launch(opts = {}) {
  // opts.utf8：要檢查中文下載檔名時才開（Linux 沒設 UTF-8 語系時 Chromium 會把檔名改成「download」；Windows／macOS 的 Chrome 不會）
  const env = opts.utf8 ? { env: { ...process.env, LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8' } } : {};
  const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME, ...env } : env);
  const context = await browser.newContext({ viewport: opts.viewport || { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  await context.route('**/__gas', route => {   // opts.offline：模擬連不上伺服器（練習模式）
    if (opts.offline) return route.abort('internetdisconnected');
    stats.calls++;
    route.fulfill({ status: 200, body: gas.post(route.request().postData() || ''), headers: { 'content-type': 'application/json' } });
  });
  await context.route('https://cdn.jsdelivr.net/pyodide/**', route => {
    const f = PYO + route.request().url().split('/full/')[1].split('?')[0];
    if (!fs.existsSync(f)) return route.fulfill({ status: 404, body: 'nf' });
    route.fulfill({ status: 200, body: fs.readFileSync(f), headers: { 'content-type': types[path.extname(f)] || 'application/octet-stream', 'access-control-allow-origin': '*' } });
  });
  await context.route('https://cdn.tailwindcss.com/**', route => route.fulfill({ status: 200, body: fs.readFileSync(TW), headers: { 'content-type': 'application/javascript' } }));
  await context.route(/fonts\.(googleapis|gstatic)\.com/, route => route.fulfill({ status: 200, body: '', headers: { 'content-type': 'text/css' } }));
  return { browser, context };
}

export async function login(page, cls = '901', seat = '5', name = '測試生') {
  await page.evaluate(([c, s, n]) => localStorage.setItem('c116-profile', JSON.stringify({ cls: c, seat: String(+s).padStart(2, '0'), name: n })), [cls, seat, name]);
}

// 讀 private/ 裡的明碼內容（題目的正解只在這裡；公開網站的 content 是封存版）
import vm from 'vm';
export function priv(rel) {
  const file = new URL('../private/' + rel, import.meta.url).pathname;
  if (!fs.existsSync(file)) { console.error('找不到 private/' + rel + ' —— 測試需要老師電腦上的 private/ 資料夾'); process.exit(2); }
  const ctx = { window: {} }; ctx.window.window = ctx.window; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(file, 'utf8'), ctx);
  return ctx.window;
}

/** 🧊 冷靜一下：答錯太快或連錯時會跳出 5 秒倒數，等它倒數完按「我準備好了」 */
export async function passCool(page) {
  await page.waitForTimeout(150);
  if (!(await page.$('#cool-box'))) return false;
  await page.waitForSelector('#cool-ok:not([disabled])', { timeout: 9000 });
  await page.click('#cool-ok');
  return true;
}
