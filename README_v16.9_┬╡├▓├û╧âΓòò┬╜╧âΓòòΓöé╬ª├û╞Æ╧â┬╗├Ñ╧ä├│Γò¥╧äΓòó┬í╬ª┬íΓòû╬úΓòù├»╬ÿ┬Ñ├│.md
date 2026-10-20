# v16.9 教師帳號／密碼維護介面

## 新增
教師端「🛠 維護」裡新增：
- 🔑 帳號／密碼
- 顯示學生 Firestore document ID / Firebase UID
- 顯示依目前班級＋座號推算的學習帳號
- 一鍵複製 UID
- 一鍵複製學習帳號
- 顯示密碼維護區

## 為什麼重設密碼按鈕目前停用
本專案目前採免 Firebase Functions 架構。
Firebase Authentication 的「替其他使用者改密碼」需要可信任的 Firebase Admin SDK 後端。
不能把管理員權限放在 GitHub Pages 前端。

因此 v16.9 先完成教師介面與帳號識別，密碼重設按鈕保留但停用。
未修改 Firestore Rules。
