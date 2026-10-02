#!/usr/bin/env node
/* =====================================================================
   本機預覽：網站＋模擬的驗證伺服器（不用部署 Apps Script 也能完整試玩）
   ---------------------------------------------------------------------
   用法（在 repo 根目錄）：  node tools/build.mjs      （先產生 private/server/）
                            node tools/dev-server.mjs   → 打開 http://localhost:8116/
   網頁在 localhost 時，shared/api.js 會自動把答案送到這裡的 /__gas（見 tools/gas-mock.mjs）。
   PORT=8200 node tools/dev-server.mjs 可以換埠號；NOGAS=1 模擬「連不上伺服器」（練習模式）。
   ===================================================================== */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createGas } from './gas-mock.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = +process.env.PORT || 8116;
const gas = process.env.NOGAS ? null : createGas();
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.mjs': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp', '.md': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.wasm': 'application/wasm', '.zip': 'application/zip', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4' };

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/__gas') {
    if (!gas) { res.writeHead(503); return res.end(); }
    if (req.method !== 'POST') { res.writeHead(200, { 'content-type': 'application/json' }); return res.end(gas.post('{"a":"ping"}')); }
    let body = '';
    req.on('data', c => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on('end', () => { res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' }); res.end(gas.post(body)); });
    return;
  }
  let file = path.join(ROOT, path.normalize(url).replace(/^([/\\])+/, ''));
  if (!file.startsWith(ROOT) || /[/\\](private|\.git|node_modules)([/\\]|$)/.test(path.relative(ROOT, file).replace(/^/, '/'))) { res.writeHead(403); return res.end('forbidden'); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, '127.0.0.1', () => console.log('▶ http://localhost:' + PORT + '/' + (gas ? '（含模擬驗證伺服器 /__gas）' : '（NOGAS：練習模式）')));
