# course_116 · 116 學年度九年級資訊科技課程系統

九年級資訊科技闖關學習網站。延續 [course_115](https://github.com/su-yung-sheng/course_115) 的架構：
**一個 repo、一套 `shared/`，服務上下兩個學期**；兩學期資料夾結構相同，差別只在 `config.js` 與 `content/`。

- 總入口 `index.html`（依日期倒數 3 秒導向，可取消；`?term=11601` 直接進、`?stay` 停留）
- 上學期 `11601/hub.html`
- 下學期 `11602/hub.html`

---

## 📚 116-1 上學期有哪些課

| 單元 | 頁面 | 課本 | 星數 | 內容 |
|---|---|---|---|---|
| 💾 一 數位時代 | `digital/` | 第 1 章 | 24 | 二進位、文字、聲音、影像四個互動實驗站，每課 🧪 實驗任務＋✅ 快速檢核（[unforte_114](https://github.com/byte-core-su/unforte_114) 移植） |
| 🐍 二 進入 Python 的世界 | `python.html` | 第 2 章 | 30 | 「畢旅籌備處」10 個任務，**瀏覽器內執行＋測資自動評分**，2⭐ 開下一關；附 📚 語法小抄 `pyref.html` |
| 🖥️ 三 系統平臺大冒險 | `platform.html` | 第 3 章 | 24 | 8 關三星三階＋🧪 實驗站：平臺組合機、五大單元傳令兵、記憶體調度、組電腦、OS 總管、電腦急診室、雲端披薩店、嵌入式積木 |
| 💡 5016B 專題 | `5016b.html` | 跨章 | 15 | AIoT 智慧教室守護站：取樣、if 警示燈、節能風扇、資料上雲端、專題成果卡（每節 3⭐，預測錯越少星越多） |

## 📚 116-2 下學期有哪些課

| 單元 | 頁面 | 課本 | 星數 | 內容 |
|---|---|---|---|---|
| 🎬 四 多媒體專題：30 秒廣告 | `media.html` | 3下 第 1 章＋AI 素養 | 30 | **好好用 AI**：概念闖關 ＋ 看示範（手法拆解）＋ 🤖 AI 素養六關（改編自 Day of AI）＋ 廣告工作站（決定主題 → 三句文案 → 拍攝重點 → 配樂 → 剪輯，每步附 AI 提示詞與使用紀錄） |
| 🌐 五 網路世界 | `network.html` | 3下 第 2 章 | 30 | 10 個遊戲：網路線材、封包快遞、IP 與 IPv6、網址拆解、無線網路、網速計算… |
| 🏁 課堂挑戰／🎓 總複習 | `challenge.html`、`review.html` | 全學年 | — | 老師投影的小組搶答（🎲 隨機出題、計分排名）；會考前上下學期混合抽題 |
| 🗂️ 六 進階資料處理 | `unit6.html` | 3下 第 3 章 | 45 | **一張課程小卡包三部分**：① 資料偵探（大數據、資料清理、ODF 與壓縮、密碼入門）② 試算表實作（SUM／AVERAGE／COUNTIF **公式自動評分**，附 📊 函式小抄 `sheetref.html`）③ 密碼特務（不寫程式、**🎲 每次隨機出題**，2⭐ 開下一關） |
| 💡 5016B 守護站 2.0 | `5016b.html` | 跨章 | 15 | 選無線技術、私有 IP、封包重送、加密上傳、連網小幫手成果卡（每節 3⭐） |

完整規劃（關卡表、計星規則、建議週次）：**[docs/01_課程規劃.md](docs/01_課程規劃.md)**

## 📄 文件

| 主題 | 檔案 |
|---|---|
| 課程規劃（兩學期各單元＋5016B 的關卡與計星） | [docs/01_課程規劃.md](docs/01_課程規劃.md) |
| 系統架構、進度 API、接回 Firebase 的步驟 | [docs/02_系統架構.md](docs/02_系統架構.md) |
| Python 評分規格（測資寫法、錯誤翻譯機） | [docs/03_Python評分規格.md](docs/03_Python評分規格.md) |
| 設計系統（配色規則、共用元件、頁面骨架） | [docs/04_設計系統.md](docs/04_設計系統.md) |
| 安全性（答案只在驗證伺服器、練習模式、防使用者腳本／F12 的三層對策） | [docs/05_安全性.md](docs/05_安全性.md) |
| 🔐 驗證伺服器部署（Google Apps Script） | [server/README.md](server/README.md) |
| 🐍 Python 畢旅籌備處（和闖關網站分開，給其他老師和他們的學生） | [pylab/README.md](pylab/README.md)　學生：`/pylab/`　老師試用、回報：`/pylab/teacher.html` |
| 108 課綱對照（每一關的學習內容、學習表現代碼） | [docs/06_課綱對照.md](docs/06_課綱對照.md) |

## ⚠️ 目前狀態：完整課程可運作；Python 已接 Firebase，其他單元仍沿用原本 STORE

進度存在瀏覽器的 localStorage，登入只填班級／座號／姓名。**可以直接上課試用**，但：

- 電腦教室有還原卡 → 關機進度就清掉（學生可先按「下載我的進度」帶走）
- 沒有教師端、沒有學期鎖

正式上課前要把 `shared/store.js` 換成 Google 登入＋Firestore 版本（**新的 Firebase 專案**，寫法參考 course_115）—— **API 不變，各頁面不用改**。步驟見 `docs/02_系統架構.md`。

## 🛠️ 改內容看這裡

> 🔒 **有答案的內容一律改 `private/`，改完執行 `node tools/build.mjs`**，它會產生只有題目的 `content/*.js`，和要貼到 Google Apps Script 的 `private/server/`（**兩邊都要更新**，步驟見 `server/README.md`）。
> 公開檔案裡的 `content/*.js` 是自動產生的，**不要直接改**（下次建置會被蓋掉）。`private/` 不會進 Git，**請自己備份**。詳見 `docs/05_安全性.md`。

| 要改什麼 | 改哪支 |
|---|---|
| 單元名稱、星數、稱號（門檻是「平均完成度」%：各單元完成 % 的平均）、Pyodide 位置、備課全開 | `{學期}/config.js` |
| 📅 本週任務的週次表、📚 課綱對照 | `{學期}/config.js` 的 `WEEKS`、`CURRICULUM`（改完課綱跑 `node tools/k12-doc.mjs`） |
| Python 關卡、測資、提示、Scratch 對照（上學期） | `private/11601/content/python.js` → 建置 |
| 密碼特務的關卡與概念小卡 | `private/11602/content/cipher.js` → 建置；出題規則在 `server/61_gen_cipher.js`（網路世界：`server/60_gen_net.js`） |
| 🧪 實驗站的情境與判斷 | `server/40`～`44_labs_*.js`（畫面在 `shared/*-labs.js`） |
| 🔐 驗證伺服器網址 | `{學期}/config.js` 的 `VERIFY_URL`（兩學期填一樣） |
| 互動遊戲的題目與說明 | `private/11601/content/platform.js`、`private/11602/content/{media,network,data}.js` → 建置 |
| 試算表關卡的資料與公式 | `private/11602/content/sheet.js` → 建置 |
| 專題工作站的步驟與檢核項目 | `private/11602/content/media.js` 的 `MEDIA_STEPS` → 建置 |
| 5016B 檢核的正確選項與解說 | `private/{學期}/lab.js` → 建置 |
| 5016B 五節內容（題目、選項、模擬器） | `{學期}/5016b.html` 裡的 `SECTIONS`（不放答案） |
| 單元一快速檢核的對錯與提示 | `private/11601/digital/review.json` → 建置 |
| 全站配色（單元色、步驟色、共用元件） | `shared/theme.css`，規則見 `docs/04_設計系統.md` |

建置（需要 Node.js 18 以上）：

```
node tools/build.mjs          ← 在 repo 根目錄；讀 private/，寫出公開的題目檔＋private/server/（伺服器整包）
```

## 🔍 本機預覽與測試

```
node tools/dev-server.mjs         ← 在 repo 根目錄，開 http://localhost:8116/（含本機模擬的驗證伺服器）
```

不要直接雙擊 HTML：`file://` 下 Web Worker 會被擋，Python 引擎起不來。

自動測試（Playwright；CDN 會導到本機檔案，不需要連網）：

```
cd tests
npm install
npx playwright install chromium
npm test          ← 完整（約 20 分鐘）
npm run quick     ← 快速：洩漏掃描、伺服器驗證、亂猜模擬、導覽、錯誤頁、實驗站、課堂挑戰、無障礙（約 4 分鐘）
```

`npm test` 第一步是 `leak_scan.mjs`：把 `private/` 裡的正解、解說、提示、標準公式逐段拿去比對公開檔案（網站＋`server/` 程式），並檢查公開題目檔沒有答案欄位，發現就失敗 —— **推送前跑一次**。
接著 `test_server.mjs` 直接用作弊的方式打伺服器（沒答完就結算、❤️ 用完繼續、亂送資料、收據簽章）。測試用 `tools/gas-mock.mjs` 在測試程式裡模擬伺服器，實驗站的解題器可以偷看伺服器的情境（學生的網頁看不到）。

涵蓋：上學期 10 關 Python 參考解答都拿 3⭐、11 種「不該滿分」的寫法被擋下、12 種錯誤翻譯、無窮迴圈會被砍掉且引擎自動恢復；
所有三星三階關卡（系統平臺、網路世界、資料偵探、概念闖關、AI 素養、密碼特務）由解題機器人一階一階打到 3⭐，每一階亂猜過關機率 < 1%（`guess_sim.mjs`，48 關）；23 個 🧪 實驗站做錯會被擋下並說明；密碼特務 6 關由解題機器人照畫面題目作答全部通關、驗證每次題目不同、愛心歸零；試算表公式計算與 5 關評分（含寫死數字被擋、資料清理）；
30 秒廣告工作站五個步驟（含看示範、AI 前導關）；兩學期 5016B 十節的預測檢核與成果卡；單元一進度掛鉤；12 個頁面和所有實驗站在手機寬度沒有橫向捲動；課堂挑戰（搶答、鎖題、重新整理續玩、排名）、會考前總複習、本週任務、徽章、單元學習卡、進度下載提醒；axe-core 掃 40 個畫面 0 個無障礙問題；連不上伺服器時的練習模式（`test_offline.mjs`）。

## 📄 授權

同 course_115：**CC BY-NC-SA 4.0**。翰林課本內容不在授權範圍內（註解裡的頁碼只是備課對照）。
單元一的互動頁面來自 byte-core-su/unforte_114。


## 🐍 Python 模組整合版（本專案 v12）
- 已以 `course115-1 Python v11.2` 完整取代原本 `11601/python.html` 與舊 Python 闖關內容。
- 保留 course_116 其他單元：數位時代、系統平臺、5016B、多媒體、網路世界、進階資料處理、課堂挑戰與總複習。
- Python 共 10 關、26 挑戰，學生可「執行看看」與「檢查挑戰」分開操作。
- 支援 input() 頁面內互動輸入、中文除錯、情境內容合理性檢查、90 秒輸入等待保護。
- Python 學生資料與進度可同步 Firebase；教師端：`/teacher.html`。
- 多教師可依 `teachers/{uid}.classes` 只查看授權班級；admin 可查看全部班級。
- Python 進度會同步回 116-1 闖關地圖；舊版 Python localStorage 進度也會被地圖讀取。
- Firestore 規則與設定說明見根目錄 `firestore.rules` 與 `FIREBASE_SETUP.md`。


## v13：教師學生資料維護
- 教師端新增「🛠️ 維護」欄。
- 任課教師可刪除自己 `classes` 授權班級中的錯誤學生 Firestore 紀錄。
- `admin` 可維護全部班級。
- 同班同座號若有多筆歷史紀錄，維護視窗會列出每一筆原始紀錄，可單獨刪除，不會把合併後的正確進度整組誤刪。
- Firestore Security Rules 同步限制刪除權限，不只靠前端按鈕。
- 刪除的是學生學習紀錄；Firebase Authentication 登入帳號不會由瀏覽器教師端自動刪除。

## v13.1：教師維護欄固定顯示
- 將「維護」欄從最右側移到姓名後方。
- 強制維護按鈕可見，避免被表格寬度或容器裁切。
- 保留 v13 的逐筆刪除、重複紀錄展開、授權班級刪除限制。

## v13.2：教師端快取刷新
- `teacher.html` 對 firebase-config.js 與 teacher-dashboard.js 加入 `?v=13.2`。
- 強制 GitHub Pages / 瀏覽器重新載入教師端 JavaScript。
- 教師頁顯示「版本：v13.2 教師資料維護版」，方便確認部署版本。


## v14：學生資料管理
- 教師維護視窗新增「📊 關卡明細」「✏️ 更正資料」「↺ 重設進度」「🗑️ 刪除此筆」。
- 關卡明細列出 P1～P10 各關完成挑戰數與完成狀態。
- 可更正姓名、座號、班級。
- 修改班級時，修改前後班級都必須是該教師授權班級；admin 不受此限制。
- 儲存前檢查同班同座號是否已有其他紀錄，避免製造衝突。
- 重設進度必須再次輸入「重設」確認，才會把 Python 星星／進度／證書狀態歸零。
- Firestore Rules 已允許任課教師更新自己授權班級的學生資料。
- 注意：Firebase Authentication 的學生學習帳號仍不能由瀏覽器教師端直接改 Email；更正班級／座號時會顯示警告。


## v15：完整刪除學生帳號
- 教師端刪除功能改為「刪除全部資料與帳號」。
- 必須輸入「永久刪除」再次確認。
- 新增 Firebase Cloud Function `deleteStudentAccount`。
- 後端使用 Firebase Admin SDK 刪除 Firestore 學習資料與 Firebase Authentication 帳號。
- 一般教師仍只能刪自己授權班級；admin 可刪全部班級。
- Cloud Function 必須另外部署；GitHub Pages 本身無法執行 Admin SDK。
