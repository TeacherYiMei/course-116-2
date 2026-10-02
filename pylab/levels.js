/* ⚠️ 自動產生，請勿手改。來源：private/11601/content/python.js（和 11601 單元二同一份）（私有，不進 git）；產生方式：node tools/build.mjs
   公開版只有題目：答案、解說、提示、預期輸出都在驗證伺服器（server/，見 server/README.md）。 */
window.PY_LEVELS = [
 {
  "id": "P1",
  "icon": "👋",
  "title": "哈囉，旅伴！",
  "concept": "print() 輸出",
  "book": "2-1 概念1 文字輸出",
  "story": "畢旅籌備處開張了！第一件事，讓電腦向大家<span class=\"hl\">打聲招呼</span>，確認你的 Python 環境可以正常運作。",
  "task": [
   "第一行顯示：<code>Hello, World!</code>",
   "第二行顯示：<code>畢業旅行，出發！</code>"
  ],
  "sample": {
   "inputs": [],
   "output": "Hello, World!\n畢業旅行，出發！"
  },
  "scratch": [
   [
    "說出 (Hello, World!)",
    "print('Hello, World!')"
   ]
  ],
  "starter": "# 在下面寫你的程式\n",
  "req": [
   {
    "need": "calls.print>=2",
    "msg": "用兩個 print( )，一個印一行"
   }
  ],
  "bonus": "試試看 print(123) 和 print('123') 有什麼不同？再試試 print(1 + 2) 和 print('1 + 2')。",
  "hn": 3,
  "tests": [
   {
    "name": "顯示兩行文字",
    "inputs": []
   }
  ]
 },
 {
  "id": "P2",
  "icon": "📝",
  "title": "畢旅報名表",
  "concept": "input() 與變數",
  "book": "2-1 任務1 自我介紹",
  "story": "報名開始！請做一個報名小程式：先問<span class=\"hl\">姓名</span>、再問<span class=\"hl\">年齡</span>，最後用一句話介紹這位同學。",
  "task": [
   "詢問「請輸入姓名：」，把答案存進變數",
   "詢問「請輸入年齡：」，把答案存進變數",
   "顯示：<code>我是○○○，今年○○歲。</code>"
  ],
  "sample": {
   "inputs": [
    "王小明",
    "15"
   ],
   "output": "請輸入姓名：王小明\n請輸入年齡：15\n我是王小明，今年15歲。"
  },
  "scratch": [
   [
    "詢問 (請輸入姓名：) 並等待",
    "name = input('請輸入姓名：')"
   ],
   [
    "變數 name 設為 (答案)",
    "（上面那一行已經存進 name 了）"
   ],
   [
    "說出 (字串組合 我是 name)",
    "print('我是' + name + …)"
   ]
  ],
  "starter": "# 1. 詢問姓名\n\n# 2. 詢問年齡\n\n# 3. 自我介紹\n",
  "req": [
   {
    "need": "calls.input>=2",
    "msg": "用兩個 input( ) 分別問姓名和年齡"
   }
  ],
  "bonus": "再多問一個「最想去的景點」，把它也放進自我介紹裡。",
  "hn": 3,
  "tests": [
   {
    "name": "小明 15 歲",
    "inputs": [
     "王小明",
     "15"
    ]
   },
   {
    "name": "Amy 14 歲",
    "inputs": [
     "Amy",
     "14"
    ]
   },
   {
    "name": "隱藏測資",
    "hidden": true
   }
  ]
 },
 {
  "id": "P3",
  "icon": "💰",
  "title": "旅費分攤",
  "concept": "型態轉換與算術運算子",
  "book": "2-1 概念 資料型態轉換、算術運算子",
  "story": "包車的錢要全班平分，<span class=\"hl\">每人付整數元</span>，除不盡的零頭由班費補。請幫總務股長算出每人要付多少、班費要補多少。",
  "task": [
   "詢問「總金額：」和「人數：」（都是整數）",
   "顯示每人要付多少元（整數，無條件捨去）",
   "顯示班費要補多少元（除不盡剩下的）"
  ],
  "sample": {
   "inputs": [
    "1000",
    "3"
   ],
   "output": "總金額：1000\n人數：3\n每人付 333 元\n班費補 1 元"
  },
  "scratch": [
   [
    "( ) / ( ) 再「無條件捨去」",
    "total // people"
   ],
   [
    "( ) 除以 ( ) 的餘數",
    "total % people"
   ],
   [
    "（Scratch 的答案可以直接算）",
    "int(input('總金額：'))  ← Python 要先轉成整數"
   ]
  ],
  "starter": "total = int(input('總金額：'))\n# 接著問人數，再算出每人付多少、班費補多少\n",
  "req": [
   {
    "need": "calls.int>=2",
    "msg": "兩個輸入都要用 int( ) 轉成整數"
   },
   {
    "need": "binops.FloorDiv>=1",
    "msg": "用 // 算每人付多少"
   },
   {
    "need": "binops.Mod>=1",
    "msg": "用 % 算零頭"
   }
  ],
  "bonus": "把 1000 秒換算成「幾分幾秒」—— 一樣是 // 和 % 的好朋友。",
  "hn": 3,
  "tests": [
   {
    "name": "1000 元 3 人",
    "inputs": [
     "1000",
     "3"
    ]
   },
   {
    "name": "2400 元 30 人",
    "inputs": [
     "2400",
     "30"
    ]
   },
   {
    "name": "隱藏測資",
    "hidden": true
   },
   {
    "name": "隱藏測資",
    "hidden": true
   }
  ]
 },
 {
  "id": "P4",
  "icon": "⚖️",
  "title": "健康檢查 BMI",
  "concept": "float() 與運算順序",
  "book": "2-1 任務2 計算 BMI 值",
  "story": "出發前的健康檢查！BMI 可以看出體重和身高的比例。公式是 <b>BMI ＝ 體重（公斤）÷ 身高（公尺）²</b>，但大家量身高習慣用<span class=\"hl\">公分</span>。",
  "task": [
   "詢問「請問體重幾公斤：」和「請問身高幾公分：」（可能有小數）",
   "計算 BMI（身高要先換成公尺）",
   "顯示 BMI 值（要不要四捨五入到小數第 2 位都可以）"
  ],
  "sample": {
   "inputs": [
    "48.5",
    "160"
   ],
   "output": "請問體重幾公斤：48.5\n請問身高幾公分：160\nBMI = 18.95"
  },
  "scratch": [
   [
    "( 體重 ) / (( 身高 / 100 ) * ( 身高 / 100 ))",
    "w / (h / 100) ** 2"
   ],
   [
    "四捨五入 ( )",
    "round(bmi, 2)"
   ]
  ],
  "starter": "w = float(input('請問體重幾公斤：'))\n# 接著問身高，再算 BMI\n",
  "req": [
   {
    "need": "calls.float>=2",
    "msg": "體重、身高都可能有小數，兩個都用 float( )"
   },
   {
    "need": "binops.Div>=1",
    "msg": "用 / 做除法"
   }
  ],
  "bonus": "用 round(bmi, 1) 只留一位小數；再想想看：為什麼 round 不寫第二個數字時，結果會變成整數？",
  "hn": 3,
  "tests": [
   {
    "name": "48.5 公斤 160 公分",
    "inputs": [
     "48.5",
     "160"
    ]
   },
   {
    "name": "70 公斤 175 公分",
    "inputs": [
     "70",
     "175"
    ]
   },
   {
    "name": "隱藏測資",
    "hidden": true
   }
  ]
 },
 {
  "id": "P5",
  "icon": "🎢",
  "title": "雲霄飛車身高檢查",
  "concept": "關係運算子、雙向選擇 if／else",
  "book": "2-2 概念 關係運算子、選擇結構",
  "story": "遊樂園的雲霄飛車規定：身高 <span class=\"hl\">120 公分以上（含 120）</span>才能搭乘。請做一個入口的自動檢查機。",
  "task": [
   "詢問「請輸入身高：」（整數）",
   "120 公分以上 → 顯示 <code>可以搭乘</code>",
   "其他 → 顯示 <code>還不能搭乘</code>"
  ],
  "sample": {
   "inputs": [
    "150"
   ],
   "output": "請輸入身高：150\n可以搭乘"
  },
  "scratch": [
   [
    "如果 < 身高 > 119 > 那麼 … 否則 …",
    "if h >= 120:\n    …\nelse:\n    …"
   ],
   [
    "（Scratch 沒有「≥」積木）",
    "Python 有 >=、<=、==、!="
   ]
  ],
  "starter": "h = int(input('請輸入身高：'))\n",
  "req": [
   {
    "need": "if>=1",
    "msg": "用 if 判斷"
   },
   {
    "need": "else>=1",
    "msg": "用 else 處理「其他」的情況"
   }
  ],
  "bonus": "讓身高不到 120 的人，還能知道「差幾公分」。",
  "hn": 3,
  "tests": [
   {
    "name": "150 公分",
    "inputs": [
     "150"
    ]
   },
   {
    "name": "110 公分",
    "inputs": [
     "110"
    ]
   },
   {
    "name": "隱藏測資",
    "hidden": true
   },
   {
    "name": "隱藏測資",
    "hidden": true
   }
  ]
 },
 {
  "id": "P6",
  "icon": "🎫",
  "title": "自動購票機",
  "concept": "多向選擇 if／elif／else",
  "book": "2-2 任務3 自動購票機",
  "story": "遊樂園的票價依年齡分成四種。請做一台自動購票機，<span class=\"hl\">一次只能印出一種票</span>。",
  "task": [
   "詢問「今年幾歲？」",
   "6 歲以下（含 6 歲）→ <code>免購票</code>",
   "13 歲以下（含 13 歲）→ <code>兒童票</code>",
   "65 歲以上（含 65 歲）→ <code>敬老票</code>",
   "其餘 → <code>全票</code>"
  ],
  "sample": {
   "inputs": [
    "10"
   ],
   "output": "今年幾歲？10\n請購買：兒童票"
  },
  "scratch": [
   [
    "如果 … 那麼 … 否則（如果 … 那麼 … 否則 …）",
    "if …:\nelif …:\nelse:"
   ],
   [
    "（Scratch 要一層一層包）",
    "Python 用 elif 排成一排，比較好讀"
   ]
  ],
  "starter": "age = int(input('今年幾歲？'))\n",
  "req": [
   {
    "need": "branches>=4",
    "msg": "用 if／elif／else 一次分出四種票（不要寫四個獨立的 if）"
   }
  ],
  "bonus": "加上「票價」：全票 800 元、兒童票 400 元、敬老票 400 元，並算出一家四口的總金額。",
  "hn": 3,
  "tests": [
   {
    "name": "5 歲",
    "inputs": [
     "5"
    ]
   },
   {
    "name": "10 歲",
    "inputs": [
     "10"
    ]
   },
   {
    "name": "30 歲",
    "inputs": [
     "30"
    ]
   },
   {
    "name": "70 歲",
    "inputs": [
     "70"
    ]
   },
   {
    "name": "隱藏測資",
    "hidden": true
   },
   {
    "name": "隱藏測資",
    "hidden": true
   },
   {
    "name": "隱藏測資",
    "hidden": true
   },
   {
    "name": "隱藏測資",
    "hidden": true
   }
  ]
 },
 {
  "id": "P7",
  "icon": "🚀",
  "title": "極速飛車雙重關卡",
  "concept": "邏輯運算子 and／or",
  "book": "2-2 概念 邏輯運算子",
  "story": "最刺激的「極速飛車」有兩個條件：身高 120 公分以上<span class=\"hl\">而且</span>年齡 10 歲以上，兩個都要符合才能玩。",
  "task": [
   "詢問「身高：」與「年齡：」",
   "兩個條件都符合 → <code>可以玩極速飛車！</code>",
   "只要有一個不符合 → <code>先去玩旋轉木馬吧</code>"
  ],
  "sample": {
   "inputs": [
    "130",
    "12"
   ],
   "output": "身高：130\n年齡：12\n可以玩極速飛車！"
  },
  "scratch": [
   [
    "< … > 且 < … >",
    "h >= 120 and age >= 10"
   ],
   [
    "< … > 或 < … >",
    "… or …"
   ],
   [
    "< … > 不成立",
    "not …"
   ]
  ],
  "starter": "h = int(input('身高：'))\nage = int(input('年齡：'))\n",
  "req": [
   {
    "need": "and>=1",
    "msg": "用 and 把兩個條件接在同一個 if（不要用兩層 if）"
   }
  ],
  "bonus": "改成「身高 140 以上，或是有大人陪同（輸入 y/n）」就可以玩 —— 這時要用 or。",
  "hn": 3,
  "tests": [
   {
    "name": "130 公分 12 歲",
    "inputs": [
     "130",
     "12"
    ]
   },
   {
    "name": "130 公分 8 歲",
    "inputs": [
     "130",
     "8"
    ]
   },
   {
    "name": "110 公分 12 歲",
    "inputs": [
     "110",
     "12"
    ]
   },
   {
    "name": "隱藏測資",
    "hidden": true
   },
   {
    "name": "隱藏測資",
    "hidden": true
   },
   {
    "name": "隱藏測資",
    "hidden": true
   }
  ]
 },
 {
  "id": "P8",
  "icon": "🚌",
  "title": "遊覽車發車倒數",
  "concept": "計次迴圈 for 與 range()",
  "book": "2-2 概念 計次迴圈、倒數計時挑戰",
  "story": "遊覽車要出發了！司機要從指定的秒數開始<span class=\"hl\">倒數</span>，數到 1 之後喊「出發！」。",
  "task": [
   "詢問「倒數幾秒？」",
   "從那個數字倒數到 1，每個數字一行",
   "最後顯示 <code>出發！</code>"
  ],
  "sample": {
   "inputs": [
    "5"
   ],
   "output": "倒數幾秒？5\n5\n4\n3\n2\n1\n出發！"
  },
  "scratch": [
   [
    "重複 (n) 次",
    "for i in range(…):"
   ],
   [
    "變數 i 改變 (-1)",
    "range(n, 0, -1) 會自己一個一個減"
   ]
  ],
  "starter": "n = int(input('倒數幾秒？'))\n",
  "req": [
   {
    "need": "for>=1",
    "msg": "用 for 迴圈"
   },
   {
    "need": "calls.range>=1",
    "msg": "用 range( ) 產生倒數的數字"
   },
   {
    "need": "calls.print<=3",
    "msg": "不要一行一行寫 print，交給迴圈重複"
   }
  ],
  "bonus": "在程式最前面加上 import time，迴圈裡加 time.sleep(1)，就會真的一秒一秒倒數（在這個網頁上會用動畫表現）。",
  "hn": 3,
  "tests": [
   {
    "name": "倒數 5 秒",
    "inputs": [
     "5"
    ]
   },
   {
    "name": "倒數 3 秒",
    "inputs": [
     "3"
    ]
   },
   {
    "name": "隱藏測資",
    "hidden": true
   },
   {
    "name": "隱藏測資",
    "hidden": true
   }
  ]
 },
 {
  "id": "P9",
  "icon": "🔐",
  "title": "置物櫃密碼鎖",
  "concept": "條件迴圈 while",
  "book": "2-2 概念 條件迴圈",
  "story": "飯店置物櫃的密碼是 <b>2027</b>（畢業那一年）。密碼<span class=\"hl\">打錯就要一直重打</span>，直到打對為止。",
  "task": [
   "在程式裡設定密碼 2027",
   "請使用者輸入密碼",
   "錯了就顯示 <code>密碼錯誤</code> 並再問一次",
   "對了顯示 <code>門開了！</code>，程式結束"
  ],
  "sample": {
   "inputs": [
    "1234",
    "2027"
   ],
   "output": "請輸入密碼：1234\n密碼錯誤\n請輸入密碼：2027\n門開了！"
  },
  "scratch": [
   [
    "重複直到 < 答案 = 2027 >",
    "while ans != '2027':"
   ],
   [
    "⚠️ 注意條件相反",
    "Scratch「直到成立就停」／Python「成立就繼續」"
   ]
  ],
  "starter": "password = '2027'\n",
  "req": [
   {
    "need": "while>=1",
    "msg": "用 while 迴圈重複詢問"
   }
  ],
  "bonus": "加一條規則：錯 3 次就顯示「鎖定，請找老師」並結束（提示：多一個變數數次數，條件用 and）。",
  "hn": 3,
  "tests": [
   {
    "name": "錯一次再打對",
    "inputs": [
     "1234",
     "2027"
    ]
   },
   {
    "name": "一次就打對",
    "inputs": [
     "2027"
    ]
   },
   {
    "name": "隱藏測資",
    "hidden": true
   },
   {
    "name": "隱藏測資",
    "hidden": true
   }
  ]
 },
 {
  "id": "P10",
  "icon": "🎲",
  "title": "魔王關：營火晚會猜數字",
  "concept": "while ＋ if 綜合應用",
  "book": "2-2 任務4 猜數字",
  "story": "營火晚會的遊戲時間！主持人心裡想了一個 1～99 的數字，大家輪流猜，主持人只會說<span class=\"hl\">太大</span>或<span class=\"hl\">太小</span>，直到有人猜中。",
  "task": [
   "謎底先固定設為 <code>answer = 7</code>（評分用；延伸挑戰再改成隨機）",
   "請使用者猜一個數字",
   "猜太大 → 顯示「太大，請重猜」；太小 → 顯示「太小，請重猜」",
   "重複猜，直到猜中為止",
   "猜中顯示 <code>答對了！</code>"
  ],
  "sample": {
   "inputs": [
    "50",
    "3",
    "7"
   ],
   "output": "請猜一個數字：50\n太大，請重猜：3\n太小，請重猜：7\n答對了！"
  },
  "scratch": [
   [
    "重複直到 < 答案 = 謎底 >",
    "while guess != answer:"
   ],
   [
    "如果 < 答案 > 謎底 > 那麼 … 否則 …",
    "if guess > answer: … else: …"
   ]
  ],
  "starter": "answer = 7\n",
  "req": [
   {
    "need": "while>=1",
    "msg": "用 while 重複猜"
   },
   {
    "need": "if>=1",
    "msg": "用 if 判斷太大或太小"
   }
  ],
  "bonus": "改成 import random 和 answer = random.randint(1, 99)，並在答對時顯示「你猜了幾次」。",
  "hn": 3,
  "tests": [
   {
    "name": "50 → 3 → 7",
    "inputs": [
     "50",
     "3",
     "7"
    ]
   },
   {
    "name": "一次猜中",
    "inputs": [
     "7"
    ]
   },
   {
    "name": "隱藏測資",
    "hidden": true
   },
   {
    "name": "隱藏測資",
    "hidden": true
   }
  ]
 }
];
