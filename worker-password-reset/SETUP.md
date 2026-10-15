# v16.11 免費後端設定｜教師一鍵重設學生密碼

## 完成後的流程
教師端按「🔑 一鍵重設學生密碼」→ 後端確認教師身分與班級權限 → 產生一次性臨時密碼 → 學生用臨時密碼登入 → 學生立刻設定自己的新密碼。

## 安全原則
- Service Account 私鑰絕對不要上傳 GitHub。
- `SERVICE_ACCOUNT_PRIVATE_KEY` 只能放在 Cloudflare Worker 的 Secret。
- 老師只能重設自己授權班級的學生。
- 臨時密碼不寫進 Firestore。
- 學生最後設定的新密碼不會顯示給老師。

## Cloudflare Dashboard 設定
1. 建立 Worker：`course116-password-reset`。
2. 將 `src/index.js` 貼入 Worker 後部署。
3. Worker 的 Variables 設定：
   - `FIREBASE_PROJECT_ID` = `course115-python`
   - `FIREBASE_WEB_API_KEY` = Firebase Web API Key
   - `SERVICE_ACCOUNT_EMAIL` = Service Account JSON 的 `client_email`
   - `ALLOWED_ORIGIN` = `https://teacheryimei.github.io`
4. 建立 Secret：
   - 名稱：`SERVICE_ACCOUNT_PRIVATE_KEY`
   - 值：Service Account JSON 裡完整的 `private_key`
5. Service Account 需要 `firebaseauth.users.update` 權限；可使用 Firebase Authentication Admin (`roles/firebaseauth.admin`)。
6. 部署後取得 Worker URL，例如：
   `https://course116-password-reset.<帳號>.workers.dev`
7. 回 GitHub 專案修改：
   `shared/password-reset-config.js`
   將：
   `window.COURSE116_PASSWORD_RESET_URL = "";`
   改成你的 Worker URL。
8. 等 GitHub Pages 更新後重新整理 `teacher.html`。

## 測試
1. 先選一個測試學生。
2. 教師端 → 維護 → 🔑 帳號／密碼。
3. 按「一鍵重設學生密碼」。
4. 記下臨時密碼。
5. 用學生帳號＋臨時密碼登入 Python 頁。
6. 應立即看到「請先設定自己的新密碼」。
7. 設定完成後，再用新密碼重新登入確認。

## 常見錯誤
- `ORIGIN_NOT_ALLOWED`：`ALLOWED_ORIGIN` 不正確。
- `INVALID_TEACHER_TOKEN`：教師登入失效。
- `FIRESTORE_PERMISSION_DENIED`：教師沒有該班權限，或 Firebase Rules 未更新。
- `CLASS_NOT_AUTHORIZED`：學生班級不在教師 `classes`。
- `SERVICE_ACCOUNT_TOKEN_FAILED`：Service Account Email 或 Private Key 設定錯誤。
- `PERMISSION_DENIED` / `firebaseauth.users.update`：Service Account IAM 權限不足。
- `USER_NOT_FOUND`：Firestore 的學生 UID 與 Authentication UID 對不上。
