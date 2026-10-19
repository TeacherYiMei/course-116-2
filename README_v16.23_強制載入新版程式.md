# v16.23｜強制載入新版程式

## 原因
v16.22 已包含 input() 互動輸入函式，但部分瀏覽器／GitHub Pages 仍載入舊的 `python-journey.js`。

## 修正
- 將主程式改為全新檔名：`11601/content/python-journey-v1623.js`
- `python.html` 改為直接載入這個新檔名。
- 避免瀏覽器、CDN 或 Service Worker 繼續使用舊 JavaScript。

## 驗證
遇到 input() 時，應在執行結果下方出現輸入框，不再顯示「網站檢查暫時發生問題」。
