/* ⚠️ 自動產生，請勿手改。來源：private/11602/content/network.js（私有，不進 git）；產生方式：node tools/build.mjs
   公開版只有題目：答案、解說、提示、預期輸出都在驗證伺服器（server/，見 server/README.md）。 */
window.NET_LEVELS = [
 {
  "id": "N1",
  "icon": "🏘️",
  "title": "網路的範圍與設備",
  "book": "2-1 網路的連接",
  "learn": "網路依涵蓋範圍分成：<ul><li>🏠 <b>區域網路（LAN）</b>：連接<span class=\"hl\">小範圍</span>內的電腦和周邊設備，例如一間教室、一個家</li><li>🌏 <b>廣域網路（WAN）</b>：大範圍的網路，由許多區域網路組成；網際網路就是最大的廣域網路</li></ul>家裡或學校要連上網，會用到這些設備：<ul><li>📞 <b>數據機</b>：負責線路上的<span class=\"hl\">類比訊號</span>與電腦可識別的<span class=\"hl\">數位訊號</span>之間的轉換</li><li>🧭 <b>路由器</b>：安排資料的傳送路徑，通常有 WAN（對外）和 LAN（對內）兩種接孔</li><li>🔀 <b>網路交換器</b>：插孔不夠時用來擴充區域網路</li><li>🏢 <b>ISP（網際網路服務提供者）</b>：例如電信公司，提供連上網際網路的服務</li></ul>",
  "stages": [
   {
    "goal": "分辨區域／廣域網路、設備的工作（題庫隨機抽）",
    "rounds": [
     {
      "type": "sort",
      "src": "11602/N1/0/0",
      "prompt": "這是區域網路還是廣域網路？",
      "pick": 5,
      "buckets": [
       {
        "id": "lan",
        "label": "區域網路 LAN",
        "icon": "🏠"
       },
       {
        "id": "wan",
        "label": "廣域網路 WAN",
        "icon": "🌏"
       }
      ],
      "items": [
       {
        "t": "電腦教室裡 35 台電腦連在一起",
        "icon": "🖥️"
       },
       {
        "t": "家裡的手機、筆電都連同一台 Wi-Fi 分享器",
        "icon": "🏠"
       },
       {
        "t": "銀行全國各地分行的電腦互相連線",
        "icon": "🏦"
       },
       {
        "t": "連接全國各級學校的臺灣學術網路",
        "icon": "🏫"
       },
       {
        "t": "網際網路（Internet）",
        "icon": "🌐"
       },
       {
        "t": "學校三棟大樓的電腦連成一個網路",
        "icon": "🏫"
       },
       {
        "t": "臺北總公司和高雄分公司的電腦互相連線",
        "icon": "🏢"
       },
       {
        "t": "網咖裡 20 台電腦連在一起打電動",
        "icon": "🎮"
       },
       {
        "t": "全臺便利商店的收銀機連回總部",
        "icon": "🏪"
       }
      ]
     },
     {
      "type": "sort",
      "src": "11602/N1/0/1",
      "prompt": "這是哪一個設備（或服務）的工作？",
      "pick": 5,
      "buckets": [
       {
        "id": "modem",
        "label": "數據機",
        "icon": "📞"
       },
       {
        "id": "router",
        "label": "路由器",
        "icon": "🧭"
       },
       {
        "id": "switch",
        "label": "交換器",
        "icon": "🔀"
       },
       {
        "id": "isp",
        "label": "ISP",
        "icon": "🏢"
       }
      ],
      "items": [
       {
        "t": "把線路上的類比訊號轉成電腦看得懂的數位訊號",
        "icon": "〰️"
       },
       {
        "t": "決定封包要往哪條路走，有 WAN 和 LAN 兩種接孔",
        "icon": "🗺️"
       },
       {
        "t": "教室的網路插孔不夠了，用它多接幾台電腦",
        "icon": "🔌"
       },
       {
        "t": "電信公司提供你家連上網際網路的服務",
        "icon": "📡"
       },
       {
        "t": "讓家裡好幾台裝置共用一個對外連線，並分配內部位址",
        "icon": "🏠"
       },
       {
        "t": "光纖傳進來的訊號，要先經過它才能給電腦用",
        "icon": "💡"
       },
       {
        "t": "中華電信、台灣大哥大提供的「上網服務」",
        "icon": "📶"
       }
      ]
     }
    ]
   },
   {
    "goal": "🧪 教室拉線：把光纖孔、數據機、路由器、交換器、電腦一條一條接起來（🎲 電腦台數每次不同）",
    "rounds": [
     {
      "type": "lab",
      "lab": "wireRoom",
      "n": 2,
      "prompt": "教室拉線",
      "src": "11602/N1/1/0"
     }
    ]
   },
   {
    "goal": "🧪 電腦很多的教室（要用到交換器）＋算最少要幾台交換器（🎲）",
    "rounds": [
     {
      "type": "lab",
      "lab": "wireRoom",
      "n": 1,
      "prompt": "教室拉線：挑戰",
      "hard": true,
      "src": "11602/N1/2/0"
     },
     {
      "type": "gen",
      "gen": "portsCalc",
      "n": 2,
      "prompt": "網路孔夠不夠？",
      "src": "11602/N1/2/1"
     }
    ]
   }
  ]
 },
 {
  "id": "N2",
  "icon": "🧵",
  "title": "網路線材大比拼",
  "book": "2-1 網路的連接",
  "learn": "網路要靠「傳輸媒介」把設備連起來，有線網路常見三種線材：<ul><li>💡 <b>光纖</b>：用<span class=\"hl\">玻璃或塑膠纖維</span>傳光訊號，速度快、傳得遠，但成本高 → 多用在網路的<span class=\"hl\">主要幹道</span></li><li>🔀 <b>雙絞線</b>：<span class=\"hl\">成對的電線互相纏繞</span>，減少電磁波干擾；傳輸距離短但成本低 → 電腦教室、家裡最常見</li><li>📺 <b>同軸電纜</b>：以<span class=\"hl\">銅芯</span>為中心，外面包絕緣體和銅網，傳得遠 → 大部分有線電視訊號；以前也用在區域網路，價格較高，已被雙絞線取代</li></ul>資料到你家的路線：ISP 用<b>光纖</b>接到用戶端 → <b>數據機</b>轉換訊號 → <b>路由器</b>分配 → <b>雙絞線</b>（或 Wi-Fi）送到設備。",
  "stages": [
   {
    "goal": "認識三種線材（題庫隨機抽）",
    "rounds": [
     {
      "type": "sort",
      "src": "11602/N2/0/0",
      "prompt": "這是哪一種線材？",
      "pick": 5,
      "buckets": [
       {
        "id": "fiber",
        "label": "光纖",
        "icon": "💡"
       },
       {
        "id": "tp",
        "label": "雙絞線",
        "icon": "🔀"
       },
       {
        "id": "coax",
        "label": "同軸電纜",
        "icon": "📺"
       }
      ],
      "items": [
       {
        "t": "用玻璃或塑膠纖維，靠「光」傳資料",
        "icon": "✨"
       },
       {
        "t": "兩條兩條的電線互相纏繞，減少電磁波干擾",
        "icon": "🧶"
       },
       {
        "t": "中間一根銅芯，外面包絕緣體和一層銅網",
        "icon": "🥢"
       },
       {
        "t": "電腦教室裡，每台電腦接到交換器的那條線",
        "icon": "🖥️"
       },
       {
        "t": "把有線電視訊號接到電視盒",
        "icon": "📺"
       },
       {
        "t": "連接城市之間、甚至跨海的網路主幹道",
        "icon": "🌊"
       }
      ]
     },
     {
      "type": "sort",
      "src": "11602/N2/0/1",
      "prompt": "光纖和雙絞線比一比：這句話說的是哪一種？",
      "buckets": [
       {
        "id": "fiber",
        "label": "光纖",
        "icon": "💡"
       },
       {
        "id": "tp",
        "label": "雙絞線",
        "icon": "🔀"
       }
      ],
      "items": [
       {
        "t": "傳輸速度快、傳得遠",
        "icon": "🚀"
       },
       {
        "t": "成本低，適合一間教室這種小範圍",
        "icon": "💰"
       },
       {
        "t": "成本高，所以多用在主要幹道",
        "icon": "💸"
       },
       {
        "t": "傳輸距離比較短",
        "icon": "📏"
       }
      ]
     },
     {
      "type": "order",
      "src": "11602/N2/0/2",
      "prompt": "把網路從 ISP 送到你家電腦的路線排好",
      "items": [
       {
        "t": "光纖接到用戶端",
        "icon": "💡"
       },
       {
        "t": "雙絞線送到電腦",
        "icon": "🔀"
       },
       {
        "t": "數據機轉換訊號",
        "icon": "📞"
       },
       {
        "t": "你的電腦",
        "icon": "💻"
       },
       {
        "t": "路由器分配給各設備",
        "icon": "🧭"
       },
       {
        "t": "ISP（電信公司）",
        "icon": "🏢"
       }
      ]
     }
    ]
   },
   {
    "goal": "🧪 佈線工程師：每段線路選線材，合規又不超出預算（🎲 距離、預算每次不同）",
    "rounds": [
     {
      "type": "lab",
      "lab": "cablePlan",
      "n": 1,
      "prompt": "佈線工程師",
      "src": "11602/N2/1/0"
     }
    ]
   },
   {
    "goal": "🧪 更多段線路、預算更緊＋線材配對（🎲）",
    "rounds": [
     {
      "type": "lab",
      "lab": "cablePlan",
      "n": 1,
      "prompt": "佈線工程師：挑戰",
      "hard": true,
      "src": "11602/N2/2/0"
     },
     {
      "type": "gen",
      "gen": "cableAssign",
      "n": 1,
      "prompt": "選線材：挑戰",
      "hard": true,
      "src": "11602/N2/2/1"
     }
    ]
   }
  ]
 },
 {
  "id": "N3",
  "icon": "📦",
  "title": "封包快遞",
  "book": "2-1 TCP/IP 通訊協定",
  "learn": "網路上傳資料，不是整份一起送，而是<span class=\"hl\">切成很多小封包</span>，到了目的地再組回來。<ul><li>🔢 <b>TCP 協定</b>：幫每個封包<span class=\"hl\">編號</span>，並用確認訊息檢查封包有沒有送到，沒到就重送</li><li>📮 <b>IP 協定</b>：幫封包加上「網路位址」，標明<span class=\"hl\">從哪裡來、要送到哪裡</span>，像信封上的地址</li></ul>封包可能走不同的路、不照順序抵達 —— 接收端靠編號重新排好。",
  "stages": [
   {
    "goal": "TCP 和 IP 的分工、傳送流程（題庫隨機抽）",
    "rounds": [
     {
      "type": "sort",
      "src": "11602/N3/0/0",
      "prompt": "這是 TCP 還是 IP 負責的？",
      "pick": 5,
      "buckets": [
       {
        "id": "tcp",
        "label": "TCP",
        "icon": "🔢"
       },
       {
        "id": "ip",
        "label": "IP",
        "icon": "📮"
       }
      ],
      "items": [
       {
        "t": "幫每個封包編上號碼",
        "icon": "#️⃣"
       },
       {
        "t": "檢查封包有沒有送到，沒到就重送",
        "icon": "🔁"
       },
       {
        "t": "在封包上寫上來源和目的地的網路位址",
        "icon": "🏷️"
       },
       {
        "t": "像信封上的收件人地址",
        "icon": "✉️"
       },
       {
        "t": "收到後依號碼把封包重新組回原本的資料",
        "icon": "🧩"
       },
       {
        "t": "沒收到對方的確認，就把封包再送一次",
        "icon": "📤"
       },
       {
        "t": "讓路由器知道封包要往哪裡送",
        "icon": "🧭"
       },
       {
        "t": "每台上網的裝置都要有一個",
        "icon": "🖥️"
       }
      ]
     },
     {
      "type": "order",
      "src": "11602/N3/0/1",
      "prompt": "把「傳一張照片給朋友」的過程排好順序",
      "items": [
       {
        "t": "TCP 幫封包編號",
        "icon": "🔢"
       },
       {
        "t": "路由器一站一站轉送",
        "icon": "🧭"
       },
       {
        "t": "接收端依編號重組",
        "icon": "🧩"
       },
       {
        "t": "照片被切成許多小封包",
        "icon": "✂️"
       },
       {
        "t": "回傳「收到了」的確認",
        "icon": "✅"
       },
       {
        "t": "IP 加上來源與目的地位址",
        "icon": "🏷️"
       }
      ]
     }
    ]
   },
   {
    "goal": "🧪 封包快遞模擬器：看封包走不同路線、亂序抵達，重組訊息、請求重送（🎲 訊息每次不同）",
    "rounds": [
     {
      "type": "lab",
      "lab": "packetSim",
      "n": 2,
      "prompt": "封包快遞模擬器",
      "src": "11602/N3/1/0"
     }
    ]
   },
   {
    "goal": "🧪 更長的訊息、遺失 2 個、還有重複收到的（🎲）",
    "rounds": [
     {
      "type": "lab",
      "lab": "packetSim",
      "n": 1,
      "prompt": "封包快遞模擬器：挑戰",
      "hard": true,
      "src": "11602/N3/2/0"
     },
     {
      "type": "gen",
      "gen": "packetLost",
      "n": 2,
      "prompt": "要重送哪幾號？",
      "hard": true,
      "src": "11602/N3/2/1"
     }
    ]
   }
  ]
 },
 {
  "id": "N4",
  "icon": "🔎",
  "title": "IP 位址偵探",
  "book": "2-1 網路位址",
  "learn": "每一台上網的裝置都有一組網路位址（IP）。<ul><li><b>IPv4</b>：用 <span class=\"hl\">4 組 0～255</span> 的數字表示，例如 192.168.7.1。每一組其實是 8 個位元：11000000 ＝ 192（上學期學過的二進位！）</li><li><b>IPv6</b>：IPv4 不夠用了，改用 <span class=\"hl\">8 組</span>、每組 4 個十六進位數字，用「:」隔開</li><li><b>公有網路位址</b>：由 ISP 分派，連接外部網路</li><li><b>私有網路位址</b>：只在自己的區域網路內使用，要透過轉址服務換成公有位址才能上網。IPv4 的私有區段：<br><code>10.0.0.0～10.255.255.255</code>、<code>172.16.0.0～172.31.255.255</code>、<code>192.168.0.0～192.168.255.255</code></li></ul>",
  "stages": [
   {
    "goal": "判斷 IPv4 位址合不合法（🎲 每次都是新的位址）",
    "rounds": [
     {
      "type": "gen",
      "gen": "ipValid",
      "n": 5,
      "prompt": "合法的 IPv4 嗎？",
      "src": "11602/N4/0/0"
     },
     {
      "type": "type",
      "src": "11602/N4/0/1",
      "prompt": "觀念確認（自己打答案）",
      "items": [
       {
        "t": "IPv4 位址由幾組數字組成？",
        "icon": "🔢"
       },
       {
        "t": "IPv4 每一組最大是多少？",
        "icon": "🔝"
       }
      ]
     }
    ]
   },
   {
    "goal": "🧪 IP 設定面板：用 32 個位元開關調出指定位址（🎲 位址每次不同）",
    "rounds": [
     {
      "type": "lab",
      "lab": "ipPanel",
      "n": 2,
      "prompt": "IP 設定面板",
      "src": "11602/N4/1/0"
     }
    ]
   },
   {
    "goal": "🧪 自己決定第 2 組、設定私有位址＋公有私有陷阱（🎲）",
    "rounds": [
     {
      "type": "lab",
      "lab": "ipPanel",
      "n": 1,
      "prompt": "IP 設定面板：挑戰",
      "hard": true,
      "src": "11602/N4/2/0"
     },
     {
      "type": "gen",
      "gen": "ipPrivate",
      "n": 4,
      "prompt": "公有還是私有？",
      "src": "11602/N4/2/1"
     }
    ]
   }
  ]
 },
 {
  "id": "N5",
  "icon": "🔢",
  "title": "IPv6 新地址",
  "book": "2-1 網路位址（延伸學習：IPv6 位址表示）",
  "learn": "<b>IPv4</b> 只有 32 個位元，位址不夠用了 → 改用 <b>IPv6</b>：<span class=\"hl\">128 個位元</span>，可以提供 2¹²⁸ 個位址，比 IPv4 多約 8×10²⁸ 倍。<ul><li>128 個 0 和 1 太長了 → 每 <span class=\"hl\">4 個位元換成 1 個十六進位數字</span>，變成 32 個十六進位數字</li><li>再分成 <span class=\"hl\">8 組、每組 4 個</span>，用「:」隔開，例如 <code>2531:0cb7:03a6:0000:0000:0000:0000:0f12</code></li></ul><b>省略的三個規則</b><ol><li>每組<span class=\"hl\">開頭的 0</span> 可以省略：<code>0cb7 → cb7</code></li><li>整組都是 0000，可以寫成 <code>0</code></li><li>連續好幾組都是 0，可以用 <code>::</code> 代替，但<span class=\"hl\">只能用一次</span>（用兩次就不知道各代表幾組）</li></ol>例：<code>2531:0cb7:03a6:0000:0000:0000:0000:0f12</code> → <code>2531:cb7:3a6::f12</code>",
  "stages": [
   {
    "goal": "IPv4 和 IPv6 的差別、省略規則（題庫隨機抽）",
    "rounds": [
     {
      "type": "sort",
      "src": "11602/N5/0/0",
      "prompt": "這是 IPv4 還是 IPv6？",
      "pick": 5,
      "buckets": [
       {
        "id": "v4",
        "label": "IPv4",
        "icon": "4️⃣"
       },
       {
        "id": "v6",
        "label": "IPv6",
        "icon": "6️⃣"
       }
      ],
      "items": [
       {
        "t": "由 32 個位元組成",
        "icon": "🔢"
       },
       {
        "t": "由 128 個位元組成",
        "icon": "🔢"
       },
       {
        "t": "用「.」分成 4 組十進位數字",
        "icon": "⚫"
       },
       {
        "t": "用「:」分成 8 組十六進位數字",
        "icon": "➗"
       },
       {
        "t": "2001:db8::1",
        "icon": "🏷️"
       },
       {
        "t": "140.112.53.15",
        "icon": "🏷️"
       },
       {
        "t": "位址數量不夠用，才需要換新版",
        "icon": "😰"
       }
      ]
     },
     {
      "type": "sort",
      "src": "11602/N5/0/1",
      "prompt": "這樣省略，對不對？（原本的位址寫在題目裡）",
      "pick": 4,
      "buckets": [
       {
        "id": "ok",
        "label": "正確",
        "icon": "✅"
       },
       {
        "id": "bad",
        "label": "錯誤",
        "icon": "❌"
       }
      ],
      "items": [
       {
        "t": "2531:0cb7:03a6:0000:0000:0000:0000:0f12 → 2531:cb7:3a6:0:0:0:0:f12",
        "icon": "✂️"
       },
       {
        "t": "2531:0cb7:03a6:0000:0000:0000:0000:0f12 → 2531:cb7:3a6::f12",
        "icon": "✂️"
       },
       {
        "t": "2531:0cb7:03a6:0000:0000:0000:0000:0f12 → 2531:cb7:3a6::f1",
        "icon": "✂️"
       },
       {
        "t": "2001:0db8:0000:0000:0001:0000:0000:0001 → 2001:db8::1::1",
        "icon": "✂️"
       },
       {
        "t": "2001:0db8:0000:0000:0001:0000:0000:0001 → 2001:db8::1:0:0:1",
        "icon": "✂️"
       }
      ]
     },
     {
      "type": "type",
      "src": "11602/N5/0/2",
      "prompt": "觀念確認（自己打答案）",
      "items": [
       {
        "t": "IPv6 位址由幾個位元組成？",
        "icon": "6️⃣"
       },
       {
        "t": "IPv6 寫成幾組十六進位數字？",
        "icon": "➗"
       }
      ]
     }
    ]
   },
   {
    "goal": "🧪 IPv6 壓縮機：刪開頭的 0、合併 ::，壓到最短（🎲）",
    "rounds": [
     {
      "type": "gen",
      "gen": "hexBits",
      "n": 2,
      "prompt": "4 個位元 → 1 個十六進位數字",
      "src": "11602/N5/1/0"
     },
     {
      "type": "lab",
      "lab": "v6Press",
      "n": 1,
      "prompt": "IPv6 壓縮機",
      "src": "11602/N5/1/1"
     }
    ]
   },
   {
    "goal": "🧪 兩段連續的 0：:: 要用在最長的那段＋把 :: 還原（🎲）",
    "rounds": [
     {
      "type": "lab",
      "lab": "v6Press",
      "n": 2,
      "prompt": "IPv6 壓縮機：挑戰",
      "hard": true,
      "src": "11602/N5/2/0"
     },
     {
      "type": "gen",
      "gen": "v6expand",
      "n": 1,
      "prompt": "IPv6 還原",
      "src": "11602/N5/2/1"
     }
    ]
   }
  ]
 },
 {
  "id": "N6",
  "icon": "🌐",
  "title": "網址拆解員",
  "book": "2-1 網域名稱",
  "learn": "IP 位址是一串數字，很難記，所以有了好記的<b>網域名稱</b>。<b>DNS</b> 就像網路上的電話簿，負責<span class=\"hl\">把網域名稱查成 IP 位址</span>。<br>以臺灣大學 <code>www.ntu.edu.tw</code> 為例，由左到右是：<ul><li><b>主機名稱</b> www：依提供的服務命名</li><li><b>機構名稱</b> ntu：通常是英文縮寫</li><li><b>類別名稱</b> edu：機構的性質（edu 教育、gov 政府、com 公司、org 組織）</li><li><b>地區名稱</b> tw：國家或地區的英文縮寫</li></ul>",
  "stages": [
   {
    "goal": "網址的四個部分、機構類別、DNS 流程（題庫隨機抽）",
    "rounds": [
     {
      "type": "sort",
      "src": "11602/N6/0/0",
      "prompt": "標出來的這一段是網址的哪一部分？",
      "pick": 4,
      "buckets": [
       {
        "id": "host",
        "label": "主機名稱",
        "icon": "🖥️"
       },
       {
        "id": "org",
        "label": "機構名稱",
        "icon": "🏛️"
       },
       {
        "id": "cat",
        "label": "類別名稱",
        "icon": "🏷️"
       },
       {
        "id": "area",
        "label": "地區名稱",
        "icon": "🗺️"
       }
      ],
      "items": [
       {
        "t": "www.ntu.edu.tw 的「ntu」",
        "icon": "🌐"
       },
       {
        "t": "www.ntu.edu.tw 的「tw」",
        "icon": "🌐"
       },
       {
        "t": "www.taichung.gov.tw 的「gov」",
        "icon": "🌐"
       },
       {
        "t": "mail.google.com 的「mail」",
        "icon": "🌐"
       },
       {
        "t": "www.taichung.gov.tw 的「taichung」",
        "icon": "🌐"
       },
       {
        "t": "www.yahoo.co.jp 的「jp」",
        "icon": "🌐"
       }
      ]
     },
     {
      "type": "sort",
      "src": "11602/N6/0/1",
      "prompt": "這個網址最可能屬於哪一類機構？",
      "pick": 4,
      "buckets": [
       {
        "id": "edu",
        "label": "學校",
        "icon": "🏫"
       },
       {
        "id": "gov",
        "label": "政府",
        "icon": "🏛️"
       },
       {
        "id": "com",
        "label": "公司",
        "icon": "🏢"
       },
       {
        "id": "org",
        "label": "非營利組織",
        "icon": "🤝"
       }
      ],
      "items": [
       {
        "t": "www.qfm.kh.edu.tw",
        "icon": "🌐"
       },
       {
        "t": "www.taichung.gov.tw",
        "icon": "🌐"
       },
       {
        "t": "www.pchome.com.tw",
        "icon": "🌐"
       },
       {
        "t": "www.wikipedia.org",
        "icon": "🌐"
       },
       {
        "t": "www.president.gov.tw",
        "icon": "🏛️"
       },
       {
        "t": "shopping.yahoo.com.tw",
        "icon": "🛍️"
       },
       {
        "t": "www.ncku.edu.tw",
        "icon": "🎓"
       }
      ]
     },
     {
      "type": "order",
      "src": "11602/N6/0/2",
      "prompt": "在瀏覽器打入網址按 Enter 之後，依序發生什麼事？",
      "items": [
       {
        "t": "依 IP 位址連到網站伺服器",
        "icon": "🖥️"
       },
       {
        "t": "伺服器把網頁資料傳回來",
        "icon": "📦"
       },
       {
        "t": "DNS 把網域名稱查成 IP 位址",
        "icon": "📒"
       },
       {
        "t": "瀏覽器拿到網域名稱",
        "icon": "⌨️"
       },
       {
        "t": "瀏覽器把網頁顯示出來",
        "icon": "🪟"
       }
      ]
     }
    ]
   },
   {
    "goal": "🧪 DNS 電話簿：拆網址 → 查 DNS → 連到正確的伺服器（🎲）",
    "rounds": [
     {
      "type": "lab",
      "lab": "dnsBook",
      "n": 2,
      "prompt": "DNS 電話簿",
      "src": "11602/N6/1/0"
     }
    ]
   },
   {
    "goal": "🧪 電話簿裡有很像的網址＋判斷各國網站（🎲）",
    "rounds": [
     {
      "type": "lab",
      "lab": "dnsBook",
      "n": 1,
      "prompt": "DNS 電話簿：挑戰",
      "hard": true,
      "src": "11602/N6/2/0"
     },
     {
      "type": "gen",
      "gen": "urlRead",
      "n": 3,
      "prompt": "這是誰的網站？",
      "src": "11602/N6/2/1"
     }
    ]
   }
  ]
 },
 {
  "id": "N7",
  "icon": "📨",
  "title": "網路服務百寶箱",
  "book": "2-1 網路服務應用",
  "learn": "常見的網路服務：<b>全球資訊網</b>（看網頁）、<b>電子郵件</b>、<b>即時通訊</b>、<b>社群平臺</b>、<b>隨選視訊</b>（想看就看）、<b>物聯網</b>。<ul><li>寄信用 <b>SMTP</b>，收信用 <b>POP3</b></li><li>網址開頭是 <b>http</b> 或 <b>https</b> 的，都用超文件傳輸協定傳資料；<span class=\"hl\">https 的 s（secure）表示傳輸過程有加密</span></li></ul>",
  "stages": [
   {
    "goal": "分辨六種網路服務（題庫隨機抽）",
    "rounds": [
     {
      "type": "sort",
      "src": "11602/N7/0/0",
      "prompt": "這是哪一種網路服務？",
      "pick": 5,
      "buckets": [
       {
        "id": "www",
        "label": "全球資訊網",
        "icon": "🌐"
       },
       {
        "id": "mail",
        "label": "電子郵件",
        "icon": "📧"
       },
       {
        "id": "im",
        "label": "即時通訊",
        "icon": "💬"
       },
       {
        "id": "sns",
        "label": "社群平臺",
        "icon": "📸"
       },
       {
        "id": "vod",
        "label": "隨選視訊",
        "icon": "🎬"
       },
       {
        "id": "iot",
        "label": "物聯網",
        "icon": "📡"
       }
      ],
      "items": [
       {
        "t": "用瀏覽器查學校網站的行事曆",
        "icon": "🗓️"
       },
       {
        "t": "把專題報告當附件寄給老師",
        "icon": "📎"
       },
       {
        "t": "畢旅群組大家即時討論要帶什麼",
        "icon": "🗨️"
       },
       {
        "t": "發一則畢業照限時動態",
        "icon": "🎓"
       },
       {
        "t": "晚上想看哪一集影集就點哪一集",
        "icon": "🍿"
       },
       {
        "t": "空氣盒子自動上傳 PM2.5 數值",
        "icon": "🌫️"
       },
       {
        "t": "上網看老師上傳的教學影片，想看哪段就看哪段",
        "icon": "▶️"
       },
       {
        "t": "智慧插座讓你在學校就能關掉家裡的電風扇",
        "icon": "🔌"
       },
       {
        "t": "和同學用通訊軟體視訊討論報告",
        "icon": "📹"
       }
      ]
     }
    ]
   },
   {
    "goal": "🧪 郵件旅程：一站一站送信、選對協定；🕵️ 偷看者：http 和 https 差在哪（🎲）",
    "rounds": [
     {
      "type": "lab",
      "lab": "mailTrip",
      "n": 1,
      "prompt": "郵件旅程",
      "src": "11602/N7/1/0"
     },
     {
      "type": "lab",
      "lab": "spy",
      "n": 1,
      "prompt": "偷看者",
      "src": "11602/N7/1/1"
     }
    ]
   },
   {
    "goal": "🧪 多了干擾的伺服器＋什麼時候一定要加密（🎲）",
    "rounds": [
     {
      "type": "lab",
      "lab": "mailTrip",
      "n": 1,
      "prompt": "郵件旅程：挑戰",
      "hard": true,
      "src": "11602/N7/2/0"
     },
     {
      "type": "gen",
      "gen": "httpsJudge",
      "n": 3,
      "prompt": "要不要 https？",
      "src": "11602/N7/2/1"
     }
    ]
   }
  ]
 },
 {
  "id": "N8",
  "icon": "📶",
  "title": "無線網路選手",
  "book": "2-2 藍牙、Wi-Fi、行動網路",
  "learn": "<ul><li>🔵 <b>藍牙</b>：傳輸距離約 10～300 公尺，<span class=\"hl\">成本低、體積小、安全性高</span>，可傳語音和資料（耳機、手錶、滑鼠）</li><li>📶 <b>Wi-Fi</b>：傳輸距離約 50～300 公尺，速度快，但訊號容易受環境影響（牆壁、干擾）</li><li>📱 <b>行動網路</b>：手機和<span class=\"hl\">基地臺</span>通訊，走到哪用到哪；現在以 4G 和 5G 為主</li></ul><b>5G 三大特性</b>：高速度（約 4G 的 10～20 倍）、低延遲（約 1 毫秒）、多連結（每平方公里可連約一百萬個設備）。",
  "stages": [
   {
    "goal": "藍牙、Wi-Fi、行動網路、5G 特性（題庫隨機抽）",
    "rounds": [
     {
      "type": "sort",
      "src": "11602/N8/0/0",
      "prompt": "這個情境最適合哪一種無線技術？",
      "pick": 5,
      "buckets": [
       {
        "id": "bt",
        "label": "藍牙",
        "icon": "🔵"
       },
       {
        "id": "wifi",
        "label": "Wi-Fi",
        "icon": "📶"
       },
       {
        "id": "mobile",
        "label": "行動網路",
        "icon": "📱"
       }
      ],
      "items": [
       {
        "t": "無線耳機連手機聽音樂",
        "icon": "🎧"
       },
       {
        "t": "智慧手錶把步數同步到手機",
        "icon": "⌚"
       },
       {
        "t": "在家用筆電看高畫質影片",
        "icon": "💻"
       },
       {
        "t": "電腦教室的平板無線上網",
        "icon": "🏫"
       },
       {
        "t": "搭公車時用手機查路線",
        "icon": "🚌"
       },
       {
        "t": "爬山時打電話報平安",
        "icon": "⛰️"
       },
       {
        "t": "用手機的熱點讓筆電在高鐵上上網",
        "icon": "🚄"
       },
       {
        "t": "把手機裡的照片傳到旁邊朋友的手機",
        "icon": "📲"
       },
       {
        "t": "圖書館的公用電腦區無線上網",
        "icon": "📚"
       }
      ]
     },
     {
      "type": "sort",
      "src": "11602/N8/0/1",
      "prompt": "這個應用最需要 5G 的哪一個特性？",
      "pick": 4,
      "buckets": [
       {
        "id": "fast",
        "label": "高速度",
        "icon": "🚀"
       },
       {
        "id": "low",
        "label": "低延遲",
        "icon": "⚡"
       },
       {
        "id": "many",
        "label": "多連結",
        "icon": "🕸️"
       }
      ],
      "items": [
       {
        "t": "幾秒鐘就下載完一部電影",
        "icon": "🎬"
       },
       {
        "t": "醫生遠端操作手術機器手臂",
        "icon": "🩺"
       },
       {
        "t": "自駕車看到障礙物要立刻煞車",
        "icon": "🚗"
       },
       {
        "t": "演唱會現場幾萬人同時上網",
        "icon": "🎤"
       },
       {
        "t": "智慧工廠上千個感測器同時連線",
        "icon": "🏭"
       }
      ]
     }
    ]
   },
   {
    "goal": "🧪 Wi-Fi 覆蓋地圖：放基地臺、幫每個裝置選頻段（🎲 房間和裝置每次不同）",
    "rounds": [
     {
      "type": "lab",
      "lab": "wifiMap",
      "n": 2,
      "prompt": "Wi-Fi 覆蓋地圖",
      "src": "11602/N8/1/0"
     }
    ]
   },
   {
    "goal": "🧪 牆更多、兩台 4K 電視＋有干擾條件的技術選擇（🎲）",
    "rounds": [
     {
      "type": "lab",
      "lab": "wifiMap",
      "n": 1,
      "prompt": "Wi-Fi 覆蓋地圖：挑戰",
      "hard": true,
      "src": "11602/N8/2/0"
     },
     {
      "type": "gen",
      "gen": "wirelessPick",
      "n": 3,
      "prompt": "選哪一種無線技術？",
      "hard": true,
      "src": "11602/N8/2/1"
     }
    ]
   }
  ]
 },
 {
  "id": "N9",
  "icon": "🚀",
  "title": "網速計算機",
  "book": "2-2 Wi-Fi 的版本與頻寬",
  "learn": "<b>網路速度的單位是 bps</b>（bit per second，每秒傳幾個位元），檔案大小的單位是 <b>Byte</b>，而 <span class=\"hl\">1 Byte ＝ 8 bit</span>。<br>所以：<span class=\"hl\">網速 ÷ 8 ＝ 每秒可以下載幾 MB</span>。例：100 Mbps ÷ 8 ＝ 12.5 MB/s，下載 50 MB 最少要 50 ÷ 12.5 ＝ <b>4 秒</b>。<ul><li>📶 <b>Wi-Fi 5</b>（IEEE 802.11ac，2013 年）、<b>Wi-Fi 6</b>（IEEE 802.11ax，2019 年）都支援兩個頻段：<br><b>5GHz</b> 速度快、距離短；<b>2.4GHz</b> 速度慢、傳得比較遠</li><li>🐢 上網速度會被<span class=\"hl\">比較慢的那一段</span>卡住：租用的 ISP 頻寬只有 100 Mbps，基地臺再快也超過不了 100 Mbps</li><li>🔁 Wi-Fi 6 可以<span class=\"hl\">向下相容</span>：Wi-Fi 5 的電腦也能連，但只有 Wi-Fi 5 的速度</li><li>🛣️ <b>頻寬</b>是同一時間能容許的資料流通量，就像道路的寬度；同一台基地臺的頻寬由連上的人<span class=\"hl\">一起共用</span></li></ul>",
  "stages": [
   {
    "goal": "頻段與網速的觀念（題庫隨機抽）",
    "rounds": [
     {
      "type": "sort",
      "src": "11602/N9/0/0",
      "prompt": "這個情況用哪一個頻段比較好？",
      "pick": 4,
      "buckets": [
       {
        "id": "g5",
        "label": "5GHz",
        "icon": "⚡"
       },
       {
        "id": "g24",
        "label": "2.4GHz",
        "icon": "📡"
       }
      ],
      "items": [
       {
        "t": "坐在基地臺旁邊看 4K 影片",
        "icon": "📺"
       },
       {
        "t": "隔了兩道牆的房間，訊號要穩",
        "icon": "🧱"
       },
       {
        "t": "同一個房間裡快速傳大檔案",
        "icon": "📁"
       },
       {
        "t": "院子另一頭的監視器要連上網",
        "icon": "📷"
       },
       {
        "t": "樓上房間要連樓下客廳的基地臺",
        "icon": "🏠"
       },
       {
        "t": "就在電腦旁邊，要最快的下載速度",
        "icon": "💨"
       }
      ]
     },
     {
      "type": "sort",
      "src": "11602/N9/0/1",
      "prompt": "這句話對不對？",
      "pick": 5,
      "buckets": [
       {
        "id": "ok",
        "label": "對",
        "icon": "✅"
       },
       {
        "id": "bad",
        "label": "不對",
        "icon": "❌"
       }
      ],
      "items": [
       {
        "t": "基地臺的天線越多，Wi-Fi 一定越快",
        "icon": "📡"
       },
       {
        "t": "Wi-Fi 5 的筆電可以連 Wi-Fi 6 基地臺，但只有 Wi-Fi 5 的速度",
        "icon": "💻"
       },
       {
        "t": "同一台基地臺連的人越多，每個人分到的頻寬越少",
        "icon": "👥"
       },
       {
        "t": "買了最快的基地臺，上網就一定比 ISP 租的速度快",
        "icon": "🛒"
       },
       {
        "t": "Wi-Fi 6 的標準是 IEEE 802.11ax",
        "icon": "📄"
       },
       {
        "t": "網路速度 100 Mbps，代表每秒最多下載 100 MB",
        "icon": "❓"
       },
       {
        "t": "2.4GHz 和 5GHz 是 Wi-Fi 的兩個頻段",
        "icon": "📶"
       }
      ]
     },
     {
      "type": "type",
      "src": "11602/N9/0/2",
      "prompt": "觀念確認（自己打答案）",
      "items": [
       {
        "t": "1 Byte（位元組）等於幾 bit（位元）？",
        "icon": "🔢"
       },
       {
        "t": "Wi-Fi 6 的標準是 IEEE 802.11 後面加哪兩個字母？",
        "icon": "📄"
       }
      ]
     }
    ]
   },
   {
    "goal": "🧪 下載模擬器：選網路方案和基地臺，在時間內下載完（🎲 檔案大小、人數、限時每次不同）",
    "rounds": [
     {
      "type": "lab",
      "lab": "dlSim",
      "n": 1,
      "prompt": "下載模擬器",
      "src": "11602/N9/1/0"
     }
    ]
   },
   {
    "goal": "🧪 還要花費最少＋頻寬計算（🎲）",
    "rounds": [
     {
      "type": "lab",
      "lab": "dlSim",
      "n": 1,
      "prompt": "下載模擬器：挑戰",
      "hard": true,
      "src": "11602/N9/2/0"
     },
     {
      "type": "gen",
      "gen": "bottleneck",
      "n": 2,
      "prompt": "網速計算：挑戰",
      "src": "11602/N9/2/1"
     }
    ]
   }
  ]
 },
 {
  "id": "N10",
  "icon": "🛒",
  "title": "嗶一下就 OK",
  "book": "第 2 章 科技廣角：結帳時的資訊科技",
  "learn": "結帳時「嗶」的那一下有好幾種技術：<ul><li>▮▯ <b>條碼</b>（一維條碼）：黑白色塊寬度不同，掃描器照光讀出一串數字</li><li>▦ <b>QR code</b>（二維條碼）：能存更多資料，手機鏡頭就能讀</li><li>📳 <b>NFC</b>：非常近距離（幾公分）的無線感應，手機感應付款就是它</li><li>🏷️ <b>RFID</b>：無線射頻辨識，晶片標籤不必對準也能讀，悠遊卡、eTag 都是</li></ul>",
  "stages": [
   {
    "goal": "結帳的四種技術、條碼掃描的過程（題庫隨機抽）",
    "rounds": [
     {
      "type": "sort",
      "src": "11602/N10/0/0",
      "prompt": "這個「嗶」用的是哪一種技術？",
      "pick": 5,
      "buckets": [
       {
        "id": "bar",
        "label": "條碼",
        "icon": "▮"
       },
       {
        "id": "qr",
        "label": "QR code",
        "icon": "▦"
       },
       {
        "id": "nfc",
        "label": "NFC",
        "icon": "📳"
       },
       {
        "id": "rfid",
        "label": "RFID",
        "icon": "🏷️"
       }
      ],
      "items": [
       {
        "t": "超商店員掃描飲料瓶上的黑白線條",
        "icon": "🥤"
       },
       {
        "t": "用手機鏡頭掃描餐廳桌上的點餐碼",
        "icon": "🍜"
       },
       {
        "t": "把手機靠近收銀機感應付款",
        "icon": "📱"
       },
       {
        "t": "開車經過高速公路門架自動扣款",
        "icon": "🚗"
       },
       {
        "t": "拿悠遊卡刷捷運閘門",
        "icon": "🚇"
       },
       {
        "t": "圖書館把一疊書放上去就自動借出",
        "icon": "📚"
       },
       {
        "t": "把一整籃商品放上結帳區，螢幕馬上列出全部",
        "icon": "🧺"
       },
       {
        "t": "掃描電影票上的方格圖案入場",
        "icon": "🎟️"
       },
       {
        "t": "書背上印著黑白直線的 ISBN",
        "icon": "📕"
       }
      ]
     },
     {
      "type": "order",
      "src": "11602/N10/0/1",
      "prompt": "條碼是怎麼被「嗶」出來的？依序排好",
      "items": [
       {
        "t": "黑色吸收光線、白色反射光線",
        "icon": "▮"
       },
       {
        "t": "掃描器接收反射光，轉成數位訊號",
        "icon": "📡"
       },
       {
        "t": "解碼成數字，傳給電腦處理",
        "icon": "💻"
       },
       {
        "t": "掃描器發出光線照在條碼上",
        "icon": "🔦"
       }
      ]
     }
    ]
   },
   {
    "goal": "🧪 條碼掃描器：雷射劃過條碼、讀出 1 和 0、換成數字（🎲）",
    "rounds": [
     {
      "type": "lab",
      "lab": "barcodeScan",
      "n": 2,
      "prompt": "條碼掃描器",
      "src": "11602/N10/1/0"
     }
    ]
   },
   {
    "goal": "🧪 自己印條碼（不給總和）＋倒著掃＋RFID 結帳比一比（🎲）",
    "rounds": [
     {
      "type": "lab",
      "lab": "barcodePrint",
      "n": 1,
      "prompt": "印一張條碼",
      "src": "11602/N10/2/0"
     },
     {
      "type": "gen",
      "gen": "barcode",
      "n": 1,
      "prompt": "簡化版條碼解碼：挑戰",
      "hard": true,
      "src": "11602/N10/2/1"
     },
     {
      "type": "gen",
      "gen": "checkout",
      "n": 1,
      "prompt": "結帳比一比",
      "src": "11602/N10/2/2"
     }
    ]
   }
  ]
 }
];
