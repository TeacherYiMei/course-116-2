# v16.35 全站 Firebase 星星同步修正

## 本版修正
1. Firebase 初始化先等待 Auth 還原上一頁的登入狀態，避免還原尚未完成時誤建匿名帳號。
2. STORE.syncCloud 先讀取同一 Firebase UID 的 courseProgress，再逐單元、逐關合併本機舊紀錄與雲端紀錄，星數取較高值後上傳。
3. 教師版顯示 Python 星數及「全站各單元星數」，平均星星改為全站雲端星數總和的平均。
4. 教師頁及 Python 頁顯示 v16.35，更新 Firebase/STORE/地圖相關腳本快取版本。
5. 闖關地圖備份說明更新；仍保留 JSON 匯出作為備份。

## 部署
將更新 ZIP 內檔案依原路徑覆蓋至 course-116-2。Firestore Rules 不需因本版變更。

## 使用條件
學生需在同一瀏覽器工作階段登入既有 Firebase 學習帳號（可從 Python 頁「學習帳號」登入）。其他單元會沿用該穩定登入狀態。若只有匿名登入，無法寫入 students/{UID} 的全站雲端進度。

## 舊資料遷移
學生在原本有 localStorage 進度的瀏覽器登入穩定帳號後，STORE 會下載雲端 courseProgress，與本機各模組逐關合併，再上傳。星數取較高值，不會以 0 覆蓋既有星數。若學生更換電腦，請先在原電腦登入同步，或匯入先前 JSON 備份。
