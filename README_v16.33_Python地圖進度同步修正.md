# v16.33｜Python 闖關地圖同步修正

## 修正內容
- Python 回到 116-1 闖關地圖前，先把 30 題完成狀態與各站星數寫回本機進度與 STORE。
- 闖關地圖在 pageshow、focus、重新顯示時重新讀取進度，避免瀏覽器還原舊畫面。
- Python 進度計算改成 10 站各 3 題，共 30 題；修正地圖仍使用舊版 26 題設定的問題。
- `python.html` 改載入全新檔名 `python-journey-v1633.js` 並顯示 v16.33，避免瀏覽器沿用舊 JS 快取。
- 不需修改 Firebase Rules 或 Cloudflare Worker。

## 更新檔案
- `shared/hub.js`
- `11601/hub.html`
- `11602/hub.html`
- `11601/python.html`
- `11601/content/python-journey-v1633.js`
