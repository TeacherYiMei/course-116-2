/* =====================================================================
   🐍 Python 畢旅籌備處（pylab）設定 ── 和闖關網站（11601／11602）完全分開
   ---------------------------------------------------------------------
   · index.html 🎒 學生版：填班級座號姓名、上一關 2⭐ 才開下一關、🧾 成績卡下載
   · teacher.html 🧑‍🏫 教師試用版：不用登入、10 關全開、每一關都有「📮 回報問題」（寫進老師的 Google 試算表）
   · 關卡、測資和闖關網站的單元二是同一份（private/11601/content/python.js），評分一樣在驗證伺服器，測資看不到
   · 成績和草稿只存在這台電腦的瀏覽器
   ===================================================================== */
window.CONFIG = {
  TERM: '11601',                          // 題庫：上學期單元二（驗證伺服器用這個學期的測資評分）
  VERIFY_URL: 'https://script.google.com/macros/s/AKfycbx4uYlffS8uiRtjUoNQihvUc__v5-oYPpgNRdhFGUd5dnYrqd4m3bAuVXzhSS9vmOha8A/exec',
  PYODIDE_URL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
  TITLE: '🐍 Python 畢旅籌備處 · 教師試用版',   // teacher.html
  TITLE_STUDENT: 'Python 畢旅籌備處',              // index.html（學生版）
  AUTHOR: '出題老師',                      // 回報給誰（畫面上的稱呼，可以改成自己的名字）
  REF_URL: '../11601/pyref.html'          // 📚 語法小抄（另開分頁）
};
