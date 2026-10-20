# v16.1 免 Functions 穩定版

適用於目前無法使用 CMD / PowerShell 部署 Firebase Functions 的環境。

保留：
- 學生 Firebase/Firestore 進度同步
- 穩定學習帳號（班級＋座號＋密碼）
- 教師端「🔎 異常檢查」
- 期中考 midtermStudents 規則

取消：
- Firebase Functions 依賴
- 「雲端驗證成功才過關」
- 教師端自動舊帳號救援

舊版無密碼學生：
- 教師端異常檢查仍可找資料異常
- 如需真正合併匿名 UID 與固定帳號，仍需後端管理權限或人工處理

重要限制：
學生本人仍有權更新自己的 students 文件，因此此版本可以偵測簡單的星星/關卡不一致，但無法從安全層完全阻止刻意竄改所有欄位。
