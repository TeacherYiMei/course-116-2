/* =====================================================================
   🧪 在自己電腦模擬 Google Apps Script 驗證伺服器（開發、測試用）
   ---------------------------------------------------------------------
   載入 private/server/*.js（node tools/build.mjs 產生的整包），補上 Apps Script 的內建服務：
   CacheService、LockService、PropertiesService、Utilities、ContentService（SpreadsheetApp 不模擬，紀錄功能會自動略過）
   用法：
     import { createGas } from './gas-mock.mjs';
     const gas = createGas();          // 預設讀 private/server
     const text = gas.post('{"a":"ping"}');   // 回傳 JSON 字串（和網頁收到的一樣）
     gas.ctx                           // 伺服器的全域（測試可以直接看 run 的狀態：gas.run(id)）
   ===================================================================== */
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function createGas(dir = path.join(ROOT, 'private', 'server')) {
  const single = /\.(gs|js)$/.test(dir);   // 也可以直接給「一鍵貼上」的單一檔案（驗證合併版能跑）
  if (!single && !fs.existsSync(path.join(dir, '90_answers.js'))) throw new Error('找不到 ' + dir + '/90_answers.js —— 先執行 node tools/build.mjs');
  const cache = new Map(), props = new Map(), books = new Map();
  const cell = x => (x instanceof Date ? x.toISOString() : x);
  function tab(rows) { return { getLastRow: () => rows.length, appendRow: r => { rows.push(r.map(cell)); },
    getDataRange: () => ({ getValues: () => rows.map(r => r.slice()) }),
    getRange: (r, c, n, m) => ({ setValues: vs => { vs.forEach((v, i) => { const row = rows[r - 1 + i] || (rows[r - 1 + i] = []); v.forEach((x, j) => { row[c - 1 + j] = cell(x); }); }); } }) }; }
  function book(id) { const b = books.get(id); return { getId: () => id, getName: () => b.name,
    getSheetByName: n => (b.tabs.has(n) ? tab(b.tabs.get(n)) : null), insertSheet: n => { b.tabs.set(n, []); return tab(b.tabs.get(n)); } }; }
  const ctx = {
    console,
    CacheService: { getScriptCache: () => ({
      get: k => { const e = cache.get(k); if (!e) return null; if (e.exp < Date.now()) { cache.delete(k); return null; } return e.v; },
      put: (k, v, ttl) => { if (String(v).length > 100000) throw new Error('Argument too large: value'); cache.set(k, { v: String(v), exp: Date.now() + (ttl || 600) * 1000 }); },
      remove: k => cache.delete(k)
    }) },
    LockService: { getScriptLock: () => ({ tryLock: () => true, waitLock: () => {}, releaseLock: () => {} }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => (props.has(k) ? props.get(k) : null), setProperty: (k, v) => { props.set(k, String(v)); } }) },
    Utilities: {
      getUuid: () => crypto.randomUUID(),
      computeHmacSha256Signature: (text, key) => [...crypto.createHmac('sha256', key).update(text, 'utf8').digest()].map(b => (b > 127 ? b - 256 : b)),
      base64EncodeWebSafe: bytes => Buffer.from(bytes.map(b => b & 255)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_')
    },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: s => ({ setMimeType() { return this; }, getContent: () => s }) },
    SpreadsheetApp: {   // 簡單的記憶體試算表（回報、pylab 學生進度用）：create／openById／getSheetByName／insertSheet／appendRow／getDataRange／getRange().setValues
      create: name => { const id = 'sheet' + (books.size + 1); books.set(id, { name, tabs: new Map() }); return book(id); },
      openById: id => { if (!books.has(id)) throw new Error('找不到試算表 ' + id); return book(id); }
    }
  };
  vm.createContext(ctx);
  if (single) vm.runInContext(fs.readFileSync(dir, 'utf8'), ctx, { filename: path.basename(dir) });
  else for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort()) vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f });
  return {
    ctx,
    post: body => ctx.doPost({ postData: { contents: String(body || '') } }).getContent(),
    call: (a, data = {}) => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify({ a, ...data }) } }).getContent()),
    run: id => { const e = cache.get('run:' + id); return e ? JSON.parse(e.v) : null; },
    runs: () => [...cache.keys()].filter(k => k.startsWith('run:')).map(k => JSON.parse(cache.get(k).v)),
    setRun: run => cache.set('run:' + run.id, { v: JSON.stringify(run), exp: Date.now() + 6 * 3600e3 }),
    sheet: (id, name) => { const b = books.get(id || props.get('FEEDBACK_SHEET_ID')); return b ? b.tabs.get(name || '老師回報') || null : null; },   // 測試看回報寫進去沒
    props
  };
}
