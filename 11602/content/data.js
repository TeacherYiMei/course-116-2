/* ⚠️ 自動產生，請勿手改。來源：private/11602/content/data.js（私有，不進 git）；產生方式：node tools/build.mjs
   公開版只有題目：答案、解說、提示、預期輸出都在驗證伺服器（server/，見 server/README.md）。 */
window.DATA_LEVELS = [
 {
  "id": "D1",
  "icon": "🗄️",
  "title": "大數據與資訊",
  "book": "3-1 大數據、資料與資訊",
  "learn": "<b>大數據的 5V 特性</b>：<ul><li>📦 <b>資料量大</b>（Volume）</li><li>🎨 <b>資料多樣性</b>（Variety）：文字、照片、影片、感測數值…</li><li>⏱️ <b>資料即時性</b>（Velocity）：不斷產生、需要快速處理</li><li>✅ <b>資料真實性</b>（Veracity）：資料要可信</li><li>💎 <b>資料價值性</b>（Value）：能從中找出有用的東西</li></ul><b>資料</b>是<span class=\"hl\">還沒處理過</span>的內容；<b>資訊</b>是資料經過整理、分析之後，<span class=\"hl\">能幫我們做判斷</span>的結果。",
  "stages": [
   {
    "goal": "5V 與資料／資訊",
    "rounds": [
     {
      "type": "sort",
      "src": "11602/D1/0/0",
      "prompt": "這個例子最能說明大數據的哪一個 V？",
      "buckets": [
       {
        "id": "vol",
        "label": "量大",
        "icon": "📦"
       },
       {
        "id": "var",
        "label": "多樣",
        "icon": "🎨"
       },
       {
        "id": "vel",
        "label": "即時",
        "icon": "⏱️"
       },
       {
        "id": "ver",
        "label": "真實",
        "icon": "✅"
       },
       {
        "id": "val",
        "label": "價值",
        "icon": "💎"
       }
      ],
      "items": [
       {
        "t": "影音平臺每分鐘有數百小時的新影片上傳",
        "icon": "📹"
       },
       {
        "t": "文字留言、照片、影片、打卡位置都一起分析",
        "icon": "🗂️"
       },
       {
        "t": "導航 App 每幾秒就更新一次路況",
        "icon": "🗺️"
       },
       {
        "t": "先排除假帳號和灌水評論，結果才可信",
        "icon": "🧹"
       },
       {
        "t": "從消費紀錄找出暢銷商品，決定下個月進貨",
        "icon": "🛒"
       }
      ]
     },
     {
      "type": "sort",
      "src": "11602/D1/0/1",
      "prompt": "這是「資料」還是「資訊」？",
      "buckets": [
       {
        "id": "data",
        "label": "資料",
        "icon": "🔢"
       },
       {
        "id": "info",
        "label": "資訊",
        "icon": "💡"
       }
      ],
      "items": [
       {
        "t": "36.5、37.2、38.1、36.8（一串體溫數字）",
        "icon": "🌡️"
       },
       {
        "t": "全班今天有 1 人發燒，需要通報",
        "icon": "📢"
       },
       {
        "t": "問卷收回的 300 份原始回答",
        "icon": "📋"
       },
       {
        "t": "七成同學最想去的畢旅地點是花蓮",
        "icon": "🏞️"
       },
       {
        "t": "每個人每天走了幾步的紀錄",
        "icon": "👣"
       },
       {
        "t": "這週全班平均步數比上週多 20%",
        "icon": "📈"
       }
      ]
     }
    ]
   },
   {
    "goal": "🧪 資料變資訊：從體溫紀錄算出能做決定的資訊（🎲 資料每次不同）",
    "rounds": [
     {
      "type": "lab",
      "lab": "dataToInfo",
      "n": 1,
      "prompt": "資料 → 資訊",
      "src": "11602/D1/1/0"
     }
    ]
   },
   {
    "goal": "🧪 兩週步數：平均、成長率、結論（🎲）",
    "rounds": [
     {
      "type": "lab",
      "lab": "dataToInfo",
      "n": 1,
      "prompt": "資料 → 資訊：挑戰",
      "hard": true,
      "src": "11602/D1/2/0"
     }
    ]
   }
  ]
 },
 {
  "id": "D2",
  "icon": "🧹",
  "title": "資料清潔隊",
  "book": "3-1 資料前處理",
  "learn": "資料處理流程：<b>資料前處理</b>（資料整合 → 資料清理 → 資料轉換）→ <b>資料分析與解釋</b>。<ul><li><b>資料整合</b>：把不同來源的資料調整後放進同一個檔案</li><li><b>資料清理</b>：處理<span class=\"hl\">不完整</span>（漏填）和<span class=\"hl\">有雜訊</span>（不合理，例如年齡 200 歲）的資料。方法有<b>直接刪除法</b>（資料很多、有問題的很少時）和<b>填補法</b></li><li><b>資料轉換</b>：把單位、格式統一，例如日期都寫成「1970/4/2」、手機號碼都是 10 碼不加「-」</li></ul>",
  "stages": [
   {
    "goal": "資料處理流程與資料的問題",
    "rounds": [
     {
      "type": "order",
      "src": "11602/D2/0/0",
      "prompt": "把資料處理的流程排好",
      "hint": "依序點選：先點第一步。",
      "items": [
       {
        "t": "資料清理",
        "icon": "🧹"
       },
       {
        "t": "資料分析與解釋",
        "icon": "📊"
       },
       {
        "t": "資料轉換",
        "icon": "🔄"
       },
       {
        "t": "資料整合",
        "icon": "🧺"
       }
      ]
     },
     {
      "type": "sort",
      "src": "11602/D2/0/1",
      "prompt": "這筆資料有什麼問題？",
      "buckets": [
       {
        "id": "miss",
        "label": "不完整",
        "icon": "🕳️"
       },
       {
        "id": "noise",
        "label": "有雜訊",
        "icon": "⚡"
       },
       {
        "id": "fmt",
        "label": "格式不一致",
        "icon": "🔀"
       }
      ],
      "items": [
       {
        "t": "顧客資料的「性別」欄位是空白",
        "icon": "👤"
       },
       {
        "t": "會員年齡填了 200 歲",
        "icon": "🎂"
       },
       {
        "t": "顧客生日是 1877/2/28",
        "icon": "📅"
       },
       {
        "t": "有人寫 1970.04.02，有人寫 1970/4/2",
        "icon": "🗓️"
       },
       {
        "t": "手機號碼多了 1 碼",
        "icon": "📱"
       },
       {
        "t": "消費日有的寫「1月1日」，有的寫「1/1」",
        "icon": "🧾"
       }
      ]
     },
     {
      "type": "sort",
      "src": "11602/D2/0/2",
      "prompt": "這個情況用哪一種處理方式最合適？",
      "buckets": [
       {
        "id": "del",
        "label": "直接刪除",
        "icon": "🗑️"
       },
       {
        "id": "fill",
        "label": "填補",
        "icon": "🩹"
       },
       {
        "id": "conv",
        "label": "統一轉換",
        "icon": "🔄"
       }
      ],
      "items": [
       {
        "t": "10 萬筆資料裡只有 3 筆缺了關鍵欄位",
        "icon": "📚"
       },
       {
        "t": "全班只有 30 人，其中 1 人某一科成績漏登",
        "icon": "📝"
       },
       {
        "t": "身高有人用公尺（1.58）、有人用公分（158）",
        "icon": "📏"
       }
      ]
     }
    ]
   },
   {
    "goal": "🧪 資料清潔隊：找出每一筆會員資料的問題（🎲）",
    "rounds": [
     {
      "type": "lab",
      "lab": "cleanLab",
      "n": 1,
      "prompt": "資料清潔隊",
      "src": "11602/D2/1/0"
     }
    ]
   },
   {
    "goal": "🧪 動手清：刪除雜訊、平均填補、統一日期（🎲）",
    "rounds": [
     {
      "type": "lab",
      "lab": "cleanLab",
      "n": 1,
      "prompt": "資料清潔隊：挑戰",
      "hard": true,
      "src": "11602/D2/2/0"
     }
    ]
   }
  ]
 },
 {
  "id": "D3",
  "icon": "🔄",
  "title": "檔案轉換站",
  "book": "3-2 開放文件格式、科技廣角：資料壓縮、文字與語音轉換",
  "learn": "<ul><li>📄 <b>開放文件格式（ODF）</b>：可以<span class=\"hl\">跨平臺、跨應用程式</span>開啟，不怕軟體改版打不開。文字文件 <code>.odt</code>、試算表 <code>.ods</code>、簡報 <code>.odp</code></li><li>🗜️ <b>無失真壓縮</b>：壓縮後<span class=\"hl\">可以完全還原</span>，例如 PNG、TIFF、WAV、FLAC、ZIP、RAR</li><li>📉 <b>失真壓縮</b>：壓縮比高、檔案小，但<span class=\"hl\">無法還原</span>，例如 JPEG、MP3</li><li>🗣️ <b>語音轉文字</b>（語音辨識）與 🔊 <b>文字轉語音</b>（語音合成）</li></ul>",
  "stages": [
   {
    "goal": "檔案格式、壓縮、語音轉換",
    "rounds": [
     {
      "type": "sort",
      "src": "11602/D3/0/0",
      "prompt": "這個檔案是哪一種文件？",
      "buckets": [
       {
        "id": "doc",
        "label": "文字文件",
        "icon": "📝"
       },
       {
        "id": "sheet",
        "label": "試算表",
        "icon": "📊"
       },
       {
        "id": "slide",
        "label": "簡報",
        "icon": "📽️"
       }
      ],
      "items": [
       {
        "t": "畢旅心得.odt",
        "icon": "📄"
       },
       {
        "t": "模擬考統計.ods",
        "icon": "📄"
       },
       {
        "t": "專題發表.odp",
        "icon": "📄"
       },
       {
        "t": "班費收支.xlsx",
        "icon": "📄"
       },
       {
        "t": "畢業致詞.docx",
        "icon": "📄"
       }
      ]
     },
     {
      "type": "sort",
      "src": "11602/D3/0/1",
      "prompt": "這種格式是失真還是無失真壓縮？",
      "buckets": [
       {
        "id": "lossless",
        "label": "無失真",
        "icon": "🗜️"
       },
       {
        "id": "lossy",
        "label": "失真",
        "icon": "📉"
       }
      ],
      "items": [
       {
        "t": "PNG 圖片",
        "icon": "🖼️"
       },
       {
        "t": "JPEG 照片",
        "icon": "📷"
       },
       {
        "t": "MP3 音樂",
        "icon": "🎵"
       },
       {
        "t": "WAV 錄音檔",
        "icon": "🎙️"
       },
       {
        "t": "ZIP 壓縮檔",
        "icon": "🗃️"
       },
       {
        "t": "FLAC 音樂",
        "icon": "🎼"
       }
      ]
     },
     {
      "type": "sort",
      "src": "11602/D3/0/2",
      "prompt": "這是語音轉文字，還是文字轉語音？",
      "buckets": [
       {
        "id": "stt",
        "label": "語音 → 文字",
        "icon": "🗣️"
       },
       {
        "id": "tts",
        "label": "文字 → 語音",
        "icon": "🔊"
       }
      ],
      "items": [
       {
        "t": "對手機說話，自動打出訊息",
        "icon": "📱"
       },
       {
        "t": "導航 App 唸出「前方路口右轉」",
        "icon": "🧭"
       },
       {
        "t": "會議錄音自動產生逐字稿",
        "icon": "📝"
       },
       {
        "t": "電子書的「朗讀」功能",
        "icon": "📖"
       }
      ]
     }
    ]
   },
   {
    "goal": "🧪 壓縮機：把黑白格子編成數字（🎲 圖案每次不同）",
    "rounds": [
     {
      "type": "lab",
      "lab": "rleLab",
      "n": 1,
      "prompt": "連續長度編碼",
      "src": "11602/D3/1/0"
     }
    ]
   },
   {
    "goal": "🧪 解壓縮：照數字把圖畫回來（🎲）",
    "rounds": [
     {
      "type": "lab",
      "lab": "rleLab",
      "n": 1,
      "prompt": "解壓縮：挑戰",
      "hard": true,
      "src": "11602/D3/2/0"
     }
    ]
   }
  ]
 },
 {
  "id": "D4",
  "icon": "🔐",
  "title": "密碼特務入門",
  "book": "3-2 加密：凱薩密碼、維吉尼亞密碼",
  "learn": "<b>加密</b>用<span class=\"hl\">金鑰</span>把看得懂的<b>明文</b>變成看不懂的<b>密文</b>；解密則反過來。<ul><li>🎡 <b>凱薩密碼</b>：每個字母都往後移<span class=\"hl\">固定</span>的格數（金鑰），例如金鑰 3：A→D、B→E…，Z 會繞回 C</li><li>📜 <b>維吉尼亞密碼</b>：改良凱薩密碼，<span class=\"hl\">每個位置用不同的金鑰</span>，依序循環。課本的「加密法 1」：第 1 個字母金鑰 1、第 2 個金鑰 2…，TAIWAN → UCLAFT</li></ul>下面的題目有轉盤和密碼表可以用，全部用大寫英文作答。",
  "stages": [
   {
    "goal": "用轉盤和密碼表：凱薩、維吉尼亞",
    "rounds": [
     {
      "type": "type",
      "src": "11602/D4/0/0",
      "prompt": "凱薩密碼：用轉盤把位移調好再作答",
      "tool": "caesar",
      "items": [
       {
        "t": "加密 CAT，金鑰 3",
        "icon": "🔒",
        "ph": "輸入密文",
        "hint": "把轉盤調到位移 3，上排找明文、下排讀密文。"
       },
       {
        "t": "解密 KHOOR，金鑰 3",
        "icon": "🔓",
        "ph": "輸入明文",
        "hint": "解密要反過來：在下排找密文，讀上排的明文。"
       },
       {
        "t": "加密 ZOO，金鑰 2",
        "icon": "🔒",
        "ph": "輸入密文",
        "hint": "Z 的下一個是 A，再下一個是 B。"
       },
       {
        "t": "解密 VFKRRO，金鑰 3",
        "icon": "🔓",
        "ph": "輸入明文"
       }
      ]
     },
     {
      "type": "type",
      "src": "11602/D4/0/1",
      "prompt": "維吉尼亞密碼（加密法 1：第 n 個字母的金鑰就是 n）",
      "tool": "vigenere",
      "items": [
       {
        "t": "加密 CODE",
        "sub": "金鑰依序是 1、2、3、4",
        "icon": "📜",
        "ph": "輸入密文",
        "hint": "每個字母往後移的格數都不一樣：第 1 個移 1、第 2 個移 2…"
       },
       {
        "t": "加密 AAAA",
        "sub": "金鑰依序是 1、2、3、4",
        "icon": "📜",
        "ph": "輸入密文"
       }
      ]
     }
    ]
   },
   {
    "goal": "🎲 隨機單字、隨機金鑰的凱薩密碼",
    "rounds": [
     {
      "type": "gen",
      "gen": "caesarEnc",
      "n": 2,
      "max": 5,
      "prompt": "凱薩加密",
      "tool": "caesar",
      "src": "11602/D4/1/0"
     },
     {
      "type": "gen",
      "gen": "caesarDec",
      "n": 1,
      "prompt": "凱薩解密",
      "tool": "caesar",
      "src": "11602/D4/1/1"
     }
    ]
   },
   {
    "goal": "🎲 加密法 1（第 n 個字母金鑰 n）＋暴力破解",
    "rounds": [
     {
      "type": "gen",
      "gen": "vigEnc",
      "n": 2,
      "seq": true,
      "prompt": "維吉尼亞加密法 1",
      "tool": "vigenere",
      "src": "11602/D4/2/0"
     },
     {
      "type": "gen",
      "gen": "bruteForce",
      "n": 1,
      "prompt": "不知道金鑰，暴力破解",
      "tool": "caesar",
      "src": "11602/D4/2/1"
     }
    ]
   }
  ]
 }
];
