/* =====================================================================
   116-1 上學期設定（單一來源）
   ---------------------------------------------------------------------
   ★ 換學期、改單元名稱、改星數……只改這一支。
   ★ 每個頁面在其他 <script> 之前先載入：<script src="config.js"></script>
   ★ 11602/config.js 結構完全相同，差別只在內容。
   ===================================================================== */
window.CONFIG = {
  TERM: '11601',
  //   🔐 驗證伺服器（Google Apps Script 網頁應用程式的網址，…/exec）：答案、判斷、星星都在那裡（見 server/README.md）
  //   在自己電腦（localhost）預覽時一律用本機模擬伺服器（網址加 ?gas=live 才連這個）；留空＝練習模式（不判斷、不記星）
  VERIFY_URL: 'https://script.google.com/macros/s/AKfycbx4uYlffS8uiRtjUoNQihvUc__v5-oYPpgNRdhFGUd5dnYrqd4m3bAuVXzhSS9vmOha8A/exec',
  SCHOOL: '前峰國中 九年級',
  //   第 1 週的星期一（⚠️ 依 116 學年度行事曆確認後再改）
  TERM_START: '2027-08-30',
  HUB_PAGE: 'hub.html',

  /* 📚 108 課綱對照（代碼條文在 shared/k12.js）：關卡 id → 學習內容、學習表現代碼
     概念小卡上會顯示；docs/06_課綱對照.md 是整理好的總表。 */
  CURRICULUM: {
    x1: ['資D-IV-1', '資D-IV-2', '運t-IV-1'], u1: ['資D-IV-1', '資D-IV-2', '運t-IV-1'],
    x2: ['資D-IV-2', '運t-IV-1'], u2: ['資D-IV-2', '運t-IV-1'],
    x3: ['資D-IV-1', '運t-IV-1'], u3: ['資D-IV-1', '運t-IV-1'],
    x4: ['資D-IV-1', '資D-IV-3', '運t-IV-1'], u4: ['資D-IV-1', '資D-IV-3', '運t-IV-1'],
    P1: ['資P-IV-1', '運t-IV-4'], P2: ['資P-IV-1', '運t-IV-4'], P3: ['資P-IV-1', '運t-IV-4'], P4: ['資P-IV-1', '資P-IV-2', '運t-IV-4'],
    P5: ['資A-IV-1', '資P-IV-2', '運t-IV-4'], P6: ['資A-IV-1', '資P-IV-2', '運t-IV-4'], P7: ['資A-IV-1', '資P-IV-2', '運t-IV-4'],
    P8: ['資A-IV-1', '資P-IV-2', '運t-IV-4'], P9: ['資A-IV-1', '資P-IV-2', '運t-IV-4'], P10: ['資A-IV-1', '資P-IV-2', '運t-IV-3', '運t-IV-4'],
    G1: ['資S-IV-1', '運t-IV-1'], G2: ['資S-IV-2', '運t-IV-1'], G3: ['資S-IV-2', '運t-IV-1'], G4: ['資S-IV-2', '運t-IV-1'],
    G5: ['資S-IV-2', '運t-IV-2'], G6: ['資S-IV-2', '資H-IV-3', '運t-IV-2'], G7: ['資S-IV-1', '資S-IV-4', '運t-IV-1'], G8: ['資S-IV-2', '資A-IV-1', '運t-IV-4'],
    S1: ['資T-IV-2', '運t-IV-3', '運c-IV-2'], S2: ['資T-IV-2', '運t-IV-3', '運c-IV-2'], S3: ['資T-IV-2', '運t-IV-3', '運c-IV-2'], S4: ['資T-IV-2', '運t-IV-3', '運c-IV-2'], S5: ['資T-IV-2', '運t-IV-3', '運p-IV-1']
  },

  /* 📅 本週任務（闖關地圖最上面）：w＝從第幾週開始，levels＝這週要完成的關卡，href＝「前往」連結
     依 docs/01 的建議節次；段考週、放假週請自己把後面的 w 往後挪。 */
  WEEKS: [
    { w: 1, t: '系統說明、登入；單元一 1-1 二進位', levels: ['x1', 'u1'], href: 'digital/1.html' },
    { w: 2, t: '單元一 1-2 文字數位化', levels: ['x2', 'u2'], href: 'digital/2.html' },
    { w: 3, t: '單元一 1-3 音訊數位化', levels: ['x3', 'u3'], href: 'digital/3.html' },
    { w: 4, t: '單元一 1-4 影像數位化', levels: ['x4', 'u4'], href: 'digital/4.html' },
    { w: 5, t: '單元二 Python：print() 輸出、input() 與變數', levels: ['P1', 'P2'], href: 'python.html' },
    { w: 6, t: 'Python：型態轉換與算術運算', levels: ['P3'], href: 'python.html' },
    { w: 7, t: 'Python：BMI（float）、if／else', levels: ['P4', 'P5'], href: 'python.html' },
    { w: 8, t: 'Python：if／elif／else 自動購票機', levels: ['P6'], href: 'python.html' },
    { w: 9, t: 'Python：and／or、for 迴圈', levels: ['P7', 'P8'], href: 'python.html' },
    { w: 10, t: 'Python：while 條件迴圈', levels: ['P9'], href: 'python.html' },
    { w: 11, t: 'Python 魔王關：猜數字', levels: ['P10'], href: 'python.html' },
    { w: 12, t: '單元三 系統平臺：四種平臺、五大單元', levels: ['G1', 'G2'], href: 'platform.html' },
    { w: 13, t: '系統平臺：記憶體、硬碟與組電腦', levels: ['G3', 'G4'], href: 'platform.html' },
    { w: 14, t: '系統平臺：作業系統、電腦急診室', levels: ['G5', 'G6'], href: 'platform.html' },
    { w: 15, t: '系統平臺：雲端服務、嵌入式系統', levels: ['G7', 'G8'], href: 'platform.html' },
    { w: 16, t: '5016B 專題', levels: ['S1', 'S2'], href: '5016b.html' },
    { w: 18, t: '5016B 專題', levels: ['S3', 'S4', 'S5'], href: '5016b.html' }
  ],

  /* Python 執行環境（Pyodide）
     ⚠️ 學校網路擋 CDN 時：把 pyodide 整包放到 shared/pyodide/，
        這裡改成 '../shared/pyodide/'（結尾要有斜線）。 */
  PYODIDE_URL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',

  /* 備課用總開關：把 Python 的「依序開放」整個關掉。
     ⚠️ 一定要留到期日 —— 過了那天自動失效（「記得關掉」不是機制，是願望）。 */
  OPEN_ALL_UNITS: false,
  OPEN_ALL_UNTIL: '2027-08-15',

  /* 闖關地圖的卡片（順序即顯示順序）
     maxStars 是進度條的分母，一定要和這門課真的能拿到的星數一致。 */
  MODULES: [
    { id: 'digital', no: '一', title: '數位時代', sub: '0 與 1 的藝術', icon: '💾', color: 'u1',
      href: 'digital/index.html', maxStars: 24, levels: ['x1', 'u1', 'x2', 'u2', 'x3', 'u3', 'x4', 'u4'],
      desc: '二進位、文字編碼、聲音與影像的取樣和量化，四個互動實驗站：每課有 🧪 實驗任務和 ✅ 快速檢核。', chapter: '第 1 章',
      /* 四課的課程小卡（href 相對於 digital/ 資料夾；進度都存在 digital 模組；color 和各課內容的主色一致） */
      parts: [
        { id: 'd1', mod: 'digital', levels: ['x1', 'u1'], maxStars: 6, color: '#2563eb', bg: '#eff6ff', icon: '🔢', title: '1-1 二進位原理', ds: '位元、權值，十進位與二進位互換', href: '1.html' },
        { id: 'd2', mod: 'digital', levels: ['x2', 'u2'], maxStars: 6, color: '#4f46e5', bg: '#eef2ff', icon: '🔤', title: '1-2 文字數位化', ds: '摩斯電碼、ASCII、Big-5、Unicode', href: '2.html' },
        { id: 'd3', mod: 'digital', levels: ['x3', 'u3'], maxStars: 6, color: '#0d9488', bg: '#f0fdfa', icon: '🎵', title: '1-3 音訊數位化', ds: '聲波、取樣頻率、量化位元', href: '3.html' },
        { id: 'd4', mod: 'digital', levels: ['x4', 'u4'], maxStars: 6, color: '#e11d48', bg: '#fff1f2', icon: '🖼️', title: '1-4 影像數位化', ds: '像素、解析度、色彩與壓縮', href: '4.html' }
      ] },
    { id: 'python', no: '二', title: '進入 Python 的世界', sub: 'Python 畢旅冒險・10 關 26 挑戰', icon: '🐍', color: 'u2',
      href: 'python.html', maxStars: 26, levels: ['P1','P2','P3','P4','P5','P6','P7','P8','P9','P10'], sequential: true,
      desc: '從 print、變數、input、運算、條件判斷、for、while 到綜合應用；可自由執行、逐步除錯，再用「檢查挑戰」完成任務。', chapter: '第 2 章' },
    { id: 'platform', no: '三', title: '系統平臺大冒險', sub: '8 關 · 三星三階：基礎 → 操作 → 挑戰🧪', icon: '🖥️', color: 'u3',
      href: 'platform.html', maxStars: 24, levels: ['G1','G2','G3','G4','G5','G6','G7','G8'],
      desc: '組電腦、當作業系統總管、開電腦急診室、經營雲端披薩店。', chapter: '第 3 章' },
    { id: 'arduino', no: '＋', title: '5016B 專題：AIoT 智慧教室守護站', sub: '五節 · 每節 3⭐（預測錯越少星越多）', icon: '💡', color: 'u4',
      href: '5016b.html', maxStars: 15, levels: ['S1','S2','S3','S4','S5'],
      desc: '感測器取樣、條件判斷、主迴圈、資料上雲端，最後做出自己的教室小幫手。', chapter: '跨章專題' }
  ],

  /* 稱號（依「平均完成度」%）── 遊戲化：學生看得到自己「升級」
     平均完成度＝每個計星單元各自的完成百分比，再取平均（2026-09-28 起 5016B 也算，每節 3⭐、共 15⭐）。
     這樣每個單元份量一樣：不會因為某個單元星星特別多，只玩它就能升級。 */
  RANKS: [
    [0, '🥚 數位新鮮人'],
    [15, '🐣 位元見習生'],
    [33, '🐥 程式學徒'],
    [55, '🦅 系統工程師'],
    [75, '🐉 資訊架構師'],
    [92, '👑 九年級傳說']
  ]
};
