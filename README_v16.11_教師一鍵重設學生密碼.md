# v16.11｜教師一鍵重設學生密碼

- 教師端加入真正的「🔑 一鍵重設學生密碼」。
- 免費後端使用 Cloudflare Worker，不使用 Firebase Cloud Functions。
- 後端再次驗證 Firebase 教師登入、教師角色與授權班級。
- 後端用 Firebase Authentication 管理 API 依 UID 設定一次性臨時密碼。
- 學生登入後必須設定自己的新密碼。
- Service Account 私鑰只能放在 Worker Secret，不能放 GitHub。
- 原 26 關、進階挑戰、星星、成功答案回顧都保留。
