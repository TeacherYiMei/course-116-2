# Python 新版整合說明

本完整專案以 course_116 為主體，僅取代 116-1 的 Python 教學模組。

## 保留
- 116-1 數位時代
- 116-1 系統平臺大冒險
- 116-1 5016B AIoT
- 116-2 多媒體、網路世界、進階資料處理、5016B、課堂挑戰、總複習
- shared/ 原有共用架構（除 Python 執行器更新）
- docs、server、pylab、tests、tools

## 取代
- `11601/python.html`
- 舊 `11601/content/python.js`（移除）
- 新增 `11601/content/python-journey.js`
- 新增 `11601/python-journey.css`
- 新增 `11601/python-guide.html`

## Python 新版
- 10 關 26 挑戰
- 核心順序：print → 變數 → input → 運算 → 比較／if → elif → and/or → for → while → 綜合應用
- 執行與正式檢查分離
- input() 頁面內互動
- 中文除錯與提示
- 情境內容合理性檢查
- 學習帳號與 Firebase 進度留存
- 教師端班級權限、統計與 Excel

## course116 地圖整合
Python 的 26 個挑戰會換算成 26 顆星，並同步到 116-1 闖關地圖。
P1～P10 每關完成挑戰數即為該關星數，例如 P2 有 3 個挑戰，完成 2 個即顯示 2⭐。
