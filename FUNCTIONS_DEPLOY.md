# v15 Firebase Functions 部署

v15 的「刪除全部資料與帳號」必須由 Firebase Cloud Functions 執行，
因為瀏覽器前端不能安全地刪除其他人的 Firebase Authentication 帳號。

## 會刪除
- Firestore：`students/{studentUid}`
- Firebase Authentication：同一個 `studentUid` 的登入帳號

## 不會遠端刪除
- 學生裝置瀏覽器裡的 localStorage / 快取
- 與另一個 UID 綁定的舊匿名重複紀錄

## 第一次部署
需在電腦安裝 Node.js 與 Firebase CLI，然後在專案根目錄執行：

```bash
npm install -g firebase-tools
firebase login
firebase use course115-python
cd functions
npm install
cd ..
firebase deploy --only functions
```

部署區域：`asia-east1`

GitHub Pages 只會部署前端網站；單純把 functions 資料夾上傳 GitHub，
不會自動啟用 Cloud Function。
