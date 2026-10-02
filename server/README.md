# 🔐 驗證伺服器（Google Apps Script）部署說明

答案、判斷對錯、扣 ❤️、出題、發星星，全部在這個伺服器上。網站（GitHub Pages）只有題目。
這個資料夾是**伺服器程式**（公開，沒有答案）；真正要貼到 Apps Script 的是建置後的 **`private/伺服器一鍵貼上/`**（全部合成一個檔、含答案，不能公開）。

```
node tools/build.mjs
  → private/伺服器一鍵貼上/一鍵複製.html、一鍵貼上_course116.gs   📋 全部合成一個檔（建議用這個）
  → private/server/
       00_env.js … 61_gen_cipher.js   伺服器程式（和這個資料夾一樣）
       70_sheet_engine.js             試算表引擎（shared/sheet.js 的複本）
       90_answers.js                  ⚠️ 全部答案（SV_ANS）
       appsscript.json                專案設定（時區、網頁應用程式權限）
```

## 一、第一次部署（約 10 分鐘）

> 建議用**個人 Google 帳號**：很多學校的 Workspace 不允許「所有人（不必登入）」存取網頁應用程式。

1. 在 repo 根目錄執行 `node tools/build.mjs`。
2. 打開 <https://script.google.com> → **新專案**，專案名稱改成「course_116 驗證伺服器」。
3. 📋 **一鍵貼上**：用瀏覽器打開 `private/伺服器一鍵貼上/一鍵複製.html` → 按「📋 複製全部」
   → 回到 Apps Script 的 `程式碼.gs`，**Ctrl＋A 全選、Ctrl＋V 貼上**（整個取代）→ 💾 儲存。
   （全部伺服器檔案已經依序合成一個，只要這一個檔。也可以用記事本打開同資料夾的 `一鍵貼上_course116.gs` 全選複製。）
4. 右上角 **部署 → 新增部署作業**：
   - 類型：⚙️ → **網頁應用程式**
   - 執行身分：**我**
   - 誰可以存取：**所有人**
   - 按「部署」→ 第一次會要求授權（「這個應用程式未經 Google 驗證」→ 進階 → 前往…）→ 允許。
5. 複製「網頁應用程式網址」（`https://script.google.com/macros/s/…/exec`）。
6. 用瀏覽器打開這個網址，應該看到：
   ```json
   {"ok":true,"service":"course_116 驗證伺服器","labs":33,"gens":31,"missing":[],"terms":["11601","11602"],…}
   ```
7. 把網址填進 **`11601/config.js` 和 `11602/config.js`** 的 `VERIFY_URL`（兩個填一樣的），提交、推送網站。
8. 打開網站玩一關：答錯會扣 ❤️、過關會拿到星星，就成功了。

<details><summary>另一種做法：分開的檔案（private/server/，給會用 clasp 的人）</summary>

`private/server/` 是同一份內容拆成一個一個的檔（加 `appsscript.json`）。手動貼的話要**照檔名數字順序建立**（Apps Script 依編輯器裡的順序載入）；用 clasp：

```bash
npm install -g @google/clasp
clasp login
# 第一次：⚙️ 專案設定 → 複製「指令碼 ID」存成 private/script-id.txt
node tools/build.mjs                          # 會多產生 private/server/.clasp.json（照檔名順序上傳）
cd private/server && clasp push -f
```
⚠️ 兩種做法不要混用：專案裡同時有一鍵版和分開的檔案，程式會重複定義。
</details>

## 二、改題目之後

1. 改 `private/` → `node tools/build.mjs` → `cd tests && npm test`。
2. 📋 打開 `private/伺服器一鍵貼上/一鍵複製.html` → 複製全部 → 到 Apps Script 的 `程式碼.gs` 全選、貼上、儲存。
3. **部署 → 管理部署作業 → ✏️ 編輯 → 版本：新版本 → 部署**。網址不會變。
4. 用瀏覽器打開網址，看 `built`（建置時間，UTC）是不是剛剛那次。
5. 推送網站。

⚠️ 網站和伺服器要一起更新：題目順序改了、伺服器還是舊的，學生會一直答錯。

## 三、選用設定（⚙️ 專案設定 → 指令碼屬性）

| 屬性 | 用途 |
|---|---|
| `SECRET` | 收據、🔑 pylab 進度碼簽章的金鑰。第一次有人過關時自動產生，**不要改**（改了以前的收據、進度碼就驗證不過） |
| `FEEDBACK_SHEET_ID` | 📮 Python 教師試用版（`pylab/teacher.html`）的回報試算表。**不用自己填**：第一次有人回報時自動建立「course_116 Python 老師回報」並記在這裡。想先找到它：編輯器選函式 `建立回報試算表` → 執行 → 看執行記錄的網址 |
| `PYLAB_SHEET_ID` | 🐍 pylab 學生進度試算表「course_116 pylab 學生進度」。**不用自己填**，第一次有學生拿到星星時自動建立 |
| `PYLAB_TEACHER_KEY` | 📊 pylab 老師密碼（teacher.html 看學生進度表）。編輯器選函式 `pylab老師密碼` → 執行 → 執行記錄印出密碼和試算表網址；想換就直接改這個屬性 |
| `LOG_SHEET_ID` | 填一份 Google 試算表的 ID（網址 `/d/` 和 `/edit` 中間那段），每次過關就記一列到「紀錄」工作表：時間、班級座號姓名、關卡、星、剩幾顆 ❤️、花幾秒。第一次要重新授權（部署 → 管理部署作業 → 新版本） |

## 四、在自己電腦預覽（不用部署）

```bash
node tools/build.mjs
node tools/dev-server.mjs        # → http://localhost:8116/
```
網頁在 `localhost` 時會自動把答案送到本機的模擬伺服器（`tools/gas-mock.mjs` 載入 `private/server/`，模擬 Apps Script 的服務）。
`NOGAS=1 node tools/dev-server.mjs` 可以看「連不上伺服器」的練習模式。

## 五、容量與速度

- 每按一次大約 0.3～1.5 秒（Apps Script 的正常速度）。網頁送出時會鎖住按鈕，避免連按。
- 同一個帳號同時執行的上限約 30 個；一個班（30 人）一起玩沒問題。伺服器忙時網頁會自動等一下重送（最多 3 次），還是不行會顯示「伺服器很忙」。全校同時段上課的話，可以用不同帳號各部署一份，不同班級填不同網址。
- 一局的狀態存在 CacheService 6 小時；超過就要重新開始那一關（網頁會提示）。

## 六、程式結構（給改程式的人）

| 檔案 | 內容 |
|---|---|
| `00_env.js` | Apps Script 沒有 `window`：補上全域（出題器、實驗站都掛在這裡） |
| `10_util.js` | 亂數（含有種子的 `svSeeded`）、快取、鎖、HMAC 收據、過關紀錄 |
| `20_main.js` | `doPost` 入口、動作路由 `SV_ACTIONS`、健康檢查 `doGet` |
| `30_cards.js` | 一局（run）：`start` → `ans`／`gen`＋`gq`／`lab`＋`lq` → `fin` |
| `39_labs_common.js` | 實驗站的回傳格式 `svYes`／`svNo`／`svPart` |
| `40`～`44_labs_*.js` | 33 個實驗站：`make(hard) → { pub, sec }`、`check(sec, 學生的操作) → 結果` |
| `50_python.js` | `py`（拿測資）／`pyg`（送輸出評分） |
| `51_sheet.js` | `sh`／`shc`（清理）／`shf`（公式） |
| `53_pylab.js` | 🐍 pylab 學生版：🔑 進度碼與 ☁️ 雲端存檔。`py` 開局時檢查上一關 2⭐（伺服器端鎖關）、`pyg` 評完存雲端並發新進度碼、`pcv` 驗證進度碼、`pls` 學生登入同步、`plt` 老師看進度表 |
| `52_misc.js` | 5016B 計星（`lks` 開局、`lk` 預測、`lkf` 結算、`lkp` 專題成果卡）、`dq`（單元一）、`hint`（漸進提示）、`fb`（📮 Python 教師試用版的回報，寫進試算表） |
| `60_gen_net.js`、`61_gen_cipher.js` | 🎲 出題器（只在伺服器執行） |

網頁端的對應：`shared/api.js`（連線）、`shared/cardgame.js`（遊戲引擎）、`shared/*-labs.js`（實驗站畫面）、`shared/pyrunner.js`、`shared/sheet.js`、`shared/labkit.js`、`11601/digital/progress-hook.js`。
