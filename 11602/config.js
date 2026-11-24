/* =====================================================================
   116-2 下學期設定（單一來源）
   ---------------------------------------------------------------------
   ★ 換學期、改單元名稱、改星數……只改這一支。
   ★ 每個頁面在其他 <script> 之前先載入：<script src="config.js"></script>
   ★ 11602/config.js 結構完全相同，差別只在內容。
   ===================================================================== */
window.CONFIG = {
  TERM: '11602',
  //   🔐 驗證伺服器（Google Apps Script 網頁應用程式的網址，…/exec）：答案、判斷、星星都在那裡（見 server/README.md）
  //   在自己電腦（localhost）預覽時一律用本機模擬伺服器（網址加 ?gas=live 才連這個）；留空＝練習模式（不判斷、不記星）
  VERIFY_URL: 'https://script.google.com/macros/s/AKfycbx4uYlffS8uiRtjUoNQihvUc__v5-oYPpgNRdhFGUd5dnYrqd4m3bAuVXzhSS9vmOha8A/exec',
  SCHOOL: '前峰國中 九年級',
  //   第 1 週的星期一（⚠️ 依 116 學年度行事曆確認後再改）
  TERM_START: '2028-02-14',
  HUB_PAGE: 'hub.html',
  CHALLENGE_PAGE: 'challenge.html',   // 🏁 課堂挑戰（小組搶答，老師投影）：闖關地圖最下面有連結
  REVIEW_PAGE: 'review.html',         // 🎓 會考前總複習（上下學期混合抽題）：闖關地圖最下面有連結

  /* 📚 108 課綱對照（代碼條文在 shared/k12.js）：關卡 id → 學習內容、學習表現代碼
     概念小卡上會顯示；docs/06_課綱對照.md 是整理好的總表。 */
  CURRICULUM: {
    M1: ['資D-IV-1', '運t-IV-1'], M2: ['資D-IV-1', '資D-IV-3'], M3: ['資T-IV-2', '運c-IV-3'], M4: ['資H-IV-2', '資H-IV-5', '運a-IV-2'],
    A1: ['資H-IV-6', '運t-IV-1'], A2: ['資D-IV-3', '資H-IV-4', '運a-IV-2'], A3: ['資A-IV-1', '運t-IV-4'], A4: ['資H-IV-4', '資H-IV-6'],
    A5: ['資H-IV-4', '運p-IV-1', '運a-IV-1'], A6: ['資H-IV-1', '資H-IV-5', '運a-IV-2'],
    W1: ['資T-IV-2', '運p-IV-1'], W2: ['資T-IV-2', '運p-IV-1'], W3: ['資T-IV-2', '運c-IV-3'], W4: ['資T-IV-2', '資H-IV-2'], W5: ['資T-IV-2', '資H-IV-2', '運c-IV-3'],
    N1: ['資S-IV-3', '運t-IV-1'], N2: ['資S-IV-3'], N3: ['資S-IV-3', '運t-IV-1'], N4: ['資S-IV-3', '資D-IV-2'], N5: ['資S-IV-3', '資D-IV-2'],
    N6: ['資S-IV-4'], N7: ['資S-IV-4', '運p-IV-2'], N8: ['資S-IV-3'], N9: ['資S-IV-3', '運t-IV-4'], N10: ['資D-IV-2', '資H-IV-6'],
    D1: ['資D-IV-3', '資T-IV-1'], D2: ['資D-IV-3', '運t-IV-4'], D3: ['資D-IV-3'], D4: ['資H-IV-3', '資A-IV-1'],
    T1: ['資T-IV-1', '運p-IV-3'], T2: ['資T-IV-1'], T3: ['資T-IV-1', '運t-IV-4'], T4: ['資D-IV-3', '資T-IV-1'], T5: ['資T-IV-1', '運p-IV-1'],
    K1: ['資D-IV-2', '運t-IV-4'], K2: ['資A-IV-1', '運t-IV-4'], K3: ['資H-IV-3', '資A-IV-1'], K4: ['資H-IV-3', '資A-IV-1'], K5: ['資H-IV-3', '資A-IV-1'], K6: ['資T-IV-1', '資D-IV-3'],
    S1: ['資S-IV-3', '資T-IV-2'], S2: ['資S-IV-3', '資T-IV-2'], S3: ['資S-IV-3', '資T-IV-2'], S4: ['資H-IV-3', '資T-IV-2'], S5: ['資T-IV-2', '運c-IV-2']
  },

  /* 📅 本週任務（闖關地圖最上面）：w＝從第幾週開始，levels＝這週要完成的關卡，href＝「前往」連結
     依 docs/01 的建議節次；段考週、放假週請自己把後面的 w 往後挪。 */
  WEEKS: [
    { w: 1, t: '校園微電影：沿用上學期素材，討論補鏡並精剪 4 分 40 秒、字幕與配樂', levels: [], href: 'canva-travel.html' },
    { w: 2, t: '作品分享：MP4、創作心得、素材授權與完整播放確認', levels: [], href: '../shared/educase-film.html#cut' },
    { w: 3, t: '單元五 網路世界：範圍與設備、線材、封包', levels: ['N1', 'N2', 'N3'], href: 'network.html' },
    { w: 4, t: '網路世界：IP、IPv6、網址與 DNS', levels: ['N4', 'N5', 'N6'], href: 'network.html' },
    { w: 5, t: '網路世界：電子郵件、無線網路', levels: ['N7', 'N8'], href: 'network.html' },
    { w: 6, t: '網路世界收尾＋資料偵探開始', levels: ['N9', 'N10', 'D1', 'D2'], href: 'network.html' },
    { w: 7, t: '資料偵探＋試算表實作', levels: ['D3', 'D4', 'T1', 'T2'], href: 'unit6.html' },
    { w: 8, t: '試算表實作：COUNTIF、清理、統計', levels: ['T3', 'T4', 'T5'], href: 'sheet.html' },
    { w: 9, t: '密碼特務（上）', levels: ['K1', 'K2', 'K3'], href: 'cipher.html' },
    { w: 10, t: '密碼特務（下）', levels: ['K4', 'K5', 'K6'], href: 'cipher.html' },
    { w: 11, t: 'AI 素養補充：學習 AI、資訊倫理與原創內容辨識', levels: ['A1', 'A2', 'A3'], href: 'media.html#ai' },
    { w: 12, t: 'AI 素養補充：批判判讀與負責任的使用', levels: ['A4', 'A5', 'A6'], href: 'media.html#ai' },
    { w: 13, t: '5016B 守護站 2.0 前半', levels: ['S1', 'S2'], href: '5016b.html' },
    { w: 14, t: '5016B 守護站 2.0 後半', levels: ['S3', 'S4', 'S5'], href: '5016b.html' }
  ],

  /* 學校指定的 AI 工具（廣告工作站「和 AI 討論」用）
     ⚠️ 網站本身不是 AI、也不連任何 AI 服務：學生按「📋 複製」網站寫好的提示詞，
        按「↗ 開啟」到這個工具（用學校帳號登入）貼上，再把回答貼回網站。換工具只要改這裡。 */
  AI_TOOL: { name: 'Gemini 教育版', url: 'https://gemini.google.com/app', login: '學校 Google 帳號' },

  /* Python 執行環境（Pyodide）—— 下學期的密碼特務改成不寫程式的互動版，目前沒有頁面用到；保留給之後擴充
     ⚠️ 學校網路擋 CDN 時：把 pyodide 整包放到 shared/pyodide/，
        這裡改成 '../shared/pyodide/'（結尾要有斜線）。 */
  PYODIDE_URL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',

  /* 備課用總開關：把「依序開放」（密碼特務）整個關掉。
     ⚠️ 一定要留到期日 —— 過了那天自動失效（「記得關掉」不是機制，是願望）。 */
  OPEN_ALL_UNITS: false,
  OPEN_ALL_UNTIL: '2028-02-01',

  /* 闖關地圖的卡片（順序即顯示順序）
     maxStars 是進度條的分母，一定要和這門課真的能拿到的星數一致。 */
  MODULES: [
    { id: 'media', no: '四', title: '多媒體專題：280 秒校園微電影', sub: '上學期選故事與核心價值；下學期整理素材、補鏡、精剪及 AI 素養延伸', icon: '🎬', color: 'u1',
      href: 'media.html', maxStars: 30, levels: ['M1', 'M2', 'M3', 'M4', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'W1', 'W2', 'W3', 'W4', 'W5'],
      desc: '可選畢旅、校園、社區等主題，讓核心價值融入故事，整理素材並完成有意義的 280 秒原創微電影。', chapter: '跨學期創作專題' },
    { id: 'network', no: '五', title: '網路世界', sub: '10 關 · 三星三階：基礎 → 操作 → 挑戰🎲', icon: '🌐', color: 'u2',
      href: 'network.html', maxStars: 30, levels: ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8', 'N9', 'N10'],
      desc: '網路線材、封包快遞、IP 與 IPv6、網址拆解、無線網路、網速計算，還有結帳時「嗶」的祕密。', chapter: '第 2 章' },
    /* 單元六：三個部分包成一張課程小卡（parts）。單元首頁 unit6.html 再分成三張小卡；
       各部分的進度仍存在自己的 id（data／sheet／cipher），闖關地圖把它們加起來。 */
    { id: 'unit6', no: '六', title: '進階資料處理', sub: '資料偵探 → 試算表實作 → 密碼特務', icon: '🗂️', color: 'u3',
      href: 'unit6.html', maxStars: 45, chapter: '第 3 章',
      levels: ['D1', 'D2', 'D3', 'D4', 'T1', 'T2', 'T3', 'T4', 'T5', 'K1', 'K2', 'K3', 'K4', 'K5', 'K6'],
      desc: '看懂 → 動手 → 挑戰：先認識大數據與資料清理，再用小試算表寫公式統計，最後當密碼特務（🎲 每次隨機出題）。',
      parts: [
        { id: 'data', icon: '🕵️', title: '資料偵探', ds: '大數據 5V、資料清理、檔案轉換、凱薩與維吉尼亞入門', href: 'data.html',
          maxStars: 12, levels: ['D1', 'D2', 'D3', 'D4'] },
        { id: 'sheet', icon: '📊', title: '試算表實作', ds: '在網頁裡寫 SUM、AVERAGE、COUNTIF，清理資料再統計', href: 'sheet.html',
          maxStars: 15, levels: ['T1', 'T2', 'T3', 'T4', 'T5'] },
        { id: 'cipher', icon: '🔐', title: '密碼特務', ds: '不寫程式：加密、解密、暴力破解、答題統計，🎲 每次隨機', href: 'cipher.html',
          maxStars: 18, levels: ['K1', 'K2', 'K3', 'K4', 'K5', 'K6'], sequential: true }
      ] },
    { id: 'arduino', no: '＋', title: '5016B 專題：守護站 2.0 連上網路', sub: '五節 · 每節 3⭐（預測錯越少星越多）', icon: '💡', color: 'u4',
      href: '5016b.html', maxStars: 15, levels: ['S1', 'S2', 'S3', 'S4', 'S5'],
      desc: '幫上學期的智慧教室守護站選無線技術、分配 IP、傳封包、加密上傳，做出連網小幫手。', chapter: '跨章專題' }
  ],

  /* 稱號（依「平均完成度」%）── 遊戲化：學生看得到自己「升級」
     平均完成度＝每個計星單元各自的完成百分比，再取平均（2026-09-28 起 5016B 也算，每節 3⭐、共 15⭐）。
     這樣每個單元份量一樣：不會因為某個單元星星特別多，只玩它就能升級。 */
  RANKS: [
    [0, '🎒 畢業倒數中'],
    [15, '🤖 AI 見習生'],
    [33, '📡 網路探險家'],
    [55, '🕵️ 資料偵探'],
    [75, '🔐 密碼特務'],
    [92, '🎓 畢業傳說']
  ]
};
