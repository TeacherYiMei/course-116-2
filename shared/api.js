/* =====================================================================
   🔐 驗證伺服器（Google Apps Script）連線 ── API.call(動作, 資料)
   ---------------------------------------------------------------------
   答案只在伺服器：前端送出學生的操作，伺服器判斷對錯、扣 ❤️、發星星。
   · 網址：config.js 的 VERIFY_URL（部署 Apps Script 網頁應用程式後拿到的 …/exec）
           在自己電腦（localhost）開的話，一律用本機的模擬伺服器 /__gas（網址加 ?gas=live 才連真的）
   · 連不上伺服器 → 練習模式：可以看題目、動手做，但不判斷、不記星（API.online 為 false）
   · 用 text/plain 送 JSON：瀏覽器不會先送 OPTIONS 預檢，Apps Script 才收得到
   ===================================================================== */
(function () {
  var C = window.CONFIG || {}, state = null, waiters = [];
  function url() {   // 自己電腦預覽（localhost）一律用本機模擬伺服器；網址加 ?gas=live 才連真的伺服器
    var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    if (local && !/[?&]gas=live\b/.test(location.search)) return '/__gas';
    return C.VERIFY_URL || '';
  }
  function post(body, ms) {
    var u = url(); if (!u) return Promise.reject({ err: 'offline' });
    var ctl = window.AbortController ? new AbortController() : null, timer = ctl && setTimeout(function () { ctl.abort(); }, ms || 20000);
    return fetch(u, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), redirect: 'follow', signal: ctl ? ctl.signal : undefined, credentials: 'omit' })
      .then(function (r) { if (!r.ok) throw { err: 'http-' + r.status }; return r.json(); })
      .catch(function (e) { throw e && e.err ? e : { err: 'offline' }; })
      .then(function (o) { if (timer) clearTimeout(timer); if (o && o.err) throw o; return o; }, function (e) { if (timer) clearTimeout(timer); throw e; });
  }
  /* ⏳ 等伺服器的時候（Apps Script 每次約 1～2 秒）：畫面下方顯示「伺服器判斷中…」，免得學生以為當掉一直按 */
  var pending = 0;
  function wait(d) {
    pending = Math.max(0, pending + d);
    if (!document.getElementById('api-wait-css')) {
      var st = document.createElement('style'); st.id = 'api-wait-css';
      st.textContent = 'html.api-wait,html.api-wait *{cursor:progress}html.api-wait body::after{content:"⏳ 伺服器判斷中…";position:fixed;left:50%;bottom:1rem;transform:translateX(-50%);' +
        'background:#0f172a;color:#fff;padding:.45rem 1rem;border-radius:999px;font-weight:800;font-size:.95rem;z-index:9999;pointer-events:none;opacity:0;animation:apiw .2s .35s forwards}' +
        '@keyframes apiw{to{opacity:.92}}@media (prefers-reduced-motion:reduce){html.api-wait body::after{animation:none;opacity:.92}}';
      (document.head || document.documentElement).appendChild(st);
    }
    document.documentElement.classList.toggle('api-wait', pending > 0);
  }
  /* 呼叫一個動作：成功 → 伺服器回的物件；失敗 → reject({ err: 代碼 })
     伺服器忙（很多人同時送出）自動等一下再送，最多 3 次 */
  function call(a, data, tries) {
    var body = { a: a, t: C.TERM }; for (var k in data || {}) body[k] = data[k];
    wait(1);
    return post(body).then(function (o) { wait(-1); return o; }, function (e) { wait(-1); throw e; }).catch(function (e) {
      if (e.err === 'busy' && (tries || 0) < 3) return new Promise(function (ok) { setTimeout(ok, 400 + Math.random() * 600); }).then(function () { return call(a, data, (tries || 0) + 1); });
      if (e.err === 'offline') setState(false);
      throw e;
    });
  }
  function setState(v) { state = v; API.online = v; document.documentElement.classList.toggle('offline', !v); }
  /* 開頁面時問一次伺服器在不在（ping），結果快取在 API.online */
  function ready() {
    if (state != null) return Promise.resolve(state);
    if (waiters.length) return new Promise(function (ok) { waiters.push(ok); });
    return new Promise(function (ok) {
      waiters.push(ok);
      post({ a: 'ping', t: C.TERM }, 8000).then(function () { setState(true); }, function () { setState(false); })
        .then(function () { var w = waiters; waiters = []; w.forEach(function (f) { f(state); }); });
    });
  }
  /* 錯誤代碼 → 給學生看的話 */
  var MSG = {
    offline: '連不上驗證伺服器（可能沒網路）。現在是練習模式：可以做，但不判斷對錯、不記星。',
    'run-expired': '這一局放太久了（超過 6 小時），重新開始一次吧。',
    dead: '❤️ 用完了，這一局結束，重新挑戰吧！',
    busy: '伺服器很忙，等幾秒再按一次。',
    incomplete: '還有題目沒完成喔！',
    'too-many': '這題試太多次了，換下一題吧。',
    'no-term': '伺服器還沒有這學期的題庫（請老師更新伺服器）。'
  };
  function msg(e) { var c = e && e.err || 'server'; return MSG[c] || '伺服器回了一個錯誤（' + c + '），請跟老師說。'; }
  window.API = { url: url, call: call, ready: ready, msg: msg, online: null, retry: function () { state = null; } };   // retry：下次 ready() 重新問一次
})();
