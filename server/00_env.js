/* =====================================================================
   course_116 答案驗證伺服器（Google Apps Script 網頁應用程式）
   ---------------------------------------------------------------------
   ★ 判斷對錯、❤️ 次數、星星、隨機出題、實驗站情境都在這裡；前端只拿到「題目」。
   ★ 這個資料夾（server/）是公開的程式；答案資料 90_answers.js 由 tools/build.mjs 從 private/ 產生，
     放在 private/server/（不進 Git），部署時一起推上 Apps Script。
   ★ 檔案依檔名順序載入（Apps Script 的全域範圍是共用的）。
   部署步驟見 server/README.md。
   ===================================================================== */
var window = globalThis;                         // 共用的出題器、試算表引擎寫的是 window.xxx
var CARDGAME = window.CARDGAME = window.CARDGAME || { gens: {}, tools: {} };
var SV = { labs: {}, VERSION: '2026-09-29' };      // 伺服器端的實驗站、工具
