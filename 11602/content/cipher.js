/* ⚠️ 自動產生，請勿手改。來源：private/11602/content/cipher.js（私有，不進 git）；產生方式：node tools/build.mjs
   公開版只有題目：答案、解說、提示、預期輸出都在驗證伺服器（server/，見 server/README.md）。 */
window.CIPHER_LEVELS = [
 {
  "id": "K1",
  "icon": "🔢",
  "title": "字母編號站",
  "book": "任務 1 · 電腦只懂數字",
  "learn": "電腦只認得數字，所以要先把字母變成<b>編號</b>。<br>特務的約定：<span class=\"hl\">A＝0、B＝1、C＝2 …… Z＝25</span>（從 0 開始數！）<br>還記得上學期「文字數位化」嗎？電腦用 ASCII 把 A 存成 65、B 存成 66 —— 我們的編號就是把它「減掉 65」。<br>🧩 Scratch 的想法：把字母換成它在「字母表清單」裡的位置 − 1。<br>🎲 每次挑戰的字母都是隨機的：第一回合可以看表，第二回合要靠記憶！",
  "stages": [
   {
    "goal": "看編號表，字母 ↔ 編號（🎲 字母每次不同）",
    "rounds": [
     {
      "type": "gen",
      "gen": "letterNum",
      "n": 4,
      "prompt": "看表找編號",
      "tool": "abc",
      "src": "11602/K1/0/0"
     }
    ]
   },
   {
    "goal": "整個單字 ↔ 一串編號（🎲）",
    "rounds": [
     {
      "type": "gen",
      "gen": "letterNum",
      "n": 2,
      "prompt": "整個單字換成編號",
      "tool": "abc",
      "hard": true,
      "src": "11602/K1/1/0"
     }
    ]
   },
   {
    "goal": "不看表，靠記憶換算（🎲）",
    "rounds": [
     {
      "type": "gen",
      "gen": "letterNum",
      "n": 3,
      "prompt": "不看表，挑戰記憶",
      "src": "11602/K1/2/0"
     },
     {
      "type": "gen",
      "gen": "letterNum",
      "n": 2,
      "prompt": "整個單字（不看表）",
      "hard": true,
      "src": "11602/K1/2/1"
     }
    ]
   }
  ]
 },
 {
  "id": "K2",
  "icon": "🎡",
  "title": "轉盤繞圈圈",
  "book": "任務 2 · 超過就繞回來（取餘數）",
  "learn": "⏰ 時鐘：10 點再過 5 小時是 3 點，不是 15 點 —— 超過 12 就<b>繞回來</b>。<br>字母也一樣，只有 26 個：<ul><li>往後移：<b>新編號 ＝ 編號 ＋ 位移</b>，超過 25 就 <b>減 26</b></li><li>往前移：<b>新編號 ＝ 編號 − 位移</b>，小於 0 就 <b>加 26</b></li></ul>數學上叫做「除以 26 的<span class=\"hl\">餘數</span>」，寫成 <code>% 26</code>。例：(23 ＋ 5) % 26 ＝ 2，也就是 X 往後 5 格是 C。<br>🧩 Scratch 的想法：「如果 編號 > 25 那麼 將 編號 改變 −26」。",
  "stages": [
   {
    "goal": "算出繞圈後的編號（🎲）",
    "rounds": [
     {
      "type": "gen",
      "gen": "wrap",
      "n": 4,
      "prompt": "算出新的編號",
      "tool": "abc",
      "src": "11602/K2/0/0"
     }
    ]
   },
   {
    "goal": "字母直接繞圈、連續移兩次（🎲）",
    "rounds": [
     {
      "type": "gen",
      "gen": "wrap",
      "n": 2,
      "prompt": "字母繞圈圈",
      "tool": "abc",
      "hard": true,
      "src": "11602/K2/1/0"
     }
    ]
   },
   {
    "goal": "不看表的繞圈挑戰（🎲）",
    "rounds": [
     {
      "type": "gen",
      "gen": "wrap",
      "n": 4,
      "prompt": "繞圈挑戰（不看表）",
      "hard": true,
      "src": "11602/K2/2/0"
     }
    ]
   }
  ]
 },
 {
  "id": "K3",
  "icon": "🔏",
  "title": "加密特務",
  "book": "任務 3 · 凱薩密碼加密",
  "learn": "<b>凱薩密碼</b>：每個字母都往後移同樣的格數，這個格數就是<b>金鑰</b>。<br><b>加密演算法</b>（對每一個字母做一次）：<ol><li>找出字母的編號</li><li>加上金鑰</li><li>超過 25 就減 26（繞回來）</li><li>把編號換回字母</li></ol>🧩 Scratch 的想法：「重複執行（字數）次」，每次處理一個字母，接到結果後面。<br>🎡 用轉盤：把位移調成金鑰，上排找明文、下排讀密文。",
  "stages": [
   {
    "goal": "用轉盤加密短單字（🎲 單字、金鑰每次不同）",
    "rounds": [
     {
      "type": "gen",
      "gen": "caesarEnc",
      "n": 2,
      "max": 4,
      "prompt": "用轉盤加密",
      "tool": "caesar",
      "src": "11602/K3/0/0"
     }
    ]
   },
   {
    "goal": "不用轉盤：查編號表、自己算（🎲）",
    "rounds": [
     {
      "type": "gen",
      "gen": "caesarEnc",
      "n": 3,
      "min": 4,
      "prompt": "用編號算出密文",
      "tool": "abc",
      "src": "11602/K3/1/0"
     }
    ]
   },
   {
    "goal": "金鑰很大、甚至超過 26（🎲）",
    "rounds": [
     {
      "type": "gen",
      "gen": "caesarEnc",
      "n": 2,
      "min": 4,
      "prompt": "大金鑰加密",
      "tool": "abc",
      "hard": true,
      "src": "11602/K3/2/0"
     }
    ]
   }
  ]
 },
 {
  "id": "K4",
  "icon": "🔓",
  "title": "攔截密文",
  "book": "任務 4 · 解密與暴力破解",
  "learn": "<b>解密</b>就是反過來：每個字母<b>往前</b>移金鑰那麼多格（小於 0 就加 26）。<br>🕵️ 如果攔截到密文，卻<b>不知道金鑰</b>呢？凱薩密碼只有 25 種金鑰 —— 一個一個試，看哪一個會變成有意義的單字。這叫<span class=\"hl\">暴力破解</span>。<br>人要試 25 次，電腦一眨眼就試完。所以凱薩密碼<b>不安全</b>：真正的加密（像 https）金鑰多到試到宇宙毀滅都試不完。",
  "stages": [
   {
    "goal": "知道金鑰，把密文解開（🎲）",
    "rounds": [
     {
      "type": "gen",
      "gen": "caesarDec",
      "n": 2,
      "prompt": "知道金鑰，把密文解開",
      "tool": "caesar",
      "src": "11602/K4/0/0"
     }
    ]
   },
   {
    "goal": "不知道金鑰：暴力破解（🎲）",
    "rounds": [
     {
      "type": "gen",
      "gen": "bruteForce",
      "n": 2,
      "prompt": "不知道金鑰，暴力破解",
      "tool": "caesar",
      "src": "11602/K4/1/0"
     }
    ]
   },
   {
    "goal": "同一把金鑰的兩個單字＋查表解密（🎲）",
    "rounds": [
     {
      "type": "gen",
      "gen": "bruteForce",
      "n": 1,
      "prompt": "攔截兩個單字",
      "tool": "caesar",
      "hard": true,
      "src": "11602/K4/2/0"
     },
     {
      "type": "gen",
      "gen": "caesarDec",
      "n": 1,
      "prompt": "用編號表解密",
      "tool": "abc",
      "src": "11602/K4/2/1"
     }
    ]
   }
  ]
 },
 {
  "id": "K5",
  "icon": "📜",
  "title": "維吉尼亞特務",
  "book": "任務 5 · 每個位置不同的金鑰",
  "learn": "凱薩密碼太好破解了，<b>維吉尼亞密碼</b>讓每個位置用<b>不同的金鑰</b>：<br>例：金鑰 3、1、4 → 第 1 個字母移 3 格、第 2 個移 1 格、第 3 個移 4 格，第 4 個又從 3 開始。<br>🔍 神奇的地方：同樣是 E，出現在不同位置就會變成不同的密文 —— 看密文<b>猜不出</b>哪些字母本來一樣，破解難多了。<br>📜 下面的密碼表可以幫忙：找到「金鑰」那一列、「明文」那一欄。",
  "stages": [
   {
    "goal": "兩把金鑰輪流用（🎲）",
    "rounds": [
     {
      "type": "gen",
      "gen": "vigEnc",
      "n": 2,
      "keys": 2,
      "prompt": "兩把金鑰加密",
      "tool": "vigenere",
      "src": "11602/K5/0/0"
     }
    ]
   },
   {
    "goal": "三把金鑰輪流用（🎲）",
    "rounds": [
     {
      "type": "gen",
      "gen": "vigEnc",
      "n": 2,
      "keys": 3,
      "prompt": "三把金鑰加密",
      "tool": "vigenere",
      "src": "11602/K5/1/0"
     }
    ]
   },
   {
    "goal": "反過來：維吉尼亞解密（🎲）",
    "rounds": [
     {
      "type": "gen",
      "gen": "vigDec",
      "n": 2,
      "prompt": "維吉尼亞解密",
      "tool": "vigenere",
      "src": "11602/K5/2/0"
     }
    ]
   }
  ]
 },
 {
  "id": "K6",
  "icon": "📊",
  "title": "答題統計特務",
  "book": "任務 6 · 資料處理：計數與比率",
  "learn": "密碼特務也要會分析資料！老師收到全班一題的作答，想知道：<ul><li>✅ <b>答對幾人</b>：一個一個看，和正解一樣就 +1（試算表的 <code>COUNTIF</code> 就是在做這件事）</li><li>🔍 <b>選某個錯誤選項的有幾人</b>：換一個條件再數一次 —— 錯最多的選項，就是大家最容易誤會的地方</li><li>📊 <b>答對率</b> ＝ 答對人數 ÷ 作答人數 × 100（%）</li></ul>🎲 每次挑戰，全班的作答都是隨機產生的。",
  "stages": [
   {
    "goal": "答對人數、選某個選項的人數、答對率（🎲 全班作答每次不同）",
    "rounds": [
     {
      "type": "gen",
      "gen": "tally",
      "prompt": "統計全班作答",
      "src": "11602/K6/0/0"
     }
    ]
   },
   {
    "goal": "換一題再統計（🎲）",
    "rounds": [
     {
      "type": "gen",
      "gen": "tally",
      "prompt": "換一題再統計",
      "src": "11602/K6/1/0"
     }
    ]
   },
   {
    "goal": "人數更多，還要找出錯最多的選項（🎲）",
    "rounds": [
     {
      "type": "gen",
      "gen": "tally",
      "prompt": "大班級統計",
      "hard": true,
      "src": "11602/K6/2/0"
     }
    ]
   }
  ]
 }
];
